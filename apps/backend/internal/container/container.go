package container

import (
	"database/sql"

	"exam-bank-system/backend/internal/grpc"
	"exam-bank-system/backend/internal/middleware"
	"exam-bank-system/backend/internal/repository"
	"exam-bank-system/backend/internal/service/auth"
	"exam-bank-system/backend/internal/service/user"
)

// Container holds all dependencies
type Container struct {
	// Database
	DB *sql.DB

	// Repositories
	UserRepo     *repository.UserRepository
	QuestionRepo *repository.QuestionRepository
	AnswerRepo   *repository.AnswerRepository

	// Services
	AuthService *auth.Service
	UserService *user.Service

	// Middleware
	AuthInterceptor *middleware.AuthInterceptor

	// gRPC Services
	UserGRPCService *grpc.UserServiceServer

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
	c.UserRepo = repository.NewUserRepository(c.DB)
	c.QuestionRepo = repository.NewQuestionRepository(c.DB)
	c.AnswerRepo = repository.NewAnswerRepository(c.DB)
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	c.AuthService = auth.NewService(c.UserRepo, c.JWTSecret)
	c.UserService = user.NewService(c.UserRepo, c.AuthService)
}

// initMiddleware initializes all middleware dependencies
func (c *Container) initMiddleware() {
	c.AuthInterceptor = middleware.NewAuthInterceptor(c.AuthService)
}

// initGRPCServices initializes all gRPC service dependencies
func (c *Container) initGRPCServices() {
	c.UserGRPCService = grpc.NewUserServiceServer(c.UserService, c.AuthService)
}

// GetUserRepository returns the user repository
func (c *Container) GetUserRepository() *repository.UserRepository {
	return c.UserRepo
}

// GetQuestionRepository returns the question repository
func (c *Container) GetQuestionRepository() *repository.QuestionRepository {
	return c.QuestionRepo
}

// GetAnswerRepository returns the answer repository
func (c *Container) GetAnswerRepository() *repository.AnswerRepository {
	return c.AnswerRepo
}

// GetAuthService returns the auth service
func (c *Container) GetAuthService() *auth.Service {
	return c.AuthService
}

// GetUserService returns the user service
func (c *Container) GetUserService() *user.Service {
	return c.UserService
}

// GetAuthInterceptor returns the auth interceptor
func (c *Container) GetAuthInterceptor() *middleware.AuthInterceptor {
	return c.AuthInterceptor
}

// GetUserGRPCService returns the user gRPC service
func (c *Container) GetUserGRPCService() *grpc.UserServiceServer {
	return c.UserGRPCService
}

// Cleanup performs cleanup operations
func (c *Container) Cleanup() {
	if c.DB != nil {
		c.DB.Close()
	}
}
