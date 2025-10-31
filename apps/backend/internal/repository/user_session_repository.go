package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/sirupsen/logrus"
)

// UserSessionRepository handles database operations for user sessions
type UserSessionRepository struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewUserSessionRepository creates a new user session repository
func NewUserSessionRepository(db *sql.DB, logger *logrus.Logger) *UserSessionRepository {
	return &UserSessionRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates a new user session
func (r *UserSessionRepository) Create(ctx context.Context, session *entity.UserSession) error {
	// Generate UUID if not provided
	if session.ID.Status == pgtype.Undefined {
		var uuidVal uuid.UUID
		uuidVal = uuid.New()
		session.ID = pgtype.UUID{Bytes: uuidVal, Status: pgtype.Present}
	}

	// Set defaults
	now := time.Now()
	if session.IsActive.Status == pgtype.Undefined {
		session.IsActive = pgtype.Bool{Bool: true, Status: pgtype.Present}
	}
	session.CreatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}
	session.LastActivityAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}

	query := `
		INSERT INTO user_sessions (
			id, user_id, session_token, refresh_token_hash, device_fingerprint,
			ip_address, user_agent, location, is_active, last_activity_at,
			created_at, expires_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err := r.db.ExecContext(ctx, query,
		session.ID,
		session.UserID,
		session.SessionToken,
		session.RefreshTokenHash,
		session.DeviceFingerprint,
		session.IPAddress,
		session.UserAgent,
		session.Location,
		session.IsActive,
		session.LastActivityAt,
		session.CreatedAt,
		session.ExpiresAt,
	)

	if err != nil {
		r.logger.WithError(err).Error("Failed to create user session")
		return fmt.Errorf("failed to create user session: %w", err)
	}

	return nil
}

// FindBySessionToken retrieves a session by session token
func (r *UserSessionRepository) FindBySessionToken(ctx context.Context, sessionToken string) (*entity.UserSession, error) {
	query := `
		SELECT id, user_id, session_token, refresh_token_hash, device_fingerprint,
			ip_address, user_agent, location, is_active, last_activity_at,
			created_at, expires_at, invalidated_at, invalidation_reason
		FROM user_sessions
		WHERE session_token = $1
	`

	session := &entity.UserSession{}
	_, ptrs := session.FieldMap()

	err := r.db.QueryRowContext(ctx, query, sessionToken).Scan(ptrs...)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found")
	}
	if err != nil {
		r.logger.WithError(err).Error("Failed to find session")
		return nil, fmt.Errorf("failed to find session: %w", err)
	}

	return session, nil
}

// FindActiveByUserID retrieves all active sessions for a user
func (r *UserSessionRepository) FindActiveByUserID(ctx context.Context, userID string) ([]*entity.UserSession, error) {
	query := `
		SELECT id, user_id, session_token, refresh_token_hash, device_fingerprint,
			ip_address, user_agent, location, is_active, last_activity_at,
			created_at, expires_at, invalidated_at, invalidation_reason
		FROM user_sessions
		WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
		ORDER BY last_activity_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		r.logger.WithError(err).Error("Failed to query active sessions")
		return nil, fmt.Errorf("failed to query active sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*entity.UserSession
	for rows.Next() {
		session := &entity.UserSession{}
		_, ptrs := session.FieldMap()
		if err := rows.Scan(ptrs...); err != nil {
			r.logger.WithError(err).Error("Failed to scan session")
			continue
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// UpdateLastActivity updates the last activity timestamp
func (r *UserSessionRepository) UpdateLastActivity(ctx context.Context, sessionToken string) error {
	query := `
		UPDATE user_sessions
		SET last_activity_at = $1
		WHERE session_token = $2 AND is_active = true
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), sessionToken)
	if err != nil {
		r.logger.WithError(err).Error("Failed to update session activity")
		return fmt.Errorf("failed to update session activity: %w", err)
	}

	return nil
}

// Invalidate invalidates a specific session
func (r *UserSessionRepository) Invalidate(ctx context.Context, sessionToken, reason string) error {
	query := `
		UPDATE user_sessions
		SET is_active = false, invalidated_at = $1, invalidation_reason = $2
		WHERE session_token = $3
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), reason, sessionToken)
	if err != nil {
		r.logger.WithError(err).Error("Failed to invalidate session")
		return fmt.Errorf("failed to invalidate session: %w", err)
	}

	return nil
}

// InvalidateAllByUserID invalidates all sessions for a user
func (r *UserSessionRepository) InvalidateAllByUserID(ctx context.Context, userID, reason string) (int, error) {
	query := `
		UPDATE user_sessions
		SET is_active = false, invalidated_at = $1, invalidation_reason = $2
		WHERE user_id = $3 AND is_active = true
	`

	result, err := r.db.ExecContext(ctx, query, time.Now(), reason, userID)
	if err != nil {
		r.logger.WithError(err).Error("Failed to invalidate all user sessions")
		return 0, fmt.Errorf("failed to invalidate all user sessions: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	return int(rowsAffected), nil
}

// InvalidateByID invalidates a session by ID
func (r *UserSessionRepository) InvalidateByID(ctx context.Context, sessionID, reason string) error {
	query := `
		UPDATE user_sessions
		SET is_active = false, invalidated_at = $1, invalidation_reason = $2
		WHERE id = $3
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), reason, sessionID)
	if err != nil {
		r.logger.WithError(err).Error("Failed to invalidate session by ID")
		return fmt.Errorf("failed to invalidate session by ID: %w", err)
	}

	return nil
}

// CleanupExpiredSessions marks expired sessions as inactive
func (r *UserSessionRepository) CleanupExpiredSessions(ctx context.Context) (int, error) {
	query := `
		UPDATE user_sessions
		SET is_active = false, invalidated_at = $1, invalidation_reason = 'EXPIRED'
		WHERE expires_at < $1 AND is_active = true
	`

	result, err := r.db.ExecContext(ctx, query, time.Now())
	if err != nil {
		r.logger.WithError(err).Error("Failed to cleanup expired sessions")
		return 0, fmt.Errorf("failed to cleanup expired sessions: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	return int(rowsAffected), nil
}

// CountActiveSessionsByUserID counts active sessions for a user
func (r *UserSessionRepository) CountActiveSessionsByUserID(ctx context.Context, userID string) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM user_sessions
		WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
	`

	var count int
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		r.logger.WithError(err).Error("Failed to count active sessions")
		return 0, fmt.Errorf("failed to count active sessions: %w", err)
	}

	return count, nil
}



