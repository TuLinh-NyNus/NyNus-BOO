package auth_mgmt

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	authService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
)

type IAuthService interface {
	Login(db database.QueryExecer, email, password string) (*entity.User, string, error)
	Register(db database.QueryExecer, email, password, firstName, lastName string) (*entity.User, error)
	ValidateToken(tokenString string) (*authService.Claims, error)
	IsAdmin(db database.QueryExecer, userID string) (bool, error)
	IsTeacherOrAdmin(db database.QueryExecer, userID string) (bool, error)
	IsStudent(db database.QueryExecer, userID string) (bool, error)
	GetUserRole(db database.QueryExecer, userID string) (string, error)
}

type AuthMgmt struct {
	DB          database.QueryExecer
	AuthService IAuthService
}

func NewAuthMgmt(db database.QueryExecer, jwtSecret string) *AuthMgmt {
	return &AuthMgmt{
		DB:          db,
		AuthService: authService.NewAuthService(jwtSecret),
	}
}
