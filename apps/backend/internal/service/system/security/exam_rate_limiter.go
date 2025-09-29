package security

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// ExamRateLimitService provides exam-specific rate limiting
type ExamRateLimitService struct {
	db     *sql.DB
	logger *logrus.Logger

	// In-memory rate limiters
	limiters   map[string]*ExamRateLimiter
	limiterMux sync.RWMutex

	// Configuration
	config *RateLimitConfig
}

// RateLimitConfig contains rate limiting configuration
type RateLimitConfig struct {
	AnswerSubmissionLimit int           `json:"answer_submission_limit"`
	QuestionViewLimit     int           `json:"question_view_limit"`
	NavigationLimit       int           `json:"navigation_limit"`
	WindowSize            time.Duration `json:"window_size"`
	BlockDuration         time.Duration `json:"block_duration"`
	SuspiciousThreshold   int           `json:"suspicious_threshold"`
	CleanupInterval       time.Duration `json:"cleanup_interval"`
}

// RateLimitResult contains the result of a rate limit check
type RateLimitResult struct {
	Allowed      bool      `json:"allowed"`
	Remaining    int       `json:"remaining"`
	ResetTime    time.Time `json:"reset_time"`
	IsBlocked    bool      `json:"is_blocked"`
	BlockedUntil time.Time `json:"blocked_until"`
	Reason       string    `json:"reason"`
}

// ActionType defines types of actions that can be rate limited
type ActionType string

const (
	ActionAnswerSubmit ActionType = "answer_submit"
	ActionQuestionView ActionType = "question_view"
	ActionNavigation   ActionType = "navigation"
	ActionExamStart    ActionType = "exam_start"
	ActionExamSubmit   ActionType = "exam_submit"
	ActionAnswerChange ActionType = "answer_change"
)

// NewExamRateLimitService creates a new exam rate limit service
func NewExamRateLimitService(db *sql.DB, logger *logrus.Logger) *ExamRateLimitService {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	service := &ExamRateLimitService{
		db:       db,
		logger:   logger,
		limiters: make(map[string]*ExamRateLimiter),
		config:   DefaultRateLimitConfig(),
	}

	// Start cleanup goroutine
	go service.cleanupExpiredLimiters()

	return service
}

// DefaultRateLimitConfig returns default rate limiting configuration
func DefaultRateLimitConfig() *RateLimitConfig {
	return &RateLimitConfig{
		AnswerSubmissionLimit: 60,  // 60 answer submissions per minute
		QuestionViewLimit:     120, // 120 question views per minute
		NavigationLimit:       30,  // 30 navigation actions per minute
		WindowSize:            1 * time.Minute,
		BlockDuration:         5 * time.Minute,
		SuspiciousThreshold:   80, // 80% of limit triggers suspicious activity
		CleanupInterval:       10 * time.Minute,
	}
}

// CheckRateLimit checks if an action is allowed under rate limiting
func (s *ExamRateLimitService) CheckRateLimit(ctx context.Context, userID, examID string, action ActionType) (*RateLimitResult, error) {
	key := fmt.Sprintf("%s:%s:%s", userID, examID, string(action))

	s.limiterMux.Lock()
	limiter, exists := s.limiters[key]
	if !exists {
		limiter = s.createNewLimiter(userID, examID, action)
		s.limiters[key] = limiter
	}
	s.limiterMux.Unlock()

	return s.checkLimit(ctx, limiter, action)
}

// createNewLimiter creates a new rate limiter for a user/exam/action combination
func (s *ExamRateLimitService) createNewLimiter(userID, examID string, action ActionType) *ExamRateLimiter {
	now := time.Now()

	limiter := &ExamRateLimiter{
		UserID:         userID,
		ExamID:         examID,
		ActionCounts:   make(map[string]*ActionCount),
		WindowStart:    now,
		WindowDuration: s.config.WindowSize,
		IsBlocked:      false,
		BlockedUntil:   time.Time{},
	}

	// Initialize action count
	maxAllowed := s.getMaxAllowedForAction(action)
	limiter.ActionCounts[string(action)] = &ActionCount{
		Count:      0,
		MaxAllowed: maxAllowed,
		LastAction: now,
	}

	return limiter
}

