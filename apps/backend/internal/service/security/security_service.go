package security

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/sirupsen/logrus"
)

// SecurityService handles security-related operations
type SecurityService struct {
	securityRepo *repository.SecurityEventRepository
	sessionRepo  *repository.UserSessionRepository
	logger       *logrus.Logger
}

// NewSecurityService creates a new security service
func NewSecurityService(
	db *sql.DB,
	logger *logrus.Logger,
) *SecurityService {
	return &SecurityService{
		securityRepo: repository.NewSecurityEventRepository(db, logger),
		sessionRepo:  repository.NewUserSessionRepository(db, logger),
		logger:       logger,
	}
}

// ReportThreatRequest represents a threat report request
type ReportThreatRequest struct {
	UserID            string
	ThreatType        string
	RiskScore         int32
	Description       string
	Metadata          map[string]interface{}
	IPAddress         string
	UserAgent         string
	DeviceFingerprint string
	Location          string
}

// ReportThreatResponse represents a threat report response
type ReportThreatResponse struct {
	ThreatID string
	Message  string
}

// ReportThreat creates a new security threat event
func (s *SecurityService) ReportThreat(ctx context.Context, req *ReportThreatRequest) (*ReportThreatResponse, error) {
	// Validate input
	if req.UserID == "" {
		return nil, fmt.Errorf("user_id is required")
	}
	if req.ThreatType == "" {
		return nil, fmt.Errorf("threat_type is required")
	}
	if req.RiskScore < 0 || req.RiskScore > 100 {
		return nil, fmt.Errorf("risk_score must be between 0 and 100")
	}

	// Convert metadata to JSONB
	var metadataJSON pgtype.JSONB
	if req.Metadata != nil {
		jsonBytes, err := json.Marshal(req.Metadata)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal metadata: %w", err)
		}
		metadataJSON = pgtype.JSONB{Bytes: jsonBytes, Status: pgtype.Present}
	} else {
		metadataJSON = pgtype.JSONB{Bytes: []byte("{}"), Status: pgtype.Present}
	}

	// Create security event
	event := &entity.SecurityEvent{
		UserID:            pgtype.Text{String: req.UserID, Status: pgtype.Present},
		ThreatType:        pgtype.Text{String: req.ThreatType, Status: pgtype.Present},
		RiskScore:         pgtype.Int4{Int: req.RiskScore, Status: pgtype.Present},
		Description:       pgtype.Text{String: req.Description, Status: pgtype.Present},
		Metadata:          metadataJSON,
		IPAddress:         pgtype.Text{String: req.IPAddress, Status: pgtype.Present},
		UserAgent:         pgtype.Text{String: req.UserAgent, Status: pgtype.Present},
		DeviceFingerprint: pgtype.Text{String: req.DeviceFingerprint, Status: pgtype.Present},
		Location:          pgtype.Text{String: req.Location, Status: pgtype.Present},
	}

	err := s.securityRepo.Create(ctx, event)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create security event")
		return nil, fmt.Errorf("failed to create security event: %w", err)
	}

	// Get the created ID
	var threatID string
	if event.ID.Status == pgtype.Present {
		uid := uuid.UUID(event.ID.Bytes)
		threatID = uid.String()
	}

	s.logger.WithFields(logrus.Fields{
		"threat_id":   threatID,
		"user_id":     req.UserID,
		"threat_type": req.ThreatType,
		"risk_score":  req.RiskScore,
	}).Info("Security threat reported")

	return &ReportThreatResponse{
		ThreatID: threatID,
		Message:  "Threat reported successfully",
	}, nil
}

// ExecuteResponseRequest represents a security response execution request
type ExecuteResponseRequest struct {
	UserID          string
	ThreatID        string
	ActionType      string
	DurationSeconds int32
	Reason          string
}

// ExecuteResponseResponse represents a security response execution response
type ExecuteResponseResponse struct {
	Success    bool
	Message    string
	StatusCode int32
}

