package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/repository/interfaces"

	"github.com/sirupsen/logrus"
)

var (
	// ErrMetricsNotFound is returned when no metrics are found
	ErrMetricsNotFound = errors.New("metrics not found")

	// ErrInvalidTimeRange is returned when time range is invalid
	ErrInvalidTimeRange = errors.New("invalid time range: start time must be before end time")
)

// metricsRepository implements MetricsRepository interface
type metricsRepository struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewMetricsRepository creates a new metrics repository instance
func NewMetricsRepository(db *sql.DB, logger *logrus.Logger) interfaces.MetricsRepository {
	return &metricsRepository{
		db:     db,
		logger: logger,
	}
}

// RecordMetrics records a new metrics snapshot
func (r *metricsRepository) RecordMetrics(ctx context.Context, snapshot *interfaces.MetricsSnapshot) error {
	if snapshot == nil {
		return errors.New("snapshot cannot be nil")
	}

	query := `
		INSERT INTO metrics_history (
			recorded_at,
			total_users,
			active_users,
			new_users_today,
			total_sessions,
			active_sessions,
			suspicious_activities,
			blocked_ips,
			security_events,
			avg_response_time_ms,
			error_rate_percent,
			uptime_percent
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at
	`

	// Use provided recorded_at or current time
	recordedAt := snapshot.RecordedAt
	if recordedAt.IsZero() {
		recordedAt = time.Now()
	}

	err := r.db.QueryRowContext(
		ctx,
		query,
		recordedAt,
		snapshot.TotalUsers,
		snapshot.ActiveUsers,
		snapshot.NewUsersToday,
		snapshot.TotalSessions,
		snapshot.ActiveSessions,
		snapshot.SuspiciousActivities,
		snapshot.BlockedIPs,
		snapshot.SecurityEvents,
		snapshot.AvgResponseTimeMs,
		snapshot.ErrorRatePercent,
		snapshot.UptimePercent,
	).Scan(&snapshot.ID, &snapshot.CreatedAt)

	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to record metrics")
		return fmt.Errorf("failed to record metrics: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"metrics_id":   snapshot.ID,
		"recorded_at":  recordedAt,
		"total_users":  snapshot.TotalUsers,
		"active_users": snapshot.ActiveUsers,
	}).Debug("[MetricsRepository] Metrics recorded successfully")

	return nil
}

// GetMetricsHistory retrieves metrics history within a time range
func (r *metricsRepository) GetMetricsHistory(ctx context.Context, startTime, endTime time.Time, limit int) ([]*interfaces.MetricsSnapshot, error) {
	// Validate time range
	if !startTime.Before(endTime) {
		return nil, ErrInvalidTimeRange
	}

	// Apply limit constraints
	if limit <= 0 {
		limit = 20 // Default
	}
	if limit > 100 {
		limit = 100 // Max cap
	}

	query := `
		SELECT 
			id,
			recorded_at,
			total_users,
			active_users,
			new_users_today,
			total_sessions,
			active_sessions,
			suspicious_activities,
			blocked_ips,
			security_events,
			avg_response_time_ms,
			error_rate_percent,
			uptime_percent,
			created_at
		FROM metrics_history
		WHERE recorded_at >= $1 AND recorded_at <= $2
		ORDER BY recorded_at DESC
		LIMIT $3
	`

	rows, err := r.db.QueryContext(ctx, query, startTime, endTime, limit)
	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to query metrics history")
		return nil, fmt.Errorf("failed to query metrics history: %w", err)
	}
	defer rows.Close()

	var snapshots []*interfaces.MetricsSnapshot
	for rows.Next() {
		snapshot := &interfaces.MetricsSnapshot{}
		err := rows.Scan(
			&snapshot.ID,
			&snapshot.RecordedAt,
			&snapshot.TotalUsers,
			&snapshot.ActiveUsers,
			&snapshot.NewUsersToday,
			&snapshot.TotalSessions,
			&snapshot.ActiveSessions,
			&snapshot.SuspiciousActivities,
			&snapshot.BlockedIPs,
			&snapshot.SecurityEvents,
			&snapshot.AvgResponseTimeMs,
			&snapshot.ErrorRatePercent,
			&snapshot.UptimePercent,
			&snapshot.CreatedAt,
		)
		if err != nil {
			r.logger.WithError(err).Error("[MetricsRepository] Failed to scan metrics row")
			return nil, fmt.Errorf("failed to scan metrics row: %w", err)
		}
		snapshots = append(snapshots, snapshot)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("metrics query error: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"start_time": startTime,
		"end_time":   endTime,
		"count":      len(snapshots),
		"limit":      limit,
	}).Debug("[MetricsRepository] Retrieved metrics history")

	return snapshots, nil
}

