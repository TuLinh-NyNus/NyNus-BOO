package app

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"path/filepath"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/config"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/container"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/migration"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/seeder"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/server"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"

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
	app.container = container.NewContainer(app.db, cfg.JWT.Secret)

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

	log.Printf("✅ Connected to PostgreSQL: %s@%s:%s/%s",
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
	// Create gRPC server with interceptors
	a.grpcServer = grpcServer.NewServer(
		grpcServer.UnaryInterceptor(a.container.GetAuthInterceptor().Unary()),
	)

	// Register services
	v1.RegisterUserServiceServer(a.grpcServer, a.container.GetUserGRPCService())
	v1.RegisterQuestionServiceServer(a.grpcServer, a.container.GetQuestionGRPCService())
	v1.RegisterQuestionFilterServiceServer(a.grpcServer, a.container.GetQuestionFilterGRPCService())

	// Enable reflection for grpcurl
	reflection.Register(a.grpcServer)

	return nil
}

// Run starts the application
func (a *App) Run() error {
	// Initialize HTTP server with gRPC-Gateway
	a.httpServer = server.NewHTTPServer(a.config.Server.HTTPPort, a.config.Server.GRPCPort)

	// Start HTTP server in a goroutine
	go func() {
		if err := a.httpServer.Start(); err != nil {
			log.Printf("❌ HTTP server error: %v", err)
		}
	}()

	// Create gRPC listener
	lis, err := net.Listen("tcp", ":"+a.config.Server.GRPCPort)
	if err != nil {
		return fmt.Errorf("failed to listen on port %s: %w", a.config.Server.GRPCPort, err)
	}

	// Log startup information
	a.logStartupInfo()

	// Start gRPC server
	log.Printf("🚀 Starting gRPC server on port %s...", a.config.Server.GRPCPort)
	if err := a.grpcServer.Serve(lis); err != nil {
		return fmt.Errorf("failed to serve gRPC server: %w", err)
	}

	return nil
}

// logStartupInfo logs application startup information
func (a *App) logStartupInfo() {
	log.Println("🚀 Exam Bank System gRPC Server starting...")
	log.Printf("📍 gRPC Server listening on :%s", a.config.Server.GRPCPort)
	log.Println("🗄️ Database: PostgreSQL")
	log.Println("🌐 gRPC Services:")
	log.Println("   - UserService (Login, Register, GetUser, ListUsers)")
	log.Println("   - QuestionService (CreateQuestion, GetQuestion, ListQuestions, ImportQuestions)")
	log.Println("   - QuestionFilterService (ListQuestionsByFilter, SearchQuestions, GetQuestionsByQuestionCode)")
	log.Println("🔐 Security:")
	log.Println("   - JWT Authentication enabled")
	log.Println("   - Role-based authorization (student, teacher, admin)")
	log.Println("📋 Public endpoints:")
	log.Println("   - v1.UserService/Login")
	log.Println("   - v1.UserService/Register")
	log.Println("🔒 Protected endpoints:")
	log.Println("   - v1.UserService/GetUser (own profile or admin/teacher)")
	log.Println("   - v1.UserService/ListUsers (admin/teacher only)")
}

// Shutdown gracefully shuts down the application
func (a *App) Shutdown() {
	log.Println("🛑 Shutting down application...")

	if a.grpcServer != nil {
		log.Println("🔌 Stopping gRPC server...")
		a.grpcServer.GracefulStop()
	}

	if a.httpServer != nil {
		log.Println("🔌 Stopping HTTP server...")
		// Note: In production, you might want to add context with timeout
		a.httpServer.Stop(nil)
	}

	if a.container != nil {
		log.Println("🧹 Cleaning up dependencies...")
		a.container.Cleanup()
	}

	log.Println("✅ Application shutdown complete")
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
	migrationsDir := filepath.Join("..", "..", "packages", "database", "migrations")

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
			log.Printf("⚠️  Warning: Failed to seed sample data: %v", err)
			// Don't fail startup for sample data issues
		}
	}

	return nil
}
