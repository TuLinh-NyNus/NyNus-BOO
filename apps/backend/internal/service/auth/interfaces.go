package auth

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// RepositoryInterface defines the contract for user data access needed by auth
type RepositoryInterface interface {
	// Context-aware methods (preferred)
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)

	// Legacy methods for backward compatibility
	GetByEmail(email string) (*entity.User, error)
}

// ServiceInterface defines the contract for authentication operations
type ServiceInterface interface {
	Login(email, password string) (*entity.User, string, error)
	Register(email, password, firstName, lastName string) (*entity.User, error)
	ValidateToken(tokenString string) (*Claims, error)
	IsAdmin(userID string) (bool, error)
	IsTeacherOrAdmin(userID string) (bool, error)
	IsStudent(userID string) (bool, error)
	GetUserRole(userID string) (string, error)
}
