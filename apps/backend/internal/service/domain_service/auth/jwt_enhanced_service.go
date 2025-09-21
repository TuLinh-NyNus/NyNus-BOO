package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
)

// EnhancedJWTService extends JWTService with refresh token rotation
type EnhancedJWTService struct {
	*JWTService
	refreshTokenRepo *repository.RefreshTokenRepository
}

// NewEnhancedJWTService creates a new enhanced JWT service with refresh token rotation
func NewEnhancedJWTService(accessSecret, refreshSecret string, refreshTokenRepo *repository.RefreshTokenRepository) *EnhancedJWTService {
	return &EnhancedJWTService{
		JWTService:       NewJWTService(accessSecret, refreshSecret),
		refreshTokenRepo: refreshTokenRepo,
	}
}

// RefreshTokenResponse represents the response from refresh token operation
type RefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	UserID       string `json:"user_id"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	Level        int    `json:"level"`
}

// GenerateRefreshTokenPair generates both access and refresh tokens with server-side storage
func (s *EnhancedJWTService) GenerateRefreshTokenPair(ctx context.Context, userID, email, role string, level int, ipAddress, userAgent, deviceFingerprint string) (*RefreshTokenResponse, error) {
	// Generate access token
	accessToken, err := s.GenerateAccessToken(userID, email, role, level)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate raw refresh token (random string)
	rawRefreshToken, err := s.generateSecureRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Hash token for storage
	tokenHash := s.refreshTokenRepo.HashToken(rawRefreshToken)

	// Generate token family (for new token)
	tokenFamily := s.refreshTokenRepo.GenerateTokenFamily()

	// Store refresh token in database
	refreshTokenRecord := &repository.RefreshToken{
		UserID:            userID,
		TokenHash:         tokenHash,
		TokenFamily:       tokenFamily,
		IsActive:          true,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		DeviceFingerprint: deviceFingerprint,
		ExpiresAt:         time.Now().Add(7 * 24 * time.Hour), // 7 days
		CreatedAt:         time.Now(),
	}

	err = s.refreshTokenRepo.StoreRefreshToken(ctx, refreshTokenRecord)
	if err != nil {
		return nil, fmt.Errorf("failed to store refresh token: %w", err)
	}

	return &RefreshTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken, // Return raw token to client
		UserID:       userID,
		Email:        email,
		Role:         role,
		Level:        level,
	}, nil
}

// RefreshTokenWithRotation validates and rotates a refresh token
func (s *EnhancedJWTService) RefreshTokenWithRotation(ctx context.Context, refreshToken, ipAddress, userAgent, deviceFingerprint string, userRepo repository.IUserRepository) (*RefreshTokenResponse, error) {
	// Hash the provided token
	tokenHash := s.refreshTokenRepo.HashToken(refreshToken)

	// Validate and use the refresh token (includes reuse detection)
	tokenRecord, reuseDetected, err := s.refreshTokenRepo.ValidateAndUseRefreshToken(ctx, tokenHash)
	if err != nil {
		if err == repository.ErrRefreshTokenNotFound {
			return nil, fmt.Errorf("refresh token not found or expired")
		}
		if err == repository.ErrRefreshTokenExpired {
			return nil, fmt.Errorf("refresh token expired")
		}
		if err == repository.ErrRefreshTokenRevoked {
			return nil, fmt.Errorf("refresh token revoked")
		}
		return nil, fmt.Errorf("failed to validate refresh token: %w", err)
	}

	// If reuse detected, reject the request
	if reuseDetected {
		return nil, fmt.Errorf("refresh token reuse detected - all tokens revoked for security")
	}

	// Get user details for new tokens
	user, err := userRepo.GetByID(ctx, tokenRecord.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user is still active
	if user.Status != "ACTIVE" {
		// Revoke all user tokens if account is inactive
		s.refreshTokenRepo.RevokeAllUserTokens(ctx, user.ID, "account_inactive")
		return nil, fmt.Errorf("user account is inactive")
	}

	// Generate new access token
	newAccessToken, err := s.GenerateAccessToken(user.ID, user.Email, string(user.Role), user.Level)
	if err != nil {
		return nil, fmt.Errorf("failed to generate new access token: %w", err)
	}

	// Generate new refresh token
	newRawRefreshToken, err := s.generateSecureRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate new refresh token: %w", err)
	}

	newTokenHash := s.refreshTokenRepo.HashToken(newRawRefreshToken)

	// Create new refresh token record
	newRefreshTokenRecord := &repository.RefreshToken{
		TokenHash:         newTokenHash,
		IsActive:          true,
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		DeviceFingerprint: deviceFingerprint,
		ExpiresAt:         time.Now().Add(7 * 24 * time.Hour), // 7 days
		CreatedAt:         time.Now(),
		// UserID, TokenFamily, ParentTokenHash will be set by RotateRefreshToken
	}

	// Rotate the refresh token (revoke old, create new)
	err = s.refreshTokenRepo.RotateRefreshToken(ctx, tokenHash, newRefreshTokenRecord)
	if err != nil {
		return nil, fmt.Errorf("failed to rotate refresh token: %w", err)
	}

	return &RefreshTokenResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRawRefreshToken,
		UserID:       user.ID,
		Email:        user.Email,
		Role:         string(user.Role),
		Level:        user.Level,
	}, nil
}

// RevokeRefreshToken revokes a specific refresh token
func (s *EnhancedJWTService) RevokeRefreshToken(ctx context.Context, refreshToken, reason string) error {
	tokenHash := s.refreshTokenRepo.HashToken(refreshToken)

	// Get token record
	tokenRecord, err := s.refreshTokenRepo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		if err == repository.ErrRefreshTokenNotFound {
			// Token doesn't exist, consider it already revoked
			return nil
		}
		return err
	}

	// Revoke the entire token family for security
	return s.refreshTokenRepo.RevokeTokenFamily(ctx, tokenRecord.TokenFamily, reason)
}

// RevokeAllUserRefreshTokens revokes all refresh tokens for a user
func (s *EnhancedJWTService) RevokeAllUserRefreshTokens(ctx context.Context, userID, reason string) error {
	return s.refreshTokenRepo.RevokeAllUserTokens(ctx, userID, reason)
}

// GetActiveRefreshTokensForUser returns all active refresh tokens for a user
func (s *EnhancedJWTService) GetActiveRefreshTokensForUser(ctx context.Context, userID string) ([]*repository.RefreshToken, error) {
	return s.refreshTokenRepo.GetActiveTokensForUser(ctx, userID)
}

// CleanupExpiredTokens removes expired and old revoked tokens
func (s *EnhancedJWTService) CleanupExpiredTokens(ctx context.Context) (int, error) {
	return s.refreshTokenRepo.CleanupExpiredTokens(ctx)
}

// ValidateRefreshTokenSecure validates a refresh token against server-side storage
// This should be used instead of ValidateRefreshToken for enhanced security
func (s *EnhancedJWTService) ValidateRefreshTokenSecure(ctx context.Context, refreshToken string) (*repository.RefreshToken, error) {
	tokenHash := s.refreshTokenRepo.HashToken(refreshToken)

	tokenRecord, err := s.refreshTokenRepo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		return nil, err
	}

	// Check if token is active and not expired
	if !tokenRecord.IsActive || tokenRecord.RevokedAt != nil {
		return nil, repository.ErrRefreshTokenRevoked
	}

	if time.Now().After(tokenRecord.ExpiresAt) {
		return nil, repository.ErrRefreshTokenExpired
	}

	return tokenRecord, nil
}

// generateSecureRefreshToken generates a cryptographically secure random token
func (s *EnhancedJWTService) generateSecureRefreshToken() (string, error) {
	// Generate 32 bytes of random data (256 bits)
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	// Encode to base64 for safe transport
	return base64.URLEncoding.EncodeToString(bytes), nil
}

// TokenStats represents refresh token statistics
type TokenStats struct {
	TotalTokens   int `json:"total_tokens"`
	ActiveTokens  int `json:"active_tokens"`
	ExpiredTokens int `json:"expired_tokens"`
	RevokedTokens int `json:"revoked_tokens"`
}

// GetRefreshTokenStats returns statistics about refresh tokens for monitoring
func (s *EnhancedJWTService) GetRefreshTokenStats(ctx context.Context) (*TokenStats, error) {
	// This would require additional database queries
	// For now, return basic stats - can be expanded later
	return &TokenStats{
		TotalTokens:   0, // TODO: implement
		ActiveTokens:  0, // TODO: implement
		ExpiredTokens: 0, // TODO: implement
		RevokedTokens: 0, // TODO: implement
	}, nil
}
