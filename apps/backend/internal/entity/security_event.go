package entity

import (
	"github.com/jackc/pgtype"
)

// SecurityEvent represents a detected security threat or event
type SecurityEvent struct {
	ID                pgtype.UUID        `json:"id"`
	UserID            pgtype.Text        `json:"user_id"`
	ThreatType        pgtype.Text        `json:"threat_type"`
	RiskScore         pgtype.Int4        `json:"risk_score"`
	Status            pgtype.Text        `json:"status"`
	Description       pgtype.Text        `json:"description"`
	Metadata          pgtype.JSONB       `json:"metadata"`
	IPAddress         pgtype.Text        `json:"ip_address"`
	UserAgent         pgtype.Text        `json:"user_agent"`
	DeviceFingerprint pgtype.Text        `json:"device_fingerprint"`
	Location          pgtype.Text        `json:"location"`
	CreatedAt         pgtype.Timestamptz `json:"created_at"`
	UpdatedAt         pgtype.Timestamptz `json:"updated_at"`
	ResolvedAt        pgtype.Timestamptz `json:"resolved_at"`
	ResolvedBy        pgtype.Text        `json:"resolved_by"`
}

// TableName returns the table name for SecurityEvent
func (e *SecurityEvent) TableName() string {
	return "security_events"
}

// FieldMap returns field names and pointers for database scanning
func (e *SecurityEvent) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"user_id",
			"threat_type",
			"risk_score",
			"status",
			"description",
			"metadata",
			"ip_address",
			"user_agent",
			"device_fingerprint",
			"location",
			"created_at",
			"updated_at",
			"resolved_at",
			"resolved_by",
		}, []interface{}{
			&e.ID,
			&e.UserID,
			&e.ThreatType,
			&e.RiskScore,
			&e.Status,
			&e.Description,
			&e.Metadata,
			&e.IPAddress,
			&e.UserAgent,
			&e.DeviceFingerprint,
			&e.Location,
			&e.CreatedAt,
			&e.UpdatedAt,
			&e.ResolvedAt,
			&e.ResolvedBy,
		}
}

// SecurityResponse represents an automated or manual security response action
type SecurityResponse struct {
	ID              pgtype.UUID        `json:"id"`
	ThreatID        pgtype.UUID        `json:"threat_id"`
	UserID          pgtype.Text        `json:"user_id"`
	ActionType      pgtype.Text        `json:"action_type"`
	DurationSeconds pgtype.Int4        `json:"duration_seconds"`
	Reason          pgtype.Text        `json:"reason"`
	Status          pgtype.Text        `json:"status"`
	ExecutedAt      pgtype.Timestamptz `json:"executed_at"`
	CompletedAt     pgtype.Timestamptz `json:"completed_at"`
	ExecutedBy      pgtype.Text        `json:"executed_by"`
	ErrorMessage    pgtype.Text        `json:"error_message"`
	CreatedAt       pgtype.Timestamptz `json:"created_at"`
}

// TableName returns the table name for SecurityResponse
func (r *SecurityResponse) TableName() string {
	return "security_responses"
}

// FieldMap returns field names and pointers for database scanning
func (r *SecurityResponse) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"threat_id",
			"user_id",
			"action_type",
			"duration_seconds",
			"reason",
			"status",
			"executed_at",
			"completed_at",
			"executed_by",
			"error_message",
			"created_at",
		}, []interface{}{
			&r.ID,
			&r.ThreatID,
			&r.UserID,
			&r.ActionType,
			&r.DurationSeconds,
			&r.Reason,
			&r.Status,
			&r.ExecutedAt,
			&r.CompletedAt,
			&r.ExecutedBy,
			&r.ErrorMessage,
			&r.CreatedAt,
		}
}

// TokenMetric represents a performance metric for token operations
type TokenMetric struct {
	ID         pgtype.UUID        `json:"id"`
	UserID     pgtype.Text        `json:"user_id"`
	MetricType pgtype.Text        `json:"metric_type"`
	Timestamp  pgtype.Timestamptz `json:"timestamp"`
	DurationMs pgtype.Int4        `json:"duration_ms"`
	Success    pgtype.Bool        `json:"success"`
	ErrorType  pgtype.Text        `json:"error_type"`
	Metadata   pgtype.JSONB       `json:"metadata"`
	CreatedAt  pgtype.Timestamptz `json:"created_at"`
}

