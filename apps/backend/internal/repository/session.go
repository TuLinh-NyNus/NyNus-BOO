package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/util"
	"exam-bank-system/apps/backend/pkg/proto/common"
	"github.com/sirupsen/logrus"
)

var (
	// ErrSessionNotFound is returned when session is not found
	ErrSessionNotFound = errors.New("session not found")
)

// Validation helpers are now in validation.go to avoid duplication

func validateSessionToken(token string) error {
	if token == "" {
		return fmt.Errorf("session token cannot be empty")
	}
	if len(token) < 16 {
		return fmt.Errorf("session token too short: minimum 16 characters")
	}
	return nil
}

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
	// Admin methods for monitoring all sessions
	GetAllActiveSessions(ctx context.Context, limit, offset int) ([]*Session, error)
	GetAllSessionsCount(ctx context.Context) (int, error)
	SearchSessions(ctx context.Context, query string, limit, offset int) ([]*Session, error)
}

// EmailVerificationToken represents email verification token
type EmailVerificationToken struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt time.Time
	Used      bool
	CreatedAt time.Time
}

// PasswordResetToken represents password reset token
type PasswordResetToken struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt time.Time
	Used      bool
	CreatedAt time.Time
}

// IUserRepository interface with enhanced methods
type IUserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByGoogleID(ctx context.Context, googleID string) (*User, error)
	GetByUsername(ctx context.Context, username string) (*User, error)
	GetAll(ctx context.Context) ([]*User, error)
	// GetUsersWithFilters retrieves users with database-level filtering and pagination
	// Returns: users slice, total count, error
	GetUsersWithFilters(ctx context.Context, filters UserFilters, offset, limit int) ([]*User, int, error)
	Update(ctx context.Context, user *User) error
	UpdateGoogleID(ctx context.Context, userID, googleID string) error
	UpdateAvatar(ctx context.Context, userID, avatar string) error
	UpdateLastLogin(ctx context.Context, userID, ipAddress string) error
	IncrementLoginAttempts(ctx context.Context, userID string) error
	ResetLoginAttempts(ctx context.Context, userID string) error
	LockAccount(ctx context.Context, userID string, until time.Time) error
	Delete(ctx context.Context, id string) error

	// Email verification token methods
	CreateEmailVerificationToken(ctx context.Context, token *EmailVerificationToken) error
	GetEmailVerificationToken(ctx context.Context, token string) (*EmailVerificationToken, error)
	MarkEmailVerificationTokenUsed(ctx context.Context, token string) error
	DeleteExpiredEmailVerificationTokens(ctx context.Context) error

	// Password reset token methods
	CreatePasswordResetToken(ctx context.Context, token *PasswordResetToken) error
	GetPasswordResetToken(ctx context.Context, token string) (*PasswordResetToken, error)
	MarkPasswordResetTokenUsed(ctx context.Context, token string) error
	DeleteExpiredPasswordResetTokens(ctx context.Context) error
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
	db     database.QueryExecer
	logger *logrus.Logger
}

// NewSessionRepository creates a new session repository with logger injection
func NewSessionRepository(db database.QueryExecer, logger *logrus.Logger) SessionRepository {
	// Create default logger if not provided
	if logger == nil {
		logger = logrus.New()
		logger.SetLevel(logrus.InfoLevel)
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
			FieldMap: logrus.FieldMap{
				logrus.FieldKeyTime:  "timestamp",
				logrus.FieldKeyLevel: "level",
				logrus.FieldKeyMsg:   "message",
			},
		})
	}

	return &sessionRepository{
		db:     db,
		logger: logger,
	}
}

