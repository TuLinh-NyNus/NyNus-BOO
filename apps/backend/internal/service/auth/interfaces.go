package auth

import "exam-bank-system/backend/internal/entity"

// RepositoryInterface defines the contract for user data access needed by auth
type RepositoryInterface interface {
	GetByEmail(email string) (*entity.User, error)
	GetByID(id string) (*entity.User, error)
	Create(user *entity.User) error
}

// ServiceInterface defines the contract for authentication operations
type ServiceInterface interface {
	Login(email, password string) (*entity.User, string, error)
	Register(email, password, firstName, lastName string) (*entity.User, error)
	ValidateToken(tokenString string) (*Claims, error)
	IsAdmin(userID string) (bool, error)
	IsTeacherOrAdmin(userID string) (bool, error)
}
