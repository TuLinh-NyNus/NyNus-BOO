package container

import (
	"database/sql"
	"os"
	"strconv"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/config"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/grpc"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/oauth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/session"
	auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
	contact_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/contact"
	image_processing "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/image_processing"
	newsletter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/newsletter"
	question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"
	question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"
	user_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/user"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/services/email"
	"github.com/sirupsen/logrus"
)

// Container holds all dependencies
type Container struct {
	// Database
	DB *sql.DB

	// Repositories
	UserRepo           *repository.UserRepository // Legacy repository
	UserRepoWrapper    repository.IUserRepository // Interface implementation
	AnswerRepo         *repository.AnswerRepository
	SessionRepo        repository.SessionRepository
	OAuthAccountRepo   repository.OAuthAccountRepository
	ResourceAccessRepo repository.ResourceAccessRepository
	EnrollmentRepo     repository.EnrollmentRepository
	NotificationRepo   repository.NotificationRepository
	UserPreferenceRepo repository.UserPreferenceRepository
	AuditLogRepo       repository.AuditLogRepository
	RefreshTokenRepo   *repository.RefreshTokenRepository // NEW: Refresh token rotation support
	QuestionRepo       interfaces.QuestionRepository
	QuestionCodeRepo   interfaces.QuestionCodeRepository
	QuestionImageRepo  interfaces.QuestionImageRepository
	ContactRepo        *repository.ContactRepository
	NewsletterRepo     *repository.NewsletterRepository

	// Services
	AuthMgmt              *auth_mgmt.AuthMgmt
	UserMgmt              *user_mgmt.UserMgmt
	QuestionMgmt          *question_mgmt.QuestionMgmt
	QuestionFilterMgmt    *question_filter_mgmt.QuestionFilterMgmt
	ContactMgmt           *contact_mgmt.ContactMgmt
	NewsletterMgmt        *newsletter_mgmt.NewsletterMgmt
	JWTService            *auth.JWTService
	EnhancedJWTService    *auth.EnhancedJWTService // NEW: JWT service with refresh token rotation
	OAuthService          *oauth.OAuthService
	SessionService        *session.SessionService
	NotificationSvc       *notification.NotificationService
	ResourceProtectionSvc *service.ResourceProtectionService
	EmailService          *email.EmailService

	// Middleware
	AuthInterceptor               *middleware.AuthInterceptor
	SessionInterceptor            *middleware.SessionInterceptor
	RoleLevelInterceptor          *middleware.RoleLevelInterceptor
	RateLimitInterceptor          *middleware.RateLimitInterceptor
	AuditLogInterceptor           *middleware.AuditLogInterceptor
	ResourceProtectionInterceptor *middleware.ResourceProtectionInterceptor

	// gRPC Services
	UserGRPCService           *grpc.UserServiceServer
	EnhancedUserGRPCService   *grpc.EnhancedUserServiceServer
	QuestionGRPCService       *grpc.QuestionServiceServer
	QuestionFilterGRPCService *grpc.QuestionFilterServiceServer
	ProfileGRPCService        *grpc.ProfileServiceServer
	AdminGRPCService          *grpc.AdminServiceServer
	ContactGRPCService        *grpc.ContactServiceServer
	NewsletterGRPCService     *grpc.NewsletterServiceServer
	NotificationGRPCService   *grpc.NotificationServiceServer

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
	c.UserRepo = &repository.UserRepository{}                     // Legacy implementation
	c.UserRepoWrapper = repository.NewUserRepositoryWrapper(c.DB) // Interface wrapper
	c.AnswerRepo = &repository.AnswerRepository{}
	c.SessionRepo = repository.NewSessionRepository(c.DB)
	c.OAuthAccountRepo = repository.NewOAuthAccountRepository(c.DB)
	c.ResourceAccessRepo = repository.NewResourceAccessRepository(c.DB)
	c.EnrollmentRepo = repository.NewEnrollmentRepository(c.DB)
	c.NotificationRepo = repository.NewNotificationRepository(c.DB)
	c.UserPreferenceRepo = repository.NewUserPreferenceRepository(c.DB)
	c.AuditLogRepo = repository.NewAuditLogRepository(c.DB)
	c.RefreshTokenRepo = repository.NewRefreshTokenRepository(c.DB) // NEW: Refresh token repository
	c.QuestionRepo = repository.NewQuestionRepository(c.DB)
	c.QuestionCodeRepo = repository.NewQuestionCodeRepository(c.DB)
	c.QuestionImageRepo = repository.NewQuestionImageRepository(c.DB)
	c.ContactRepo = repository.NewContactRepository(c.DB)
	c.NewsletterRepo = repository.NewNewsletterRepository(c.DB)
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	// Auth management service following the new clean pattern
	c.AuthMgmt = auth_mgmt.NewAuthMgmt(c.DB, c.JWTSecret)

	// Initialize UserMgmt with database connection
	c.UserMgmt = user_mgmt.NewUserMgmt(c.DB)

	// Initialize QuestionMgmt with repositories
	// Note: Image processing is optional, pass nil if not configured
	logger := logrus.New()

	// Initialize ImageProcessingService if configured
	var imageProcessor *image_processing.ImageProcessingService
	appConfig := config.LoadConfig()

	if appConfig.ImageProcessing.Enabled {
		imageConfig := &image_processing.ImageConfig{
			TexLiveBin:     appConfig.ImageProcessing.TexLiveBin,
			LatexEngine:    appConfig.ImageProcessing.LatexEngine,
			ImageConverter: appConfig.ImageProcessing.ImageConverter,
			TmpDir:         appConfig.ImageProcessing.TmpDir,
			OutputDir:      appConfig.ImageProcessing.OutputDir,
			CacheDir:       appConfig.ImageProcessing.CacheDir,
			ImageQuality:   appConfig.ImageProcessing.ImageQuality,
			MaxConcurrency: appConfig.ImageProcessing.MaxConcurrency,
			EnableCache:    true,
			SafeMode:       true, // Enable safe mode by default
		}

		var err error
		imageProcessor, err = image_processing.NewImageProcessingService(imageConfig, logger)
		if err != nil {
			logger.WithError(err).Warn("Failed to initialize ImageProcessingService, continuing without it")
			imageProcessor = nil
		} else {
			logger.Info("ImageProcessingService initialized successfully")
		}
	}

	c.QuestionMgmt = question_mgmt.NewQuestionMgmt(
		c.QuestionRepo,
		c.QuestionCodeRepo,
		c.QuestionImageRepo,
		imageProcessor,
		logger,
	)

	// Initialize QuestionFilterMgmt with database connection
	c.QuestionFilterMgmt = question_filter_mgmt.NewQuestionFilterMgmt(c.DB)

	// Initialize ContactMgmt with repository
	c.ContactMgmt = contact_mgmt.NewContactMgmt(c.ContactRepo)

	// Initialize NewsletterMgmt with repository
	c.NewsletterMgmt = newsletter_mgmt.NewNewsletterMgmt(c.NewsletterRepo)

	// Initialize JWT Service
	accessSecret := getEnvOrDefault("JWT_ACCESS_SECRET", c.JWTSecret)
	refreshSecret := getEnvOrDefault("JWT_REFRESH_SECRET", c.JWTSecret)
	c.JWTService = auth.NewJWTService(accessSecret, refreshSecret)

	// Initialize Enhanced JWT Service with refresh token rotation
	c.EnhancedJWTService = auth.NewEnhancedJWTService(accessSecret, refreshSecret, c.RefreshTokenRepo)

	// Create JWT Adapter for OAuth service
	jwtAdapter := auth.NewJWTAdapter(c.JWTService)

	// Initialize Notification and Session services first (needed by OAuth)
	c.NotificationSvc = notification.NewNotificationService(c.NotificationRepo, c.UserPreferenceRepo)
	c.SessionService = session.NewSessionService(c.SessionRepo, c.UserRepoWrapper, c.NotificationSvc)

	// Initialize OAuth Service with proper configuration
	googleClientID := getEnvOrDefault("GOOGLE_CLIENT_ID", "")
	googleClientSecret := getEnvOrDefault("GOOGLE_CLIENT_SECRET", "")
	googleRedirectURI := getEnvOrDefault("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google")

	c.OAuthService = oauth.NewOAuthService(
		c.UserRepoWrapper,
		c.OAuthAccountRepo,
		c.SessionRepo,
		jwtAdapter,
		c.SessionService, // Pass the SessionService
		googleClientID,
		googleClientSecret,
		googleRedirectURI,
	)

	// Initialize Email Service (uses environment variables internally)
	c.EmailService = email.NewEmailService()

	// Resource Protection Service
	c.ResourceProtectionSvc = service.NewResourceProtectionService(
		c.ResourceAccessRepo,
		c.UserRepoWrapper,
		c.AuditLogRepo,
		c.NotificationSvc,
	)
}

