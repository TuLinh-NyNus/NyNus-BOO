package interfaces

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
)

// AuthServiceInterface defines the contract for authentication operations
// This allows other services to depend on auth functionality
type AuthServiceInterface interface {
	Login(email, password string) (*entity.User, string, error)
	Register(email, password, firstName, lastName string) (*entity.User, error)
	ValidateToken(tokenString string) (*auth.Claims, error)
	IsAdmin(userID string) (bool, error)
	IsTeacherOrAdmin(userID string) (bool, error)
	IsStudent(userID string) (bool, error)
	GetUserRole(userID string) (string, error)
}

// UserServiceInterface defines the contract for user management operations
// This follows the new pattern: Service Management Layer → Domain Service Layer → Repository Layer
type UserServiceInterface interface {
	// User management operations with pagination
	GetUser(ctx context.Context, userID string) (user entity.User, err error)
	ListUsers(offset int, limit int) (total int, users []entity.User, err error)
	GetStudentByPaging(offset int, limit int) (total int, users []entity.User, err error)
}

// QuestionServiceInterface defines the contract for question management operations
// This follows the new pattern: Service Management Layer → Domain Service Layer → Repository Layer
type QuestionServiceInterface interface {
	// Question management operations with pagination
	GetQuestion(ctx context.Context, questionID string) (question entity.Question, err error)
	ListQuestions(offset int, limit int) (total int, questions []entity.Question, err error)
	CreateQuestion(ctx context.Context, question *entity.Question) error
	UpdateQuestion(ctx context.Context, question *entity.Question) error
	DeleteQuestion(ctx context.Context, questionID string) error
}

// ExamServiceInterface defines the contract for exam management operations
// This follows the new pattern: Service Management Layer → Domain Service Layer → Repository Layer
type ExamServiceInterface interface {
	// Exam management operations with pagination
	GetExam(ctx context.Context, examID string) (exam entity.Exam, err error)
	ListExams(offset int, limit int) (total int, exams []entity.Exam, err error)
	CreateExam(ctx context.Context, exam *entity.Exam) error
	UpdateExam(ctx context.Context, exam *entity.Exam) error
	DeleteExam(ctx context.Context, examID string) error
}

// ServiceContainer holds all service interfaces for dependency injection
type ServiceContainer struct {
	AuthService     AuthServiceInterface
	UserService     UserServiceInterface
	QuestionService QuestionServiceInterface
	ExamService     ExamServiceInterface
}

// ServiceDependencies defines what services each service needs following the new pattern
type ServiceDependencies struct {
	// Repository dependencies for domain services
	AuthRepo     interface{}
	UserRepo     interface{}
	QuestionRepo interface{}
	ExamRepo     interface{}

	// Service dependencies for cross-service communication
	AuthService     AuthServiceInterface
	UserService     UserServiceInterface
	QuestionService QuestionServiceInterface
}
