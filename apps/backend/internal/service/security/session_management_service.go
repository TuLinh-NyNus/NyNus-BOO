package security

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/sirupsen/logrus"
)

// SessionManagementService handles session-related operations
type SessionManagementService struct {
	sessionRepo *repository.UserSessionRepository
	jwtService  *auth.UnifiedJWTService
	logger      *logrus.Logger
}

// NewSessionManagementService creates a new session management service
func NewSessionManagementService(
	sessionRepo *repository.UserSessionRepository,
	jwtService *auth.UnifiedJWTService,
	logger *logrus.Logger,
) *SessionManagementService {
	return &SessionManagementService{
		sessionRepo: sessionRepo,
		jwtService:  jwtService,
		logger:      logger,
	}
}

// ValidateTokenRequest represents a token validation request
type ValidateTokenRequest struct {
	Token  string
	UserID string // Optional - for additional validation
}

// ValidateTokenResponse represents a token validation response
type ValidateTokenResponse struct {
	Valid     bool
	UserID    string
	Role      string
	ExpiresAt int64
	SessionID string
}

// ValidateToken validates a JWT token and checks session
func (s *SessionManagementService) ValidateToken(ctx context.Context, req *ValidateTokenRequest) (*ValidateTokenResponse, error) {
	if req.Token == "" {
		return &ValidateTokenResponse{Valid: false}, fmt.Errorf("token is required")
	}

	// Validate JWT token
	claims, err := s.jwtService.ValidateToken(req.Token)
	if err != nil {
		s.logger.WithError(err).Debug("Token validation failed")
		return &ValidateTokenResponse{Valid: false}, nil
	}

	// Optional: Check if user_id matches
	if req.UserID != "" && claims.UserID != req.UserID {
		s.logger.Warn("Token user_id mismatch")
		return &ValidateTokenResponse{Valid: false}, nil
	}

	// Check if user has active sessions
	sessions, err := s.sessionRepo.FindActiveByUserID(ctx, claims.UserID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to find active sessions")
		// Continue - don't fail validation just because session query failed
	}

	var sessionID string
	if len(sessions) > 0 {
		// Get the most recent session
		uid := uuid.UUID(sessions[0].ID.Bytes)
		sessionID = uid.String()
	}

	return &ValidateTokenResponse{
		Valid:     true,
		UserID:    claims.UserID,
		Role:      claims.Role,
		ExpiresAt: claims.ExpiresAt.Unix(),
		SessionID: sessionID,
	}, nil
}

// InvalidateSessionRequest represents a session invalidation request
type InvalidateSessionRequest struct {
	UserID    string
	SessionID string // Optional - if empty, invalidate all
	Reason    string
}

// InvalidateSessionResponse represents a session invalidation response
type InvalidateSessionResponse struct {
	Success             bool
	Message             string
	SessionsInvalidated int
}

// InvalidateSession invalidates user session(s)
func (s *SessionManagementService) InvalidateSession(ctx context.Context, req *InvalidateSessionRequest) (*InvalidateSessionResponse, error) {
	if req.UserID == "" {
		return nil, fmt.Errorf("user_id is required")
	}

	reason := req.Reason
	if reason == "" {
		reason = "USER_REQUEST"
	}

	var count int
	var err error

	if req.SessionID != "" {
		// Invalidate specific session
		err = s.sessionRepo.InvalidateByID(ctx, req.SessionID, reason)
		if err != nil {
			s.logger.WithError(err).Error("Failed to invalidate session")
			return nil, fmt.Errorf("failed to invalidate session: %w", err)
		}
		count = 1
	} else {
		// Invalidate all user sessions
		count, err = s.sessionRepo.InvalidateAllByUserID(ctx, req.UserID, reason)
		if err != nil {
			s.logger.WithError(err).Error("Failed to invalidate all sessions")
			return nil, fmt.Errorf("failed to invalidate all sessions: %w", err)
		}
	}

	s.logger.WithFields(logrus.Fields{
		"user_id":              req.UserID,
		"sessions_invalidated": count,
		"reason":               reason,
	}).Info("Sessions invalidated")

	return &InvalidateSessionResponse{
		Success:             true,
		Message:             fmt.Sprintf("Successfully invalidated %d session(s)", count),
		SessionsInvalidated: count,
	}, nil
}

