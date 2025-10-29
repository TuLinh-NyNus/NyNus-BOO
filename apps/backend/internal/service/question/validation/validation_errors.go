package validation

import (
	"fmt"
)

// Validation error codes
const (
	// Base structure errors
	ErrorCodeInvalidJSON         = "INVALID_JSON"
	ErrorCodeMissingField        = "MISSING_FIELD"
	ErrorCodeInvalidFieldType    = "INVALID_FIELD_TYPE"
	ErrorCodeInvalidQuestionType = "INVALID_QUESTION_TYPE"
	ErrorCodeInvalidUUID         = "INVALID_UUID"
	ErrorCodeInvalidDateTime     = "INVALID_DATETIME"

	// MC specific errors
	ErrorCodeMCMissingSelection = "MC_MISSING_SELECTION"
	ErrorCodeMCInvalidAnswerID  = "MC_INVALID_ANSWER_ID"

	// TF specific errors
	ErrorCodeTFInvalidStatements       = "TF_INVALID_STATEMENTS"
	ErrorCodeTFIncorrectStatementCount = "TF_INCORRECT_STATEMENT_COUNT"
	ErrorCodeTFMismatchedSelections    = "TF_MISMATCHED_SELECTIONS"
	ErrorCodeTFInvalidStatementID      = "TF_INVALID_STATEMENT_ID"

	// SA specific errors
	ErrorCodeSAMissingText        = "SA_MISSING_TEXT"
	ErrorCodeSATextTooLong        = "SA_TEXT_TOO_LONG"
	ErrorCodeSAInvalidCaseSetting = "SA_INVALID_CASE_SETTING"

	// ES specific errors
	ErrorCodeESMissingText        = "ES_MISSING_TEXT"
	ErrorCodeESTextTooShort       = "ES_TEXT_TOO_SHORT"
	ErrorCodeESInvalidWordCount   = "ES_INVALID_WORD_COUNT"
	ErrorCodeESInvalidCharCount   = "ES_INVALID_CHAR_COUNT"
	ErrorCodeESInvalidManualScore = "ES_INVALID_MANUAL_SCORE"
)

// Validation error messages in Vietnamese
var ErrorMessages = map[string]string{
	// Base structure errors
	ErrorCodeInvalidJSON:         "Dá»¯ liá»‡u JSON khÃ´ng há»£p lá»‡",
	ErrorCodeMissingField:        "Thiáº¿u trÆ°á»ng báº¯t buá»™c: %s",
	ErrorCodeInvalidFieldType:    "Kiá»ƒu dá»¯ liá»‡u khÃ´ng há»£p lá»‡ cho trÆ°á»ng: %s",
	ErrorCodeInvalidQuestionType: "Loáº¡i cÃ¢u há»i khÃ´ng há»£p lá»‡: %s (pháº£i lÃ  MC, TF, SA, hoáº·c ES)",
	ErrorCodeInvalidUUID:         "UUID khÃ´ng há»£p lá»‡: %s",
	ErrorCodeInvalidDateTime:     "Äá»‹nh dáº¡ng thá»i gian khÃ´ng há»£p lá»‡: %s (pháº£i lÃ  RFC3339)",

	// MC specific errors
	ErrorCodeMCMissingSelection: "CÃ¢u há»i tráº¯c nghiá»‡m pháº£i cÃ³ lá»±a chá»n Ä‘Æ°á»£c chá»n",
	ErrorCodeMCInvalidAnswerID:  "ID Ä‘Ã¡p Ã¡n khÃ´ng há»£p lá»‡: %s",

	// TF specific errors
	ErrorCodeTFInvalidStatements:       "Danh sÃ¡ch cÃ¢u lá»‡nh khÃ´ng há»£p lá»‡",
	ErrorCodeTFIncorrectStatementCount: "CÃ¢u há»i Ä‘Ãºng/sai pháº£i cÃ³ Ä‘Ãºng 4 cÃ¢u lá»‡nh, hiá»‡n cÃ³: %d",
	ErrorCodeTFMismatchedSelections:    "Danh sÃ¡ch selected_answer_ids khÃ´ng khá»›p vá»›i statements Ä‘Æ°á»£c chá»n",
	ErrorCodeTFInvalidStatementID:      "ID cÃ¢u lá»‡nh khÃ´ng há»£p lá»‡: %s",

	// SA specific errors
	ErrorCodeSAMissingText:        "CÃ¢u tráº£ lá»i ngáº¯n pháº£i cÃ³ ná»™i dung",
	ErrorCodeSATextTooLong:        "CÃ¢u tráº£ lá»i ngáº¯n khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 1000 kÃ½ tá»±",
	ErrorCodeSAInvalidCaseSetting: "CÃ i Ä‘áº·t case_sensitive pháº£i lÃ  boolean",

	// ES specific errors
	ErrorCodeESMissingText:        "BÃ i luáº­n pháº£i cÃ³ ná»™i dung",
	ErrorCodeESTextTooShort:       "BÃ i luáº­n pháº£i cÃ³ Ã­t nháº¥t 10 kÃ½ tá»±",
	ErrorCodeESInvalidWordCount:   "Sá»‘ tá»« khÃ´ng há»£p lá»‡: %d",
	ErrorCodeESInvalidCharCount:   "Sá»‘ kÃ½ tá»± khÃ´ng há»£p lá»‡: %d",
	ErrorCodeESInvalidManualScore: "Äiá»ƒm thá»§ cÃ´ng khÃ´ng há»£p lá»‡: %v",
}

// NewValidationError creates a new validation error
func NewValidationError(field, code string, args ...interface{}) ValidationError {
	message := ErrorMessages[code]
	if len(args) > 0 {
		message = fmt.Sprintf(message, args...)
	}

	return ValidationError{
		Field:   field,
		Message: message,
		Code:    code,
	}
}

// NewValidationResult creates a new validation result
func NewValidationResult(isValid bool, errors ...ValidationError) *ValidationResult {
	return &ValidationResult{
		IsValid: isValid,
		Errors:  errors,
	}
}

// AddError adds an error to validation result
func (vr *ValidationResult) AddError(field, code string, args ...interface{}) {
	vr.IsValid = false
	vr.Errors = append(vr.Errors, NewValidationError(field, code, args...))
}

// HasErrors checks if validation result has errors
func (vr *ValidationResult) HasErrors() bool {
	return len(vr.Errors) > 0
}

// GetErrorMessages returns all error messages
func (vr *ValidationResult) GetErrorMessages() []string {
	messages := make([]string, len(vr.Errors))
	for i, err := range vr.Errors {
		messages[i] = err.Message
	}
	return messages
}
