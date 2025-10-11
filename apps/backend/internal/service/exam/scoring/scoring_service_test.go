package scoring

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestCalculateMCScore tests Multiple Choice scoring
func TestCalculateMCScore(t *testing.T) {
	service := NewScoringService()

	tests := []struct {
		name           string
		userAnswer     map[string]interface{}
		correctAnswer  map[string]interface{}
		maxPoints      float64
		expectedScore  float64
		expectedCorrect bool
		expectError    bool
	}{
		{
			name: "Correct answer",
			userAnswer: map[string]interface{}{
				"question_type": "MC",
				"answer_data": map[string]interface{}{
					"selected_answer_id": "answer-1",
				},
			},
			correctAnswer: map[string]interface{}{
				"question_type": "MC",
				"correct_data": map[string]interface{}{
					"correct_answer_id": "answer-1",
				},
			},
			maxPoints:       10.0,
			expectedScore:   10.0,
			expectedCorrect: true,
			expectError:     false,
		},
		{
			name: "Incorrect answer",
			userAnswer: map[string]interface{}{
				"question_type": "MC",
				"answer_data": map[string]interface{}{
					"selected_answer_id": "answer-2",
				},
			},
			correctAnswer: map[string]interface{}{
				"question_type": "MC",
				"correct_data": map[string]interface{}{
					"correct_answer_id": "answer-1",
				},
			},
			maxPoints:       10.0,
			expectedScore:   0.0,
			expectedCorrect: false,
			expectError:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userAnswerBytes, err := json.Marshal(tt.userAnswer)
			require.NoError(t, err)

			correctAnswerBytes, err := json.Marshal(tt.correctAnswer)
			require.NoError(t, err)

			score, isCorrect, err := service.CalculateMCScore(userAnswerBytes, correctAnswerBytes, tt.maxPoints)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedScore, score, "Score should match expected")
				assert.Equal(t, tt.expectedCorrect, isCorrect, "Correct flag should match expected")
			}
		})
	}
}