// CreateSession creates a new session
func (r *sessionRepository) CreateSession(ctx context.Context, session *Session) error {
	// Validate input
	if err := validateUserID(session.UserID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "CreateSession",
			"user_id":   session.UserID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateSessionToken(session.SessionToken); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "CreateSession",
			"user_id":   session.UserID,
		}).Error("Invalid session token format")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Generate ID and timestamp if not provided
	session.ID = util.ULIDNow()
	session.CreatedAt = time.Now()

	r.logger.WithFields(logrus.Fields{
		"operation":   "CreateSession",
		"session_id":  session.ID,
		"user_id":     session.UserID,
		"ip_address":  session.IPAddress,
		"expires_at":  session.ExpiresAt,
	}).Info("Creating new session")

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
		r.logger.WithFields(logrus.Fields{
			"operation":  "CreateSession",
			"session_id": session.ID,
			"user_id":    session.UserID,
		}).WithError(err).Error("Failed to create session")
		return fmt.Errorf("failed to create session: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "CreateSession",
		"session_id": session.ID,
		"user_id":    session.UserID,
	}).Info("Session created successfully")

	return nil
}

// GetByID gets a session by ID
func (r *sessionRepository) GetByID(ctx context.Context, id string) (*Session, error) {
	// Validate input
	if err := validateSessionID(id); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "GetByID",
			"session_id": id,
		}).Error("Invalid session ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "GetByID",
		"session_id": id,
	}).Debug("Fetching session by ID")

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
			r.logger.WithFields(logrus.Fields{
				"operation":  "GetByID",
				"session_id": id,
			}).Warn("Session not found")
			return nil, ErrSessionNotFound
		}
		r.logger.WithFields(logrus.Fields{
			"operation":  "GetByID",
			"session_id": id,
		}).WithError(err).Error("Failed to get session by ID")
		return nil, fmt.Errorf("failed to get session by ID: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "GetByID",
		"session_id": session.ID,
		"user_id":    session.UserID,
		"is_active":  session.IsActive,
	}).Debug("Session fetched successfully")

	return session, nil
}

// GetByToken gets a session by token
func (r *sessionRepository) GetByToken(ctx context.Context, token string) (*Session, error) {
	// Validate input
	if err := validateSessionToken(token); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByToken",
		}).Error("Invalid session token format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByToken",
	}).Debug("Fetching session by token")

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
			r.logger.WithFields(logrus.Fields{
				"operation": "GetByToken",
			}).Warn("Session not found")
			return nil, ErrSessionNotFound
		}
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByToken",
		}).WithError(err).Error("Failed to get session by token")
		return nil, fmt.Errorf("failed to get session by token: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "GetByToken",
		"session_id": session.ID,
		"user_id":    session.UserID,
		"is_active":  session.IsActive,
	}).Debug("Session fetched successfully")

	return session, nil
}

// GetUserSessions gets all sessions for a user
func (r *sessionRepository) GetUserSessions(ctx context.Context, userID string) ([]*Session, error) {
	// Validate input
	if err := validateUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetUserSessions",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetUserSessions",
		"user_id":   userID,
	}).Debug("Fetching all user sessions")

	query := `
		SELECT id, user_id, session_token, ip_address, user_agent,
			   device_fingerprint, location, is_active, last_activity,
			   expires_at, created_at
		FROM user_sessions
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetUserSessions",
			"user_id":   userID,
		}).WithError(err).Error("Failed to get user sessions")
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
			r.logger.WithFields(logrus.Fields{
				"operation": "GetUserSessions",
				"user_id":   userID,
			}).WithError(err).Error("Failed to scan session")
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":      "GetUserSessions",
		"user_id":        userID,
		"session_count":  len(sessions),
	}).Debug("User sessions fetched successfully")

	return sessions, nil
}

// GetActiveSessions gets active sessions for a user
func (r *sessionRepository) GetActiveSessions(ctx context.Context, userID string) ([]*Session, error) {
	// Validate input
	if err := validateUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetActiveSessions",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetActiveSessions",
		"user_id":   userID,
	}).Debug("Fetching active sessions")

	query := `
		SELECT id, user_id, session_token, ip_address, user_agent,
			   device_fingerprint, location, is_active, last_activity,
			   expires_at, created_at
		FROM user_sessions
		WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetActiveSessions",
			"user_id":   userID,
		}).WithError(err).Error("Failed to get active sessions")
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
			r.logger.WithFields(logrus.Fields{
				"operation": "GetActiveSessions",
				"user_id":   userID,
			}).WithError(err).Error("Failed to scan session")
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":      "GetActiveSessions",
		"user_id":        userID,
		"session_count":  len(sessions),
	}).Debug("Active sessions fetched successfully")

	return sessions, nil
}

