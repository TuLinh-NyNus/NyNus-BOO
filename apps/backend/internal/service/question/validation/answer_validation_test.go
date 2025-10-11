package validation

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestValidateMCAnswer tests Multiple Choice answer validation
func TestValidateMCAnswer(t *testing.T) {
	service := NewAnswerValidationService()
	ctx := context.Background()

	tests := []struct {
		name        string
		answerData  map[string]interface{}
		expectValid bool
		expectError string
	}{
		{
			name: "Valid MC answer",
			answerData: map[string]interface{}{
				"question_type": "MC",
				"question_id":   "550e8400-e29b-41d4-a716-446655440099",
				"answer_data": map[string]interface{}{
					"selected_answer_id": "550e8400-e29b-41d4-a716-446655440000",
					"selected_content":   "Option A",
				},
			},
			expectValid: true,
		},
		{
			name: "Missing selected_answer_id",
			answerData: map[string]interface{}{
				"question_type": "MC",
				"question_id":   "550e8400-e29b-41d4-a716-446655440099",
				"answer_data": map[string]interface{}{
					"selected_content": "Option A",
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Invalid UUID format",
			answerData: map[string]interface{}{
				"question_type": "MC",
				"question_id":   "550e8400-e29b-41d4-a716-446655440099",
				"answer_data": map[string]interface{}{
					"selected_answer_id": "not-a-uuid",
					"selected_content":   "Option A",
				},
			},
			expectValid: false,
			expectError: ErrorCodeMCInvalidAnswerID,
		},
		{
			name: "Empty selected_answer_id",
			answerData: map[string]interface{}{
				"question_type": "MC",
				"question_id":   "550e8400-e29b-41d4-a716-446655440099",
				"answer_data": map[string]interface{}{
					"selected_answer_id": "",
				},
			},
			expectValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			answerBytes, err := json.Marshal(tt.answerData)
			require.NoError(t, err)

			result, err := service.ValidateMCAnswer(ctx, answerBytes)
			require.NoError(t, err)

			assert.Equal(t, tt.expectValid, result.IsValid, "Validation result should match expected")
			if !tt.expectValid && tt.expectError != "" {
				// Check if error code matches expected code
				assert.True(t, hasErrorCode(result, tt.expectError), "Expected error code: %s, got codes: %v", tt.expectError, getErrorCodes(result))
			}
		})
	}
}

// TestValidateTFAnswer tests True/False answer validation
func TestValidateTFAnswer(t *testing.T) {
	service := NewAnswerValidationService()
	ctx := context.Background()

	tests := []struct {
		name        string
		answerData  map[string]interface{}
		expectValid bool
		expectError string
	}{
		{
			name: "Valid TF answer with 4 statements",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440001",
						"550e8400-e29b-41d4-a716-446655440002",
					},
					"statements": []map[string]interface{}{
						{
							"id":       "550e8400-e29b-41d4-a716-446655440001",
							"content":  "Statement 1",
							"selected": true,
						},
						{
							"id":       "550e8400-e29b-41d4-a716-446655440002",
							"content":  "Statement 2",
							"selected": true,
						},
						{
							"id":       "550e8400-e29b-41d4-a716-446655440003",
							"content":  "Statement 3",
							"selected": false,
						},
						{
							"id":       "550e8400-e29b-41d4-a716-446655440004",
							"content":  "Statement 4",
							"selected": false,
						},
					},
				},
			},
			expectValid: true,
		},
		{
			name: "Invalid - Only 3 statements (must be 4)",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{"550e8400-e29b-41d4-a716-446655440001"},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "content": "Statement 1", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeTFIncorrectStatementCount,
		},
		{
			name: "Invalid - 5 statements (must be exactly 4)",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440005", "content": "Statement 5", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeTFIncorrectStatementCount,
		},
		{
			name: "Invalid - Missing statements field",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Invalid - Missing selected_answer_ids field",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Invalid - Missing id in statement",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Invalid - Missing content in statement",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Invalid - Missing selected in statement",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "content": "Statement 1"},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Invalid - selected_answer_ids doesn't match statements",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440001",
						"550e8400-e29b-41d4-a716-446655440002",
					},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "content": "Statement 1", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false}, // Should be true
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeTFMismatchedSelections,
		},
		{
			name: "Invalid - UUID format in statement ID",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "not-a-uuid", "content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: false,
			expectError: ErrorCodeTFInvalidStatementID,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			answerBytes, err := json.Marshal(tt.answerData)
			require.NoError(t, err)

			result, err := service.ValidateTFAnswer(ctx, answerBytes)
			require.NoError(t, err)

			assert.Equal(t, tt.expectValid, result.IsValid, "Validation result should match expected")
			if !tt.expectValid && tt.expectError != "" {
				// Check if error code matches expected code
				assert.True(t, hasErrorCode(result, tt.expectError), "Expected error code: %s, got codes: %v", tt.expectError, getErrorCodes(result))
			}
		})
	}
}

