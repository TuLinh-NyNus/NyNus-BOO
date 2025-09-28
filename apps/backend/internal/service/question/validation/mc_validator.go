package validation

import (
	"fmt"
	"regexp"
)

// MCValidator validates Multiple Choice answer data
type MCValidator struct {
	baseValidator *BaseStructureValidator
}

// NewMCValidator creates a new MC validator
func NewMCValidator() *MCValidator {
	return &MCValidator{
		baseValidator: NewBaseStructureValidator(),
	}
}

// MCAnswerData represents Multiple Choice answer data structure
type MCAnswerData struct {
	SelectedAnswerID string `json:"selected_answer_id"`
	SelectedContent  string `json:"selected_content,omitempty"`
}

// ValidateAnswerStructure validates MC answer data structure
func (v *MCValidator) ValidateAnswerStructure(answerData map[string]interface{}) (*ValidationResult, error) {
	result := NewValidationResult(true)
	
	// Validate selected_answer_id (required)
	selectedAnswerID, exists := answerData["selected_answer_id"]
	if !exists {
		result.AddError("answer_data.selected_answer_id", ErrorCodeMissingField, "selected_answer_id")
		return result, nil
	}
	
	// Check if selected_answer_id is string
	selectedAnswerIDStr, ok := selectedAnswerID.(string)
	if !ok {
		result.AddError("answer_data.selected_answer_id", ErrorCodeInvalidFieldType, "selected_answer_id")
		return result, nil
	}
	
	// Validate selected_answer_id is not empty
	if selectedAnswerIDStr == "" {
		result.AddError("answer_data.selected_answer_id", ErrorCodeMCMissingSelection)
		return result, nil
	}
	
	// Validate selected_answer_id is valid UUID
	if err := v.validateUUID(selectedAnswerIDStr); err != nil {
		result.AddError("answer_data.selected_answer_id", ErrorCodeMCInvalidAnswerID, selectedAnswerIDStr)
	}
	
	// Validate selected_content if present (optional)
	if selectedContent, exists := answerData["selected_content"]; exists {
		if _, ok := selectedContent.(string); !ok {
			result.AddError("answer_data.selected_content", ErrorCodeInvalidFieldType, "selected_content")
		}
	}
	
	return result, nil
}

// GetRequiredFields returns required fields for MC answers
func (v *MCValidator) GetRequiredFields() []string {
	return []string{"selected_answer_id"}
}

// GetOptionalFields returns optional fields for MC answers
func (v *MCValidator) GetOptionalFields() []string {
	return []string{"selected_content"}
}

// validateUUID validates UUID format
func (v *MCValidator) validateUUID(id string) error {
	// UUID v4 regex pattern
	uuidPattern := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)
	if !uuidPattern.MatchString(id) {
		return fmt.Errorf("invalid UUID format: %s", id)
	}
	return nil
}

// ValidateMCAnswerComplete validates complete MC answer data including base structure
func (v *MCValidator) ValidateMCAnswerComplete(answerData []byte) (*ValidationResult, error) {
	// First validate base structure
	baseResult, err := v.baseValidator.ValidateBaseStructure(answerData)
	if err != nil {
		return nil, err
	}
	
	// If base structure is invalid, return early
	if baseResult.HasErrors() {
		return baseResult, nil
	}
	
	// Parse base structure to get answer_data
	baseStructure, err := v.baseValidator.ParseBaseStructure(answerData)
	if err != nil {
		result := NewValidationResult(false)
		result.AddError("", ErrorCodeInvalidJSON)
		return result, nil
	}
	
	// Validate MC specific structure
	mcResult, err := v.ValidateAnswerStructure(baseStructure.AnswerData)
	if err != nil {
		return nil, err
	}
	
	// Combine results
	if mcResult.HasErrors() {
		baseResult.IsValid = false
		baseResult.Errors = append(baseResult.Errors, mcResult.Errors...)
	}
	
	return baseResult, nil
}
