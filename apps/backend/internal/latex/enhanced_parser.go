package latex

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
)

// EnhancedLaTeXParser provides enhanced parsing with detailed error handling
type EnhancedLaTeXParser struct {
	bp *BracketParser
}

// NewEnhancedLaTeXParser creates a new enhanced LaTeX parser
func NewEnhancedLaTeXParser() *EnhancedLaTeXParser {
	return &EnhancedLaTeXParser{
		bp: NewBracketParser(),
	}
}

// ParseWithDetailedErrors parses LaTeX content with comprehensive error reporting
func (p *EnhancedLaTeXParser) ParseWithDetailedErrors(latexContent string) *entity.ParseResult {
	result := &entity.ParseResult{
		Success:          false,
		Errors:           []entity.DetailedParseError{},
		Warnings:         []entity.DetailedParseError{},
		RequiredFields:   []string{},
		MissingFields:    []string{},
		SuggestedActions: []string{},
		CanRetry:         true,
		Status:           entity.QuestionStatusPending,
	}

	// Extract question blocks
	questionBlocks := p.bp.ExtractEnvironmentContent(latexContent, "ex")

	if len(questionBlocks) == 0 {
		result.Errors = append(result.Errors, entity.DetailedParseError{
			ID:         util.StringToPgText(uuid.New().String()),
			Type:       entity.ParseErrorTypeStructural,
			Severity:   entity.ParseErrorSeverityError,
			Message:    util.StringToPgText("KhÃ´ng tÃ¬m tháº¥y block cÃ¢u há»i \\begin{ex}...\\end{ex}"),
			Suggestion: util.StringToPgText("Äáº£m báº£o ná»™i dung LaTeX cÃ³ cáº¥u trÃºc \\begin{ex}...\\end{ex}"),
			Context:    util.StringToPgText("latex_structure"),
			CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
		})
		return result
	}

	// Parse first question block
	questionBlock := questionBlocks[0]

	// Validate structure first
	structuralErrors := p.validateStructure(questionBlock)
	result.Errors = append(result.Errors, structuralErrors...)

	// Parse question content
	question, questionCode, parseErrors := p.parseQuestionContent(questionBlock)
	result.Errors = append(result.Errors, parseErrors...)

	// Validate required fields
	validationErrors, missingFields := p.validateRequiredFields(question)
	result.Errors = append(result.Errors, validationErrors...)
	result.MissingFields = missingFields

	// Validate field formats
	formatErrors := p.validateFieldFormats(question)
	result.Warnings = append(result.Warnings, formatErrors...)

	// Generate suggestions
	result.SuggestedActions = p.generateSuggestions(result.Errors, result.Warnings)

	// Determine if parsing was successful
	hasErrors := len(result.Errors) > 0
	result.Success = !hasErrors

	if result.Success {
		result.Question = question
		result.QuestionCode = questionCode
		result.Status = entity.QuestionStatusActive
	} else {
		// Set status based on error severity
		result.Status = p.determineQuestionStatus(result.Errors)
	}

	// Populate required fields list
	result.RequiredFields = p.getRequiredFields()

	return result
}

// validateStructure validates the basic LaTeX structure
func (p *EnhancedLaTeXParser) validateStructure(questionBlock string) []entity.DetailedParseError {
	var errors []entity.DetailedParseError

	// Check for basic LaTeX commands
	requiredCommands := []string{"\\begin{ex}", "\\end{ex}"}
	for _, cmd := range requiredCommands {
		if !strings.Contains(questionBlock, cmd) {
			errors = append(errors, entity.DetailedParseError{
				ID:         util.StringToPgText(uuid.New().String()),
				Type:       entity.ParseErrorTypeStructural,
				Severity:   entity.ParseErrorSeverityError,
				Message:    util.StringToPgText(fmt.Sprintf("Thiáº¿u lá»‡nh LaTeX báº¯t buá»™c: %s", cmd)),
				Suggestion: util.StringToPgText(fmt.Sprintf("ThÃªm lá»‡nh %s vÃ o ná»™i dung LaTeX", cmd)),
				Context:    util.StringToPgText("latex_commands"),
				CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
			})
		}
	}

	// Check for balanced brackets (simplified check)
	if !hasBalancedBrackets(questionBlock) {
		errors = append(errors, entity.DetailedParseError{
			ID:         util.StringToPgText(uuid.New().String()),
			Type:       entity.ParseErrorTypeStructural,
			Severity:   entity.ParseErrorSeverityError,
			Message:    util.StringToPgText("Dáº¥u ngoáº·c khÃ´ng cÃ¢n báº±ng trong LaTeX"),
			Suggestion: util.StringToPgText("Kiá»ƒm tra láº¡i cÃ¡c dáº¥u ngoáº·c {}, [], () trong ná»™i dung LaTeX"),
			Context:    util.StringToPgText("bracket_balance"),
			CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
		})
	}

	return errors
}

