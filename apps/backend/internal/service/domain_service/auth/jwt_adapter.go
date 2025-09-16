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
	// OAuth interface doesn't pass level, so we use 0 as default
	// The actual level should be set based on role if needed
	level := 0
	if role == "STUDENT" || role == "TUTOR" || role == "TEACHER" {
		level = 1 // Default level, actual level should come from user data
	}
	
	// Email can be empty for OAuth flow since we have userID
	return a.jwtService.GenerateAccessToken(userID, "", role, level)
}

// GenerateRefreshToken generates refresh token
func (a *JWTAdapter) GenerateRefreshToken(userID string) (string, error) {
	return a.jwtService.GenerateRefreshToken(userID)
}

// ValidateRefreshToken validates refresh token
func (a *JWTAdapter) ValidateRefreshToken(token string) (string, error) {
	return a.jwtService.ValidateRefreshToken(token)
}