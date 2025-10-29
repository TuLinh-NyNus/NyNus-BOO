package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/repository"
	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// AuditLogInterceptor logs important operations
type AuditLogInterceptor struct {
	auditRepo repository.AuditLogRepository
	// Operations that should be logged
	auditableOperations map[string]AuditConfig
}

// AuditConfig defines what and how to audit for an operation
type AuditConfig struct {
	Action       string
	Resource     string
	LogRequest   bool // Whether to log request data
	LogResponse  bool // Whether to log response data
	LogOnFailure bool // Whether to log failed operations
}

// NewAuditLogInterceptor creates a new audit log interceptor
func NewAuditLogInterceptor(auditRepo repository.AuditLogRepository) *AuditLogInterceptor {
	return &AuditLogInterceptor{
		auditRepo:           auditRepo,
		auditableOperations: initializeAuditConfig(),
	}
}

// Initialize audit configuration for operations
func initializeAuditConfig() map[string]AuditConfig {
	return map[string]AuditConfig{
		// User authentication operations
		"/v1.UserService/Login": {
			Action:       "USER_LOGIN",
			Resource:     "AUTH",
			LogRequest:   false, // Don't log passwords
			LogResponse:  false,
			LogOnFailure: true, // Log failed login attempts
		},
		"/v1.UserService/GoogleLogin": {
			Action:       "GOOGLE_LOGIN",
			Resource:     "AUTH",
			LogRequest:   false,
			LogResponse:  false,
			LogOnFailure: true,
		},
		"/v1.UserService/Register": {
			Action:       "USER_REGISTER",
			Resource:     "USER",
			LogRequest:   false, // Don't log passwords
			LogResponse:  true,
			LogOnFailure: true,
		},

		// Admin operations - log everything
		"/v1.AdminService/UpdateUserRole": {
			Action:       "UPDATE_USER_ROLE",
			Resource:     "USER",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.AdminService/UpdateUserLevel": {
			Action:       "UPDATE_USER_LEVEL",
			Resource:     "USER",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.AdminService/UpdateUserStatus": {
			Action:       "UPDATE_USER_STATUS",
			Resource:     "USER",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},

		// Question management
		"/v1.QuestionService/CreateQuestion": {
			Action:       "CREATE_QUESTION",
			Resource:     "QUESTION",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.QuestionService/UpdateQuestion": {
			Action:       "UPDATE_QUESTION",
			Resource:     "QUESTION",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.QuestionService/DeleteQuestion": {
			Action:       "DELETE_QUESTION",
			Resource:     "QUESTION",
			LogRequest:   true,
			LogResponse:  false,
			LogOnFailure: true,
		},

		// Exam management
		"/v1.ExamService/CreateExam": {
			Action:       "CREATE_EXAM",
			Resource:     "EXAM",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.ExamService/UpdateExam": {
			Action:       "UPDATE_EXAM",
			Resource:     "EXAM",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.ExamService/DeleteExam": {
			Action:       "DELETE_EXAM",
			Resource:     "EXAM",
			LogRequest:   true,
			LogResponse:  false,
			LogOnFailure: true,
		},
		"/v1.ExamService/SubmitExam": {
			Action:       "SUBMIT_EXAM",
			Resource:     "EXAM_ATTEMPT",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},

		// Security sensitive operations
		"/v1.UserService/ResetPassword": {
			Action:       "RESET_PASSWORD",
			Resource:     "AUTH",
			LogRequest:   false, // Don't log passwords
			LogResponse:  false,
			LogOnFailure: true,
		},
		"/v1.ProfileService/TerminateSession": {
			Action:       "TERMINATE_SESSION",
			Resource:     "SESSION",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
		"/v1.ProfileService/TerminateAllSessions": {
			Action:       "TERMINATE_ALL_SESSIONS",
			Resource:     "SESSION",
			LogRequest:   true,
			LogResponse:  true,
			LogOnFailure: true,
		},
	}
}

// Unary returns a unary server interceptor for audit logging
func (a *AuditLogInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Check if this operation should be audited
		auditConfig, shouldAudit := a.auditableOperations[info.FullMethod]
		if !shouldAudit {
			// Not an auditable operation, proceed normally
			return handler(ctx, req)
		}

		// Extract metadata for logging
		md, _ := metadata.FromIncomingContext(ctx)
		clientIP := extractClientIP(md)
		userAgent := extractUserAgent(md)

		// Get user info from context (if available)
		userID, _ := GetUserIDFromContext(ctx)
		sessionID, _ := ctx.Value("session_id").(string)

		// Prepare request data for logging (if configured)
		var requestData map[string]interface{}
		if auditConfig.LogRequest {
			requestBytes, _ := json.Marshal(req)
			json.Unmarshal(requestBytes, &requestData)
			// Remove sensitive fields
			sanitizeRequestData(requestData, info.FullMethod)
		}

		// Execute the actual RPC handler
		startTime := time.Now()
		resp, err := handler(ctx, req)
		duration := time.Since(startTime)

		// Determine success
		success := err == nil
		var errorMessage string
		if err != nil {
			if st, ok := status.FromError(err); ok {
				errorMessage = st.Message()
			} else {
				errorMessage = err.Error()
			}
		}

		// Only log if configured (success or failure based on config)
		if success || auditConfig.LogOnFailure {
			// Prepare response data for logging (if configured and successful)
			var responseData map[string]interface{}
			if success && auditConfig.LogResponse {
				responseBytes, _ := json.Marshal(resp)
				json.Unmarshal(responseBytes, &responseData)
				// Remove sensitive fields
				sanitizeResponseData(responseData, info.FullMethod)
			}

			// Create audit log entry
			metadata := map[string]interface{}{
				"method":   info.FullMethod,
				"duration": duration.Milliseconds(),
			}

			// Only add request/response data if they exist
			if requestData != nil {
				metadata["request"] = requestData
			}
			if responseData != nil {
				metadata["response"] = responseData
			}

			// Safely marshal metadata
			metadataBytes, err := json.Marshal(metadata)
			if err != nil {
				// Fallback to minimal metadata if marshaling fails
				metadataBytes = []byte(`{"method":"` + info.FullMethod + `","error":"metadata_marshal_failed"}`)
			}

			// Ensure UserID is not empty string
			var userIDPtr *string
			if userID != "" {
				userIDPtr = &userID
			}

			auditLog := &repository.AuditLog{
				ID:           uuid.New().String(),
				UserID:       userIDPtr,
				Action:       auditConfig.Action,
				Resource:     auditConfig.Resource,
				ResourceID:   extractResourceID(req, info.FullMethod),
				OldValues:    json.RawMessage(`{}`), // Initialize with empty JSON
				NewValues:    json.RawMessage(`{}`), // Initialize with empty JSON
				IPAddress:    clientIP,
				UserAgent:    userAgent,
				SessionID:    sessionID,
				Success:      success,
				ErrorMessage: errorMessage,
				Metadata:     metadataBytes,
				CreatedAt:    time.Now(),
			}

			// Log asynchronously to avoid blocking the request
			go func() {
				if err := a.auditRepo.Create(context.Background(), auditLog); err != nil {
					// Log error but don't fail the request
					fmt.Printf("Failed to create audit log: %v\n", err)
				}
			}()
		}

		return resp, err
	}
}

