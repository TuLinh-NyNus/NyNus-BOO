package user

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// RepositoryInterface defines the contract for user data access
type RepositoryInterface interface {
	GetAll() ([]entity.User, error)
	GetByID(id string) (*entity.User, error)
	GetByEmail(email string) (*entity.User, error)
	Create(user *entity.User) error
	Update(user *entity.User) error
	Delete(id string) error
	GetByRole(role string) ([]entity.User, error)
}

// CreateRequest represents a user creation request
type CreateRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role,omitempty"` // Only admins can set this
}

// UpdateRequest represents a user update request
type UpdateRequest struct {
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Role      *string `json:"role,omitempty"` // Only admins can set this
	IsActive  *bool   `json:"is_active,omitempty"`
}
