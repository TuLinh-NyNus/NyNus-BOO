package auth

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
	old_auth "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
)

// AuthMgmtAdapter adapts new AuthMgmt to old auth_mgmt.AuthMgmt interface
// This is a temporary adapter to maintain compatibility with existing middleware
type AuthMgmtAdapter struct {
	authMgmt *AuthMgmt
}

// NewAuthMgmtAdapter creates a new adapter
func NewAuthMgmtAdapter(authMgmt *AuthMgmt) *AuthMgmtAdapter {
	return &AuthMgmtAdapter{
		authMgmt: authMgmt,
	}
}

// Implement auth_mgmt.IAuthService interface
func (a *AuthMgmtAdapter) Login(db database.QueryExecer, email, password string) (*entity.User, string, error) {
	return a.authMgmt.Login(email, password)
}

func (a *AuthMgmtAdapter) Register(db database.QueryExecer, email, password, firstName, lastName string) (*entity.User, error) {
	return a.authMgmt.Register(email, password, firstName, lastName)
}

func (a *AuthMgmtAdapter) ValidateToken(tokenString string) (*old_auth.Claims, error) {
	claims, err := a.authMgmt.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	// Convert new Claims to old Claims
	oldClaims := &old_auth.Claims{
		UserID: claims.UserID,
		Email:  claims.Email,
		Role:   claims.Role,
		RegisteredClaims: claims.RegisteredClaims,
	}

	return oldClaims, nil
}

func (a *AuthMgmtAdapter) IsAdmin(db database.QueryExecer, userID string) (bool, error) {
	return a.authMgmt.IsAdmin(userID)
}

func (a *AuthMgmtAdapter) IsTeacherOrAdmin(db database.QueryExecer, userID string) (bool, error) {
	return a.authMgmt.IsTeacherOrAdmin(userID)
}

func (a *AuthMgmtAdapter) IsStudent(db database.QueryExecer, userID string) (bool, error) {
	return a.authMgmt.IsStudent(userID)
}

func (a *AuthMgmtAdapter) GetUserRole(db database.QueryExecer, userID string) (string, error) {
	return a.authMgmt.GetUserRole(userID)
}

// CreateLegacyAuthMgmt creates a legacy auth_mgmt.AuthMgmt compatible instance
func CreateLegacyAuthMgmt(authMgmt *AuthMgmt) *auth_mgmt.AuthMgmt {
	adapter := NewAuthMgmtAdapter(authMgmt)
	
	// Create a legacy AuthMgmt instance with the adapter
	return &auth_mgmt.AuthMgmt{
		DB:          authMgmt.DB,
		AuthService: adapter,
	}
}