// GetExpiredSessions gets all expired sessions
func (r *sessionRepository) GetExpiredSessions(ctx context.Context) ([]*Session, error) {
	r.logger.WithFields(logrus.Fields{
		"operation": "GetExpiredSessions",
	}).Debug("Fetching expired sessions")

	query := `
		SELECT id, user_id, session_token, ip_address, user_agent,
			   device_fingerprint, location, is_active, last_activity,
			   expires_at, created_at
		FROM user_sessions
		WHERE is_active = true AND expires_at <= NOW()`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetExpiredSessions",
		}).WithError(err).Error("Failed to get expired sessions")
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
			r.logger.WithFields(logrus.Fields{
				"operation": "GetExpiredSessions",
			}).WithError(err).Error("Failed to scan session")
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":      "GetExpiredSessions",
		"session_count":  len(sessions),
	}).Info("Expired sessions fetched successfully")

	return sessions, nil
}

// UpdateLastActivity updates the last activity time and extends expiry (sliding window)
func (r *sessionRepository) UpdateLastActivity(ctx context.Context, sessionID string) error {
	// Validate input
	if err := validateSessionID(sessionID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "UpdateLastActivity",
			"session_id": sessionID,
		}).Error("Invalid session ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "UpdateLastActivity",
		"session_id": sessionID,
	}).Debug("Updating session last activity")

	// Update both last_activity and expires_at to implement 24h sliding window
	query := `
		UPDATE user_sessions
		SET
			last_activity = NOW(),
			expires_at = NOW() + INTERVAL '24 hours'
		WHERE id = $1 AND is_active = true`

	result, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "UpdateLastActivity",
			"session_id": sessionID,
		}).WithError(err).Error("Failed to update last activity")
		return fmt.Errorf("failed to update last activity: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		r.logger.WithFields(logrus.Fields{
			"operation":  "UpdateLastActivity",
			"session_id": sessionID,
		}).Warn("Session not found or inactive")
		return ErrSessionNotFound
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "UpdateLastActivity",
		"session_id": sessionID,
	}).Debug("Session activity updated successfully")

	return nil
}

// TerminateSession marks a session as inactive
func (r *sessionRepository) TerminateSession(ctx context.Context, sessionID string) error {
	// Validate input
	if err := validateSessionID(sessionID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "TerminateSession",
			"session_id": sessionID,
		}).Error("Invalid session ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "TerminateSession",
		"session_id": sessionID,
	}).Info("Terminating session")

	query := `UPDATE user_sessions SET is_active = false WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "TerminateSession",
			"session_id": sessionID,
		}).WithError(err).Error("Failed to terminate session")
		return fmt.Errorf("failed to terminate session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		r.logger.WithFields(logrus.Fields{
			"operation":  "TerminateSession",
			"session_id": sessionID,
		}).Warn("Session not found")
		return ErrSessionNotFound
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "TerminateSession",
		"session_id": sessionID,
	}).Info("Session terminated successfully")

	return nil
}

// DeleteSession deletes a session
func (r *sessionRepository) DeleteSession(ctx context.Context, sessionID string) error {
	// Validate input
	if err := validateSessionID(sessionID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "DeleteSession",
			"session_id": sessionID,
		}).Error("Invalid session ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "DeleteSession",
		"session_id": sessionID,
	}).Warn("Deleting session")

	query := `DELETE FROM user_sessions WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "DeleteSession",
			"session_id": sessionID,
		}).WithError(err).Error("Failed to delete session")
		return fmt.Errorf("failed to delete session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		r.logger.WithFields(logrus.Fields{
			"operation":  "DeleteSession",
			"session_id": sessionID,
		}).Warn("Session not found")
		return ErrSessionNotFound
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "DeleteSession",
		"session_id": sessionID,
	}).Warn("Session deleted successfully")

	return nil
}

