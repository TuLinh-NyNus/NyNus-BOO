package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"github.com/sirupsen/logrus"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID           string
	UserID       *string // nullable for anonymous actions
	Action       string  // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, DOWNLOAD, etc.
	Resource     string  // USER, COURSE, EXAM, QUESTION, etc.
	ResourceID   string
	OldValues    json.RawMessage
	NewValues    json.RawMessage
	IPAddress    string
	UserAgent    string
	SessionID    string
	Success      bool
	ErrorMessage string
	Metadata     json.RawMessage
	CreatedAt    time.Time
}

// AuditLogRepository handles audit log data access
type AuditLogRepository interface {
	Create(ctx context.Context, log *AuditLog) error
	GetByID(ctx context.Context, id string) (*AuditLog, error)
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*AuditLog, error)
	GetByResource(ctx context.Context, resource, resourceID string, limit, offset int) ([]*AuditLog, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time, limit, offset int) ([]*AuditLog, error)
	GetFailedActions(ctx context.Context, limit, offset int) ([]*AuditLog, error)
	GetSecurityEvents(ctx context.Context, limit, offset int) ([]*AuditLog, error)
	DeleteOldLogs(ctx context.Context, olderThan time.Time) error
}

var (
	// Validation regex patterns
	ulidRegexAudit = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{26}$`)
)

// Validation helpers for audit log repository
func validateAuditLogID(logID string) error {
	if logID == "" {
		return fmt.Errorf("audit log ID cannot be empty")
	}
	if !ulidRegexAudit.MatchString(logID) {
		return fmt.Errorf("invalid audit log ID format: must be ULID")
	}
	return nil
}

func validateAuditUserID(userID string) error {
	if userID == "" {
		return fmt.Errorf("user ID cannot be empty")
	}
	if !ulidRegexAudit.MatchString(userID) {
		return fmt.Errorf("invalid user ID format: must be ULID")
	}
	return nil
}

func validateAuditAction(action string) error {
	if action == "" {
		return fmt.Errorf("action cannot be empty")
	}
	if len(action) < 3 {
		return fmt.Errorf("action too short: minimum 3 characters")
	}
	return nil
}

func validateAuditResource(resource string) error {
	if resource == "" {
		return fmt.Errorf("resource cannot be empty")
	}
	if len(resource) < 3 {
		return fmt.Errorf("resource too short: minimum 3 characters")
	}
	return nil
}

func validatePaginationParams(limit, offset int) error {
	if limit <= 0 {
		return fmt.Errorf("limit must be positive")
	}
	if limit > 1000 {
		return fmt.Errorf("limit too large: maximum 1000")
	}
	if offset < 0 {
		return fmt.Errorf("offset cannot be negative")
	}
	return nil
}

// auditLogRepository implements AuditLogRepository
type auditLogRepository struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewAuditLogRepository creates a new audit log repository with logger injection
func NewAuditLogRepository(db *sql.DB, logger *logrus.Logger) AuditLogRepository {
	// Create default logger if not provided
	if logger == nil {
		logger = logrus.New()
		logger.SetLevel(logrus.InfoLevel)
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
			FieldMap: logrus.FieldMap{
				logrus.FieldKeyTime:  "timestamp",
				logrus.FieldKeyLevel: "level",
				logrus.FieldKeyMsg:   "message",
			},
		})
	}

	return &auditLogRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates a new audit log entry
func (r *auditLogRepository) Create(ctx context.Context, log *AuditLog) error {
	// Validate input
	if err := validateAuditAction(log.Action); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"action":    log.Action,
		}).Error("Invalid action")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateAuditResource(log.Resource); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"resource":  log.Resource,
		}).Error("Invalid resource")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Log security events at Warn level, normal events at Info level
	logLevel := logrus.InfoLevel
	if !log.Success || isSecurityEvent(log.Action) {
		logLevel = logrus.WarnLevel
	}

	r.logger.WithFields(logrus.Fields{
		"operation":   "Create",
		"log_id":      log.ID,
		"user_id":     log.UserID,
		"action":      log.Action,
		"resource":    log.Resource,
		"resource_id": log.ResourceID,
		"success":     log.Success,
		"ip_address":  log.IPAddress,
	}).Log(logLevel, "Creating audit log entry")

	query := `
		INSERT INTO audit_logs (
			id, user_id, action, resource, resource_id,
			old_values, new_values, ip_address, user_agent,
			session_id, success, error_message, metadata, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

	_, err := r.db.ExecContext(ctx, query,
		log.ID,
		log.UserID,
		log.Action,
		log.Resource,
		log.ResourceID,
		log.OldValues,
		log.NewValues,
		log.IPAddress,
		log.UserAgent,
		log.SessionID,
		log.Success,
		log.ErrorMessage,
		log.Metadata,
		log.CreatedAt,
	)

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"log_id":    log.ID,
			"action":    log.Action,
		}).WithError(err).Error("Failed to create audit log entry")
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Create",
		"log_id":    log.ID,
		"action":    log.Action,
		"success":   log.Success,
	}).Log(logLevel, "Audit log entry created successfully")

	return nil
}

