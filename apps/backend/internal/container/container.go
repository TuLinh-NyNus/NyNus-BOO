package container

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
	
	"exam-bank-system/apps/backend/internal/cache"
	"exam-bank-system/apps/backend/internal/config"
	"exam-bank-system/apps/backend/internal/grpc"
	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/opensearch"
	"exam-bank-system/apps/backend/internal/redis"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/server"
	"exam-bank-system/apps/backend/internal/util"
	"exam-bank-system/apps/backend/internal/websocket"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"exam-bank-system/apps/backend/internal/service/auth"
	book_mgmt "exam-bank-system/apps/backend/internal/service/content/book"
	contact_mgmt "exam-bank-system/apps/backend/internal/service/content/contact"
	mapcode_mgmt "exam-bank-system/apps/backend/internal/service/content/mapcode"
	newsletter_mgmt "exam-bank-system/apps/backend/internal/service/content/newsletter"
	"exam-bank-system/apps/backend/internal/service/exam"
	"exam-bank-system/apps/backend/internal/service/exam/scoring"
	bookmarksvc "exam-bank-system/apps/backend/internal/service/library/bookmark"
	ratingsvc "exam-bank-system/apps/backend/internal/service/library/rating"
	videosvc "exam-bank-system/apps/backend/internal/service/library/video"
	"exam-bank-system/apps/backend/internal/service/metrics"
	"exam-bank-system/apps/backend/internal/service/notification"
	"exam-bank-system/apps/backend/internal/service/question"
	system "exam-bank-system/apps/backend/internal/service/system"
	"exam-bank-system/apps/backend/internal/service/system/analytics"
	image_processing "exam-bank-system/apps/backend/internal/service/system/image_processing"
	"exam-bank-system/apps/backend/internal/service/system/performance"
	"exam-bank-system/apps/backend/internal/service/system/security"
	"exam-bank-system/apps/backend/internal/service/user/oauth"
	"exam-bank-system/apps/backend/internal/service/user/session"
	"exam-bank-system/apps/backend/internal/services/email"
	"github.com/sirupsen/logrus"
)

