package analytics

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
)

// MonitoringService provides real-time monitoring capabilities
type MonitoringService struct {
	db       *sql.DB
	examRepo interfaces.ExamRepository
	logger   *logrus.Logger

	// Real-time monitoring state
	activeExams    map[string]*ActiveExamMonitor
	activeExamsMux sync.RWMutex

	// Background monitoring
	stopChan   chan struct{}
	isRunning  bool
	runningMux sync.RWMutex
}

// ActiveExamMonitor tracks real-time exam activity
type ActiveExamMonitor struct {
	ExamID         string                 `json:"exam_id"`
	ExamTitle      string                 `json:"exam_title"`
	ActiveAttempts int                    `json:"active_attempts"`
	CompletedToday int                    `json:"completed_today"`
	AverageScore   float64                `json:"average_score"`
	LastActivity   time.Time              `json:"last_activity"`
	UserActivity   map[string]*UserStatus `json:"user_activity"`
	Alerts         []MonitoringAlert      `json:"alerts"`
}

// UserStatus tracks individual user exam status
type UserStatus struct {
	UserID          string    `json:"user_id"`
	Status          string    `json:"status"` // "active", "paused", "completed"
	StartTime       time.Time `json:"start_time"`
	LastActivity    time.Time `json:"last_activity"`
	Progress        float64   `json:"progress"` // Percentage completed
	CurrentQuestion int       `json:"current_question"`
}

// MonitoringAlert represents a monitoring alert
type MonitoringAlert struct {
	Type      string    `json:"type"`     // "performance", "security", "system"
	Severity  string    `json:"severity"` // "low", "medium", "high", "critical"
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	ExamID    string    `json:"exam_id,omitempty"`
	UserID    string    `json:"user_id,omitempty"`
}

// SystemHealthMetrics contains system health information
type SystemHealthMetrics struct {
	ActiveUsers    int               `json:"active_users"`
	ActiveExams    int               `json:"active_exams"`
	TotalAttempts  int               `json:"total_attempts"`
	SystemLoad     float64           `json:"system_load"`
	DatabaseHealth string            `json:"database_health"`
	ResponseTime   float64           `json:"response_time"`
	ErrorRate      float64           `json:"error_rate"`
	Alerts         []MonitoringAlert `json:"alerts"`
	LastUpdated    time.Time         `json:"last_updated"`
}

// NewMonitoringService creates a new monitoring service
func NewMonitoringService(db *sql.DB, examRepo interfaces.ExamRepository, logger *logrus.Logger) *MonitoringService {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &MonitoringService{
		db:          db,
		examRepo:    examRepo,
		logger:      logger,
		activeExams: make(map[string]*ActiveExamMonitor),
		stopChan:    make(chan struct{}),
	}
}

// Start begins real-time monitoring
func (s *MonitoringService) Start(ctx context.Context) error {
	s.runningMux.Lock()
	defer s.runningMux.Unlock()

	if s.isRunning {
		return fmt.Errorf("monitoring service is already running")
	}

	s.isRunning = true
	s.logger.Info("Starting real-time monitoring service")

	// Start background monitoring goroutine
	go s.monitoringLoop(ctx)

	return nil
}

// Stop stops real-time monitoring
func (s *MonitoringService) Stop() error {
	s.runningMux.Lock()
	defer s.runningMux.Unlock()

	if !s.isRunning {
		return fmt.Errorf("monitoring service is not running")
	}

	s.logger.Info("Stopping real-time monitoring service")
	close(s.stopChan)
	s.isRunning = false

	return nil
}

// IsRunning returns whether the monitoring service is running
func (s *MonitoringService) IsRunning() bool {
	s.runningMux.RLock()
	defer s.runningMux.RUnlock()
	return s.isRunning
}

// GetActiveExamMonitors returns all active exam monitors
func (s *MonitoringService) GetActiveExamMonitors() map[string]*ActiveExamMonitor {
	s.activeExamsMux.RLock()
	defer s.activeExamsMux.RUnlock()

	// Create a copy to avoid race conditions
	result := make(map[string]*ActiveExamMonitor)
	for k, v := range s.activeExams {
		result[k] = v
	}

	return result
}

// GetSystemHealthMetrics returns current system health metrics
func (s *MonitoringService) GetSystemHealthMetrics(ctx context.Context) (*SystemHealthMetrics, error) {
	metrics := &SystemHealthMetrics{
		LastUpdated: time.Now(),
	}

	// Get active users count
	activeUsersQuery := `
		SELECT COUNT(DISTINCT user_id)
		FROM exam_attempts
		WHERE status = 'in_progress' AND started_at > NOW() - INTERVAL '1 hour'
	`
	err := s.db.QueryRowContext(ctx, activeUsersQuery).Scan(&metrics.ActiveUsers)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get active users count")
	}

	// Get active exams count
	s.activeExamsMux.RLock()
	metrics.ActiveExams = len(s.activeExams)
	s.activeExamsMux.RUnlock()

	// Get total attempts today
	totalAttemptsQuery := `
		SELECT COUNT(*)
		FROM exam_attempts
		WHERE DATE(started_at) = CURRENT_DATE
	`
	err = s.db.QueryRowContext(ctx, totalAttemptsQuery).Scan(&metrics.TotalAttempts)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get total attempts count")
	}

	// Check database health
	start := time.Now()
	err = s.db.PingContext(ctx)
	responseTime := time.Since(start).Seconds() * 1000 // Convert to milliseconds

	if err != nil {
		metrics.DatabaseHealth = "unhealthy"
		metrics.ResponseTime = 0
	} else {
		metrics.DatabaseHealth = "healthy"
		metrics.ResponseTime = responseTime
	}

	// Calculate error rate (simplified)
	metrics.ErrorRate = 0.5 // Placeholder - would be calculated from actual error logs

	// Get system load (simplified)
	metrics.SystemLoad = 0.3 // Placeholder - would be calculated from actual system metrics

	// Collect alerts
	alerts := s.collectSystemAlerts(ctx, metrics)
	metrics.Alerts = alerts

	return metrics, nil
}

