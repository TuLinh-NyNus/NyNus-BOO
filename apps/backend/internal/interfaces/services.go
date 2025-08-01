package interfaces

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user"
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

// UserServiceInterface defines the contract for user operations
// This allows other services to access user functionality
type UserServiceInterface interface {
	GetAll(requestorUserID string) ([]entity.User, error)
	GetByID(userID string, requestorUserID string) (*entity.User, error)
	Create(req user.CreateRequest, requestorUserID string) (*entity.User, error)
	Update(userID string, req user.UpdateRequest, requestorUserID string) (*entity.User, error)
	Delete(userID string, requestorUserID string) error
	GetProfile(userID string) (*entity.User, error)
	
	// Additional methods for cross-service usage
	GetUsersByRole(role string, requestorUserID string) ([]entity.User, error)
	ValidateUserExists(userID string) (bool, error)
	GetUserBasicInfo(userID string) (*entity.User, error) // No auth check, for internal use
}

// QuestionServiceInterface defines the contract for question operations
type QuestionServiceInterface interface {
	// TODO: Add question service methods
	GetByID(questionID string, requestorUserID string) (*entity.Question, error)
	GetAll(requestorUserID string) ([]entity.Question, error)
	Create(req interface{}, requestorUserID string) (*entity.Question, error)
	Update(questionID string, req interface{}, requestorUserID string) (*entity.Question, error)
	Delete(questionID string, requestorUserID string) error
	
	// Cross-service methods
	GetQuestionsByCreator(creatorID string, requestorUserID string) ([]entity.Question, error)
	ValidateQuestionExists(questionID string) (bool, error)
}

// ExamServiceInterface defines the contract for exam operations
type ExamServiceInterface interface {
	// TODO: Add exam service methods
	GetByID(examID string, requestorUserID string) (*entity.Exam, error)
	GetAll(requestorUserID string) ([]entity.Exam, error)
	Create(req interface{}, requestorUserID string) (*entity.Exam, error)
	Update(examID string, req interface{}, requestorUserID string) (*entity.Exam, error)
	Delete(examID string, requestorUserID string) error
	
	// Cross-service methods
	GetExamsByCreator(creatorID string, requestorUserID string) ([]entity.Exam, error)
	GetExamsByStudent(studentID string, requestorUserID string) ([]entity.Exam, error)
	ValidateExamExists(examID string) (bool, error)
}

// ServiceContainer holds all service interfaces for dependency injection
type ServiceContainer struct {
	AuthService     AuthServiceInterface
	UserService     UserServiceInterface
	QuestionService QuestionServiceInterface
	ExamService     ExamServiceInterface
}

// ServiceDependencies defines what services each service needs
type ServiceDependencies struct {
	// AuthService dependencies (minimal - no other services)
	AuthRepo interface{}
	
	// UserService dependencies
	UserRepo    interface{}
	AuthService AuthServiceInterface
	
	// QuestionService dependencies
	QuestionRepo interface{}
	AuthService  AuthServiceInterface
	UserService  UserServiceInterface
	
	// ExamService dependencies
	ExamRepo        interface{}
	AuthService     AuthServiceInterface
	UserService     UserServiceInterface
	QuestionService QuestionServiceInterface
}