// Container holds all dependencies
type Container struct {
	// Database
	DB  *sql.DB
	DBX *sqlx.DB // sqlx wrapper for advanced SQL operations (version control, bulk ops)

	// Redis
	RedisClient  *redis.Client
	CacheService cache.CacheService
	
	// WebSocket & Real-time (Phase 3 - Task 3.3.1)
	RedisPubSub      *redis.PubSubClient
	WebSocketManager *websocket.ConnectionManager
	WebSocketHandler *websocket.Handler
	WebSocketServer  *server.WebSocketServer
	RedisBridge      *websocket.RedisBridge

	// OpenSearch
	OpenSearchClient *opensearch.Client
	OpenSearchConfig *opensearch.Config

	// Repositories
	UserRepo               *repository.UserRepository // Legacy repository
	UserRepoWrapper        repository.IUserRepository // Interface implementation
	AnswerRepo             *repository.AnswerRepository
	SessionRepo            repository.SessionRepository
	OAuthAccountRepo       repository.OAuthAccountRepository
	ResourceAccessRepo     repository.ResourceAccessRepository
	EnrollmentRepo         repository.EnrollmentRepository
	NotificationRepo       repository.NotificationRepository
	UserPreferenceRepo     repository.UserPreferenceRepository
	AuditLogRepo           repository.AuditLogRepository
	RefreshTokenRepo       *repository.RefreshTokenRepository // NEW: Refresh token rotation support
	QuestionRepo           interfaces.QuestionRepository
	QuestionCodeRepo       interfaces.QuestionCodeRepository
	QuestionImageRepo      interfaces.QuestionImageRepository
	QuestionVersionRepo    repository.QuestionVersionRepository // NEW: Version control support
	ExamRepo               interfaces.ExamRepository
	ContactRepo            *repository.ContactRepository
	NewsletterRepo         *repository.NewsletterRepository
	MapCodeRepo            *repository.MapCodeRepository
	MapCodeTranslationRepo *repository.MapCodeTranslationRepository
	BookRepo               repository.BookRepository
	LibraryExamRepo        repository.LibraryExamRepository
	LibraryVideoRepo       repository.LibraryVideoRepository
	ItemRatingRepo         repository.ItemRatingRepository
	UserBookmarkRepo       repository.UserBookmarkRepository
	LibraryItemRepo        repository.LibraryItemRepository
	MetricsRepo            interfaces.MetricsRepository // NEW: Metrics history repository

	// Services
	AuthMgmt               *auth.AuthMgmt
	QuestionService        *question.QuestionService
	QuestionFilterService  *question.QuestionFilterService
	QuestionVersionService *question.VersionService // NEW: Version control service
	ExamService            *exam.ExamService
	ContactMgmt            *contact_mgmt.ContactMgmt
	NewsletterMgmt         *newsletter_mgmt.NewsletterMgmt
	MapCodeMgmt            *mapcode_mgmt.MapCodeMgmt
	BookMgmt               *book_mgmt.BookService
	LibraryVideoService    *videosvc.Service
	LibraryRatingService   *ratingsvc.Service
	LibraryBookmarkService *bookmarksvc.Service
	AutoGradingService     *scoring.AutoGradingService // NEW: Auto-grading service for exams
	UnifiedJWTService      *auth.UnifiedJWTService     // UNIFIED: Single JWT service replacing JWTService and EnhancedJWTService
	OAuthService           *oauth.OAuthService
	SessionService         *session.SessionService
	NotificationSvc        *notification.NotificationService
	ResourceProtectionSvc  *system.ResourceProtectionService
	EmailService           *email.EmailService
	PerformanceService     *performance.PerformanceService
	MetricsScheduler       *metrics.MetricsScheduler // NEW: Metrics recording scheduler

	// Analytics Services
	AnalyticsService        *analytics.AnalyticsService
	MonitoringService       *analytics.MonitoringService
	DashboardService        *analytics.DashboardService
	TeacherAnalyticsService *analytics.TeacherAnalyticsService // NEW: Teacher-specific analytics

	// Security Services
	ExamSessionSecurity  *security.ExamSessionSecurity
	AntiCheatService     *security.AntiCheatService
	ExamRateLimitService *security.ExamRateLimitService

	// Middleware
	AuthInterceptor               *middleware.AuthInterceptor
	SessionInterceptor            *middleware.SessionInterceptor
	RoleLevelInterceptor          *middleware.RoleLevelInterceptor
	RateLimitInterceptor          *middleware.RateLimitInterceptor
	CSRFInterceptor               *middleware.CSRFInterceptor // NEW: CSRF protection
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
	BookGRPCService           *grpc.BookServiceServer
	LibraryGRPCService        *grpc.LibraryServiceServer
	AnalyticsGRPCService      *grpc.AnalyticsServiceServer // NEW: Analytics gRPC service

	// Configuration
	Config    *config.Config
	JWTSecret string
}

// NewContainer creates a new dependency injection container
func NewContainer(db *sql.DB, jwtSecret string, cfg *config.Config) *Container {
	// Wrap *sql.DB with sqlx for advanced features (version control, bulk operations)
	dbx := sqlx.NewDb(db, "postgres")
	
	container := &Container{
		DB:        db,
		DBX:       dbx,
		Config:    cfg,
		JWTSecret: jwtSecret,
	}

	// Initialize dependencies in the correct order
	container.initRedis(&cfg.Redis)
	container.initOpenSearch()
	container.initRepositories()
	container.initServices()
	container.initMiddleware()
	container.initGRPCServices()
	
	// Initialize WebSocket components (Phase 3 - Task 3.3.2)
	container.initWebSocketComponents(&cfg.Redis)

	return container
}

// initRedis initializes Redis client and cache service
func (c *Container) initRedis(cfg *config.RedisConfig) {
	// Create Redis client
	client, err := redis.NewClient(cfg)
	if err != nil {
		// Log error but don't fail startup - Redis is optional
		log.Printf("[WARN] Failed to initialize Redis client, caching will be disabled: %v", err)
		c.RedisClient = nil
		c.CacheService = cache.NewRedisService(nil) // Disabled cache service
	} else {
		c.RedisClient = client
		c.CacheService = cache.NewRedisService(client)
		log.Println("[OK] Redis client initialized successfully")
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
		log.Printf("[WARN] Failed to initialize OpenSearch client, search will use PostgreSQL fallback: %v", err)
		c.OpenSearchClient = nil
	} else {
		c.OpenSearchClient = client
		log.Println("[OK] OpenSearch client initialized successfully")
	}
}