// TestCalculateTFScore tests True/False scoring with 4 statements
func TestCalculateTFScore(t *testing.T) {
	service := NewScoringService()

	tests := []struct {
		name              string
		userSelectedIDs   []string
		correctAnswerIDs  []string
		allAnswerIDs      []string
		maxPoints         float64
		expectedScore     float64
		expectedCorrect   bool
		expectedCorrectCount int
		expectError       bool
		errorContains     string
	}{
		{
			name:            "All 4 correct - 100%",
			userSelectedIDs: []string{"1", "2"},
			correctAnswerIDs: []string{"1", "2"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   10.0,
			expectedCorrect: true,
			expectedCorrectCount: 4,
			expectError:     false,
		},
		{
			name:            "3 correct - 50%",
			userSelectedIDs: []string{"1", "2", "3"},
			correctAnswerIDs: []string{"1", "2"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   5.0,
			expectedCorrect: false,
			expectedCorrectCount: 3,
			expectError:     false,
		},
		{
			name:            "2 correct - 25%",
			userSelectedIDs: []string{"1", "3"},
			correctAnswerIDs: []string{"1", "2"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   2.5,
			expectedCorrect: false,
			expectedCorrectCount: 2,
			expectError:     false,
		},
		{
			name:            "1 correct - 10%",
			userSelectedIDs: []string{"2", "3", "4"},
			correctAnswerIDs: []string{"1", "2"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   1.0,
			expectedCorrect: false,
			expectedCorrectCount: 1,
			expectError:     false,
		},
		{
			name:            "0 correct - 0%",
			userSelectedIDs: []string{"3", "4"},
			correctAnswerIDs: []string{"1", "2"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   0.0,
			expectedCorrect: false,
			expectedCorrectCount: 0,
			expectError:     false,
		},
		{
			name:            "Select none when none correct - 100%",
			userSelectedIDs: []string{},
			correctAnswerIDs: []string{},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   10.0,
			expectedCorrect: true,
			expectedCorrectCount: 4,
			expectError:     false,
		},
		{
			name:            "Select all when all correct - 100%",
			userSelectedIDs: []string{"1", "2", "3", "4"},
			correctAnswerIDs: []string{"1", "2", "3", "4"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   10.0,
			expectedCorrect: true,
			expectedCorrectCount: 4,
			expectError:     false,
		},
		{
			name:            "Error: Not 4 statements",
			userSelectedIDs: []string{"1"},
			correctAnswerIDs: []string{"1"},
			allAnswerIDs:    []string{"1", "2", "3"},
			maxPoints:       10.0,
			expectedScore:   0.0,
			expectedCorrect: false,
			expectError:     true,
			errorContains:   "must have exactly 4 statements",
		},
		{
			name:            "Edge case: User selects duplicate IDs",
			userSelectedIDs: []string{"1", "1", "2"},
			correctAnswerIDs: []string{"1", "2"},
			allAnswerIDs:    []string{"1", "2", "3", "4"},
			maxPoints:       10.0,
			expectedScore:   10.0,
			expectedCorrect: true,
			expectedCorrectCount: 4,
			expectError:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userAnswer := map[string]interface{}{
				"question_type": "TF",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": tt.userSelectedIDs,
					"statements": []map[string]interface{}{
						{"id": "1", "content": "Statement 1", "selected": contains(tt.userSelectedIDs, "1")},
						{"id": "2", "content": "Statement 2", "selected": contains(tt.userSelectedIDs, "2")},
						{"id": "3", "content": "Statement 3", "selected": contains(tt.userSelectedIDs, "3")},
						{"id": "4", "content": "Statement 4", "selected": contains(tt.userSelectedIDs, "4")},
					},
				},
			}

			correctAnswer := map[string]interface{}{
				"question_type": "TF",
				"correct_data": map[string]interface{}{
					"correct_answer_ids": tt.correctAnswerIDs,
					"all_answer_ids":     tt.allAnswerIDs,
				},
			}

			userAnswerBytes, err := json.Marshal(userAnswer)
			require.NoError(t, err)

			correctAnswerBytes, err := json.Marshal(correctAnswer)
			require.NoError(t, err)

			score, isCorrect, err := service.CalculateTFScore(userAnswerBytes, correctAnswerBytes, tt.maxPoints)

			if tt.expectError {
				assert.Error(t, err)
				if tt.errorContains != "" {
					assert.Contains(t, err.Error(), tt.errorContains)
				}
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedScore, score, "Score should match expected")
				assert.Equal(t, tt.expectedCorrect, isCorrect, "Correct flag should match expected")
			}
		})
	}
}

// TestCalculateTFScore_DetailedScenarios tests specific TF scoring scenarios
func TestCalculateTFScore_DetailedScenarios(t *testing.T) {
	service := NewScoringService()

	scenarios := []struct {
		name        string
		description string
		selected    []string // User selections
		correct     []string // Correct answers
		expected    float64  // Expected percentage
	}{
		{
			name:        "Scenario 1: Perfect score",
			description: "User selects exactly what's correct",
			selected:    []string{"A", "B"},
			correct:     []string{"A", "B"},
			expected:    1.0, // 100%
		},
		{
			name:        "Scenario 2: One wrong selection",
			description: "User selects one extra wrong answer",
			selected:    []string{"A", "B", "C"},
			correct:     []string{"A", "B"},
			expected:    0.5, // 50% (3 correct: A✓, B✓, D✓(not selected))
		},
		{
			name:        "Scenario 3: One missing selection",
			description: "User misses one correct answer",
			selected:    []string{"A"},
			correct:     []string{"A", "B"},
			expected:    0.5, // 50% (3 correct: A✓, C✓(not selected), D✓(not selected))
		},
		{
			name:        "Scenario 4: Half right, half wrong",
			description: "User gets 2 correct, 2 wrong",
			selected:    []string{"A", "C"},
			correct:     []string{"A", "B"},
			expected:    0.25, // 25% (2 correct: A✓, D✓(not selected))
		},
		{
			name:        "Scenario 5: Complete opposite",
			description: "User selects all wrong, misses all correct",
			selected:    []string{"C", "D"},
			correct:     []string{"A", "B"},
			expected:    0.0, // 0% (0 correct)
		},
	}

	for _, scenario := range scenarios {
		t.Run(scenario.name, func(t *testing.T) {
			allAnswers := []string{"A", "B", "C", "D"}

			userAnswer := map[string]interface{}{
				"question_type": "TF",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": scenario.selected,
				},
			}

			correctAnswer := map[string]interface{}{
				"question_type": "TF",
				"correct_data": map[string]interface{}{
					"correct_answer_ids": scenario.correct,
					"all_answer_ids":     allAnswers,
				},
			}

			userAnswerBytes, _ := json.Marshal(userAnswer)
			correctAnswerBytes, _ := json.Marshal(correctAnswer)

			score, _, err := service.CalculateTFScore(userAnswerBytes, correctAnswerBytes, 10.0)
			require.NoError(t, err, scenario.description)

			expectedScore := scenario.expected * 10.0
			assert.Equal(t, expectedScore, score, "%s: %s", scenario.name, scenario.description)
		})
	}
}

// TestCalculateSAScore tests Short Answer scoring
func TestCalculateSAScore(t *testing.T) {
	service := NewScoringService()

	tests := []struct {
		name            string
		userAnswer      string
		correctAnswers  []string
		caseSensitive   bool
		maxPoints       float64
		expectedScore   float64
		expectedCorrect bool
	}{
		{
			name:            "Exact match - case insensitive",
			userAnswer:      "Paris",
			correctAnswers:  []string{"paris", "Paris"},
			caseSensitive:   false,
			maxPoints:       5.0,
			expectedScore:   5.0,
			expectedCorrect: true,
		},
		{
			name:            "Wrong answer",
			userAnswer:      "London",
			correctAnswers:  []string{"Paris"},
			caseSensitive:   false,
			maxPoints:       5.0,
			expectedScore:   0.0,
			expectedCorrect: false,
		},
		{
			name:            "Case sensitive - correct",
			userAnswer:      "Paris",
			correctAnswers:  []string{"Paris"},
			caseSensitive:   true,
			maxPoints:       5.0,
			expectedScore:   5.0,
			expectedCorrect: true,
		},
		{
			name:            "Case sensitive - wrong case",
			userAnswer:      "paris",
			correctAnswers:  []string{"Paris"},
			caseSensitive:   true,
			maxPoints:       5.0,
			expectedScore:   0.0,
			expectedCorrect: false,
		},
		{
			name:            "Multiple acceptable answers",
			userAnswer:      "USA",
			correctAnswers:  []string{"United States", "USA", "America"},
			caseSensitive:   false,
			maxPoints:       5.0,
			expectedScore:   5.0,
			expectedCorrect: true,
		},
		{
			name:            "Trimming whitespace",
			userAnswer:      "  Paris  ",
			correctAnswers:  []string{"Paris"},
			caseSensitive:   false,
			maxPoints:       5.0,
			expectedScore:   5.0,
			expectedCorrect: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userAnswer := map[string]interface{}{
				"question_type": "SA",
				"answer_data": map[string]interface{}{
					"answer_text":     tt.userAnswer,
					"normalized_text": tt.userAnswer,
					"case_sensitive":  tt.caseSensitive,
				},
			}

			correctAnswer := map[string]interface{}{
				"question_type": "SA",
				"correct_data": map[string]interface{}{
					"correct_answers": tt.correctAnswers,
					"case_sensitive":  tt.caseSensitive,
				},
			}

			userAnswerBytes, _ := json.Marshal(userAnswer)
			correctAnswerBytes, _ := json.Marshal(correctAnswer)

			score, isCorrect, err := service.CalculateSAScore(userAnswerBytes, correctAnswerBytes, tt.maxPoints)

			assert.NoError(t, err)
			assert.Equal(t, tt.expectedScore, score)
			assert.Equal(t, tt.expectedCorrect, isCorrect)
		})
	}
}

// TestCalculateESScore tests Essay scoring (manual scoring required)
func TestCalculateESScore(t *testing.T) {
	service := NewScoringService()

	tests := []struct {
		name            string
		essayText       string
		manualScore     *float64
		maxPoints       float64
		expectedScore   float64
		expectedCorrect bool
	}{
		{
			name:            "No manual score - returns 0",
			essayText:       "This is my essay answer...",
			manualScore:     nil,
			maxPoints:       20.0,
			expectedScore:   0.0,
			expectedCorrect: false,
		},
		{
			name:            "Manual score provided",
			essayText:       "This is my essay answer...",
			manualScore:     floatPtr(15.0),
			maxPoints:       20.0,
			expectedScore:   15.0,
			expectedCorrect: true,
		},
		{
			name:            "Manual score zero",
			essayText:       "This is my essay answer...",
			manualScore:     floatPtr(0.0),
			maxPoints:       20.0,
			expectedScore:   0.0,
			expectedCorrect: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userAnswer := map[string]interface{}{
				"question_type": "ES",
				"answer_data": map[string]interface{}{
					"essay_text":      tt.essayText,
					"word_count":      50,
					"character_count": 300,
					"manual_score":    tt.manualScore,
				},
			}

			userAnswerBytes, _ := json.Marshal(userAnswer)
			correctAnswerBytes := []byte(`{}`) // ES doesn't need correct answer

			score, isCorrect, err := service.CalculateESScore(userAnswerBytes, correctAnswerBytes, tt.maxPoints)

			assert.NoError(t, err)
			assert.Equal(t, tt.expectedScore, score)
			assert.Equal(t, tt.expectedCorrect, isCorrect)
		})
	}
}