// GetLatestMetrics retrieves the most recent N metrics snapshots
func (r *metricsRepository) GetLatestMetrics(ctx context.Context, limit int) ([]*interfaces.MetricsSnapshot, error) {
	// Apply limit constraints
	if limit <= 0 {
		limit = 7 // Default for sparklines
	}
	if limit > 100 {
		limit = 100
	}

	query := `
		SELECT 
			id,
			recorded_at,
			total_users,
			active_users,
			new_users_today,
			total_sessions,
			active_sessions,
			suspicious_activities,
			blocked_ips,
			security_events,
			avg_response_time_ms,
			error_rate_percent,
			uptime_percent,
			created_at
		FROM metrics_history
		ORDER BY recorded_at DESC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to query latest metrics")
		return nil, fmt.Errorf("failed to query latest metrics: %w", err)
	}
	defer rows.Close()

	var snapshots []*interfaces.MetricsSnapshot
	for rows.Next() {
		snapshot := &interfaces.MetricsSnapshot{}
		err := rows.Scan(
			&snapshot.ID,
			&snapshot.RecordedAt,
			&snapshot.TotalUsers,
			&snapshot.ActiveUsers,
			&snapshot.NewUsersToday,
			&snapshot.TotalSessions,
			&snapshot.ActiveSessions,
			&snapshot.SuspiciousActivities,
			&snapshot.BlockedIPs,
			&snapshot.SecurityEvents,
			&snapshot.AvgResponseTimeMs,
			&snapshot.ErrorRatePercent,
			&snapshot.UptimePercent,
			&snapshot.CreatedAt,
		)
		if err != nil {
			r.logger.WithError(err).Error("[MetricsRepository] Failed to scan metrics row")
			return nil, fmt.Errorf("failed to scan metrics row: %w", err)
		}
		snapshots = append(snapshots, snapshot)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("metrics query error: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"count": len(snapshots),
		"limit": limit,
	}).Debug("[MetricsRepository] Retrieved latest metrics")

	return snapshots, nil
}

// GetMetricsByInterval retrieves metrics at specific intervals
func (r *metricsRepository) GetMetricsByInterval(ctx context.Context, startTime, endTime time.Time, intervalMinutes int) ([]*interfaces.MetricsSnapshot, error) {
	// Validate time range
	if !startTime.Before(endTime) {
		return nil, ErrInvalidTimeRange
	}

	// Validate interval
	if intervalMinutes <= 0 {
		intervalMinutes = 5 // Default 5 minutes
	}

	query := `
		WITH time_buckets AS (
			SELECT 
				time_bucket,
				time_bucket + INTERVAL '1 minute' * $3 AS time_bucket_end
			FROM generate_series($1::TIMESTAMPTZ, $2::TIMESTAMPTZ, INTERVAL '1 minute' * $3) AS time_bucket
		)
		SELECT DISTINCT ON (tb.time_bucket)
			m.id,
			m.recorded_at,
			m.total_users,
			m.active_users,
			m.new_users_today,
			m.total_sessions,
			m.active_sessions,
			m.suspicious_activities,
			m.blocked_ips,
			m.security_events,
			m.avg_response_time_ms,
			m.error_rate_percent,
			m.uptime_percent,
			m.created_at
		FROM time_buckets tb
		LEFT JOIN metrics_history m 
			ON m.recorded_at >= tb.time_bucket 
			AND m.recorded_at < tb.time_bucket_end
		WHERE m.id IS NOT NULL
		ORDER BY tb.time_bucket, m.recorded_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, startTime, endTime, intervalMinutes)
	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to query metrics by interval")
		return nil, fmt.Errorf("failed to query metrics by interval: %w", err)
	}
	defer rows.Close()

	var snapshots []*interfaces.MetricsSnapshot
	for rows.Next() {
		snapshot := &interfaces.MetricsSnapshot{}
		err := rows.Scan(
			&snapshot.ID,
			&snapshot.RecordedAt,
			&snapshot.TotalUsers,
			&snapshot.ActiveUsers,
			&snapshot.NewUsersToday,
			&snapshot.TotalSessions,
			&snapshot.ActiveSessions,
			&snapshot.SuspiciousActivities,
			&snapshot.BlockedIPs,
			&snapshot.SecurityEvents,
			&snapshot.AvgResponseTimeMs,
			&snapshot.ErrorRatePercent,
			&snapshot.UptimePercent,
			&snapshot.CreatedAt,
		)
		if err != nil {
			r.logger.WithError(err).Error("[MetricsRepository] Failed to scan metrics row")
			return nil, fmt.Errorf("failed to scan metrics row: %w", err)
		}
		snapshots = append(snapshots, snapshot)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("metrics query error: %w", err)
	}

	return snapshots, nil
}

