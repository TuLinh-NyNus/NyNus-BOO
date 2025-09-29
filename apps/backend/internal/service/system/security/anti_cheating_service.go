package security

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// AntiCheatService provides anti-cheating measures for exams
type AntiCheatService struct {
	db                  *sql.DB
	logger              *logrus.Logger
	examSessionSecurity *ExamSessionSecurity

	// Activity monitoring
	activityTrackers map[string]*ActivityTracker
	activityMux      sync.RWMutex

	// Rate limiting
	rateLimiters   map[string]*ExamRateLimiter
	rateLimiterMux sync.RWMutex
}

// ActivityTracker tracks user activity during exam
type ActivityTracker struct {
	SessionID          string               `json:"session_id"`
	UserID             string               `json:"user_id"`
	ExamID             string               `json:"exam_id"`
	StartTime          time.Time            `json:"start_time"`
	LastActivity       time.Time            `json:"last_activity"`
	QuestionTimes      map[string]time.Time `json:"question_times"`
	AnswerChanges      map[string]int       `json:"answer_changes"`
	SuspiciousPatterns []SuspiciousPattern  `json:"suspicious_patterns"`
	TotalTabSwitches   int                  `json:"total_tab_switches"`
	TotalWindowBlurs   int                  `json:"total_window_blurs"`
	CopyPasteAttempts  int                  `json:"copy_paste_attempts"`
	RightClickAttempts int                  `json:"right_click_attempts"`
}

// SuspiciousPattern represents a detected suspicious pattern
type SuspiciousPattern struct {
	PatternType string                 `json:"pattern_type"`
	Description string                 `json:"description"`
	Confidence  float64                `json:"confidence"`
	DetectedAt  time.Time              `json:"detected_at"`
	Evidence    map[string]interface{} `json:"evidence"`
}

// ExamRateLimiter handles exam-specific rate limiting
type ExamRateLimiter struct {
	UserID         string                  `json:"user_id"`
	ExamID         string                  `json:"exam_id"`
	ActionCounts   map[string]*ActionCount `json:"action_counts"`
	WindowStart    time.Time               `json:"window_start"`
	WindowDuration time.Duration           `json:"window_duration"`
	IsBlocked      bool                    `json:"is_blocked"`
	BlockedUntil   time.Time               `json:"blocked_until"`
}

// ActionCount tracks action counts within a time window
type ActionCount struct {
	Count      int       `json:"count"`
	MaxAllowed int       `json:"max_allowed"`
	LastAction time.Time `json:"last_action"`
}

// AntiCheatConfig contains anti-cheating configuration
type AntiCheatConfig struct {
	MaxTabSwitches          int           `json:"max_tab_switches"`
	MaxWindowBlurs          int           `json:"max_window_blurs"`
	MaxCopyPasteAttempts    int           `json:"max_copy_paste_attempts"`
	MaxAnswerChanges        int           `json:"max_answer_changes"`
	SuspiciousTimeThreshold time.Duration `json:"suspicious_time_threshold"`
	RateLimitWindow         time.Duration `json:"rate_limit_window"`
	MaxActionsPerWindow     int           `json:"max_actions_per_window"`
}

// NewAntiCheatService creates a new anti-cheat service
func NewAntiCheatService(db *sql.DB, examSessionSecurity *ExamSessionSecurity, logger *logrus.Logger) *AntiCheatService {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &AntiCheatService{
		db:                  db,
		logger:              logger,
		examSessionSecurity: examSessionSecurity,
		activityTrackers:    make(map[string]*ActivityTracker),
		rateLimiters:        make(map[string]*ExamRateLimiter),
	}
}

// DefaultAntiCheatConfig returns default anti-cheat configuration
func DefaultAntiCheatConfig() *AntiCheatConfig {
	return &AntiCheatConfig{
		MaxTabSwitches:          5,
		MaxWindowBlurs:          3,
		MaxCopyPasteAttempts:    2,
		MaxAnswerChanges:        10,
		SuspiciousTimeThreshold: 5 * time.Second,
		RateLimitWindow:         1 * time.Minute,
		MaxActionsPerWindow:     30,
	}
}

// StartActivityTracking starts tracking activity for an exam session
func (s *AntiCheatService) StartActivityTracking(ctx context.Context, sessionID, userID, examID string) error {
	s.activityMux.Lock()
	defer s.activityMux.Unlock()

	tracker := &ActivityTracker{
		SessionID:          sessionID,
		UserID:             userID,
		ExamID:             examID,
		StartTime:          time.Now(),
		LastActivity:       time.Now(),
		QuestionTimes:      make(map[string]time.Time),
		AnswerChanges:      make(map[string]int),
		SuspiciousPatterns: []SuspiciousPattern{},
		TotalTabSwitches:   0,
		TotalWindowBlurs:   0,
		CopyPasteAttempts:  0,
		RightClickAttempts: 0,
	}

	s.activityTrackers[sessionID] = tracker

	s.logger.WithFields(logrus.Fields{
		"session_id": sessionID,
		"user_id":    userID,
		"exam_id":    examID,
	}).Info("Started activity tracking")

	return nil
}