// initMiddleware initializes all middleware dependencies
func (c *Container) initMiddleware() {
	c.AuthInterceptor = middleware.NewAuthInterceptor(c.AuthMgmt, c.SessionService, c.UserRepoWrapper)
	c.SessionInterceptor = middleware.NewSessionInterceptor(c.SessionService, c.SessionRepo)
	c.RoleLevelInterceptor = middleware.NewRoleLevelInterceptor()
	c.RateLimitInterceptor = middleware.NewRateLimitInterceptor()
	c.AuditLogInterceptor = middleware.NewAuditLogInterceptor(c.AuditLogRepo)
	c.ResourceProtectionInterceptor = middleware.NewResourceProtectionInterceptor(c.ResourceProtectionSvc)
}

// initGRPCServices initializes all gRPC service dependencies
func (c *Container) initGRPCServices() {
	c.UserGRPCService = grpc.NewUserServiceServer(c.UserMgmt, c.AuthMgmt)

	// Get bcrypt cost from environment (default 12)
	bcryptCost := 12
	if costStr := getEnvOrDefault("BCRYPT_COST", "12"); costStr != "" {
		if cost, err := strconv.Atoi(costStr); err == nil && cost >= 10 {
			bcryptCost = cost
		}
	}

	// Initialize Enhanced User Service with OAuth support and refresh token rotation
	c.EnhancedUserGRPCService = grpc.NewEnhancedUserServiceServer(
		c.OAuthService,
		c.SessionService,
		c.EnhancedJWTService, // Use Enhanced JWT Service instead of basic JWT Service
		c.UserRepoWrapper,
		c.EmailService,
		bcryptCost,
	)

	c.QuestionGRPCService = grpc.NewQuestionServiceServer(c.QuestionMgmt)
	c.QuestionFilterGRPCService = grpc.NewQuestionFilterServiceServer(c.QuestionFilterMgmt)
	c.ProfileGRPCService = grpc.NewProfileServiceServer(
		c.UserRepoWrapper,
		c.SessionService,
		c.UserPreferenceRepo,
	)
	c.AdminGRPCService = grpc.NewAdminServiceServer(
		c.UserRepoWrapper, c.AuditLogRepo, c.ResourceAccessRepo, c.EnrollmentRepo, c.NotificationSvc,
	)
	c.ContactGRPCService = grpc.NewContactServiceServer(c.ContactMgmt)
	c.NewsletterGRPCService = grpc.NewNewsletterServiceServer(c.NewsletterMgmt)
	c.NotificationGRPCService = grpc.NewNotificationServiceServer(
		c.NotificationRepo,
		c.UserPreferenceRepo,
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

// GetContactGRPCService returns the contact gRPC service
func (c *Container) GetContactGRPCService() *grpc.ContactServiceServer {
	return c.ContactGRPCService
}

// GetNewsletterGRPCService returns the newsletter gRPC service
func (c *Container) GetNewsletterGRPCService() *grpc.NewsletterServiceServer {
	return c.NewsletterGRPCService
}

// GetUserGRPCService returns the user gRPC service
func (c *Container) GetUserGRPCService() *grpc.UserServiceServer {
	return c.UserGRPCService
}

// GetEnhancedUserGRPCService returns the enhanced user gRPC service with OAuth support
func (c *Container) GetEnhancedUserGRPCService() *grpc.EnhancedUserServiceServer {
	return c.EnhancedUserGRPCService
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
	RateLimit          *middleware.RateLimitInterceptor
	Auth               *middleware.AuthInterceptor
	Session            *middleware.SessionInterceptor
	RoleLevel          *middleware.RoleLevelInterceptor
	ResourceProtection *middleware.ResourceProtectionInterceptor
	AuditLog           *middleware.AuditLogInterceptor
}

// GetAllInterceptors returns all interceptors in the correct order
func (c *Container) GetAllInterceptors() *InterceptorSet {
	return &InterceptorSet{
		RateLimit:          c.RateLimitInterceptor,
		Auth:               c.AuthInterceptor,
		Session:            c.SessionInterceptor,
		RoleLevel:          c.RoleLevelInterceptor,
		ResourceProtection: c.ResourceProtectionInterceptor,
		AuditLog:           c.AuditLogInterceptor,
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

// GetNotificationGRPCService returns the notification gRPC service
func (c *Container) GetNotificationGRPCService() *grpc.NotificationServiceServer {
	return c.NotificationGRPCService
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
