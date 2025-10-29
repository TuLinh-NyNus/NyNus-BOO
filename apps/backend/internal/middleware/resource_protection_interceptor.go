package middleware

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	system "exam-bank-system/apps/backend/internal/service/system"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/peer"
	"google.golang.org/grpc/status"
)

// ResourceProtectionInterceptor protects resources with automatic risk assessment
type ResourceProtectionInterceptor struct {
	protectionService *system.ResourceProtectionService
}

// NewResourceProtectionInterceptor creates a new resource protection interceptor
func NewResourceProtectionInterceptor(protectionService *system.ResourceProtectionService) *ResourceProtectionInterceptor {
	return &ResourceProtectionInterceptor{
		protectionService: protectionService,
	}
}

// UnaryInterceptor is the unary server interceptor for resource protection
func (i *ResourceProtectionInterceptor) UnaryInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	// Check if this is a resource access method that needs protection
	if needsProtection, attempt := i.extractResourceAccess(ctx, req, info.FullMethod); needsProtection {
		// Track and validate the access
		start := time.Now()

		// Execute the handler to get the result and potential error
		resp, err := handler(ctx, req)

		// Calculate duration
		duration := int(time.Since(start).Milliseconds())
		attempt.Duration = duration

		// Determine if access was successful
		success := err == nil

		// Track the access attempt
		if trackErr := i.protectionService.ValidateAndTrackAccess(ctx, attempt); trackErr != nil {
			// If validation fails due to blocking, return that error instead
			if strings.Contains(trackErr.Error(), "access blocked") {
				return nil, status.Errorf(codes.PermissionDenied, trackErr.Error())
			}
			// Otherwise, log the tracking error but continue
			fmt.Printf("Failed to track resource access: %v\n", trackErr)
		}

		// If the original call succeeded but user was marked as suspicious during tracking,
		// we still return the successful response but log the suspicious activity
		if success && err == nil {
			return resp, nil
		}

		// Log failed access attempts with higher risk
		if !success {
			attempt.Metadata["error"] = err.Error()
			i.logFailedAccess(ctx, attempt)
		}

		return resp, err
	}

	// For non-protected methods, just pass through
	return handler(ctx, req)
}

// StreamInterceptor is the stream server interceptor for resource protection
func (i *ResourceProtectionInterceptor) StreamInterceptor(
	srv interface{},
	ss grpc.ServerStream,
	info *grpc.StreamServerInfo,
	handler grpc.StreamHandler,
) error {
	ctx := ss.Context()

	// For streaming resource access (like video streaming), create a wrapped stream
	if needsProtection, attempt := i.extractResourceAccess(ctx, nil, info.FullMethod); needsProtection {
		start := time.Now()

		// Validate access before starting stream
		if trackErr := i.protectionService.ValidateAndTrackAccess(ctx, attempt); trackErr != nil {
			if strings.Contains(trackErr.Error(), "access blocked") {
				return status.Errorf(codes.PermissionDenied, trackErr.Error())
			}
		}

		// Create wrapped stream for monitoring
		wrappedStream := &resourceProtectedStream{
			ServerStream:      ss,
			protectionService: i.protectionService,
			attempt:           attempt,
			startTime:         start,
		}

		return handler(srv, wrappedStream)
	}

	return handler(srv, ss)
}

// extractResourceAccess extracts resource access information from the request
func (i *ResourceProtectionInterceptor) extractResourceAccess(ctx context.Context, req interface{}, method string) (bool, *system.ResourceAccessAttempt) {
	// Define which methods need protection
	protectedMethods := map[string]string{
		"/v1.ExamService/GetExam":         "EXAM",
		"/v1.QuestionService/GetQuestion": "QUESTION",
	}

	resourceType, isProtected := protectedMethods[method]
	if !isProtected {
		return false, nil
	}

	// Get user ID from context
	userID, err := GetUserIDFromContext(ctx)
	if err != nil {
		// If no user ID, still track but mark as anonymous
		userID = "anonymous"
	}

	// Get client IP
	ipAddress := i.getClientIP(ctx)

	// Get user agent
	userAgent := i.getUserAgent(ctx)

	// Get session token
	sessionToken := i.getSessionToken(ctx)

	// Extract resource ID and action from request
	resourceID, action := i.extractResourceDetails(req, method)

	attempt := &system.ResourceAccessAttempt{
		UserID:       userID,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Action:       action,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		SessionToken: sessionToken,
		Duration:     0, // Will be set after handler execution
		Metadata:     make(map[string]interface{}),
	}

	return true, attempt
}

