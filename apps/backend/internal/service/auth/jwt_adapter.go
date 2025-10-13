package auth

import "context"

// JWTAdapter adapts IJWTService to OAuth's JWTService interface
//
// Business Logic:
// - Adapter pattern để bridge IJWTService với OAuth's JWTService interface
// - OAuth interface không pass email và level, nên sử dụng defaults
// - Actual email và level should come from user data in OAuthService
type JWTAdapter struct {
	jwtService IJWTService
}

// NewJWTAdapter creates a new JWT adapter
//
// Parameters:
//   - jwtService: IJWTService implementation
//
// Returns:
//   - *JWTAdapter: Configured adapter instance
func NewJWTAdapter(jwtService IJWTService) *JWTAdapter {
	return &JWTAdapter{
		jwtService: jwtService,
	}
}

// GenerateAccessToken generates access token (adapter method)
func (a *JWTAdapter) GenerateAccessToken(userID string, role string) (string, error) {
	// OAuth interface doesn't pass email and level, so we use defaults
	// The actual email and level should come from user data in OAuthService
	return a.GenerateAccessTokenWithDetails(userID, "", role, 0)
}

// GenerateAccessTokenWithDetails generates access token with full user details
func (a *JWTAdapter) GenerateAccessTokenWithDetails(userID, email, role string, level int) (string, error) {
	return a.jwtService.GenerateAccessToken(userID, email, role, level)
}

// GenerateRefreshToken generates refresh token
func (a *JWTAdapter) GenerateRefreshToken(userID string) (string, error) {
	return a.jwtService.GenerateRefreshToken(userID)
}

// ValidateRefreshToken validates refresh token
func (a *JWTAdapter) ValidateRefreshToken(token string) (string, error) {
	return a.jwtService.ValidateRefreshToken(token)
}

// CleanupExpiredTokens removes expired and old revoked tokens
func (a *JWTAdapter) CleanupExpiredTokens(ctx context.Context) (int, error) {
	return a.jwtService.CleanupExpiredTokens(ctx)
}
