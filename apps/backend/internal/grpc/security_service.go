package grpc

import (
	"context"
	"database/sql"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/auth"
	"exam-bank-system/apps/backend/internal/service/security"
	pbcommon "exam-bank-system/apps/backend/pkg/proto/common"
	pb "exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// SecurityServiceServer implements the SecurityService gRPC service
type SecurityServiceServer struct {
	pb.UnimplementedSecurityServiceServer
	securityService *security.SecurityService
	sessionService  *security.SessionManagementService
	logger          *logrus.Logger
}

// NewSecurityServiceServer creates a new security service server
func NewSecurityServiceServer(
	db *sql.DB,
	jwtService *auth.UnifiedJWTService,
	logger *logrus.Logger,
) *SecurityServiceServer {
	sessionRepo := repository.NewUserSessionRepository(db, logger)

	return &SecurityServiceServer{
		securityService: security.NewSecurityService(db, logger),
		sessionService:  security.NewSessionManagementService(sessionRepo, jwtService, logger),
		logger:          logger,
	}
}

// ReportThreat handles security threat reporting
func (s *SecurityServiceServer) ReportThreat(ctx context.Context, req *pb.ReportThreatRequest) (*pb.ReportThreatResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"user_id":     req.UserId,
		"threat_type": req.ThreatType,
		"risk_score":  req.RiskScore,
	}).Info("ReportThreat called")

	// Convert proto request to service request
	metadata := make(map[string]interface{})
	if req.MetadataJson != "" {
		// Parse JSON metadata if needed
		metadata["raw"] = req.MetadataJson
	}

	serviceReq := &security.ReportThreatRequest{
		UserID:            req.UserId,
		ThreatType:        req.ThreatType,
		RiskScore:         req.RiskScore,
		Description:       req.Description,
		Metadata:          metadata,
		IPAddress:         req.IpAddress,
		UserAgent:         req.UserAgent,
		DeviceFingerprint: req.DeviceFingerprint,
		Location:          req.Location,
	}

	// Call service
	resp, err := s.securityService.ReportThreat(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to report threat")
		return &pb.ReportThreatResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Internal, err.Error())
	}

	return &pb.ReportThreatResponse{
		Response: &pbcommon.Response{
			Success: true,
			Message: resp.Message,
		},
		ThreatId: resp.ThreatID,
		Message:  resp.Message,
	}, nil
}

// ExecuteResponse handles security response execution
func (s *SecurityServiceServer) ExecuteResponse(ctx context.Context, req *pb.ExecuteResponseRequest) (*pb.ExecuteResponseResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"user_id":     req.UserId,
		"action_type": req.ActionType,
	}).Info("ExecuteResponse called")

	// Convert proto request to service request
	serviceReq := &security.ExecuteResponseRequest{
		UserID:          req.UserId,
		ThreatID:        req.ThreatId,
		ActionType:      req.ActionType,
		DurationSeconds: req.DurationSeconds,
		Reason:          req.Reason,
	}

	// Call service
	resp, err := s.securityService.ExecuteResponse(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to execute response")
		return &pb.ExecuteResponseResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Internal, err.Error())
	}

	return &pb.ExecuteResponseResponse{
		Response: &pbcommon.Response{
			Success: resp.Success,
			Message: resp.Message,
		},
		Message:    resp.Message,
		StatusCode: resp.StatusCode,
		Executed:   resp.Success,
	}, nil
}

