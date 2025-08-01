package user

import "exam-bank-system/backend/internal/entity"

// RepositoryInterface defines the contract for user data access
type RepositoryInterface interface {
	GetAll() ([]entity.User, error)
	GetByID(id string) (*entity.User, error)
	GetByEmail(email string) (*entity.User, error)
	Create(user *entity.User) error
	Update(user *entity.User) error
	Delete(id string) error
}
