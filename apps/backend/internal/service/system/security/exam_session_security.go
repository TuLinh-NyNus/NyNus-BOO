package security

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// ExamSessionSecurity manages exam session security and integrity
type ExamSessionSecurity struct {
	db     *sql.DB
	logger *logrus.Logger

	// Active exam sessions tracking
	activeSessions map[string]*ExamSession
	sessionsMux    sync.RWMutex

	// Security configuration
	config *ExamSecurityConfig
}

// ExamSession represents a secure exam session
type ExamSession struct {
	SessionID      string           `json:"session_id"`
	ExamID         string           `json:"exam_id"`
	UserID         string           `json:"user_id"`
	AttemptID      string           `json:"attempt_id"`
	StartTime      time.Time        `json:"start_time"`
	ExpiryTime     time.Time        `json:"expiry_time"`
	IsActive       bool             `json:"is_active"`
	SecurityToken  string           `json:"security_token"`
	IPAddress      string           `json:"ip_address"`
	UserAgent      string           `json:"user_agent"`
	BrowserInfo    *BrowserInfo     `json:"browser_info"`
	SecurityEvents []*SecurityEvent `json:"security_events"`
	LastActivity   time.Time        `json:"last_activity"`
	Violations     int              `json:"violations"`
	IsLocked       bool             `json:"is_locked"`
}

// BrowserInfo contains browser security information
type BrowserInfo struct {
	IsFullScreen bool   `json:"is_fullscreen"`
	TabCount     int    `json:"tab_count"`
	HasDevTools  bool   `json:"has_devtools"`
	WindowSize   string `json:"window_size"`
	ScreenSize   string `json:"screen_size"`
	Timezone     string `json:"timezone"`
	Language     string `json:"language"`
}

