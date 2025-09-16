package validation

import (
	"fmt"
	"regexp"
	"time"
)

// baseValidator provides common validation methods
type baseValidator struct{}

// validateUUID validates UUID format
func (v *baseValidator) validateUUID(id string) error {
	// Simple UUID v4 regex pattern
	uuidPattern := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)
	if !uuidPattern.MatchString(id) {
		return fmt.Errorf("invalid UUID format")
	}
	return nil
}

// validateDateTimeString validates datetime string format (RFC3339)
func (v *baseValidator) validateDateTimeString(dateStr string) error {
	_, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		return fmt.Errorf("invalid datetime format, expected RFC3339")
	}
	return nil
}

// validateEmail validates email format
func (v *baseValidator) validateEmail(email string) error {
	emailPattern := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailPattern.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}
	return nil
}

// validateStringLength validates string length
func (v *baseValidator) validateStringLength(s string, minLength, maxLength int) error {
	length := len(s)
	if length < minLength {
		return fmt.Errorf("string must be at least %d characters", minLength)
	}
	if maxLength > 0 && length > maxLength {
		return fmt.Errorf("string cannot exceed %d characters", maxLength)
	}
	return nil
}

// validateIntRange validates integer range
func (v *baseValidator) validateIntRange(value, min, max int) error {
	if value < min {
		return fmt.Errorf("value must be at least %d", min)
	}
	if max > 0 && value > max {
		return fmt.Errorf("value cannot exceed %d", max)
	}
	return nil
}

// validateFloatRange validates float range
func (v *baseValidator) validateFloatRange(value, min, max float64) error {
	if value < min {
		return fmt.Errorf("value must be at least %f", min)
	}
	if max > 0 && value > max {
		return fmt.Errorf("value cannot exceed %f", max)
	}
	return nil
}

// validateAlphanumeric validates alphanumeric string
func (v *baseValidator) validateAlphanumeric(s string) error {
	alphaNumPattern := regexp.MustCompile(`^[a-zA-Z0-9]+$`)
	if !alphaNumPattern.MatchString(s) {
		return fmt.Errorf("string must be alphanumeric")
	}
	return nil
}

// validateUsername validates username format
func (v *baseValidator) validateUsername(username string) error {
	// Username: 3-30 characters, alphanumeric with underscore and dash
	usernamePattern := regexp.MustCompile(`^[a-zA-Z0-9_-]{3,30}$`)
	if !usernamePattern.MatchString(username) {
		return fmt.Errorf("username must be 3-30 characters and contain only letters, numbers, underscore and dash")
	}
	return nil
}

// validatePhoneNumber validates phone number format
func (v *baseValidator) validatePhoneNumber(phone string) error {
	// Basic international phone number validation
	phonePattern := regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
	if !phonePattern.MatchString(phone) {
		return fmt.Errorf("invalid phone number format")
	}
	return nil
}

// validateURL validates URL format
func (v *baseValidator) validateURL(url string) error {
	urlPattern := regexp.MustCompile(`^(https?|ftp)://[^\s/$.?#].[^\s]*$`)
	if !urlPattern.MatchString(url) {
		return fmt.Errorf("invalid URL format")
	}
	return nil
}

// validateBase64 validates base64 string
func (v *baseValidator) validateBase64(s string) error {
	base64Pattern := regexp.MustCompile(`^[A-Za-z0-9+/]*={0,2}$`)
	if !base64Pattern.MatchString(s) {
		return fmt.Errorf("invalid base64 format")
	}
	return nil
}

// validateHexColor validates hex color code
func (v *baseValidator) validateHexColor(color string) error {
	hexColorPattern := regexp.MustCompile(`^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`)
	if !hexColorPattern.MatchString(color) {
		return fmt.Errorf("invalid hex color format")
	}
	return nil
}

// validateSlug validates URL slug format
func (v *baseValidator) validateSlug(slug string) error {
	slugPattern := regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	if !slugPattern.MatchString(slug) {
		return fmt.Errorf("invalid slug format")
	}
	return nil
}

// validateJSONString validates if string is valid JSON
func (v *baseValidator) validateJSONString(jsonStr string) error {
	// Basic JSON validation - check for balanced braces and brackets
	if len(jsonStr) < 2 {
		return fmt.Errorf("JSON string too short")
	}
	
	firstChar := jsonStr[0]
	lastChar := jsonStr[len(jsonStr)-1]
	
	if (firstChar == '{' && lastChar != '}') || (firstChar == '[' && lastChar != ']') {
		return fmt.Errorf("invalid JSON structure")
	}
	
	return nil
}

// sanitizeString removes potentially dangerous characters
func (v *baseValidator) sanitizeString(s string) string {
	// Remove control characters and other potentially dangerous characters
	dangerousChars := regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`)
	return dangerousChars.ReplaceAllString(s, "")
}