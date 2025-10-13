package auth

import (
	"errors"
	"fmt"
)

// ===== CUSTOM ERROR TYPES =====
// Định nghĩa các error types cụ thể cho JWT operations
// Tuân thủ Go error handling best practices và Clean Architecture principles

// ===== VALIDATION ERRORS =====
// Errors liên quan đến input validation

var (
	// ErrEmptyUserID indicates user ID parameter is empty
	// Business Rule: User ID là required field, không được empty
	ErrEmptyUserID = errors.New("user ID cannot be empty")

	// ErrEmptyEmail indicates email parameter is empty
	// Business Rule: Email là required field cho access token claims
	ErrEmptyEmail = errors.New("email cannot be empty")

	// ErrEmptyRole indicates role parameter is empty
	// Business Rule: Role là required field cho RBAC authorization
	ErrEmptyRole = errors.New("role cannot be empty")

	// ErrInvalidLevel indicates level parameter is out of valid range
	// Business Rule: Level phải từ 0-9 cho STUDENT/TUTOR/TEACHER roles
	// Level 0 = default/no level, Level 1-9 = specific levels
	ErrInvalidLevel = errors.New("level must be between 0 and 9")

	// ErrEmptyToken indicates token string is empty
	// Business Rule: Token string không được empty khi validate
	ErrEmptyToken = errors.New("token string cannot be empty")

	// ErrEmptyRefreshToken indicates refresh token is empty
	// Business Rule: Refresh token không được empty khi rotate
	ErrEmptyRefreshToken = errors.New("refresh token cannot be empty")

	// ErrEmptyIPAddress indicates IP address is empty
	// Business Rule: IP address required cho security audit logging
	ErrEmptyIPAddress = errors.New("IP address cannot be empty")

	// ErrEmptyDeviceFingerprint indicates device fingerprint is empty
	// Business Rule: Device fingerprint required cho device tracking
	ErrEmptyDeviceFingerprint = errors.New("device fingerprint cannot be empty")
)

// ===== TOKEN VALIDATION ERRORS =====
// Errors liên quan đến JWT token validation

var (
	// ErrTokenExpired indicates token has expired
	// Business Rule: Access tokens expire after 15 minutes
	// Refresh tokens expire after 7 days
	ErrTokenExpired = errors.New("token has expired")

	// ErrTokenInvalidSignature indicates token signature is invalid
	// Security: Token có thể bị tampered hoặc signed với wrong secret
	ErrTokenInvalidSignature = errors.New("token has invalid signature")

	// ErrTokenInvalidClaims indicates token claims are invalid
	// Business Rule: Claims phải có đầy đủ user_id, email, role
	ErrTokenInvalidClaims = errors.New("token has invalid claims")

	// ErrTokenMalformed indicates token structure is malformed
	// Business Rule: JWT phải có format header.payload.signature
	ErrTokenMalformed = errors.New("token is malformed")

	// ErrTokenInvalidMethod indicates token signing method is invalid
	// Security: Chỉ accept HS256 signing method
	ErrTokenInvalidMethod = errors.New("token has invalid signing method")
)

// ===== REFRESH TOKEN ERRORS =====
// Errors liên quan đến refresh token operations

var (
	// ErrRefreshTokenNotFound indicates refresh token not found in database
	// Business Rule: Token phải tồn tại trong database để valid
	ErrRefreshTokenNotFound = errors.New("refresh token not found")

	// ErrRefreshTokenExpired indicates refresh token has expired
	// Business Rule: Refresh tokens expire after 7 days
	ErrRefreshTokenExpired = errors.New("refresh token has expired")

	// ErrRefreshTokenRevoked indicates refresh token has been revoked
	// Business Rule: Revoked tokens không thể sử dụng lại
	// Reasons: logout, password change, security breach
	ErrRefreshTokenRevoked = errors.New("refresh token has been revoked")

	// ErrRefreshTokenReused indicates refresh token reuse detected
	// Security: Token reuse là dấu hiệu của replay attack
	// Action: Revoke toàn bộ token family
	ErrRefreshTokenReused = errors.New("refresh token reuse detected - security breach")

	// ErrRefreshTokenInactive indicates refresh token is not active
	// Business Rule: Chỉ active tokens mới có thể sử dụng
	ErrRefreshTokenInactive = errors.New("refresh token is not active")
)

// ===== REPOSITORY ERRORS =====
// Errors liên quan đến repository operations

var (
	// ErrRefreshTokenRepoNil indicates refresh token repository is not configured
	// Business Rule: Repository required cho database-backed token operations
	// Nếu repo = nil, chỉ có thể dùng JWT-based tokens (less secure)
	ErrRefreshTokenRepoNil = errors.New("refresh token repository is not configured")

	// ErrRefreshTokenRevocationFailed indicates failed to revoke refresh token
	// Database Error: Update operation failed
	ErrRefreshTokenRevocationFailed = errors.New("failed to revoke refresh token")
)

// ===== USER ERRORS =====
// Errors liên quan đến user operations

