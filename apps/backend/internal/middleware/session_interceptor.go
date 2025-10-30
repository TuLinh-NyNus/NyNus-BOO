package middleware

import (
	"context"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/user/session"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// SessionInterceptor validates sessions - SIMPLIFIED
type SessionInterceptor struct {
	sessionService *session.SessionService
	sessionRepo    repository.SessionRepository
}

// NewSessionInterceptor creates a new session interceptor - SIMPLIFIED
func NewSessionInterceptor(sessionService *session.SessionService, sessionRepo repository.SessionRepository) *SessionInterceptor {
	return &SessionInterceptor{
		sessionService: sessionService,
		sessionRepo:    sessionRepo,
		// SIMPLIFIED: Remove maxSessions limit enforcement
	}
}

// Unary returns a unary server interceptor for session validation
func (s *SessionInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Skip session validation for public endpoints
		if isPublicEndpoint(info.FullMethod) {
			return handler(ctx, req)
		}

		// Extract session token from metadata
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return handler(ctx, req) // Let auth interceptor handle missing metadata
		}

		// Check for session token in headers
		sessionTokens := md["x-session-token"]
		if len(sessionTokens) == 0 {
			// No session token, let auth interceptor handle JWT auth
			return handler(ctx, req)
		}

		sessionToken := sessionTokens[0]

		// Get user ID from context (set by auth interceptor)
		userID, err := GetUserIDFromContext(ctx)
		if err != nil {
			// No user ID means auth interceptor hasn't run yet
			return handler(ctx, req)
		}

		// Validate session
		session, err := s.sessionRepo.GetByToken(ctx, sessionToken)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "invalid session")
		}

		// Check if session belongs to the authenticated user
		if session.UserID != userID {
			return nil, status.Errorf(codes.PermissionDenied, "session does not belong to user")
		}

		// Check if session is active
		if !session.IsActive {
			return nil, status.Errorf(codes.Unauthenticated, "session is inactive")
		}

		// Check if session has expired
		if session.ExpiresAt.Before(time.Now()) {
			// Mark session as inactive
			session.IsActive = false
			// Terminate the expired session
			if err := s.sessionRepo.TerminateSession(ctx, session.ID); err != nil {
				// Log error but don't fail the request
				fmt.Printf("Failed to terminate expired session: %v\n", err)
			}
			return nil, status.Errorf(codes.Unauthenticated, "session has expired")
		}

		// SIMPLIFIED: Remove complex last activity tracking
		// Basic session validation is sufficient

		// Extract client info for logging
		clientIP := extractClientIP(md)
		userAgent := extractUserAgent(md)

		// Add session info to context
		ctx = context.WithValue(ctx, "session_id", session.ID)
		ctx = context.WithValue(ctx, "session_token", sessionToken)
		ctx = context.WithValue(ctx, "client_ip", clientIP)
		ctx = context.WithValue(ctx, "user_agent", userAgent)

		return handler(ctx, req)
	}
}

// Helper function to check if endpoint is public
func isPublicEndpoint(method string) bool {
	publicEndpoints := []string{
		"/v1.UserService/Login",
		"/v1.UserService/Register",
		"/v1.UserService/GoogleLogin",
		"/v1.UserService/RefreshToken",
		"/v1.UserService/ForgotPassword",
		"/grpc.health.v1.Health/Check",
	}

	for _, endpoint := range publicEndpoints {
		if method == endpoint {
			return true
		}
	}
	return false
}

// Extract client IP from metadata
func extractClientIP(md metadata.MD) string {
	// Try different headers
	headers := []string{"x-forwarded-for", "x-real-ip", "x-client-ip"}
	for _, header := range headers {
		if values := md[header]; len(values) > 0 {
			// Handle comma-separated IPs (for x-forwarded-for)
			ip := strings.Split(values[0], ",")[0]
			return strings.TrimSpace(ip)
		}
	}
	return ""
}

// Extract user agent from metadata
func extractUserAgent(md metadata.MD) string {
	if values := md["user-agent"]; len(values) > 0 {
		return values[0]
	}
	return ""
}
