package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/sirupsen/logrus"
)

// SecurityEventRepository handles database operations for security events
type SecurityEventRepository struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewSecurityEventRepository creates a new security event repository
func NewSecurityEventRepository(db *sql.DB, logger *logrus.Logger) *SecurityEventRepository {
	return &SecurityEventRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates a new security event
func (r *SecurityEventRepository) Create(ctx context.Context, event *entity.SecurityEvent) error {
	// Generate UUID if not provided
	if event.ID.Status == pgtype.Undefined {
		var uuidVal uuid.UUID
		uuidVal = uuid.New()
		event.ID = pgtype.UUID{Bytes: uuidVal, Status: pgtype.Present}
	}

	// Set default status
	if event.Status.Status == pgtype.Undefined {
		event.Status = pgtype.Text{String: "DETECTED", Status: pgtype.Present}
	}

	// Set timestamps
	now := time.Now()
	event.CreatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}
	event.UpdatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}

	query := `
		INSERT INTO security_events (
			id, user_id, threat_type, risk_score, status, description,
			metadata, ip_address, user_agent, device_fingerprint, location,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`

	_, err := r.db.ExecContext(ctx, query,
		event.ID,
		event.UserID,
		event.ThreatType,
		event.RiskScore,
		event.Status,
		event.Description,
		event.Metadata,
		event.IPAddress,
		event.UserAgent,
		event.DeviceFingerprint,
		event.Location,
		event.CreatedAt,
		event.UpdatedAt,
	)

	if err != nil {
		r.logger.WithError(err).Error("Failed to create security event")
		return fmt.Errorf("failed to create security event: %w", err)
	}

	return nil
}

// FindByID retrieves a security event by ID
func (r *SecurityEventRepository) FindByID(ctx context.Context, id string) (*entity.SecurityEvent, error) {
	query := `
		SELECT id, user_id, threat_type, risk_score, status, description,
			metadata, ip_address, user_agent, device_fingerprint, location,
			created_at, updated_at, resolved_at, resolved_by
		FROM security_events
		WHERE id = $1
	`

	event := &entity.SecurityEvent{}
	fields, ptrs := event.FieldMap()
	_ = fields // Not used in this context

	err := r.db.QueryRowContext(ctx, query, id).Scan(ptrs...)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("security event not found: %s", id)
	}
	if err != nil {
		r.logger.WithError(err).Error("Failed to find security event")
		return nil, fmt.Errorf("failed to find security event: %w", err)
	}

	return event, nil
}

// FindByUserID retrieves security events for a specific user
func (r *SecurityEventRepository) FindByUserID(ctx context.Context, userID string, limit, offset int) ([]*entity.SecurityEvent, int, error) {
	// Get total count
	var total int
	countQuery := `SELECT COUNT(*) FROM security_events WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, countQuery, userID).Scan(&total)
	if err != nil {
		r.logger.WithError(err).Error("Failed to count security events")
		return nil, 0, fmt.Errorf("failed to count security events: %w", err)
	}

	// Get events
	query := `
		SELECT id, user_id, threat_type, risk_score, status, description,
			metadata, ip_address, user_agent, device_fingerprint, location,
			created_at, updated_at, resolved_at, resolved_by
		FROM security_events
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		r.logger.WithError(err).Error("Failed to query security events")
		return nil, 0, fmt.Errorf("failed to query security events: %w", err)
	}
	defer rows.Close()

	var events []*entity.SecurityEvent
	for rows.Next() {
		event := &entity.SecurityEvent{}
		_, ptrs := event.FieldMap()
		if err := rows.Scan(ptrs...); err != nil {
			r.logger.WithError(err).Error("Failed to scan security event")
			continue
		}
		events = append(events, event)
	}

	return events, total, nil
}