// isSecurityEvent checks if an action is a security-related event
func isSecurityEvent(action string) bool {
	securityActions := map[string]bool{
		"LOGIN":                  true,
		"LOGOUT":                 true,
		"LOGIN_FAILED":           true,
		"PASSWORD_RESET":         true,
		"PASSWORD_CHANGE":        true,
		"PERMISSION_DENIED":      true,
		"ACCOUNT_LOCKED":         true,
		"SUSPICIOUS_ACTIVITY":    true,
		"SESSION_HIJACK_ATTEMPT": true,
		"TERMINATE_SESSION":      true,
		"TERMINATE_ALL_SESSIONS": true,
		"UPDATE_USER_ROLE":       true,
		"UPDATE_USER_STATUS":     true,
	}
	return securityActions[action]
}

// GetByID gets an audit log by ID
func (r *auditLogRepository) GetByID(ctx context.Context, id string) (*AuditLog, error) {
	// Validate input
	if err := validateAuditLogID(id); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByID",
			"log_id":    id,
		}).Error("Invalid audit log ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByID",
		"log_id":    id,
	}).Debug("Fetching audit log by ID")

	query := `
		SELECT id, user_id, action, resource, resource_id,
			   old_values, new_values, ip_address, user_agent,
			   session_id, success, error_message, metadata, created_at
		FROM audit_logs
		WHERE id = $1
	`

	log := &AuditLog{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&log.ID,
		&log.UserID,
		&log.Action,
		&log.Resource,
		&log.ResourceID,
		&log.OldValues,
		&log.NewValues,
		&log.IPAddress,
		&log.UserAgent,
		&log.SessionID,
		&log.Success,
		&log.ErrorMessage,
		&log.Metadata,
		&log.CreatedAt,
	)

	if err == sql.ErrNoRows {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByID",
			"log_id":    id,
		}).Warn("Audit log not found")
		return nil, ErrNotFound
	}

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByID",
			"log_id":    id,
		}).WithError(err).Error("Failed to get audit log")
		return nil, fmt.Errorf("failed to get audit log: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByID",
		"log_id":    log.ID,
		"action":    log.Action,
		"resource":  log.Resource,
	}).Debug("Audit log fetched successfully")

	return log, nil
}

// GetByUserID gets audit logs for a specific user
func (r *auditLogRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*AuditLog, error) {
	// Validate input
	if err := validateAuditUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}
	if err := validatePaginationParams(limit, offset); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"limit":     limit,
			"offset":    offset,
		}).Error("Invalid pagination parameters")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByUserID",
		"user_id":   userID,
		"limit":     limit,
		"offset":    offset,
	}).Debug("Fetching audit logs by user ID")

	query := `
		SELECT id, user_id, action, resource, resource_id,
			   old_values, new_values, ip_address, user_agent,
			   session_id, success, error_message, metadata, created_at
		FROM audit_logs
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).WithError(err).Error("Failed to get audit logs by user ID")
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}
	defer rows.Close()

	logs, err := r.scanLogs(rows)
	if err != nil {
		return nil, err
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByUserID",
		"user_id":   userID,
		"log_count": len(logs),
	}).Debug("Audit logs fetched successfully")

	return logs, nil
}

// GetByResource gets audit logs for a specific resource
func (r *auditLogRepository) GetByResource(ctx context.Context, resource, resourceID string, limit, offset int) ([]*AuditLog, error) {
	// Validate input
	if err := validateAuditResource(resource); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByResource",
			"resource":  resource,
		}).Error("Invalid resource")
		return nil, fmt.Errorf("validation failed: %w", err)
	}
	if err := validatePaginationParams(limit, offset); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByResource",
			"limit":     limit,
			"offset":    offset,
		}).Error("Invalid pagination parameters")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":   "GetByResource",
		"resource":    resource,
		"resource_id": resourceID,
		"limit":       limit,
		"offset":      offset,
	}).Debug("Fetching audit logs by resource")

	query := `
		SELECT id, user_id, action, resource, resource_id,
			   old_values, new_values, ip_address, user_agent,
			   session_id, success, error_message, metadata, created_at
		FROM audit_logs
		WHERE resource = $1 AND resource_id = $2
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.db.QueryContext(ctx, query, resource, resourceID, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByResource",
			"resource":  resource,
		}).WithError(err).Error("Failed to get audit logs by resource")
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}
	defer rows.Close()

	logs, err := r.scanLogs(rows)
	if err != nil {
		return nil, err
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByResource",
		"resource":  resource,
		"log_count": len(logs),
	}).Debug("Audit logs fetched successfully")

	return logs, nil
}

