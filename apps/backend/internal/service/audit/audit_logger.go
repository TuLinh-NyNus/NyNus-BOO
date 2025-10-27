package audit

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// AuditLogger handles audit logging for sensitive operations
type AuditLogger struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewAuditLogger creates a new audit logger
func NewAuditLogger(db *sql.DB, logger *logrus.Logger) *AuditLogger {
	return &AuditLogger{
		db:     db,
		logger: logger,
	}
}

// AuditAction represents the type of action being audited
type AuditAction string

const (
	ActionApprove       AuditAction = "APPROVE"
	ActionReject        AuditAction = "REJECT"
	ActionArchive       AuditAction = "ARCHIVE"
	ActionDelete        AuditAction = "DELETE"
	ActionCreate        AuditAction = "CREATE"
	ActionUpdate        AuditAction = "UPDATE"
	ActionUpload        AuditAction = "UPLOAD"
	ActionDownload      AuditAction = "DOWNLOAD"
	ActionRoleChange    AuditAction = "ROLE_CHANGE"
	ActionPermission    AuditAction = "PERMISSION_CHANGE"
	ActionConfigChange  AuditAction = "CONFIG_CHANGE"
	ActionBulkOperation AuditAction = "BULK_OPERATION"
)

// AuditEntity represents the entity type being audited
type AuditEntity string

const (
	EntityLibraryItem AuditEntity = "library_item"
	EntityExam        AuditEntity = "exam"
	EntityBook        AuditEntity = "book"
	EntityVideo       AuditEntity = "video"
	EntityTag         AuditEntity = "tag"
	EntityUser        AuditEntity = "user"
	EntitySystem      AuditEntity = "system"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID          string
	UserID      string
	UserRole    string
	Action      AuditAction
	Entity      AuditEntity
	EntityID    string
	Description string
	Metadata    map[string]interface{}
	IPAddress   string
	UserAgent   string
	CreatedAt   time.Time
}

// LogApproval logs an approval action
func (a *AuditLogger) LogApproval(ctx context.Context, userID, itemID, status, note string) error {
	metadata := map[string]interface{}{
		"status":        status,
		"reviewer_note": note,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      userID,
		Action:      ActionApprove,
		Entity:      EntityLibraryItem,
		EntityID:    itemID,
		Description: "Library item approval status changed",
		Metadata:    metadata,
	})
}

// LogRejection logs a rejection action
func (a *AuditLogger) LogRejection(ctx context.Context, userID, itemID, reason string) error {
	metadata := map[string]interface{}{
		"rejection_reason": reason,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      userID,
		Action:      ActionReject,
		Entity:      EntityLibraryItem,
		EntityID:    itemID,
		Description: "Library item rejected",
		Metadata:    metadata,
	})
}

// LogDeletion logs a deletion action
func (a *AuditLogger) LogDeletion(ctx context.Context, userID, entityType, entityID, reason string) error {
	metadata := map[string]interface{}{
		"deletion_reason": reason,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      userID,
		Action:      ActionDelete,
		Entity:      AuditEntity(entityType),
		EntityID:    entityID,
		Description: "Entity deleted",
		Metadata:    metadata,
	})
}

// LogUpload logs a file upload action
func (a *AuditLogger) LogUpload(ctx context.Context, userID, itemID, filename string, size int64) error {
	metadata := map[string]interface{}{
		"filename":  filename,
		"file_size": size,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      userID,
		Action:      ActionUpload,
		Entity:      EntityLibraryItem,
		EntityID:    itemID,
		Description: "File uploaded to library",
		Metadata:    metadata,
	})
}

// LogBulkOperation logs a bulk operation
func (a *AuditLogger) LogBulkOperation(ctx context.Context, userID, operation string, count int, entityIDs []string) error {
	metadata := map[string]interface{}{
		"operation":  operation,
		"count":      count,
		"entity_ids": entityIDs,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      userID,
		Action:      ActionBulkOperation,
		Entity:      EntityLibraryItem,
		Description: "Bulk operation performed",
		Metadata:    metadata,
	})
}

