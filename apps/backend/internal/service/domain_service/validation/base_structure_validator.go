package validation

import (
	"encoding/json"
	"fmt"
	"regexp"
	"time"
)

// BaseStructureValidator validates the base JSONB structure
type BaseStructureValidator struct{}

// NewBaseStructureValidator creates a new base structure validator
func NewBaseStructureValidator() *BaseStructureValidator {
	return &BaseStructureValidator{}
}

// BaseAnswerStructure represents the base structure of answer_data JSONB
type BaseAnswerStructure struct {
	QuestionType string                 `json:"question_type"`
	QuestionID   string                 `json:"question_id"`
	AnswerData   map[string]interface{} `json:"answer_data"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// ValidateBaseStructure validates the base JSONB structure according to ExamSystem.md
func (v *BaseStructureValidator) ValidateBaseStructure(answerData []byte) (*ValidationResult, error) {
	result := NewValidationResult(true)
	
	// Parse JSON
	var baseStructure BaseAnswerStructure
	if err := json.Unmarshal(answerData, &baseStructure); err != nil {
		result.AddError("", ErrorCodeInvalidJSON)
		return result, nil
	}
	
	// Validate question_type
	if err := v.ValidateQuestionType(baseStructure.QuestionType); err != nil {
		result.AddError("question_type", ErrorCodeInvalidQuestionType, baseStructure.QuestionType)
	}
	
	// Validate question_id
	if err := v.ValidateQuestionID(baseStructure.QuestionID); err != nil {
		result.AddError("question_id", ErrorCodeInvalidUUID, baseStructure.QuestionID)
	}
	
	// Validate answer_data exists
	if baseStructure.AnswerData == nil {
		result.AddError("answer_data", ErrorCodeMissingField, "answer_data")
	}
	
	// Validate metadata if present
	if baseStructure.Metadata != nil {
		if err := v.ValidateMetadata(baseStructure.Metadata); err != nil {
			result.AddError("metadata", ErrorCodeInvalidFieldType, "metadata")
		}
	}
	
	return result, nil
}

// ValidateQuestionType validates question type field
func (v *BaseStructureValidator) ValidateQuestionType(questionType string) error {
	validTypes := map[string]bool{
		"MC": true,
		"TF": true,
		"SA": true,
		"ES": true,
	}
	
	if !validTypes[questionType] {
		return fmt.Errorf("invalid question type: %s", questionType)
	}
	
	return nil
}

// ValidateQuestionID validates question ID field (UUID format)
func (v *BaseStructureValidator) ValidateQuestionID(questionID string) error {
	// UUID v4 regex pattern
	uuidPattern := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)
	if !uuidPattern.MatchString(questionID) {
		return fmt.Errorf("invalid UUID format: %s", questionID)
	}
	return nil
}

// ValidateMetadata validates metadata structure
func (v *BaseStructureValidator) ValidateMetadata(metadata map[string]interface{}) error {
	// Validate submitted_at if present
	if submittedAt, exists := metadata["submitted_at"]; exists {
		if submittedAtStr, ok := submittedAt.(string); ok {
			if _, err := time.Parse(time.RFC3339, submittedAtStr); err != nil {
				return fmt.Errorf("invalid submitted_at format: %s", submittedAtStr)
			}
		} else {
			return fmt.Errorf("submitted_at must be string")
		}
	}
	
	// Validate time_spent_seconds if present
	if timeSpent, exists := metadata["time_spent_seconds"]; exists {
		switch v := timeSpent.(type) {
		case float64:
			if v < 0 {
				return fmt.Errorf("time_spent_seconds must be non-negative")
			}
		case int:
			if v < 0 {
				return fmt.Errorf("time_spent_seconds must be non-negative")
			}
		default:
			return fmt.Errorf("time_spent_seconds must be number")
		}
	}
	
	// Validate attempt_count if present
	if attemptCount, exists := metadata["attempt_count"]; exists {
		switch v := attemptCount.(type) {
		case float64:
			if v < 1 {
				return fmt.Errorf("attempt_count must be positive")
			}
		case int:
			if v < 1 {
				return fmt.Errorf("attempt_count must be positive")
			}
		default:
			return fmt.Errorf("attempt_count must be number")
		}
	}
	
	return nil
}

// ParseBaseStructure parses and returns the base structure
func (v *BaseStructureValidator) ParseBaseStructure(answerData []byte) (*BaseAnswerStructure, error) {
	var baseStructure BaseAnswerStructure
	if err := json.Unmarshal(answerData, &baseStructure); err != nil {
		return nil, fmt.Errorf("failed to parse base structure: %w", err)
	}
	return &baseStructure, nil
}
