package middleware

import (
	"context"
	"fmt"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/system/security"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// SecurityInterceptor provides security validation for exam-related gRPC calls
type SecurityInterceptor struct {
	examSessionSecurity *security.ExamSessionSecurity
	antiCheatService    *security.AntiCheatService
	rateLimitService    *security.ExamRateLimitService
	logger              *logrus.Logger
}

// NewSecurityInterceptor creates a new security interceptor
func NewSecurityInterceptor(
	examSessionSecurity *security.ExamSessionSecurity,
	antiCheatService *security.AntiCheatService,
	rateLimitService *security.ExamRateLimitService,
	logger *logrus.Logger,
) *SecurityInterceptor {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &SecurityInterceptor{
		examSessionSecurity: examSessionSecurity,
		antiCheatService:    antiCheatService,
		rateLimitService:    rateLimitService,
		logger:              logger,
	}
}

// Unary returns a unary server interceptor for security validation
func (s *SecurityInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Skip security validation for non-exam endpoints
		if !s.isExamEndpoint(info.FullMethod) {
			return handler(ctx, req)
		}

		// Extract metadata
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Errorf(codes.InvalidArgument, "missing metadata")
		}

		// Get user ID from context (set by auth interceptor)
		userID, err := GetUserIDFromContext(ctx)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
		}

		// Check rate limiting for exam actions
		if err := s.checkRateLimit(ctx, userID, info.FullMethod, md); err != nil {
			return nil, err
		}

		// Validate exam session for exam-taking endpoints
		if s.isExamTakingEndpoint(info.FullMethod) {
			if err := s.validateExamSession(ctx, userID, md); err != nil {
				return nil, err
			}
		}

		// Record activity for monitoring
		s.recordActivity(ctx, userID, info.FullMethod, md)

		return handler(ctx, req)
	}
}

// isExamEndpoint checks if the endpoint is exam-related
func (s *SecurityInterceptor) isExamEndpoint(method string) bool {
	examMethods := []string{
		"/exam.ExamService/StartExam",
		"/exam.ExamService/SubmitAnswer",
		"/exam.ExamService/SubmitExam",
		"/exam.ExamService/GetExamAttempt",
		"/exam.ExamService/GetExamQuestions",
	}

	for _, examMethod := range examMethods {
		if strings.Contains(method, examMethod) {
			return true
		}
	}

	return false
}

// isExamTakingEndpoint checks if the endpoint requires active exam session
func (s *SecurityInterceptor) isExamTakingEndpoint(method string) bool {
	examTakingMethods := []string{
		"/exam.ExamService/SubmitAnswer",
		"/exam.ExamService/SubmitExam",
		"/exam.ExamService/GetExamAttempt",
	}

	for _, examTakingMethod := range examTakingMethods {
		if strings.Contains(method, examTakingMethod) {
			return true
		}
	}

	return false
}

// checkRateLimit validates rate limiting for exam actions
func (s *SecurityInterceptor) checkRateLimit(ctx context.Context, userID, method string, md metadata.MD) error {
	// Extract exam ID from metadata or request
	examIDs := md["exam-id"]
	if len(examIDs) == 0 {
		// For some endpoints, exam ID might not be required
		return nil
	}

	examID := examIDs[0]

	// Determine action type based on method
	var actionType security.ActionType
	switch {
	case strings.Contains(method, "StartExam"):
		actionType = security.ActionExamStart
	case strings.Contains(method, "SubmitAnswer"):
		actionType = security.ActionAnswerSubmit
	case strings.Contains(method, "SubmitExam"):
		actionType = security.ActionExamSubmit
	case strings.Contains(method, "GetExamQuestions"):
		actionType = security.ActionQuestionView
	default:
		actionType = security.ActionNavigation
	}

	// Check rate limit
	result, err := s.rateLimitService.CheckRateLimit(ctx, userID, examID, actionType)
	if err != nil {
		s.logger.WithError(err).Error("Failed to check rate limit")
		return status.Errorf(codes.Internal, "rate limit check failed")
	}

	if !result.Allowed {
		s.logger.WithFields(logrus.Fields{
			"user_id":    userID,
			"exam_id":    examID,
			"action":     actionType,
			"is_blocked": result.IsBlocked,
			"reason":     result.Reason,
		}).Warn("Rate limit exceeded")

		if result.IsBlocked {
			return status.Errorf(codes.ResourceExhausted,
				"rate limit exceeded - blocked until %s", result.BlockedUntil.Format("15:04:05"))
		}

		return status.Errorf(codes.ResourceExhausted, "rate limit exceeded: %s", result.Reason)
	}

	return nil
}

// validateExamSession validates the exam session for exam-taking endpoints
func (s *SecurityInterceptor) validateExamSession(ctx context.Context, userID string, md metadata.MD) error {
	// Extract session ID and security token from metadata
	sessionIDs := md["exam-session-id"]
	securityTokens := md["exam-security-token"]

	if len(sessionIDs) == 0 || len(securityTokens) == 0 {
		return status.Errorf(codes.InvalidArgument, "missing exam session credentials")
	}

	sessionID := sessionIDs[0]
	securityToken := securityTokens[0]

	// Validate session
	session, err := s.examSessionSecurity.ValidateSession(ctx, sessionID, securityToken)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"user_id":    userID,
			"session_id": sessionID,
			"error":      err.Error(),
		}).Warn("Exam session validation failed")

		return status.Errorf(codes.PermissionDenied, "invalid exam session: %s", err.Error())
	}

	// Verify session belongs to the authenticated user
	if session.UserID != userID {
		s.logger.WithFields(logrus.Fields{
			"authenticated_user": userID,
			"session_user":       session.UserID,
			"session_id":         sessionID,
		}).Warn("Exam session user mismatch")

		return status.Errorf(codes.PermissionDenied, "exam session does not belong to authenticated user")
	}

	// Add session info to context for downstream handlers
	ctx = context.WithValue(ctx, "exam_session", session)

	return nil
}

