package performance

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// ConnectionPoolOptimizer optimizes database connection pool settings
type ConnectionPoolOptimizer struct {
	db                *sql.DB
	logger            *logrus.Logger
	performanceMonitor *PerformanceMonitor
	
	// Current settings
	currentSettings *PoolSettings
	mutex           sync.RWMutex
	
	// Optimization state
	isOptimizing    bool
	optimizationMutex sync.Mutex
}

// PoolSettings represents database connection pool settings
type PoolSettings struct {
	MaxOpenConns    int           `json:"max_open_conns"`
	MaxIdleConns    int           `json:"max_idle_conns"`
	ConnMaxLifetime time.Duration `json:"conn_max_lifetime"`
	ConnMaxIdleTime time.Duration `json:"conn_max_idle_time"`
	
	// Performance metrics
	AverageWaitTime   time.Duration `json:"average_wait_time"`
	ConnectionUtilization float64   `json:"connection_utilization"`
	LastOptimized     time.Time     `json:"last_optimized"`
}

// OptimizationResult represents the result of pool optimization
type OptimizationResult struct {
	PreviousSettings *PoolSettings `json:"previous_settings"`
	NewSettings      *PoolSettings `json:"new_settings"`
	Improvement      *PerformanceImprovement `json:"improvement"`
	OptimizedAt      time.Time     `json:"optimized_at"`
}

// PerformanceImprovement represents performance improvements
type PerformanceImprovement struct {
	WaitTimeReduction    time.Duration `json:"wait_time_reduction"`
	UtilizationImprovement float64     `json:"utilization_improvement"`
	ThroughputIncrease   float64       `json:"throughput_increase"`
}

// NewConnectionPoolOptimizer creates a new connection pool optimizer
func NewConnectionPoolOptimizer(db *sql.DB, performanceMonitor *PerformanceMonitor, logger *logrus.Logger) *ConnectionPoolOptimizer {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &ConnectionPoolOptimizer{
		db:                 db,
		logger:             logger,
		performanceMonitor: performanceMonitor,
		currentSettings:    &PoolSettings{},
	}
}

// GetCurrentSettings returns the current pool settings
func (cpo *ConnectionPoolOptimizer) GetCurrentSettings() *PoolSettings {
	cpo.mutex.RLock()
	defer cpo.mutex.RUnlock()
	
	// Create a copy to avoid race conditions
	settings := *cpo.currentSettings
	return &settings
}

// UpdateSettings updates the connection pool settings
func (cpo *ConnectionPoolOptimizer) UpdateSettings(settings *PoolSettings) error {
	cpo.mutex.Lock()
	defer cpo.mutex.Unlock()

	// Apply settings to database connection
	cpo.db.SetMaxOpenConns(settings.MaxOpenConns)
	cpo.db.SetMaxIdleConns(settings.MaxIdleConns)
	cpo.db.SetConnMaxLifetime(settings.ConnMaxLifetime)
	cpo.db.SetConnMaxIdleTime(settings.ConnMaxIdleTime)

	// Update current settings
	cpo.currentSettings = settings
	cpo.currentSettings.LastOptimized = time.Now()

	cpo.logger.Printf("Updated connection pool settings: MaxOpen=%d, MaxIdle=%d, MaxLifetime=%v, MaxIdleTime=%v",
		settings.MaxOpenConns, settings.MaxIdleConns, settings.ConnMaxLifetime, settings.ConnMaxIdleTime)

	return nil
}

// CollectCurrentMetrics collects current connection pool metrics
func (cpo *ConnectionPoolOptimizer) CollectCurrentMetrics(ctx context.Context) (*ConnectionPoolStats, error) {
	stats := cpo.db.Stats()
	
	poolStats := &ConnectionPoolStats{
		ActiveConnections: stats.OpenConnections - stats.Idle,
		IdleConnections:   stats.Idle,
		TotalConnections:  stats.OpenConnections,
		MaxConnections:    stats.MaxOpenConnections,
		Timestamp:         time.Now(),
	}

	// Record in performance monitor
	if cpo.performanceMonitor != nil {
		if err := cpo.performanceMonitor.RecordConnectionPoolStats(ctx, poolStats); err != nil {
			cpo.logger.Printf("Failed to record connection pool stats: %v", err)
		}
	}

	return poolStats, nil
}

