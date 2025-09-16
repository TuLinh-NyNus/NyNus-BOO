package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
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

// auditLogRepository implements AuditLogRepository
type auditLogRepository struct {
	db *sql.DB
}

// NewAuditLogRepository creates a new audit log repository
func NewAuditLogRepository(db *sql.DB) AuditLogRepository {
	return &auditLogRepository{db: db}
}

// Create creates a new audit log entry
func (r *auditLogRepository) Create(ctx context.Context, log *AuditLog) error {
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
	
	return err
}

// GetByID gets an audit log by ID
func (r *auditLogRepository) GetByID(ctx context.Context, id string) (*AuditLog, error) {
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
		return nil, ErrNotFound
	}
	
	return log, err
}

// GetByUserID gets audit logs for a specific user
func (r *auditLogRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*AuditLog, error) {
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
		return nil, err
	}
	defer rows.Close()
	
	return r.scanLogs(rows)
}

// GetByResource gets audit logs for a specific resource
func (r *auditLogRepository) GetByResource(ctx context.Context, resource, resourceID string, limit, offset int) ([]*AuditLog, error) {
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
		return nil, err
	}
	defer rows.Close()
	
	return r.scanLogs(rows)
}

// GetByDateRange gets audit logs within a date range
func (r *auditLogRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time, limit, offset int) ([]*AuditLog, error) {
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
		return nil, err
	}
	defer rows.Close()
	
	return r.scanLogs(rows)
}

// GetFailedActions gets audit logs for failed actions
func (r *auditLogRepository) GetFailedActions(ctx context.Context, limit, offset int) ([]*AuditLog, error) {
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
		return nil, err
	}
	defer rows.Close()
	
	return r.scanLogs(rows)
}

// GetSecurityEvents gets security-related audit logs
func (r *auditLogRepository) GetSecurityEvents(ctx context.Context, limit, offset int) ([]*AuditLog, error) {
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
		return nil, err
	}
	defer rows.Close()
	
	return r.scanLogs(rows)
}

// DeleteOldLogs deletes audit logs older than specified date
func (r *auditLogRepository) DeleteOldLogs(ctx context.Context, olderThan time.Time) error {
	query := `DELETE FROM audit_logs WHERE created_at < $1`
	_, err := r.db.ExecContext(ctx, query, olderThan)
	return err
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
			return nil, err
		}
		logs = append(logs, log)
	}
	
	return logs, nil
}