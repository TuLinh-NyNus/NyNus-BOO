package entity

import (
	"time"

	"github.com/jackc/pgtype"
)

// BulkImportErrorType represents different types of bulk import errors
type BulkImportErrorType string

const (
	BulkImportErrorTypeParseError      BulkImportErrorType = "PARSE_ERROR"
	BulkImportErrorTypeValidationError BulkImportErrorType = "VALIDATION_ERROR"
	BulkImportErrorTypeDuplicateError  BulkImportErrorType = "DUPLICATE_ERROR"
	BulkImportErrorTypeDatabaseError   BulkImportErrorType = "DATABASE_ERROR"
	BulkImportErrorTypeFormatError     BulkImportErrorType = "FORMAT_ERROR"
	BulkImportErrorTypeBusinessError   BulkImportErrorType = "BUSINESS_ERROR"
	BulkImportErrorTypeSystemError     BulkImportErrorType = "SYSTEM_ERROR"
)

// BulkImportErrorSeverity represents the severity level of bulk import errors
type BulkImportErrorSeverity string

const (
	BulkImportErrorSeverityError   BulkImportErrorSeverity = "ERROR"
	BulkImportErrorSeverityWarning BulkImportErrorSeverity = "WARNING"
	BulkImportErrorSeverityInfo    BulkImportErrorSeverity = "INFO"
)

// BulkImportError represents a detailed bulk import error
type BulkImportError struct {
	ID            pgtype.Text             `json:"id" db:"id"`
	ImportID      pgtype.Text             `json:"import_id" db:"import_id"`
	RowNumber     pgtype.Int4             `json:"row_number" db:"row_number"`
	Type          BulkImportErrorType     `json:"type" db:"type"`
	Severity      BulkImportErrorSeverity `json:"severity" db:"severity"`
	Message       pgtype.Text             `json:"message" db:"message"`
	Field         pgtype.Text             `json:"field" db:"field"`
	Suggestion    pgtype.Text             `json:"suggestion" db:"suggestion"`
	Context       pgtype.Text             `json:"context" db:"context"`
	RowData       pgtype.Text             `json:"row_data" db:"row_data"`
	QuestionID    pgtype.Text             `json:"question_id" db:"question_id"`
	IsRecoverable pgtype.Bool             `json:"is_recoverable" db:"is_recoverable"`
	CreatedAt     pgtype.Timestamptz      `json:"created_at" db:"created_at"`
}

// BulkImportResult represents the result of a bulk import operation
type BulkImportResult struct {
	ImportID        string            `json:"import_id"`
	Success         bool              `json:"success"`
	TotalProcessed  int32             `json:"total_processed"`
	SuccessCount    int32             `json:"success_count"`
	ErrorCount      int32             `json:"error_count"`
	WarningCount    int32             `json:"warning_count"`
	SkippedCount    int32             `json:"skipped_count"`
	Errors          []BulkImportError `json:"errors"`
	Warnings        []BulkImportError `json:"warnings"`
	ProcessingTime  time.Duration     `json:"processing_time"`
	Summary         string            `json:"summary"`
	DetailedReport  string            `json:"detailed_report"`
	RecoveryActions []string          `json:"recovery_actions"`
	CanRetry        bool              `json:"can_retry"`
	PartialSuccess  bool              `json:"partial_success"`
}

// BulkImportSession represents a bulk import session
type BulkImportSession struct {
	ID            pgtype.Text        `json:"id" db:"id"`
	Type          pgtype.Text        `json:"type" db:"type"`     // CSV, LATEX
	Status        pgtype.Text        `json:"status" db:"status"` // PROCESSING, COMPLETED, FAILED, PARTIAL
	TotalRows     pgtype.Int4        `json:"total_rows" db:"total_rows"`
	ProcessedRows pgtype.Int4        `json:"processed_rows" db:"processed_rows"`
	SuccessRows   pgtype.Int4        `json:"success_rows" db:"success_rows"`
	ErrorRows     pgtype.Int4        `json:"error_rows" db:"error_rows"`
	WarningRows   pgtype.Int4        `json:"warning_rows" db:"warning_rows"`
	StartTime     pgtype.Timestamptz `json:"start_time" db:"start_time"`
	EndTime       pgtype.Timestamptz `json:"end_time" db:"end_time"`
	Creator       pgtype.Text        `json:"creator" db:"creator"`
	FileName      pgtype.Text        `json:"file_name" db:"file_name"`
	FileSize      pgtype.Int8        `json:"file_size" db:"file_size"`
	Options       pgtype.Text        `json:"options" db:"options"` // JSON string
	CreatedAt     pgtype.Timestamptz `json:"created_at" db:"created_at"`
	UpdatedAt     pgtype.Timestamptz `json:"updated_at" db:"updated_at"`
}

