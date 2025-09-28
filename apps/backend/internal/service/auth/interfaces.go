package auth

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
)

// AuthService defines the consolidated authentication service interface
// This merges functionality from domain_service/auth and service_mgmt/auth
type AuthService interface {
	// Authentication Operations
	Login(ctx context.Context, email, password string) (*entity.User, string, error)
	Register(ctx context.Context, email, password, firstName, lastName string) (*entity.User, error)
	
	// Token Management
	ValidateToken(tokenString string) (*Claims, error)
	GenerateJWT(userID string) (string, error)
	RefreshToken(token string) (string, error)
	
	// Authorization Operations
	IsAdmin(ctx context.Context, userID string) (bool, error)
	IsTeacherOrAdmin(ctx context.Context, userID string) (bool, error)
	IsStudent(ctx context.Context, userID string) (bool, error)
	GetUserRole(ctx context.Context, userID string) (string, error)
	
	// OAuth Operations
	HandleOAuthCallback(provider, code string) (*entity.User, error)
	GetOAuthURL(provider string) string
	
	// Session Management
	CreateSession(ctx context.Context, userID, ipAddress, userAgent string) (*SessionInfo, error)
	ValidateSession(ctx context.Context, sessionID string) (*SessionInfo, error)
	InvalidateSession(ctx context.Context, sessionID string) error
}

// SessionInfo represents session information (placeholder for entity.Session)
type SessionInfo struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}

// AuthRepository defines the repository interface for auth operations
type AuthRepository interface {
	// User operations
	CreateUser(ctx context.Context, db database.QueryExecer, user *entity.User) error
	GetUserByEmail(ctx context.Context, db database.QueryExecer, email string) (*entity.User, error)
	GetUserByID(ctx context.Context, db database.QueryExecer, id string) (*entity.User, error)
	UpdateUser(ctx context.Context, db database.QueryExecer, user *entity.User) error
	
	// Session operations
	CreateSession(ctx context.Context, db database.QueryExecer, session *SessionInfo) error
	GetSession(ctx context.Context, db database.QueryExecer, sessionID string) (*SessionInfo, error)
	UpdateSession(ctx context.Context, db database.QueryExecer, session *SessionInfo) error
	DeleteSession(ctx context.Context, db database.QueryExecer, sessionID string) error

	// OAuth operations
	CreateOAuthAccount(ctx context.Context, db database.QueryExecer, account *OAuthAccountInfo) error
	GetOAuthAccount(ctx context.Context, db database.QueryExecer, provider, providerID string) (*OAuthAccountInfo, error)
}

// OAuthAccountInfo represents OAuth account information (placeholder for entity.OAuthAccount)
type OAuthAccountInfo struct {
	ID         string `json:"id"`
	UserID     string `json:"user_id"`
	Provider   string `json:"provider"`
	ProviderID string `json:"provider_id"`
	Email      string `json:"email"`
	CreatedAt  string `json:"created_at"`
}
