package auth

import (
	"errors"
	"fmt"
)

// ===== CUSTOM ERROR TYPES =====
// Äá»‹nh nghÄ©a cÃ¡c error types cá»¥ thá»ƒ cho JWT operations
// TuÃ¢n thá»§ Go error handling best practices vÃ  Clean Architecture principles

// ===== VALIDATION ERRORS =====
// Errors liÃªn quan Ä‘áº¿n input validation

var (
	// ErrEmptyUserID indicates user ID parameter is empty
	// Business Rule: User ID lÃ  required field, khÃ´ng Ä‘Æ°á»£c empty
	ErrEmptyUserID = errors.New("user ID cannot be empty")

	// ErrEmptyEmail indicates email parameter is empty
	// Business Rule: Email lÃ  required field cho access token claims
	ErrEmptyEmail = errors.New("email cannot be empty")

	// ErrEmptyRole indicates role parameter is empty
	// Business Rule: Role lÃ  required field cho RBAC authorization
	ErrEmptyRole = errors.New("role cannot be empty")

	// ErrInvalidLevel indicates level parameter is out of valid range
	// Business Rule: Level pháº£i tá»« 0-9 cho STUDENT/TUTOR/TEACHER roles
	// Level 0 = default/no level, Level 1-9 = specific levels
	ErrInvalidLevel = errors.New("level must be between 0 and 9")

	// ErrEmptyToken indicates token string is empty
	// Business Rule: Token string khÃ´ng Ä‘Æ°á»£c empty khi validate
	ErrEmptyToken = errors.New("token string cannot be empty")

	// ErrEmptyRefreshToken indicates refresh token is empty
	// Business Rule: Refresh token khÃ´ng Ä‘Æ°á»£c empty khi rotate
	ErrEmptyRefreshToken = errors.New("refresh token cannot be empty")

	// ErrEmptyIPAddress indicates IP address is empty
	// Business Rule: IP address required cho security audit logging
	ErrEmptyIPAddress = errors.New("IP address cannot be empty")

	// ErrEmptyDeviceFingerprint indicates device fingerprint is empty
	// Business Rule: Device fingerprint required cho device tracking
	ErrEmptyDeviceFingerprint = errors.New("device fingerprint cannot be empty")
)

// ===== TOKEN VALIDATION ERRORS =====
// Errors liÃªn quan Ä‘áº¿n JWT token validation

var (
	// ErrTokenExpired indicates token has expired
	// Business Rule: Access tokens expire after 15 minutes
	// Refresh tokens expire after 7 days
	ErrTokenExpired = errors.New("token has expired")

	// ErrTokenInvalidSignature indicates token signature is invalid
	// Security: Token cÃ³ thá»ƒ bá»‹ tampered hoáº·c signed vá»›i wrong secret
	ErrTokenInvalidSignature = errors.New("token has invalid signature")

	// ErrTokenInvalidClaims indicates token claims are invalid
	// Business Rule: Claims pháº£i cÃ³ Ä‘áº§y Ä‘á»§ user_id, email, role
	ErrTokenInvalidClaims = errors.New("token has invalid claims")

	// ErrTokenMalformed indicates token structure is malformed
	// Business Rule: JWT pháº£i cÃ³ format header.payload.signature
	ErrTokenMalformed = errors.New("token is malformed")

	// ErrTokenInvalidMethod indicates token signing method is invalid
	// Security: Chá»‰ accept HS256 signing method
	ErrTokenInvalidMethod = errors.New("token has invalid signing method")
)

// ===== REFRESH TOKEN ERRORS =====
// Errors liÃªn quan Ä‘áº¿n refresh token operations

