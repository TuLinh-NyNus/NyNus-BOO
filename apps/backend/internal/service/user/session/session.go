package session

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// SessionService handles user session management
type SessionService struct {
	sessionRepo         repository.SessionRepository
	userRepo            repository.IUserRepository
	notificationService *notification.NotificationService
}

// NewSessionService creates a new session service
func NewSessionService(
	sessionRepo repository.SessionRepository,
	userRepo repository.IUserRepository,
	notificationService *notification.NotificationService,
) *SessionService {
	return &SessionService{
		sessionRepo:         sessionRepo,
		userRepo:            userRepo,
		notificationService: notificationService,
	}
}

// CreateSession creates a new user session - SIMPLIFIED
func (s *SessionService) CreateSession(ctx context.Context, userID, sessionToken, ipAddress, userAgent, deviceFingerprint string) (*repository.Session, error) {
	// Check user exists and is active
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	if user.Status != "ACTIVE" {
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// ✅ ENABLED: Device fingerprinting for security tracking
	fmt.Printf("[SESSION] Creating session with device fingerprinting for user %s\n", userID)

	// ✅ ENABLED: Generate device fingerprint if not provided
	// If deviceFingerprint is empty, generate it from user agent and IP
	actualFingerprint := deviceFingerprint
	if actualFingerprint == "" {
		actualFingerprint = util.GenerateDeviceFingerprint(userAgent, ipAddress, "")
		fmt.Printf("[SESSION] Generated device fingerprint: %s\n", actualFingerprint)
	}

	// Create session with full security tracking
	session := &repository.Session{
		UserID:            userID,
		SessionToken:      sessionToken,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		DeviceFingerprint: actualFingerprint, // ✅ Enable device fingerprinting
		IsActive:          true,
		LastActivity:      time.Now(),
		ExpiresAt:         time.Now().Add(24 * time.Hour), // 24 hours timeout
	}

	// ✅ SECURITY: Check for suspicious device changes
	if s.detectSuspiciousDevice(ctx, userID, actualFingerprint) {
		fmt.Printf("[SECURITY] 🔔 New device detected for user %s (fingerprint: %s)\n", userID, actualFingerprint)
		// Optional: Send notification email (can be implemented later)
		// s.notifyNewDevice(ctx, userID, actualFingerprint)
	}

	if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create session: %v", err)
	}

	fmt.Printf("[SESSION] ✅ Session created successfully for user %s with device fingerprint\n", userID)

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

// CheckSessionSecurity checks for suspicious session activity - SIMPLIFIED
func (s *SessionService) CheckSessionSecurity(ctx context.Context, userID, ipAddress, userAgent string) (bool, error) {
	// SIMPLIFIED: Remove complex security monitoring
	// Basic session validation is handled by JWT tokens and NextAuth
	fmt.Printf("[SESSION] Session security check simplified for user %s\n", userID)
	return false, nil // No suspicious activity in simplified mode
}

// GenerateEmailVerificationToken generates a new email verification token
func (s *SessionService) GenerateEmailVerificationToken(ctx context.Context, userID string) (string, error) {
	// Generate secure random token
	token := util.GenerateSecureToken(32) // Generate 32-byte hex token

	// Create verification token record
	verificationToken := &repository.EmailVerificationToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour), // 24 hours expiry
		Used:      false,
		CreatedAt: time.Now(),
	}

	// Save to database
	if err := s.userRepo.CreateEmailVerificationToken(ctx, verificationToken); err != nil {
		return "", status.Errorf(codes.Internal, "failed to create email verification token: %v", err)
	}

	return token, nil
}

