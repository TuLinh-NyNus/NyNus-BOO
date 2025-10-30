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

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/auth"
	"exam-bank-system/apps/backend/internal/service/user/session"
)

// LoginHandler handles login-related business logic vá»›i IJWTService interface
// Xá»­ lÃ½ logic Ä‘Äƒng nháº­p vá»›i cÃ¡c tÃ­nh nÄƒng báº£o máº­t nÃ¢ng cao
//
// Business Logic:
// - Validate credentials (email + password)
// - Check account security (locked, inactive, suspended)
// - Handle failed login attempts vá»›i account locking
// - Generate JWT tokens (access + refresh)
// - Create sessions vá»›i device fingerprinting
type LoginHandler struct {
	userRepo       repository.IUserRepository
	jwtService     auth.IJWTService // Use interface instead of concrete type
	sessionService *session.SessionService
}

// NewLoginHandler creates a new LoginHandler instance vá»›i IJWTService interface
// Táº¡o instance má»›i cá»§a LoginHandler vá»›i cÃ¡c dependencies cáº§n thiáº¿t
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
// Kiá»ƒm tra thÃ´ng tin Ä‘Äƒng nháº­p (email vÃ  password)
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

	// DEBUG: Log password details
	log.Printf("DEBUG: ValidateCredentials - Email: %s, Password length: %d, Password: %s, Hash: %s",
		email, len(password), password, user.PasswordHash)

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		// Password is wrong - handle failed login
		log.Printf("DEBUG: bcrypt.CompareHashAndPassword failed: %v", err)
		if handleErr := h.HandleFailedLogin(ctx, user); handleErr != nil {
			log.Printf("Failed to handle failed login for user %s: %v", user.Email, handleErr)
		}
		return nil, status.Errorf(codes.Unauthenticated, ErrInvalidCredentials)
	}

	log.Printf("DEBUG: Password validation successful for user: %s", email)
	return user, nil
}

// CheckAccountSecurity checks if account is locked or inactive
// Kiá»ƒm tra tráº¡ng thÃ¡i báº£o máº­t cá»§a tÃ i khoáº£n (khÃ³a, inactive, suspended)
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
// Xá»­ lÃ½ Ä‘Äƒng nháº­p tháº¥t báº¡i: tÄƒng sá»‘ láº§n thá»­, khÃ³a tÃ i khoáº£n náº¿u vÆ°á»£t quÃ¡ giá»›i háº¡n
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
// Reset sá»‘ láº§n Ä‘Äƒng nháº­p tháº¥t báº¡i sau khi Ä‘Äƒng nháº­p thÃ nh cÃ´ng
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
// Táº¡o access token vÃ  refresh token vá»›i lÆ°u trá»¯ server-side
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
	// Convert protobuf enum to string for JWT
	roleStr := convertProtoRoleToString(user.Role)

	log.Printf("DEBUG: GenerateTokens - User ID: %s, Email: %s, Role enum: %v, Role string: '%s', Level: %d",
		user.ID, user.Email, user.Role, roleStr, user.Level)

	tokenResponse, err := h.jwtService.GenerateRefreshTokenPair(
		ctx,
		user.ID,
		user.Email,
		roleStr,
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
// Táº¡o session má»›i cho user vá»›i session token
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
// Cáº­p nháº­t thá»i gian Ä‘Äƒng nháº­p cuá»‘i cÃ¹ng vÃ  IP address
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