// getMaxAllowedForAction returns the maximum allowed actions for a specific action type
func (s *ExamRateLimitService) getMaxAllowedForAction(action ActionType) int {
	switch action {
	case ActionAnswerSubmit:
		return s.config.AnswerSubmissionLimit
	case ActionQuestionView:
		return s.config.QuestionViewLimit
	case ActionNavigation:
		return s.config.NavigationLimit
	case ActionExamStart:
		return 3 // Maximum 3 exam starts per window
	case ActionExamSubmit:
		return 5 // Maximum 5 exam submissions per window
	case ActionAnswerChange:
		return 100 // Maximum 100 answer changes per window
	default:
		return 30 // Default limit
	}
}

// checkLimit checks if the action is allowed
func (s *ExamRateLimitService) checkLimit(ctx context.Context, limiter *ExamRateLimiter, action ActionType) (*RateLimitResult, error) {
	now := time.Now()
	actionStr := string(action)

	// Check if currently blocked
	if limiter.IsBlocked && now.Before(limiter.BlockedUntil) {
		return &RateLimitResult{
			Allowed:      false,
			Remaining:    0,
			ResetTime:    limiter.BlockedUntil,
			IsBlocked:    true,
			BlockedUntil: limiter.BlockedUntil,
			Reason:       "Rate limit exceeded - temporarily blocked",
		}, nil
	}

	// Reset block if expired
	if limiter.IsBlocked && now.After(limiter.BlockedUntil) {
		limiter.IsBlocked = false
		limiter.BlockedUntil = time.Time{}
	}

	// Check if window has expired
	if now.Sub(limiter.WindowStart) > limiter.WindowDuration {
		s.resetWindow(limiter, now)
	}

	actionCount, exists := limiter.ActionCounts[actionStr]
	if !exists {
		maxAllowed := s.getMaxAllowedForAction(action)
		actionCount = &ActionCount{
			Count:      0,
			MaxAllowed: maxAllowed,
			LastAction: now,
		}
		limiter.ActionCounts[actionStr] = actionCount
	}

	// Check if limit exceeded
	if actionCount.Count >= actionCount.MaxAllowed {
		// Block the user
		limiter.IsBlocked = true
		limiter.BlockedUntil = now.Add(s.config.BlockDuration)

		// Store in database
		go s.storeRateLimit(context.Background(), limiter, action, true)

		// Log suspicious activity
		s.logger.WithFields(logrus.Fields{
			"user_id":     limiter.UserID,
			"exam_id":     limiter.ExamID,
			"action":      action,
			"count":       actionCount.Count,
			"max_allowed": actionCount.MaxAllowed,
		}).Warn("Rate limit exceeded - user blocked")

		return &RateLimitResult{
			Allowed:      false,
			Remaining:    0,
			ResetTime:    limiter.BlockedUntil,
			IsBlocked:    true,
			BlockedUntil: limiter.BlockedUntil,
			Reason:       fmt.Sprintf("Rate limit exceeded for %s", action),
		}, nil
	}

	// Check for suspicious activity (approaching limit)
	suspiciousThreshold := int(float64(actionCount.MaxAllowed) * float64(s.config.SuspiciousThreshold) / 100.0)
	if actionCount.Count >= suspiciousThreshold {
		s.logger.WithFields(logrus.Fields{
			"user_id":   limiter.UserID,
			"exam_id":   limiter.ExamID,
			"action":    action,
			"count":     actionCount.Count,
			"threshold": suspiciousThreshold,
		}).Warn("Suspicious activity detected - approaching rate limit")
	}

	// Allow the action
	actionCount.Count++
	actionCount.LastAction = now

	// Store in database
	go s.storeRateLimit(context.Background(), limiter, action, false)

	remaining := actionCount.MaxAllowed - actionCount.Count
	resetTime := limiter.WindowStart.Add(limiter.WindowDuration)

	return &RateLimitResult{
		Allowed:      true,
		Remaining:    remaining,
		ResetTime:    resetTime,
		IsBlocked:    false,
		BlockedUntil: time.Time{},
		Reason:       "Action allowed",
	}, nil
}

// resetWindow resets the rate limiting window
func (s *ExamRateLimitService) resetWindow(limiter *ExamRateLimiter, now time.Time) {
	limiter.WindowStart = now

	// Reset all action counts
	for actionStr, actionCount := range limiter.ActionCounts {
		actionCount.Count = 0
		actionCount.LastAction = now

		// Update max allowed in case config changed
		action := ActionType(actionStr)
		actionCount.MaxAllowed = s.getMaxAllowedForAction(action)
	}
}