// FindWithFilters retrieves security events with advanced filters
func (r *SecurityEventRepository) FindWithFilters(ctx context.Context, filters SecurityEventFilters) ([]*entity.SecurityEvent, int, error) {
	// Build WHERE clause
	whereClauses := []string{}
	args := []interface{}{}
	argIndex := 1

	if filters.UserID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("user_id = $%d", argIndex))
		args = append(args, filters.UserID)
		argIndex++
	}

	if filters.ThreatType != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("threat_type = $%d", argIndex))
		args = append(args, filters.ThreatType)
		argIndex++
	}

	if filters.Status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, filters.Status)
		argIndex++
	}

	if filters.FromTimestamp > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("created_at >= $%d", argIndex))
		args = append(args, time.Unix(filters.FromTimestamp, 0))
		argIndex++
	}

	if filters.ToTimestamp > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("created_at <= $%d", argIndex))
		args = append(args, time.Unix(filters.ToTimestamp, 0))
		argIndex++
	}

	whereClause := ""
	if len(whereClauses) > 0 {
		whereClause = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Get total count
	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM security_events %s", whereClause)
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		r.logger.WithError(err).Error("Failed to count security events")
		return nil, 0, fmt.Errorf("failed to count security events: %w", err)
	}

	// Get events
	query := fmt.Sprintf(`
		SELECT id, user_id, threat_type, risk_score, status, description,
			metadata, ip_address, user_agent, device_fingerprint, location,
			created_at, updated_at, resolved_at, resolved_by
		FROM security_events
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, filters.Limit, filters.Offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		r.logger.WithError(err).Error("Failed to query security events")
		return nil, 0, fmt.Errorf("failed to query security events: %w", err)
	}
	defer rows.Close()

	var events []*entity.SecurityEvent
	for rows.Next() {
		event := &entity.SecurityEvent{}
		_, ptrs := event.FieldMap()
		if err := rows.Scan(ptrs...); err != nil {
			r.logger.WithError(err).Error("Failed to scan security event")
			continue
		}
		events = append(events, event)
	}

	return events, total, nil
}

// UpdateStatus updates the status of a security event
func (r *SecurityEventRepository) UpdateStatus(ctx context.Context, id, status string, resolvedBy *string) error {
	query := `
		UPDATE security_events
		SET status = $1, updated_at = $2
	`
	args := []interface{}{status, time.Now()}
	argIndex := 3

	if status == "RESOLVED" {
		query += fmt.Sprintf(", resolved_at = $%d", argIndex)
		args = append(args, time.Now())
		argIndex++

		if resolvedBy != nil {
			query += fmt.Sprintf(", resolved_by = $%d", argIndex)
			args = append(args, *resolvedBy)
			argIndex++
		}
	}

	query += fmt.Sprintf(" WHERE id = $%d", argIndex)
	args = append(args, id)

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		r.logger.WithError(err).Error("Failed to update security event status")
		return fmt.Errorf("failed to update security event status: %w", err)
	}

	return nil
}

// SecurityEventFilters represents filters for security event queries
type SecurityEventFilters struct {
	UserID        string
	ThreatType    string
	Status        string
	FromTimestamp int64
	ToTimestamp   int64
	Limit         int
	Offset        int
}

// CreateSecurityResponse creates a new security response
func (r *SecurityEventRepository) CreateSecurityResponse(ctx context.Context, response *entity.SecurityResponse) error {
	// Generate UUID if not provided
	if response.ID.Status == pgtype.Undefined {
		var uuidVal uuid.UUID
		uuidVal = uuid.New()
		response.ID = pgtype.UUID{Bytes: uuidVal, Status: pgtype.Present}
	}

	// Set default status
	if response.Status.Status == pgtype.Undefined {
		response.Status = pgtype.Text{String: "PENDING", Status: pgtype.Present}
	}

	// Set timestamp
	response.CreatedAt = pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present}

	query := `
		INSERT INTO security_responses (
			id, threat_id, user_id, action_type, duration_seconds,
			reason, status, executed_by, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.ExecContext(ctx, query,
		response.ID,
		response.ThreatID,
		response.UserID,
		response.ActionType,
		response.DurationSeconds,
		response.Reason,
		response.Status,
		response.ExecutedBy,
		response.CreatedAt,
	)

	if err != nil {
		r.logger.WithError(err).Error("Failed to create security response")
		return fmt.Errorf("failed to create security response: %w", err)
	}

	return nil
}

// UpdateSecurityResponseStatus updates the status of a security response
func (r *SecurityEventRepository) UpdateSecurityResponseStatus(ctx context.Context, id, status string, errorMsg *string) error {
	now := time.Now()
	query := `UPDATE security_responses SET status = $1`
	args := []interface{}{status}
	argIndex := 2

	if status == "EXECUTING" {
		query += fmt.Sprintf(", executed_at = $%d", argIndex)
		args = append(args, now)
		argIndex++
	}

	if status == "COMPLETED" || status == "FAILED" {
		query += fmt.Sprintf(", completed_at = $%d", argIndex)
		args = append(args, now)
		argIndex++
	}

	if errorMsg != nil {
		query += fmt.Sprintf(", error_message = $%d", argIndex)
		args = append(args, *errorMsg)
		argIndex++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argIndex)
	args = append(args, id)

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		r.logger.WithError(err).Error("Failed to update security response status")
		return fmt.Errorf("failed to update security response status: %w", err)
	}

	return nil
}

