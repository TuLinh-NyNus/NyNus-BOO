package repository

import (
	"fmt"
	"regexp"
)

// Shared validation regex patterns
var (
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	ulidRegex  = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{26}$`)
	uuidRegex  = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	// TEXT ID pattern for legacy/test accounts: student-001, admin-001, teacher-001, tutor-001
	textIDRegex = regexp.MustCompile(`^(student|admin|teacher|tutor)-\d{3}$`)
)

// validateUserID validates user ID format (ULID, UUID, or TEXT ID)
// Accepts:
// - ULID (26 chars): 01K7NCGGHBPQQCBMY1BPHENDBF
// - UUID (36 chars with dashes): 0082957e-7fd7-485b-a64a-b302251e380b
// - TEXT ID (pattern-NNN): student-001, admin-001, teacher-001, tutor-001
func validateUserID(userID string) error {
	if userID == "" {
		return fmt.Errorf("user ID cannot be empty")
	}
	// Accept ULID, UUID, or TEXT ID formats
	if !ulidRegex.MatchString(userID) && !uuidRegex.MatchString(userID) && !textIDRegex.MatchString(userID) {
		return fmt.Errorf("invalid user ID format: must be ULID, UUID, or TEXT ID (e.g., student-001)")
	}
	return nil
}

// validateEmail validates email format
func validateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email cannot be empty")
	}
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}
	return nil
}

// validateSessionID validates session ID format (ULID or UUID)
// Accepts both ULID (26 chars) and UUID (36 chars with dashes) for backward compatibility
func validateSessionID(sessionID string) error {
	if sessionID == "" {
		return fmt.Errorf("session ID cannot be empty")
	}
	// Accept both ULID and UUID formats
	if !ulidRegex.MatchString(sessionID) && !uuidRegex.MatchString(sessionID) {
		return fmt.Errorf("invalid session ID format: must be ULID or UUID")
	}
	return nil
}
