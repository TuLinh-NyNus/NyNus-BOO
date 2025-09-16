package container

import (
	"database/sql"
	"os"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/grpc"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/oauth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/session"
	auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
	question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"
	question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"
	user_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/user"
)

// Container holds all dependencies
type Container struct {
	// Database
	DB *sql.DB

	// Repositories
	UserRepo             *repository.UserRepository  // Legacy repository
	UserRepoWrapper      repository.IUserRepository  // Interface implementation
	AnswerRepo           *repository.AnswerRepository
	SessionRepo          repository.SessionRepository
	OAuthAccountRepo     repository.OAuthAccountRepository
	ResourceAccessRepo   repository.ResourceAccessRepository
	EnrollmentRepo       repository.EnrollmentRepository
	NotificationRepo     repository.NotificationRepository
	UserPreferenceRepo   repository.UserPreferenceRepository
	AuditLogRepo         repository.AuditLogRepository
	QuestionRepo         interfaces.QuestionRepository
	QuestionCodeRepo     interfaces.QuestionCodeRepository

	// Services
	AuthMgmt           *auth_mgmt.AuthMgmt
	UserMgmt           *user_mgmt.UserMgmt
	QuestionMgmt       *question_mgmt.QuestionMgmt
	QuestionFilterMgmt *question_filter_mgmt.QuestionFilterMgmt
	JWTService         *auth.JWTService
	OAuthService       *oauth.OAuthService
	SessionService     *session.SessionService
	NotificationSvc    *notification.NotificationService

	// Middleware
	AuthInterceptor      *middleware.AuthInterceptor
	SessionInterceptor   *middleware.SessionInterceptor
	RoleLevelInterceptor *middleware.RoleLevelInterceptor
	RateLimitInterceptor *middleware.RateLimitInterceptor
	AuditLogInterceptor  *middleware.AuditLogInterceptor

	// gRPC Services
	UserGRPCService           *grpc.UserServiceServer
	QuestionGRPCService       *grpc.QuestionServiceServer
	QuestionFilterGRPCService *grpc.QuestionFilterServiceServer
	ProfileGRPCService        *grpc.ProfileServiceServer
	AdminGRPCService          *grpc.AdminServiceServer

	// Configuration
	JWTSecret string
}

// NewContainer creates a new dependency injection container
func NewContainer(db *sql.DB, jwtSecret string) *Container {
	container := &Container{
		DB:        db,
		JWTSecret: jwtSecret,
	}

	// Initialize dependencies in the correct order
	container.initRepositories()
	container.initServices()
	container.initMiddleware()
	container.initGRPCServices()

	return container
}

// initRepositories initializes all repository dependencies
func (c *Container) initRepositories() {
	// Initialize all repositories with database connection
	c.UserRepo = &repository.UserRepository{}  // Legacy implementation
	c.UserRepoWrapper = repository.NewUserRepositoryWrapper(c.DB)  // Interface wrapper
	c.AnswerRepo = &repository.AnswerRepository{}
	c.SessionRepo = repository.NewSessionRepository(c.DB)
	c.OAuthAccountRepo = repository.NewOAuthAccountRepository(c.DB)
	c.ResourceAccessRepo = repository.NewResourceAccessRepository(c.DB)
	c.EnrollmentRepo = repository.NewEnrollmentRepository(c.DB)
	c.NotificationRepo = repository.NewNotificationRepository(c.DB)
	c.UserPreferenceRepo = repository.NewUserPreferenceRepository(c.DB)
	c.AuditLogRepo = repository.NewAuditLogRepository(c.DB)
	c.QuestionRepo = repository.NewQuestionRepository(c.DB)
	c.QuestionCodeRepo = repository.NewQuestionCodeRepository(c.DB)
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	// Auth management service following the new clean pattern
	c.AuthMgmt = auth_mgmt.NewAuthMgmt(c.DB, c.JWTSecret)

	// Initialize UserMgmt with database connection
	c.UserMgmt = user_mgmt.NewUserMgmt(c.DB)

	// Initialize QuestionMgmt with repositories
	c.QuestionMgmt = question_mgmt.NewQuestionMgmt(c.QuestionRepo, c.QuestionCodeRepo)

	// Initialize QuestionFilterMgmt with database connection
	c.QuestionFilterMgmt = question_filter_mgmt.NewQuestionFilterMgmt(c.DB)

	// Initialize JWT Service
	accessSecret := getEnvOrDefault("JWT_ACCESS_SECRET", c.JWTSecret)
	refreshSecret := getEnvOrDefault("JWT_REFRESH_SECRET", c.JWTSecret)
	c.JWTService = auth.NewJWTService(accessSecret, refreshSecret)

	// Create JWT Adapter for OAuth service
	jwtAdapter := auth.NewJWTAdapter(c.JWTService)

	// Initialize OAuth Service with proper configuration
	googleClientID := getEnvOrDefault("GOOGLE_CLIENT_ID", "")
	googleClientSecret := getEnvOrDefault("GOOGLE_CLIENT_SECRET", "")
	googleRedirectURI := getEnvOrDefault("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google")
	
	c.OAuthService = oauth.NewOAuthService(
		c.UserRepoWrapper,
		c.OAuthAccountRepo,
		c.SessionRepo,
		jwtAdapter,
		googleClientID,
		googleClientSecret,
		googleRedirectURI,
	)
	
	c.SessionService = session.NewSessionService(c.SessionRepo, c.UserRepoWrapper)
	c.NotificationSvc = notification.NewNotificationService(c.NotificationRepo, c.UserPreferenceRepo)
}