// extractResourceDetails extracts resource ID and action from the request
func (i *ResourceProtectionInterceptor) extractResourceDetails(req interface{}, method string) (string, string) {
	resourceID := "unknown"
	action := "VIEW"

	// Use reflection or type assertions to extract resource ID
	// This is a simplified version - in practice, you'd use proper request types

	if strings.Contains(method, "Download") {
		action = "DOWNLOAD"
	} else if strings.Contains(method, "Stream") {
		action = "STREAM"
	} else if strings.Contains(method, "Access") || strings.Contains(method, "Get") || strings.Contains(method, "View") {
		action = "VIEW"
	}

	// Extract resource ID from request (would need specific implementation for each request type)
	// For now, return placeholder
	resourceID = fmt.Sprintf("resource_%d", time.Now().Unix())

	return resourceID, action
}

// getClientIP extracts client IP from context
func (i *ResourceProtectionInterceptor) getClientIP(ctx context.Context) string {
	peer, ok := peer.FromContext(ctx)
	if !ok {
		return "unknown"
	}

	// Extract IP from peer address
	addr := peer.Addr.String()
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		return addr[:idx]
	}

	return addr
}

// getUserAgent extracts user agent from metadata
func (i *ResourceProtectionInterceptor) getUserAgent(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "unknown"
	}

	userAgents := md.Get("user-agent")
	if len(userAgents) > 0 {
		return userAgents[0]
	}

	return "unknown"
}

// getSessionToken extracts session token from metadata
func (i *ResourceProtectionInterceptor) getSessionToken(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return ""
	}

	tokens := md.Get("authorization")
	if len(tokens) > 0 {
		// Remove "Bearer " prefix if present
		token := tokens[0]
		if strings.HasPrefix(token, "Bearer ") {
			return token[7:]
		}
		return token
	}

	return ""
}

// logFailedAccess logs a failed access attempt with higher risk score
func (i *ResourceProtectionInterceptor) logFailedAccess(ctx context.Context, attempt *system.ResourceAccessAttempt) {
	// Create a new attempt with failed status
	failedAttempt := *attempt
	failedAttempt.Metadata["failed"] = true
	failedAttempt.Metadata["timestamp"] = time.Now().Unix()

	// This will be logged with high risk score
	i.protectionService.ValidateAndTrackAccess(ctx, &failedAttempt)
}

// resourceProtectedStream wraps grpc.ServerStream for resource protection
type resourceProtectedStream struct {
	grpc.ServerStream
	protectionService *system.ResourceProtectionService
	attempt           *system.ResourceAccessAttempt
	startTime         time.Time
	bytesStreamed     int64
}

// SendMsg wraps the original SendMsg to track streaming data
func (s *resourceProtectedStream) SendMsg(m interface{}) error {
	err := s.ServerStream.SendMsg(m)

	if err == nil {
		// Estimate bytes sent (simplified)
		s.bytesStreamed += 1024 // Placeholder - would calculate actual size

		// Check for suspicious streaming patterns
		duration := time.Since(s.startTime)
		if duration > 0 {
			bytesPerSecond := float64(s.bytesStreamed) / duration.Seconds()

			// Very high download speed might indicate automation
			if bytesPerSecond > 10*1024*1024 { // 10MB/s
				s.attempt.Metadata["high_speed_download"] = true
				s.attempt.Metadata["bytes_per_second"] = bytesPerSecond
			}
		}
	}

	return err
}

// Context returns the context with additional metadata
func (s *resourceProtectedStream) Context() context.Context {
	ctx := s.ServerStream.Context()

	// Add streaming metadata to context
	return context.WithValue(ctx, "streaming_bytes", s.bytesStreamed)
}

// RiskAssessmentUnaryInterceptor provides a simplified interceptor for risk assessment only
func RiskAssessmentUnaryInterceptor(protectionService *system.ResourceProtectionService) grpc.UnaryServerInterceptor {
	interceptor := NewResourceProtectionInterceptor(protectionService)
	return interceptor.UnaryInterceptor
}

// RiskAssessmentStreamInterceptor provides a simplified interceptor for risk assessment only
func RiskAssessmentStreamInterceptor(protectionService *system.ResourceProtectionService) grpc.StreamServerInterceptor {
	interceptor := NewResourceProtectionInterceptor(protectionService)
	return interceptor.StreamInterceptor
}

// Helper function to create rate limiting metadata
func createRateLimitMetadata(userID string, remaining int, resetTime time.Time) metadata.MD {
	md := metadata.New(map[string]string{
		"x-ratelimit-remaining": strconv.Itoa(remaining),
		"x-ratelimit-reset":     strconv.FormatInt(resetTime.Unix(), 10),
		"x-user-risk-level":     "monitored",
	})
	return md
}

// AddRateLimitHeaders adds rate limiting headers to the response
func AddRateLimitHeaders(ctx context.Context, remaining int, resetTime time.Time) {
	md := createRateLimitMetadata("", remaining, resetTime)
	grpc.SetHeader(ctx, md)
}