// SecurityEvent represents a security event during exam
type SecurityEvent struct {
	EventID     string                 `json:"event_id"`
	EventType   SecurityEventType      `json:"event_type"`
	Severity    SecuritySeverity       `json:"severity"`
	Description string                 `json:"description"`
	Timestamp   time.Time              `json:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// SecurityEventType defines types of security events
type SecurityEventType string

const (
	EventTabSwitch        SecurityEventType = "tab_switch"
	EventWindowBlur       SecurityEventType = "window_blur"
	EventCopyPaste        SecurityEventType = "copy_paste"
	EventRightClick       SecurityEventType = "right_click"
	EventDevToolsOpen     SecurityEventType = "devtools_open"
	EventFullScreenExit   SecurityEventType = "fullscreen_exit"
	EventSuspiciousTime   SecurityEventType = "suspicious_time"
	EventMultipleAttempts SecurityEventType = "multiple_attempts"
	EventIPChange         SecurityEventType = "ip_change"
	EventSessionHijack    SecurityEventType = "session_hijack"
)

// SecuritySeverity defines severity levels
type SecuritySeverity string

const (
	SeverityLow      SecuritySeverity = "low"
	SeverityMedium   SecuritySeverity = "medium"
	SeverityHigh     SecuritySeverity = "high"
	SeverityCritical SecuritySeverity = "critical"
)

// ExamSecurityConfig contains security configuration
type ExamSecurityConfig struct {
	MaxViolations            int           `json:"max_violations"`
	SessionTimeout           time.Duration `json:"session_timeout"`
	ActivityTimeout          time.Duration `json:"activity_timeout"`
	RequireFullScreen        bool          `json:"require_fullscreen"`
	BlockCopyPaste           bool          `json:"block_copy_paste"`
	BlockRightClick          bool          `json:"block_right_click"`
	DetectDevTools           bool          `json:"detect_devtools"`
	MonitorTabSwitching      bool          `json:"monitor_tab_switching"`
	AllowedViolationsPerHour int           `json:"allowed_violations_per_hour"`
}

// NewExamSessionSecurity creates a new exam session security service
func NewExamSessionSecurity(db *sql.DB, logger *logrus.Logger) *ExamSessionSecurity {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &ExamSessionSecurity{
		db:             db,
		logger:         logger,
		activeSessions: make(map[string]*ExamSession),
		config:         DefaultExamSecurityConfig(),
	}
}

// DefaultExamSecurityConfig returns default security configuration
func DefaultExamSecurityConfig() *ExamSecurityConfig {
	return &ExamSecurityConfig{
		MaxViolations:            5,
		SessionTimeout:           2 * time.Hour,
		ActivityTimeout:          30 * time.Minute,
		RequireFullScreen:        true,
		BlockCopyPaste:           true,
		BlockRightClick:          true,
		DetectDevTools:           true,
		MonitorTabSwitching:      true,
		AllowedViolationsPerHour: 3,
	}
}

// CreateExamSession creates a new secure exam session
func (s *ExamSessionSecurity) CreateExamSession(ctx context.Context, examID, userID, attemptID, ipAddress, userAgent string) (*ExamSession, error) {
	s.logger.WithFields(logrus.Fields{
		"exam_id":    examID,
		"user_id":    userID,
		"attempt_id": attemptID,
	}).Info("Creating secure exam session")

	// Generate secure session ID and token
	sessionID, err := s.generateSecureID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate session ID: %w", err)
	}

	securityToken, err := s.generateSecureToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate security token: %w", err)
	}

	// Check for existing active sessions for this user/exam
	if err := s.checkExistingSessions(ctx, userID, examID); err != nil {
		return nil, fmt.Errorf("session validation failed: %w", err)
	}

	// Create exam session
	session := &ExamSession{
		SessionID:      sessionID,
		ExamID:         examID,
		UserID:         userID,
		AttemptID:      attemptID,
		StartTime:      time.Now(),
		ExpiryTime:     time.Now().Add(s.config.SessionTimeout),
		IsActive:       true,
		SecurityToken:  securityToken,
		IPAddress:      ipAddress,
		UserAgent:      userAgent,
		SecurityEvents: []*SecurityEvent{},
		LastActivity:   time.Now(),
		Violations:     0,
		IsLocked:       false,
	}

	// Store session in database
	if err := s.storeSession(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to store session: %w", err)
	}

	// Add to active sessions
	s.sessionsMux.Lock()
	s.activeSessions[sessionID] = session
	s.sessionsMux.Unlock()

	s.logger.WithField("session_id", sessionID).Info("Exam session created successfully")
	return session, nil
}

// ValidateSession validates an exam session
func (s *ExamSessionSecurity) ValidateSession(ctx context.Context, sessionID, securityToken string) (*ExamSession, error) {
	s.sessionsMux.RLock()
	session, exists := s.activeSessions[sessionID]
	s.sessionsMux.RUnlock()

	if !exists {
		// Try to load from database
		var err error
		session, err = s.loadSession(ctx, sessionID)
		if err != nil {
			return nil, fmt.Errorf("session not found: %w", err)
		}
	}

	// Validate security token
	if session.SecurityToken != securityToken {
		s.recordSecurityEvent(session, EventSessionHijack, SeverityCritical, "Invalid security token", nil)
		return nil, fmt.Errorf("invalid security token")
	}

	// Check if session is active
	if !session.IsActive {
		return nil, fmt.Errorf("session is inactive")
	}

	// Check if session is locked
	if session.IsLocked {
		return nil, fmt.Errorf("session is locked due to security violations")
	}

	// Check expiry
	if time.Now().After(session.ExpiryTime) {
		s.terminateSession(ctx, sessionID, "Session expired")
		return nil, fmt.Errorf("session has expired")
	}

	// Check activity timeout
	if time.Since(session.LastActivity) > s.config.ActivityTimeout {
		s.terminateSession(ctx, sessionID, "Activity timeout")
		return nil, fmt.Errorf("session timed out due to inactivity")
	}

	// Update last activity
	session.LastActivity = time.Now()
	s.updateSessionActivity(ctx, sessionID)

	return session, nil
}

// RecordSecurityEvent records a security event for a session
func (s *ExamSessionSecurity) RecordSecurityEvent(ctx context.Context, sessionID string, eventType SecurityEventType, severity SecuritySeverity, description string, metadata map[string]interface{}) error {
	s.sessionsMux.RLock()
	session, exists := s.activeSessions[sessionID]
	s.sessionsMux.RUnlock()

	if !exists {
		return fmt.Errorf("session not found")
	}

	s.recordSecurityEvent(session, eventType, severity, description, metadata)

	// Check if session should be locked
	if session.Violations >= s.config.MaxViolations {
		s.lockSession(ctx, sessionID, "Too many security violations")
	}

	return nil
}

// recordSecurityEvent is an internal method to record security events
func (s *ExamSessionSecurity) recordSecurityEvent(session *ExamSession, eventType SecurityEventType, severity SecuritySeverity, description string, metadata map[string]interface{}) {
	eventID, _ := s.generateSecureID()

	event := &SecurityEvent{
		EventID:     eventID,
		EventType:   eventType,
		Severity:    severity,
		Description: description,
		Timestamp:   time.Now(),
		Metadata:    metadata,
	}

	session.SecurityEvents = append(session.SecurityEvents, event)

	// Increment violations for medium and high severity events
	if severity == SeverityMedium || severity == SeverityHigh || severity == SeverityCritical {
		session.Violations++
	}

	s.logger.WithFields(logrus.Fields{
		"session_id":  session.SessionID,
		"event_type":  eventType,
		"severity":    severity,
		"violations":  session.Violations,
		"description": description,
	}).Warn("Security event recorded")

	// Store event in database
	go s.storeSecurityEvent(context.Background(), session.SessionID, event)
}

// TerminateSession terminates an exam session
func (s *ExamSessionSecurity) TerminateSession(ctx context.Context, sessionID, reason string) error {
	return s.terminateSession(ctx, sessionID, reason)
}

// terminateSession is an internal method to terminate sessions
func (s *ExamSessionSecurity) terminateSession(ctx context.Context, sessionID, reason string) error {
	s.sessionsMux.Lock()
	defer s.sessionsMux.Unlock()

	session, exists := s.activeSessions[sessionID]
	if exists {
		session.IsActive = false
		delete(s.activeSessions, sessionID)
	}

	// Update database
	query := `UPDATE exam_sessions SET is_active = false, terminated_at = NOW(), termination_reason = $2 WHERE session_id = $1`
	_, err := s.db.ExecContext(ctx, query, sessionID, reason)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update session termination in database")
	}

	s.logger.WithFields(logrus.Fields{
		"session_id": sessionID,
		"reason":     reason,
	}).Info("Exam session terminated")

	return nil
}

// lockSession locks a session due to security violations
func (s *ExamSessionSecurity) lockSession(ctx context.Context, sessionID, reason string) error {
	s.sessionsMux.Lock()
	defer s.sessionsMux.Unlock()

	session, exists := s.activeSessions[sessionID]
	if exists {
		session.IsLocked = true
	}

	// Update database
	query := `UPDATE exam_sessions SET is_locked = true, lock_reason = $2 WHERE session_id = $1`
	_, err := s.db.ExecContext(ctx, query, sessionID, reason)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update session lock in database")
	}

	s.logger.WithFields(logrus.Fields{
		"session_id": sessionID,
		"reason":     reason,
	}).Warn("Exam session locked")

	return nil
}

// generateSecureID generates a cryptographically secure ID
func (s *ExamSessionSecurity) generateSecureID() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// generateSecureToken generates a cryptographically secure token
func (s *ExamSessionSecurity) generateSecureToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// checkExistingSessions checks for existing active sessions
func (s *ExamSessionSecurity) checkExistingSessions(ctx context.Context, userID, examID string) error {
	query := `
		SELECT COUNT(*)
		FROM exam_sessions
		WHERE user_id = $1 AND exam_id = $2 AND is_active = true
	`

	var count int
	err := s.db.QueryRowContext(ctx, query, userID, examID).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check existing sessions: %w", err)
	}

	if count > 0 {
		return fmt.Errorf("user already has an active exam session")
	}

	return nil
}

// storeSession stores session in database
func (s *ExamSessionSecurity) storeSession(ctx context.Context, session *ExamSession) error {
	query := `
		INSERT INTO exam_sessions (
			session_id, exam_id, user_id, attempt_id, start_time, expiry_time,
			is_active, security_token, ip_address, user_agent, last_activity
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := s.db.ExecContext(ctx, query,
		session.SessionID,
		session.ExamID,
		session.UserID,
		session.AttemptID,
		session.StartTime,
		session.ExpiryTime,
		session.IsActive,
		session.SecurityToken,
		session.IPAddress,
		session.UserAgent,
		session.LastActivity,
	)

	return err
}

// loadSession loads session from database
func (s *ExamSessionSecurity) loadSession(ctx context.Context, sessionID string) (*ExamSession, error) {
	query := `
		SELECT session_id, exam_id, user_id, attempt_id, start_time, expiry_time,
		       is_active, security_token, ip_address, user_agent, last_activity,
		       COALESCE(violations, 0), COALESCE(is_locked, false)
		FROM exam_sessions
		WHERE session_id = $1
	`

	session := &ExamSession{
		SecurityEvents: []*SecurityEvent{},
	}

	err := s.db.QueryRowContext(ctx, query, sessionID).Scan(
		&session.SessionID,
		&session.ExamID,
		&session.UserID,
		&session.AttemptID,
		&session.StartTime,
		&session.ExpiryTime,
		&session.IsActive,
		&session.SecurityToken,
		&session.IPAddress,
		&session.UserAgent,
		&session.LastActivity,
		&session.Violations,
		&session.IsLocked,
	)

	if err != nil {
		return nil, err
	}

	// Load security events
	events, err := s.loadSecurityEvents(ctx, sessionID)
	if err == nil {
		session.SecurityEvents = events
	}

	return session, nil
}

// updateSessionActivity updates session last activity
func (s *ExamSessionSecurity) updateSessionActivity(ctx context.Context, sessionID string) {
	query := `UPDATE exam_sessions SET last_activity = NOW() WHERE session_id = $1`
	_, err := s.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update session activity")
	}
}