// CreateTokenMetric creates a new token metric
func (r *SecurityEventRepository) CreateTokenMetric(ctx context.Context, metric *entity.TokenMetric) error {
	// Generate UUID if not provided
	if metric.ID.Status == pgtype.Undefined {
		var uuidVal uuid.UUID
		uuidVal = uuid.New()
		metric.ID = pgtype.UUID{Bytes: uuidVal, Status: pgtype.Present}
	}

	// Set timestamps
	now := time.Now()
	if metric.Timestamp.Status == pgtype.Undefined {
		metric.Timestamp = pgtype.Timestamptz{Time: now, Status: pgtype.Present}
	}
	metric.CreatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}

	query := `
		INSERT INTO token_metrics (
			id, user_id, metric_type, timestamp, duration_ms,
			success, error_type, metadata, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.ExecContext(ctx, query,
		metric.ID,
		metric.UserID,
		metric.MetricType,
		metric.Timestamp,
		metric.DurationMs,
		metric.Success,
		metric.ErrorType,
		metric.Metadata,
		metric.CreatedAt,
	)

	if err != nil {
		r.logger.WithError(err).Error("Failed to create token metric")
		return fmt.Errorf("failed to create token metric: %w", err)
	}

	return nil
}

// GetTokenMetrics retrieves token metrics with filters
func (r *SecurityEventRepository) GetTokenMetrics(ctx context.Context, filters TokenMetricFilters) ([]*entity.TokenMetric, int, error) {
	// Build WHERE clause
	whereClauses := []string{}
	args := []interface{}{}
	argIndex := 1

	if filters.UserID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("user_id = $%d", argIndex))
		args = append(args, filters.UserID)
		argIndex++
	}

	if filters.MetricType != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("metric_type = $%d", argIndex))
		args = append(args, filters.MetricType)
		argIndex++
	}

	if filters.FromTimestamp > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("timestamp >= $%d", argIndex))
		args = append(args, time.Unix(filters.FromTimestamp, 0))
		argIndex++
	}

	if filters.ToTimestamp > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("timestamp <= $%d", argIndex))
		args = append(args, time.Unix(filters.ToTimestamp, 0))
		argIndex++
	}

	whereClause := ""
	if len(whereClauses) > 0 {
		whereClause = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Get total count
	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM token_metrics %s", whereClause)
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		r.logger.WithError(err).Error("Failed to count token metrics")
		return nil, 0, fmt.Errorf("failed to count token metrics: %w", err)
	}

	// Get metrics
	query := fmt.Sprintf(`
		SELECT id, user_id, metric_type, timestamp, duration_ms,
			success, error_type, metadata, created_at
		FROM token_metrics
		%s
		ORDER BY timestamp DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, filters.Limit, filters.Offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		r.logger.WithError(err).Error("Failed to query token metrics")
		return nil, 0, fmt.Errorf("failed to query token metrics: %w", err)
	}
	defer rows.Close()

	var metrics []*entity.TokenMetric
	for rows.Next() {
		metric := &entity.TokenMetric{}
		_, ptrs := metric.FieldMap()
		if err := rows.Scan(ptrs...); err != nil {
			r.logger.WithError(err).Error("Failed to scan token metric")
			continue
		}
		metrics = append(metrics, metric)
	}

	return metrics, total, nil
}