// LogRoleChange logs a user role change
func (a *AuditLogger) LogRoleChange(ctx context.Context, adminID, targetUserID, oldRole, newRole string) error {
	metadata := map[string]interface{}{
		"old_role": oldRole,
		"new_role": newRole,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      adminID,
		Action:      ActionRoleChange,
		Entity:      EntityUser,
		EntityID:    targetUserID,
		Description: "User role changed",
		Metadata:    metadata,
	})
}

// LogConfigChange logs a system configuration change
func (a *AuditLogger) LogConfigChange(ctx context.Context, userID, configKey, oldValue, newValue string) error {
	metadata := map[string]interface{}{
		"config_key": configKey,
		"old_value":  oldValue,
		"new_value":  newValue,
	}

	return a.LogAction(ctx, &AuditLog{
		UserID:      userID,
		Action:      ActionConfigChange,
		Entity:      EntitySystem,
		Description: "System configuration changed",
		Metadata:    metadata,
	})
}

// LogAction logs a generic audit action
func (a *AuditLogger) LogAction(ctx context.Context, log *AuditLog) error {
	// Generate ID if not provided
	if log.ID == "" {
		log.ID = uuid.New().String()
	}

	// Set timestamp
	log.CreatedAt = time.Now()

	// Extract IP and user agent from context if available
	log.IPAddress = getIPFromContext(ctx)
	log.UserAgent = getUserAgentFromContext(ctx)
	log.UserRole = getUserRoleFromContext(ctx)

	// Convert metadata to JSON
	metadataJSON, err := json.Marshal(log.Metadata)
	if err != nil {
		a.logger.WithError(err).Error("Failed to marshal audit metadata")
		metadataJSON = []byte("{}")
	}

	// Log to logger first (as backup)
	a.logger.WithFields(logrus.Fields{
		"audit_id":    log.ID,
		"user_id":     log.UserID,
		"user_role":   log.UserRole,
		"action":      log.Action,
		"entity":      log.Entity,
		"entity_id":   log.EntityID,
		"description": log.Description,
		"ip_address":  log.IPAddress,
	}).Info("Audit log")

	// TODO: Store in database
	// For now, we'll just log. When audit_logs table is ready, use this query:
	/*
		query := `
			INSERT INTO audit_logs (id, user_id, user_role, action, entity, entity_id, description, metadata, ip_address, user_agent, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		`

		_, err = a.db.ExecContext(ctx, query,
			log.ID,
			log.UserID,
			log.UserRole,
			log.Action,
			log.Entity,
			log.EntityID,
			log.Description,
			metadataJSON,
			log.IPAddress,
			log.UserAgent,
			log.CreatedAt,
		)

		if err != nil {
			a.logger.WithError(err).Error("Failed to insert audit log")
			return err
		}
	*/

	a.logger.WithField("metadata", string(metadataJSON)).Debug("Audit log stored")

	return nil
}

// QueryAuditLogs retrieves audit logs with filters
func (a *AuditLogger) QueryAuditLogs(ctx context.Context, filters AuditLogFilters) ([]*AuditLog, error) {
	// TODO: Implement when audit_logs table is ready
	a.logger.WithFields(logrus.Fields{
		"user_id":   filters.UserID,
		"action":    filters.Action,
		"entity":    filters.Entity,
		"entity_id": filters.EntityID,
		"from":      filters.From,
		"to":        filters.To,
	}).Debug("Querying audit logs")

	// Placeholder: return empty array
	return []*AuditLog{}, nil
}

// AuditLogFilters represents filters for audit log queries
type AuditLogFilters struct {
	UserID   string
	Action   AuditAction
	Entity   AuditEntity
	EntityID string
	From     time.Time
	To       time.Time
	Limit    int
	Offset   int
}

// Helper functions to extract context values

func getIPFromContext(ctx context.Context) string {
	if ip, ok := ctx.Value("ip_address").(string); ok {
		return ip
	}
	return ""
}

func getUserAgentFromContext(ctx context.Context) string {
	if ua, ok := ctx.Value("user_agent").(string); ok {
		return ua
	}
	return ""
}

func getUserRoleFromContext(ctx context.Context) string {
	if role, ok := ctx.Value("user_role").(string); ok {
		return role
	}
	return ""
}

