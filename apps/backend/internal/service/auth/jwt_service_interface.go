package auth

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
)

// IJWTService định nghĩa interface cho JWT token operations
// Interface này tuân thủ Interface Segregation Principle (ISP) và Dependency Inversion Principle (DIP)
// cho phép dễ dàng mock trong testing và thay thế implementation
//
// Business Logic:
// - Access tokens có thời hạn ngắn (15 phút) để giảm thiểu rủi ro nếu bị đánh cắp
// - Refresh tokens có thời hạn dài (7 ngày) để user không phải đăng nhập lại thường xuyên
// - Token rotation với family tracking để phát hiện token reuse attacks
// - Database-backed refresh tokens cho enhanced security
//
// Security Measures:
// - SHA-256 hashing cho refresh tokens trong database
// - Token family tracking để revoke toàn bộ family khi phát hiện reuse
// - Device fingerprinting để phát hiện suspicious activity
// - IP address và user agent tracking cho audit logging
type IJWTService interface {
	// ===== ACCESS TOKEN OPERATIONS =====

	// GenerateAccessToken tạo JWT access token với thông tin user đầy đủ
	//
	// Business Logic:
	// - Access token chứa user_id, email, role, level trong claims
	// - Token có thời hạn 15 phút (AccessTokenExpiry constant)
	// - Sử dụng HS256 signing method với JWT secret
	//
	// Parameters:
	//   - userID: User ID (ULID format, không được empty)
	//   - email: User email (phải valid email format)
	//   - role: User role (GUEST, STUDENT, TUTOR, TEACHER, ADMIN)
	//   - level: User level (0-9, chỉ áp dụng cho STUDENT/TUTOR/TEACHER)
	//
	// Returns:
	//   - string: JWT access token (base64 encoded)
	//   - error: Validation error hoặc signing error
	//
	// Example:
	//   token, err := jwtService.GenerateAccessToken("01HQXYZ...", "user@nynus.com", "STUDENT", 5)
	GenerateAccessToken(userID, email, role string, level int) (string, error)

	// ValidateAccessToken xác thực access token và trả về claims
	//
	// Business Logic:
	// - Verify JWT signature với secret key
	// - Check token expiration time
	// - Validate claims structure (user_id, email, role phải có)
	//
	// Parameters:
	//   - tokenString: JWT access token cần validate
	//
	// Returns:
	//   - *UnifiedClaims: Token claims nếu valid
	//   - error: ErrTokenExpired, ErrTokenInvalidSignature, ErrTokenInvalidClaims
	//
	// Security:
	// - Constant-time comparison cho signature validation
	// - Không leak thông tin về lý do token invalid trong error message
	ValidateAccessToken(tokenString string) (*UnifiedClaims, error)

	// ===== REFRESH TOKEN OPERATIONS =====

	// GenerateRefreshToken tạo JWT refresh token (DEPRECATED - use GenerateRefreshTokenPair)
	//
	// Note: Method này chỉ tạo JWT-based refresh token, không store vào database
	// Nên sử dụng GenerateRefreshTokenPair để có database-backed security
	//
	// Parameters:
	//   - userID: User ID
	//
	// Returns:
	//   - string: JWT refresh token
	//   - error: Generation error
	GenerateRefreshToken(userID string) (string, error)

	// ValidateRefreshToken xác thực refresh token và trả về user ID
	//
	// Business Logic:
	// - Verify JWT signature
	// - Check token expiration
	// - Extract user_id từ claims
	//
	// Parameters:
	//   - tokenString: JWT refresh token
	//
	// Returns:
	//   - string: User ID nếu token valid
	//   - error: Validation error
	//
	// Note: Method này chỉ validate JWT structure, không check database
	// Để có full security với reuse detection, dùng RefreshTokenWithRotation
	ValidateRefreshToken(tokenString string) (string, error)

	// ===== TOKEN PAIR OPERATIONS (DATABASE-BACKED) =====

	// GenerateRefreshTokenPair tạo cả access token và refresh token với database storage
	//
	// Business Logic:
	// - Tạo access token (JWT) với user claims
	// - Tạo refresh token (secure random string, không phải JWT)
	// - Store refresh token vào database với SHA-256 hash
	// - Tạo token family mới cho rotation tracking
	// - Lưu device metadata (IP, user agent, fingerprint) cho security audit
	//
	// Security Measures:
	// - Refresh token là cryptographically secure random (256 bits)
	// - Token được hash với SHA-256 trước khi lưu database
	// - Token family cho phép revoke toàn bộ family khi phát hiện reuse
	// - Device fingerprinting để phát hiện suspicious login
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
	//   - error: Generation error hoặc database error
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

	// RefreshTokenWithRotation validate và rotate refresh token với database-backed security
	//
	// Business Logic:
	// - Hash incoming refresh token và lookup trong database
	// - Detect token reuse (nếu token đã được sử dụng trước đó)
	// - Nếu reuse detected → revoke toàn bộ token family (security breach)
	// - Nếu valid → generate new access token và new refresh token
	// - Revoke old refresh token và store new token (rotation)
	// - Inherit token family từ old token (tracking rotation chain)
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
	//   - *RefreshTokenResponse: New access token và new refresh token
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

	// RevokeRefreshToken thu hồi một refresh token cụ thể và toàn bộ token family
	//
	// Business Logic:
	// - Hash refresh token và lookup trong database
	// - Revoke toàn bộ token family (không chỉ token hiện tại)
	// - Lưu revocation reason cho audit logging
	//
	// Use Cases:
	// - User logout (revoke current session)
	// - Security breach detected (revoke all related tokens)
	// - Password change (revoke all tokens)
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - refreshToken: Refresh token cần revoke
	//   - reason: Lý do revoke (for audit logging)
	//
	// Returns:
	//   - error: Database error hoặc token not found
	RevokeRefreshToken(ctx context.Context, refreshToken, reason string) error

	// RevokeAllUserRefreshTokens thu hồi tất cả refresh tokens của một user
	//
	// Business Logic:
	// - Revoke tất cả active tokens của user
	// - Set is_active = FALSE và revoked_at = NOW()
	// - Lưu revocation reason
	//
	// Use Cases:
	// - User password change (force re-login on all devices)
	// - Account compromise detected (revoke all sessions)
	// - Admin action (suspend user account)
	//
	// Parameters:
	//   - ctx: Context for cancellation and timeout
	//   - userID: User ID
	//   - reason: Lý do revoke (for audit logging)
	//
	// Returns:
	//   - error: Database error
	RevokeAllUserRefreshTokens(ctx context.Context, userID, reason string) error

	// GetActiveRefreshTokensForUser lấy danh sách tất cả active refresh tokens của user
	//
	// Business Logic:
	// - Query tất cả tokens với is_active = TRUE
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

	// CleanupExpiredTokens dọn dẹp expired và revoked tokens
	//
	// Business Logic:
	// - Delete tokens expired > 30 days ago (keep for audit)
	// - Delete revoked tokens > 7 days ago
	// - Return số lượng tokens đã cleanup
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
	//   - int: Số lượng tokens đã cleanup
	//   - error: Database error
	CleanupExpiredTokens(ctx context.Context) (int, error)

	// ===== LEGACY COMPATIBILITY METHODS =====

	// GenerateToken tạo JWT token cho user (legacy AuthService compatibility)
	//
	// Note: Method này maintain backward compatibility với AuthService.generateToken()
	// Nên sử dụng GenerateAccessToken hoặc GenerateRefreshTokenPair cho new code
	//
	// Parameters:
	//   - user: User entity
	//
	// Returns:
	//   - string: JWT access token
	//   - error: Generation error
	GenerateToken(user *entity.User) (string, error)

	// ValidateToken validate JWT token và trả về claims (legacy compatibility)
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