// GetAllActiveSessions gets all active sessions across all users (admin only)
func (r *sessionRepository) GetAllActiveSessions(ctx context.Context, limit, offset int) ([]*Session, error) {
	r.logger.WithFields(logrus.Fields{
		"operation": "GetAllActiveSessions",
		"limit":     limit,
		"offset":    offset,
	}).Debug("Fetching all active sessions")

	query := `
		SELECT id, user_id, session_token, ip_address, user_agent,
			   device_fingerprint, location, is_active, last_activity,
			   expires_at, created_at
		FROM user_sessions
		WHERE is_active = true AND expires_at > NOW()
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetAllActiveSessions",
		}).WithError(err).Error("Failed to get all active sessions")
		return nil, fmt.Errorf("failed to get all active sessions: %w", err)
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
			r.logger.WithFields(logrus.Fields{
				"operation": "GetAllActiveSessions",
			}).WithError(err).Error("Failed to scan session")
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":     "GetAllActiveSessions",
		"session_count": len(sessions),
	}).Debug("All active sessions fetched successfully")

	return sessions, nil
}

// GetAllSessionsCount gets total count of active sessions
func (r *sessionRepository) GetAllSessionsCount(ctx context.Context) (int, error) {
	r.logger.WithFields(logrus.Fields{
		"operation": "GetAllSessionsCount",
	}).Debug("Counting all active sessions")

	query := `
		SELECT COUNT(*)
		FROM user_sessions
		WHERE is_active = true AND expires_at > NOW()`

	var count int
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetAllSessionsCount",
		}).WithError(err).Error("Failed to count sessions")
		return 0, fmt.Errorf("failed to count sessions: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetAllSessionsCount",
		"count":     count,
	}).Debug("Session count retrieved successfully")

	return count, nil
}

// SearchSessions searches sessions by user email, IP address, or location
func (r *sessionRepository) SearchSessions(ctx context.Context, query string, limit, offset int) ([]*Session, error) {
	r.logger.WithFields(logrus.Fields{
		"operation": "SearchSessions",
		"query":     query,
		"limit":     limit,
		"offset":    offset,
	}).Debug("Searching sessions")

	searchQuery := `
		SELECT s.id, s.user_id, s.session_token, s.ip_address, s.user_agent,
			   s.device_fingerprint, s.location, s.is_active, s.last_activity,
			   s.expires_at, s.created_at
		FROM user_sessions s
		JOIN users u ON s.user_id = u.id
		WHERE s.is_active = true
			AND s.expires_at > NOW()
			AND (
				u.email ILIKE $1
				OR s.ip_address ILIKE $1
				OR s.location ILIKE $1
			)
		ORDER BY s.created_at DESC
		LIMIT $2 OFFSET $3`

	searchPattern := "%" + query + "%"
	rows, err := r.db.QueryContext(ctx, searchQuery, searchPattern, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "SearchSessions",
			"query":     query,
		}).WithError(err).Error("Failed to search sessions")
		return nil, fmt.Errorf("failed to search sessions: %w", err)
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
			r.logger.WithFields(logrus.Fields{
				"operation": "SearchSessions",
			}).WithError(err).Error("Failed to scan session")
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":     "SearchSessions",
		"query":         query,
		"session_count": len(sessions),
	}).Debug("Sessions search completed successfully")

	return sessions, nil
}

