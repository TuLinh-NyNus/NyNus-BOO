package middleware

import (
	"context"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/constant"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user/session"

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
	userLevelKey contextKey = "user_level"
)

// Public endpoints that don't require authentication (available to everyone including non-authenticated users)
var ignoreAuthEndpoints = []string{
	"/v1.UserService/Login",
	"/v1.UserService/Register",
	"/v1.UserService/GoogleLogin",
	"/v1.UserService/RefreshToken",
	"/v1.UserService/ForgotPassword",
	"/v1.UserService/VerifyEmail",
	"/v1.ContactService/SubmitContactForm", // Public contact form
	"/v1.NewsletterService/Subscribe",      // Public newsletter subscription
	"/v1.NewsletterService/Unsubscribe",    // Public newsletter unsubscription
	"/grpc.health.v1.Health/Check",
	// GUEST access endpoints - preview các nội dung giới hạn
	"/v1.QuestionService/GetPublicQuestions", // GUEST có thể xem một số câu hỏi demo
	"/v1.ExamService/GetPublicExams",         // GUEST có thể xem exam preview
	"/v1.CourseService/GetPublicCourses",     // GUEST có thể xem course preview
}

// Role-based access control (RBAC) configuration với 5 roles hierarchy
// Hierarchy: GUEST < STUDENT < TUTOR < TEACHER < ADMIN
var rbacDecider = map[string][]string{
	// User Management APIs
	"/v1.UserService/GetUser":        {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.UserService/ListUsers":      {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.UserService/GetStudentList": {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor}, // Tutors cần xem danh sách học sinh

	// Question Management APIs
	"/v1.QuestionService/CreateQuestion":  {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.QuestionService/UpdateQuestion":  {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.QuestionService/DeleteQuestion":  {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.QuestionService/GetQuestion":     {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.QuestionService/ListQuestions":   {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.QuestionService/ImportQuestions": {constant.RoleAdmin, constant.RoleTeacher},

	// Question Filter Service APIs - Tất cả authenticated users có thể search questions
	"/v1.QuestionFilterService/ListQuestionsByFilter":      {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.QuestionFilterService/SearchQuestions":            {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.QuestionFilterService/GetQuestionsByQuestionCode": {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},

	// Exam Management APIs
	"/v1.ExamService/CreateExam": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.ExamService/UpdateExam": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.ExamService/DeleteExam": {constant.RoleAdmin, constant.RoleTeacher},
	"/v1.ExamService/GetExam":    {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.ExamService/ListExams":  {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},

	// Exam Attempt APIs - Students và Tutors có thể làm bài thi
	"/v1.ExamService/StartExam":  {constant.RoleStudent, constant.RoleTutor},
	"/v1.ExamService/SubmitExam": {constant.RoleStudent, constant.RoleTutor},
	"/v1.ExamService/GetResults": {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},

	// Profile & Session Management APIs - Tất cả authenticated users
	"/v1.ProfileService/GetProfile":        {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.ProfileService/UpdateProfile":     {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.ProfileService/GetSessions":       {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.ProfileService/TerminateSession":  {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.ProfileService/GetPreferences":    {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},
	"/v1.ProfileService/UpdatePreferences": {constant.RoleAdmin, constant.RoleTeacher, constant.RoleTutor, constant.RoleStudent},

	// Contact Management APIs (Admin only)
	"/v1.ContactService/ListContacts":        {constant.RoleAdmin},
	"/v1.ContactService/GetContact":          {constant.RoleAdmin},
	"/v1.ContactService/UpdateContactStatus": {constant.RoleAdmin},
	"/v1.ContactService/DeleteContact":       {constant.RoleAdmin},

	// Newsletter Management APIs (Admin only)
	"/v1.NewsletterService/ListSubscriptions":      {constant.RoleAdmin},
	"/v1.NewsletterService/GetSubscription":        {constant.RoleAdmin},
	"/v1.NewsletterService/UpdateSubscriptionTags": {constant.RoleAdmin},
	"/v1.NewsletterService/DeleteSubscription":     {constant.RoleAdmin},

	// Admin Service APIs (Admin only)
	"/v1.AdminService/ListUsers":         {constant.RoleAdmin},
	"/v1.AdminService/UpdateUserRole":    {constant.RoleAdmin},
	"/v1.AdminService/UpdateUserLevel":   {constant.RoleAdmin},
	"/v1.AdminService/UpdateUserStatus":  {constant.RoleAdmin},
	"/v1.AdminService/GetAuditLogs":      {constant.RoleAdmin},
	"/v1.AdminService/GetResourceAccess": {constant.RoleAdmin},

	// GUEST-specific endpoints - Giới hạn content cho authenticated GUEST users
	"/v1.QuestionService/GetQuestionPreview": {constant.RoleGuest, constant.RoleStudent, constant.RoleTutor, constant.RoleTeacher, constant.RoleAdmin},
	"/v1.ExamService/GetExamPreview":         {constant.RoleGuest, constant.RoleStudent, constant.RoleTutor, constant.RoleTeacher, constant.RoleAdmin},
	"/v1.CourseService/GetCoursePreview":     {constant.RoleGuest, constant.RoleStudent, constant.RoleTutor, constant.RoleTeacher, constant.RoleAdmin},

	// Level-based content access (sẽ được kiểm tra thêm trong interceptor logic)
	// Higher level users can access lower level content within same role
}

type AuthInterceptor struct {
	authService     *auth.AuthMgmt
	sessionService  *session.SessionService
	userRepo        repository.IUserRepository
	publicMethods   map[string]bool
	roleBasedAccess map[string][]string
	enableOAuth     bool
	enableSession   bool
}

func NewAuthInterceptor(
	authService *auth.AuthMgmt,
	sessionService *session.SessionService,
	userRepo repository.IUserRepository,
) *AuthInterceptor {
	// Convert slice to map for faster lookup
	publicMethods := make(map[string]bool)
	for _, endpoint := range ignoreAuthEndpoints {
		publicMethods[endpoint] = true
	}

	return &AuthInterceptor{
		authService:     authService,
		sessionService:  sessionService,
		userRepo:        userRepo,
		publicMethods:   publicMethods,
		roleBasedAccess: rbacDecider,
		enableOAuth:     true,
		enableSession:   true,
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
			return nil, status.Errorf(codes.Unauthenticated, ErrMetadataNotProvided)
		}

		values := md[AuthorizationHeader]
		if len(values) == 0 {
			return nil, status.Errorf(codes.Unauthenticated, ErrAuthTokenNotProvided)
		}

		accessToken := values[0]
		if !strings.HasPrefix(accessToken, BearerPrefix) {
			return nil, status.Errorf(codes.Unauthenticated, ErrInvalidAuthTokenFormat)
		}

		// Remove "Bearer " prefix
		token := strings.TrimPrefix(accessToken, BearerPrefix)

		// Validate token
		claims, err := interceptor.authService.AuthService.ValidateToken(token)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, ErrInvalidToken, err)
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
				return nil, status.Errorf(codes.PermissionDenied, ErrInsufficientPermissions, userRole, info.FullMethod)
			}
		}

		// Get user level from database if needed
		var userLevel int
		if interceptor.userRepo != nil {
			if user, err := interceptor.userRepo.GetByID(ctx, claims.UserID); err == nil {
				userLevel = user.Level
			}
		}

		// Add user info to context
		ctx = context.WithValue(ctx, userIDKey, claims.UserID)
		ctx = context.WithValue(ctx, userEmailKey, claims.Email)
		ctx = context.WithValue(ctx, userRoleKey, claims.Role)
		ctx = context.WithValue(ctx, userLevelKey, userLevel)

		return handler(ctx, req)
	}
}

// GetUserIDFromContext extracts user ID from context
// Trích xuất user ID từ context (được inject bởi auth interceptor)
func GetUserIDFromContext(ctx context.Context) (string, error) {
	userID, ok := ctx.Value(userIDKey).(string)
	if !ok {
		return "", status.Errorf(codes.Internal, ErrUserIDNotFoundInContext)
	}
	return userID, nil
}

// GetUserEmailFromContext extracts user email from context
// Trích xuất user email từ context (được inject bởi auth interceptor)
func GetUserEmailFromContext(ctx context.Context) (string, error) {
	email, ok := ctx.Value(userEmailKey).(string)
	if !ok {
		return "", status.Errorf(codes.Internal, ErrUserEmailNotFoundInContext)
	}
	return email, nil
}

// GetUserRoleFromContext extracts user role from context
// Trích xuất user role từ context (được inject bởi auth interceptor)
func GetUserRoleFromContext(ctx context.Context) (string, error) {
	role, ok := ctx.Value(userRoleKey).(string)
	if !ok {
		return "", status.Errorf(codes.Internal, ErrUserRoleNotFoundInContext)
	}
	return role, nil
}

// GetUserLevelFromContext extracts user level from context
// Trích xuất user level từ context (được inject bởi auth interceptor)
func GetUserLevelFromContext(ctx context.Context) (int, error) {
	level, ok := ctx.Value(userLevelKey).(int)
	if !ok {
		return 0, status.Errorf(codes.Internal, ErrUserLevelNotFoundInContext)
	}
	return level, nil
}