// TestValidateSAAnswer tests Short Answer validation
func TestValidateSAAnswer(t *testing.T) {
	service := NewAnswerValidationService()
	ctx := context.Background()

	tests := []struct {
		name        string
		answerData  map[string]interface{}
		expectValid bool
		expectError string
	}{
		{
			name: "Valid SA answer",
			answerData: map[string]interface{}{
				"question_type": "SA",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"answer_text":     "Paris",
					"normalized_text": "paris",
					"case_sensitive":  false,
				},
			},
			expectValid: true,
		},
		{
			name: "Valid SA answer - case sensitive",
			answerData: map[string]interface{}{
				"question_type": "SA",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"answer_text":     "Paris",
					"normalized_text": "Paris",
					"case_sensitive":  true,
				},
			},
			expectValid: true,
		},
		{
			name: "Missing answer_text",
			answerData: map[string]interface{}{
				"question_type": "SA",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"normalized_text": "paris",
					"case_sensitive":  false,
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Empty answer_text",
			answerData: map[string]interface{}{
				"question_type": "SA",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"answer_text":     "",
					"normalized_text": "",
					"case_sensitive":  false,
				},
			},
			expectValid: false,
			expectError: ErrorCodeSAMissingText,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			answerBytes, err := json.Marshal(tt.answerData)
			require.NoError(t, err)

			result, err := service.ValidateSAAnswer(ctx, answerBytes)
			require.NoError(t, err)

			assert.Equal(t, tt.expectValid, result.IsValid, "Validation result should match expected")
			if !tt.expectValid && tt.expectError != "" {
				// Check if error code matches expected code
				assert.True(t, hasErrorCode(result, tt.expectError), "Expected error code: %s, got codes: %v", tt.expectError, getErrorCodes(result))
			}
		})
	}
}

// TestValidateESAnswer tests Essay validation
func TestValidateESAnswer(t *testing.T) {
	service := NewAnswerValidationService()
	ctx := context.Background()

	tests := []struct {
		name        string
		answerData  map[string]interface{}
		expectValid bool
		expectError string
	}{
		{
			name: "Valid ES answer",
			answerData: map[string]interface{}{
				"question_type": "ES",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"essay_text":      "This is my essay answer. It contains multiple sentences.",
					"word_count":      9,
					"character_count": 56,
					"manual_score":    nil,
				},
			},
			expectValid: true,
		},
		{
			name: "Valid ES answer with manual score",
			answerData: map[string]interface{}{
				"question_type": "ES",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"essay_text":      "This is my essay answer.",
					"word_count":      5,
					"character_count": 24,
					"manual_score":    15.5,
				},
			},
			expectValid: true,
		},
		{
			name: "Missing essay_text",
			answerData: map[string]interface{}{
				"question_type": "ES",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"word_count":      0,
					"character_count": 0,
				},
			},
			expectValid: false,
			expectError: ErrorCodeMissingField,
		},
		{
			name: "Empty essay_text",
			answerData: map[string]interface{}{
				"question_type": "ES",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"essay_text":      "",
					"word_count":      0,
					"character_count": 0,
				},
			},
			expectValid: false,
			expectError: ErrorCodeESMissingText,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			answerBytes, err := json.Marshal(tt.answerData)
			require.NoError(t, err)

			result, err := service.ValidateESAnswer(ctx, answerBytes)
			require.NoError(t, err)

			assert.Equal(t, tt.expectValid, result.IsValid, "Validation result should match expected")
			if !tt.expectValid && tt.expectError != "" {
				// Check if error code matches expected code
				assert.True(t, hasErrorCode(result, tt.expectError), "Expected error code: %s, got codes: %v", tt.expectError, getErrorCodes(result))
			}
		})
	}
}