// CleanupOldMetrics removes metrics older than the specified retention period
func (r *metricsRepository) CleanupOldMetrics(ctx context.Context, retentionDays int) (int64, error) {
	if retentionDays <= 0 {
		retentionDays = 30 // Default 30 days
	}

	query := `
		DELETE FROM metrics_history
		WHERE recorded_at < NOW() - INTERVAL '1 day' * $1
	`

	result, err := r.db.ExecContext(ctx, query, retentionDays)
	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to cleanup old metrics")
		return 0, fmt.Errorf("failed to cleanup old metrics: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"retention_days": retentionDays,
		"deleted_count":  rowsAffected,
	}).Info("[MetricsRepository] Cleaned up old metrics")

	return rowsAffected, nil
}

// GetMetricsCount returns the total number of metrics records
func (r *metricsRepository) GetMetricsCount(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM metrics_history`

	var count int64
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to get metrics count")
		return 0, fmt.Errorf("failed to get metrics count: %w", err)
	}

	return count, nil
}

// GetOldestMetric returns the oldest metrics record
func (r *metricsRepository) GetOldestMetric(ctx context.Context) (*interfaces.MetricsSnapshot, error) {
	query := `
		SELECT 
			id,
			recorded_at,
			total_users,
			active_users,
			new_users_today,
			total_sessions,
			active_sessions,
			suspicious_activities,
			blocked_ips,
			security_events,
			avg_response_time_ms,
			error_rate_percent,
			uptime_percent,
			created_at
		FROM metrics_history
		ORDER BY recorded_at ASC
		LIMIT 1
	`

	snapshot := &interfaces.MetricsSnapshot{}
	err := r.db.QueryRowContext(ctx, query).Scan(
		&snapshot.ID,
		&snapshot.RecordedAt,
		&snapshot.TotalUsers,
		&snapshot.ActiveUsers,
		&snapshot.NewUsersToday,
		&snapshot.TotalSessions,
		&snapshot.ActiveSessions,
		&snapshot.SuspiciousActivities,
		&snapshot.BlockedIPs,
		&snapshot.SecurityEvents,
		&snapshot.AvgResponseTimeMs,
		&snapshot.ErrorRatePercent,
		&snapshot.UptimePercent,
		&snapshot.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrMetricsNotFound
	}
	if err != nil {
		r.logger.WithError(err).Error("[MetricsRepository] Failed to get oldest metric")
		return nil, fmt.Errorf("failed to get oldest metric: %w", err)
	}

	return snapshot, nil
}
