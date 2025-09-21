package auth

// JWTAdapter adapts JWTService to OAuth's JWTService interface
type JWTAdapter struct {
	jwtService *JWTService
}

// NewJWTAdapter creates a new JWT adapter
func NewJWTAdapter(jwtService *JWTService) *JWTAdapter {
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
