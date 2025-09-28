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

// CreateSession creates a new user session with enhanced fingerprinting
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
		if s.notificationService != nil {
			// Create notification about session termination
			message := fmt.Sprintf("Phiên đăng nhập từ %s đã bị chấm dứt do vượt quá giới hạn %d thiết bị đồng thời.",
				oldestSession.IPAddress, maxSessions)

			if err := s.notificationService.CreateSecurityAlert(ctx, userID,
				"Phiên đăng nhập bị chấm dứt", message, oldestSession.IPAddress, oldestSession.UserAgent); err != nil {
				fmt.Printf("Failed to send session termination notification: %v\n", err)
			}
		}
	}

	// Generate device fingerprint if not provided
	if deviceFingerprint == "" {
		deviceFingerprint = util.GenerateDeviceFingerprint(userAgent, ipAddress, userID)
	}

	// Check for new device/IP login to send notifications
	isNewDevice := s.checkForNewDevice(ctx, userID, ipAddress, deviceFingerprint)

	// Create new session with 24h inactivity expiry (sliding window)
	session := &repository.Session{
		UserID:            userID,
		SessionToken:      sessionToken,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		DeviceFingerprint: deviceFingerprint,
		IsActive:          true,
		LastActivity:      time.Now(),
		ExpiresAt:         time.Now().Add(24 * time.Hour), // 24 hours sliding window
	}

	if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create session: %v", err)
	}

	// Send new device login notification if needed
	if isNewDevice && s.notificationService != nil {
		location := "Vị trí không xác định"
		if err := s.notificationService.CreateLoginAlert(ctx, userID, ipAddress, userAgent, location); err != nil {
			fmt.Printf("Failed to send new device login notification: %v\n", err)
		}
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
	differentFingerprints := make(map[string]bool)
	for _, session := range sessions {
		differentIPs[session.IPAddress] = true
		differentFingerprints[session.DeviceFingerprint] = true
	}

	// If too many different IPs in active sessions
	if len(differentIPs) > 5 {
		// Send suspicious activity alert
		if s.notificationService != nil {
			title := "Phát hiện hoạt động đáng nghi"
			message := fmt.Sprintf("Tài khoản của bạn đang được truy cập từ %d địa chỉ IP khác nhau cùng lúc. Nếu không phải bạn, vui lòng đổi mật khẩu ngay.", len(differentIPs))
			if err := s.notificationService.CreateSecurityAlert(ctx, userID, title, message, ipAddress, userAgent); err != nil {
				fmt.Printf("Failed to send suspicious activity alert: %v\n", err)
			}
		}
		return true, nil
	}

	// Check for too many different device fingerprints
	if len(differentFingerprints) > 3 { // More than 3 different devices is suspicious
		// Send suspicious device alert
		if s.notificationService != nil {
			title := "Phát hiện nhiều thiết bị truy cập"
			message := fmt.Sprintf("Tài khoản của bạn đang được truy cập từ %d thiết bị khác nhau cùng lúc. Nếu không phải bạn, vui lòng kiểm tra bảo mật tài khoản.", len(differentFingerprints))
			if err := s.notificationService.CreateSecurityAlert(ctx, userID, title, message, ipAddress, userAgent); err != nil {
				fmt.Printf("Failed to send suspicious device alert: %v\n", err)
			}
		}
		return true, nil
	}

	// Check if current request has suspicious fingerprint changes
	currentFingerprint := util.GenerateDeviceFingerprint(userAgent, ipAddress, userID)
	for _, session := range sessions {
		if session.DeviceFingerprint != "" &&
			util.DetectSuspiciousIPChange(session.DeviceFingerprint, currentFingerprint) &&
			session.IPAddress != ipAddress { // Different IP and different fingerprint
			return true, nil
		}
	}

	return false, nil
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

// checkForNewDevice checks if this is a new device/IP combination for the user
func (s *SessionService) checkForNewDevice(ctx context.Context, userID, ipAddress, deviceFingerprint string) bool {
	// Get recent sessions (last 30 days) for this user
	recentSessions, err := s.sessionRepo.GetUserSessions(ctx, userID)
	if err != nil {
		// If we can't get sessions, assume it's a new device for safety
		return true
	}

	// Check if we've seen this IP or device fingerprint before
	for _, session := range recentSessions {
		// If same IP and similar device fingerprint, it's likely the same device
		if session.IPAddress == ipAddress {
			// Check device fingerprint similarity
			if session.DeviceFingerprint == deviceFingerprint {
				return false // Same device
			}
		}
	}

	// If no matching IP+device combination found, it's a new device
	return true
}