var (
	// ErrRefreshTokenNotFound indicates refresh token not found in database
	// Business Rule: Token pháº£i tá»“n táº¡i trong database Ä‘á»ƒ valid
	ErrRefreshTokenNotFound = errors.New("refresh token not found")

	// ErrRefreshTokenExpired indicates refresh token has expired
	// Business Rule: Refresh tokens expire after 7 days
	ErrRefreshTokenExpired = errors.New("refresh token has expired")

	// ErrRefreshTokenRevoked indicates refresh token has been revoked
	// Business Rule: Revoked tokens khÃ´ng thá»ƒ sá»­ dá»¥ng láº¡i
	// Reasons: logout, password change, security breach
	ErrRefreshTokenRevoked = errors.New("refresh token has been revoked")

	// ErrRefreshTokenReused indicates refresh token reuse detected
	// Security: Token reuse lÃ  dáº¥u hiá»‡u cá»§a replay attack
	// Action: Revoke toÃ n bá»™ token family
	ErrRefreshTokenReused = errors.New("refresh token reuse detected - security breach")

	// ErrRefreshTokenInactive indicates refresh token is not active
	// Business Rule: Chá»‰ active tokens má»›i cÃ³ thá»ƒ sá»­ dá»¥ng
	ErrRefreshTokenInactive = errors.New("refresh token is not active")
)

// ===== REPOSITORY ERRORS =====
// Errors liÃªn quan Ä‘áº¿n repository operations

var (
	// ErrRefreshTokenRepoNil indicates refresh token repository is not configured
	// Business Rule: Repository required cho database-backed token operations
	// Náº¿u repo = nil, chá»‰ cÃ³ thá»ƒ dÃ¹ng JWT-based tokens (less secure)
	ErrRefreshTokenRepoNil = errors.New("refresh token repository is not configured")

	// ErrRefreshTokenRevocationFailed indicates failed to revoke refresh token
	// Database Error: Update operation failed
	ErrRefreshTokenRevocationFailed = errors.New("failed to revoke refresh token")
)

// ===== USER ERRORS =====
// Errors liÃªn quan Ä‘áº¿n user operations

var (
	// ErrUserInactive indicates user account is inactive
	// Business Rule: Chá»‰ ACTIVE users má»›i cÃ³ thá»ƒ login/refresh tokens
	// Status: ACTIVE, INACTIVE, SUSPENDED, BANNED
	ErrUserInactive = errors.New("user account is inactive")

	// ErrUserSuspended indicates user account is suspended
	// Business Rule: Suspended users khÃ´ng thá»ƒ login/refresh tokens
	ErrUserSuspended = errors.New("user account is suspended")

	// ErrUserBanned indicates user account is banned
	// Business Rule: Banned users khÃ´ng thá»ƒ login/refresh tokens
	ErrUserBanned = errors.New("user account is banned")
)

// ===== JWT ERROR WRAPPER =====
// JWTError wraps errors vá»›i context information cho better debugging

// JWTError wraps errors vá»›i operation context vÃ  user information
//
// Business Logic:
// - Cung cáº¥p context vá» operation Ä‘ang thá»±c hiá»‡n
// - Include user ID náº¿u cÃ³ (for audit logging)
// - Wrap underlying error Ä‘á»ƒ preserve error chain
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
	// Op lÃ  tÃªn operation Ä‘ang thá»±c hiá»‡n
	// Examples: "GenerateAccessToken", "ValidateToken", "RefreshTokenWithRotation"
	Op string

	// UserID lÃ  user ID liÃªn quan Ä‘áº¿n error (optional)
	// DÃ¹ng cho audit logging vÃ  debugging
	UserID string

	// Err lÃ  underlying error
	// CÃ³ thá»ƒ lÃ  validation error, database error, hoáº·c business logic error
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
// Cho phÃ©p sá»­ dá»¥ng errors.Is() vÃ  errors.As() Ä‘á»ƒ check underlying error
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
// - Check if error is ErrTokenExpired hoáº·c wrapped JWTError vá»›i ErrTokenExpired
// - DÃ¹ng errors.Is() Ä‘á»ƒ unwrap error chain
//
// Use Cases:
// - Middleware cáº§n distinguish expired token vs invalid token
// - Client cáº§n biáº¿t cÃ³ nÃªn refresh token hay re-login
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
// - Token reuse lÃ  critical security event
// - Cáº§n revoke toÃ n bá»™ token family vÃ  notify user
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
// - User account cÃ³ thá»ƒ INACTIVE, SUSPENDED, hoáº·c BANNED
// - Cáº§n distinguish Ä‘á»ƒ show appropriate error message
//
// Use Cases:
// - Show different error messages for different statuses
// - Prevent inactive users from accessing system
//
// Example:
//
//	if IsUserInactiveError(err) {
//	  return "TÃ i khoáº£n Ä‘Ã£ bá»‹ vÃ´ hiá»‡u hÃ³a. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn."
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

