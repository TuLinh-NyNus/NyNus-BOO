package auth

import (
	"context"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// IJWTService Ä‘á»‹nh nghÄ©a interface cho JWT token operations
// Interface nÃ y tuÃ¢n thá»§ Interface Segregation Principle (ISP) vÃ  Dependency Inversion Principle (DIP)
// cho phÃ©p dá»… dÃ ng mock trong testing vÃ  thay tháº¿ implementation
//
// Business Logic:
// - Access tokens cÃ³ thá»i háº¡n ngáº¯n (15 phÃºt) Ä‘á»ƒ giáº£m thiá»ƒu rá»§i ro náº¿u bá»‹ Ä‘Ã¡nh cáº¯p
// - Refresh tokens cÃ³ thá»i háº¡n dÃ i (7 ngÃ y) Ä‘á»ƒ user khÃ´ng pháº£i Ä‘Äƒng nháº­p láº¡i thÆ°á»ng xuyÃªn
// - Token rotation vá»›i family tracking Ä‘á»ƒ phÃ¡t hiá»‡n token reuse attacks
// - Database-backed refresh tokens cho enhanced security
//
// Security Measures:
// - SHA-256 hashing cho refresh tokens trong database
// - Token family tracking Ä‘á»ƒ revoke toÃ n bá»™ family khi phÃ¡t hiá»‡n reuse
// - Device fingerprinting Ä‘á»ƒ phÃ¡t hiá»‡n suspicious activity
// - IP address vÃ  user agent tracking cho audit logging
type IJWTService interface {
	// ===== ACCESS TOKEN OPERATIONS =====

	// GenerateAccessToken táº¡o JWT access token vá»›i thÃ´ng tin user Ä‘áº§y Ä‘á»§
	//
	// Business Logic:
	// - Access token chá»©a user_id, email, role, level trong claims
	// - Token cÃ³ thá»i háº¡n 15 phÃºt (AccessTokenExpiry constant)
	// - Sá»­ dá»¥ng HS256 signing method vá»›i JWT secret
	//
	// Parameters:
	//   - userID: User ID (ULID format, khÃ´ng Ä‘Æ°á»£c empty)
	//   - email: User email (pháº£i valid email format)
	//   - role: User role (GUEST, STUDENT, TUTOR, TEACHER, ADMIN)
	//   - level: User level (0-9, chá»‰ Ã¡p dá»¥ng cho STUDENT/TUTOR/TEACHER)
	//
	// Returns:
	//   - string: JWT access token (base64 encoded)
	//   - error: Validation error hoáº·c signing error
	//
	// Example:
	//   token, err := jwtService.GenerateAccessToken("01HQXYZ...", "user@nynus.com", "STUDENT", 5)
	GenerateAccessToken(userID, email, role string, level int) (string, error)

	// ValidateAccessToken xÃ¡c thá»±c access token vÃ  tráº£ vá» claims
	//
	// Business Logic:
	// - Verify JWT signature vá»›i secret key
	// - Check token expiration time
	// - Validate claims structure (user_id, email, role pháº£i cÃ³)
	//
	// Parameters:
	//   - tokenString: JWT access token cáº§n validate
	//
	// Returns:
	//   - *UnifiedClaims: Token claims náº¿u valid
	//   - error: ErrTokenExpired, ErrTokenInvalidSignature, ErrTokenInvalidClaims
	//
	// Security:
	// - Constant-time comparison cho signature validation
	// - KhÃ´ng leak thÃ´ng tin vá» lÃ½ do token invalid trong error message
	ValidateAccessToken(tokenString string) (*UnifiedClaims, error)

	// ===== REFRESH TOKEN OPERATIONS =====

	// GenerateRefreshToken táº¡o JWT refresh token (DEPRECATED - use GenerateRefreshTokenPair)
	//
	// Note: Method nÃ y chá»‰ táº¡o JWT-based refresh token, khÃ´ng store vÃ o database
	// NÃªn sá»­ dá»¥ng GenerateRefreshTokenPair Ä‘á»ƒ cÃ³ database-backed security
	//
	// Parameters:
	//   - userID: User ID
	//
	// Returns:
	//   - string: JWT refresh token
	//   - error: Generation error
	GenerateRefreshToken(userID string) (string, error)

	// ValidateRefreshToken xÃ¡c thá»±c refresh token vÃ  tráº£ vá» user ID
	//
	// Business Logic:
	// - Verify JWT signature
	// - Check token expiration
	// - Extract user_id tá»« claims
	//
	// Parameters:
	//   - tokenString: JWT refresh token
	//
	// Returns:
	//   - string: User ID náº¿u token valid
	//   - error: Validation error
	//
	// Note: Method nÃ y chá»‰ validate JWT structure, khÃ´ng check database
	// Äá»ƒ cÃ³ full security vá»›i reuse detection, dÃ¹ng RefreshTokenWithRotation
	ValidateRefreshToken(tokenString string) (string, error)

	// ===== TOKEN PAIR OPERATIONS (DATABASE-BACKED) =====

	// GenerateRefreshTokenPair táº¡o cáº£ access token vÃ  refresh token vá»›i database storage
	//
	// Business Logic:
	// - Táº¡o access token (JWT) vá»›i user claims
	// - Táº¡o refresh token (secure random string, khÃ´ng pháº£i JWT)
	// - Store refresh token vÃ o database vá»›i SHA-256 hash
	// - Táº¡o token family má»›i cho rotation tracking
	// - LÆ°u device metadata (IP, user agent, fingerprint) cho security audit
	//
	// Security Measures:
	// - Refresh token lÃ  cryptographically secure random (256 bits)
	// - Token Ä‘Æ°á»£c hash vá»›i SHA-256 trÆ°á»›c khi lÆ°u database
	// - Token family cho phÃ©p revoke toÃ n bá»™ family khi phÃ¡t hiá»‡n reuse
	// - Device fingerprinting Ä‘á»ƒ phÃ¡t hiá»‡n suspicious login
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - userID: User ID
	//   - email: User email
	//   - role: User role
	//   - level: User level
	//   - ipAddress: Client IP address (for audit logging)
	//   - userAgent: Client user agent (for device tracking)
	//   - deviceFingerprint: Client device fingerprint (for security)
	//
	// Returns:
	//   - *RefreshTokenResponse: Contains access_token, refresh_token, user info
	//   - error: Generation error hoáº·c database error
	//
	// Example:
	//   response, err := jwtService.GenerateRefreshTokenPair(
	//     ctx, "01HQXYZ...", "user@nynus.com", "STUDENT", 5,
	//     "192.168.1.1", "Mozilla/5.0...", "abc123def456"
	//   )
	GenerateRefreshTokenPair(
		ctx context.Context,
		userID, email, role string,
		level int,
		ipAddress, userAgent, deviceFingerprint string,
	) (*RefreshTokenResponse, error)

	// RefreshTokenWithRotation validate vÃ  rotate refresh token vá»›i database-backed security
	//
	// Business Logic:
	// - Hash incoming refresh token vÃ  lookup trong database
	// - Detect token reuse (náº¿u token Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng trÆ°á»›c Ä‘Ã³)
	// - Náº¿u reuse detected â†’ revoke toÃ n bá»™ token family (security breach)
	// - Náº¿u valid â†’ generate new access token vÃ  new refresh token
	// - Revoke old refresh token vÃ  store new token (rotation)
	// - Inherit token family tá»« old token (tracking rotation chain)
	//
	// Security Measures:
	// - Token reuse detection prevents replay attacks
	// - Token family revocation prevents compromised token usage
	// - Parent token hash tracking cho audit trail
	// - User status check (ACTIVE/INACTIVE/SUSPENDED)
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - refreshToken: Current refresh token (raw string, not hashed)
	//   - ipAddress: Client IP address
	//   - userAgent: Client user agent
	//   - deviceFingerprint: Client device fingerprint
	//   - userRepo: User repository for user lookup
	//
	// Returns:
	//   - *RefreshTokenResponse: New access token vÃ  new refresh token
	//   - error: ErrRefreshTokenReused, ErrRefreshTokenExpired, ErrUserInactive
	//
	// Example:
	//   response, err := jwtService.RefreshTokenWithRotation(
	//     ctx, "abc123...", "192.168.1.1", "Mozilla/5.0...", "abc123def456", userRepo
	//   )
	RefreshTokenWithRotation(
		ctx context.Context,
		refreshToken, ipAddress, userAgent, deviceFingerprint string,
		userRepo repository.IUserRepository,
	) (*RefreshTokenResponse, error)

	// ===== TOKEN MANAGEMENT OPERATIONS =====

	// RevokeRefreshToken thu há»“i má»™t refresh token cá»¥ thá»ƒ vÃ  toÃ n bá»™ token family
	//
	// Business Logic:
	// - Hash refresh token vÃ  lookup trong database
	// - Revoke toÃ n bá»™ token family (khÃ´ng chá»‰ token hiá»‡n táº¡i)
	// - LÆ°u revocation reason cho audit logging
	//
	// Use Cases:
	// - User logout (revoke current session)
	// - Security breach detected (revoke all related tokens)
	// - Password change (revoke all tokens)
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - refreshToken: Refresh token cáº§n revoke
	//   - reason: LÃ½ do revoke (for audit logging)
	//
	// Returns:
	//   - error: Database error hoáº·c token not found
	RevokeRefreshToken(ctx context.Context, refreshToken, reason string) error

	// RevokeAllUserRefreshTokens thu há»“i táº¥t cáº£ refresh tokens cá»§a má»™t user
	//
	// Business Logic:
	// - Revoke táº¥t cáº£ active tokens cá»§a user
	// - Set is_active = FALSE vÃ  revoked_at = NOW()
	// - LÆ°u revocation reason
	//
	// Use Cases:
	// - User password change (force re-login on all devices)
	// - Account compromise detected (revoke all sessions)
	// - Admin action (suspend user account)
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - userID: User ID
	//   - reason: LÃ½ do revoke (for audit logging)
	//
	// Returns:
	//   - error: Database error
	RevokeAllUserRefreshTokens(ctx context.Context, userID, reason string) error

	// GetActiveRefreshTokensForUser láº¥y danh sÃ¡ch táº¥t cáº£ active refresh tokens cá»§a user
	//
	// Business Logic:
	// - Query táº¥t cáº£ tokens vá»›i is_active = TRUE
	// - Filter by user_id
	// - Order by created_at DESC
	//
	// Use Cases:
	// - Display active sessions to user
	// - Security audit (check for suspicious sessions)
	// - Enforce concurrent session limits
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - userID: User ID
	//
	// Returns:
	//   - []*repository.RefreshToken: List of active tokens
	//   - error: Database error
	GetActiveRefreshTokensForUser(ctx context.Context, userID string) ([]*repository.RefreshToken, error)

	// CleanupExpiredTokens dá»n dáº¹p expired vÃ  revoked tokens
	//
	// Business Logic:
	// - Delete tokens expired > 30 days ago (keep for audit)
	// - Delete revoked tokens > 7 days ago
	// - Return sá»‘ lÆ°á»£ng tokens Ä‘Ã£ cleanup
	//
	// Use Cases:
	// - Scheduled cleanup job (daily/weekly)
	// - Database maintenance
	// - Reduce database size
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//
	// Returns:
	//   - int: Sá»‘ lÆ°á»£ng tokens Ä‘Ã£ cleanup
	//   - error: Database error
	CleanupExpiredTokens(ctx context.Context) (int, error)

	// ===== LEGACY COMPATIBILITY METHODS =====

	// GenerateToken táº¡o JWT token cho user (legacy AuthService compatibility)
	//
	// Note: Method nÃ y maintain backward compatibility vá»›i AuthService.generateToken()
	// NÃªn sá»­ dá»¥ng GenerateAccessToken hoáº·c GenerateRefreshTokenPair cho new code
	//
	// Parameters:
	//   - user: User entity
	//
	// Returns:
	//   - string: JWT access token
	//   - error: Generation error
	GenerateToken(user *entity.User) (string, error)

	// ValidateToken validate JWT token vÃ  tráº£ vá» claims (legacy compatibility)
	//
	// Note: Wrapper around ValidateAccessToken cho backward compatibility
	//
	// Parameters:
	//   - tokenString: JWT token
	//
	// Returns:
	//   - *UnifiedClaims: Token claims
	//   - error: Validation error
	ValidateToken(tokenString string) (*UnifiedClaims, error)
}


