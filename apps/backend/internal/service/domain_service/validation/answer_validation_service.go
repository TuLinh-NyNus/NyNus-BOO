package validation

import (
	"context"
	"fmt"
)

// AnswerValidationService handles JSONB answer data validation
type AnswerValidationService struct {
	baseValidator *BaseStructureValidator
	mcValidator   *MCValidator
	tfValidator   *TFValidator
	saValidator   *SAValidator
	esValidator   *ESValidator
}

// NewAnswerValidationService creates a new answer validation service
func NewAnswerValidationService() *AnswerValidationService {
	return &AnswerValidationService{
		baseValidator: NewBaseStructureValidator(),
		mcValidator:   NewMCValidator(),
		tfValidator:   NewTFValidator(),
		saValidator:   NewSAValidator(),
		esValidator:   NewESValidator(),
	}
}

// ValidateAnswerData validates JSONB answer data according to ExamSystem.md specifications
func (s *AnswerValidationService) ValidateAnswerData(ctx context.Context, answerData []byte, questionType string) (*ValidationResult, error) {
	// First validate base structure
	baseResult, err := s.ValidateBaseStructure(ctx, answerData)
	if err != nil {
		return nil, fmt.Errorf("failed to validate base structure: %w", err)
	}
	
	// If base structure is invalid, return early
	if baseResult.HasErrors() {
		return baseResult, nil
	}
	
	// Validate question type specific structure
	switch questionType {
	case "MC":
		return s.ValidateMCAnswer(ctx, answerData)
	case "TF":
		return s.ValidateTFAnswer(ctx, answerData)
	case "SA":
		return s.ValidateSAAnswer(ctx, answerData)
	case "ES":
		return s.ValidateESAnswer(ctx, answerData)
	default:
		result := NewValidationResult(false)
		result.AddError("question_type", ErrorCodeInvalidQuestionType, questionType)
		return result, nil
	}
}

// ValidateBaseStructure validates the base JSONB structure
func (s *AnswerValidationService) ValidateBaseStructure(ctx context.Context, answerData []byte) (*ValidationResult, error) {
	return s.baseValidator.ValidateBaseStructure(answerData)
}

// ValidateMCAnswer validates Multiple Choice answer data
func (s *AnswerValidationService) ValidateMCAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error) {
	return s.mcValidator.ValidateMCAnswerComplete(answerData)
}

// ValidateTFAnswer validates True/False answer data
func (s *AnswerValidationService) ValidateTFAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error) {
	return s.tfValidator.ValidateTFAnswerComplete(answerData)
}

// ValidateSAAnswer validates Short Answer answer data
func (s *AnswerValidationService) ValidateSAAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error) {
	return s.saValidator.ValidateSAAnswerComplete(answerData)
}

// ValidateESAnswer validates Essay answer data
func (s *AnswerValidationService) ValidateESAnswer(ctx context.Context, answerData []byte) (*ValidationResult, error) {
	return s.esValidator.ValidateESAnswerComplete(answerData)
}

// ValidateAndNormalizeSA validates SA answer and returns normalized text
func (s *AnswerValidationService) ValidateAndNormalizeSA(ctx context.Context, answerData []byte) (*ValidationResult, string, error) {
	return s.saValidator.ValidateAndNormalize(answerData)
}

// ValidateAndCalculateESStats validates ES answer and returns calculated statistics
func (s *AnswerValidationService) ValidateAndCalculateESStats(ctx context.Context, answerData []byte) (*ValidationResult, int, int, error) {
	return s.esValidator.ValidateAndCalculateStats(answerData)
}

// ValidateAnswerDataWithAutoCorrection validates answer data and applies auto-corrections where possible
func (s *AnswerValidationService) ValidateAnswerDataWithAutoCorrection(ctx context.Context, answerData []byte, questionType string) (*ValidationResult, []byte, error) {
	// First validate without correction
	result, err := s.ValidateAnswerData(ctx, answerData, questionType)
	if err != nil {
		return nil, nil, err
	}
	
	// If validation passes, return original data
	if !result.HasErrors() {
		return result, answerData, nil
	}
	
	// Apply auto-corrections based on question type
	switch questionType {
	case "SA":
		return s.autoCorrectSAAnswer(ctx, answerData, result)
	case "ES":
		return s.autoCorrectESAnswer(ctx, answerData, result)
	default:
		// No auto-correction for MC and TF
		return result, answerData, nil
	}
}