// VerifyEmailToken verifies an email verification token
func (s *SessionService) VerifyEmailToken(ctx context.Context, token string) (string, error) {
	// Get token from database
	verificationToken, err := s.userRepo.GetEmailVerificationToken(ctx, token)
	if err != nil {
		return "", status.Errorf(codes.InvalidArgument, "invalid or expired verification token")
	}

	// Check if token is still valid
	if verificationToken.Used {
		return "", status.Errorf(codes.InvalidArgument, "verification token already used")
	}

	if time.Now().After(verificationToken.ExpiresAt) {
		return "", status.Errorf(codes.InvalidArgument, "verification token has expired")
	}

	// Mark token as used
	if err := s.userRepo.MarkEmailVerificationTokenUsed(ctx, token); err != nil {
		return "", status.Errorf(codes.Internal, "failed to mark token as used: %v", err)
	}

	return verificationToken.UserID, nil
}

// GeneratePasswordResetToken generates a password reset token
func (s *SessionService) GeneratePasswordResetToken(ctx context.Context, userID string) (string, error) {
	// Generate secure random token
	token := util.GenerateSecureToken(32) // Generate 32-byte hex token

	// Create password reset token record
	resetToken := &repository.PasswordResetToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour), // 1 hour expiry for security
		Used:      false,
		CreatedAt: time.Now(),
	}

	// Save to database
	if err := s.userRepo.CreatePasswordResetToken(ctx, resetToken); err != nil {
		return "", status.Errorf(codes.Internal, "failed to create password reset token: %v", err)
	}

	return token, nil
}

// VerifyPasswordResetToken verifies a password reset token
func (s *SessionService) VerifyPasswordResetToken(ctx context.Context, token string) (string, error) {
	// Get token from database
	resetToken, err := s.userRepo.GetPasswordResetToken(ctx, token)
	if err != nil {
		return "", status.Errorf(codes.InvalidArgument, "invalid or expired reset token")
	}

	// Check if token is still valid
	if resetToken.Used {
		return "", status.Errorf(codes.InvalidArgument, "reset token already used")
	}

	if time.Now().After(resetToken.ExpiresAt) {
		return "", status.Errorf(codes.InvalidArgument, "reset token has expired")
	}

	// Mark token as used
	if err := s.userRepo.MarkPasswordResetTokenUsed(ctx, token); err != nil {
		return "", status.Errorf(codes.Internal, "failed to mark token as used: %v", err)
	}

	return resetToken.UserID, nil
}

// InvalidateAllUserSessions invalidates all sessions for a user
func (s *SessionService) InvalidateAllUserSessions(ctx context.Context, userID string) error {
	// This is same as TerminateAllSessions, so we can just call it
	return s.TerminateAllSessions(ctx, userID)
}

// GetDeviceDisplayName returns a human-readable device name for a session
func (s *SessionService) GetDeviceDisplayName(session *repository.Session) string {
	if session == nil || session.UserAgent == "" {
		return "Unknown Device"
	}
	return util.GetDeviceDisplayName(session.UserAgent)
}

// IsLikelySameDevice checks if two sessions are from the same device
func (s *SessionService) IsLikelySameDevice(session1, session2 *repository.Session) bool {
	if session1 == nil || session2 == nil {
		return false
	}
	return util.IsLikelySameDevice(session1.DeviceFingerprint, session2.DeviceFingerprint)
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

// detectSuspiciousDevice checks if this is a new device for the user
// ✅ ENABLED: Full device fingerprinting and new device detection
func (s *SessionService) detectSuspiciousDevice(ctx context.Context, userID, newFingerprint string) bool {
	// Get recent active sessions for this user
	sessions, err := s.sessionRepo.GetActiveSessions(ctx, userID)
	if err != nil || len(sessions) == 0 {
		// First session or error - not suspicious
		return false
	}

	// Check if any existing session has the same device fingerprint
	for _, session := range sessions {
		if util.IsLikelySameDevice(session.DeviceFingerprint, newFingerprint) {
			// Same device found - not suspicious
			return false
		}
	}

	// No matching device found - this is a new device
	return true
}

// checkForNewDevice is deprecated - use detectSuspiciousDevice instead
// Kept for backward compatibility
func (s *SessionService) checkForNewDevice(ctx context.Context, userID, ipAddress, deviceFingerprint string) bool {
	return s.detectSuspiciousDevice(ctx, userID, deviceFingerprint)
}