var (
	// ErrUserInactive indicates user account is inactive
	// Business Rule: Chỉ ACTIVE users mới có thể login/refresh tokens
	// Status: ACTIVE, INACTIVE, SUSPENDED, BANNED
	ErrUserInactive = errors.New("user account is inactive")

	// ErrUserSuspended indicates user account is suspended
	// Business Rule: Suspended users không thể login/refresh tokens
	ErrUserSuspended = errors.New("user account is suspended")

	// ErrUserBanned indicates user account is banned
	// Business Rule: Banned users không thể login/refresh tokens
	ErrUserBanned = errors.New("user account is banned")
)

// ===== JWT ERROR WRAPPER =====
// JWTError wraps errors với context information cho better debugging

// JWTError wraps errors với operation context và user information
//
// Business Logic:
// - Cung cấp context về operation đang thực hiện
// - Include user ID nếu có (for audit logging)
// - Wrap underlying error để preserve error chain
//
// Example:
//
//	err := &JWTError{
//	  Op: "GenerateAccessToken",
//	  UserID: "01HQXYZ...",
//	  Err: ErrEmptyEmail,
//	}
//	// Error message: "[JWT:GenerateAccessToken] user=01HQXYZ...: email cannot be empty"
type JWTError struct {
	// Op là tên operation đang thực hiện
	// Examples: "GenerateAccessToken", "ValidateToken", "RefreshTokenWithRotation"
	Op string

	// UserID là user ID liên quan đến error (optional)
	// Dùng cho audit logging và debugging
	UserID string

	// Err là underlying error
	// Có thể là validation error, database error, hoặc business logic error
	Err error
}

// Error implements error interface
// Format: "[JWT:Operation] user=UserID: underlying error"
func (e *JWTError) Error() string {
	if e.UserID != "" {
		return fmt.Sprintf("[JWT:%s] user=%s: %v", e.Op, e.UserID, e.Err)
	}
	return fmt.Sprintf("[JWT:%s] %v", e.Op, e.Err)
}

// Unwrap implements errors.Unwrap interface
// Cho phép sử dụng errors.Is() và errors.As() để check underlying error
//
// Example:
//
//	jwtErr := &JWTError{Op: "ValidateToken", Err: ErrTokenExpired}
//	if errors.Is(jwtErr, ErrTokenExpired) {
//	  // Handle expired token
//	}
func (e *JWTError) Unwrap() error {
	return e.Err
}

// ===== ERROR HELPER FUNCTIONS =====

// IsTokenExpiredError checks if error is token expired error
//
// Business Logic:
// - Check if error is ErrTokenExpired hoặc wrapped JWTError với ErrTokenExpired
// - Dùng errors.Is() để unwrap error chain
//
// Use Cases:
// - Middleware cần distinguish expired token vs invalid token
// - Client cần biết có nên refresh token hay re-login
//
// Example:
//
//	if IsTokenExpiredError(err) {
//	  // Try to refresh token
//	} else {
//	  // Force re-login
//	}
func IsTokenExpiredError(err error) bool {
	return errors.Is(err, ErrTokenExpired)
}

// IsTokenReuseError checks if error is token reuse error
//
// Security:
// - Token reuse là critical security event
// - Cần revoke toàn bộ token family và notify user
//
// Use Cases:
// - Detect replay attacks
// - Trigger security alerts
// - Force re-authentication
//
// Example:
//
//	if IsTokenReuseError(err) {
//	  // Send security alert to user
//	  // Revoke all user sessions
//	  // Log security event
//	}
func IsTokenReuseError(err error) bool {
	return errors.Is(err, ErrRefreshTokenReused)
}

// IsUserInactiveError checks if error is user inactive error
//
// Business Logic:
// - User account có thể INACTIVE, SUSPENDED, hoặc BANNED
// - Cần distinguish để show appropriate error message
//
// Use Cases:
// - Show different error messages for different statuses
// - Prevent inactive users from accessing system
//
// Example:
//
//	if IsUserInactiveError(err) {
//	  return "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
//	}
func IsUserInactiveError(err error) bool {
	return errors.Is(err, ErrUserInactive) ||
		errors.Is(err, ErrUserSuspended) ||
		errors.Is(err, ErrUserBanned)
}

// IsValidationError checks if error is validation error
//
// Business Logic:
// - Validation errors indicate client sent invalid data
// - Should return 400 Bad Request instead of 500 Internal Server Error
//
// Use Cases:
// - gRPC error code mapping (INVALID_ARGUMENT vs INTERNAL)
// - Error message localization
//
// Example:
//
//	if IsValidationError(err) {
//	  return status.Errorf(codes.InvalidArgument, err.Error())
//	}
func IsValidationError(err error) bool {
	return errors.Is(err, ErrEmptyUserID) ||
		errors.Is(err, ErrEmptyEmail) ||
		errors.Is(err, ErrEmptyRole) ||
		errors.Is(err, ErrInvalidLevel) ||
		errors.Is(err, ErrEmptyToken) ||
		errors.Is(err, ErrEmptyRefreshToken) ||
		errors.Is(err, ErrEmptyIPAddress) ||
		errors.Is(err, ErrEmptyDeviceFingerprint)
}

