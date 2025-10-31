package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// LeaderboardRepository implements the LeaderboardRepository interface
type LeaderboardRepository struct {
	db *sql.DB
}

// NewLeaderboardRepository creates a new leaderboard repository instance
func NewLeaderboardRepository(db *sql.DB) interfaces.LeaderboardRepository {
	return &LeaderboardRepository{db: db}
}

// GetGlobalLeaderboard retrieves the global leaderboard for a period
func (r *LeaderboardRepository) GetGlobalLeaderboard(ctx context.Context, period entity.LeaderboardPeriod, periodStart time.Time, limit int) ([]*entity.LeaderboardEntry, error) {
	query := `
		SELECT id, user_id, period, period_start, period_end,
		       total_focus_time_seconds, rank, score, updated_at
		FROM leaderboard
		WHERE period = $1 AND period_start = $2
		ORDER BY rank ASC
		LIMIT $3
	`

	return r.queryLeaderboard(ctx, query, string(period), periodStart, limit)
}

// GetClassLeaderboard retrieves the leaderboard for a specific class
func (r *LeaderboardRepository) GetClassLeaderboard(ctx context.Context, classID int, period entity.LeaderboardPeriod, periodStart time.Time, limit int) ([]*entity.LeaderboardEntry, error) {
	query := `
		SELECT l.id, l.user_id, l.period, l.period_start, l.period_end,
		       l.total_focus_time_seconds, l.rank, l.score, l.updated_at
		FROM leaderboard l
		JOIN users u ON l.user_id = u.id
		WHERE l.period = $1 AND l.period_start = $2 AND u.class_id = $3
		ORDER BY l.score DESC
		LIMIT $4
	`

	return r.queryLeaderboard(ctx, query, string(period), periodStart, classID, limit)
}

// GetUserRank retrieves a user's rank for a specific period
func (r *LeaderboardRepository) GetUserRank(ctx context.Context, userID string, period entity.LeaderboardPeriod, periodStart time.Time) (int, error) {
	query := `
		SELECT rank
		FROM leaderboard
		WHERE user_id = $1 AND period = $2 AND period_start = $3
	`

	var rank sql.NullInt32
	err := r.db.QueryRowContext(ctx, query, userID, string(period), periodStart).Scan(&rank)

	if err == sql.ErrNoRows || !rank.Valid {
		return 0, nil // User not in leaderboard
	}
	if err != nil {
		return 0, fmt.Errorf("failed to get user rank: %w", err)
	}

	return int(rank.Int32), nil
}

// UpsertEntry creates or updates a leaderboard entry
func (r *LeaderboardRepository) UpsertEntry(ctx context.Context, entry *entity.LeaderboardEntry) error {
	query := `
		INSERT INTO leaderboard (
			user_id, period, period_start, period_end,
			total_focus_time_seconds, rank, score, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id, period, period_start) DO UPDATE SET
			period_end = EXCLUDED.period_end,
			total_focus_time_seconds = EXCLUDED.total_focus_time_seconds,
			rank = EXCLUDED.rank,
			score = EXCLUDED.score,
			updated_at = EXCLUDED.updated_at
	`

	entry.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(
		ctx,
		query,
		entry.UserID,
		string(entry.Period),
		entry.PeriodStart,
		entry.PeriodEnd,
		entry.TotalFocusTimeSeconds,
		entry.Rank,
		entry.Score,
		entry.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert leaderboard entry: %w", err)
	}

	return nil
}

// RefreshLeaderboard recalculates leaderboard rankings for a period
func (r *LeaderboardRepository) RefreshLeaderboard(ctx context.Context, period entity.LeaderboardPeriod, periodStart, periodEnd time.Time) error {
	// Begin transaction
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Calculate scores and rankings from focus_sessions and user_streaks
	query := `
		WITH session_stats AS (
			SELECT 
				fs.user_id,
				SUM(CASE WHEN fs.session_type = 'focus' THEN fs.duration_seconds ELSE 0 END) as total_focus_time,
				COUNT(CASE WHEN fs.session_type = 'focus' THEN 1 END) as sessions_completed
			FROM focus_sessions fs
			WHERE fs.started_at >= $1 AND fs.started_at < $2
			  AND fs.completed = true
			GROUP BY fs.user_id
		),
		task_stats AS (
			SELECT 
				ft.user_id,
				COUNT(*) as tasks_completed
			FROM focus_tasks ft
			WHERE ft.completed_at >= $1 AND ft.completed_at < $2
			  AND ft.is_completed = true
			GROUP BY ft.user_id
		),
		combined_stats AS (
			SELECT 
				ss.user_id,
				ss.total_focus_time,
				ss.sessions_completed,
				COALESCE(us.current_streak, 0) as current_streak,
				COALESCE(ts.tasks_completed, 0) as tasks_completed
			FROM session_stats ss
			LEFT JOIN user_streaks us ON ss.user_id = us.user_id
			LEFT JOIN task_stats ts ON ss.user_id = ts.user_id
		),
		scored_users AS (
			SELECT 
				user_id,
				total_focus_time,
				sessions_completed,
				current_streak,
				tasks_completed,
				(total_focus_time * 1.0 + 
				 sessions_completed * 300.0 + 
				 current_streak * 1000.0 + 
				 tasks_completed * 500.0) as score
			FROM combined_stats
		)
		INSERT INTO leaderboard (
			user_id, period, period_start, period_end,
			total_focus_time_seconds, rank, score, updated_at
		)
		SELECT 
			user_id,
			$3,
			$1,
			$2,
			total_focus_time,
			ROW_NUMBER() OVER (ORDER BY score DESC),
			score,
			NOW()
		FROM scored_users
		ON CONFLICT (user_id, period, period_start) DO UPDATE SET
			period_end = EXCLUDED.period_end,
			total_focus_time_seconds = EXCLUDED.total_focus_time_seconds,
			rank = EXCLUDED.rank,
			score = EXCLUDED.score,
			updated_at = EXCLUDED.updated_at
	`

	_, err = tx.ExecContext(ctx, query, periodStart, periodEnd, string(period))
	if err != nil {
		return fmt.Errorf("failed to refresh leaderboard: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// queryLeaderboard is a helper function to query leaderboard entries
func (r *LeaderboardRepository) queryLeaderboard(ctx context.Context, query string, args ...interface{}) ([]*entity.LeaderboardEntry, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query leaderboard: %w", err)
	}
	defer rows.Close()

	var entries []*entity.LeaderboardEntry
	for rows.Next() {
		var entry entity.LeaderboardEntry
		var periodEnd sql.NullTime
		var rank sql.NullInt32

		err := rows.Scan(
			&entry.ID,
			&entry.UserID,
			&entry.Period,
			&entry.PeriodStart,
			&periodEnd,
			&entry.TotalFocusTimeSeconds,
			&rank,
			&entry.Score,
			&entry.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan leaderboard entry: %w", err)
		}

		if periodEnd.Valid {
			entry.PeriodEnd = &periodEnd.Time
		}
		if rank.Valid {
			r := int(rank.Int32)
			entry.Rank = &r
		}

		entries = append(entries, &entry)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating leaderboard: %w", err)
	}

	return entries, nil
}