// GetThreats retrieves security threats
func (s *SecurityServiceServer) GetThreats(ctx context.Context, req *pb.GetThreatsRequest) (*pb.GetThreatsResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"user_id": req.UserId,
		"limit":   req.Limit,
		"offset":  req.Offset,
	}).Info("GetThreats called")

	// Convert proto request to service request
	serviceReq := &security.GetThreatsRequest{
		UserID:        req.UserId,
		ThreatType:    req.ThreatType,
		Status:        req.FilterType, // Using filter_type as status
		FromTimestamp: req.FromTimestamp,
		ToTimestamp:   req.ToTimestamp,
		Limit:         int(req.Limit),
		Offset:        int(req.Offset),
	}

	// Call service
	resp, err := s.securityService.GetThreats(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get threats")
		return &pb.GetThreatsResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Internal, err.Error())
	}

	// Convert threats to proto format
	threats := make([]*pb.Threat, 0, len(resp.Threats))
	for _, threat := range resp.Threats {
		uid := uuid.UUID(threat.ID.Bytes)
		threats = append(threats, &pb.Threat{
			Id:                uid.String(),
			UserId:            threat.UserID.String,
			ThreatType:        threat.ThreatType.String,
			RiskScore:         threat.RiskScore.Int,
			Timestamp:         threat.CreatedAt.Time.Unix(),
			Status:            threat.Status.String,
			Description:       threat.Description.String,
			MetadataJson:      string(threat.Metadata.Bytes),
			IpAddress:         threat.IPAddress.String,
			UserAgent:         threat.UserAgent.String,
			DeviceFingerprint: threat.DeviceFingerprint.String,
			Location:          threat.Location.String,
		})
	}

	return &pb.GetThreatsResponse{
		Response: &pbcommon.Response{
			Success: true,
			Message: "Threats retrieved successfully",
		},
		Threats: threats,
		Total:   int32(resp.Total),
	}, nil
}

// ValidateToken validates a JWT token
func (s *SecurityServiceServer) ValidateToken(ctx context.Context, req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	s.logger.WithField("user_id", req.UserId).Debug("ValidateToken called")

	// Convert proto request to service request
	serviceReq := &security.ValidateTokenRequest{
		Token:  req.Token,
		UserID: req.UserId,
	}

	// Call service
	resp, err := s.sessionService.ValidateToken(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to validate token")
		return &pb.ValidateTokenResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
			Valid: false,
		}, nil // Don't return error - just invalid response
	}

	return &pb.ValidateTokenResponse{
		Response: &pbcommon.Response{
			Success: resp.Valid,
			Message: "Token validation completed",
		},
		Valid:     resp.Valid,
		UserId:    resp.UserID,
		Role:      resp.Role,
		ExpiresAt: resp.ExpiresAt,
		SessionId: resp.SessionID,
	}, nil
}

// InvalidateSession invalidates user session(s)
func (s *SecurityServiceServer) InvalidateSession(ctx context.Context, req *pb.InvalidateSessionRequest) (*pb.InvalidateSessionResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"user_id":    req.UserId,
		"session_id": req.SessionId,
	}).Info("InvalidateSession called")

	// Convert proto request to service request
	serviceReq := &security.InvalidateSessionRequest{
		UserID:    req.UserId,
		SessionID: req.SessionId,
		Reason:    req.Reason,
	}

	// Call service
	resp, err := s.sessionService.InvalidateSession(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to invalidate session")
		return &pb.InvalidateSessionResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Internal, err.Error())
	}

	return &pb.InvalidateSessionResponse{
		Response: &pbcommon.Response{
			Success: resp.Success,
			Message: resp.Message,
		},
		Success:             resp.Success,
		Message:             resp.Message,
		SessionsInvalidated: int32(resp.SessionsInvalidated),
	}, nil
}

// RenewSession renews a session using refresh token
func (s *SecurityServiceServer) RenewSession(ctx context.Context, req *pb.RenewSessionRequest) (*pb.RenewSessionResponse, error) {
	s.logger.Info("RenewSession called")

	// Extract metadata from context for IP, UserAgent, Location
	ipAddress := extractIPFromContext(ctx)
	userAgent := extractUserAgentFromContext(ctx)

	// Convert proto request to service request
	serviceReq := &security.RenewSessionRequest{
		RefreshToken:      req.RefreshToken,
		DeviceFingerprint: req.DeviceFingerprint,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		Location:          "", // Can be derived from IP if needed
	}

	// Call service
	resp, err := s.sessionService.RenewSession(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to renew session")
		return &pb.RenewSessionResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Unauthenticated, err.Error())
	}

	return &pb.RenewSessionResponse{
		Response: &pbcommon.Response{
			Success: true,
			Message: "Session renewed successfully",
		},
		AccessToken:  resp.AccessToken,
		RefreshToken: resp.RefreshToken,
		ExpiresAt:    resp.ExpiresAt,
		SessionId:    resp.SessionID,
	}, nil
}