// storeSecurityEvent stores security event in database
func (s *ExamSessionSecurity) storeSecurityEvent(ctx context.Context, sessionID string, event *SecurityEvent) {
	query := `
		INSERT INTO exam_security_events (
			event_id, session_id, event_type, severity, description, timestamp, metadata
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	metadataJSON := "{}"
	if event.Metadata != nil {
		// Convert metadata to JSON (simplified)
		metadataJSON = fmt.Sprintf("%v", event.Metadata)
	}

	_, err := s.db.ExecContext(ctx, query,
		event.EventID,
		sessionID,
		string(event.EventType),
		string(event.Severity),
		event.Description,
		event.Timestamp,
		metadataJSON,
	)

	if err != nil {
		s.logger.WithError(err).Error("Failed to store security event")
	}
}

// loadSecurityEvents loads security events for a session
func (s *ExamSessionSecurity) loadSecurityEvents(ctx context.Context, sessionID string) ([]*SecurityEvent, error) {
	query := `
		SELECT event_id, event_type, severity, description, timestamp, metadata
		FROM exam_security_events
		WHERE session_id = $1
		ORDER BY timestamp DESC
	`

	rows, err := s.db.QueryContext(ctx, query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*SecurityEvent
	for rows.Next() {
		event := &SecurityEvent{}
		var metadataStr string

		err := rows.Scan(
			&event.EventID,
			&event.EventType,
			&event.Severity,
			&event.Description,
			&event.Timestamp,
			&metadataStr,
		)
		if err != nil {
			continue
		}

		// Parse metadata (simplified)
		event.Metadata = make(map[string]interface{})

		events = append(events, event)
	}

	return events, nil
}
