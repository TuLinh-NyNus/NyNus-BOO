package mapcode_mgmt

import (
	"fmt"
	"regexp"
	"strings"
)

// ValidationError represents a validation error with context
type ValidationError struct {
	Field   string
	Message string
}

// ValidationResult contains all validation errors
type ValidationResult struct {
	Errors []ValidationError
}

// IsValid returns true if there are no validation errors
func (v *ValidationResult) IsValid() bool {
	return len(v.Errors) == 0
}

// AddError adds a validation error
func (v *ValidationResult) AddError(field, message string) {
	v.Errors = append(v.Errors, ValidationError{
		Field:   field,
		Message: message,
	})
}

// Error returns a formatted error message with all validation errors
func (v *ValidationResult) Error() string {
	if v.IsValid() {
		return ""
	}
	
	var messages []string
	for _, err := range v.Errors {
		messages = append(messages, fmt.Sprintf("%s: %s", err.Field, err.Message))
	}
	
	return strings.Join(messages, "; ")
}

// ValidateMapCodeContent validates MapCode file content
func ValidateMapCodeContent(content string) *ValidationResult {
	result := &ValidationResult{}
	
	// Check minimum length
	if len(content) < 100 {
		result.AddError("content", "Content too short (minimum 100 bytes)")
		return result // Early return for critically short content
	}
	
	// Check maximum length (5MB)
	if len(content) > 5*1024*1024 {
		result.AddError("content", "Content too large (maximum 5MB)")
		return result
	}
	
	// Check for level definitions (required section)
	if !strings.Contains(content, "[N] Nhận biết") {
		result.AddError("levels", "Missing required level definition: [N] Nhận biết")
	}
	if !strings.Contains(content, "[H] Thông hiểu") {
		result.AddError("levels", "Missing required level definition: [H] Thông hiểu")
	}
	if !strings.Contains(content, "[V] Vận dụng") {
		result.AddError("levels", "Missing required level definition: [V] Vận dụng")
	}
	
	// Check for dash-based hierarchy patterns
	gradePattern := regexp.MustCompile(`-\[.\]`)
	subjectPattern := regexp.MustCompile(`----\[.\]`)
	chapterPattern := regexp.MustCompile(`-------\[.\]`)
	
	if !gradePattern.MatchString(content) {
		result.AddError("structure", "Missing grade hierarchy pattern: -[X]")
	}
	if !subjectPattern.MatchString(content) {
		result.AddError("structure", "Missing subject hierarchy pattern: ----[X]")
	}
	if !chapterPattern.MatchString(content) {
		result.AddError("structure", "Missing chapter hierarchy pattern: -------[X]")
	}
	
	// Check encoding (should contain Vietnamese characters)
	if !containsVietnamese(content) {
		result.AddError("encoding", "Content does not contain Vietnamese characters (encoding may be incorrect)")
	}
	
	// Check for required sections markers
	requiredMarkers := []string{
		"# Level", // Level definitions section
		"# Grade", // Grade section  
	}
	
	for _, marker := range requiredMarkers {
		if !strings.Contains(content, marker) {
			result.AddError("sections", fmt.Sprintf("Missing required section marker: %s", marker))
		}
	}
	
	return result
}

// containsVietnamese checks if content contains Vietnamese characters
func containsVietnamese(content string) bool {
	vietnameseChars := []string{
		"à", "á", "ả", "ã", "ạ",
		"ă", "ằ", "ắ", "ẳ", "ẵ", "ặ",
		"â", "ầ", "ấ", "ẩ", "ẫ", "ậ",
		"đ",
		"è", "é", "ẻ", "ẽ", "ẹ",
		"ê", "ề", "ế", "ể", "ễ", "ệ",
		"ì", "í", "ỉ", "ĩ", "ị",
		"ò", "ó", "ỏ", "õ", "ọ",
		"ô", "ồ", "ố", "ổ", "ỗ", "ộ",
		"ơ", "ờ", "ớ", "ở", "ỡ", "ợ",
		"ù", "ú", "ủ", "ũ", "ụ",
		"ư", "ừ", "ứ", "ử", "ữ", "ự",
		"ỳ", "ý", "ỷ", "ỹ", "ỵ",
	}
	
	contentLower := strings.ToLower(content)
	for _, char := range vietnameseChars {
		if strings.Contains(contentLower, char) {
			return true
		}
	}
	
	return false
}

// ValidateVersion validates version string format
func ValidateVersion(version string) error {
	if version == "" {
		return fmt.Errorf("version cannot be empty")
	}
	
	// Version should follow format: v2025-01-19 or similar
	versionPattern := regexp.MustCompile(`^v?\d{4}-\d{2}-\d{2}$`)
	if !versionPattern.MatchString(version) {
		return fmt.Errorf("version must follow format vYYYY-MM-DD (e.g., v2025-01-19)")
	}
	
	return nil
}


