package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// StudyAnalyticsRepository implements the StudyAnalyticsRepository interface
type StudyAnalyticsRepository struct {
	db *sql.DB
}

// NewStudyAnalyticsRepository creates a new study analytics repository instance
func NewStudyAnalyticsRepository(db *sql.DB) interfaces.StudyAnalyticsRepository {
	return &StudyAnalyticsRepository{db: db}
}

// GetDailyStats retrieves daily analytics for a specific date
func (r *StudyAnalyticsRepository) GetDailyStats(ctx context.Context, userID string, date time.Time) (*entity.DailyAnalytics, error) {
	query := `
		SELECT id, user_id, date, total_focus_time_seconds, total_break_time_seconds,
		       sessions_completed, tasks_completed, most_productive_hour, subjects_studied, created_at
		FROM study_analytics
		WHERE user_id = $1 AND date = $2
	`

	var stats entity.DailyAnalytics
	var subjectsJSON []byte
	var mostProductiveHour sql.NullInt32

	err := r.db.QueryRowContext(ctx, query, userID, date.Format("2006-01-02")).Scan(
		&stats.ID,
		&stats.UserID,
		&stats.Date,
		&stats.TotalFocusTimeSeconds,
		&stats.TotalBreakTimeSeconds,
		&stats.SessionsCompleted,
		&stats.TasksCompleted,
		&mostProductiveHour,
		&subjectsJSON,
		&stats.CreatedAt,
	)

	if err == sql.ErrNoRows {
		// Return empty stats
		return &entity.DailyAnalytics{
			UserID:                userID,
			Date:                  date,
			TotalFocusTimeSeconds: 0,
			TotalBreakTimeSeconds: 0,
			SessionsCompleted:     0,
			TasksCompleted:        0,
			SubjectsStudied:       make(entity.SubjectsStudied),
			CreatedAt:             time.Now(),
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get daily stats: %w", err)
	}

	if mostProductiveHour.Valid {
		hour := int(mostProductiveHour.Int32)
		stats.MostProductiveHour = &hour
	}

	// Unmarshal subjects
	if err := json.Unmarshal(subjectsJSON, &stats.SubjectsStudied); err != nil {
		return nil, fmt.Errorf("failed to unmarshal subjects: %w", err)
	}

	return &stats, nil
}

// UpsertDailyStats creates or updates daily analytics
func (r *StudyAnalyticsRepository) UpsertDailyStats(ctx context.Context, stats *entity.DailyAnalytics) error {
	query := `
		INSERT INTO study_analytics (
			user_id, date, total_focus_time_seconds, total_break_time_seconds,
			sessions_completed, tasks_completed, most_productive_hour, subjects_studied, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id, date) DO UPDATE SET
			total_focus_time_seconds = EXCLUDED.total_focus_time_seconds,
			total_break_time_seconds = EXCLUDED.total_break_time_seconds,
			sessions_completed = EXCLUDED.sessions_completed,
			tasks_completed = EXCLUDED.tasks_completed,
			most_productive_hour = EXCLUDED.most_productive_hour,
			subjects_studied = EXCLUDED.subjects_studied
	`

	// Marshal subjects
	subjectsJSON, err := json.Marshal(stats.SubjectsStudied)
	if err != nil {
		return fmt.Errorf("failed to marshal subjects: %w", err)
	}

	if stats.CreatedAt.IsZero() {
		stats.CreatedAt = time.Now()
	}

	_, err = r.db.ExecContext(
		ctx,
		query,
		stats.UserID,
		stats.Date.Format("2006-01-02"),
		stats.TotalFocusTimeSeconds,
		stats.TotalBreakTimeSeconds,
		stats.SessionsCompleted,
		stats.TasksCompleted,
		stats.MostProductiveHour,
		subjectsJSON,
		stats.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert daily stats: %w", err)
	}

	return nil
}

// GetWeeklyStats retrieves daily stats for a week
func (r *StudyAnalyticsRepository) GetWeeklyStats(ctx context.Context, userID string, startDate time.Time) ([]*entity.DailyAnalytics, error) {
	endDate := startDate.AddDate(0, 0, 7)

	query := `
		SELECT id, user_id, date, total_focus_time_seconds, total_break_time_seconds,
		       sessions_completed, tasks_completed, most_productive_hour, subjects_studied, created_at
		FROM study_analytics
		WHERE user_id = $1 AND date >= $2 AND date < $3
		ORDER BY date ASC
	`

	return r.queryStats(ctx, query, userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
}

// GetMonthlyStats retrieves daily stats for a month
func (r *StudyAnalyticsRepository) GetMonthlyStats(ctx context.Context, userID string, year, month int) ([]*entity.DailyAnalytics, error) {
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0)

	query := `
		SELECT id, user_id, date, total_focus_time_seconds, total_break_time_seconds,
		       sessions_completed, tasks_completed, most_productive_hour, subjects_studied, created_at
		FROM study_analytics
		WHERE user_id = $1 AND date >= $2 AND date < $3
		ORDER BY date ASC
	`

	return r.queryStats(ctx, query, userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
}

// GetContributionGraph retrieves contribution data for the last N days
func (r *StudyAnalyticsRepository) GetContributionGraph(ctx context.Context, userID string, days int) ([]*entity.ContributionDay, error) {
	startDate := time.Now().AddDate(0, 0, -days)

	query := `
		SELECT date, total_focus_time_seconds, sessions_completed
		FROM study_analytics
		WHERE user_id = $1 AND date >= $2
		ORDER BY date ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID, startDate.Format("2006-01-02"))
	if err != nil {
		return nil, fmt.Errorf("failed to get contribution graph: %w", err)
	}
	defer rows.Close()

	var contributions []*entity.ContributionDay
	for rows.Next() {
		var c entity.ContributionDay
		err := rows.Scan(&c.Date, &c.FocusTimeSeconds, &c.SessionsCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan contribution day: %w", err)
		}
		c.Level = entity.GetContributionLevel(c.FocusTimeSeconds)
		contributions = append(contributions, &c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating contributions: %w", err)
	}

	return contributions, nil
}

// UpdateDailyStats updates daily stats after a session ends
func (r *StudyAnalyticsRepository) UpdateDailyStats(ctx context.Context, userID string, date time.Time, session *entity.FocusSession) error {
	// Get current stats
	stats, err := r.GetDailyStats(ctx, userID, date)
	if err != nil {
		return fmt.Errorf("failed to get daily stats: %w", err)
	}

	// Update stats based on session
	if session.SessionType == entity.SessionTypeFocus {
		stats.TotalFocusTimeSeconds += session.DurationSeconds
		stats.SessionsCompleted++

		// Update subject time
		if session.SubjectTag != nil && *session.SubjectTag != "" {
			if stats.SubjectsStudied == nil {
				stats.SubjectsStudied = make(entity.SubjectsStudied)
			}
			stats.SubjectsStudied[*session.SubjectTag] += session.DurationSeconds
		}

		// Update most productive hour
		hour := session.StartedAt.Hour()
		if stats.MostProductiveHour == nil {
			stats.MostProductiveHour = &hour
		}
	} else {
		stats.TotalBreakTimeSeconds += session.DurationSeconds
	}

	// Save updated stats
	return r.UpsertDailyStats(ctx, stats)
}

// queryStats is a helper function to query and scan stats
func (r *StudyAnalyticsRepository) queryStats(ctx context.Context, query string, args ...interface{}) ([]*entity.DailyAnalytics, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query stats: %w", err)
	}
	defer rows.Close()

	var statsList []*entity.DailyAnalytics
	for rows.Next() {
		var stats entity.DailyAnalytics
		var subjectsJSON []byte
		var mostProductiveHour sql.NullInt32

		err := rows.Scan(
			&stats.ID,
			&stats.UserID,
			&stats.Date,
			&stats.TotalFocusTimeSeconds,
			&stats.TotalBreakTimeSeconds,
			&stats.SessionsCompleted,
			&stats.TasksCompleted,
			&mostProductiveHour,
			&subjectsJSON,
			&stats.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan stats: %w", err)
		}

		if mostProductiveHour.Valid {
			hour := int(mostProductiveHour.Int32)
			stats.MostProductiveHour = &hour
		}

		// Unmarshal subjects
		if err := json.Unmarshal(subjectsJSON, &stats.SubjectsStudied); err != nil {
			return nil, fmt.Errorf("failed to unmarshal subjects: %w", err)
		}

		statsList = append(statsList, &stats)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating stats: %w", err)
	}

	return statsList, nil
}