// TestValidateAnswerData tests main validation dispatcher
func TestValidateAnswerData(t *testing.T) {
	service := NewAnswerValidationService()
	ctx := context.Background()

	tests := []struct {
		name         string
		questionType string
		answerData   map[string]interface{}
		expectValid  bool
	}{
		{
			name:         "MC type routes to MC validation",
			questionType: "MC",
			answerData: map[string]interface{}{
				"question_type": "MC",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_id": "550e8400-e29b-41d4-a716-446655440000",
				},
			},
			expectValid: true,
		},
		{
			name:         "TF type routes to TF validation",
			questionType: "TF",
			answerData: map[string]interface{}{
				"question_type": "TF",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440001", "content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440002", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440003", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440004", "content": "Statement 4", "selected": false},
					},
				},
			},
			expectValid: true,
		},
		{
			name:         "SA type routes to SA validation",
			questionType: "SA",
			answerData: map[string]interface{}{
				"question_type": "SA",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"answer_text":     "Paris",
					"normalized_text": "paris",
					"case_sensitive":  false,
				},
			},
			expectValid: true,
		},
		{
			name:         "ES type routes to ES validation",
			questionType: "ES",
			answerData: map[string]interface{}{
				"question_type": "ES",
				"question_id":   validQuestionID(),
				"answer_data": map[string]interface{}{
					"essay_text":      "Essay text",
					"word_count":      2,
					"character_count": 10,
				},
			},
			expectValid: true,
		},
		{
			name:         "Unknown type returns error",
			questionType: "UNKNOWN",
			answerData: map[string]interface{}{
				"question_type": "UNKNOWN",
				"answer_data":   map[string]interface{}{},
			},
			expectValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			answerBytes, err := json.Marshal(tt.answerData)
			require.NoError(t, err)

			result, err := service.ValidateAnswerData(ctx, answerBytes, tt.questionType)
			require.NoError(t, err)

			assert.Equal(t, tt.expectValid, result.IsValid, "Validation result should match expected")
		})
	}
}

// Helper functions

// validQuestionID returns a valid UUID for testing
func validQuestionID() string {
	return "550e8400-e29b-41d4-a716-446655440099"
}

// addQuestionID adds question_id to answer data if not present
func addQuestionID(answerData map[string]interface{}) map[string]interface{}{
	if _, exists := answerData["question_id"]; !exists {
		answerData["question_id"] = validQuestionID()
	}
	return answerData
}

// hasErrorCode checks if validation result has an error with specific code
func hasErrorCode(result *ValidationResult, code string) bool {
	for _, err := range result.Errors {
		if err.Code == code {
			return true
		}
	}
	return false
}

// getErrorCodes returns all error codes from validation result
func getErrorCodes(result *ValidationResult) []string {
	codes := make([]string, len(result.Errors))
	for i, err := range result.Errors {
		codes[i] = err.Code
	}
	return codes
}

func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 && (s == substr || len(s) >= len(substr) && findSubstring(s, substr))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