// monitoringLoop runs the background monitoring process
func (s *MonitoringService) monitoringLoop(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second) // Update every 30 seconds
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("Monitoring loop stopped due to context cancellation")
			return
		case <-s.stopChan:
			s.logger.Info("Monitoring loop stopped")
			return
		case <-ticker.C:
			s.updateActiveExamMonitors(ctx)
		}
	}
}

// updateActiveExamMonitors updates the active exam monitors
func (s *MonitoringService) updateActiveExamMonitors(ctx context.Context) {
	query := `
		SELECT 
			e.id,
			e.title,
			COUNT(CASE WHEN ea.status = 'in_progress' THEN 1 END) as active_attempts,
			COUNT(CASE WHEN ea.status = 'submitted' AND DATE(ea.submitted_at) = CURRENT_DATE THEN 1 END) as completed_today,
			COALESCE(AVG(CASE WHEN ea.status = 'submitted' THEN ea.percentage END), 0) as average_score,
			MAX(ea.started_at) as last_activity
		FROM exams e
		LEFT JOIN exam_attempts ea ON e.id = ea.exam_id
		WHERE e.status = 'published'
		GROUP BY e.id, e.title
		HAVING COUNT(CASE WHEN ea.status = 'in_progress' THEN 1 END) > 0
		   OR COUNT(CASE WHEN ea.status = 'submitted' AND DATE(ea.submitted_at) = CURRENT_DATE THEN 1 END) > 0
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update active exam monitors")
		return
	}
	defer rows.Close()

	s.activeExamsMux.Lock()
	defer s.activeExamsMux.Unlock()

	// Clear existing monitors
	s.activeExams = make(map[string]*ActiveExamMonitor)

	for rows.Next() {
		var monitor ActiveExamMonitor
		var lastActivity sql.NullTime

		err := rows.Scan(
			&monitor.ExamID,
			&monitor.ExamTitle,
			&monitor.ActiveAttempts,
			&monitor.CompletedToday,
			&monitor.AverageScore,
			&lastActivity,
		)
		if err != nil {
			s.logger.WithError(err).Error("Failed to scan exam monitor data")
			continue
		}

		if lastActivity.Valid {
			monitor.LastActivity = lastActivity.Time
		}

		monitor.UserActivity = make(map[string]*UserStatus)
		monitor.Alerts = []MonitoringAlert{}

		// Get user activity for this exam
		s.updateUserActivity(ctx, &monitor)

		s.activeExams[monitor.ExamID] = &monitor
	}

	s.logger.WithField("active_exams", len(s.activeExams)).Debug("Updated active exam monitors")
}

// updateUserActivity updates user activity for an exam
func (s *MonitoringService) updateUserActivity(ctx context.Context, monitor *ActiveExamMonitor) {
	query := `
		SELECT 
			user_id,
			status,
			started_at,
			COALESCE(last_activity_at, started_at) as last_activity
		FROM exam_attempts
		WHERE exam_id = $1 AND status = 'in_progress'
	`

	rows, err := s.db.QueryContext(ctx, query, monitor.ExamID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get user activity")
		return
	}
	defer rows.Close()

	for rows.Next() {
		var userStatus UserStatus
		err := rows.Scan(
			&userStatus.UserID,
			&userStatus.Status,
			&userStatus.StartTime,
			&userStatus.LastActivity,
		)
		if err != nil {
			s.logger.WithError(err).Error("Failed to scan user activity")
			continue
		}

		// Calculate progress (simplified)
		userStatus.Progress = 0.5      // Placeholder
		userStatus.CurrentQuestion = 1 // Placeholder

		monitor.UserActivity[userStatus.UserID] = &userStatus
	}
}

// collectSystemAlerts collects system alerts based on metrics
func (s *MonitoringService) collectSystemAlerts(ctx context.Context, metrics *SystemHealthMetrics) []MonitoringAlert {
	var alerts []MonitoringAlert

	// Database health alert
	if metrics.DatabaseHealth != "healthy" {
		alerts = append(alerts, MonitoringAlert{
			Type:      "system",
			Severity:  "critical",
			Message:   "Database is unhealthy",
			Timestamp: time.Now(),
		})
	}

	// High response time alert
	if metrics.ResponseTime > 1000 { // More than 1 second
		alerts = append(alerts, MonitoringAlert{
			Type:      "performance",
			Severity:  "high",
			Message:   fmt.Sprintf("High database response time: %.2fms", metrics.ResponseTime),
			Timestamp: time.Now(),
		})
	}

	// High system load alert
	if metrics.SystemLoad > 0.8 {
		alerts = append(alerts, MonitoringAlert{
			Type:      "system",
			Severity:  "medium",
			Message:   fmt.Sprintf("High system load: %.2f", metrics.SystemLoad),
			Timestamp: time.Now(),
		})
	}

	return alerts
}

// RecordExamEvent records an exam-related event for monitoring
func (s *MonitoringService) RecordExamEvent(ctx context.Context, examID, userID, eventType string, metadata map[string]interface{}) error {
	s.logger.WithFields(logrus.Fields{
		"exam_id":    examID,
		"user_id":    userID,
		"event_type": eventType,
		"metadata":   metadata,
	}).Info("Recording exam event")

	// This would typically store events in a monitoring table
	// For now, just log the event
	return nil
}