// GetTokenMetricsAggregation retrieves aggregated token metrics
func (r *SecurityEventRepository) GetTokenMetricsAggregation(ctx context.Context, filters TokenMetricFilters) (*TokenMetricsAggregation, error) {
	// Build WHERE clause (similar to GetTokenMetrics)
	whereClauses := []string{}
	args := []interface{}{}
	argIndex := 1

	if filters.UserID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("user_id = $%d", argIndex))
		args = append(args, filters.UserID)
		argIndex++
	}

	if filters.MetricType != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("metric_type = $%d", argIndex))
		args = append(args, filters.MetricType)
		argIndex++
	}

	if filters.FromTimestamp > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("timestamp >= $%d", argIndex))
		args = append(args, time.Unix(filters.FromTimestamp, 0))
		argIndex++
	}

	if filters.ToTimestamp > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("timestamp <= $%d", argIndex))
		args = append(args, time.Unix(filters.ToTimestamp, 0))
		argIndex++
	}

	whereClause := ""
	if len(whereClauses) > 0 {
		whereClause = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT
			COUNT(*) as total_count,
			COUNT(*) FILTER (WHERE success = true) as success_count,
			COUNT(*) FILTER (WHERE success = false) as error_count,
			AVG(duration_ms) as avg_duration,
			PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms) as p50_duration,
			PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration,
			PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration
		FROM token_metrics
		%s
	`, whereClause)

	agg := &TokenMetricsAggregation{}
	var avgDuration, p50, p95, p99 sql.NullFloat64

	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&agg.TotalCount,
		&agg.SuccessCount,
		&agg.ErrorCount,
		&avgDuration,
		&p50,
		&p95,
		&p99,
	)

	if err != nil {
		r.logger.WithError(err).Error("Failed to get token metrics aggregation")
		return nil, fmt.Errorf("failed to get token metrics aggregation: %w", err)
	}

	// Calculate success rate
	if agg.TotalCount > 0 {
		agg.SuccessRate = float64(agg.SuccessCount) / float64(agg.TotalCount) * 100
	}

	// Assign nullable values
	if avgDuration.Valid {
		agg.AvgDurationMs = avgDuration.Float64
	}
	if p50.Valid {
		agg.P50DurationMs = p50.Float64
	}
	if p95.Valid {
		agg.P95DurationMs = p95.Float64
	}
	if p99.Valid {
		agg.P99DurationMs = p99.Float64
	}

	return agg, nil
}

// TokenMetricFilters represents filters for token metric queries
type TokenMetricFilters struct {
	UserID        string
	MetricType    string
	FromTimestamp int64
	ToTimestamp   int64
	Limit         int
	Offset        int
}

// TokenMetricsAggregation represents aggregated token metrics
type TokenMetricsAggregation struct {
	TotalCount    int
	SuccessCount  int
	ErrorCount    int
	SuccessRate   float64
	AvgDurationMs float64
	P50DurationMs float64
	P95DurationMs float64
	P99DurationMs float64
}

// CreateAuditLog creates a new audit log entry
func (r *SecurityEventRepository) CreateAuditLog(ctx context.Context, log *entity.AuditLog) error {
	// Generate UUID if not provided
	if log.ID.Status == pgtype.Undefined {
		var uuidVal uuid.UUID
		uuidVal = uuid.New()
		log.ID = pgtype.UUID{Bytes: uuidVal, Status: pgtype.Present}
	}

	// Set timestamp
	log.CreatedAt = pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present}

	query := `
		INSERT INTO audit_logs (
			id, user_id, user_role, action, entity, entity_id,
			description, metadata, ip_address, user_agent, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := r.db.ExecContext(ctx, query,
		log.ID,
		log.UserID,
		log.UserRole,
		log.Action,
		log.Entity,
		log.EntityID,
		log.Description,
		log.Metadata,
		log.IPAddress,
		log.UserAgent,
		log.CreatedAt,
	)

	if err != nil {
		r.logger.WithError(err).Error("Failed to create audit log")
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	return nil
}

// Helper function to convert map to JSONB
func MapToJSONB(data map[string]interface{}) (pgtype.JSONB, error) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return pgtype.JSONB{}, err
	}
	return pgtype.JSONB{Bytes: jsonBytes, Status: pgtype.Present}, nil
}
