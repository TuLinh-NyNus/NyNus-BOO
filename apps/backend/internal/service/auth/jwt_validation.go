package auth

import (
	"regexp"
	"strings"
)

// ===== VALIDATION HELPER FUNCTIONS =====
// Các helper functions để validate input parameters cho JWT operations
// Tuân thủ Clean Code principles: Single Responsibility, Clear naming

// ===== CONSTANTS FOR VALIDATION =====

const (
	// MinUserIDLength là độ dài tối thiểu của User ID (ULID format)
	// ULID format: 26 characters (e.g., 01HQXYZ1234567890ABCDEFGH)
	MinUserIDLength = 26

	// MaxUserIDLength là độ dài tối đa của User ID
	MaxUserIDLength = 26

	// MinEmailLength là độ dài tối thiểu của email
	// Example: a@b.c = 5 characters
	MinEmailLength = 5

	// MaxEmailLength là độ dài tối đa của email
	// RFC 5321: 254 characters
	MaxEmailLength = 254

	// MinRoleLength là độ dài tối thiểu của role
	// Shortest role: "GUEST" = 5 characters
	MinRoleLength = 5

	// MaxRoleLength là độ dài tối đa của role
	// Longest role: "TEACHER" = 7 characters
	MaxRoleLength = 7

	// MinLevel là level tối thiểu
	// Level 0 = no level/default
	MinLevel = 0

	// MaxLevel là level tối đa
	// Level 1-9 cho STUDENT/TUTOR/TEACHER
	MaxLevel = 9

	// MinTokenLength là độ dài tối thiểu của JWT token
	// JWT format: header.payload.signature (minimum ~100 characters)
	MinTokenLength = 50

	// MinRefreshTokenLength là độ dài tối thiểu của refresh token
	// Secure random token: base64 encoded 32 bytes = 44 characters
	MinRefreshTokenLength = 40

	// MinIPAddressLength là độ dài tối thiểu của IP address
	// IPv6 compressed: 2 characters (e.g., "::")
	// IPv6 localhost: 3 characters (e.g., "::1")
	// IPv4: 7 characters (e.g., "1.1.1.1")
	MinIPAddressLength = 2

	// MaxIPAddressLength là độ dài tối đa của IP address
	// IPv6: 45 characters (e.g., "2001:0db8:85a3:0000:0000:8a2e:0370:7334")
	MaxIPAddressLength = 45

	// MinDeviceFingerprintLength là độ dài tối thiểu của device fingerprint
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
// - User ID không được empty
// - User ID phải có độ dài 26 characters (ULID format) hoặc 36 characters (UUID format)
// - User ID phải match ULID pattern (base32 encoded) hoặc UUID pattern (hex with dashes)
//
// Parameters:
//   - userID: User ID cần validate
//
// Returns:
//   - error: ErrEmptyUserID nếu empty, validation error nếu invalid format
//
// Example:
//
//	if err := ValidateUserID("01HQXYZ1234567890ABCDEFGH"); err != nil {
//	  return err
//	}
//	if err := ValidateUserID("0082957e-7fd7-485b-a64a-b302251e380b"); err != nil {
//	  return err
//	}
func ValidateUserID(userID string) error {
	if userID == "" {
		return ErrEmptyUserID
	}

	// Accept both ULID (26 chars) and UUID (36 chars) formats
	isULID := len(userID) == 26 && ulidRegex.MatchString(userID)
	isUUID := len(userID) == 36 && uuidRegex.MatchString(userID)

	if !isULID && !isUUID {
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
// - Email không được empty
// - Email phải có độ dài từ 5-254 characters
// - Email phải match email regex pattern
//
// Parameters:
//   - email: Email cần validate
//
// Returns:
//   - error: ErrEmptyEmail nếu empty, validation error nếu invalid format
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
// - Role không được empty
// - Role phải là một trong: GUEST, STUDENT, TUTOR, TEACHER, ADMIN
// - Role phải uppercase
//
// Parameters:
//   - role: Role cần validate
//
// Returns:
//   - error: ErrEmptyRole nếu empty, validation error nếu invalid role
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
// - Level phải từ 0-9
// - Level 0 = no level/default (for GUEST, ADMIN)
// - Level 1-9 = specific levels (for STUDENT, TUTOR, TEACHER)
//
// Parameters:
//   - level: Level cần validate
//
// Returns:
//   - error: ErrInvalidLevel nếu out of range
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
// - Token string không được empty
// - Token string phải có độ dài tối thiểu (JWT format)
//
// Parameters:
//   - tokenString: Token string cần validate
//
// Returns:
//   - error: ErrEmptyToken nếu empty, validation error nếu too short
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
// - Refresh token không được empty
// - Refresh token phải có độ dài tối thiểu (secure random string)
//
// Parameters:
//   - refreshToken: Refresh token cần validate
//
// Returns:
//   - error: ErrEmptyRefreshToken nếu empty, validation error nếu too short
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
// - IP address không được empty
// - IP address phải là valid IPv4 hoặc IPv6
//
// Parameters:
//   - ipAddress: IP address cần validate
//
// Returns:
//   - error: ErrEmptyIPAddress nếu empty, validation error nếu invalid format
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
// - Device fingerprint không được empty
// - Device fingerprint phải có độ dài tối thiểu (hash string)
//
// Parameters:
//   - deviceFingerprint: Device fingerprint cần validate
//
// Returns:
//   - error: ErrEmptyDeviceFingerprint nếu empty, validation error nếu too short
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

