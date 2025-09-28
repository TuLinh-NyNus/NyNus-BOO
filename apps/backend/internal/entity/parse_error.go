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
	Success          bool                  `json:"success"`
	Question         *Question             `json:"question,omitempty"`
	QuestionCode     *QuestionCode         `json:"question_code,omitempty"`
	Errors           []DetailedParseError  `json:"errors"`
	Warnings         []DetailedParseError  `json:"warnings"`
	RequiredFields   []string              `json:"required_fields"`
	MissingFields    []string              `json:"missing_fields"`
	SuggestedActions []string              `json:"suggested_actions"`
	CanRetry         bool                  `json:"can_retry"`
	Status           QuestionStatus        `json:"status"`
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
			"Nội dung câu hỏi phải có ít nhất 10 ký tự",
			"Kiểm tra lại định dạng LaTeX",
			"Đảm bảo có đầy đủ thông tin câu hỏi",
		},
		ErrorType: ParseErrorTypeMissingField,
		Severity:  ParseErrorSeverityError,
	},
	{
		Field:     "type",
		Required:  true,
		Type:      "enum",
		Pattern:   "^(MC|TF|SA|ES|MA)$",
		Suggestions: []string{
			"Loại câu hỏi phải là một trong: MC (Multiple Choice), TF (True/False), SA (Short Answer), ES (Essay), MA (Matching)",
			"Kiểm tra lại cú pháp LaTeX để xác định loại câu hỏi",
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
			"Câu hỏi phải có ít nhất một đáp án",
			"Kiểm tra lại cú pháp LaTeX cho phần đáp án",
			"Đảm bảo có ít nhất một đáp án đúng",
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
			"Lời giải giúp học sinh hiểu rõ hơn về câu hỏi",
			"Nên có lời giải chi tiết cho câu hỏi",
		},
		ErrorType: ParseErrorTypeMissingField,
		Severity:  ParseErrorSeverityWarning,
	},
	{
		Field:     "difficulty",
		Required:  false,
		Type:      "enum",
		Pattern:   "^(EASY|MEDIUM|HARD|EXPERT)$",
		Suggestions: []string{
			"Độ khó phải là một trong: EASY, MEDIUM, HARD, EXPERT",
			"Nếu không có, hệ thống sẽ tự động đặt là MEDIUM",
		},
		ErrorType: ParseErrorTypeValidation,
		Severity:  ParseErrorSeverityWarning,
	},
	{
		Field:     "question_code_id",
		Required:  false,
		Type:      "text",
		Pattern:   "^[0-9A-Z]{5}(-[0-9])?$",
		Suggestions: []string{
			"Mã câu hỏi phải theo định dạng ID5 (XXXXX) hoặc ID6 (XXXXX-X)",
			"Ví dụ: 0P1N1 hoặc 2H5V3-2",
			"Nếu không có, hệ thống sẽ tự động tạo",
		},
		ErrorType: ParseErrorTypeValidation,
		Severity:  ParseErrorSeverityInfo,
	},
}

// RetryableError represents an error that can be retried
type RetryableError struct {
	OriginalError error                `json:"original_error"`
	RetryCount    int                  `json:"retry_count"`
	MaxRetries    int                  `json:"max_retries"`
	NextRetryAt   time.Time            `json:"next_retry_at"`
	RetryStrategy string               `json:"retry_strategy"`
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
	Type        string `json:"type"`
	Message     string `json:"message"`
	Action      string `json:"action"`
	Priority    int    `json:"priority"`
	Automated   bool   `json:"automated"`
	UserFriendly bool  `json:"user_friendly"`
}

// GetErrorSuggestions returns suggestions based on error type and context
func GetErrorSuggestions(errorType ParseErrorType, field string, context map[string]interface{}) []ErrorSuggestion {
	suggestions := []ErrorSuggestion{}
	
	switch errorType {
	case ParseErrorTypeMissingField:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "missing_field",
			Message:      "Trường bắt buộc bị thiếu",
			Action:       "Thêm thông tin cho trường: " + field,
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})
		
	case ParseErrorTypeValidation:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "validation",
			Message:      "Dữ liệu không hợp lệ",
			Action:       "Kiểm tra lại định dạng cho trường: " + field,
			Priority:     2,
			Automated:    false,
			UserFriendly: true,
		})
		
	case ParseErrorTypeInvalidFormat:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "format",
			Message:      "Định dạng không đúng",
			Action:       "Sửa định dạng LaTeX cho trường: " + field,
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})
		
	case ParseErrorTypeUnsupported:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "unsupported",
			Message:      "Tính năng chưa được hỗ trợ",
			Action:       "Sử dụng định dạng được hỗ trợ hoặc chờ cập nhật",
			Priority:     3,
			Automated:    false,
			UserFriendly: true,
		})
		
	case ParseErrorTypeStructural:
		suggestions = append(suggestions, ErrorSuggestion{
			Type:         "structural",
			Message:      "Cấu trúc LaTeX không đúng",
			Action:       "Kiểm tra lại cú pháp LaTeX",
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
