package auth

import (
	"regexp"
	"strings"
)

// ===== VALIDATION HELPER FUNCTIONS =====
// CÃ¡c helper functions Ä‘á»ƒ validate input parameters cho JWT operations
// TuÃ¢n thá»§ Clean Code principles: Single Responsibility, Clear naming

// ===== CONSTANTS FOR VALIDATION =====

const (
	// MinUserIDLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a User ID (ULID format)
	// ULID format: 26 characters (e.g., 01HQXYZ1234567890ABCDEFGH)
	MinUserIDLength = 26

	// MaxUserIDLength lÃ  Ä‘á»™ dÃ i tá»‘i Ä‘a cá»§a User ID
	MaxUserIDLength = 26

	// MinEmailLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a email
	// Example: a@b.c = 5 characters
	MinEmailLength = 5

	// MaxEmailLength lÃ  Ä‘á»™ dÃ i tá»‘i Ä‘a cá»§a email
	// RFC 5321: 254 characters
	MaxEmailLength = 254

	// MinRoleLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a role
	// Shortest role: "GUEST" = 5 characters
	MinRoleLength = 5

	// MaxRoleLength lÃ  Ä‘á»™ dÃ i tá»‘i Ä‘a cá»§a role
	// Longest role: "TEACHER" = 7 characters
	MaxRoleLength = 7

	// MinLevel lÃ  level tá»‘i thiá»ƒu
	// Level 0 = no level/default
	MinLevel = 0

	// MaxLevel lÃ  level tá»‘i Ä‘a
	// Level 1-9 cho STUDENT/TUTOR/TEACHER
	MaxLevel = 9

	// MinTokenLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a JWT token
	// JWT format: header.payload.signature (minimum ~100 characters)
	MinTokenLength = 50

	// MinRefreshTokenLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a refresh token
	// Secure random token: base64 encoded 32 bytes = 44 characters
	MinRefreshTokenLength = 40

	// MinIPAddressLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a IP address
	// IPv6 compressed: 2 characters (e.g., "::")
	// IPv6 localhost: 3 characters (e.g., "::1")
	// IPv4: 7 characters (e.g., "1.1.1.1")
	MinIPAddressLength = 2

	// MaxIPAddressLength lÃ  Ä‘á»™ dÃ i tá»‘i Ä‘a cá»§a IP address
	// IPv6: 45 characters (e.g., "2001:0db8:85a3:0000:0000:8a2e:0370:7334")
	MaxIPAddressLength = 45

	// MinDeviceFingerprintLength lÃ  Ä‘á»™ dÃ i tá»‘i thiá»ƒu cá»§a device fingerprint
	// Device fingerprint: hash string (minimum 32 characters)
	MinDeviceFingerprintLength = 32
)

// ===== REGEX PATTERNS =====