// parseQuestionContent parses the actual question content
func (p *EnhancedLaTeXParser) parseQuestionContent(questionBlock string) (*entity.Question, *entity.QuestionCode, []entity.DetailedParseError) {
	var errors []entity.DetailedParseError

	// Use existing parser for basic parsing
	basicParser := NewLaTeXQuestionParser()
	question, questionCode, err := basicParser.ParseSingleQuestion(questionBlock)

	if err != nil {
		errors = append(errors, entity.DetailedParseError{
			ID:         util.StringToPgText(uuid.New().String()),
			Type:       entity.ParseErrorTypeInvalidFormat,
			Severity:   entity.ParseErrorSeverityError,
			Message:    util.StringToPgText(fmt.Sprintf("Lá»—i phÃ¢n tÃ­ch ná»™i dung: %v", err)),
			Suggestion: util.StringToPgText("Kiá»ƒm tra láº¡i cÃº phÃ¡p LaTeX vÃ  Ä‘á»‹nh dáº¡ng cÃ¢u há»i"),
			Context:    util.StringToPgText("content_parsing"),
			CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
		})
		return nil, nil, errors
	}

	return question, questionCode, errors
}

// validateRequiredFields validates that all required fields are present
func (p *EnhancedLaTeXParser) validateRequiredFields(question *entity.Question) ([]entity.DetailedParseError, []string) {
	var errors []entity.DetailedParseError
	var missingFields []string

	if question == nil {
		return errors, missingFields
	}

	// Check each validation rule
	for _, rule := range entity.QuestionValidationRules {
		if !rule.Required {
			continue
		}

		fieldValue := p.getFieldValue(question, rule.Field)
		if p.isFieldEmpty(fieldValue) {
			missingFields = append(missingFields, rule.Field)

			errors = append(errors, entity.DetailedParseError{
				ID:         util.StringToPgText(uuid.New().String()),
				Type:       rule.ErrorType,
				Severity:   rule.Severity,
				Message:    util.StringToPgText(fmt.Sprintf("TrÆ°á»ng báº¯t buá»™c '%s' bá»‹ thiáº¿u", rule.Field)),
				Field:      util.StringToPgText(rule.Field),
				Suggestion: util.StringToPgText(strings.Join(rule.Suggestions, "; ")),
				Context:    util.StringToPgText("required_field_validation"),
				CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
			})
		}
	}

	return errors, missingFields
}

// validateFieldFormats validates field formats and constraints
func (p *EnhancedLaTeXParser) validateFieldFormats(question *entity.Question) []entity.DetailedParseError {
	var errors []entity.DetailedParseError

	if question == nil {
		return errors
	}

	// Check each validation rule
	for _, rule := range entity.QuestionValidationRules {
		fieldValue := p.getFieldValue(question, rule.Field)

		if p.isFieldEmpty(fieldValue) {
			continue // Skip empty fields (handled in required validation)
		}

		// Validate pattern if specified
		if rule.Pattern != "" {
			matched, err := regexp.MatchString(rule.Pattern, fieldValue)
			if err != nil || !matched {
				errors = append(errors, entity.DetailedParseError{
					ID:         util.StringToPgText(uuid.New().String()),
					Type:       rule.ErrorType,
					Severity:   rule.Severity,
					Message:    util.StringToPgText(fmt.Sprintf("Äá»‹nh dáº¡ng trÆ°á»ng '%s' khÃ´ng há»£p lá»‡", rule.Field)),
					Field:      util.StringToPgText(rule.Field),
					Suggestion: util.StringToPgText(strings.Join(rule.Suggestions, "; ")),
					Context:    util.StringToPgText("format_validation"),
					CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
				})
			}
		}

		// Validate length constraints
		fieldLength := len(fieldValue)
		if rule.MinLength > 0 && fieldLength < rule.MinLength {
			errors = append(errors, entity.DetailedParseError{
				ID:         util.StringToPgText(uuid.New().String()),
				Type:       rule.ErrorType,
				Severity:   rule.Severity,
				Message:    util.StringToPgText(fmt.Sprintf("TrÆ°á»ng '%s' quÃ¡ ngáº¯n (tá»‘i thiá»ƒu %d kÃ½ tá»±)", rule.Field, rule.MinLength)),
				Field:      util.StringToPgText(rule.Field),
				Suggestion: util.StringToPgText(strings.Join(rule.Suggestions, "; ")),
				Context:    util.StringToPgText("length_validation"),
				CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
			})
		}

		if rule.MaxLength > 0 && fieldLength > rule.MaxLength {
			errors = append(errors, entity.DetailedParseError{
				ID:         util.StringToPgText(uuid.New().String()),
				Type:       rule.ErrorType,
				Severity:   rule.Severity,
				Message:    util.StringToPgText(fmt.Sprintf("TrÆ°á»ng '%s' quÃ¡ dÃ i (tá»‘i Ä‘a %d kÃ½ tá»±)", rule.Field, rule.MaxLength)),
				Field:      util.StringToPgText(rule.Field),
				Suggestion: util.StringToPgText("RÃºt gá»n ná»™i dung hoáº·c chia thÃ nh nhiá»u pháº§n"),
				Context:    util.StringToPgText("length_validation"),
				CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present},
			})
		}
	}

	return errors
}

