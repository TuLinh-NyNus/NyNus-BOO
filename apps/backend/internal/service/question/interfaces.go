package question

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
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

	// Cross-service methods
	GetQuestionsByCreator(creatorID string, requestorUserID string) ([]entity.Question, error)
	ValidateQuestionExists(questionID string) (bool, error)
}