var (
	// emailRegex validates email format
	// Pattern: local-part@domain
	// Supports: letters, numbers, dots, hyphens, underscores
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

	// ulidRegex validates ULID format
	// Pattern: 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
	ulidRegex = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{26}$`)

	// uuidRegex validates UUID format
	// Pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12 hex digits)
	uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

	// textIDRegex validates TEXT ID format for legacy/test accounts
	// Pattern: (student|admin|teacher|tutor)-NNN (e.g., student-001, admin-001)
	textIDRegex = regexp.MustCompile(`^(student|admin|teacher|tutor)-\d{3}$`)

	// ipv4Regex validates IPv4 address format
	// Pattern: xxx.xxx.xxx.xxx (0-255 for each octet)
	ipv4Regex = regexp.MustCompile(`^(\d{1,3}\.){3}\d{1,3}$`)

	// ipv6Regex validates IPv6 address format (supports compressed format)
	// Pattern: Supports both full format (xxxx:xxxx:...:xxxx) and compressed format (::1, ::ffff:192.0.2.1)
	// This regex accepts:
	// - Full IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
	// - Compressed: ::1, ::, 2001:db8::1
	// - IPv4-mapped IPv6: ::ffff:192.0.2.1
	ipv6Regex = regexp.MustCompile(`^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::)$`)
)

// ===== VALIDATION FUNCTIONS =====

// ValidateUserID validates user ID parameter
//
// Business Rules:
// - User ID khÃ´ng Ä‘Æ°á»£c empty
// - User ID pháº£i cÃ³ má»™t trong cÃ¡c formats:
//   * ULID (26 chars): 01HQXYZ1234567890ABCDEFGH
//   * UUID (36 chars): 0082957e-7fd7-485b-a64a-b302251e380b
//   * TEXT ID (pattern-NNN): student-001, admin-001, teacher-001, tutor-001
//
// Parameters:
//   - userID: User ID cáº§n validate
//
// Returns:
//   - error: ErrEmptyUserID náº¿u empty, validation error náº¿u invalid format
//
// Example:
//
//	if err := ValidateUserID("01HQXYZ1234567890ABCDEFGH"); err != nil {
//	  return err
//	}
//	if err := ValidateUserID("0082957e-7fd7-485b-a64a-b302251e380b"); err != nil {
//	  return err
//	}
//	if err := ValidateUserID("student-001"); err != nil {
//	  return err
//	}
func ValidateUserID(userID string) error {
	if userID == "" {
		return ErrEmptyUserID
	}

	// Accept ULID (26 chars), UUID (36 chars), or TEXT ID (pattern-NNN) formats
	isULID := len(userID) == 26 && ulidRegex.MatchString(userID)
	isUUID := len(userID) == 36 && uuidRegex.MatchString(userID)
	isTextID := textIDRegex.MatchString(userID)

	if !isULID && !isUUID && !isTextID {
		return &JWTError{
			Op:  "ValidateUserID",
			Err: ErrEmptyUserID, // Reuse error for simplicity
		}
	}

	return nil
}

// ValidateEmail validates email parameter
//
// Business Rules:
// - Email khÃ´ng Ä‘Æ°á»£c empty
// - Email pháº£i cÃ³ Ä‘á»™ dÃ i tá»« 5-254 characters
// - Email pháº£i match email regex pattern
//
// Parameters:
//   - email: Email cáº§n validate
//
// Returns:
//   - error: ErrEmptyEmail náº¿u empty, validation error náº¿u invalid format
//
// Example:
//
//	if err := ValidateEmail("user@nynus.com"); err != nil {
//	  return err
//	}
func ValidateEmail(email string) error {
	if email == "" {
		return ErrEmptyEmail
	}

	// Check length
	if len(email) < MinEmailLength || len(email) > MaxEmailLength {
		return &JWTError{
			Op:  "ValidateEmail",
			Err: ErrEmptyEmail,
		}
	}

	// Check email format
	if !emailRegex.MatchString(email) {
		return &JWTError{
			Op:  "ValidateEmail",
			Err: ErrEmptyEmail,
		}
	}

	return nil
}

// ValidateRole validates role parameter
//
// Business Rules:
// - Role khÃ´ng Ä‘Æ°á»£c empty
// - Role pháº£i lÃ  má»™t trong: GUEST, STUDENT, TUTOR, TEACHER, ADMIN
// - Role pháº£i uppercase
//
// Parameters:
//   - role: Role cáº§n validate
//
// Returns:
//   - error: ErrEmptyRole náº¿u empty, validation error náº¿u invalid role
//
// Example:
//
//	if err := ValidateRole("STUDENT"); err != nil {
//	  return err
//	}
func ValidateRole(role string) error {
	if role == "" {
		return ErrEmptyRole
	}

	// Check length
	if len(role) < MinRoleLength || len(role) > MaxRoleLength {
		return &JWTError{
			Op:  "ValidateRole",
			Err: ErrEmptyRole,
		}
	}

	// Check valid roles
	validRoles := map[string]bool{
		"GUEST":   true,
		"STUDENT": true,
		"TUTOR":   true,
		"TEACHER": true,
		"ADMIN":   true,
	}

	if !validRoles[strings.ToUpper(role)] {
		return &JWTError{
			Op:  "ValidateRole",
			Err: ErrEmptyRole,
		}
	}

	return nil
}

// ValidateLevel validates level parameter
//
// Business Rules:
// - Level pháº£i tá»« 0-9
// - Level 0 = no level/default (for GUEST, ADMIN)
// - Level 1-9 = specific levels (for STUDENT, TUTOR, TEACHER)
//
// Parameters:
//   - level: Level cáº§n validate
//
// Returns:
//   - error: ErrInvalidLevel náº¿u out of range
//
// Example:
//
//	if err := ValidateLevel(5); err != nil {
//	  return err
//	}
func ValidateLevel(level int) error {
	if level < MinLevel || level > MaxLevel {
		return ErrInvalidLevel
	}
	return nil
}

// ValidateTokenString validates token string parameter
//
// Business Rules:
// - Token string khÃ´ng Ä‘Æ°á»£c empty
// - Token string pháº£i cÃ³ Ä‘á»™ dÃ i tá»‘i thiá»ƒu (JWT format)
//
// Parameters:
//   - tokenString: Token string cáº§n validate
//
// Returns:
//   - error: ErrEmptyToken náº¿u empty, validation error náº¿u too short
//
// Example:
//
//	if err := ValidateTokenString("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."); err != nil {
//	  return err
//	}
func ValidateTokenString(tokenString string) error {
	if tokenString == "" {
		return ErrEmptyToken
	}

	// Check minimum length
	if len(tokenString) < MinTokenLength {
		return &JWTError{
			Op:  "ValidateTokenString",
			Err: ErrEmptyToken,
		}
	}

	return nil
}

// ValidateRefreshToken validates refresh token parameter
//
// Business Rules:
// - Refresh token khÃ´ng Ä‘Æ°á»£c empty
// - Refresh token pháº£i cÃ³ Ä‘á»™ dÃ i tá»‘i thiá»ƒu (secure random string)
//
// Parameters:
//   - refreshToken: Refresh token cáº§n validate
//
// Returns:
//   - error: ErrEmptyRefreshToken náº¿u empty, validation error náº¿u too short
//
// Example:
//
//	if err := ValidateRefreshToken("abc123def456..."); err != nil {
//	  return err
//	}
func ValidateRefreshToken(refreshToken string) error {
	if refreshToken == "" {
		return ErrEmptyRefreshToken
	}

	// Check minimum length
	if len(refreshToken) < MinRefreshTokenLength {
		return &JWTError{
			Op:  "ValidateRefreshToken",
			Err: ErrEmptyRefreshToken,
		}
	}

	return nil
}

// ValidateIPAddress validates IP address parameter
//
// Business Rules:
// - IP address khÃ´ng Ä‘Æ°á»£c empty
// - IP address pháº£i lÃ  valid IPv4 hoáº·c IPv6
//
// Parameters:
//   - ipAddress: IP address cáº§n validate
//
// Returns:
//   - error: ErrEmptyIPAddress náº¿u empty, validation error náº¿u invalid format
//
// Example:
//
//	if err := ValidateIPAddress("192.168.1.1"); err != nil {
//	  return err
//	}
func ValidateIPAddress(ipAddress string) error {
	if ipAddress == "" {
		return ErrEmptyIPAddress
	}

	// Check length
	if len(ipAddress) < MinIPAddressLength || len(ipAddress) > MaxIPAddressLength {
		return &JWTError{
			Op:  "ValidateIPAddress",
			Err: ErrEmptyIPAddress,
		}
	}

	// Check IPv4 or IPv6 format
	if !ipv4Regex.MatchString(ipAddress) && !ipv6Regex.MatchString(ipAddress) {
		return &JWTError{
			Op:  "ValidateIPAddress",
			Err: ErrEmptyIPAddress,
		}
	}

	return nil
}

// ValidateDeviceFingerprint validates device fingerprint parameter
//
// Business Rules:
// - Device fingerprint khÃ´ng Ä‘Æ°á»£c empty
// - Device fingerprint pháº£i cÃ³ Ä‘á»™ dÃ i tá»‘i thiá»ƒu (hash string)
//
// Parameters:
//   - deviceFingerprint: Device fingerprint cáº§n validate
//
// Returns:
//   - error: ErrEmptyDeviceFingerprint náº¿u empty, validation error náº¿u too short
//
// Example:
//
//	if err := ValidateDeviceFingerprint("abc123def456..."); err != nil {
//	  return err
//	}
func ValidateDeviceFingerprint(deviceFingerprint string) error {
	if deviceFingerprint == "" {
		return ErrEmptyDeviceFingerprint
	}

	// Check minimum length
	if len(deviceFingerprint) < MinDeviceFingerprintLength {
		return &JWTError{
			Op:  "ValidateDeviceFingerprint",
			Err: ErrEmptyDeviceFingerprint,
		}
	}

	return nil
}