// autoCorrectSAAnswer applies auto-corrections to SA answers
func (s *AnswerValidationService) autoCorrectSAAnswer(ctx context.Context, answerData []byte, originalResult *ValidationResult) (*ValidationResult, []byte, error) {
	// Parse base structure
	baseStructure, err := s.baseValidator.ParseBaseStructure(answerData)
	if err != nil {
		return originalResult, answerData, nil
	}
	
	// Auto-generate normalized_text if missing
	if answerText, exists := baseStructure.AnswerData["answer_text"]; exists {
		if answerTextStr, ok := answerText.(string); ok {
			caseSensitive, _ := baseStructure.AnswerData["case_sensitive"].(bool)
			normalizedText := s.saValidator.NormalizeAnswerText(answerTextStr, caseSensitive)
			baseStructure.AnswerData["normalized_text"] = normalizedText
		}
	}
	
	// Re-marshal and validate
	correctedData, err := s.remarshalBaseStructure(baseStructure)
	if err != nil {
		return originalResult, answerData, nil
	}
	
	// Re-validate
	newResult, err := s.ValidateSAAnswer(ctx, correctedData)
	if err != nil {
		return originalResult, answerData, nil
	}
	
	return newResult, correctedData, nil
}

// autoCorrectESAnswer applies auto-corrections to ES answers
func (s *AnswerValidationService) autoCorrectESAnswer(ctx context.Context, answerData []byte, originalResult *ValidationResult) (*ValidationResult, []byte, error) {
	// Parse base structure
	baseStructure, err := s.baseValidator.ParseBaseStructure(answerData)
	if err != nil {
		return originalResult, answerData, nil
	}
	
	// Auto-calculate word_count and character_count if missing or incorrect
	if essayText, exists := baseStructure.AnswerData["essay_text"]; exists {
		if essayTextStr, ok := essayText.(string); ok {
			wordCount := s.esValidator.countWords(essayTextStr)
			charCount := len([]rune(essayTextStr))
			
			baseStructure.AnswerData["word_count"] = wordCount
			baseStructure.AnswerData["character_count"] = charCount
		}
	}
	
	// Re-marshal and validate
	correctedData, err := s.remarshalBaseStructure(baseStructure)
	if err != nil {
		return originalResult, answerData, nil
	}
	
	// Re-validate
	newResult, err := s.ValidateESAnswer(ctx, correctedData)
	if err != nil {
		return originalResult, answerData, nil
	}
	
	return newResult, correctedData, nil
}

// remarshalBaseStructure re-marshals base structure to JSON
func (s *AnswerValidationService) remarshalBaseStructure(baseStructure *BaseAnswerStructure) ([]byte, error) {
	// This would need proper JSON marshaling implementation
	// For now, return error to indicate not implemented
	return nil, fmt.Errorf("remarshal not implemented")
}

// GetSupportedQuestionTypes returns list of supported question types
func (s *AnswerValidationService) GetSupportedQuestionTypes() []string {
	return []string{"MC", "TF", "SA", "ES"}
}

// GetValidationRules returns validation rules for a specific question type
func (s *AnswerValidationService) GetValidationRules(questionType string) ([]string, []string, error) {
	switch questionType {
	case "MC":
		return s.mcValidator.GetRequiredFields(), s.mcValidator.GetOptionalFields(), nil
	case "TF":
		return s.tfValidator.GetRequiredFields(), s.tfValidator.GetOptionalFields(), nil
	case "SA":
		return s.saValidator.GetRequiredFields(), s.saValidator.GetOptionalFields(), nil
	case "ES":
		return s.esValidator.GetRequiredFields(), s.esValidator.GetOptionalFields(), nil
	default:
		return nil, nil, fmt.Errorf("unsupported question type: %s", questionType)
	}
}