// GetByDateRange gets audit logs within a date range
func (r *auditLogRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time, limit, offset int) ([]*AuditLog, error) {
	// Validate input
	if startDate.After(endDate) {
		r.logger.WithFields(logrus.Fields{
			"operation":  "GetByDateRange",
			"start_date": startDate,
			"end_date":   endDate,
		}).Error("Invalid date range: start date after end date")
		return nil, fmt.Errorf("invalid date range: start date must be before end date")
	}
	if err := validatePaginationParams(limit, offset); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByDateRange",
			"limit":     limit,
			"offset":    offset,
		}).Error("Invalid pagination parameters")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "GetByDateRange",
		"start_date": startDate,
		"end_date":   endDate,
		"limit":      limit,
		"offset":     offset,
	}).Debug("Fetching audit logs by date range")

	query := `
		SELECT id, user_id, action, resource, resource_id,
			   old_values, new_values, ip_address, user_agent,
			   session_id, success, error_message, metadata, created_at
		FROM audit_logs
		WHERE created_at >= $1 AND created_at <= $2
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.db.QueryContext(ctx, query, startDate, endDate, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByDateRange",
		}).WithError(err).Error("Failed to get audit logs by date range")
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}
	defer rows.Close()

	logs, err := r.scanLogs(rows)
	if err != nil {
		return nil, err
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByDateRange",
		"log_count": len(logs),
	}).Debug("Audit logs fetched successfully")

	return logs, nil
}

// GetFailedActions gets audit logs for failed actions
func (r *auditLogRepository) GetFailedActions(ctx context.Context, limit, offset int) ([]*AuditLog, error) {
	// Validate input
	if err := validatePaginationParams(limit, offset); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetFailedActions",
			"limit":     limit,
			"offset":    offset,
		}).Error("Invalid pagination parameters")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetFailedActions",
		"limit":     limit,
		"offset":    offset,
	}).Warn("Fetching failed action audit logs")

	query := `
		SELECT id, user_id, action, resource, resource_id,
			   old_values, new_values, ip_address, user_agent,
			   session_id, success, error_message, metadata, created_at
		FROM audit_logs
		WHERE success = false
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetFailedActions",
		}).WithError(err).Error("Failed to get failed action audit logs")
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}
	defer rows.Close()

	logs, err := r.scanLogs(rows)
	if err != nil {
		return nil, err
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetFailedActions",
		"log_count": len(logs),
	}).Warn("Failed action audit logs fetched successfully")

	return logs, nil
}

// GetSecurityEvents gets security-related audit logs
func (r *auditLogRepository) GetSecurityEvents(ctx context.Context, limit, offset int) ([]*AuditLog, error) {
	// Validate input
	if err := validatePaginationParams(limit, offset); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetSecurityEvents",
			"limit":     limit,
			"offset":    offset,
		}).Error("Invalid pagination parameters")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetSecurityEvents",
		"limit":     limit,
		"offset":    offset,
	}).Warn("Fetching security event audit logs")

	query := `
		SELECT id, user_id, action, resource, resource_id,
			   old_values, new_values, ip_address, user_agent,
			   session_id, success, error_message, metadata, created_at
		FROM audit_logs
		WHERE action IN ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_RESET',
						 'PASSWORD_CHANGE', 'PERMISSION_DENIED', 'ACCOUNT_LOCKED',
						 'SUSPICIOUS_ACTIVITY', 'SESSION_HIJACK_ATTEMPT')
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetSecurityEvents",
		}).WithError(err).Error("Failed to get security event audit logs")
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}
	defer rows.Close()

	logs, err := r.scanLogs(rows)
	if err != nil {
		return nil, err
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetSecurityEvents",
		"log_count": len(logs),
	}).Warn("Security event audit logs fetched successfully")

	return logs, nil
}

// DeleteOldLogs deletes audit logs older than specified date
func (r *auditLogRepository) DeleteOldLogs(ctx context.Context, olderThan time.Time) error {
	r.logger.WithFields(logrus.Fields{
		"operation":  "DeleteOldLogs",
		"older_than": olderThan,
	}).Warn("Deleting old audit logs")

	query := `DELETE FROM audit_logs WHERE created_at < $1`
	result, err := r.db.ExecContext(ctx, query, olderThan)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "DeleteOldLogs",
			"older_than": olderThan,
		}).WithError(err).Error("Failed to delete old audit logs")
		return fmt.Errorf("failed to delete old audit logs: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":     "DeleteOldLogs",
		"older_than":    olderThan,
		"rows_affected": rowsAffected,
	}).Warn("Old audit logs deleted successfully")

	return nil
}

// scanLogs scans rows into audit log slice
func (r *auditLogRepository) scanLogs(rows *sql.Rows) ([]*AuditLog, error) {
	var logs []*AuditLog
	for rows.Next() {
		log := &AuditLog{}
		err := rows.Scan(
			&log.ID,
			&log.UserID,
			&log.Action,
			&log.Resource,
			&log.ResourceID,
			&log.OldValues,
			&log.NewValues,
			&log.IPAddress,
			&log.UserAgent,
			&log.SessionID,
			&log.Success,
			&log.ErrorMessage,
			&log.Metadata,
			&log.CreatedAt,
		)
		if err != nil {
			r.logger.WithFields(logrus.Fields{
				"operation": "scanLogs",
			}).WithError(err).Error("Failed to scan audit log row")
			return nil, fmt.Errorf("failed to scan audit log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, nil
}