// initMiddleware initializes all middleware dependencies
func (c *Container) initMiddleware() {
	c.AuthInterceptor = middleware.NewAuthInterceptor(c.AuthMgmt, c.SessionService, c.UserRepoWrapper)
	c.SessionInterceptor = middleware.NewSessionInterceptor(c.SessionService, c.SessionRepo)
	c.RoleLevelInterceptor = middleware.NewRoleLevelInterceptor()
	c.RateLimitInterceptor = middleware.NewRateLimitInterceptor()
	c.AuditLogInterceptor = middleware.NewAuditLogInterceptor(c.AuditLogRepo)
}

// initGRPCServices initializes all gRPC service dependencies
func (c *Container) initGRPCServices() {
	c.UserGRPCService = grpc.NewUserServiceServer(c.UserMgmt, c.AuthMgmt)
	c.QuestionGRPCService = grpc.NewQuestionServiceServer(c.QuestionMgmt)
	c.QuestionFilterGRPCService = grpc.NewQuestionFilterServiceServer(c.QuestionFilterMgmt)
	c.ProfileGRPCService = grpc.NewProfileServiceServer(
		c.UserRepoWrapper,
		c.SessionService,
	)
	c.AdminGRPCService = grpc.NewAdminServiceServer(
		c.UserRepoWrapper, c.AuditLogRepo, c.ResourceAccessRepo, c.EnrollmentRepo, c.NotificationSvc,
	)
}

// GetUserRepository returns the user repository
func (c *Container) GetUserRepository() *repository.UserRepository {
	return c.UserRepo
}

// GetAnswerRepository returns the answer repository
func (c *Container) GetAnswerRepository() *repository.AnswerRepository {
	return c.AnswerRepo
}

// GetAuthMgmt returns the auth management service
func (c *Container) GetAuthMgmt() *auth_mgmt.AuthMgmt {
	return c.AuthMgmt
}

// GetUserMgmt returns the user management service
func (c *Container) GetUserMgmt() *user_mgmt.UserMgmt {
	return c.UserMgmt
}

// GetQuestionMgmt returns the question management service
func (c *Container) GetQuestionMgmt() *question_mgmt.QuestionMgmt {
	return c.QuestionMgmt
}

// GetQuestionFilterMgmt returns the question filter management service
func (c *Container) GetQuestionFilterMgmt() *question_filter_mgmt.QuestionFilterMgmt {
	return c.QuestionFilterMgmt
}

// GetAuthInterceptor returns the auth interceptor
func (c *Container) GetAuthInterceptor() *middleware.AuthInterceptor {
	return c.AuthInterceptor
}

// GetUserGRPCService returns the user gRPC service
func (c *Container) GetUserGRPCService() *grpc.UserServiceServer {
	return c.UserGRPCService
}

// GetQuestionGRPCService returns the question gRPC service
func (c *Container) GetQuestionGRPCService() *grpc.QuestionServiceServer {
	return c.QuestionGRPCService
}

// GetQuestionFilterGRPCService returns the question filter gRPC service
func (c *Container) GetQuestionFilterGRPCService() *grpc.QuestionFilterServiceServer {
	return c.QuestionFilterGRPCService
}

// InterceptorSet holds all interceptors
type InterceptorSet struct {
	RateLimit *middleware.RateLimitInterceptor
	Auth      *middleware.AuthInterceptor
	Session   *middleware.SessionInterceptor
	RoleLevel *middleware.RoleLevelInterceptor
	AuditLog  *middleware.AuditLogInterceptor
}

// GetAllInterceptors returns all interceptors in the correct order
func (c *Container) GetAllInterceptors() *InterceptorSet {
	return &InterceptorSet{
		RateLimit: c.RateLimitInterceptor,
		Auth:      c.AuthInterceptor,
		Session:   c.SessionInterceptor,
		RoleLevel: c.RoleLevelInterceptor,
		AuditLog:  c.AuditLogInterceptor,
	}
}

// GetProfileGRPCService returns the profile gRPC service
func (c *Container) GetProfileGRPCService() *grpc.ProfileServiceServer {
	return c.ProfileGRPCService
}

// GetAdminGRPCService returns the admin gRPC service
func (c *Container) GetAdminGRPCService() *grpc.AdminServiceServer {
	return c.AdminGRPCService
}

// Cleanup performs cleanup operations
func (c *Container) Cleanup() {
	// Stop rate limiter cleanup
	if c.RateLimitInterceptor != nil {
		c.RateLimitInterceptor.Stop()
	}
	
	if c.DB != nil {
		c.DB.Close()
	}
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
