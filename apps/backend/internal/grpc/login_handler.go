package grpc

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user/session"
)

// LoginHandler handles login-related business logic với IJWTService interface
// Xử lý logic đăng nhập với các tính năng bảo mật nâng cao
//
// Business Logic:
// - Validate credentials (email + password)
// - Check account security (locked, inactive, suspended)
// - Handle failed login attempts với account locking
// - Generate JWT tokens (access + refresh)
// - Create sessions với device fingerprinting
type LoginHandler struct {
	userRepo       repository.IUserRepository
	jwtService     auth.IJWTService // Use interface instead of concrete type
	sessionService *session.SessionService
}

// NewLoginHandler creates a new LoginHandler instance với IJWTService interface
// Tạo instance mới của LoginHandler với các dependencies cần thiết
//
// Parameters:
//   - userRepo: User repository for database operations
//   - jwtService: JWT service interface for token generation
//   - sessionService: Session service for session management
//
// Returns:
//   - *LoginHandler: Configured LoginHandler instance
func NewLoginHandler(
	userRepo repository.IUserRepository,
	jwtService auth.IJWTService, // Accept interface instead of concrete type
	sessionService *session.SessionService,
) *LoginHandler {
	return &LoginHandler{
		userRepo:       userRepo,
		jwtService:     jwtService,
		sessionService: sessionService,
	}
}

// ValidateCredentials validates email and password
// Kiểm tra thông tin đăng nhập (email và password)
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - email: User email address
//   - password: Plain text password
//
// Returns:
//   - *repository.User: User entity if credentials are valid
//   - error: Error if validation fails
func (h *LoginHandler) ValidateCredentials(ctx context.Context, email, password string) (*repository.User, error) {
	// Get user by email
	user, err := h.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, ErrInvalidCredentials)
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		// Password is wrong - handle failed login
		if handleErr := h.HandleFailedLogin(ctx, user); handleErr != nil {
			log.Printf("Failed to handle failed login for user %s: %v", user.Email, handleErr)
		}
		return nil, status.Errorf(codes.Unauthenticated, ErrInvalidCredentials)
	}

	return user, nil
}

// CheckAccountSecurity checks if account is locked or inactive
// Kiểm tra trạng thái bảo mật của tài khoản (khóa, inactive, suspended)
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - user: User entity to check
//
// Returns:
//   - error: Error if account has security issues
func (h *LoginHandler) CheckAccountSecurity(ctx context.Context, user *repository.User) error {
	// Check if account is locked
	if user.LockedUntil != nil && user.LockedUntil.After(time.Now()) {
		return status.Errorf(codes.PermissionDenied, ErrAccountLocked, user.LockedUntil.Format("2006-01-02 15:04:05"))
	}

	// Check if user is active
	if user.Status != StatusActive {
		return status.Errorf(codes.PermissionDenied, ErrAccountInactive, user.Status)
	}

	return nil
}

// HandleFailedLogin handles failed login attempts with account locking
// Xử lý đăng nhập thất bại: tăng số lần thử, khóa tài khoản nếu vượt quá giới hạn
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - user: User entity that failed login
//
// Returns:
//   - error: Error if handling fails
func (h *LoginHandler) HandleFailedLogin(ctx context.Context, user *repository.User) error {
	// Increment login attempts
	if err := h.userRepo.IncrementLoginAttempts(ctx, user.ID); err != nil {
		return fmt.Errorf("failed to increment login attempts: %w", err)
	}

	// Check if we need to lock account
	updatedUser, err := h.userRepo.GetByEmail(ctx, user.Email)
	if err != nil {
		return fmt.Errorf("failed to get updated user: %w", err)
	}

	if updatedUser.LoginAttempts >= MaxLoginAttempts {
		// Lock account for configured duration
		lockUntil := time.Now().Add(AccountLockDuration)
		if err := h.userRepo.LockAccount(ctx, user.ID, lockUntil); err != nil {
			return fmt.Errorf("failed to lock account: %w", err)
		}

		log.Printf("Account locked for user %s due to %d failed login attempts", user.Email, MaxLoginAttempts)
		return status.Errorf(codes.PermissionDenied, ErrTooManyLoginAttempts)
	}

	return nil
}

// ResetLoginAttempts resets login attempts after successful login
// Reset số lần đăng nhập thất bại sau khi đăng nhập thành công
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID to reset attempts
//
// Returns:
//   - error: Error if reset fails
func (h *LoginHandler) ResetLoginAttempts(ctx context.Context, userID string) error {
	if err := h.userRepo.ResetLoginAttempts(ctx, userID); err != nil {
		log.Printf("Failed to reset login attempts for user %s: %v", userID, err)
		return err
	}
	return nil
}

// GenerateTokens generates access and refresh tokens with server-side storage
// Tạo access token và refresh token với lưu trữ server-side
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - user: User entity to generate tokens for
//   - ipAddress: Client IP address
//   - userAgent: Client user agent
//   - deviceFingerprint: Device fingerprint for security
//
// Returns:
//   - *auth.RefreshTokenResponse: Token response with access and refresh tokens
//   - error: Error if token generation fails
func (h *LoginHandler) GenerateTokens(
	ctx context.Context,
	user *repository.User,
	ipAddress, userAgent, deviceFingerprint string,
) (*auth.RefreshTokenResponse, error) {
	tokenResponse, err := h.jwtService.GenerateRefreshTokenPair(
		ctx,
		user.ID,
		user.Email,
		string(user.Role),
		user.Level,
		ipAddress,
		userAgent,
		deviceFingerprint,
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, ErrTokenGenerationFailed, err)
	}

	return tokenResponse, nil
}

// CreateSession creates a new session for the user
// Tạo session mới cho user với session token
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - user: User entity to create session for
//   - ipAddress: Client IP address
//   - userAgent: Client user agent
//   - deviceFingerprint: Device fingerprint for security
//
// Returns:
//   - string: Session token
//   - error: Error if session creation fails
func (h *LoginHandler) CreateSession(
	ctx context.Context,
	user *repository.User,
	ipAddress, userAgent, deviceFingerprint string,
) (string, error) {
	// Generate session token
	sessionTokenBytes := make([]byte, SessionTokenSize)
	if _, err := rand.Read(sessionTokenBytes); err != nil {
		return "", status.Errorf(codes.Internal, ErrSessionCreationFailed)
	}
	sessionToken := base64.URLEncoding.EncodeToString(sessionTokenBytes)

	// Create session using session service
	_, err := h.sessionService.CreateSession(ctx, user.ID, sessionToken, ipAddress, userAgent, deviceFingerprint)
	if err != nil {
		log.Printf("Failed to create session for user %s: %v", user.ID, err)
		// Don't fail login if session creation fails, just return empty token
		return "", nil
	}

	return sessionToken, nil
}

// UpdateLastLogin updates user's last login timestamp and IP
// Cập nhật thời gian đăng nhập cuối cùng và IP address
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID to update
//   - ipAddress: Client IP address
//
// Returns:
//   - error: Error if update fails
func (h *LoginHandler) UpdateLastLogin(ctx context.Context, userID, ipAddress string) error {
	if err := h.userRepo.UpdateLastLogin(ctx, userID, ipAddress); err != nil {
		log.Printf("Failed to update last login for user %s: %v", userID, err)
		return err
	}
	return nil
}
