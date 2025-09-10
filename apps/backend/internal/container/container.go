package container

import (
	"database/sql"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/grpc"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
	question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question"
	question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"
	user_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/user"
)

// Container holds all dependencies
type Container struct {
	// Database
	DB *sql.DB

	// Repositories
	UserRepo   *repository.UserRepository
	AnswerRepo *repository.AnswerRepository

	// Services
	AuthMgmt           *auth_mgmt.AuthMgmt
	UserMgmt           *user_mgmt.UserMgmt
	QuestionMgmt       *question_mgmt.QuestionMgmt
	QuestionFilterMgmt *question_filter_mgmt.QuestionFilterMgmt

	// Middleware
	AuthInterceptor *middleware.AuthInterceptor

	// gRPC Services
	UserGRPCService           *grpc.UserServiceServer
	QuestionGRPCService       *grpc.QuestionServiceServer
	QuestionFilterGRPCService *grpc.QuestionFilterServiceServer

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
	c.UserRepo = &repository.UserRepository{}
	c.AnswerRepo = &repository.AnswerRepository{}
}

// initServices initializes all service dependencies
func (c *Container) initServices() {
	// Auth management service following the new clean pattern
	c.AuthMgmt = auth_mgmt.NewAuthMgmt(c.DB, c.JWTSecret)

	// Initialize UserMgmt with database connection
	c.UserMgmt = user_mgmt.NewUserMgmt(c.DB)

	// Initialize QuestionMgmt with database connection
	c.QuestionMgmt = question_mgmt.NewQuestionMgmt(c.DB)

	// Initialize QuestionFilterMgmt with database connection
	c.QuestionFilterMgmt = question_filter_mgmt.NewQuestionFilterMgmt(c.DB)
}

// initMiddleware initializes all middleware dependencies
func (c *Container) initMiddleware() {
	c.AuthInterceptor = middleware.NewAuthInterceptor(c.AuthMgmt)
}

// initGRPCServices initializes all gRPC service dependencies
func (c *Container) initGRPCServices() {
	c.UserGRPCService = grpc.NewUserServiceServer(c.UserMgmt, c.AuthMgmt)
	c.QuestionGRPCService = grpc.NewQuestionServiceServer(c.QuestionMgmt)
	c.QuestionFilterGRPCService = grpc.NewQuestionFilterServiceServer(c.QuestionFilterMgmt)
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

// Cleanup performs cleanup operations
func (c *Container) Cleanup() {
	if c.DB != nil {
		c.DB.Close()
	}
}
