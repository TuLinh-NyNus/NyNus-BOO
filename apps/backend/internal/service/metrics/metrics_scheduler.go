package metrics

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/repository/interfaces"

	"github.com/sirupsen/logrus"
)

// MetricsScheduler handles periodic recording of system metrics
type MetricsScheduler struct {
	db          *sql.DB
	userRepo    repository.IUserRepository
	sessionRepo repository.SessionRepository
	metricsRepo interfaces.MetricsRepository
	logger      *logrus.Logger

	// Scheduler state
	isRunning bool
	mutex     sync.RWMutex
	ctx       context.Context
	cancel    context.CancelFunc
	wg        sync.WaitGroup
}

// Config for metrics scheduler
type Config struct {
	RecordingInterval time.Duration // How often to record metrics (default: 5 minutes)
	CleanupInterval   time.Duration // How often to cleanup old data (default: 24 hours)
	RetentionDays     int           // How many days to keep (default: 30)
	EnableRecording   bool          // Enable periodic recording
	EnableCleanup     bool          // Enable automatic cleanup
}

// DefaultConfig returns default configuration
func DefaultConfig() *Config {
	return &Config{
		RecordingInterval: 5 * time.Minute,
		CleanupInterval:   24 * time.Hour,
		RetentionDays:     30,
		EnableRecording:   true,
		EnableCleanup:     true,
	}
}

// NewMetricsScheduler creates a new metrics scheduler
func NewMetricsScheduler(
	db *sql.DB,
	userRepo repository.IUserRepository,
	sessionRepo repository.SessionRepository,
	metricsRepo interfaces.MetricsRepository,
	logger *logrus.Logger,
) *MetricsScheduler {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &MetricsScheduler{
		db:          db,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		metricsRepo: metricsRepo,
		logger:      logger,
		ctx:         ctx,
		cancel:      cancel,
	}
}

// Start starts the metrics scheduler with specified configuration
func (ms *MetricsScheduler) Start(config *Config) error {
	ms.mutex.Lock()
	defer ms.mutex.Unlock()

	if ms.isRunning {
		return fmt.Errorf("metrics scheduler is already running")
	}

	ms.logger.Info("[MetricsScheduler] Starting metrics scheduler...")

	// Start metrics recording
	if config.EnableRecording {
		ms.wg.Add(1)
		go ms.recordingLoop(config.RecordingInterval)
		ms.logger.WithField("interval", config.RecordingInterval).Info("[MetricsScheduler] Metrics recording started")
	}

	// Start cleanup task
	if config.EnableCleanup {
		ms.wg.Add(1)
		go ms.cleanupLoop(config.CleanupInterval, config.RetentionDays)
		ms.logger.WithField("interval", config.CleanupInterval).Info("[MetricsScheduler] Metrics cleanup started")
	}

	ms.isRunning = true
	ms.logger.Info("[MetricsScheduler] Metrics scheduler started successfully")

	return nil
}

// Stop stops the metrics scheduler
func (ms *MetricsScheduler) Stop() error {
	ms.mutex.Lock()
	defer ms.mutex.Unlock()

	if !ms.isRunning {
		return fmt.Errorf("metrics scheduler is not running")
	}

	ms.logger.Info("[MetricsScheduler] Stopping metrics scheduler...")
	ms.cancel()
	ms.wg.Wait()
	ms.isRunning = false
	ms.logger.Info("[MetricsScheduler] Metrics scheduler stopped")

	return nil
}

// IsRunning returns whether the scheduler is currently running
func (ms *MetricsScheduler) IsRunning() bool {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	return ms.isRunning
}

// recordingLoop runs the periodic metrics recording
func (ms *MetricsScheduler) recordingLoop(interval time.Duration) {
	defer ms.wg.Done()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	// Record immediately on start
	if err := ms.recordCurrentMetrics(); err != nil {
		ms.logger.WithError(err).Error("[MetricsScheduler] Failed to record initial metrics")
	}

	for {
		select {
		case <-ms.ctx.Done():
			ms.logger.Info("[MetricsScheduler] Recording loop stopped")
			return
		case <-ticker.C:
			if err := ms.recordCurrentMetrics(); err != nil {
				ms.logger.WithError(err).Error("[MetricsScheduler] Failed to record metrics")
			}
		}
	}
}

