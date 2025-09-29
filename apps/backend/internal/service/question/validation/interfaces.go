package validation

import (
	"context"
)

// ValidationError represents a detailed validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Code    string `json:"code"`
}

// Error implements the error interface
func (ve ValidationError) Error() string {
	if ve.Field != "" {
		return ve.Field + ": " + ve.Message
	}
	return ve.Message
}

// ValidationResult represents the result of answer validation
type ValidationResult struct {
	IsValid bool              `json:"is_valid"`
	Errors  []ValidationError `json:"errors"`
}

// AnswerValidationServiceInterface defines the contract for answer data validation
type AnswerValidationServiceInterface interface {
	// ValidateAnswerData validates JSONB answer data according to ExamSystem.md specifications
	ValidateAnswerData(ctx context.Context, answerData []byte, questionType string) (*ValidationResult, error)

	// ValidateBaseStructure validates the base JSONB structure (question_type, question_id, answer_data, metadata)
	ValidateBaseStructure(ctx context.Context, answerData []byte) (*ValidationResult, error)

	// Type-specific validation methods
	ValidateMCAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error)
	ValidateTFAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error)
	ValidateSAAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error)
	ValidateESAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error)
}

// BaseStructureValidatorInterface defines base JSONB structure validation
type BaseStructureValidatorInterface interface {
	ValidateQuestionType(questionType string) error
	ValidateQuestionID(questionID string) error
	ValidateMetadata(metadata map[string]interface{}) error
}

// QuestionTypeValidatorInterface defines question type specific validation
type QuestionTypeValidatorInterface interface {
	ValidateAnswerStructure(answerData map[string]interface{}) (*ValidationResult, error)
	GetRequiredFields() []string
	GetOptionalFields() []string
}