// RecordActivity records user activity and checks for suspicious patterns
func (s *AntiCheatService) RecordActivity(ctx context.Context, sessionID, activityType string, data map[string]interface{}) error {
	s.activityMux.Lock()
	tracker, exists := s.activityTrackers[sessionID]
	s.activityMux.Unlock()

	if !exists {
		return fmt.Errorf("activity tracker not found for session: %s", sessionID)
	}

	tracker.LastActivity = time.Now()

	// Process different activity types
	switch activityType {
	case "tab_switch":
		tracker.TotalTabSwitches++
		s.checkTabSwitchViolation(ctx, tracker)
	case "window_blur":
		tracker.TotalWindowBlurs++
		s.checkWindowBlurViolation(ctx, tracker)
	case "copy_paste":
		tracker.CopyPasteAttempts++
		s.checkCopyPasteViolation(ctx, tracker)
	case "right_click":
		tracker.RightClickAttempts++
		s.checkRightClickViolation(ctx, tracker)
	case "question_view":
		if questionID, ok := data["question_id"].(string); ok {
			tracker.QuestionTimes[questionID] = time.Now()
		}
	case "answer_change":
		if questionID, ok := data["question_id"].(string); ok {
			tracker.AnswerChanges[questionID]++
			s.checkAnswerChangePattern(ctx, tracker, questionID)
		}
	case "suspicious_time":
		s.detectSuspiciousTimePattern(ctx, tracker, data)
	}

	// Store activity in database
	go s.storeActivity(context.Background(), sessionID, activityType, data)

	return nil
}

// checkTabSwitchViolation checks for excessive tab switching
func (s *AntiCheatService) checkTabSwitchViolation(ctx context.Context, tracker *ActivityTracker) {
	config := DefaultAntiCheatConfig()

	if tracker.TotalTabSwitches > config.MaxTabSwitches {
		s.recordSecurityViolation(ctx, tracker.SessionID, EventTabSwitch, SeverityHigh,
			fmt.Sprintf("Excessive tab switching: %d times", tracker.TotalTabSwitches))
	} else if tracker.TotalTabSwitches > config.MaxTabSwitches/2 {
		s.recordSecurityViolation(ctx, tracker.SessionID, EventTabSwitch, SeverityMedium,
			fmt.Sprintf("Multiple tab switches detected: %d times", tracker.TotalTabSwitches))
	}
}

// checkWindowBlurViolation checks for excessive window blur events
func (s *AntiCheatService) checkWindowBlurViolation(ctx context.Context, tracker *ActivityTracker) {
	config := DefaultAntiCheatConfig()

	if tracker.TotalWindowBlurs > config.MaxWindowBlurs {
		s.recordSecurityViolation(ctx, tracker.SessionID, EventWindowBlur, SeverityHigh,
			fmt.Sprintf("Excessive window blur events: %d times", tracker.TotalWindowBlurs))
	}
}

// checkCopyPasteViolation checks for copy-paste attempts
func (s *AntiCheatService) checkCopyPasteViolation(ctx context.Context, tracker *ActivityTracker) {
	config := DefaultAntiCheatConfig()

	if tracker.CopyPasteAttempts > config.MaxCopyPasteAttempts {
		s.recordSecurityViolation(ctx, tracker.SessionID, EventCopyPaste, SeverityCritical,
			fmt.Sprintf("Multiple copy-paste attempts: %d times", tracker.CopyPasteAttempts))
	} else if tracker.CopyPasteAttempts > 0 {
		s.recordSecurityViolation(ctx, tracker.SessionID, EventCopyPaste, SeverityMedium,
			fmt.Sprintf("Copy-paste attempt detected: %d times", tracker.CopyPasteAttempts))
	}
}

// checkRightClickViolation checks for right-click attempts
func (s *AntiCheatService) checkRightClickViolation(ctx context.Context, tracker *ActivityTracker) {
	if tracker.RightClickAttempts > 3 {
		s.recordSecurityViolation(ctx, tracker.SessionID, EventRightClick, SeverityMedium,
			fmt.Sprintf("Multiple right-click attempts: %d times", tracker.RightClickAttempts))
	}
}