// AnalyzePerformance analyzes current connection pool performance
func (cpo *ConnectionPoolOptimizer) AnalyzePerformance(ctx context.Context) (*PerformanceAnalysis, error) {
	stats, err := cpo.CollectCurrentMetrics(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to collect metrics: %w", err)
	}

	analysis := &PerformanceAnalysis{
		CurrentStats: stats,
		Timestamp:    time.Now(),
	}

	// Calculate utilization
	if stats.MaxConnections > 0 {
		analysis.Utilization = float64(stats.TotalConnections) / float64(stats.MaxConnections)
	}

	// Analyze bottlenecks
	analysis.Bottlenecks = cpo.identifyBottlenecks(stats)
	
	// Generate recommendations
	analysis.Recommendations = cpo.generateRecommendations(stats, analysis.Utilization)

	return analysis, nil
}

// PerformanceAnalysis represents connection pool performance analysis
type PerformanceAnalysis struct {
	CurrentStats    *ConnectionPoolStats `json:"current_stats"`
	Utilization     float64              `json:"utilization"`
	Bottlenecks     []string             `json:"bottlenecks"`
	Recommendations []string             `json:"recommendations"`
	Timestamp       time.Time            `json:"timestamp"`
}

// identifyBottlenecks identifies performance bottlenecks
func (cpo *ConnectionPoolOptimizer) identifyBottlenecks(stats *ConnectionPoolStats) []string {
	var bottlenecks []string

	// High utilization
	utilization := float64(stats.TotalConnections) / float64(stats.MaxConnections)
	if utilization > 0.9 {
		bottlenecks = append(bottlenecks, "High connection pool utilization (>90%)")
	}

	// Low idle connections
	if stats.IdleConnections == 0 && stats.TotalConnections == stats.MaxConnections {
		bottlenecks = append(bottlenecks, "No idle connections available")
	}

	// High wait times
	if stats.ConnectionWaitTimeMs > 100 {
		bottlenecks = append(bottlenecks, fmt.Sprintf("High connection wait time: %.2fms", stats.ConnectionWaitTimeMs))
	}

	return bottlenecks
}

// generateRecommendations generates optimization recommendations
func (cpo *ConnectionPoolOptimizer) generateRecommendations(stats *ConnectionPoolStats, utilization float64) []string {
	var recommendations []string

	// Increase max connections if utilization is high
	if utilization > 0.8 {
		newMax := int(float64(stats.MaxConnections) * 1.2)
		recommendations = append(recommendations, fmt.Sprintf("Increase max connections to %d", newMax))
	}

	// Decrease max connections if utilization is very low
	if utilization < 0.3 && stats.MaxConnections > 10 {
		newMax := int(float64(stats.MaxConnections) * 0.8)
		recommendations = append(recommendations, fmt.Sprintf("Decrease max connections to %d", newMax))
	}

	// Adjust idle connections
	if stats.IdleConnections == 0 {
		newIdle := stats.MaxConnections / 4
		recommendations = append(recommendations, fmt.Sprintf("Increase max idle connections to %d", newIdle))
	}

	return recommendations
}

