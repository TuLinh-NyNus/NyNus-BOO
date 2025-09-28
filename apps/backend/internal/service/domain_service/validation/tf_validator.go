package validation

import (
	"fmt"
	"regexp"
)

// TFValidator validates True/False answer data
type TFValidator struct {
	baseValidator *BaseStructureValidator
}

// NewTFValidator creates a new TF validator
func NewTFValidator() *TFValidator {
	return &TFValidator{
		baseValidator: NewBaseStructureValidator(),
	}
}

// TFAnswerData represents True/False answer data structure
type TFAnswerData struct {
	SelectedAnswerIDs []string      `json:"selected_answer_ids"`
	Statements        []TFStatement `json:"statements"`
}

// TFStatement represents a single True/False statement
type TFStatement struct {
	ID       string `json:"id"`
	Content  string `json:"content"`
	Selected bool   `json:"selected"`
}

// ValidateAnswerStructure validates TF answer data structure
func (v *TFValidator) ValidateAnswerStructure(answerData map[string]interface{}) (*ValidationResult, error) {
	result := NewValidationResult(true)
	
	// Validate selected_answer_ids (required, can be empty array)
	selectedAnswerIDs, exists := answerData["selected_answer_ids"]
	if !exists {
		result.AddError("answer_data.selected_answer_ids", ErrorCodeMissingField, "selected_answer_ids")
		return result, nil
	}
	
	// Check if selected_answer_ids is array
	selectedAnswerIDsSlice, ok := selectedAnswerIDs.([]interface{})
	if !ok {
		result.AddError("answer_data.selected_answer_ids", ErrorCodeInvalidFieldType, "selected_answer_ids")
		return result, nil
	}
	
	// Convert to string slice and validate UUIDs
	selectedIDs := make([]string, 0, len(selectedAnswerIDsSlice))
	for _, id := range selectedAnswerIDsSlice {
		idStr, ok := id.(string)
		if !ok {
			result.AddError("answer_data.selected_answer_ids", ErrorCodeInvalidFieldType, "selected_answer_ids")
			continue
		}
		
		// Validate UUID format
		if err := v.validateUUID(idStr); err != nil {
			result.AddError("answer_data.selected_answer_ids", ErrorCodeTFInvalidStatementID, idStr)
			continue
		}
		
		selectedIDs = append(selectedIDs, idStr)
	}
	
	// Validate statements (required)
	statements, exists := answerData["statements"]
	if !exists {
		result.AddError("answer_data.statements", ErrorCodeMissingField, "statements")
		return result, nil
	}
	
	// Check if statements is array
	statementsSlice, ok := statements.([]interface{})
	if !ok {
		result.AddError("answer_data.statements", ErrorCodeInvalidFieldType, "statements")
		return result, nil
	}
	
	// Validate statements count (must be exactly 4)
	if len(statementsSlice) != 4 {
		result.AddError("answer_data.statements", ErrorCodeTFIncorrectStatementCount, len(statementsSlice))
		return result, nil
	}
	
	// Validate each statement and collect selected ones
	selectedFromStatements := make([]string, 0)
	for idx, stmt := range statementsSlice {
		stmtMap, ok := stmt.(map[string]interface{})
		if !ok {
			result.AddError("answer_data.statements", ErrorCodeTFInvalidStatements)
			continue
		}

		// Validate statement ID
		id, exists := stmtMap["id"]
		if !exists {
			result.AddError("answer_data.statements", ErrorCodeMissingField, "statements["+fmt.Sprintf("%d", idx)+"].id")
			continue
		}
		
		idStr, ok := id.(string)
		if !ok {
			result.AddError("answer_data.statements", ErrorCodeInvalidFieldType, "statements["+fmt.Sprintf("%d", idx)+"].id")
			continue
		}

		// Validate UUID format
		if err := v.validateUUID(idStr); err != nil {
			result.AddError("answer_data.statements", ErrorCodeTFInvalidStatementID, idStr)
			continue
		}

		// Validate content
		content, exists := stmtMap["content"]
		if !exists {
			result.AddError("answer_data.statements", ErrorCodeMissingField, "statements["+fmt.Sprintf("%d", idx)+"].content")
			continue
		}

		if _, ok := content.(string); !ok {
			result.AddError("answer_data.statements", ErrorCodeInvalidFieldType, "statements["+fmt.Sprintf("%d", idx)+"].content")
			continue
		}

		// Validate selected
		selected, exists := stmtMap["selected"]
		if !exists {
			result.AddError("answer_data.statements", ErrorCodeMissingField, "statements["+fmt.Sprintf("%d", idx)+"].selected")
			continue
		}

		selectedBool, ok := selected.(bool)
		if !ok {
			result.AddError("answer_data.statements", ErrorCodeInvalidFieldType, "statements["+fmt.Sprintf("%d", idx)+"].selected")
			continue
		}
		
		// Collect selected statement IDs
		if selectedBool {
			selectedFromStatements = append(selectedFromStatements, idStr)
		}
	}
	
	// Validate consistency between selected_answer_ids and statements
	if !v.arraysEqual(selectedIDs, selectedFromStatements) {
		result.AddError("answer_data", ErrorCodeTFMismatchedSelections)
	}
	
	return result, nil
}

// GetRequiredFields returns required fields for TF answers
func (v *TFValidator) GetRequiredFields() []string {
	return []string{"selected_answer_ids", "statements"}
}

// GetOptionalFields returns optional fields for TF answers
func (v *TFValidator) GetOptionalFields() []string {
	return []string{}
}

// validateUUID validates UUID format
func (v *TFValidator) validateUUID(id string) error {
	// UUID v4 regex pattern
	uuidPattern := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)
	if !uuidPattern.MatchString(id) {
		return fmt.Errorf("invalid UUID format: %s", id)
	}
	return nil
}

// arraysEqual checks if two string arrays contain the same elements (order doesn't matter)
func (v *TFValidator) arraysEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	
	// Create maps to count occurrences
	countA := make(map[string]int)
	countB := make(map[string]int)
	
	for _, item := range a {
		countA[item]++
	}
	
	for _, item := range b {
		countB[item]++
	}
	
	// Compare maps
	for key, count := range countA {
		if countB[key] != count {
			return false
		}
	}
	
	return true
}

// ValidateTFAnswerComplete validates complete TF answer data including base structure
func (v *TFValidator) ValidateTFAnswerComplete(answerData []byte) (*ValidationResult, error) {
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
	
	// Validate TF specific structure
	tfResult, err := v.ValidateAnswerStructure(baseStructure.AnswerData)
	if err != nil {
		return nil, err
	}
	
	// Combine results
	if tfResult.HasErrors() {
		baseResult.IsValid = false
		baseResult.Errors = append(baseResult.Errors, tfResult.Errors...)
	}
	
	return baseResult, nil
}
