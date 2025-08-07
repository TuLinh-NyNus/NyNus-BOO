package util

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// QuestionCodeComponents represents the parsed components of a QuestionCode
type QuestionCodeComponents struct {
	Raw     string `json:"raw"`     // Original input (e.g., "0P1N1-1")
	Grade   string `json:"grade"`   // 0, 1, 2
	Subject string `json:"subject"` // P, L, H
	Chapter string `json:"chapter"` // 1, 2, 3...
	Level   string `json:"level"`   // N, H, V, C, T, M
	Lesson  string `json:"lesson"`  // 1, 2, 3...
	Form    string `json:"form"`    // 1, 2, 3... (optional, only for ID6)
	IsID6   bool   `json:"is_id6"`  // true if has form component
}

// QuestionCodeParser handles parsing and validation of QuestionCode formats
type QuestionCodeParser struct{}

// NewQuestionCodeParser creates a new QuestionCode parser
func NewQuestionCodeParser() *QuestionCodeParser {
	return &QuestionCodeParser{}
}

// Parse parses a QuestionCode string into its components
func (p *QuestionCodeParser) Parse(questionCode string) (*QuestionCodeComponents, error) {
	// Remove any surrounding brackets or whitespace
	cleaned := strings.TrimSpace(questionCode)
	cleaned = strings.Trim(cleaned, "%[]")

	// Validate basic format
	if err := p.validateFormat(cleaned); err != nil {
		return nil, err
	}

	// Determine if ID5 or ID6
	isID6 := strings.Contains(cleaned, "-")
	
	var components *QuestionCodeComponents
	var err error

	if isID6 {
		components, err = p.parseID6(cleaned)
	} else {
		components, err = p.parseID5(cleaned)
	}

	if err != nil {
		return nil, err
	}

	components.Raw = questionCode
	components.IsID6 = isID6

	// Validate components
	if err := p.validateComponents(components); err != nil {
		return nil, err
	}

	return components, nil
}

// parseID5 parses ID5 format (5 characters: XXXXX)
func (p *QuestionCodeParser) parseID5(code string) (*QuestionCodeComponents, error) {
	if len(code) != 5 {
		return nil, fmt.Errorf("ID5 format must be exactly 5 characters, got %d", len(code))
	}

	return &QuestionCodeComponents{
		Grade:   string(code[0]),
		Subject: string(code[1]),
		Chapter: string(code[2]),
		Level:   string(code[3]),
		Lesson:  string(code[4]),
		Form:    "", // No form in ID5
	}, nil
}

// parseID6 parses ID6 format (7 characters: XXXXX-X)
func (p *QuestionCodeParser) parseID6(code string) (*QuestionCodeComponents, error) {
	parts := strings.Split(code, "-")
	if len(parts) != 2 {
		return nil, fmt.Errorf("ID6 format must have exactly one dash, got %d parts", len(parts))
	}

	if len(parts[0]) != 5 {
		return nil, fmt.Errorf("ID6 base part must be 5 characters, got %d", len(parts[0]))
	}

	if len(parts[1]) != 1 {
		return nil, fmt.Errorf("ID6 form part must be 1 character, got %d", len(parts[1]))
	}

	return &QuestionCodeComponents{
		Grade:   string(parts[0][0]),
		Subject: string(parts[0][1]),
		Chapter: string(parts[0][2]),
		Level:   string(parts[0][3]),
		Lesson:  string(parts[0][4]),
		Form:    parts[1],
	}, nil
}

// validateFormat validates the basic format of the QuestionCode
func (p *QuestionCodeParser) validateFormat(code string) error {
	// Check for valid characters (0-9, A-Z, and dash for ID6)
	validPattern := regexp.MustCompile(`^[0-9A-Z]{5}(-[0-9A-Z])?$`)
	if !validPattern.MatchString(code) {
		return fmt.Errorf("invalid QuestionCode format: %s. Must contain only [0-9A-Z] and optional dash", code)
	}
	return nil
}

// validateComponents validates individual components
func (p *QuestionCodeParser) validateComponents(comp *QuestionCodeComponents) error {
	// Validate Grade (0, 1, 2)
	if !p.isValidGrade(comp.Grade) {
		return fmt.Errorf("invalid grade: %s. Must be 0 (10th), 1 (11th), or 2 (12th)", comp.Grade)
	}

	// Validate Subject (P, L, H)
	if !p.isValidSubject(comp.Subject) {
		return fmt.Errorf("invalid subject: %s. Must be P (Math), L (Physics), or H (Chemistry)", comp.Subject)
	}

	// Validate Level (N, H, V, C, T, M)
	if !p.isValidLevel(comp.Level) {
		return fmt.Errorf("invalid level: %s. Must be N, H, V, C, T, or M", comp.Level)
	}

	// Validate Chapter (1-9, A-Z)
	if !p.isValidChapterOrLesson(comp.Chapter) {
		return fmt.Errorf("invalid chapter: %s. Must be 1-9 or A-Z", comp.Chapter)
	}

	// Validate Lesson (1-9, A-Z)
	if !p.isValidChapterOrLesson(comp.Lesson) {
		return fmt.Errorf("invalid lesson: %s. Must be 1-9 or A-Z", comp.Lesson)
	}

	// Validate Form if present (1-9, A-Z)
	if comp.Form != "" && !p.isValidChapterOrLesson(comp.Form) {
		return fmt.Errorf("invalid form: %s. Must be 1-9 or A-Z", comp.Form)
	}

	return nil
}

