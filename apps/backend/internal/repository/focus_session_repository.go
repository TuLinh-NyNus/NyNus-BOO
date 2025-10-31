package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// FocusSessionRepository implements the FocusSessionRepository interface
type FocusSessionRepository struct {
	db *sql.DB
}

// NewFocusSessionRepository creates a new focus session repository instance
func NewFocusSessionRepository(db *sql.DB) interfaces.FocusSessionRepository {
	return &FocusSessionRepository{db: db}
}

// Create creates a new focus session
func (r *FocusSessionRepository) Create(ctx context.Context, session *entity.FocusSession) error {
	query := `
		INSERT INTO focus_sessions (
			id, user_id, room_id, duration_seconds, session_type,
			subject_tag, task_description, completed, started_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	// Generate ID if not provided
	if session.ID == uuid.Nil {
		session.ID = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	session.CreatedAt = now
	if session.StartedAt.IsZero() {
		session.StartedAt = now
	}

	_, err := r.db.ExecContext(
		ctx,
		query,
		session.ID,
		session.UserID,
		session.RoomID,
		session.DurationSeconds,
		session.SessionType,
		session.SubjectTag,
		session.TaskDescription,
		session.Completed,
		session.StartedAt,
		session.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create focus session: %w", err)
	}

	return nil
}

// GetByID retrieves a focus session by ID
func (r *FocusSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.FocusSession, error) {
	query := `
		SELECT id, user_id, room_id, duration_seconds, session_type,
		       subject_tag, task_description, completed, started_at, ended_at, created_at
		FROM focus_sessions
		WHERE id = $1
	`

	var session entity.FocusSession
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&session.ID,
		&session.UserID,
		&session.RoomID,
		&session.DurationSeconds,
		&session.SessionType,
		&session.SubjectTag,
		&session.TaskDescription,
		&session.Completed,
		&session.StartedAt,
		&session.EndedAt,
		&session.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("focus session not found: %w", err)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get focus session: %w", err)
	}

	return &session, nil
}

// GetActiveSession retrieves the active session for a user
func (r *FocusSessionRepository) GetActiveSession(ctx context.Context, userID string) (*entity.FocusSession, error) {
	query := `
		SELECT id, user_id, room_id, duration_seconds, session_type,
		       subject_tag, task_description, completed, started_at, ended_at, created_at
		FROM focus_sessions
		WHERE user_id = $1 AND ended_at IS NULL
		ORDER BY started_at DESC
		LIMIT 1
	`

	var session entity.FocusSession
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&session.ID,
		&session.UserID,
		&session.RoomID,
		&session.DurationSeconds,
		&session.SessionType,
		&session.SubjectTag,
		&session.TaskDescription,
		&session.Completed,
		&session.StartedAt,
		&session.EndedAt,
		&session.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil // No active session is not an error
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get active session: %w", err)
	}

	return &session, nil
}

// EndSession marks a session as ended
func (r *FocusSessionRepository) EndSession(ctx context.Context, id uuid.UUID, endTime time.Time) error {
	query := `
		UPDATE focus_sessions
		SET ended_at = $2, completed = true
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id, endTime)
	if err != nil {
		return fmt.Errorf("failed to end session: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("session not found")
	}

	return nil
}

// ListUserSessions retrieves sessions for a user with pagination
func (r *FocusSessionRepository) ListUserSessions(ctx context.Context, userID string, limit, offset int) ([]*entity.FocusSession, error) {
	query := `
		SELECT id, user_id, room_id, duration_seconds, session_type,
		       subject_tag, task_description, completed, started_at, ended_at, created_at
		FROM focus_sessions
		WHERE user_id = $1
		ORDER BY started_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list user sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*entity.FocusSession
	for rows.Next() {
		var session entity.FocusSession
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.RoomID,
			&session.DurationSeconds,
			&session.SessionType,
			&session.SubjectTag,
			&session.TaskDescription,
			&session.Completed,
			&session.StartedAt,
			&session.EndedAt,
			&session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, &session)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating sessions: %w", err)
	}

	return sessions, nil
}

// GetDailySessions retrieves sessions for a specific date
func (r *FocusSessionRepository) GetDailySessions(ctx context.Context, userID string, date time.Time) ([]*entity.FocusSession, error) {
	query := `
		SELECT id, user_id, room_id, duration_seconds, session_type,
		       subject_tag, task_description, completed, started_at, ended_at, created_at
		FROM focus_sessions
		WHERE user_id = $1
		  AND DATE(started_at) = $2
		ORDER BY started_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID, date.Format("2006-01-02"))
	if err != nil {
		return nil, fmt.Errorf("failed to get daily sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*entity.FocusSession
	for rows.Next() {
		var session entity.FocusSession
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.RoomID,
			&session.DurationSeconds,
			&session.SessionType,
			&session.SubjectTag,
			&session.TaskDescription,
			&session.Completed,
			&session.StartedAt,
			&session.EndedAt,
			&session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, &session)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating sessions: %w", err)
	}

	return sessions, nil
}

// GetSessionsByDateRange retrieves sessions within a date range
func (r *FocusSessionRepository) GetSessionsByDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*entity.FocusSession, error) {
	query := `
		SELECT id, user_id, room_id, duration_seconds, session_type,
		       subject_tag, task_description, completed, started_at, ended_at, created_at
		FROM focus_sessions
		WHERE user_id = $1
		  AND started_at >= $2
		  AND started_at < $3
		ORDER BY started_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get sessions by date range: %w", err)
	}
	defer rows.Close()

	var sessions []*entity.FocusSession
	for rows.Next() {
		var session entity.FocusSession
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.RoomID,
			&session.DurationSeconds,
			&session.SessionType,
			&session.SubjectTag,
			&session.TaskDescription,
			&session.Completed,
			&session.StartedAt,
			&session.EndedAt,
			&session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, &session)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating sessions: %w", err)
	}

	return sessions, nil
}