// RecordTokenMetric records a token operation metric
func (s *SecurityServiceServer) RecordTokenMetric(ctx context.Context, req *pb.RecordTokenMetricRequest) (*pb.RecordTokenMetricResponse, error) {
	// Convert metadata
	metadata := make(map[string]interface{})
	if req.MetadataJson != "" {
		metadata["raw"] = req.MetadataJson
	}

	// Convert proto request to service request
	serviceReq := &security.RecordTokenMetricRequest{
		UserID:     req.UserId,
		MetricType: req.MetricType,
		DurationMs: req.DurationMs,
		Success:    req.Success,
		ErrorType:  req.ErrorType,
		Metadata:   metadata,
	}

	// Call service
	resp, err := s.securityService.RecordTokenMetric(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to record token metric")
		return &pb.RecordTokenMetricResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Internal, err.Error())
	}

	return &pb.RecordTokenMetricResponse{
		Response: &pbcommon.Response{
			Success: true,
			Message: "Metric recorded successfully",
		},
		MetricId: resp.MetricID,
	}, nil
}

// GetTokenMetrics retrieves token metrics
func (s *SecurityServiceServer) GetTokenMetrics(ctx context.Context, req *pb.GetTokenMetricsRequest) (*pb.GetTokenMetricsResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"user_id":     req.UserId,
		"metric_type": req.MetricType,
	}).Info("GetTokenMetrics called")

	// Convert proto request to service request
	serviceReq := &security.GetTokenMetricsRequest{
		UserID:        req.UserId,
		MetricType:    req.MetricType,
		FromTimestamp: req.FromTimestamp,
		ToTimestamp:   req.ToTimestamp,
		Limit:         int(req.Limit),
		Offset:        int(req.Offset),
	}

	// Call service
	resp, err := s.securityService.GetTokenMetrics(ctx, serviceReq)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get token metrics")
		return &pb.GetTokenMetricsResponse{
			Response: &pbcommon.Response{
				Success: false,
				Message: err.Error(),
			},
		}, status.Error(codes.Internal, err.Error())
	}

	// Convert metrics to proto format
	metrics := make([]*pb.TokenMetric, 0, len(resp.Metrics))
	for _, metric := range resp.Metrics {
		uid := uuid.UUID(metric.ID.Bytes)
		metrics = append(metrics, &pb.TokenMetric{
			Id:           uid.String(),
			UserId:       metric.UserID.String,
			MetricType:   metric.MetricType.String,
			Timestamp:    metric.Timestamp.Time.Unix(),
			DurationMs:   metric.DurationMs.Int,
			Success:      metric.Success.Bool,
			ErrorType:    metric.ErrorType.String,
			MetadataJson: string(metric.Metadata.Bytes),
		})
	}

	// Convert aggregation
	var aggregation *pb.TokenMetricsAggregation
	if resp.Aggregation != nil {
		aggregation = &pb.TokenMetricsAggregation{
			TotalCount:    int32(resp.Aggregation.TotalCount),
			SuccessCount:  int32(resp.Aggregation.SuccessCount),
			ErrorCount:    int32(resp.Aggregation.ErrorCount),
			SuccessRate:   resp.Aggregation.SuccessRate,
			AvgDurationMs: resp.Aggregation.AvgDurationMs,
			P50DurationMs: resp.Aggregation.P50DurationMs,
			P95DurationMs: resp.Aggregation.P95DurationMs,
			P99DurationMs: resp.Aggregation.P99DurationMs,
		}
	}

	return &pb.GetTokenMetricsResponse{
		Response: &pbcommon.Response{
			Success: true,
			Message: "Metrics retrieved successfully",
		},
		Metrics:     metrics,
		Total:       int32(resp.Total),
		Aggregation: aggregation,
	}, nil
}

// Helper functions to extract context values
func extractIPFromContext(ctx context.Context) string {
	// Try to extract from metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("x-forwarded-for"); len(vals) > 0 {
			return vals[0]
		}
		if vals := md.Get("x-real-ip"); len(vals) > 0 {
			return vals[0]
		}
	}
	return "unknown"
}

func extractUserAgentFromContext(ctx context.Context) string {
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("user-agent"); len(vals) > 0 {
			return vals[0]
		}
	}
	return "unknown"
}