// isValidGrade checks if grade is valid (0, 1, 2)
func (p *QuestionCodeParser) isValidGrade(grade string) bool {
	return grade == "0" || grade == "1" || grade == "2"
}

// isValidSubject checks if subject is valid (P, L, H)
func (p *QuestionCodeParser) isValidSubject(subject string) bool {
	return subject == "P" || subject == "L" || subject == "H"
}

// isValidLevel checks if level is valid (N, H, V, C, T, M)
func (p *QuestionCodeParser) isValidLevel(level string) bool {
	validLevels := map[string]bool{
		"N": true, // Nhận biết (Recognition)
		"H": true, // Thông hiểu (Understanding)
		"V": true, // Vận dụng (Application)
		"C": true, // Vận dụng cao (High Application)
		"T": true, // VIP
		"M": true, // Note
	}
	return validLevels[level]
}

// isValidChapterOrLesson checks if chapter/lesson/form is valid (1-9, A-Z)
func (p *QuestionCodeParser) isValidChapterOrLesson(value string) bool {
	if len(value) != 1 {
		return false
	}
	char := value[0]
	return (char >= '1' && char <= '9') || (char >= 'A' && char <= 'Z')
}

// GenerateFolderPath generates the Google Drive folder path from components
func (p *QuestionCodeParser) GenerateFolderPath(comp *QuestionCodeComponents) string {
	// Format: Grade/Subject/Chapter/Lesson/Form/Level/
	// Example: "0P1N1-1" → "0/P/1/1/1/N/"
	path := fmt.Sprintf("%s/%s/%s/%s", comp.Grade, comp.Subject, comp.Chapter, comp.Lesson)
	
	if comp.Form != "" {
		path += "/" + comp.Form
	}
	
	path += "/" + comp.Level + "/"
	
	return path
}

// GetGradeName returns the human-readable grade name
func (p *QuestionCodeParser) GetGradeName(grade string) string {
	switch grade {
	case "0":
		return "Lớp 10"
	case "1":
		return "Lớp 11"
	case "2":
		return "Lớp 12"
	default:
		return "Unknown"
	}
}

// GetSubjectName returns the human-readable subject name
func (p *QuestionCodeParser) GetSubjectName(subject string) string {
	switch subject {
	case "P":
		return "Toán"
	case "L":
		return "Vật lý"
	case "H":
		return "Hóa học"
	default:
		return "Unknown"
	}
}

// GetLevelName returns the human-readable level name
func (p *QuestionCodeParser) GetLevelName(level string) string {
	switch level {
	case "N":
		return "Nhận biết"
	case "H":
		return "Thông hiểu"
	case "V":
		return "Vận dụng"
	case "C":
		return "Vận dụng cao"
	case "T":
		return "VIP"
	case "M":
		return "Note"
	default:
		return "Unknown"
	}
}

// ToNumericValues converts string components to numeric values for database storage
func (p *QuestionCodeParser) ToNumericValues(comp *QuestionCodeComponents) (grade, chapter, lesson, form int, err error) {
	// Convert grade
	if grade, err = strconv.Atoi(comp.Grade); err != nil {
		return 0, 0, 0, 0, fmt.Errorf("failed to convert grade to int: %w", err)
	}

	// Convert chapter (handle both numeric and alphabetic)
	if chapter, err = p.convertToNumeric(comp.Chapter); err != nil {
		return 0, 0, 0, 0, fmt.Errorf("failed to convert chapter to int: %w", err)
	}

	// Convert lesson
	if lesson, err = p.convertToNumeric(comp.Lesson); err != nil {
		return 0, 0, 0, 0, fmt.Errorf("failed to convert lesson to int: %w", err)
	}

	// Convert form (optional)
	if comp.Form != "" {
		if form, err = p.convertToNumeric(comp.Form); err != nil {
			return 0, 0, 0, 0, fmt.Errorf("failed to convert form to int: %w", err)
		}
	}

	return grade, chapter, lesson, form, nil
}

// convertToNumeric converts a single character to numeric value
// 1-9 → 1-9, A-Z → 10-35
func (p *QuestionCodeParser) convertToNumeric(char string) (int, error) {
	if len(char) != 1 {
		return 0, fmt.Errorf("expected single character, got %s", char)
	}

	c := char[0]
	if c >= '1' && c <= '9' {
		return int(c - '0'), nil
	}
	if c >= 'A' && c <= 'Z' {
		return int(c - 'A' + 10), nil
	}

	return 0, fmt.Errorf("invalid character: %s", char)
}