// BulkImportRecoveryAction represents a recovery action for failed imports
type BulkImportRecoveryAction struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Action      string `json:"action"`
	Priority    int    `json:"priority"`
	Automated   bool   `json:"automated"`
}

// GetBulkImportRecoveryActions returns recovery actions based on error types
func GetBulkImportRecoveryActions(errors []BulkImportError) []BulkImportRecoveryAction {
	actions := []BulkImportRecoveryAction{}
	errorTypes := make(map[BulkImportErrorType]int)

	// Count error types
	for _, err := range errors {
		errorTypes[err.Type]++
	}

	// Generate recovery actions based on error patterns
	if errorTypes[BulkImportErrorTypeParseError] > 0 {
		actions = append(actions, BulkImportRecoveryAction{
			Type:        "parse_error",
			Description: "CÃ³ lá»—i phÃ¢n tÃ­ch cÃº phÃ¡p LaTeX",
			Action:      "Kiá»ƒm tra vÃ  sá»­a cÃº phÃ¡p LaTeX cho cÃ¡c dÃ²ng bá»‹ lá»—i",
			Priority:    1,
			Automated:   false,
		})
	}

	if errorTypes[BulkImportErrorTypeValidationError] > 0 {
		actions = append(actions, BulkImportRecoveryAction{
			Type:        "validation_error",
			Description: "CÃ³ lá»—i validation dá»¯ liá»‡u",
			Action:      "Kiá»ƒm tra vÃ  bá»• sung cÃ¡c trÆ°á»ng báº¯t buá»™c",
			Priority:    1,
			Automated:   false,
		})
	}

	if errorTypes[BulkImportErrorTypeDuplicateError] > 0 {
		actions = append(actions, BulkImportRecoveryAction{
			Type:        "duplicate_error",
			Description: "CÃ³ cÃ¢u há»i trÃ¹ng láº·p",
			Action:      "Báº­t cháº¿ Ä‘á»™ upsert hoáº·c xÃ³a cÃ¡c dÃ²ng trÃ¹ng láº·p",
			Priority:    2,
			Automated:   true,
		})
	}

	if errorTypes[BulkImportErrorTypeDatabaseError] > 0 {
		actions = append(actions, BulkImportRecoveryAction{
			Type:        "database_error",
			Description: "CÃ³ lá»—i cÆ¡ sá»Ÿ dá»¯ liá»‡u",
			Action:      "Kiá»ƒm tra káº¿t ná»‘i database vÃ  thá»­ láº¡i",
			Priority:    1,
			Automated:   true,
		})
	}

	if errorTypes[BulkImportErrorTypeFormatError] > 0 {
		actions = append(actions, BulkImportRecoveryAction{
			Type:        "format_error",
			Description: "CÃ³ lá»—i Ä‘á»‹nh dáº¡ng file",
			Action:      "Kiá»ƒm tra Ä‘á»‹nh dáº¡ng CSV/LaTeX vÃ  encoding",
			Priority:    1,
			Automated:   false,
		})
	}

	return actions
}

// BulkImportStatistics represents import statistics
type BulkImportStatistics struct {
	TotalImports          int64                             `json:"total_imports"`
	SuccessfulImports     int64                             `json:"successful_imports"`
	FailedImports         int64                             `json:"failed_imports"`
	PartialImports        int64                             `json:"partial_imports"`
	TotalQuestions        int64                             `json:"total_questions"`
	AverageProcessingTime time.Duration                     `json:"average_processing_time"`
	ErrorsByType          map[BulkImportErrorType]int64     `json:"errors_by_type"`
	ErrorsBySeverity      map[BulkImportErrorSeverity]int64 `json:"errors_by_severity"`
	LastUpdated           time.Time                         `json:"last_updated"`
}