// OptimizeAutomatically performs automatic optimization based on current metrics
func (cpo *ConnectionPoolOptimizer) OptimizeAutomatically(ctx context.Context) (*OptimizationResult, error) {
	cpo.optimizationMutex.Lock()
	defer cpo.optimizationMutex.Unlock()

	if cpo.isOptimizing {
		return nil, fmt.Errorf("optimization already in progress")
	}

	cpo.isOptimizing = true
	defer func() { cpo.isOptimizing = false }()

	cpo.logger.Println("Starting automatic connection pool optimization...")

	// Get current settings
	previousSettings := cpo.GetCurrentSettings()

	// Analyze current performance
	analysis, err := cpo.AnalyzePerformance(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze performance: %w", err)
	}

	// Calculate new settings based on analysis
	newSettings := cpo.calculateOptimalSettings(analysis)

	// Apply new settings
	if err := cpo.UpdateSettings(newSettings); err != nil {
		return nil, fmt.Errorf("failed to update settings: %w", err)
	}

	// Wait for settings to take effect and measure improvement
	time.Sleep(30 * time.Second)

	// Measure improvement
	improvement, err := cpo.measureImprovement(ctx, previousSettings, newSettings)
	if err != nil {
		cpo.logger.Printf("Failed to measure improvement: %v", err)
		improvement = &PerformanceImprovement{}
	}

	result := &OptimizationResult{
		PreviousSettings: previousSettings,
		NewSettings:      newSettings,
		Improvement:      improvement,
		OptimizedAt:      time.Now(),
	}

	cpo.logger.Printf("Optimization completed: MaxOpen %d->%d, MaxIdle %d->%d",
		previousSettings.MaxOpenConns, newSettings.MaxOpenConns,
		previousSettings.MaxIdleConns, newSettings.MaxIdleConns)

	return result, nil
}

// calculateOptimalSettings calculates optimal settings based on performance analysis
func (cpo *ConnectionPoolOptimizer) calculateOptimalSettings(analysis *PerformanceAnalysis) *PoolSettings {
	current := cpo.GetCurrentSettings()
	newSettings := *current

	stats := analysis.CurrentStats
	utilization := analysis.Utilization

	// Adjust max open connections
	if utilization > 0.9 {
		newSettings.MaxOpenConns = int(float64(stats.MaxConnections) * 1.3)
	} else if utilization < 0.3 && stats.MaxConnections > 10 {
		newSettings.MaxOpenConns = int(float64(stats.MaxConnections) * 0.7)
	}

	// Ensure reasonable bounds
	if newSettings.MaxOpenConns < 5 {
		newSettings.MaxOpenConns = 5
	}
	if newSettings.MaxOpenConns > 100 {
		newSettings.MaxOpenConns = 100
	}

	// Adjust max idle connections (typically 25% of max open)
	newSettings.MaxIdleConns = newSettings.MaxOpenConns / 4
	if newSettings.MaxIdleConns < 2 {
		newSettings.MaxIdleConns = 2
	}

	// Adjust connection lifetimes based on usage patterns
	if utilization > 0.8 {
		// High usage - longer lifetimes to reduce connection churn
		newSettings.ConnMaxLifetime = 10 * time.Minute
		newSettings.ConnMaxIdleTime = 2 * time.Minute
	} else {
		// Low usage - shorter lifetimes to free resources
		newSettings.ConnMaxLifetime = 5 * time.Minute
		newSettings.ConnMaxIdleTime = 1 * time.Minute
	}

	return &newSettings
}

// measureImprovement measures performance improvement after optimization
func (cpo *ConnectionPoolOptimizer) measureImprovement(ctx context.Context, previous, current *PoolSettings) (*PerformanceImprovement, error) {
	// This is a simplified implementation
	// In a real system, you'd collect metrics over time and compare
	
	improvement := &PerformanceImprovement{
		WaitTimeReduction:      previous.AverageWaitTime - current.AverageWaitTime,
		UtilizationImprovement: current.ConnectionUtilization - previous.ConnectionUtilization,
		ThroughputIncrease:     0, // Would need to measure actual throughput
	}

	return improvement, nil
}

// StartPeriodicOptimization starts periodic automatic optimization
func (cpo *ConnectionPoolOptimizer) StartPeriodicOptimization(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	cpo.logger.Printf("Starting periodic connection pool optimization with interval: %v", interval)

	for {
		select {
		case <-ctx.Done():
			cpo.logger.Println("Stopping periodic optimization")
			return
		case <-ticker.C:
			if result, err := cpo.OptimizeAutomatically(ctx); err != nil {
				cpo.logger.Printf("Automatic optimization failed: %v", err)
			} else {
				cpo.logger.Printf("Automatic optimization completed: %+v", result)
			}
		}
	}
}
