package validation

import (
	"strings"
)

// SAValidator validates Short Answer answer data
type SAValidator struct {
	baseValidator *BaseStructureValidator
}

// NewSAValidator creates a new SA validator
func NewSAValidator() *SAValidator {
	return &SAValidator{
		baseValidator: NewBaseStructureValidator(),
	}
}

// SAAnswerData represents Short Answer answer data structure
type SAAnswerData struct {
	AnswerText     string `json:"answer_text"`
	NormalizedText string `json:"normalized_text,omitempty"`
	CaseSensitive  bool   `json:"case_sensitive,omitempty"`
}

// ValidateAnswerStructure validates SA answer data structure
func (v *SAValidator) ValidateAnswerStructure(answerData map[string]interface{}) (*ValidationResult, error) {
	result := NewValidationResult(true)

	// Validate answer_text (required)
	answerText, exists := answerData["answer_text"]
	if !exists {
		result.AddError("answer_data.answer_text", ErrorCodeMissingField, "answer_text")
		return result, nil
	}

	// Check if answer_text is string
	answerTextStr, ok := answerText.(string)
	if !ok {
		result.AddError("answer_data.answer_text", ErrorCodeInvalidFieldType, "answer_text")
		return result, nil
	}

	// Validate answer_text is not empty
	if strings.TrimSpace(answerTextStr) == "" {
		result.AddError("answer_data.answer_text", ErrorCodeSAMissingText)
		return result, nil
	}

	// Validate answer_text length (max 1000 characters)
	if len(answerTextStr) > 1000 {
		result.AddError("answer_data.answer_text", ErrorCodeSATextTooLong)
	}

	// Validate normalized_text if present (optional)
	if normalizedText, exists := answerData["normalized_text"]; exists {
		if _, ok := normalizedText.(string); !ok {
			result.AddError("answer_data.normalized_text", ErrorCodeInvalidFieldType, "normalized_text")
		}
	}

	// Validate case_sensitive if present (optional, default false)
	if caseSensitive, exists := answerData["case_sensitive"]; exists {
		if _, ok := caseSensitive.(bool); !ok {
			result.AddError("answer_data.case_sensitive", ErrorCodeSAInvalidCaseSetting)
		}
	}

	return result, nil
}

// GetRequiredFields returns required fields for SA answers
func (v *SAValidator) GetRequiredFields() []string {
	return []string{"answer_text"}
}

// GetOptionalFields returns optional fields for SA answers
func (v *SAValidator) GetOptionalFields() []string {
	return []string{"normalized_text", "case_sensitive"}
}

// ValidateSAAnswerComplete validates complete SA answer data including base structure
func (v *SAValidator) ValidateSAAnswerComplete(answerData []byte) (*ValidationResult, error) {
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

	// Validate SA specific structure
	saResult, err := v.ValidateAnswerStructure(baseStructure.AnswerData)
	if err != nil {
		return nil, err
	}

	// Combine results
	if saResult.HasErrors() {
		baseResult.IsValid = false
		baseResult.Errors = append(baseResult.Errors, saResult.Errors...)
	}

	return baseResult, nil
}

// NormalizeAnswerText normalizes answer text for comparison
func (v *SAValidator) NormalizeAnswerText(text string, caseSensitive bool) string {
	normalized := strings.TrimSpace(text)
	if !caseSensitive {
		normalized = strings.ToLower(normalized)
	}
	return normalized
}

// ValidateAndNormalize validates SA answer and returns normalized text
func (v *SAValidator) ValidateAndNormalize(answerData []byte) (*ValidationResult, string, error) {
	// Validate the answer
	result, err := v.ValidateSAAnswerComplete(answerData)
	if err != nil {
		return nil, "", err
	}

	if result.HasErrors() {
		return result, "", nil
	}

	// Parse to get normalized text
	baseStructure, err := v.baseValidator.ParseBaseStructure(answerData)
	if err != nil {
		return result, "", err
	}

	answerText, _ := baseStructure.AnswerData["answer_text"].(string)
	caseSensitive, _ := baseStructure.AnswerData["case_sensitive"].(bool)

	// Check if normalized_text is provided, otherwise generate it
	if normalizedText, exists := baseStructure.AnswerData["normalized_text"]; exists {
		if normalizedStr, ok := normalizedText.(string); ok && normalizedStr != "" {
			return result, normalizedStr, nil
		}
	}

	// Generate normalized text
	normalizedText := v.NormalizeAnswerText(answerText, caseSensitive)
	return result, normalizedText, nil
}