// cleanupLoop runs the periodic cleanup of old metrics
func (ms *MetricsScheduler) cleanupLoop(interval time.Duration, retentionDays int) {
	defer ms.wg.Done()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ms.ctx.Done():
			ms.logger.Info("[MetricsScheduler] Cleanup loop stopped")
			return
		case <-ticker.C:
			deleted, err := ms.metricsRepo.CleanupOldMetrics(ms.ctx, retentionDays)
			if err != nil {
				ms.logger.WithError(err).Error("[MetricsScheduler] Failed to cleanup old metrics")
			} else if deleted > 0 {
				ms.logger.WithFields(logrus.Fields{
					"deleted_count":  deleted,
					"retention_days": retentionDays,
				}).Info("[MetricsScheduler] Cleaned up old metrics")
			}
		}
	}
}

// recordCurrentMetrics collects and records current system metrics
func (ms *MetricsScheduler) recordCurrentMetrics() error {
	ctx := context.Background()
	startTime := time.Now()

	// Get all users
	allUsers, err := ms.userRepo.GetAll(ctx)
	if err != nil {
		return fmt.Errorf("failed to get users: %w", err)
	}

	// Calculate user metrics
	totalUsers := int32(len(allUsers))
	activeUsers := int32(0)
	for _, user := range allUsers {
		if user.IsActive {
			activeUsers++
		}
	}

	// Calculate new users today
	newUsersToday := int32(0)
	todayStart := time.Now().Truncate(24 * time.Hour)
	for _, user := range allUsers {
		if user.CreatedAt.After(todayStart) {
			newUsersToday++
		}
	}

	// Get session stats
	// Note: GetActiveSessions requires userID filter, we want all active sessions
	// For now, use a simple count query or set to 0
	// TODO: Add GetAllActiveSessions() method to SessionRepository or query directly
	activeSessionsCount := int32(0)
	totalSessionsCount := int32(0)
	
	// Query active sessions count directly from DB
	var activeCount int
	err = ms.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM user_sessions 
		WHERE is_active = true AND expires_at > NOW()
	`).Scan(&activeCount)
	if err == nil {
		activeSessionsCount = int32(activeCount)
	}
	
	// Query total sessions count
	var totalCount int
	err = ms.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM user_sessions
	`).Scan(&totalCount)
	if err == nil {
		totalSessionsCount = int32(totalCount)
	}

	// TODO: Get security metrics from audit logs when implemented
	suspiciousActivities := int32(0)
	blockedIPs := int32(0)
	securityEvents := int32(0)

	// Create snapshot
	snapshot := &interfaces.MetricsSnapshot{
		RecordedAt:           time.Now(),
		TotalUsers:           totalUsers,
		ActiveUsers:          activeUsers,
		NewUsersToday:        newUsersToday,
		TotalSessions:        totalSessionsCount,
		ActiveSessions:       activeSessionsCount,
		SuspiciousActivities: suspiciousActivities,
		BlockedIPs:           blockedIPs,
		SecurityEvents:       securityEvents,
		// Optional metrics (nil for now)
		AvgResponseTimeMs: nil,
		ErrorRatePercent:  nil,
		UptimePercent:     nil,
	}

	// Record to database
	if err := ms.metricsRepo.RecordMetrics(ctx, snapshot); err != nil {
		return fmt.Errorf("failed to record metrics: %w", err)
	}

	duration := time.Since(startTime)
	ms.logger.WithFields(logrus.Fields{
		"total_users":   totalUsers,
		"active_users":  activeUsers,
		"new_today":     newUsersToday,
		"duration":      duration,
	}).Info("[MetricsScheduler] Metrics recorded successfully")

	return nil
}

// RecordMetricsNow immediately records current metrics (for manual trigger)
func (ms *MetricsScheduler) RecordMetricsNow() error {
	return ms.recordCurrentMetrics()
}

// GetStatus returns the current status of the scheduler
func (ms *MetricsScheduler) GetStatus() map[string]interface{} {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()

	// Get metrics count
	count, _ := ms.metricsRepo.GetMetricsCount(context.Background())
	oldest, _ := ms.metricsRepo.GetOldestMetric(context.Background())

	status := map[string]interface{}{
		"is_running":    ms.isRunning,
		"total_records": count,
	}

	if oldest != nil {
		status["oldest_record"] = oldest.RecordedAt
		status["data_age_hours"] = time.Since(oldest.RecordedAt).Hours()
	}

	return status
}