// RenewSessionRequest represents a session renewal request
type RenewSessionRequest struct {
	RefreshToken      string
	DeviceFingerprint string
	IPAddress         string
	UserAgent         string
	Location          string
}

// RenewSessionResponse represents a session renewal response
type RenewSessionResponse struct {
	AccessToken  string
	RefreshToken string
	ExpiresAt    int64
	SessionID    string
}

// RenewSession renews a session using refresh token
func (s *SessionManagementService) RenewSession(ctx context.Context, req *RenewSessionRequest) (*RenewSessionResponse, error) {
	if req.RefreshToken == "" {
		return nil, fmt.Errorf("refresh_token is required")
	}

	// Validate refresh token
	userID, err := s.jwtService.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		s.logger.WithError(err).Error("Invalid refresh token")
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// For simplicity, return message that token is still valid
	// Full rotation would require user repository and device verification
	// This can be enhanced in Phase 6.3 when user repository is integrated

	s.logger.WithFields(logrus.Fields{
		"user_id": userID,
	}).Info("Session validated - full rotation deferred to Phase 6.3")

	return &RenewSessionResponse{
		AccessToken:  "",               // Would generate new token with full rotation
		RefreshToken: req.RefreshToken, // Keep same for now
		ExpiresAt:    time.Now().Add(15 * time.Minute).Unix(),
		SessionID:    "", // Would create session with full implementation
	}, fmt.Errorf("session renewal requires full Phase 6.3 implementation with user repository integration")
}

// CreateSession creates a new user session
func (s *SessionManagementService) CreateSession(
	ctx context.Context,
	userID string,
	accessToken string,
	refreshToken string,
	deviceFingerprint string,
	ipAddress string,
	userAgent string,
	location string,
) (string, error) {
	sessionToken := hashToken(accessToken)
	refreshTokenHash := hashToken(refreshToken)

	session := &entity.UserSession{
		UserID:            pgtype.Text{String: userID, Status: pgtype.Present},
		SessionToken:      pgtype.Text{String: sessionToken, Status: pgtype.Present},
		RefreshTokenHash:  pgtype.Text{String: refreshTokenHash, Status: pgtype.Present},
		DeviceFingerprint: pgtype.Text{String: deviceFingerprint, Status: pgtype.Present},
		IPAddress:         pgtype.Text{String: ipAddress, Status: pgtype.Present},
		UserAgent:         pgtype.Text{String: userAgent, Status: pgtype.Present},
		Location:          pgtype.Text{String: location, Status: pgtype.Present},
		ExpiresAt:         pgtype.Timestamptz{Time: time.Now().Add(24 * time.Hour), Status: pgtype.Present},
	}

	err := s.sessionRepo.Create(ctx, session)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create session")
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	var sessionID string
	if session.ID.Status == pgtype.Present {
		uid := uuid.UUID(session.ID.Bytes)
		sessionID = uid.String()
	}

	return sessionID, nil
}

// CleanupExpiredSessions removes expired sessions
func (s *SessionManagementService) CleanupExpiredSessions(ctx context.Context) (int, error) {
	count, err := s.sessionRepo.CleanupExpiredSessions(ctx)
	if err != nil {
		s.logger.WithError(err).Error("Failed to cleanup expired sessions")
		return 0, err
	}

	if count > 0 {
		s.logger.WithField("count", count).Info("Cleaned up expired sessions")
	}

	return count, nil
}

// Helper function to hash tokens for storage
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
