package auth

import (
	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/entity"
	"os"
)

// DEPRECATED: IAuthService interface is no longer needed
// All authentication functionality has been consolidated into EnhancedUserServiceServer
// This interface is kept temporarily for backward compatibility during migration

type IAuthService interface {
	Login(db database.QueryExecer, email, password string) (*entity.User, string, error)
	Register(db database.QueryExecer, email, password, firstName, lastName string) (*entity.User, error)
	ValidateToken(tokenString string) (*UnifiedClaims, error)
	IsAdmin(db database.QueryExecer, userID string) (bool, error)
	IsTeacherOrAdmin(db database.QueryExecer, userID string) (bool, error)
	IsStudent(db database.QueryExecer, userID string) (bool, error)
	GetUserRole(db database.QueryExecer, userID string) (string, error)
}

// DEPRECATED: AuthMgmt is being phased out in favor of direct gRPC service usage
// This struct is kept temporarily for backward compatibility during migration
type AuthMgmt struct {
	DB          database.QueryExecer
	AuthService IAuthService
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// DEPRECATED: NewAuthMgmt is being phased out
// Use EnhancedUserServiceServer directly for all authentication operations
func NewAuthMgmt(db database.QueryExecer, jwtService IJWTService) *AuthMgmt {
	return &AuthMgmt{
		DB:          db,
		AuthService: NewAuthServiceWithJWT(jwtService),
	}
}

