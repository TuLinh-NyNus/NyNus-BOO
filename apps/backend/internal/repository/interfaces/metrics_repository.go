package interfaces

import (
	"context"
	"time"
)

// MetricsSnapshot represents a point-in-time snapshot of system metrics
type MetricsSnapshot struct {
	ID                   int64
	RecordedAt           time.Time
	TotalUsers           int32
	ActiveUsers          int32
	NewUsersToday        int32
	TotalSessions        int32
	ActiveSessions       int32
	SuspiciousActivities int32
	BlockedIPs           int32
	SecurityEvents       int32
	AvgResponseTimeMs    *int32   // Optional
	ErrorRatePercent     *float64 // Optional
	UptimePercent        *float64 // Optional
	CreatedAt            time.Time
}

// MetricsRepository defines the interface for metrics history data access
// Used for storing and retrieving time-series metrics data for dashboards and analytics
type MetricsRepository interface {
	// RecordMetrics records a new metrics snapshot
	// Should be called periodically (e.g., every 5 minutes) by a background job
	RecordMetrics(ctx context.Context, snapshot *MetricsSnapshot) error

	// GetMetricsHistory retrieves metrics history within a time range
	// Returns data points ordered by recorded_at DESC (most recent first)
	// limit: max number of data points to return (default: 20, max: 100)
	GetMetricsHistory(ctx context.Context, startTime, endTime time.Time, limit int) ([]*MetricsSnapshot, error)

	// GetLatestMetrics retrieves the most recent N metrics snapshots
	// Useful for sparkline charts (typically N=7 to 20)
	GetLatestMetrics(ctx context.Context, limit int) ([]*MetricsSnapshot, error)

	// GetMetricsByInterval retrieves metrics at specific intervals
	// intervalMinutes: interval between data points (e.g., 5, 15, 60)
	// Returns evenly spaced data points within the time range
	GetMetricsByInterval(ctx context.Context, startTime, endTime time.Time, intervalMinutes int) ([]*MetricsSnapshot, error)

	// CleanupOldMetrics removes metrics older than the specified retention period
	// Called by maintenance job to keep storage efficient
	// retentionDays: number of days to keep (default: 30)
	CleanupOldMetrics(ctx context.Context, retentionDays int) (int64, error)

	// GetMetricsCount returns the total number of metrics records
	// Useful for monitoring storage growth
	GetMetricsCount(ctx context.Context) (int64, error)

	// GetOldestMetric returns the oldest metrics record
	// Useful for determining data retention status
	GetOldestMetric(ctx context.Context) (*MetricsSnapshot, error)
}