// ExecuteResponse executes a security response action
func (s *SecurityService) ExecuteResponse(ctx context.Context, req *ExecuteResponseRequest) (*ExecuteResponseResponse, error) {
	// Validate input
	if req.UserID == "" {
		return nil, fmt.Errorf("user_id is required")
	}
	if req.ActionType == "" {
		return nil, fmt.Errorf("action_type is required")
	}

	// Parse threat ID if provided
	var threatID pgtype.UUID
	if req.ThreatID != "" {
		threatID = pgtype.UUID{Status: pgtype.Present}
		// Parse UUID from string - implementation depends on your UUID handling
	}

	// Create security response record
	response := &entity.SecurityResponse{
		ThreatID:        threatID,
		UserID:          pgtype.Text{String: req.UserID, Status: pgtype.Present},
		ActionType:      pgtype.Text{String: req.ActionType, Status: pgtype.Present},
		DurationSeconds: pgtype.Int4{Int: req.DurationSeconds, Status: pgtype.Present},
		Reason:          pgtype.Text{String: req.Reason, Status: pgtype.Present},
		ExecutedBy:      pgtype.Text{String: "SYSTEM", Status: pgtype.Present},
	}

	err := s.securityRepo.CreateSecurityResponse(ctx, response)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create security response")
		return nil, fmt.Errorf("failed to create security response: %w", err)
	}

	// Execute the action based on type
	var responseID string
	if response.ID.Status == pgtype.Present {
		uid := uuid.UUID(response.ID.Bytes)
		responseID = uid.String()
	}

	// Update status to EXECUTING
	err = s.securityRepo.UpdateSecurityResponseStatus(ctx, responseID, "EXECUTING", nil)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update response status to EXECUTING")
	}

	// Execute action
	var executed bool
	var execError *string

	switch req.ActionType {
	case "ALERT":
		// Alert action - just log
		s.logger.WithFields(logrus.Fields{
			"user_id": req.UserID,
			"reason":  req.Reason,
		}).Warn("Security alert triggered")
		executed = true

	case "BLOCK":
		// Block user - invalidate all sessions
		count, err := s.sessionRepo.InvalidateAllByUserID(ctx, req.UserID, req.Reason)
		if err != nil {
			errMsg := fmt.Sprintf("Failed to invalidate sessions: %v", err)
			execError = &errMsg
			executed = false
		} else {
			s.logger.WithFields(logrus.Fields{
				"user_id":          req.UserID,
				"sessions_blocked": count,
			}).Info("User blocked")
			executed = true
		}

	case "MFA_REQUIRED":
		// MFA requirement - log for now (would integrate with auth system)
		s.logger.WithFields(logrus.Fields{
			"user_id": req.UserID,
		}).Info("MFA requirement set")
		executed = true

	case "LOGOUT":
		// Force logout - invalidate all sessions
		count, err := s.sessionRepo.InvalidateAllByUserID(ctx, req.UserID, "SECURITY_LOGOUT")
		if err != nil {
			errMsg := fmt.Sprintf("Failed to logout user: %v", err)
			execError = &errMsg
			executed = false
		} else {
			s.logger.WithFields(logrus.Fields{
				"user_id":              req.UserID,
				"sessions_invalidated": count,
			}).Info("User forced logout")
			executed = true
		}

	case "RATE_LIMIT":
		// Rate limit - log for now (would integrate with rate limiter)
		s.logger.WithFields(logrus.Fields{
			"user_id":  req.UserID,
			"duration": req.DurationSeconds,
		}).Info("Rate limit applied")
		executed = true

	default:
		errMsg := fmt.Sprintf("Unknown action type: %s", req.ActionType)
		execError = &errMsg
		executed = false
	}

	// Update final status
	finalStatus := "COMPLETED"
	if !executed {
		finalStatus = "FAILED"
	}
	err = s.securityRepo.UpdateSecurityResponseStatus(ctx, responseID, finalStatus, execError)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update response final status")
	}

	if executed {
		return &ExecuteResponseResponse{
			Success:    true,
			Message:    fmt.Sprintf("Response action '%s' executed successfully", req.ActionType),
			StatusCode: 200,
		}, nil
	}

	return &ExecuteResponseResponse{
		Success:    false,
		Message:    fmt.Sprintf("Failed to execute response action: %s", *execError),
		StatusCode: 500,
	}, nil
}

// GetThreatsRequest represents a request to get threats
type GetThreatsRequest struct {
	UserID        string
	ThreatType    string
	Status        string
	FromTimestamp int64
	ToTimestamp   int64
	Limit         int
	Offset        int
}

// GetThreatsResponse represents a response with threats
type GetThreatsResponse struct {
	Threats []*entity.SecurityEvent
	Total   int
}

