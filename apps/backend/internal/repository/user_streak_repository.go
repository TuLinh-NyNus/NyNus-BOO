package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// UserStreakRepository implements the UserStreakRepository interface
type UserStreakRepository struct {
	db *sql.DB
}

// NewUserStreakRepository creates a new user streak repository instance
func NewUserStreakRepository(db *sql.DB) interfaces.UserStreakRepository {
	return &UserStreakRepository{db: db}
}

// Get retrieves a user's streak information
func (r *UserStreakRepository) Get(ctx context.Context, userID string) (*entity.UserStreak, error) {
	query := `
		SELECT user_id, current_streak, longest_streak, last_study_date,
		       total_study_days, total_focus_time_seconds, updated_at
		FROM user_streaks
		WHERE user_id = $1
	`

	var streak entity.UserStreak
	var lastStudyDate sql.NullTime

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&streak.UserID,
		&streak.CurrentStreak,
		&streak.LongestStreak,
		&lastStudyDate,
		&streak.TotalStudyDays,
		&streak.TotalFocusTimeSeconds,
		&streak.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		// Return empty streak for new user
		return &entity.UserStreak{
			UserID:                userID,
			CurrentStreak:         0,
			LongestStreak:         0,
			LastStudyDate:         nil,
			TotalStudyDays:        0,
			TotalFocusTimeSeconds: 0,
			UpdatedAt:             time.Now(),
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user streak: %w", err)
	}

	if lastStudyDate.Valid {
		streak.LastStudyDate = &lastStudyDate.Time
	}

	return &streak, nil
}

// Upsert creates or updates a user streak
func (r *UserStreakRepository) Upsert(ctx context.Context, streak *entity.UserStreak) error {
	query := `
		INSERT INTO user_streaks (
			user_id, current_streak, longest_streak, last_study_date,
			total_study_days, total_focus_time_seconds, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id) DO UPDATE SET
			current_streak = EXCLUDED.current_streak,
			longest_streak = EXCLUDED.longest_streak,
			last_study_date = EXCLUDED.last_study_date,
			total_study_days = EXCLUDED.total_study_days,
			total_focus_time_seconds = EXCLUDED.total_focus_time_seconds,
			updated_at = EXCLUDED.updated_at
	`

	streak.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(
		ctx,
		query,
		streak.UserID,
		streak.CurrentStreak,
		streak.LongestStreak,
		streak.LastStudyDate,
		streak.TotalStudyDays,
		streak.TotalFocusTimeSeconds,
		streak.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert user streak: %w", err)
	}

	return nil
}

// IncrementStreak increments the user's streak
func (r *UserStreakRepository) IncrementStreak(ctx context.Context, userID string, date time.Time) error {
	// Get current streak
	streak, err := r.Get(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get current streak: %w", err)
	}

	// Update streak using business logic
	streak.UpdateStreak(date)

	// Save updated streak
	return r.Upsert(ctx, streak)
}

// ResetStreak resets the user's current streak to 0
func (r *UserStreakRepository) ResetStreak(ctx context.Context, userID string) error {
	query := `
		UPDATE user_streaks
		SET current_streak = 0, updated_at = $2
		WHERE user_id = $1
	`

	_, err := r.db.ExecContext(ctx, query, userID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to reset streak: %w", err)
	}

	return nil
}

// GetTopStreaks retrieves the top streaks (for leaderboard)
func (r *UserStreakRepository) GetTopStreaks(ctx context.Context, limit int) ([]*entity.UserStreak, error) {
	query := `
		SELECT user_id, current_streak, longest_streak, last_study_date,
		       total_study_days, total_focus_time_seconds, updated_at
		FROM user_streaks
		WHERE current_streak > 0
		ORDER BY current_streak DESC, longest_streak DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get top streaks: %w", err)
	}
	defer rows.Close()

	var streaks []*entity.UserStreak
	for rows.Next() {
		var streak entity.UserStreak
		var lastStudyDate sql.NullTime

		err := rows.Scan(
			&streak.UserID,
			&streak.CurrentStreak,
			&streak.LongestStreak,
			&lastStudyDate,
			&streak.TotalStudyDays,
			&streak.TotalFocusTimeSeconds,
			&streak.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan streak: %w", err)
		}

		if lastStudyDate.Valid {
			streak.LastStudyDate = &lastStudyDate.Time
		}

		streaks = append(streaks, &streak)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating streaks: %w", err)
	}

	return streaks, nil
}
