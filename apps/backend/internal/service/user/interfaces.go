package user

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ✅ ĐÚNG: Interface nhỏ, tập trung theo use case để tránh circular dependency

// IUserRepositoryForCreateUser - Interface for user creation operations
type IUserRepositoryForCreateUser interface {
	Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
	GetByEmail(email string) (*entity.User, error) // Check if email exists
}

// IUserRepositoryForGetUser - Interface for user retrieval operations
type IUserRepositoryForGetUser interface {
	GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
	GetAll() ([]entity.User, error)
	GetByRole(role string) ([]entity.User, error)
}

// IUserRepositoryForUpdateUser - Interface for user update operations
type IUserRepositoryForUpdateUser interface {
	GetByIDForUpdate(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
	Update(ctx context.Context, db database.QueryExecer, user *entity.User) error
}

// IUserRepositoryForDeleteUser - Interface for user deletion operations
type IUserRepositoryForDeleteUser interface {
	GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
	Delete(ctx context.Context, db database.QueryExecer, id string) error
}

// IUserRepositoryForAuth - Interface for authentication operations
type IUserRepositoryForAuth interface {
	Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
	GetByEmail(email string) (*entity.User, error)
	GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
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
