package session

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// SessionService handles user session management
type SessionService struct {
	sessionRepo repository.SessionRepository
	userRepo    repository.IUserRepository
}

// NewSessionService creates a new session service
func NewSessionService(sessionRepo repository.SessionRepository, userRepo repository.IUserRepository) *SessionService {
	return &SessionService{
		sessionRepo: sessionRepo,
		userRepo:    userRepo,
	}
}

// CreateSession creates a new user session
func (s *SessionService) CreateSession(ctx context.Context, userID, sessionToken, ipAddress, userAgent, deviceFingerprint string) (*repository.Session, error) {
	// Check user exists and is active
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	if user.Status != "ACTIVE" {
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// Check concurrent sessions limit
	activeSessions, err := s.sessionRepo.GetActiveSessions(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get active sessions: %v", err)
	}

	maxSessions := 3
	if user.MaxConcurrentSessions > 0 {
		maxSessions = user.MaxConcurrentSessions
	}

	// If at limit, terminate oldest session
	if len(activeSessions) >= maxSessions {
		oldestSession := s.findOldestSession(activeSessions)
		if err := s.sessionRepo.TerminateSession(ctx, oldestSession.ID); err != nil {
			// Log error but continue
			fmt.Printf("Failed to terminate old session: %v\n", err)
		}

		// Send notification about terminated session
		// TODO: Implement notification service
	}

	// Create new session
	session := &repository.Session{
		UserID:            userID,
		SessionToken:      sessionToken,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		DeviceFingerprint: deviceFingerprint,
		IsActive:          true,
		LastActivity:      time.Now(),
		ExpiresAt:         time.Now().Add(30 * 24 * time.Hour), // 30 days
	}

	if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create session: %v", err)
	}

	return session, nil
}

// ValidateSession validates and updates session activity
func (s *SessionService) ValidateSession(ctx context.Context, sessionToken string) (*repository.Session, error) {
	session, err := s.sessionRepo.GetByToken(ctx, sessionToken)
	if err != nil {
		if errors.Is(err, repository.ErrSessionNotFound) {
			return nil, status.Errorf(codes.Unauthenticated, "session not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to get session: %v", err)
	}

	// Check if session is active
	if !session.IsActive {
		return nil, status.Errorf(codes.Unauthenticated, "session is inactive")
	}

	// Check if session has expired
	if time.Now().After(session.ExpiresAt) {
		// Mark session as inactive
		if err := s.sessionRepo.TerminateSession(ctx, session.ID); err != nil {
			fmt.Printf("Failed to terminate expired session: %v\n", err)
		}
		return nil, status.Errorf(codes.Unauthenticated, "session has expired")
	}

	// Update last activity
	if err := s.sessionRepo.UpdateLastActivity(ctx, session.ID); err != nil {
		// Log error but don't fail validation
		fmt.Printf("Failed to update session activity: %v\n", err)
	}

	return session, nil
}

// GetUserSessions gets all sessions for a user
func (s *SessionService) GetUserSessions(ctx context.Context, userID string) ([]*repository.Session, error) {
	sessions, err := s.sessionRepo.GetUserSessions(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user sessions: %v", err)
	}

	return sessions, nil
}

// GetActiveSessions gets active sessions for a user
func (s *SessionService) GetActiveSessions(ctx context.Context, userID string) ([]*repository.Session, error) {
	sessions, err := s.sessionRepo.GetActiveSessions(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get active sessions: %v", err)
	}

	return sessions, nil
}

// TerminateSession terminates a specific session
func (s *SessionService) TerminateSession(ctx context.Context, sessionID, userID string) error {
	// Verify session belongs to user
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		if errors.Is(err, repository.ErrSessionNotFound) {
			return status.Errorf(codes.NotFound, "session not found")
		}
		return status.Errorf(codes.Internal, "failed to get session: %v", err)
	}

	if session.UserID != userID {
		return status.Errorf(codes.PermissionDenied, "session does not belong to user")
	}

	if err := s.sessionRepo.TerminateSession(ctx, sessionID); err != nil {
		return status.Errorf(codes.Internal, "failed to terminate session: %v", err)
	}

	return nil
}

