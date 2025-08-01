package question

import (
	"exam-bank-system/backend/internal/entity"
	"exam-bank-system/backend/internal/service/auth"
)

// RepositoryInterface defines the contract for question data access
type RepositoryInterface interface {
	GetAll() ([]entity.Question, error)
	GetByID(id string) (*entity.Question, error)
	Create(question *entity.Question) error
	Update(question *entity.Question) error
	Delete(id string) error
}

// ServiceInterface defines the contract for question business operations
type ServiceInterface interface {
	GetAll(requestorUserID string) ([]entity.Question, error)
	GetByID(questionID string, requestorUserID string) (*entity.Question, error)
	Create(question *entity.Question, requestorUserID string) (*entity.Question, error)
	Update(questionID string, question *entity.Question, requestorUserID string) (*entity.Question, error)
	Delete(questionID string, requestorUserID string) error
}

// Service handles question business logic
type Service struct {
	repo        RepositoryInterface
	authService auth.ServiceInterface
}

// NewService creates a new question service
func NewService(repo RepositoryInterface, authService auth.ServiceInterface) *Service {
	return &Service{
		repo:        repo,
		authService: authService,
	}
}