// recordActivity records user activity for monitoring
func (s *SecurityInterceptor) recordActivity(ctx context.Context, userID, method string, md metadata.MD) {
	// Extract session ID if available
	sessionIDs := md["exam-session-id"]
	if len(sessionIDs) == 0 {
		return // No session to record activity for
	}

	sessionID := sessionIDs[0]

	// Determine activity type
	var activityType string
	switch {
	case strings.Contains(method, "StartExam"):
		activityType = "exam_start"
	case strings.Contains(method, "SubmitAnswer"):
		activityType = "answer_submit"
	case strings.Contains(method, "SubmitExam"):
		activityType = "exam_submit"
	case strings.Contains(method, "GetExamQuestions"):
		activityType = "question_view"
	case strings.Contains(method, "GetExamAttempt"):
		activityType = "attempt_view"
	default:
		activityType = "navigation"
	}

	// Prepare activity data
	activityData := map[string]interface{}{
		"method":    method,
		"timestamp": ctx.Value("request_start_time"),
		"user_id":   userID,
	}

	// Extract additional data from metadata
	if examIDs := md["exam-id"]; len(examIDs) > 0 {
		activityData["exam_id"] = examIDs[0]
	}

	if questionIDs := md["question-id"]; len(questionIDs) > 0 {
		activityData["question_id"] = questionIDs[0]
	}

	// Record activity asynchronously
	go func() {
		if err := s.antiCheatService.RecordActivity(context.Background(), sessionID, activityType, activityData); err != nil {
			s.logger.WithError(err).Error("Failed to record activity")
		}
	}()
}

// Stream returns a stream server interceptor for security validation
func (s *SecurityInterceptor) Stream() grpc.StreamServerInterceptor {
	return func(
		srv interface{},
		ss grpc.ServerStream,
		info *grpc.StreamServerInfo,
		handler grpc.StreamHandler,
	) error {
		// For streaming endpoints, we can implement similar security checks
		// For now, just pass through
		return handler(srv, ss)
	}
}

// SecurityEventHandler handles security events from the frontend
type SecurityEventHandler struct {
	examSessionSecurity *security.ExamSessionSecurity
	antiCheatService    *security.AntiCheatService
	logger              *logrus.Logger
}

// NewSecurityEventHandler creates a new security event handler
func NewSecurityEventHandler(
	examSessionSecurity *security.ExamSessionSecurity,
	antiCheatService *security.AntiCheatService,
	logger *logrus.Logger,
) *SecurityEventHandler {
	return &SecurityEventHandler{
		examSessionSecurity: examSessionSecurity,
		antiCheatService:    antiCheatService,
		logger:              logger,
	}
}

// HandleSecurityEvent processes security events from the frontend
func (h *SecurityEventHandler) HandleSecurityEvent(ctx context.Context, sessionID string, eventType, severity, description string, metadata map[string]interface{}) error {
	// Convert string types to security types
	var securityEventType security.SecurityEventType
	var securitySeverity security.SecuritySeverity

	switch eventType {
	case "tab_switch":
		securityEventType = security.EventTabSwitch
	case "window_blur":
		securityEventType = security.EventWindowBlur
	case "copy_paste":
		securityEventType = security.EventCopyPaste
	case "right_click":
		securityEventType = security.EventRightClick
	case "devtools_open":
		securityEventType = security.EventDevToolsOpen
	case "fullscreen_exit":
		securityEventType = security.EventFullScreenExit
	case "suspicious_time":
		securityEventType = security.EventSuspiciousTime
	default:
		securityEventType = security.EventTabSwitch // Default
	}

	switch severity {
	case "low":
		securitySeverity = security.SeverityLow
	case "medium":
		securitySeverity = security.SeverityMedium
	case "high":
		securitySeverity = security.SeverityHigh
	case "critical":
		securitySeverity = security.SeverityCritical
	default:
		securitySeverity = security.SeverityMedium // Default
	}

	// Record the security event
	err := h.examSessionSecurity.RecordSecurityEvent(ctx, sessionID, securityEventType, securitySeverity, description, metadata)
	if err != nil {
		h.logger.WithError(err).Error("Failed to record security event")
		return fmt.Errorf("failed to record security event: %w", err)
	}

	// Also record as activity for comprehensive tracking
	activityData := map[string]interface{}{
		"event_type":  eventType,
		"severity":    severity,
		"description": description,
		"metadata":    metadata,
	}

	err = h.antiCheatService.RecordActivity(ctx, sessionID, eventType, activityData)
	if err != nil {
		h.logger.WithError(err).Error("Failed to record security activity")
		// Don't return error here as the main event was recorded
	}

	h.logger.WithFields(logrus.Fields{
		"session_id":  sessionID,
		"event_type":  eventType,
		"severity":    severity,
		"description": description,
	}).Info("Security event processed")

	return nil
}