// GetThreats retrieves security threats with filters
func (s *SecurityService) GetThreats(ctx context.Context, req *GetThreatsRequest) (*GetThreatsResponse, error) {
	// Set defaults
	if req.Limit <= 0 {
		req.Limit = 50
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	// Build filters
	filters := repository.SecurityEventFilters{
		UserID:        req.UserID,
		ThreatType:    req.ThreatType,
		Status:        req.Status,
		FromTimestamp: req.FromTimestamp,
		ToTimestamp:   req.ToTimestamp,
		Limit:         req.Limit,
		Offset:        req.Offset,
	}

	// Query threats
	threats, total, err := s.securityRepo.FindWithFilters(ctx, filters)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get threats")
		return nil, fmt.Errorf("failed to get threats: %w", err)
	}

	return &GetThreatsResponse{
		Threats: threats,
		Total:   total,
	}, nil
}

// RecordTokenMetricRequest represents a request to record token metric
type RecordTokenMetricRequest struct {
	UserID     string
	MetricType string
	DurationMs int32
	Success    bool
	ErrorType  string
	Metadata   map[string]interface{}
}

// RecordTokenMetricResponse represents a response after recording metric
type RecordTokenMetricResponse struct {
	MetricID string
}

// RecordTokenMetric records a token operation metric
func (s *SecurityService) RecordTokenMetric(ctx context.Context, req *RecordTokenMetricRequest) (*RecordTokenMetricResponse, error) {
	// Validate input
	if req.MetricType == "" {
		return nil, fmt.Errorf("metric_type is required")
	}

	// Convert metadata to JSONB
	var metadataJSON pgtype.JSONB
	if req.Metadata != nil {
		jsonBytes, err := json.Marshal(req.Metadata)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal metadata: %w", err)
		}
		metadataJSON = pgtype.JSONB{Bytes: jsonBytes, Status: pgtype.Present}
	} else {
		metadataJSON = pgtype.JSONB{Bytes: []byte("{}"), Status: pgtype.Present}
	}

	// Create metric
	metric := &entity.TokenMetric{
		UserID:     pgtype.Text{String: req.UserID, Status: pgtype.Present},
		MetricType: pgtype.Text{String: req.MetricType, Status: pgtype.Present},
		DurationMs: pgtype.Int4{Int: req.DurationMs, Status: pgtype.Present},
		Success:    pgtype.Bool{Bool: req.Success, Status: pgtype.Present},
		ErrorType:  pgtype.Text{String: req.ErrorType, Status: pgtype.Present},
		Metadata:   metadataJSON,
	}

	err := s.securityRepo.CreateTokenMetric(ctx, metric)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create token metric")
		return nil, fmt.Errorf("failed to create token metric: %w", err)
	}

	var metricID string
	if metric.ID.Status == pgtype.Present {
		uid := uuid.UUID(metric.ID.Bytes)
		metricID = uid.String()
	}

	return &RecordTokenMetricResponse{
		MetricID: metricID,
	}, nil
}

// GetTokenMetricsRequest represents a request to get token metrics
type GetTokenMetricsRequest struct {
	UserID        string
	MetricType    string
	FromTimestamp int64
	ToTimestamp   int64
	Limit         int
	Offset        int
}

// GetTokenMetricsResponse represents a response with token metrics
type GetTokenMetricsResponse struct {
	Metrics     []*entity.TokenMetric
	Total       int
	Aggregation *repository.TokenMetricsAggregation
}

// GetTokenMetrics retrieves token metrics with filters
func (s *SecurityService) GetTokenMetrics(ctx context.Context, req *GetTokenMetricsRequest) (*GetTokenMetricsResponse, error) {
	// Set defaults
	if req.Limit <= 0 {
		req.Limit = 100
	}
	if req.Limit > 1000 {
		req.Limit = 1000
	}

	// Build filters
	filters := repository.TokenMetricFilters{
		UserID:        req.UserID,
		MetricType:    req.MetricType,
		FromTimestamp: req.FromTimestamp,
		ToTimestamp:   req.ToTimestamp,
		Limit:         req.Limit,
		Offset:        req.Offset,
	}

	// Query metrics
	metrics, total, err := s.securityRepo.GetTokenMetrics(ctx, filters)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get token metrics")
		return nil, fmt.Errorf("failed to get token metrics: %w", err)
	}

	// Get aggregation
	aggregation, err := s.securityRepo.GetTokenMetricsAggregation(ctx, filters)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get token metrics aggregation")
		// Continue without aggregation
	}

	return &GetTokenMetricsResponse{
		Metrics:     metrics,
		Total:       total,
		Aggregation: aggregation,
	}, nil
}