// TestScoreAnswer tests the main scoring dispatcher
func TestScoreAnswer(t *testing.T) {
	service := NewScoringService()
	ctx := context.Background()

	tests := []struct {
		name         string
		questionType string
		expectError  bool
	}{
		{
			name:         "MC type routes to MC scoring",
			questionType: "MC",
			expectError:  false,
		},
		{
			name:         "TF type routes to TF scoring",
			questionType: "TF",
			expectError:  false,
		},
		{
			name:         "SA type routes to SA scoring",
			questionType: "SA",
			expectError:  false,
		},
		{
			name:         "ES type routes to ES scoring",
			questionType: "ES",
			expectError:  false,
		},
		{
			name:         "Unknown type returns error",
			questionType: "UNKNOWN",
			expectError:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create minimal valid answers for each type
			var userAnswer, correctAnswer []byte
			var err error

			switch tt.questionType {
			case "MC":
				userAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "MC",
					"answer_data":   map[string]interface{}{"selected_answer_id": "1"},
				})
				correctAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "MC",
					"correct_data":  map[string]interface{}{"correct_answer_id": "1"},
				})
			case "TF":
				userAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "TF",
					"answer_data":   map[string]interface{}{"selected_answer_ids": []string{"1", "2"}},
				})
				correctAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "TF",
					"correct_data": map[string]interface{}{
						"correct_answer_ids": []string{"1", "2"},
						"all_answer_ids":     []string{"1", "2", "3", "4"},
					},
				})
			case "SA":
				userAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "SA",
					"answer_data": map[string]interface{}{
						"answer_text":     "test",
						"normalized_text": "test",
					},
				})
				correctAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "SA",
					"correct_data":  map[string]interface{}{"correct_answers": []string{"test"}},
				})
			case "ES":
				userAnswer, _ = json.Marshal(map[string]interface{}{
					"question_type": "ES",
					"answer_data":   map[string]interface{}{"essay_text": "test essay"},
				})
				correctAnswer = []byte(`{}`)
			default:
				userAnswer = []byte(`{}`)
				correctAnswer = []byte(`{}`)
			}

			_, _, err = service.ScoreAnswer(ctx, tt.questionType, userAnswer, correctAnswer, 10.0)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// Helper functions

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func floatPtr(f float64) *float64 {
	return &f
}
