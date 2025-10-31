package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"

	"exam-bank-system/apps/backend/internal/config"
	"exam-bank-system/apps/backend/internal/container"
	"exam-bank-system/apps/backend/internal/migration"
	"exam-bank-system/apps/backend/internal/seeder"
	"exam-bank-system/apps/backend/internal/server"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	_ "github.com/lib/pq"
	grpcServer "google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

// App represents the application
type App struct {
	config     *config.Config
	container  *container.Container
	db         *sql.DB
	grpcServer *grpcServer.Server
	httpServer *server.HTTPServer
}

// NewApp creates a new application instance
func NewApp(cfg *config.Config) (*App, error) {
	app := &App{
		config: cfg,
	}

	// Initialize database
	if err := app.initDatabase(); err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Initialize dependency container
	app.container = container.NewContainer(app.db, cfg.JWT.Secret, cfg)

	// Initialize gRPC server
	if err := app.initGRPCServer(); err != nil {
		return nil, fmt.Errorf("failed to initialize gRPC server: %w", err)
	}

	return app, nil
}

// initDatabase initializes the database connection
func (a *App) initDatabase() error {
	connStr := a.config.GetDatabaseConnectionString()

	var err error
	a.db, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err := a.db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Configure optimized connection pool based on environment
	if config.IsProduction() {
		// Production settings - optimized for high concurrency and stability
		a.db.SetMaxOpenConns(50)     // Increased for production load
		a.db.SetMaxIdleConns(20)     // Higher idle connections for faster response
		a.db.SetConnMaxLifetime(600) // 10 minutes for production stability
		a.db.SetConnMaxIdleTime(120) // 2 minutes idle time for better resource utilization
		log.Println("[CONFIG] Database connection pool optimized for production")
	} else {
		// Development settings - conservative resource usage
		a.db.SetMaxOpenConns(25)     // Standard development setting
		a.db.SetMaxIdleConns(10)     // Lower idle connections for development
		a.db.SetConnMaxLifetime(300) // 5 minutes for development
		a.db.SetConnMaxIdleTime(60)  // 1 minute idle time for development
		log.Println("[CONFIG] Database connection pool configured for development")
	}

	log.Printf("[OK] Connected to PostgreSQL: %s@%s:%s/%s",
		a.config.Database.User,
		a.config.Database.Host,
		a.config.Database.Port,
		a.config.Database.Name,
	)

	// Run migrations
	if err := a.runMigrations(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Seed default data
	// if err := a.seedDefaultData(); err != nil {
	// 	return fmt.Errorf("failed to seed default data: %w", err)
	// }

	return nil
}

// initGRPCServer initializes the gRPC server with all services and interceptors
func (a *App) initGRPCServer() error {
	// Get all interceptors in the correct order:
	// 1. Rate Limit (first to prevent abuse)
	// 2. CSRF (validate CSRF token before authentication)
	// 3. Auth (authenticate user)
	// 4. Session (validate session)
	// 5. Role Level (authorize based on role/level)
	// 6. Resource Protection (track and validate resource access)
	// 7. Audit Log (log after authorization)
	interceptors := a.container.GetAllInterceptors()

	// Create gRPC server with chained interceptors
	a.grpcServer = grpcServer.NewServer(
		grpcServer.ChainUnaryInterceptor(
			interceptors.RateLimit.Unary(),
			interceptors.CSRF.Unary(), // NEW: CSRF protection
			interceptors.Auth.Unary(),
			interceptors.Session.Unary(),
			interceptors.RoleLevel.Unary(),
			interceptors.ResourceProtection.UnaryInterceptor,
			interceptors.AuditLog.Unary(),
		),
	)

	// Register services
	// Use Enhanced User Service with OAuth support instead of basic User Service
	v1.RegisterUserServiceServer(a.grpcServer, a.container.GetEnhancedUserGRPCService())
	v1.RegisterQuestionServiceServer(a.grpcServer, a.container.GetQuestionGRPCService())
	v1.RegisterQuestionFilterServiceServer(a.grpcServer, a.container.GetQuestionFilterGRPCService())
	v1.RegisterExamServiceServer(a.grpcServer, a.container.GetExamGRPCService())
	v1.RegisterProfileServiceServer(a.grpcServer, a.container.GetProfileGRPCService())
	v1.RegisterAdminServiceServer(a.grpcServer, a.container.GetAdminGRPCService())
	v1.RegisterSecurityServiceServer(a.grpcServer, a.container.GetSecurityGRPCService()) // NEW: Security & Token Management
	v1.RegisterContactServiceServer(a.grpcServer, a.container.GetContactGRPCService())
	v1.RegisterNewsletterServiceServer(a.grpcServer, a.container.GetNewsletterGRPCService())
	v1.RegisterBookServiceServer(a.grpcServer, a.container.GetBookGRPCService())
	v1.RegisterLibraryServiceServer(a.grpcServer, a.container.GetLibraryGRPCService())
	v1.RegisterNotificationServiceServer(a.grpcServer, a.container.GetNotificationGRPCService())
	v1.RegisterMapCodeServiceServer(a.grpcServer, a.container.GetMapCodeGRPCService())
	v1.RegisterAnalyticsServiceServer(a.grpcServer, a.container.GetAnalyticsGRPCService())
	v1.RegisterFocusRoomServiceServer(a.grpcServer, a.container.GetFocusRoomGRPCService()) // NEW: Focus Room service

	// Enable reflection for grpcurl
	reflection.Register(a.grpcServer)

	return nil
}

// Run starts the application
func (a *App) Run() error {
	// Log production settings
	config.LogProductionSettings(a.config.Production)

	// Validate production configuration
	if err := config.ValidateProductionConfig(a.config.Production); err != nil {
		log.Printf("[WARNING] Production config validation warning: %v", err)
	}

	// Start WebSocket server if enabled (Phase 3 - Integration)
	if a.config.Redis.Enabled && a.config.Redis.PubSubEnabled {
		a.container.StartWebSocketServer()
		log.Printf("[OK] WebSocket server started on port %s",
			getEnvOrDefault("WEBSOCKET_PORT", "8081"))
	} else {
		log.Println("[INFO] WebSocket/Pub/Sub disabled")
	}

	// Start Metrics Scheduler (records metrics every 5 minutes)
	a.container.StartMetricsScheduler()
	log.Println("[OK] Metrics scheduler started (recording interval: 5 minutes, retention: 30 days)")

	// Start MapCode event listener for cache invalidation
	a.container.MapCodeMgmt.StartEventListener(context.Background())
	log.Println("[OK] MapCode event listener started for cross-instance cache invalidation")

	// Conditionally start HTTP server based on production settings
	if a.config.Production.HTTPGatewayEnabled {
		// Initialize HTTP server with gRPC-Gateway and gRPC-Web support
		a.httpServer = server.NewHTTPServer(a.config.Server.HTTPPort, a.config.Server.GRPCPort, a.grpcServer)

		// Start HTTP server in a goroutine
		go func() {
			if err := a.httpServer.Start(); err != nil {
				log.Printf("[ERROR] HTTP server error: %v", err)
			}
		}()

		log.Printf("[OK] HTTP Gateway + gRPC-Web enabled on port %s", a.config.Server.HTTPPort)
	} else {
		log.Println("[INFO] HTTP Gateway disabled for production security")
	}

	// Create gRPC listener
	log.Printf("[gRPC] Creating TCP listener on port %s...", a.config.Server.GRPCPort)
	lis, err := net.Listen("tcp", ":"+a.config.Server.GRPCPort)
	if err != nil {
		log.Printf("[ERROR] Failed to create listener on port %s: %v", a.config.Server.GRPCPort, err)
		return fmt.Errorf("failed to listen on port %s: %w", a.config.Server.GRPCPort, err)
	}
	log.Printf("[OK] TCP listener created successfully on port %s", a.config.Server.GRPCPort)

	// Log startup information
	log.Println("[INFO] Logging startup information...")
	a.logStartupInfo()
	log.Println("[OK] Startup information logged")

	// Start gRPC server (BLOCKING CALL)
	log.Printf("[STARTUP] Starting gRPC server on port %s...", a.config.Server.GRPCPort)
	log.Println("[INFO] This is a BLOCKING call - server will run until stopped")
	if err := a.grpcServer.Serve(lis); err != nil {
		log.Printf("[ERROR] gRPC server stopped with error: %v", err)
		return fmt.Errorf("failed to serve gRPC server: %w", err)
	}

	// This should NEVER be reached during normal operation
	log.Println("[WARNING] gRPC server stopped without error - this is unexpected!")
	return nil
}

// logStartupInfo logs application startup information
func (a *App) logStartupInfo() {
	log.Println("[STARTUP] Exam Bank System gRPC Server starting...")
	log.Printf("[INFO] gRPC Server listening on :%s", a.config.Server.GRPCPort)
	log.Println("[INFO] Database: PostgreSQL")
	log.Println("[INFO] gRPC Services:")
	log.Println("   - UserService (Login, Register, GetUser, ListUsers)")
	log.Println("   - QuestionService (CreateQuestion, GetQuestion, ListQuestions, ImportQuestions)")
	log.Println("   - QuestionFilterService (ListQuestionsByFilter, SearchQuestions, GetQuestionsByQuestionCode)")
	log.Println("   - ExamService (CreateExam, GetExam, ListExams) [Basic Implementation]")
	log.Println("   - BookService (ListBooks, GetBook, CreateBook, UpdateBook, DeleteBook, IncrementDownloadCount)")
	log.Println("   - LibraryService (ListItems, GetItem, CreateItem, UpdateItem, DownloadItem) [Books only]")
	log.Println("[INFO] Security:")
	log.Println("   - JWT Authentication enabled")
	log.Println("   - Role-based authorization (student, teacher, admin)")
	log.Println("[INFO] Public endpoints:")
	log.Println("   - v1.UserService/Login")
	log.Println("   - v1.UserService/Register")
	log.Println("[INFO] Protected endpoints:")
	log.Println("   - v1.UserService/GetUser (own profile or admin/teacher)")
	log.Println("   - v1.UserService/ListUsers (admin/teacher only)")
}

// Shutdown gracefully shuts down the application
func (a *App) Shutdown() {
	log.Println("[SHUTDOWN] Shutting down application...")

	if a.grpcServer != nil {
		log.Println("[SHUTDOWN] Stopping gRPC server...")
		a.grpcServer.GracefulStop()
	}

	if a.httpServer != nil {
		log.Println("[SHUTDOWN] Stopping HTTP server...")
		// Note: In production, you might want to add context with timeout
		a.httpServer.Stop(nil)
	}

	if a.container != nil {
		log.Println("[CLEANUP] Cleaning up dependencies...")
		a.container.Cleanup()
	}

	log.Println("[OK] Application shutdown complete")
}

// GetContainer returns the dependency injection container
func (a *App) GetContainer() *container.Container {
	return a.container
}

// GetConfig returns the application configuration
func (a *App) GetConfig() *config.Config {
	return a.config
}

// runMigrations runs database migrations on startup
func (a *App) runMigrations() error {
	// Get migrations directory path (relative to project root)
	migrationsDir := filepath.Join("internal", "database", "migrations")

	// Create migrator
	migrator := migration.NewMigrator(a.db, migrationsDir)

	// Run migrations
	return migrator.RunMigrations()
}

// seedDefaultData seeds the database with default users and sample data
func (a *App) seedDefaultData() error {
	// Create seeder
	seeder := seeder.NewSeeder(a.db)

	// Seed default users
	if err := seeder.SeedDefaultData(); err != nil {
		return err
	}

	// Seed sample data for development (optional)
	if a.config.Server.Environment == "development" {
		if err := seeder.SeedSampleData(); err != nil {
			log.Printf("[WARNING] Failed to seed sample data: %v", err)
			// Don't fail startup for sample data issues
		}
	}

	return nil
}

// getEnvOrDefault gets environment variable or returns default
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
