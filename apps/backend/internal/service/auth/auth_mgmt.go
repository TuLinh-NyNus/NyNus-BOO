package auth

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// AuthMgmt provides management layer for auth operations
// This consolidates functionality from service_mgmt/auth
type AuthMgmt struct {
	DB          database.QueryExecer
	AuthService AuthService
}

// NewAuthMgmt creates a new auth management service
func NewAuthMgmt(db database.QueryExecer, jwtSecret string) *AuthMgmt {
	authService := NewAuthServiceWithDB(db, jwtSecret)
	return &AuthMgmt{
		DB:          db,
		AuthService: authService,
	}
}

// Login authenticates a user and returns a JWT token
func (a *AuthMgmt) Login(email, password string) (*entity.User, string, error) {
	ctx := context.Background()
	return a.AuthService.Login(ctx, email, password)
}

// Register creates a new user account
func (a *AuthMgmt) Register(email, password, firstName, lastName string) (*entity.User, error) {
	ctx := context.Background()
	return a.AuthService.Register(ctx, email, password, firstName, lastName)
}

// ValidateToken validates a JWT token and returns claims
func (a *AuthMgmt) ValidateToken(tokenString string) (*Claims, error) {
	return a.AuthService.ValidateToken(tokenString)
}

// IsAdmin checks if user has admin role
func (a *AuthMgmt) IsAdmin(userID string) (bool, error) {
	ctx := context.Background()
	return a.AuthService.IsAdmin(ctx, userID)
}

// IsTeacherOrAdmin checks if user has teacher or admin role
func (a *AuthMgmt) IsTeacherOrAdmin(userID string) (bool, error) {
	ctx := context.Background()
	return a.AuthService.IsTeacherOrAdmin(ctx, userID)
}

// IsStudent checks if user has student role
func (a *AuthMgmt) IsStudent(userID string) (bool, error) {
	ctx := context.Background()
	return a.AuthService.IsStudent(ctx, userID)
}

// GetUserRole returns the user's role
func (a *AuthMgmt) GetUserRole(userID string) (string, error) {
	ctx := context.Background()
	return a.AuthService.GetUserRole(ctx, userID)
}

// OAuth Operations
func (a *AuthMgmt) HandleOAuthCallback(provider, code string) (*entity.User, error) {
	return a.AuthService.HandleOAuthCallback(provider, code)
}

func (a *AuthMgmt) GetOAuthURL(provider string) string {
	return a.AuthService.GetOAuthURL(provider)
}

// Session Management
func (a *AuthMgmt) CreateSession(userID, ipAddress, userAgent string) (*SessionInfo, error) {
	ctx := context.Background()
	return a.AuthService.CreateSession(ctx, userID, ipAddress, userAgent)
}

func (a *AuthMgmt) ValidateSession(sessionID string) (*SessionInfo, error) {
	ctx := context.Background()
	return a.AuthService.ValidateSession(ctx, sessionID)
}

func (a *AuthMgmt) InvalidateSession(sessionID string) error {
	ctx := context.Background()
	return a.AuthService.InvalidateSession(ctx, sessionID)
}

// Token Management
func (a *AuthMgmt) GenerateJWT(userID string) (string, error) {
	return a.AuthService.GenerateJWT(userID)
}

func (a *AuthMgmt) RefreshToken(token string) (string, error) {
	return a.AuthService.RefreshToken(token)
}
