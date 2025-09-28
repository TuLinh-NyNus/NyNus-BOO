package validation

import (
	"strings"
	"unicode/utf8"
)

// ESValidator validates Essay answer data
type ESValidator struct {
	baseValidator *BaseStructureValidator
}

// NewESValidator creates a new ES validator
func NewESValidator() *ESValidator {
	return &ESValidator{
		baseValidator: NewBaseStructureValidator(),
	}
}

// ESAnswerData represents Essay answer data structure
type ESAnswerData struct {
	EssayText      string   `json:"essay_text"`
	WordCount      int      `json:"word_count,omitempty"`
	CharacterCount int      `json:"character_count,omitempty"`
	ManualScore    *float64 `json:"manual_score,omitempty"`
}

// ValidateAnswerStructure validates ES answer data structure
func (v *ESValidator) ValidateAnswerStructure(answerData map[string]interface{}) (*ValidationResult, error) {
	result := NewValidationResult(true)
	
	// Validate essay_text (required)
	essayText, exists := answerData["essay_text"]
	if !exists {
		result.AddError("answer_data.essay_text", ErrorCodeMissingField, "essay_text")
		return result, nil
	}
	
	// Check if essay_text is string
	essayTextStr, ok := essayText.(string)
	if !ok {
		result.AddError("answer_data.essay_text", ErrorCodeInvalidFieldType, "essay_text")
		return result, nil
	}
	
	// Validate essay_text is not empty
	if strings.TrimSpace(essayTextStr) == "" {
		result.AddError("answer_data.essay_text", ErrorCodeESMissingText)
		return result, nil
	}
	
	// Validate essay_text minimum length (at least 10 characters)
	if utf8.RuneCountInString(strings.TrimSpace(essayTextStr)) < 10 {
		result.AddError("answer_data.essay_text", ErrorCodeESTextTooShort)
	}
	
	// Calculate actual word and character counts for validation
	actualWordCount := v.countWords(essayTextStr)
	actualCharCount := utf8.RuneCountInString(essayTextStr)
	
	// Validate word_count if present (optional, auto-calculated if missing)
	if wordCount, exists := answerData["word_count"]; exists {
		switch wc := wordCount.(type) {
		case float64:
			if int(wc) != actualWordCount {
				result.AddError("answer_data.word_count", ErrorCodeESInvalidWordCount, int(wc))
			}
		case int:
			if wc != actualWordCount {
				result.AddError("answer_data.word_count", ErrorCodeESInvalidWordCount, wc)
			}
		default:
			result.AddError("answer_data.word_count", ErrorCodeInvalidFieldType, "word_count")
		}
	}
	
	// Validate character_count if present (optional, auto-calculated if missing)
	if charCount, exists := answerData["character_count"]; exists {
		switch cc := charCount.(type) {
		case float64:
			if int(cc) != actualCharCount {
				result.AddError("answer_data.character_count", ErrorCodeESInvalidCharCount, int(cc))
			}
		case int:
			if cc != actualCharCount {
				result.AddError("answer_data.character_count", ErrorCodeESInvalidCharCount, cc)
			}
		default:
			result.AddError("answer_data.character_count", ErrorCodeInvalidFieldType, "character_count")
		}
	}
	
	// Validate manual_score if present (optional, null for auto-grading)
	if manualScore, exists := answerData["manual_score"]; exists {
		if manualScore != nil {
			switch ms := manualScore.(type) {
			case float64:
				if ms < 0 {
					result.AddError("answer_data.manual_score", ErrorCodeESInvalidManualScore, ms)
				}
			case int:
				if ms < 0 {
					result.AddError("answer_data.manual_score", ErrorCodeESInvalidManualScore, ms)
				}
			default:
				result.AddError("answer_data.manual_score", ErrorCodeInvalidFieldType, "manual_score")
			}
		}
	}
	
	return result, nil
}

// GetRequiredFields returns required fields for ES answers
func (v *ESValidator) GetRequiredFields() []string {
	return []string{"essay_text"}
}

// GetOptionalFields returns optional fields for ES answers
func (v *ESValidator) GetOptionalFields() []string {
	return []string{"word_count", "character_count", "manual_score"}
}

// countWords counts words in text (simple whitespace-based counting)
func (v *ESValidator) countWords(text string) int {
	text = strings.TrimSpace(text)
	if text == "" {
		return 0
	}
	
	words := strings.Fields(text)
	return len(words)
}

// ValidateESAnswerComplete validates complete ES answer data including base structure
func (v *ESValidator) ValidateESAnswerComplete(answerData []byte) (*ValidationResult, error) {
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
	
	// Validate ES specific structure
	esResult, err := v.ValidateAnswerStructure(baseStructure.AnswerData)
	if err != nil {
		return nil, err
	}
	
	// Combine results
	if esResult.HasErrors() {
		baseResult.IsValid = false
		baseResult.Errors = append(baseResult.Errors, esResult.Errors...)
	}
	
	return baseResult, nil
}

// ValidateAndCalculateStats validates ES answer and returns calculated statistics
func (v *ESValidator) ValidateAndCalculateStats(answerData []byte) (*ValidationResult, int, int, error) {
	// Validate the answer
	result, err := v.ValidateESAnswerComplete(answerData)
	if err != nil {
		return nil, 0, 0, err
	}
	
	if result.HasErrors() {
		return result, 0, 0, nil
	}
	
	// Parse to get essay text
	baseStructure, err := v.baseValidator.ParseBaseStructure(answerData)
	if err != nil {
		return result, 0, 0, err
	}
	
	essayText, _ := baseStructure.AnswerData["essay_text"].(string)
	
	// Calculate statistics
	wordCount := v.countWords(essayText)
	charCount := utf8.RuneCountInString(essayText)
	
	return result, wordCount, charCount, nil
}