// Extract resource ID from request based on method
func extractResourceID(req interface{}, method string) string {
	// This would need to be implemented based on your specific request types
	// For now, return empty string
	reqMap := make(map[string]interface{})
	reqBytes, _ := json.Marshal(req)
	json.Unmarshal(reqBytes, &reqMap)

	// Common field names for resource IDs
	idFields := []string{"id", "user_id", "question_id", "exam_id", "session_id"}
	for _, field := range idFields {
		if val, ok := reqMap[field]; ok {
			if strVal, ok := val.(string); ok {
				return strVal
			}
		}
	}

	return ""
}

// Remove sensitive data from request logs
func sanitizeRequestData(data map[string]interface{}, method string) {
	// Remove password fields
	delete(data, "password")
	delete(data, "new_password")
	delete(data, "old_password")
	delete(data, "confirm_password")

	// Remove tokens
	delete(data, "access_token")
	delete(data, "refresh_token")
	delete(data, "id_token")
	delete(data, "session_token")

	// Method-specific sanitization
	switch method {
	case "/v1.UserService/Login", "/v1.UserService/Register":
		// Already handled above
	case "/v1.UserService/GoogleLogin":
		delete(data, "id_token")
	}
}

// Remove sensitive data from response logs
func sanitizeResponseData(data map[string]interface{}, method string) {
	// Remove tokens from responses
	delete(data, "access_token")
	delete(data, "refresh_token")
	delete(data, "session_token")

	// Method-specific sanitization
	switch method {
	case "/v1.UserService/Login", "/v1.UserService/GoogleLogin":
		// Token already removed
	}
}