// BulkImportOptions represents options for bulk import
type BulkImportOptions struct {
	UpsertMode       bool   `json:"upsert_mode"`
	AutoCreateCodes  bool   `json:"auto_create_codes"`
	SkipDuplicates   bool   `json:"skip_duplicates"`
	ValidateOnly     bool   `json:"validate_only"`
	BatchSize        int    `json:"batch_size"`
	MaxErrors        int    `json:"max_errors"`
	StopOnFirstError bool   `json:"stop_on_first_error"`
	Creator          string `json:"creator"`
}

// DefaultBulkImportOptions returns default import options
func DefaultBulkImportOptions() *BulkImportOptions {
	return &BulkImportOptions{
		UpsertMode:       false,
		AutoCreateCodes:  true,
		SkipDuplicates:   false,
		ValidateOnly:     false,
		BatchSize:        100,
		MaxErrors:        50,
		StopOnFirstError: false,
		Creator:          "SYSTEM",
	}
}

// BulkImportProgress represents real-time import progress
type BulkImportProgress struct {
	ImportID               string        `json:"import_id"`
	TotalRows              int32         `json:"total_rows"`
	ProcessedRows          int32         `json:"processed_rows"`
	SuccessRows            int32         `json:"success_rows"`
	ErrorRows              int32         `json:"error_rows"`
	WarningRows            int32         `json:"warning_rows"`
	CurrentRow             int32         `json:"current_row"`
	PercentComplete        float64       `json:"percent_complete"`
	EstimatedTimeRemaining time.Duration `json:"estimated_time_remaining"`
	Status                 string        `json:"status"`
	LastUpdate             time.Time     `json:"last_update"`
}

// CalculateProgress calculates import progress
func (p *BulkImportProgress) CalculateProgress() {
	if p.TotalRows > 0 {
		p.PercentComplete = float64(p.ProcessedRows) / float64(p.TotalRows) * 100
	}
	p.LastUpdate = time.Now()
}

// BulkImportValidationRule represents validation rules for bulk import
type BulkImportValidationRule struct {
	Field      string                  `json:"field"`
	Required   bool                    `json:"required"`
	Type       string                  `json:"type"`
	MinLength  int                     `json:"min_length,omitempty"`
	MaxLength  int                     `json:"max_length,omitempty"`
	Pattern    string                  `json:"pattern,omitempty"`
	ErrorType  BulkImportErrorType     `json:"error_type"`
	Severity   BulkImportErrorSeverity `json:"severity"`
	Suggestion string                  `json:"suggestion"`
}

// BulkImportValidationRules defines validation rules for bulk import
var BulkImportValidationRules = []BulkImportValidationRule{
	{
		Field:      "content",
		Required:   true,
		Type:       "text",
		MinLength:  10,
		MaxLength:  5000,
		ErrorType:  BulkImportErrorTypeValidationError,
		Severity:   BulkImportErrorSeverityError,
		Suggestion: "Ná»™i dung cÃ¢u há»i pháº£i cÃ³ tá»« 10-5000 kÃ½ tá»±",
	},
	{
		Field:      "type",
		Required:   true,
		Type:       "enum",
		Pattern:    "^(MC|TF|SA|ES|MA)$",
		ErrorType:  BulkImportErrorTypeValidationError,
		Severity:   BulkImportErrorSeverityError,
		Suggestion: "Loáº¡i cÃ¢u há»i pháº£i lÃ : MC, TF, SA, ES, hoáº·c MA",
	},
	{
		Field:      "answers",
		Required:   true,
		Type:       "array",
		MinLength:  1,
		ErrorType:  BulkImportErrorTypeValidationError,
		Severity:   BulkImportErrorSeverityError,
		Suggestion: "CÃ¢u há»i pháº£i cÃ³ Ã­t nháº¥t má»™t Ä‘Ã¡p Ã¡n",
	},
	{
		Field:      "question_code",
		Required:   false,
		Type:       "text",
		Pattern:    "^[0-9A-Z]{5}(-[0-9])?$",
		ErrorType:  BulkImportErrorTypeFormatError,
		Severity:   BulkImportErrorSeverityWarning,
		Suggestion: "MÃ£ cÃ¢u há»i pháº£i theo Ä‘á»‹nh dáº¡ng ID5 (XXXXX) hoáº·c ID6 (XXXXX-X)",
	},
}
