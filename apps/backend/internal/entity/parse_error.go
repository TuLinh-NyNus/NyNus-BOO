package entity

import (
	"time"

	"github.com/jackc/pgtype"
)

// ParseErrorType represents different types of parsing errors
type ParseErrorType string

const (
	ParseErrorTypeValidation    ParseErrorType = "VALIDATION"
	ParseErrorTypeMissingField  ParseErrorType = "MISSING_FIELD"
	ParseErrorTypeInvalidFormat ParseErrorType = "INVALID_FORMAT"
	ParseErrorTypeUnsupported   ParseErrorType = "UNSUPPORTED"
	ParseErrorTypeStructural    ParseErrorType = "STRUCTURAL"
)

// ParseErrorSeverity represents the severity level of parsing errors
type ParseErrorSeverity string

const (
	ParseErrorSeverityError   ParseErrorSeverity = "ERROR"
	ParseErrorSeverityWarning ParseErrorSeverity = "WARNING"
	ParseErrorSeverityInfo    ParseErrorSeverity = "INFO"
)

// DetailedParseError represents a comprehensive parsing error with suggestions
type DetailedParseError struct {
	ID          pgtype.Text        `json:"id" db:"id"`
	Type        ParseErrorType     `json:"type" db:"type"`
	Severity    ParseErrorSeverity `json:"severity" db:"severity"`
	Message     pgtype.Text        `json:"message" db:"message"`
	Field       pgtype.Text        `json:"field" db:"field"`
	Suggestion  pgtype.Text        `json:"suggestion" db:"suggestion"`
	Context     pgtype.Text        `json:"context" db:"context"`
	LineNumber  pgtype.Int4        `json:"line_number" db:"line_number"`
	ColumnStart pgtype.Int4        `json:"column_start" db:"column_start"`
	ColumnEnd   pgtype.Int4        `json:"column_end" db:"column_end"`
	CreatedAt   pgtype.Timestamptz `json:"created_at" db:"created_at"`
}

// ParseResult represents the result of parsing with detailed errors
type ParseResult struct {
	Success          bool                 `json:"success"`
	Question         *Question            `json:"question,omitempty"`
	QuestionCode     *QuestionCode        `json:"question_code,omitempty"`
	Errors           []DetailedParseError `json:"errors"`
	Warnings         []DetailedParseError `json:"warnings"`
	RequiredFields   []string             `json:"required_fields"`
	MissingFields    []string             `json:"missing_fields"`
	SuggestedActions []string             `json:"suggested_actions"`
	CanRetry         bool                 `json:"can_retry"`
	Status           QuestionStatus       `json:"status"`
}

// ValidationRule represents a validation rule for question fields
type ValidationRule struct {
	Field       string             `json:"field"`
	Required    bool               `json:"required"`
	Type        string             `json:"type"`
	MinLength   int                `json:"min_length,omitempty"`
	MaxLength   int                `json:"max_length,omitempty"`
	Pattern     string             `json:"pattern,omitempty"`
	Suggestions []string           `json:"suggestions,omitempty"`
	ErrorType   ParseErrorType     `json:"error_type"`
	Severity    ParseErrorSeverity `json:"severity"`
}

// QuestionValidationRules defines validation rules for question fields
var QuestionValidationRules = []ValidationRule{
	{
		Field:     "content",
		Required:  true,
		Type:      "text",
		MinLength: 10,
		MaxLength: 5000,
		Suggestions: []string{
			"Ná»™i dung cÃ¢u há»i pháº£i cÃ³ Ã­t nháº¥t 10 kÃ½ tá»±",
			"Kiá»ƒm tra láº¡i Ä‘á»‹nh dáº¡ng LaTeX",
			"Äáº£m báº£o cÃ³ Ä‘áº§y Ä‘á»§ thÃ´ng tin cÃ¢u há»i",
		},
		ErrorType: ParseErrorTypeMissingField,
		Severity:  ParseErrorSeverityError,
	},
	{
		Field:    "type",
		Required: true,
		Type:     "enum",
		Pattern:  "^(MC|TF|SA|ES|MA)$",
		Suggestions: []string{
			"Loáº¡i cÃ¢u há»i pháº£i lÃ  má»™t trong: MC (Multiple Choice), TF (True/False), SA (Short Answer), ES (Essay), MA (Matching)",
			"Kiá»ƒm tra láº¡i cÃº phÃ¡p LaTeX Ä‘á»ƒ xÃ¡c Ä‘á»‹nh loáº¡i cÃ¢u há»i",
		},
		ErrorType: ParseErrorTypeValidation,
		Severity:  ParseErrorSeverityError,
	},
	{
		Field:     "answers",
		Required:  true,
		Type:      "array",
		MinLength: 1,
		Suggestions: []string{
			"CÃ¢u há»i pháº£i cÃ³ Ã­t nháº¥t má»™t Ä‘Ã¡p Ã¡n",
			"Kiá»ƒm tra láº¡i cÃº phÃ¡p LaTeX cho pháº§n Ä‘Ã¡p Ã¡n",
			"Äáº£m báº£o cÃ³ Ã­t nháº¥t má»™t Ä‘Ã¡p Ã¡n Ä‘Ãºng",
		},
		ErrorType: ParseErrorTypeMissingField,
		Severity:  ParseErrorSeverityError,
	},
	{
		Field:     "solution",
		Required:  false,
		Type:      "text",
		MinLength: 5,
		MaxLength: 2000,
		Suggestions: []string{
			"Lá»i giáº£i giÃºp há»c sinh hiá»ƒu rÃµ hÆ¡n vá» cÃ¢u há»i",
			"NÃªn cÃ³ lá»i giáº£i chi tiáº¿t cho cÃ¢u há»i",
		},
		ErrorType: ParseErrorTypeMissingField,
		Severity:  ParseErrorSeverityWarning,
	},
	{
		Field:    "difficulty",
		Required: false,
		Type:     "enum",
		Pattern:  "^(EASY|MEDIUM|HARD|EXPERT)$",
		Suggestions: []string{
			"Äá»™ khÃ³ pháº£i lÃ  má»™t trong: EASY, MEDIUM, HARD, EXPERT",
			"Náº¿u khÃ´ng cÃ³, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng Ä‘áº·t lÃ  MEDIUM",
		},
		ErrorType: ParseErrorTypeValidation,
		Severity:  ParseErrorSeverityWarning,
	},
	{
		Field:    "question_code_id",
		Required: false,
		Type:     "text",
		Pattern:  "^[0-9A-Z]{5}(-[0-9])?$",
		Suggestions: []string{
			"MÃ£ cÃ¢u há»i pháº£i theo Ä‘á»‹nh dáº¡ng ID5 (XXXXX) hoáº·c ID6 (XXXXX-X)",
			"VÃ­ dá»¥: 0P1N1 hoáº·c 2H5V3-2",
			"Náº¿u khÃ´ng cÃ³, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng táº¡o",
		},
		ErrorType: ParseErrorTypeValidation,
		Severity:  ParseErrorSeverityInfo,
	},
}

