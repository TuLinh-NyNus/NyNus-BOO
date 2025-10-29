package exam

import (
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/service/auth"
)

// RepositoryInterface defines the contract for exam data access
type RepositoryInterface interface {
	GetAll() ([]entity.Exam, error)
	GetByID(id string) (*entity.Exam, error)
	Create(exam *entity.Exam) error
	Update(exam *entity.Exam) error
	Delete(id string) error
}

// AttemptRepositoryInterface defines the contract for exam attempt data access
type AttemptRepositoryInterface interface {
	GetByID(id string) (*entity.ExamAttempt, error)
	GetByUserID(userID string) ([]entity.ExamAttempt, error)
	GetByExamID(examID string) ([]entity.ExamAttempt, error)
	Create(attempt *entity.ExamAttempt) error
	Update(attempt *entity.ExamAttempt) error
	Delete(id string) error
}

// ServiceInterface defines the contract for exam business operations
type ServiceInterface interface {
	GetAll(requestorUserID string) ([]entity.Exam, error)
	GetByID(examID string, requestorUserID string) (*entity.Exam, error)
	Create(exam *entity.Exam, requestorUserID string) (*entity.Exam, error)
	Update(examID string, exam *entity.Exam, requestorUserID string) (*entity.Exam, error)
	Delete(examID string, requestorUserID string) error
	StartExam(examID string, userID string) (*entity.ExamAttempt, error)
	SubmitExam(attemptID string, answers map[string]string, userID string) (*entity.ExamAttempt, error)
}

// Service handles exam business logic
type Service struct {
	repo        RepositoryInterface
	attemptRepo AttemptRepositoryInterface
	authService *auth.AuthService
}

// NewService creates a new exam service
func NewService(repo RepositoryInterface, attemptRepo AttemptRepositoryInterface, authService *auth.AuthService) *Service {
	return &Service{
		repo:        repo,
		attemptRepo: attemptRepo,
		authService: authService,
	}
}