// TableName returns the table name for TokenMetric
func (m *TokenMetric) TableName() string {
	return "token_metrics"
}

// FieldMap returns field names and pointers for database scanning
func (m *TokenMetric) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"user_id",
			"metric_type",
			"timestamp",
			"duration_ms",
			"success",
			"error_type",
			"metadata",
			"created_at",
		}, []interface{}{
			&m.ID,
			&m.UserID,
			&m.MetricType,
			&m.Timestamp,
			&m.DurationMs,
			&m.Success,
			&m.ErrorType,
			&m.Metadata,
			&m.CreatedAt,
		}
}

// UserSession represents an active user session
type UserSession struct {
	ID                 pgtype.UUID        `json:"id"`
	UserID             pgtype.Text        `json:"user_id"`
	SessionToken       pgtype.Text        `json:"session_token"`
	RefreshTokenHash   pgtype.Text        `json:"refresh_token_hash"`
	DeviceFingerprint  pgtype.Text        `json:"device_fingerprint"`
	IPAddress          pgtype.Text        `json:"ip_address"`
	UserAgent          pgtype.Text        `json:"user_agent"`
	Location           pgtype.Text        `json:"location"`
	IsActive           pgtype.Bool        `json:"is_active"`
	LastActivityAt     pgtype.Timestamptz `json:"last_activity_at"`
	CreatedAt          pgtype.Timestamptz `json:"created_at"`
	ExpiresAt          pgtype.Timestamptz `json:"expires_at"`
	InvalidatedAt      pgtype.Timestamptz `json:"invalidated_at"`
	InvalidationReason pgtype.Text        `json:"invalidation_reason"`
}

// TableName returns the table name for UserSession
func (s *UserSession) TableName() string {
	return "user_sessions"
}

// FieldMap returns field names and pointers for database scanning
func (s *UserSession) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"user_id",
			"session_token",
			"refresh_token_hash",
			"device_fingerprint",
			"ip_address",
			"user_agent",
			"location",
			"is_active",
			"last_activity_at",
			"created_at",
			"expires_at",
			"invalidated_at",
			"invalidation_reason",
		}, []interface{}{
			&s.ID,
			&s.UserID,
			&s.SessionToken,
			&s.RefreshTokenHash,
			&s.DeviceFingerprint,
			&s.IPAddress,
			&s.UserAgent,
			&s.Location,
			&s.IsActive,
			&s.LastActivityAt,
			&s.CreatedAt,
			&s.ExpiresAt,
			&s.InvalidatedAt,
			&s.InvalidationReason,
		}
}

// AuditLog represents an audit trail entry
type AuditLog struct {
	ID          pgtype.UUID        `json:"id"`
	UserID      pgtype.Text        `json:"user_id"`
	UserRole    pgtype.Text        `json:"user_role"`
	Action      pgtype.Text        `json:"action"`
	Entity      pgtype.Text        `json:"entity"`
	EntityID    pgtype.Text        `json:"entity_id"`
	Description pgtype.Text        `json:"description"`
	Metadata    pgtype.JSONB       `json:"metadata"`
	IPAddress   pgtype.Text        `json:"ip_address"`
	UserAgent   pgtype.Text        `json:"user_agent"`
	CreatedAt   pgtype.Timestamptz `json:"created_at"`
}

// TableName returns the table name for AuditLog
func (a *AuditLog) TableName() string {
	return "audit_logs"
}

// FieldMap returns field names and pointers for database scanning
func (a *AuditLog) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"user_id",
			"user_role",
			"action",
			"entity",
			"entity_id",
			"description",
			"metadata",
			"ip_address",
			"user_agent",
			"created_at",
		}, []interface{}{
			&a.ID,
			&a.UserID,
			&a.UserRole,
			&a.Action,
			&a.Entity,
			&a.EntityID,
			&a.Description,
			&a.Metadata,
			&a.IPAddress,
			&a.UserAgent,
			&a.CreatedAt,
		}
}