// storeRateLimit stores rate limit information in database
func (s *ExamRateLimitService) storeRateLimit(ctx context.Context, limiter *ExamRateLimiter, action ActionType, isBlocked bool) {
	actionCount := limiter.ActionCounts[string(action)]

	query := `
		INSERT INTO exam_rate_limits (
			user_id, exam_id, action_type, action_count, window_start, window_end,
			max_actions, is_blocked
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id, exam_id, action_type, window_start)
		DO UPDATE SET
			action_count = EXCLUDED.action_count,
			is_blocked = EXCLUDED.is_blocked
	`

	windowEnd := limiter.WindowStart.Add(limiter.WindowDuration)

	_, err := s.db.ExecContext(ctx, query,
		limiter.UserID,
		limiter.ExamID,
		string(action),
		actionCount.Count,
		limiter.WindowStart,
		windowEnd,
		actionCount.MaxAllowed,
		isBlocked,
	)

	if err != nil {
		s.logger.WithError(err).Error("Failed to store rate limit")
	}
}

// GetRateLimitStatus returns current rate limit status for a user/exam
func (s *ExamRateLimitService) GetRateLimitStatus(ctx context.Context, userID, examID string) (map[ActionType]*RateLimitResult, error) {
	status := make(map[ActionType]*RateLimitResult)

	actions := []ActionType{
		ActionAnswerSubmit,
		ActionQuestionView,
		ActionNavigation,
		ActionExamStart,
		ActionExamSubmit,
		ActionAnswerChange,
	}

	for _, action := range actions {
		result, err := s.CheckRateLimit(ctx, userID, examID, action)
		if err != nil {
			s.logger.WithError(err).Error("Failed to check rate limit status")
			continue
		}

		// Don't increment count, just check status
		key := fmt.Sprintf("%s:%s:%s", userID, examID, string(action))
		s.limiterMux.RLock()
		if limiter, exists := s.limiters[key]; exists {
			if actionCount, exists := limiter.ActionCounts[string(action)]; exists {
				actionCount.Count-- // Revert the increment from CheckRateLimit
			}
		}
		s.limiterMux.RUnlock()

		status[action] = result
	}

	return status, nil
}

// ResetUserRateLimit resets rate limits for a specific user/exam (admin function)
func (s *ExamRateLimitService) ResetUserRateLimit(ctx context.Context, userID, examID string) error {
	s.limiterMux.Lock()
	defer s.limiterMux.Unlock()

	// Remove from memory
	for key := range s.limiters {
		if fmt.Sprintf("%s:%s:", userID, examID) == key[:len(userID)+len(examID)+2] {
			delete(s.limiters, key)
		}
	}

	// Remove from database
	query := `DELETE FROM exam_rate_limits WHERE user_id = $1 AND exam_id = $2`
	_, err := s.db.ExecContext(ctx, query, userID, examID)
	if err != nil {
		return fmt.Errorf("failed to reset rate limits in database: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"user_id": userID,
		"exam_id": examID,
	}).Info("Rate limits reset")

	return nil
}

// cleanupExpiredLimiters removes expired rate limiters from memory
func (s *ExamRateLimitService) cleanupExpiredLimiters() {
	ticker := time.NewTicker(s.config.CleanupInterval)
	defer ticker.Stop()

	for range ticker.C {
		s.limiterMux.Lock()
		now := time.Now()

		for key, limiter := range s.limiters {
			// Remove if window expired and not blocked
			if now.Sub(limiter.WindowStart) > limiter.WindowDuration*2 && !limiter.IsBlocked {
				delete(s.limiters, key)
			}

			// Remove if block expired
			if limiter.IsBlocked && now.After(limiter.BlockedUntil.Add(time.Hour)) {
				delete(s.limiters, key)
			}
		}

		s.limiterMux.Unlock()

		// Also cleanup database
		go s.cleanupDatabase()
	}
}

// cleanupDatabase removes old rate limit entries from database
func (s *ExamRateLimitService) cleanupDatabase() {
	ctx := context.Background()
	query := `DELETE FROM exam_rate_limits WHERE window_end < $1`
	cutoff := time.Now().Add(-24 * time.Hour) // Keep 24 hours of history

	_, err := s.db.ExecContext(ctx, query, cutoff)
	if err != nil {
		s.logger.WithError(err).Error("Failed to cleanup old rate limit entries")
	}
}
