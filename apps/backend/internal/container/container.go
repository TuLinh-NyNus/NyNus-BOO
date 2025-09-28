package container

import (
	"database/sql"
	"os"
	"strconv"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/cache"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/config"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/grpc"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/opensearch"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/redis"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/system"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/oauth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/scoring"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/session"
	contact_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/content/contact"
	exam_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/exam_mgmt"
	image_processing "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/image_processing"
	newsletter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/content/newsletter"
	question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"
	question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"
	mapcode_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/content/mapcode"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/system/analytics"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/system/performance"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/system/security"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/services/email"
	"github.com/sirupsen/logrus"
)

// Container holds all dependencies
type Container struct {
	// Database
	DB *sql.DB

	// Redis
	RedisClient *redis.Client
	CacheService cache.CacheService

	// OpenSearch
	OpenSearchClient *opensearch.Client
	OpenSearchConfig *opensearch.Config

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
	ExamRepo           interfaces.ExamRepository
	ContactRepo            *repository.ContactRepository
	NewsletterRepo         *repository.NewsletterRepository
	MapCodeRepo            *repository.MapCodeRepository
	MapCodeTranslationRepo *repository.MapCodeTranslationRepository

	// Services
	AuthMgmt              *auth.AuthMgmt
	QuestionMgmt          *question_mgmt.QuestionMgmt
	QuestionFilterMgmt    *question_filter_mgmt.QuestionFilterMgmt
	ExamMgmt              *exam_mgmt.ExamMgmt
	ContactMgmt           *contact_mgmt.ContactMgmt
	NewsletterMgmt        *newsletter_mgmt.NewsletterMgmt
	MapCodeMgmt           *mapcode_mgmt.MapCodeMgmt
	AutoGradingService    *scoring.AutoGradingService // NEW: Auto-grading service for exams
	JWTService            *auth.JWTService
	EnhancedJWTService    *auth.EnhancedJWTService // NEW: JWT service with refresh token rotation
	OAuthService          *oauth.OAuthService
	SessionService        *session.SessionService
	NotificationSvc       *notification.NotificationService
	ResourceProtectionSvc *system.ResourceProtectionService
	EmailService          *email.EmailService
	PerformanceService    *performance.PerformanceService

	// Analytics Services
	AnalyticsService      *analytics.AnalyticsService
	MonitoringService     *analytics.MonitoringService
	DashboardService      *analytics.DashboardService

	// Security Services
	ExamSessionSecurity   *security.ExamSessionSecurity
	AntiCheatService      *security.AntiCheatService
	ExamRateLimitService  *security.ExamRateLimitService

	// Middleware
	AuthInterceptor               *middleware.AuthInterceptor
	SessionInterceptor            *middleware.SessionInterceptor
	RoleLevelInterceptor          *middleware.RoleLevelInterceptor
	RateLimitInterceptor          *middleware.RateLimitInterceptor
	AuditLogInterceptor           *middleware.AuditLogInterceptor
	ResourceProtectionInterceptor *middleware.ResourceProtectionInterceptor

	// gRPC Services
	EnhancedUserGRPCService   *grpc.EnhancedUserServiceServer
	QuestionGRPCService       *grpc.QuestionServiceServer
	QuestionFilterGRPCService *grpc.QuestionFilterServiceServer
	ExamGRPCService           *grpc.ExamServiceServer
	ProfileGRPCService        *grpc.ProfileServiceServer
	AdminGRPCService          *grpc.AdminServiceServer
	ContactGRPCService        *grpc.ContactServiceServer
	NewsletterGRPCService     *grpc.NewsletterServiceServer
	NotificationGRPCService   *grpc.NotificationServiceServer
	MapCodeGRPCService        *grpc.MapCodeServiceServer

	// Configuration
	JWTSecret string
}

