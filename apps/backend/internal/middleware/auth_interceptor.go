package middleware

import (
	"context"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/constant"
	auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// Context key types to avoid collisions
type contextKey string

const (
	userIDKey    contextKey = "user_id"
	userEmailKey contextKey = "user_email"
	userRoleKey  contextKey = "user_role"
)

// Public endpoints that don't require authentication
var ignoreAuthEndpoints = []string{
	"/v1.UserService/Login",
	"/v1.UserService/Register",
	"/grpc.health.v1.Health/Check",
}

// Role-based access control (RBAC) configuration
var rbacDecider = map[string][]string{
	// User Management APIs
	"/v1.UserService/GetUser":        {constant.RoleAdmin, constant.RoleTeacher, constant.RoleStudent},
	"/v1.UserService/ListUsers":      {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.UserService/GetStudentList": {constant.RoleAdmin, constant.RoleTeacher},

	// Question Management APIs
	"/v1.QuestionService/CreateQuestion": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.QuestionService/UpdateQuestion": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.QuestionService/DeleteQuestion": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.QuestionService/GetQuestion":    {constant.RoleAdmin, constant.RoleTeacher, constant.RoleStudent},
	"/v1.QuestionService/ListQuestions":  {constant.RoleAdmin, constant.RoleTeacher, constant.RoleStudent},

	// Exam Management APIs
	"/v1.ExamService/CreateExam": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.ExamService/UpdateExam": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.ExamService/DeleteExam": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.ExamService/GetExam":    {constant.RoleAdmin, constant.RoleTeacher, constant.RoleStudent},
	"/v1.ExamService/ListExams":  {constant.RoleAdmin, constant.RoleTeacher, constant.RoleStudent},

	// Exam Attempt APIs (Students can take exams)
	"/v1.ExamService/StartExam":  {constant.RoleStudent},
	"/v1.ExamService/SubmitExam": {constant.RoleStudent},
	"/v1.ExamService/GetResults": {constant.RoleAdmin, constant.RoleTeacher, constant.RoleStudent},
}

type AuthInterceptor struct {
	authService     *auth_mgmt.AuthMgmt
	publicMethods   map[string]bool
	roleBasedAccess map[string][]string
}

func NewAuthInterceptor(authService *auth_mgmt.AuthMgmt) *AuthInterceptor {
	// Convert slice to map for faster lookup
	publicMethods := make(map[string]bool)
	for _, endpoint := range ignoreAuthEndpoints {
		publicMethods[endpoint] = true
	}

	return &AuthInterceptor{
		authService:     authService,
		publicMethods:   publicMethods,
		roleBasedAccess: rbacDecider,
	}
}

func (interceptor *AuthInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Check if method is public (no authentication required)
		if interceptor.publicMethods[info.FullMethod] {
			return handler(ctx, req)
		}

		// Extract token from metadata
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Errorf(codes.Unauthenticated, "metadata is not provided")
		}

		values := md["authorization"]
		if len(values) == 0 {
			return nil, status.Errorf(codes.Unauthenticated, "authorization token is not provided")
		}

		accessToken := values[0]
		if !strings.HasPrefix(accessToken, "Bearer ") {
			return nil, status.Errorf(codes.Unauthenticated, "invalid authorization token format")
		}

		// Remove "Bearer " prefix
		token := strings.TrimPrefix(accessToken, "Bearer ")

		// Validate token
		claims, err := interceptor.authService.ValidateToken(token)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "invalid token: %v", err)
		}

		// Check role-based authorization
		allowedRoles, hasRoleRestriction := interceptor.roleBasedAccess[info.FullMethod]
		if hasRoleRestriction {
			userRole := claims.Role
			hasPermission := false

			for _, allowedRole := range allowedRoles {
				if userRole == allowedRole {
					hasPermission = true
					break
				}
			}

			if !hasPermission {
				return nil, status.Errorf(codes.PermissionDenied,
					"insufficient permissions: user role '%s' is not allowed to access '%s'",
					userRole, info.FullMethod)
			}
		}

		// Add user info to context
		ctx = context.WithValue(ctx, userIDKey, claims.UserID)
		ctx = context.WithValue(ctx, userEmailKey, claims.Email)
		ctx = context.WithValue(ctx, userRoleKey, claims.Role)

		return handler(ctx, req)
	}
}

// GetUserIDFromContext extracts user ID from context
func GetUserIDFromContext(ctx context.Context) (string, error) {
	userID, ok := ctx.Value(userIDKey).(string)
	if !ok {
		return "", status.Errorf(codes.Internal, "user ID not found in context")
	}
	return userID, nil
}

// GetUserEmailFromContext extracts user email from context
func GetUserEmailFromContext(ctx context.Context) (string, error) {
	email, ok := ctx.Value(userEmailKey).(string)
	if !ok {
		return "", status.Errorf(codes.Internal, "user email not found in context")
	}
	return email, nil
}

// GetUserRoleFromContext extracts user role from context
func GetUserRoleFromContext(ctx context.Context) (string, error) {
	role, ok := ctx.Value(userRoleKey).(string)
	if !ok {
		return "", status.Errorf(codes.Internal, "user role not found in context")
	}
	return role, nil
}