// checkAnswerChangePattern checks for suspicious answer change patterns
func (s *AntiCheatService) checkAnswerChangePattern(ctx context.Context, tracker *ActivityTracker, questionID string) {
	config := DefaultAntiCheatConfig()
	changes := tracker.AnswerChanges[questionID]

	if changes > config.MaxAnswerChanges {
		pattern := SuspiciousPattern{
			PatternType: "excessive_answer_changes",
			Description: fmt.Sprintf("Question %s changed %d times", questionID, changes),
			Confidence:  0.8,
			DetectedAt:  time.Now(),
			Evidence: map[string]interface{}{
				"question_id": questionID,
				"changes":     changes,
			},
		}

		tracker.SuspiciousPatterns = append(tracker.SuspiciousPatterns, pattern)

		s.recordSecurityViolation(ctx, tracker.SessionID, EventSuspiciousTime, SeverityMedium,
			fmt.Sprintf("Excessive answer changes for question %s: %d times", questionID, changes))
	}
}

// detectSuspiciousTimePattern detects suspicious timing patterns
func (s *AntiCheatService) detectSuspiciousTimePattern(ctx context.Context, tracker *ActivityTracker, data map[string]interface{}) {
	if timeSpent, ok := data["time_spent"].(float64); ok {
		if timeSpent < 5.0 { // Less than 5 seconds
			pattern := SuspiciousPattern{
				PatternType: "too_fast_answer",
				Description: fmt.Sprintf("Answer submitted too quickly: %.2f seconds", timeSpent),
				Confidence:  0.7,
				DetectedAt:  time.Now(),
				Evidence:    data,
			}

			tracker.SuspiciousPatterns = append(tracker.SuspiciousPatterns, pattern)

			s.recordSecurityViolation(ctx, tracker.SessionID, EventSuspiciousTime, SeverityMedium,
				fmt.Sprintf("Suspiciously fast answer: %.2f seconds", timeSpent))
		}
	}
}

// recordSecurityViolation records a security violation
func (s *AntiCheatService) recordSecurityViolation(ctx context.Context, sessionID string, eventType SecurityEventType, severity SecuritySeverity, description string) {
	metadata := map[string]interface{}{
		"detected_by": "anti_cheat_service",
		"timestamp":   time.Now(),
	}

	err := s.examSessionSecurity.RecordSecurityEvent(ctx, sessionID, eventType, severity, description, metadata)
	if err != nil {
		s.logger.WithError(err).Error("Failed to record security violation")
	}
}

// storeActivity stores activity in database
func (s *AntiCheatService) storeActivity(ctx context.Context, sessionID, activityType string, data map[string]interface{}) {
	query := `
		INSERT INTO exam_activity_log (session_id, attempt_id, activity_type, question_id, activity_data, timestamp)
		SELECT $1, attempt_id, $2, $3, $4, $5
		FROM exam_sessions
		WHERE session_id = $1
	`

	questionID := ""
	if qid, ok := data["question_id"].(string); ok {
		questionID = qid
	}

	// Convert data to JSON string (simplified)
	dataJSON := fmt.Sprintf("%v", data)

	_, err := s.db.ExecContext(ctx, query, sessionID, activityType, questionID, dataJSON, time.Now())
	if err != nil {
		s.logger.WithError(err).Error("Failed to store activity")
	}
}

// GetActivitySummary returns activity summary for a session
func (s *AntiCheatService) GetActivitySummary(ctx context.Context, sessionID string) (*ActivityTracker, error) {
	s.activityMux.RLock()
	tracker, exists := s.activityTrackers[sessionID]
	s.activityMux.RUnlock()

	if !exists {
		return nil, fmt.Errorf("activity tracker not found")
	}

	// Return a copy to avoid race conditions
	summary := *tracker
	return &summary, nil
}

// StopActivityTracking stops tracking activity for a session
func (s *AntiCheatService) StopActivityTracking(ctx context.Context, sessionID string) error {
	s.activityMux.Lock()
	defer s.activityMux.Unlock()

	tracker, exists := s.activityTrackers[sessionID]
	if !exists {
		return fmt.Errorf("activity tracker not found")
	}

	// Store final summary
	go s.storeFinalActivitySummary(context.Background(), tracker)

	delete(s.activityTrackers, sessionID)

	s.logger.WithField("session_id", sessionID).Info("Stopped activity tracking")
	return nil
}

// storeFinalActivitySummary stores the final activity summary
func (s *AntiCheatService) storeFinalActivitySummary(ctx context.Context, tracker *ActivityTracker) {
	// This would store a comprehensive summary of the exam session
	// For now, just log the summary
	s.logger.WithFields(logrus.Fields{
		"session_id":           tracker.SessionID,
		"total_tab_switches":   tracker.TotalTabSwitches,
		"total_window_blurs":   tracker.TotalWindowBlurs,
		"copy_paste_attempts":  tracker.CopyPasteAttempts,
		"right_click_attempts": tracker.RightClickAttempts,
		"suspicious_patterns":  len(tracker.SuspiciousPatterns),
	}).Info("Final activity summary")
}
