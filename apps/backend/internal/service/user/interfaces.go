package user

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// RepositoryInterface defines the contract for user data access
type RepositoryInterface interface {
	// Context-aware methods (preferred)
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByIDForUpdate(ctx context.Context, id string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id string) error

	// Legacy methods for backward compatibility
	GetAll() ([]entity.User, error)
	GetByEmail(email string) (*entity.User, error)
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
