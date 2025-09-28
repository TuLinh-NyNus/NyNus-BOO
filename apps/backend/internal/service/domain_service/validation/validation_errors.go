package validation

import (
	"fmt"
)

// Validation error codes
const (
	// Base structure errors
	ErrorCodeInvalidJSON        = "INVALID_JSON"
	ErrorCodeMissingField       = "MISSING_FIELD"
	ErrorCodeInvalidFieldType   = "INVALID_FIELD_TYPE"
	ErrorCodeInvalidQuestionType = "INVALID_QUESTION_TYPE"
	ErrorCodeInvalidUUID        = "INVALID_UUID"
	ErrorCodeInvalidDateTime    = "INVALID_DATETIME"
	
	// MC specific errors
	ErrorCodeMCMissingSelection = "MC_MISSING_SELECTION"
	ErrorCodeMCInvalidAnswerID  = "MC_INVALID_ANSWER_ID"
	
	// TF specific errors
	ErrorCodeTFInvalidStatements     = "TF_INVALID_STATEMENTS"
	ErrorCodeTFIncorrectStatementCount = "TF_INCORRECT_STATEMENT_COUNT"
	ErrorCodeTFMismatchedSelections  = "TF_MISMATCHED_SELECTIONS"
	ErrorCodeTFInvalidStatementID    = "TF_INVALID_STATEMENT_ID"
	
	// SA specific errors
	ErrorCodeSAMissingText      = "SA_MISSING_TEXT"
	ErrorCodeSATextTooLong      = "SA_TEXT_TOO_LONG"
	ErrorCodeSAInvalidCaseSetting = "SA_INVALID_CASE_SETTING"
	
	// ES specific errors
	ErrorCodeESMissingText      = "ES_MISSING_TEXT"
	ErrorCodeESTextTooShort     = "ES_TEXT_TOO_SHORT"
	ErrorCodeESInvalidWordCount = "ES_INVALID_WORD_COUNT"
	ErrorCodeESInvalidCharCount = "ES_INVALID_CHAR_COUNT"
	ErrorCodeESInvalidManualScore = "ES_INVALID_MANUAL_SCORE"
)

// Validation error messages in Vietnamese
var ErrorMessages = map[string]string{
	// Base structure errors
	ErrorCodeInvalidJSON:        "Dữ liệu JSON không hợp lệ",
	ErrorCodeMissingField:       "Thiếu trường bắt buộc: %s",
	ErrorCodeInvalidFieldType:   "Kiểu dữ liệu không hợp lệ cho trường: %s",
	ErrorCodeInvalidQuestionType: "Loại câu hỏi không hợp lệ: %s (phải là MC, TF, SA, hoặc ES)",
	ErrorCodeInvalidUUID:        "UUID không hợp lệ: %s",
	ErrorCodeInvalidDateTime:    "Định dạng thời gian không hợp lệ: %s (phải là RFC3339)",
	
	// MC specific errors
	ErrorCodeMCMissingSelection: "Câu hỏi trắc nghiệm phải có lựa chọn được chọn",
	ErrorCodeMCInvalidAnswerID:  "ID đáp án không hợp lệ: %s",
	
	// TF specific errors
	ErrorCodeTFInvalidStatements:     "Danh sách câu lệnh không hợp lệ",
	ErrorCodeTFIncorrectStatementCount: "Câu hỏi đúng/sai phải có đúng 4 câu lệnh, hiện có: %d",
	ErrorCodeTFMismatchedSelections:  "Danh sách selected_answer_ids không khớp với statements được chọn",
	ErrorCodeTFInvalidStatementID:    "ID câu lệnh không hợp lệ: %s",
	
	// SA specific errors
	ErrorCodeSAMissingText:      "Câu trả lời ngắn phải có nội dung",
	ErrorCodeSATextTooLong:      "Câu trả lời ngắn không được vượt quá 1000 ký tự",
	ErrorCodeSAInvalidCaseSetting: "Cài đặt case_sensitive phải là boolean",
	
	// ES specific errors
	ErrorCodeESMissingText:      "Bài luận phải có nội dung",
	ErrorCodeESTextTooShort:     "Bài luận phải có ít nhất 10 ký tự",
	ErrorCodeESInvalidWordCount: "Số từ không hợp lệ: %d",
	ErrorCodeESInvalidCharCount: "Số ký tự không hợp lệ: %d",
	ErrorCodeESInvalidManualScore: "Điểm thủ công không hợp lệ: %v",
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