// getFieldValue extracts field value from question entity
func (p *EnhancedLaTeXParser) getFieldValue(question *entity.Question, fieldName string) string {
	switch fieldName {
	case "content":
		return util.PgTextToString(question.Content)
	case "type":
		return util.PgTextToString(question.Type)
	case "solution":
		return util.PgTextToString(question.Solution)
	case "difficulty":
		return util.PgTextToString(question.Difficulty)
	case "question_code_id":
		return util.PgTextToString(question.QuestionCodeID)
	case "answers":
		// For answers, we need to check if there are any answers
		// This is a simplified check - in real implementation,
		// you'd check the actual answers array
		if question.Content.Status == pgtype.Present && strings.Contains(question.Content.String, "choice") {
			return "has_answers"
		}
		return ""
	default:
		return ""
	}
}

// isFieldEmpty checks if a field value is empty
func (p *EnhancedLaTeXParser) isFieldEmpty(value string) bool {
	return strings.TrimSpace(value) == ""
}

// generateSuggestions generates actionable suggestions based on errors
func (p *EnhancedLaTeXParser) generateSuggestions(errors, warnings []entity.DetailedParseError) []string {
	var suggestions []string

	// Add general suggestions based on error types
	errorTypes := make(map[entity.ParseErrorType]bool)
	for _, err := range errors {
		errorTypes[err.Type] = true
	}

	if errorTypes[entity.ParseErrorTypeMissingField] {
		suggestions = append(suggestions, "ThÃªm cÃ¡c trÆ°á»ng báº¯t buá»™c cÃ²n thiáº¿u")
	}

	if errorTypes[entity.ParseErrorTypeInvalidFormat] {
		suggestions = append(suggestions, "Kiá»ƒm tra láº¡i cÃº phÃ¡p LaTeX")
	}

	if errorTypes[entity.ParseErrorTypeStructural] {
		suggestions = append(suggestions, "Sá»­a cáº¥u trÃºc LaTeX cÆ¡ báº£n")
	}

	if len(warnings) > 0 {
		suggestions = append(suggestions, "Xem xÃ©t cÃ¡c cáº£nh bÃ¡o Ä‘á»ƒ cáº£i thiá»‡n cháº¥t lÆ°á»£ng cÃ¢u há»i")
	}

	return suggestions
}

// determineQuestionStatus determines the appropriate status based on errors
func (p *EnhancedLaTeXParser) determineQuestionStatus(errors []entity.DetailedParseError) entity.QuestionStatus {
	hasErrors := false
	hasWarnings := false

	for _, err := range errors {
		if err.Severity == entity.ParseErrorSeverityError {
			hasErrors = true
		} else if err.Severity == entity.ParseErrorSeverityWarning {
			hasWarnings = true
		}
	}

	if hasErrors {
		return entity.QuestionStatusPending
	} else if hasWarnings {
		return entity.QuestionStatusActive // Can be active but with warnings
	}

	return entity.QuestionStatusActive
}

// getRequiredFields returns list of required field names
func (p *EnhancedLaTeXParser) getRequiredFields() []string {
	var fields []string

	for _, rule := range entity.QuestionValidationRules {
		if rule.Required {
			fields = append(fields, rule.Field)
		}
	}

	return fields
}

// hasBalancedBrackets checks if brackets are balanced in the content
func hasBalancedBrackets(content string) bool {
	braceCount := 0
	bracketCount := 0
	parenCount := 0

	for _, char := range content {
		switch char {
		case '{':
			braceCount++
		case '}':
			braceCount--
			if braceCount < 0 {
				return false
			}
		case '[':
			bracketCount++
		case ']':
			bracketCount--
			if bracketCount < 0 {
				return false
			}
		case '(':
			parenCount++
		case ')':
			parenCount--
			if parenCount < 0 {
				return false
			}
		}
	}

	return braceCount == 0 && bracketCount == 0 && parenCount == 0
}

