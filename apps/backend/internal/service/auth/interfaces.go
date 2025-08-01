package auth

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ✅ ĐÚNG: Interface nhỏ, tập trung theo use case để tránh circular dependency

// IUserRepositoryForAuth - Interface for authentication operations
type IUserRepositoryForAuth interface {
	Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
	GetByEmail(email string) (*entity.User, error)
	GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
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