// RetryableError represents an error that can be retried
type RetryableError struct {
	OriginalError error                  `json:"original_error"`
	RetryCount    int                    `json:"retry_count"`
	MaxRetries    int                    `json:"max_retries"`
	NextRetryAt   time.Time              `json:"next_retry_at"`
	RetryStrategy string                 `json:"retry_strategy"`
	Context       map[string]interface{} `json:"context"`
}

// IsRetryable checks if an error can be retried
func (r *RetryableError) IsRetryable() bool {
	return r.RetryCount < r.MaxRetries
}

// GetNextRetryDelay calculates the next retry delay using exponential backoff
func (r *RetryableError) GetNextRetryDelay() time.Duration {
	baseDelay := time.Second * 2
	maxDelay := time.Minute * 5

	delay := time.Duration(1<<uint(r.RetryCount)) * baseDelay
	if delay > maxDelay {
		delay = maxDelay
	}

	return delay
}

// ErrorSuggestion represents a suggestion for fixing an error
type ErrorSuggestion struct {
	Type         string `json:"type"`
	Message      string `json:"message"`
	Action       string `json:"action"`
	Priority     int    `json:"priority"`
	Automated    bool   `json:"automated"`
	UserFriendly bool   `json:"user_friendly"`
}

// GetErrorSuggestions returns suggestions based on error type and context
func GetErrorSuggestions(errorType ParseErrorType, field string, context map[string]interface{}) []ErrorSuggestion {
	suggestions := []ErrorSuggestion{}

	switch errorType {
	case ParseErrorTypeMissingField:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "missing_field",
			Message:      "TrÆ°á»ng báº¯t buá»™c bá»‹ thiáº¿u",
			Action:       "ThÃªm thÃ´ng tin cho trÆ°á»ng: " + field,
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})

	case ParseErrorTypeValidation:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "validation",
			Message:      "Dá»¯ liá»‡u khÃ´ng há»£p lá»‡",
			Action:       "Kiá»ƒm tra láº¡i Ä‘á»‹nh dáº¡ng cho trÆ°á»ng: " + field,
			Priority:     2,
			Automated:    false,
			UserFriendly: true,
		})

	case ParseErrorTypeInvalidFormat:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "format",
			Message:      "Äá»‹nh dáº¡ng khÃ´ng Ä‘Ãºng",
			Action:       "Sá»­a Ä‘á»‹nh dáº¡ng LaTeX cho trÆ°á»ng: " + field,
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})

	case ParseErrorTypeUnsupported:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "unsupported",
			Message:      "TÃ­nh nÄƒng chÆ°a Ä‘Æ°á»£c há»— trá»£",
			Action:       "Sá»­ dá»¥ng Ä‘á»‹nh dáº¡ng Ä‘Æ°á»£c há»— trá»£ hoáº·c chá» cáº­p nháº­t",
			Priority:     3,
			Automated:    false,
			UserFriendly: true,
		})

	case ParseErrorTypeStructural:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "structural",
			Message:      "Cáº¥u trÃºc LaTeX khÃ´ng Ä‘Ãºng",
			Action:       "Kiá»ƒm tra láº¡i cÃº phÃ¡p LaTeX",
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})
	}

	return suggestions
}

// ParseErrorHistory represents the history of parsing attempts
type ParseErrorHistory struct {
	ID           pgtype.Text        `json:"id" db:"id"`
	QuestionID   pgtype.Text        `json:"question_id" db:"question_id"`
	AttemptCount pgtype.Int4        `json:"attempt_count" db:"attempt_count"`
	LastAttempt  pgtype.Timestamptz `json:"last_attempt" db:"last_attempt"`
	LastError    pgtype.Text        `json:"last_error" db:"last_error"`
	Status       pgtype.Text        `json:"status" db:"status"`
	CreatedAt    pgtype.Timestamptz `json:"created_at" db:"created_at"`
	UpdatedAt    pgtype.Timestamptz `json:"updated_at" db:"updated_at"`
}
