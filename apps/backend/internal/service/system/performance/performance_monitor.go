package performance

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// PerformanceMonitor handles performance monitoring and metrics collection
type PerformanceMonitor struct {
	db     *sql.DB
	logger *logrus.Logger
	mutex  sync.RWMutex

	// In-memory metrics cache
	metricsCache map[string]*MetricValue
	cacheExpiry  time.Duration
}

// MetricValue represents a cached metric value
type MetricValue struct {
	Value     float64                `json:"value"`
	Unit      string                 `json:"unit"`
	Context   map[string]interface{} `json:"context,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// PerformanceMetric represents a performance metric
type PerformanceMetric struct {
	Name      string                 `json:"name"`
	Value     float64                `json:"value"`
	Unit      string                 `json:"unit"`
	Context   map[string]interface{} `json:"context,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// ConnectionPoolStats represents database connection pool statistics
type ConnectionPoolStats struct {
	ActiveConnections    int       `json:"active_connections"`
	IdleConnections      int       `json:"idle_connections"`
	TotalConnections     int       `json:"total_connections"`
	MaxConnections       int       `json:"max_connections"`
	ConnectionWaitTimeMs float64   `json:"connection_wait_time_ms,omitempty"`
	Timestamp            time.Time `json:"timestamp"`
}

// SystemMetrics represents system-level metrics
type SystemMetrics struct {
	MemoryUsageBytes uint64    `json:"memory_usage_bytes"`
	MemoryAllocBytes uint64    `json:"memory_alloc_bytes"`
	MemorySysBytes   uint64    `json:"memory_sys_bytes"`
	GoroutineCount   int       `json:"goroutine_count"`
	GCPauseMs        float64   `json:"gc_pause_ms"`
	CPUUsagePercent  float64   `json:"cpu_usage_percent,omitempty"`
	Timestamp        time.Time `json:"timestamp"`
}

// NewPerformanceMonitor creates a new performance monitor
func NewPerformanceMonitor(db *sql.DB, logger *logrus.Logger) *PerformanceMonitor {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &PerformanceMonitor{
		db:           db,
		logger:       logger,
		metricsCache: make(map[string]*MetricValue),
		cacheExpiry:  5 * time.Minute, // Cache metrics for 5 minutes
	}
}

// RecordMetric records a performance metric
func (pm *PerformanceMonitor) RecordMetric(ctx context.Context, metric *PerformanceMetric) error {
	// Store in database
	contextJSON, err := json.Marshal(metric.Context)
	if err != nil {
		contextJSON = []byte("{}")
	}

	query := `SELECT record_performance_metric($1, $2, $3, $4)`
	_, err = pm.db.ExecContext(ctx, query, metric.Name, metric.Value, metric.Unit, string(contextJSON))
	if err != nil {
		return fmt.Errorf("failed to record metric: %w", err)
	}

	// Update cache
	pm.mutex.Lock()
	pm.metricsCache[metric.Name] = &MetricValue{
		Value:     metric.Value,
		Unit:      metric.Unit,
		Context:   metric.Context,
		Timestamp: metric.Timestamp,
	}
	pm.mutex.Unlock()

	return nil
}

// GetMetric retrieves a metric value (from cache or database)
func (pm *PerformanceMonitor) GetMetric(ctx context.Context, metricName string) (*MetricValue, error) {
	// Check cache first
	pm.mutex.RLock()
	if cached, exists := pm.metricsCache[metricName]; exists {
		if time.Since(cached.Timestamp) < pm.cacheExpiry {
			pm.mutex.RUnlock()
			return cached, nil
		}
	}
	pm.mutex.RUnlock()

	// Fetch from database
	query := `
		SELECT metric_value, metric_unit, context, recorded_at
		FROM performance_metrics
		WHERE metric_name = $1
		ORDER BY recorded_at DESC
		LIMIT 1
	`

	var value float64
	var unit string
	var contextJSON string
	var timestamp time.Time

	err := pm.db.QueryRowContext(ctx, query, metricName).Scan(&value, &unit, &contextJSON, &timestamp)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("metric not found: %s", metricName)
		}
		return nil, fmt.Errorf("failed to get metric: %w", err)
	}

	var context map[string]interface{}
	if err := json.Unmarshal([]byte(contextJSON), &context); err != nil {
		context = make(map[string]interface{})
	}

	metric := &MetricValue{
		Value:     value,
		Unit:      unit,
		Context:   context,
		Timestamp: timestamp,
	}

	// Update cache
	pm.mutex.Lock()
	pm.metricsCache[metricName] = metric
	pm.mutex.Unlock()

	return metric, nil
}

// RecordConnectionPoolStats records database connection pool statistics
func (pm *PerformanceMonitor) RecordConnectionPoolStats(ctx context.Context, stats *ConnectionPoolStats) error {
	query := `SELECT record_connection_pool_stats($1, $2, $3, $4, $5)`
	_, err := pm.db.ExecContext(ctx, query,
		stats.ActiveConnections,
		stats.IdleConnections,
		stats.TotalConnections,
		stats.MaxConnections,
		stats.ConnectionWaitTimeMs,
	)
	if err != nil {
		return fmt.Errorf("failed to record connection pool stats: %w", err)
	}

	return nil
}