// NewContainer creates a new dependency injection container
func NewContainer(db *sql.DB, jwtSecret string, cfg *config.Config) *Container {
	container := &Container{
		DB:        db,
		JWTSecret: jwtSecret,
	}

	// Initialize dependencies in the correct order
	container.initRedis(&cfg.Redis)
	container.initOpenSearch()
	container.initRepositories()
	container.initServices()
	container.initMiddleware()
	container.initGRPCServices()

	return container
}

// initRedis initializes Redis client and cache service
func (c *Container) initRedis(cfg *config.RedisConfig) {
	// Create Redis client
	client, err := redis.NewClient(cfg)
	if err != nil {
		// Log error but don't fail startup - Redis is optional
		logrus.WithError(err).Warn("Failed to initialize Redis client, caching will be disabled")
		c.RedisClient = nil
		c.CacheService = cache.NewRedisService(nil) // Disabled cache service
	} else {
		c.RedisClient = client
		c.CacheService = cache.NewRedisService(client)
		logrus.Info("Redis client initialized successfully")
	}
}

// initOpenSearch initializes OpenSearch client and configuration
func (c *Container) initOpenSearch() {
	// Load OpenSearch configuration from environment
	c.OpenSearchConfig = opensearch.DefaultConfig()

	// Override with environment variables if set
	if url := os.Getenv("OPENSEARCH_URL"); url != "" {
		c.OpenSearchConfig.URL = url
	}

	if username := os.Getenv("OPENSEARCH_USERNAME"); username != "" {
		c.OpenSearchConfig.Username = username
	}

	if password := os.Getenv("OPENSEARCH_PASSWORD"); password != "" {
		c.OpenSearchConfig.Password = password
	}

	if enabled := os.Getenv("OPENSEARCH_ENABLED"); enabled != "" {
		if enabledBool, err := strconv.ParseBool(enabled); err == nil {
			c.OpenSearchConfig.Enabled = enabledBool
		}
	}

	// Create OpenSearch client
	client, err := opensearch.NewClient(c.OpenSearchConfig)
	if err != nil {
		// Log error but don't fail startup - OpenSearch is optional
		logrus.WithError(err).Warn("Failed to initialize OpenSearch client, search will use PostgreSQL fallback")
		c.OpenSearchClient = nil
	} else {
		c.OpenSearchClient = client
		logrus.Info("OpenSearch client initialized successfully")
	}
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
	c.ExamRepo = repository.NewExamRepository(c.DB)
	c.ContactRepo = repository.NewContactRepository(c.DB)
	c.NewsletterRepo = repository.NewNewsletterRepository(c.DB)
	c.MapCodeRepo = repository.NewMapCodeRepository(c.DB)
	c.MapCodeTranslationRepo = repository.NewMapCodeTranslationRepository(c.DB)
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	// Auth management service following the new clean pattern
	c.AuthMgmt = auth.NewAuthMgmt(c.DB, c.JWTSecret)



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

	// Initialize QuestionFilterMgmt with database connection and OpenSearch client
	c.QuestionFilterMgmt = question_filter_mgmt.NewQuestionFilterMgmt(c.DB, c.OpenSearchClient)

	// Initialize ScoringService first
	scoringService := scoring.NewScoringService()

	// Initialize AutoGradingService
	c.AutoGradingService = scoring.NewAutoGradingService(
		scoringService,
		c.ExamRepo,
		c.QuestionRepo,
	)

	// Initialize ExamMgmt with repositories
	c.ExamMgmt = exam_mgmt.NewExamMgmt(
		c.ExamRepo,
		c.QuestionRepo,
		logger,
	)

	// Initialize ContactMgmt with repository
	c.ContactMgmt = contact_mgmt.NewContactMgmt(c.ContactRepo)

	// Initialize NewsletterMgmt with repository
	c.NewsletterMgmt = newsletter_mgmt.NewNewsletterMgmt(c.NewsletterRepo)

	// Initialize MapCodeMgmt with repositories
	c.MapCodeMgmt = mapcode_mgmt.NewMapCodeMgmt(c.MapCodeRepo, c.MapCodeTranslationRepo)

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
	c.ResourceProtectionSvc = system.NewResourceProtectionService(
		c.ResourceAccessRepo,
		c.UserRepoWrapper,
		c.AuditLogRepo,
		c.NotificationSvc,
	)

	// Performance Service
	performanceConfig := performance.DefaultConfig()
	c.PerformanceService = performance.NewPerformanceService(c.DB, performanceConfig, logger)

	// Analytics Services
	c.AnalyticsService = analytics.NewAnalyticsService(c.ExamRepo, logger)
	c.MonitoringService = analytics.NewMonitoringService(c.DB, c.ExamRepo, logger)
	c.DashboardService = analytics.NewDashboardService(c.DB, c.ExamRepo, logger)

	// Security Services
	c.ExamSessionSecurity = security.NewExamSessionSecurity(c.DB, logger)
	c.AntiCheatService = security.NewAntiCheatService(c.DB, c.ExamSessionSecurity, logger)
	c.ExamRateLimitService = security.NewExamRateLimitService(c.DB, logger)
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
	c.ExamGRPCService = grpc.NewExamServiceServer(c.ExamMgmt, c.AutoGradingService)
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
	c.MapCodeGRPCService = grpc.NewMapCodeServiceServer(c.MapCodeMgmt)
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
func (c *Container) GetAuthMgmt() *auth.AuthMgmt {
	return c.AuthMgmt
}

// GetQuestionMgmt returns the question management service
func (c *Container) GetQuestionMgmt() *question_mgmt.QuestionMgmt {
	return c.QuestionMgmt
}

// GetQuestionFilterMgmt returns the question filter management service
func (c *Container) GetQuestionFilterMgmt() *question_filter_mgmt.QuestionFilterMgmt {
	return c.QuestionFilterMgmt
}

// GetExamMgmt returns the exam management service
func (c *Container) GetExamMgmt() *exam_mgmt.ExamMgmt {
	return c.ExamMgmt
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

// GetExamGRPCService returns the exam gRPC service
func (c *Container) GetExamGRPCService() *grpc.ExamServiceServer {
	return c.ExamGRPCService
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

// GetMapCodeGRPCService returns the MapCode gRPC service
func (c *Container) GetMapCodeGRPCService() *grpc.MapCodeServiceServer {
	return c.MapCodeGRPCService
}

// GetRedisClient returns the Redis client
func (c *Container) GetRedisClient() *redis.Client {
	return c.RedisClient
}

// GetCacheService returns the cache service
func (c *Container) GetCacheService() cache.CacheService {
	return c.CacheService
}

// GetAnalyticsService returns the analytics service
func (c *Container) GetAnalyticsService() *analytics.AnalyticsService {
	return c.AnalyticsService
}

// GetMonitoringService returns the monitoring service
func (c *Container) GetMonitoringService() *analytics.MonitoringService {
	return c.MonitoringService
}

// GetDashboardService returns the dashboard service
func (c *Container) GetDashboardService() *analytics.DashboardService {
	return c.DashboardService
}

// GetExamSessionSecurity returns the exam session security service
func (c *Container) GetExamSessionSecurity() *security.ExamSessionSecurity {
	return c.ExamSessionSecurity
}

// GetAntiCheatService returns the anti-cheat service
func (c *Container) GetAntiCheatService() *security.AntiCheatService {
	return c.AntiCheatService
}

// GetExamRateLimitService returns the exam rate limit service
func (c *Container) GetExamRateLimitService() *security.ExamRateLimitService {
	return c.ExamRateLimitService
}

// Cleanup performs cleanup operations
func (c *Container) Cleanup() {
	// Stop rate limiter cleanup
	if c.RateLimitInterceptor != nil {
		c.RateLimitInterceptor.Stop()
	}

	// Close Redis connection
	if c.RedisClient != nil {
		c.RedisClient.Close()
	}

	// Close cache service
	if c.CacheService != nil {
		c.CacheService.Close()
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
