package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
)

var (
	// ErrSessionNotFound is returned when session is not found
	ErrSessionNotFound = errors.New("session not found")
)

// Session represents a user session
type Session struct {
	ID                string
	UserID            string
	SessionToken      string
	IPAddress         string
	UserAgent         string
	DeviceFingerprint string
	Location          string
	IsActive          bool
	LastActivity      time.Time
	ExpiresAt         time.Time
	CreatedAt         time.Time
}

// User represents a user entity
type User struct {
	ID                    string
	Email                 string
	PasswordHash          string
	FirstName             string
	LastName              string
	Role                  common.UserRole
	IsActive              bool
	Status                string
	GoogleID              string
	Username              string
	Avatar                string
	Bio                   string
	Phone                 string
	Address               string
	School                string
	DateOfBirth           *time.Time
	Gender                string
	Level                 int
	MaxConcurrentSessions int
	EmailVerified         bool
	LastLoginAt           *time.Time
	LastLoginIP           string
	LoginAttempts         int
	LockedUntil           *time.Time
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

// OAuthAccount represents an OAuth account
type OAuthAccount struct {
	ID                string
	UserID            string
	Provider          string
	ProviderAccountID string
	Type              string
	Scope             string
	AccessToken       string
	RefreshToken      string
	IDToken           string
	ExpiresAt         *int64
	TokenType         string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// SessionRepository handles session database operations
type SessionRepository interface {
	CreateSession(ctx context.Context, session *Session) error
	GetByID(ctx context.Context, id string) (*Session, error)
	GetByToken(ctx context.Context, token string) (*Session, error)
	GetUserSessions(ctx context.Context, userID string) ([]*Session, error)
	GetActiveSessions(ctx context.Context, userID string) ([]*Session, error)
	GetExpiredSessions(ctx context.Context) ([]*Session, error)
	UpdateLastActivity(ctx context.Context, sessionID string) error
	TerminateSession(ctx context.Context, sessionID string) error
	DeleteSession(ctx context.Context, sessionID string) error
}

// IUserRepository interface with enhanced methods
type IUserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByGoogleID(ctx context.Context, googleID string) (*User, error)
	GetByUsername(ctx context.Context, username string) (*User, error)
	Update(ctx context.Context, user *User) error
	UpdateGoogleID(ctx context.Context, userID, googleID string) error
	UpdateAvatar(ctx context.Context, userID, avatar string) error
	UpdateLastLogin(ctx context.Context, userID, ipAddress string) error
	IncrementLoginAttempts(ctx context.Context, userID string) error
	ResetLoginAttempts(ctx context.Context, userID string) error
	LockAccount(ctx context.Context, userID string, until time.Time) error
	Delete(ctx context.Context, id string) error
}

// OAuthAccountRepository handles OAuth account database operations
type OAuthAccountRepository interface {
	Create(ctx context.Context, account *OAuthAccount) error
	GetByProviderAccountID(ctx context.Context, provider, providerAccountID string) (*OAuthAccount, error)
	GetByUserID(ctx context.Context, userID string) ([]*OAuthAccount, error)
	Update(ctx context.Context, account *OAuthAccount) error
	Upsert(ctx context.Context, account *OAuthAccount) error
	Delete(ctx context.Context, id string) error
}

// sessionRepository implementation
type sessionRepository struct {
	db database.QueryExecer
}

// NewSessionRepository creates a new session repository
func NewSessionRepository(db database.QueryExecer) SessionRepository {
	return &sessionRepository{db: db}
}

// CreateSession creates a new session
func (r *sessionRepository) CreateSession(ctx context.Context, session *Session) error {
	session.ID = util.ULIDNow()
	session.CreatedAt = time.Now()
	
	query := `
		INSERT INTO user_sessions (
			id, user_id, session_token, ip_address, user_agent, 
			device_fingerprint, location, is_active, last_activity, 
			expires_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err := r.db.ExecContext(ctx, query,
		session.ID,
		session.UserID,
		session.SessionToken,
		session.IPAddress,
		session.UserAgent,
		session.DeviceFingerprint,
		session.Location,
		session.IsActive,
		session.LastActivity,
		session.ExpiresAt,
		session.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}

	return nil
}

// GetByID gets a session by ID
func (r *sessionRepository) GetByID(ctx context.Context, id string) (*Session, error) {
	query := `
		SELECT id, user_id, session_token, ip_address, user_agent, 
			   device_fingerprint, location, is_active, last_activity, 
			   expires_at, created_at
		FROM user_sessions
		WHERE id = $1`

	session := &Session{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&session.ID,
		&session.UserID,
		&session.SessionToken,
		&session.IPAddress,
		&session.UserAgent,
		&session.DeviceFingerprint,
		&session.Location,
		&session.IsActive,
		&session.LastActivity,
		&session.ExpiresAt,
		&session.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to get session by ID: %w", err)
	}

	return session, nil
}

// GetByToken gets a session by token
func (r *sessionRepository) GetByToken(ctx context.Context, token string) (*Session, error) {
	query := `
		SELECT id, user_id, session_token, ip_address, user_agent, 
			   device_fingerprint, location, is_active, last_activity, 
			   expires_at, created_at
		FROM user_sessions
		WHERE session_token = $1`

	session := &Session{}
	err := r.db.QueryRowContext(ctx, query, token).Scan(
		&session.ID,
		&session.UserID,
		&session.SessionToken,
		&session.IPAddress,
		&session.UserAgent,
		&session.DeviceFingerprint,
		&session.Location,
		&session.IsActive,
		&session.LastActivity,
		&session.ExpiresAt,
		&session.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to get session by token: %w", err)
	}

	return session, nil
}

// GetUserSessions gets all sessions for a user
func (r *sessionRepository) GetUserSessions(ctx context.Context, userID string) ([]*Session, error) {
	query := `
		SELECT id, user_id, session_token, ip_address, user_agent, 
			   device_fingerprint, location, is_active, last_activity, 
			   expires_at, created_at
		FROM user_sessions
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*Session
	for rows.Next() {
		session := &Session{}
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.SessionToken,
			&session.IPAddress,
			&session.UserAgent,
			&session.DeviceFingerprint,
			&session.Location,
			&session.IsActive,
			&session.LastActivity,
			&session.ExpiresAt,
			&session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// GetActiveSessions gets active sessions for a user
func (r *sessionRepository) GetActiveSessions(ctx context.Context, userID string) ([]*Session, error) {
	query := `
		SELECT id, user_id, session_token, ip_address, user_agent, 
			   device_fingerprint, location, is_active, last_activity, 
			   expires_at, created_at
		FROM user_sessions
		WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*Session
	for rows.Next() {
		session := &Session{}
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.SessionToken,
			&session.IPAddress,
			&session.UserAgent,
			&session.DeviceFingerprint,
			&session.Location,
			&session.IsActive,
			&session.LastActivity,
			&session.ExpiresAt,
			&session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// GetExpiredSessions gets all expired sessions
func (r *sessionRepository) GetExpiredSessions(ctx context.Context) ([]*Session, error) {
	query := `
		SELECT id, user_id, session_token, ip_address, user_agent, 
			   device_fingerprint, location, is_active, last_activity, 
			   expires_at, created_at
		FROM user_sessions
		WHERE is_active = true AND expires_at <= NOW()`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get expired sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*Session
	for rows.Next() {
		session := &Session{}
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.SessionToken,
			&session.IPAddress,
			&session.UserAgent,
			&session.DeviceFingerprint,
			&session.Location,
			&session.IsActive,
			&session.LastActivity,
			&session.ExpiresAt,
			&session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// UpdateLastActivity updates the last activity time of a session
func (r *sessionRepository) UpdateLastActivity(ctx context.Context, sessionID string) error {
	query := `UPDATE user_sessions SET last_activity = NOW() WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("failed to update last activity: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrSessionNotFound
	}

	return nil
}

// TerminateSession marks a session as inactive
func (r *sessionRepository) TerminateSession(ctx context.Context, sessionID string) error {
	query := `UPDATE user_sessions SET is_active = false WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("failed to terminate session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrSessionNotFound
	}

	return nil
}

// DeleteSession deletes a session
func (r *sessionRepository) DeleteSession(ctx context.Context, sessionID string) error {
	query := `DELETE FROM user_sessions WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrSessionNotFound
	}

	return nil
}