// TerminateAllSessions terminates all sessions for a user
func (s *SessionService) TerminateAllSessions(ctx context.Context, userID string) error {
	sessions, err := s.sessionRepo.GetActiveSessions(ctx, userID)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to get active sessions: %v", err)
	}

	for _, session := range sessions {
		if err := s.sessionRepo.TerminateSession(ctx, session.ID); err != nil {
			// Log error but continue
			fmt.Printf("Failed to terminate session %s: %v\n", session.ID, err)
		}
	}

	return nil
}

// TerminateOtherSessions terminates all sessions except the current one
func (s *SessionService) TerminateOtherSessions(ctx context.Context, userID, currentSessionToken string) error {
	sessions, err := s.sessionRepo.GetActiveSessions(ctx, userID)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to get active sessions: %v", err)
	}

	for _, session := range sessions {
		if session.SessionToken != currentSessionToken {
			if err := s.sessionRepo.TerminateSession(ctx, session.ID); err != nil {
				// Log error but continue
				fmt.Printf("Failed to terminate session %s: %v\n", session.ID, err)
			}
		}
	}

	return nil
}

// CleanupExpiredSessions removes expired sessions (for scheduled cleanup)
func (s *SessionService) CleanupExpiredSessions(ctx context.Context) error {
	expiredSessions, err := s.sessionRepo.GetExpiredSessions(ctx)
	if err != nil {
		return fmt.Errorf("failed to get expired sessions: %w", err)
	}

	for _, session := range expiredSessions {
		if err := s.sessionRepo.TerminateSession(ctx, session.ID); err != nil {
			// Log error but continue
			fmt.Printf("Failed to cleanup expired session %s: %v\n", session.ID, err)
		}
	}

	fmt.Printf("Cleaned up %d expired sessions\n", len(expiredSessions))
	return nil
}

// CheckSessionSecurity checks for suspicious session activity
func (s *SessionService) CheckSessionSecurity(ctx context.Context, userID, ipAddress, userAgent string) (bool, error) {
	sessions, err := s.sessionRepo.GetActiveSessions(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("failed to get active sessions: %w", err)
	}

	// Check for suspicious patterns
	differentIPs := make(map[string]bool)
	for _, session := range sessions {
		differentIPs[session.IPAddress] = true
	}

	// If too many different IPs in active sessions
	if len(differentIPs) > 5 {
		// Flag as suspicious
		return true, nil
	}

	// Check for rapid location changes
	// TODO: Implement geo-location checking

	return false, nil
}

// VerifyEmailToken verifies an email verification token
func (s *SessionService) VerifyEmailToken(ctx context.Context, token string) (string, error) {
	// TODO: Implement email token verification
	// For now, return empty string to make it compile
	return "", status.Errorf(codes.Unimplemented, "email token verification not implemented yet")
}

// GeneratePasswordResetToken generates a password reset token
func (s *SessionService) GeneratePasswordResetToken(ctx context.Context, userID string) (string, error) {
	// TODO: Implement password reset token generation
	// For now, return empty string to make it compile
	return "", status.Errorf(codes.Unimplemented, "password reset token generation not implemented yet")
}

// VerifyPasswordResetToken verifies a password reset token
func (s *SessionService) VerifyPasswordResetToken(ctx context.Context, token string) (string, error) {
	// TODO: Implement password reset token verification
	// For now, return empty string to make it compile
	return "", status.Errorf(codes.Unimplemented, "password reset token verification not implemented yet")
}

// InvalidateAllUserSessions invalidates all sessions for a user
func (s *SessionService) InvalidateAllUserSessions(ctx context.Context, userID string) error {
	// This is same as TerminateAllSessions, so we can just call it
	return s.TerminateAllSessions(ctx, userID)
}

// findOldestSession finds the oldest session from a list
func (s *SessionService) findOldestSession(sessions []*repository.Session) *repository.Session {
	if len(sessions) == 0 {
		return nil
	}

	oldest := sessions[0]
	for _, session := range sessions {
		if session.CreatedAt.Before(oldest.CreatedAt) {
			oldest = session
		}
	}

	return oldest
}