// GetConnectionPoolStats retrieves the latest connection pool statistics
func (pm *PerformanceMonitor) GetConnectionPoolStats(ctx context.Context) (*ConnectionPoolStats, error) {
	query := `
		SELECT active_connections, idle_connections, total_connections, 
		       max_connections, connection_wait_time_ms, recorded_at
		FROM connection_pool_stats
		ORDER BY recorded_at DESC
		LIMIT 1
	`

	var stats ConnectionPoolStats
	var waitTime sql.NullFloat64

	err := pm.db.QueryRowContext(ctx, query).Scan(
		&stats.ActiveConnections,
		&stats.IdleConnections,
		&stats.TotalConnections,
		&stats.MaxConnections,
		&waitTime,
		&stats.Timestamp,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no connection pool stats found")
		}
		return nil, fmt.Errorf("failed to get connection pool stats: %w", err)
	}

	if waitTime.Valid {
		stats.ConnectionWaitTimeMs = waitTime.Float64
	}

	return &stats, nil
}

// CollectSystemMetrics collects current system metrics
func (pm *PerformanceMonitor) CollectSystemMetrics() *SystemMetrics {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	return &SystemMetrics{
		MemoryUsageBytes: memStats.HeapInuse,
		MemoryAllocBytes: memStats.Alloc,
		MemorySysBytes:   memStats.Sys,
		GoroutineCount:   runtime.NumGoroutine(),
		GCPauseMs:        float64(memStats.PauseNs[(memStats.NumGC+255)%256]) / 1e6,
		Timestamp:        time.Now(),
	}
}

// RecordSystemMetrics records current system metrics
func (pm *PerformanceMonitor) RecordSystemMetrics(ctx context.Context) error {
	metrics := pm.CollectSystemMetrics()

	// Record individual metrics
	metricsToRecord := []PerformanceMetric{
		{
			Name:      "memory_usage_bytes",
			Value:     float64(metrics.MemoryUsageBytes),
			Unit:      "bytes",
			Timestamp: metrics.Timestamp,
		},
		{
			Name:      "memory_alloc_bytes",
			Value:     float64(metrics.MemoryAllocBytes),
			Unit:      "bytes",
			Timestamp: metrics.Timestamp,
		},
		{
			Name:      "goroutine_count",
			Value:     float64(metrics.GoroutineCount),
			Unit:      "count",
			Timestamp: metrics.Timestamp,
		},
		{
			Name:      "gc_pause_ms",
			Value:     metrics.GCPauseMs,
			Unit:      "ms",
			Timestamp: metrics.Timestamp,
		},
	}

	for _, metric := range metricsToRecord {
		if err := pm.RecordMetric(ctx, &metric); err != nil {
			pm.logger.Printf("Failed to record system metric %s: %v", metric.Name, err)
		}
	}

	return nil
}

// GetMetricHistory retrieves metric history for a specific metric
func (pm *PerformanceMonitor) GetMetricHistory(ctx context.Context, metricName string, limit int, since time.Time) ([]PerformanceMetric, error) {
	query := `
		SELECT metric_value, metric_unit, context, recorded_at
		FROM performance_metrics
		WHERE metric_name = $1 AND recorded_at >= $2
		ORDER BY recorded_at DESC
		LIMIT $3
	`

	rows, err := pm.db.QueryContext(ctx, query, metricName, since, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get metric history: %w", err)
	}
	defer rows.Close()

	var metrics []PerformanceMetric
	for rows.Next() {
		var value float64
		var unit string
		var contextJSON string
		var timestamp time.Time

		err := rows.Scan(&value, &unit, &contextJSON, &timestamp)
		if err != nil {
			return nil, fmt.Errorf("failed to scan metric row: %w", err)
		}

		var context map[string]interface{}
		if err := json.Unmarshal([]byte(contextJSON), &context); err != nil {
			context = make(map[string]interface{})
		}

		metrics = append(metrics, PerformanceMetric{
			Name:      metricName,
			Value:     value,
			Unit:      unit,
			Context:   context,
			Timestamp: timestamp,
		})
	}

	return metrics, nil
}

// StartPeriodicCollection starts periodic collection of system metrics
func (pm *PerformanceMonitor) StartPeriodicCollection(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	pm.logger.Printf("Starting periodic metric collection with interval: %v", interval)

	for {
		select {
		case <-ctx.Done():
			pm.logger.Println("Stopping periodic metric collection")
			return
		case <-ticker.C:
			if err := pm.RecordSystemMetrics(ctx); err != nil {
				pm.logger.Printf("Failed to record system metrics: %v", err)
			}
		}
	}
}

// ClearCache clears the metrics cache
func (pm *PerformanceMonitor) ClearCache() {
	pm.mutex.Lock()
	pm.metricsCache = make(map[string]*MetricValue)
	pm.mutex.Unlock()
	pm.logger.Println("Metrics cache cleared")
}