// initRepositories initializes all repository dependencies
func (c *Container) initRepositories() {
	// Create logger for repositories
	repoLogger := logrus.New()
	repoLogger.SetLevel(logrus.InfoLevel)
	repoLogger.SetFormatter(util.StandardLogrusFormatter())

	// Initialize all repositories with database connection
	c.UserRepo = &repository.UserRepository{}                                 // Legacy implementation
	c.UserRepoWrapper = repository.NewUserRepositoryWrapper(c.DB, repoLogger) // Interface wrapper with logger
	c.AnswerRepo = &repository.AnswerRepository{}
	c.SessionRepo = repository.NewSessionRepository(c.DB, repoLogger)               // Session repository with logger
	c.OAuthAccountRepo = repository.NewOAuthAccountRepository(c.DB, repoLogger)     // OAuth account repository with logger
	c.ResourceAccessRepo = repository.NewResourceAccessRepository(c.DB, repoLogger) // Resource access repository with logger
	c.EnrollmentRepo = repository.NewEnrollmentRepository(c.DB)
	c.NotificationRepo = repository.NewNotificationRepository(c.DB)
	c.UserPreferenceRepo = repository.NewUserPreferenceRepository(c.DB, repoLogger) // User preference repository with logger
	c.AuditLogRepo = repository.NewAuditLogRepository(c.DB, repoLogger)             // Audit log repository with logger
	c.RefreshTokenRepo = repository.NewRefreshTokenRepository(c.DB, repoLogger)     // Refresh token repository with logger
	c.QuestionRepo = repository.NewQuestionRepository(c.DB)
	c.QuestionCodeRepo = repository.NewQuestionCodeRepository(c.DB)
	c.QuestionImageRepo = repository.NewQuestionImageRepository(c.DB)
	c.ExamRepo = repository.NewExamRepository(c.DB)
	c.ContactRepo = repository.NewContactRepository(c.DB)
	c.NewsletterRepo = repository.NewNewsletterRepository(c.DB)
	c.MapCodeRepo = repository.NewMapCodeRepository(c.DB)
	c.MapCodeTranslationRepo = repository.NewMapCodeTranslationRepository(c.DB)
	c.BookRepo = repository.NewBookRepository(c.DB)
	c.LibraryExamRepo = repository.NewLibraryExamRepository(c.DB)
	c.LibraryVideoRepo = repository.NewLibraryVideoRepository(c.DB)
	c.ItemRatingRepo = repository.NewItemRatingRepository(c.DB)
	c.UserBookmarkRepo = repository.NewUserBookmarkRepository(c.DB)
	c.LibraryItemRepo = repository.NewLibraryItemRepository(c.DB)
	
	// Initialize QuestionVersionRepository for version control
	c.QuestionVersionRepo = repository.NewQuestionVersionRepository(c.DBX)
	
	// Initialize MetricsRepository for metrics history
	metricsLogger := logrus.New()
	metricsLogger.SetFormatter(util.StandardLogrusFormatter())
	c.MetricsRepo = repository.NewMetricsRepository(c.DB, metricsLogger)
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	// Initialize Unified JWT Service first (needed by AuthMgmt)
	accessSecret := getEnvOrDefault("JWT_ACCESS_SECRET", c.JWTSecret)

	// Create logger for JWT service
	jwtLogger := logrus.New()
	jwtLogger.SetLevel(logrus.InfoLevel)
	jwtLogger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "level",
			logrus.FieldKeyMsg:   "message",
		},
	})

	// Initialize Unified JWT Service vá»›i logger
	var err error
	c.UnifiedJWTService, err = auth.NewUnifiedJWTService(accessSecret, c.RefreshTokenRepo, jwtLogger)
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize JWT service: %v", err))
	}

	// Auth management service using UnifiedJWTService
	c.AuthMgmt = auth.NewAuthMgmt(c.DB, c.UnifiedJWTService)

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
			log.Println("[OK] ImageProcessingService initialized successfully")
		}
	}

	c.QuestionService = question.NewQuestionService(
		c.QuestionRepo,
		c.QuestionCodeRepo,
		c.QuestionImageRepo,
		imageProcessor,
		logger,
	)

	// Initialize QuestionFilterService with database connection and OpenSearch client
	c.QuestionFilterService = question.NewQuestionFilterService(c.DB, c.OpenSearchClient)
	
	// Initialize QuestionVersionService for version control
	c.QuestionVersionService = question.NewVersionService(
		c.QuestionVersionRepo,
		c.QuestionRepo,
	)

	// Initialize ScoringService first
	scoringService := scoring.NewScoringService()

	// Initialize AutoGradingService
	c.AutoGradingService = scoring.NewAutoGradingService(
		scoringService,
		c.ExamRepo,
		c.QuestionRepo,
	)

	// Initialize ExamService with repositories
	c.ExamService = exam.NewExamService(
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

	// Initialize Book management service
	c.BookMgmt = book_mgmt.NewBookService(c.BookRepo)
	c.LibraryVideoService = videosvc.NewService(c.LibraryVideoRepo)
	c.LibraryRatingService = ratingsvc.NewService(c.ItemRatingRepo, c.LibraryItemRepo)
	c.LibraryBookmarkService = bookmarksvc.NewService(c.UserBookmarkRepo)

	// Initialize Notification and Session services first (needed by OAuth)
	c.NotificationSvc = notification.NewNotificationService(c.NotificationRepo, c.UserPreferenceRepo)
	c.SessionService = session.NewSessionService(c.SessionRepo, c.UserRepoWrapper, c.NotificationSvc)

	// Initialize OAuth Service with proper configuration
	googleClientID := getEnvOrDefault("GOOGLE_CLIENT_ID", "")
	googleClientSecret := getEnvOrDefault("GOOGLE_CLIENT_SECRET", "")
	googleRedirectURI := getEnvOrDefault("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google")

	// Create logger for OAuth service
	oauthLogger := logrus.New()
	oauthLogger.SetLevel(logrus.InfoLevel)
	oauthLogger.SetFormatter(util.StandardLogrusFormatter())

	c.OAuthService = oauth.NewOAuthService(
		c.UserRepoWrapper,
		c.OAuthAccountRepo,
		c.SessionRepo,
		c.UnifiedJWTService, // Use UnifiedJWTService directly (implements IJWTService)
		c.SessionService,    // Pass the SessionService
		googleClientID,
		googleClientSecret,
		googleRedirectURI,
		oauthLogger, // Inject logger
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
	c.TeacherAnalyticsService = analytics.NewTeacherAnalyticsService(c.DB, c.ExamRepo, c.EnrollmentRepo, logger)

	// Security Services
	c.ExamSessionSecurity = security.NewExamSessionSecurity(c.DB, logger)
	c.AntiCheatService = security.NewAntiCheatService(c.DB, c.ExamSessionSecurity, logger)
	c.ExamRateLimitService = security.NewExamRateLimitService(c.DB, logger)
	
	// Metrics Scheduler - Records metrics every 5 minutes
	metricsLogger := logrus.New()
	metricsLogger.SetFormatter(util.StandardLogrusFormatter())
	c.MetricsScheduler = metrics.NewMetricsScheduler(
		c.DB,
		c.UserRepoWrapper,
		c.SessionRepo,
		c.MetricsRepo,
		metricsLogger,
	)
}

// initMiddleware initializes all middleware dependencies
func (c *Container) initMiddleware() {
	c.AuthInterceptor = middleware.NewAuthInterceptor(c.AuthMgmt, c.SessionService, c.UserRepoWrapper)
	c.SessionInterceptor = middleware.NewSessionInterceptor(c.SessionService, c.SessionRepo)
	c.RoleLevelInterceptor = middleware.NewRoleLevelInterceptor()
	c.RateLimitInterceptor = middleware.NewRateLimitInterceptor()
	c.CSRFInterceptor = middleware.NewCSRFInterceptor(c.Config.Auth.Security.EnableCSRF) // NEW: CSRF protection
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
		c.UnifiedJWTService, // Use Unified JWT Service
		c.UserRepoWrapper,
		c.EmailService,
		bcryptCost,
	)

	c.QuestionGRPCService = grpc.NewQuestionServiceServer(c.QuestionService, c.QuestionVersionService)
	c.QuestionFilterGRPCService = grpc.NewQuestionFilterServiceServer(c.QuestionFilterService)
	c.ExamGRPCService = grpc.NewExamServiceServer(c.ExamService, c.AutoGradingService, c.ExamRepo)
	c.ProfileGRPCService = grpc.NewProfileServiceServer(
		c.UserRepoWrapper,
		c.SessionService,
		c.UserPreferenceRepo,
	)
	c.AdminGRPCService = grpc.NewAdminServiceServer(
		c.UserRepoWrapper,
		c.MetricsRepo, // NEW: Metrics repository
		c.AuditLogRepo,
		c.ResourceAccessRepo,
		c.EnrollmentRepo,
		c.NotificationSvc,
		c.SessionRepo,
		c.NotificationRepo,
	)
	c.ContactGRPCService = grpc.NewContactServiceServer(c.ContactMgmt)
	c.NewsletterGRPCService = grpc.NewNewsletterServiceServer(c.NewsletterMgmt)
	c.BookGRPCService = grpc.NewBookServiceServer(c.BookMgmt)
	c.LibraryGRPCService = grpc.NewLibraryServiceServer(
		c.BookMgmt,
		c.LibraryExamRepo,
		c.LibraryVideoService,
		c.LibraryRatingService,
		c.LibraryBookmarkService,
		c.LibraryItemRepo,
	)
	c.NotificationGRPCService = grpc.NewNotificationServiceServer(
		c.NotificationRepo,
		c.UserPreferenceRepo,
	)
	c.MapCodeGRPCService = grpc.NewMapCodeServiceServer(c.MapCodeMgmt)
	c.AnalyticsGRPCService = grpc.NewAnalyticsServiceServer(c.TeacherAnalyticsService)
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

// GetQuestionService returns the question management service
func (c *Container) GetQuestionService() *question.QuestionService {
	return c.QuestionService
}

// GetQuestionFilterService returns the question filter management service
func (c *Container) GetQuestionFilterService() *question.QuestionFilterService {
	return c.QuestionFilterService
}

// GetExamService returns the exam management service
func (c *Container) GetExamService() *exam.ExamService {
	return c.ExamService
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

// GetBookGRPCService returns the book gRPC service
func (c *Container) GetBookGRPCService() *grpc.BookServiceServer {
	return c.BookGRPCService
}

// GetLibraryGRPCService returns the library gRPC service
func (c *Container) GetLibraryGRPCService() *grpc.LibraryServiceServer {
	return c.LibraryGRPCService
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
	CSRF               *middleware.CSRFInterceptor // NEW: CSRF protection
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
		CSRF:               c.CSRFInterceptor, // NEW: CSRF protection
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

// GetAnalyticsGRPCService returns the analytics gRPC service
func (c *Container) GetAnalyticsGRPCService() *grpc.AnalyticsServiceServer {
	return c.AnalyticsGRPCService
}

// initWebSocketComponents initializes WebSocket and Redis Pub/Sub components
// Implements Phase 3 - Task 3.3.2: Initialize components
func (c *Container) initWebSocketComponents(cfg *config.RedisConfig) {
	// Skip if Redis or Pub/Sub is disabled
	if !cfg.Enabled || !cfg.PubSubEnabled {
		log.Println("[INFO] WebSocket/Pub/Sub disabled, skipping initialization")
		return
	}
	
	// Check if Redis client is available
	if c.RedisClient == nil || !c.RedisClient.IsEnabled() {
		log.Println("[WARN] Redis client not available, WebSocket/Pub/Sub disabled")
		return
	}
	
	// Create Redis Pub/Sub client
	redisPubSub, err := redis.NewPubSubClient(c.RedisClient.GetClient())
	if err != nil {
		log.Printf("[WARN] Failed to create Redis Pub/Sub client, real-time notifications disabled: %v", err)
		return
	}
	c.RedisPubSub = redisPubSub
	
	// Create WebSocket connection manager
	c.WebSocketManager = websocket.NewConnectionManager()
	
	// Create JWT authenticator for WebSocket
	jwtAuth := websocket.NewJWTAuthenticator(c.JWTSecret)
	
	// Create WebSocket handler
	c.WebSocketHandler = websocket.NewHandler(c.WebSocketManager, jwtAuth)
	
	// Configure allowed origins
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:8080",
		getEnvOrDefault("FRONTEND_URL", "http://localhost:3000"),
	}
	c.WebSocketHandler.SetAllowedOrigins(allowedOrigins)
	
	// Create Redis-WebSocket bridge
	channelHelper := redis.NewChannelHelper(cfg.PubSubChannelPrefix)
	c.RedisBridge = websocket.NewRedisBridge(c.RedisPubSub, c.WebSocketManager, channelHelper)
	
	// Create WebSocket server
	wsConfig := &server.WebSocketServerConfig{
		Port:            getEnvOrDefault("WEBSOCKET_PORT", "8081"),
		AllowedOrigins:  allowedOrigins,
		MaxMessageSize:  10 * 1024, // 10KB
		RateLimit:       60,
		ShutdownTimeout: 30 * time.Second,
	}
	c.WebSocketServer = server.NewWebSocketServer(
		c.WebSocketManager,
		c.WebSocketHandler,
		c.RedisPubSub,
		wsConfig,
	)
	
	// Wire up Redis publisher to NotificationService
	if c.NotificationSvc != nil {
		c.NotificationSvc.SetRedisPublisher(c.RedisPubSub)
		log.Println("[OK] Redis publisher connected to NotificationService")
	}
	
	// Start bridge (connect Redis Pub/Sub to WebSocket)
	if err := c.RedisBridge.Start(cfg.WorkerPoolSize); err != nil {
		log.Printf("[WARN] Failed to start Redis-WebSocket bridge: %v", err)
	} else {
		log.Println("[OK] Redis-WebSocket bridge started successfully")
	}
	
	log.Println("[OK] WebSocket components initialized successfully")
}

// StartWebSocketServer starts the WebSocket server in a goroutine
// Should be called after container initialization
func (c *Container) StartWebSocketServer() {
	if c.WebSocketServer == nil {
		log.Println("[INFO] WebSocket server not initialized, skipping")
		return
	}
	
	go func() {
		log.Println("[INFO] Starting WebSocket server")
		if err := c.WebSocketServer.Start(); err != nil {
			log.Printf("[ERROR] WebSocket server error: %v", err)
		}
	}()
}

// StartMetricsScheduler starts the metrics recording scheduler
func (c *Container) StartMetricsScheduler() {
	if c.MetricsScheduler == nil {
		log.Println("[WARN] [MetricsScheduler] Metrics scheduler not initialized, skipping")
		return
	}
	
	config := metrics.DefaultConfig()
	if err := c.MetricsScheduler.Start(config); err != nil {
		log.Printf("[ERROR] [MetricsScheduler] Failed to start metrics scheduler: %v", err)
		return
	}
	
	log.Printf("[OK] [MetricsScheduler] Metrics scheduler started successfully (recording_interval=%v, cleanup_interval=%v, retention_days=%v)",
		config.RecordingInterval, config.CleanupInterval, config.RetentionDays)
}

// Cleanup performs cleanup operations
// Implements Phase 3 - Task 3.3.3: Graceful shutdown in reverse order
func (c *Container) Cleanup() {
	log.Println("[INFO] Starting cleanup...")
	
	// Stop MetricsScheduler first
	if c.MetricsScheduler != nil {
		log.Println("[INFO] Stopping metrics scheduler...")
		if err := c.MetricsScheduler.Stop(); err != nil {
			log.Printf("[ERROR] Error stopping metrics scheduler: %v", err)
		}
	}
	
	// Stop WebSocket server
	if c.WebSocketServer != nil {
		if err := c.WebSocketServer.Shutdown(); err != nil {
			log.Printf("[ERROR] Failed to shutdown WebSocket server: %v", err)
		}
	}
	
	// Stop Redis bridge
	if c.RedisBridge != nil {
		if err := c.RedisBridge.Stop(); err != nil {
			log.Printf("[ERROR] Failed to stop Redis bridge: %v", err)
		}
	}
	
	// Stop Redis Pub/Sub
	if c.RedisPubSub != nil {
		if err := c.RedisPubSub.Stop(); err != nil {
			log.Printf("[ERROR] Failed to stop Redis Pub/Sub: %v", err)
		}
	}
	
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
	
	log.Println("[OK] Cleanup complete")
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
