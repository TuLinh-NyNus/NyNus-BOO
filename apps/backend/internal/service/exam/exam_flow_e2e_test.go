package exam

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/service/exam/scoring"
	"exam-bank-system/apps/backend/internal/service/question/validation"
)

// MockExamRepository for E2E testing
type MockE2EExamRepository struct {
	mock.Mock
	attempts map[string]*entity.ExamAttempt
	answers  map[string]*entity.ExamAnswer
	results  map[string]*entity.ExamResult
}

func NewMockE2EExamRepository() *MockE2EExamRepository {
	return &MockE2EExamRepository{
		attempts: make(map[string]*entity.ExamAttempt),
		answers:  make(map[string]*entity.ExamAnswer),
		results:  make(map[string]*entity.ExamResult),
	}
}

func (m *MockE2EExamRepository) CreateAttempt(ctx context.Context, attempt *entity.ExamAttempt) error {
	args := m.Called(ctx, attempt)
	if args.Error(0) == nil {
		m.attempts[attempt.ID] = attempt
	}
	return args.Error(0)
}

func (m *MockE2EExamRepository) GetAttempt(ctx context.Context, attemptID string) (*entity.ExamAttempt, error) {
	args := m.Called(ctx, attemptID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.ExamAttempt), args.Error(1)
}

func (m *MockE2EExamRepository) UpdateAttemptStatus(ctx context.Context, attemptID string, status entity.AttemptStatus) error {
	args := m.Called(ctx, attemptID, status)
	if args.Error(0) == nil && m.attempts[attemptID] != nil {
		m.attempts[attemptID].Status = status
	}
	return args.Error(0)
}

func (m *MockE2EExamRepository) SubmitAttempt(ctx context.Context, attemptID string, score, totalPoints int, percentage float64, passed bool) error {
	args := m.Called(ctx, attemptID, score, totalPoints, percentage, passed)
	if args.Error(0) == nil && m.attempts[attemptID] != nil {
		now := time.Now()
		m.attempts[attemptID].Score = score
		m.attempts[attemptID].TotalPoints = totalPoints
		m.attempts[attemptID].Percentage = percentage
		m.attempts[attemptID].Passed = passed
		m.attempts[attemptID].Status = entity.AttemptStatusGraded
		m.attempts[attemptID].SubmittedAt = &now
		m.attempts[attemptID].TimeSpent = int(now.Sub(m.attempts[attemptID].StartedAt).Seconds())
	}
	return args.Error(0)
}

func (m *MockE2EExamRepository) SaveAnswer(ctx context.Context, answer *entity.ExamAnswer) error {
	args := m.Called(ctx, answer)
	if args.Error(0) == nil {
		key := answer.AttemptID + ":" + answer.QuestionID
		m.answers[key] = answer
	}
	return args.Error(0)
}

func (m *MockE2EExamRepository) GetAnswers(ctx context.Context, attemptID string) ([]*entity.ExamAnswer, error) {
	args := m.Called(ctx, attemptID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.ExamAnswer), args.Error(1)
}

func (m *MockE2EExamRepository) SaveResult(ctx context.Context, result *entity.ExamResult) error {
	args := m.Called(ctx, result)
	if args.Error(0) == nil {
		m.results[result.AttemptID] = result
	}
	return args.Error(0)
}

func (m *MockE2EExamRepository) GetResult(ctx context.Context, attemptID string) (*entity.ExamResult, error) {
	args := m.Called(ctx, attemptID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.ExamResult), args.Error(1)
}

// ====================================================================================
// Test Scenario 1: Basic Exam Flow
// ====================================================================================

func TestE2E_BasicExamFlow(t *testing.T) {
	// Setup
	ctx := context.Background()
	mockRepo := NewMockE2EExamRepository()
	scoringService := scoring.NewScoringService()
	validationService := validation.NewAnswerValidationService()

	examID := "exam-001"
	userID := "user-001"
	attemptID := "attempt-001"

	// Create exam attempt
	attempt := &entity.ExamAttempt{
		ID:            attemptID,
		ExamID:        examID,
		UserID:        userID,
		AttemptNumber: 1,
		Status:        entity.AttemptStatusInProgress,
		Score:         0,
		TotalPoints:   100,
		Percentage:    0,
		Passed:        false,
		StartedAt:     time.Now(),
		SubmittedAt:   nil,
		TimeSpent:     0,
	}

	// Mock: Create attempt
	mockRepo.On("CreateAttempt", ctx, mock.AnythingOfType("*entity.ExamAttempt")).Return(nil).Once()
	
	// First GetAttempt call returns in-progress attempt
	mockRepo.On("GetAttempt", ctx, attemptID).Return(attempt, nil).Once()
	
	// Second GetAttempt call returns graded attempt (after submission)
	submittedTime := time.Now()
	gradedAttempt := &entity.ExamAttempt{
		ID:             attemptID,
		ExamID:         examID,
		UserID:         userID,
		Status:         entity.AttemptStatusGraded,
		Score:          20,
		TotalPoints:    20,
		Percentage:     100.0,
		Passed:         true,
		StartedAt:      time.Now(),
		SubmittedAt:    &submittedTime,
		TimeSpent:      0,
	}
	mockRepo.On("GetAttempt", ctx, attemptID).Return(gradedAttempt, nil).Once()

	// Step 1: Start Exam
	err := mockRepo.CreateAttempt(ctx, attempt)
	require.NoError(t, err, "Failed to create exam attempt")

	retrievedAttempt, err := mockRepo.GetAttempt(ctx, attemptID)
	require.NoError(t, err)
	assert.Equal(t, entity.AttemptStatusInProgress, retrievedAttempt.Status)
	assert.Equal(t, examID, retrievedAttempt.ExamID)
	assert.Equal(t, userID, retrievedAttempt.UserID)

	// Step 2: Submit Answers
	questions := []struct {
		questionID   string
		questionType string
		userAnswer   map[string]interface{}
		correctAnswer map[string]interface{}
		maxPoints    float64
	}{
		{
			questionID:   "550e8400-e29b-41d4-a716-446655440001",
			questionType: "MC",
			userAnswer: map[string]interface{}{
				"question_type": "MC",
				"question_id":   "550e8400-e29b-41d4-a716-446655440001",
				"answer_data": map[string]interface{}{
					"selected_answer_id": "550e8400-e29b-41d4-a716-446655440011",
					"selected_content":   "Paris",
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_id": "550e8400-e29b-41d4-a716-446655440011",
				},
			},
			maxPoints: 10,
		},
		{
			questionID:   "550e8400-e29b-41d4-a716-446655440002",
			questionType: "TF",
			userAnswer: map[string]interface{}{
				"question_type": "TF",
				"question_id":   "550e8400-e29b-41d4-a716-446655440002",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440021",
						"550e8400-e29b-41d4-a716-446655440022",
					},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440021", "content": "Statement 1", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440022", "content": "Statement 2", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440023", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440024", "content": "Statement 4", "selected": false},
					},
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440021",
						"550e8400-e29b-41d4-a716-446655440022",
					},
					"all_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440021",
						"550e8400-e29b-41d4-a716-446655440022",
						"550e8400-e29b-41d4-a716-446655440023",
						"550e8400-e29b-41d4-a716-446655440024",
					},
				},
			},
			maxPoints: 10,
		},
	}

	totalScore := 0.0
	totalPoints := 0.0

	for _, q := range questions {
		// Validate answer
		userAnswerJSON, err := json.Marshal(q.userAnswer)
		require.NoError(t, err)

		validationResult, err := validationService.ValidateAnswerData(ctx, userAnswerJSON, q.questionType)
		require.NoError(t, err)
		if !validationResult.IsValid {
			t.Logf("Validation errors for question %s: %+v", q.questionID, validationResult.Errors)
		}
		assert.True(t, validationResult.IsValid, "Answer validation failed for question %s", q.questionID)

		// Score answer
		correctAnswerJSON, err := json.Marshal(q.correctAnswer)
		require.NoError(t, err)

		score, isCorrect, err := scoringService.ScoreAnswer(ctx, q.questionType, userAnswerJSON, correctAnswerJSON, q.maxPoints)
		require.NoError(t, err)

		// Save answer
		answer := &entity.ExamAnswer{
			ID:               "ans-" + q.questionID,
			AttemptID:        attemptID,
			QuestionID:       q.questionID,
			AnswerData:       string(userAnswerJSON),
			IsCorrect:        &isCorrect,
			PointsEarned:     score,
			TimeSpentSeconds: nil,
			AnsweredAt:       time.Now(),
		}

		mockRepo.On("SaveAnswer", ctx, mock.AnythingOfType("*entity.ExamAnswer")).Return(nil).Once()
		err = mockRepo.SaveAnswer(ctx, answer)
		require.NoError(t, err)

		totalScore += score
		totalPoints += q.maxPoints
	}

	// Step 3: Submit Exam and Calculate Final Score
	percentage := (totalScore / totalPoints) * 100
	passed := percentage >= 60.0

	mockRepo.On("SubmitAttempt", ctx, attemptID, int(totalScore), int(totalPoints), percentage, passed).Return(nil).Once()
	err = mockRepo.SubmitAttempt(ctx, attemptID, int(totalScore), int(totalPoints), percentage, passed)
	require.NoError(t, err)

	// Step 4: Verify Results
	finalAttempt, err := mockRepo.GetAttempt(ctx, attemptID)
	require.NoError(t, err)
	assert.Equal(t, entity.AttemptStatusGraded, finalAttempt.Status)
	assert.Equal(t, int(totalScore), finalAttempt.Score)
	assert.Equal(t, int(totalPoints), finalAttempt.TotalPoints)
	assert.Equal(t, percentage, finalAttempt.Percentage)
	assert.Equal(t, passed, finalAttempt.Passed)
	assert.NotNil(t, finalAttempt.SubmittedAt)

	// Step 5: Save and Retrieve Results
	result := &entity.ExamResult{
		ID:                 "result-001",
		AttemptID:          attemptID,
		TotalQuestions:     len(questions),
		CorrectAnswers:     2, // Both MC and TF are correct
		IncorrectAnswers:   0,
		Unanswered:         0,
		AccuracyPercentage: &percentage,
		CreatedAt:          time.Now(),
	}

	mockRepo.On("SaveResult", ctx, mock.AnythingOfType("*entity.ExamResult")).Return(nil).Once()
	err = mockRepo.SaveResult(ctx, result)
	require.NoError(t, err)

	mockRepo.On("GetResult", ctx, attemptID).Return(result, nil).Once()
	retrievedResult, err := mockRepo.GetResult(ctx, attemptID)
	require.NoError(t, err)
	assert.Equal(t, 2, retrievedResult.TotalQuestions)
	assert.Equal(t, 2, retrievedResult.CorrectAnswers)
	assert.Equal(t, 0, retrievedResult.IncorrectAnswers)

	mockRepo.AssertExpectations(t)
}

// ====================================================================================
// Test Scenario 2: TF Scoring Flow with 4-Statement Requirement
// ====================================================================================

func TestE2E_TFScoringFlow(t *testing.T) {
	ctx := context.Background()
	scoringService := scoring.NewScoringService()
	validationService := validation.NewAnswerValidationService()

	testCases := []struct {
		name              string
		userAnswer        map[string]interface{}
		correctAnswer     map[string]interface{}
		maxPoints         float64
		expectedScore     float64
		expectedIsCorrect bool
		shouldValidate    bool
	}{
		{
			name: "All 4 statements correct - 100%",
			userAnswer: map[string]interface{}{
				"question_type": "TF",
				"question_id":   "550e8400-e29b-41d4-a716-446655440101",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440111",
						"550e8400-e29b-41d4-a716-446655440112",
					},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440111", "content": "Statement 1", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440112", "content": "Statement 2", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440113", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440114", "content": "Statement 4", "selected": false},
					},
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440111",
						"550e8400-e29b-41d4-a716-446655440112",
					},
					"all_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440111",
						"550e8400-e29b-41d4-a716-446655440112",
						"550e8400-e29b-41d4-a716-446655440113",
						"550e8400-e29b-41d4-a716-446655440114",
					},
				},
			},
			maxPoints:         10,
			expectedScore:     10,
			expectedIsCorrect: true,
			shouldValidate:    true,
		},
		{
			name: "3 out of 4 correct - 50%",
			userAnswer: map[string]interface{}{
				"question_type": "TF",
				"question_id":   "550e8400-e29b-41d4-a716-446655440201",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{"550e8400-e29b-41d4-a716-446655440211", "550e8400-e29b-41d4-a716-446655440212", "550e8400-e29b-41d4-a716-446655440213"},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440211", "content": "Statement 1", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440212", "content": "Statement 2", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440213", "content": "Statement 3", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440214", "content": "Statement 4", "selected": false},
					},
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440211",
						"550e8400-e29b-41d4-a716-446655440212",
					},
					"all_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440211",
						"550e8400-e29b-41d4-a716-446655440212",
						"550e8400-e29b-41d4-a716-446655440213",
						"550e8400-e29b-41d4-a716-446655440214",
					},
				},
			},
			maxPoints:         10,
			expectedScore:     5,
			expectedIsCorrect: false,
			shouldValidate:    true,
		},
		{
			name: "2 out of 4 correct - 25%",
			userAnswer: map[string]interface{}{
				"question_type": "TF",
				"question_id":   "550e8400-e29b-41d4-a716-446655440301",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440311",
						"550e8400-e29b-41d4-a716-446655440313",
					},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440311", "content": "Statement 1", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440312", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440313", "content": "Statement 3", "selected": true},
						{"id": "550e8400-e29b-41d4-a716-446655440314", "content": "Statement 4", "selected": false},
					},
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440311",
						"550e8400-e29b-41d4-a716-446655440312",
					},
					"all_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440311",
						"550e8400-e29b-41d4-a716-446655440312",
						"550e8400-e29b-41d4-a716-446655440313",
						"550e8400-e29b-41d4-a716-446655440314",
					},
				},
			},
			maxPoints:         10,
			expectedScore:     2.5,
			expectedIsCorrect: false,
			shouldValidate:    true,
		},
		{
			name: "1 out of 4 correct - 10%",
			userAnswer: map[string]interface{}{
				"question_type": "TF",
				"question_id":   "550e8400-e29b-41d4-a716-446655440401",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440411", "content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440412", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440413", "content": "Statement 3", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440414", "content": "Statement 4", "selected": false},
					},
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440412",
						"550e8400-e29b-41d4-a716-446655440413",
						"550e8400-e29b-41d4-a716-446655440414",
					},
					"all_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440411",
						"550e8400-e29b-41d4-a716-446655440412",
						"550e8400-e29b-41d4-a716-446655440413",
						"550e8400-e29b-41d4-a716-446655440414",
					},
				},
			},
			maxPoints:         10,
			expectedScore:     1,
			expectedIsCorrect: false,
			shouldValidate:    true,
		},
		{
			name: "Only 3 statements (invalid) - should fail validation",
			userAnswer: map[string]interface{}{
				"question_type": "TF",
				"question_id":   "550e8400-e29b-41d4-a716-446655440501",
				"answer_data": map[string]interface{}{
					"selected_answer_ids": []string{},
					"statements": []map[string]interface{}{
						{"id": "550e8400-e29b-41d4-a716-446655440511", "content": "Statement 1", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440512", "content": "Statement 2", "selected": false},
						{"id": "550e8400-e29b-41d4-a716-446655440513", "content": "Statement 3", "selected": false},
					},
				},
			},
			correctAnswer: map[string]interface{}{
				"correct_data": map[string]interface{}{
					"correct_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440512",
					},
					"all_answer_ids": []string{
						"550e8400-e29b-41d4-a716-446655440511",
						"550e8400-e29b-41d4-a716-446655440512",
						"550e8400-e29b-41d4-a716-446655440513",
					},
				},
			},
			maxPoints:      10,
			shouldValidate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Validate answer structure
			userAnswerJSON, err := json.Marshal(tc.userAnswer)
			require.NoError(t, err)

			validationResult, err := validationService.ValidateAnswerData(ctx, userAnswerJSON, "TF")
			require.NoError(t, err)

			if !validationResult.IsValid {
				t.Logf("Validation errors for %s: %+v", tc.name, validationResult.Errors)
			}

			if tc.shouldValidate {
				assert.True(t, validationResult.IsValid, "Answer should be valid")

				// Score answer
				correctAnswerJSON, err := json.Marshal(tc.correctAnswer)
				require.NoError(t, err)

				score, isCorrect, err := scoringService.ScoreAnswer(ctx, "TF", userAnswerJSON, correctAnswerJSON, tc.maxPoints)
				require.NoError(t, err)

				assert.Equal(t, tc.expectedScore, score, "Score mismatch")
				assert.Equal(t, tc.expectedIsCorrect, isCorrect, "IsCorrect mismatch")
			} else {
				assert.False(t, validationResult.IsValid, "Answer should be invalid (not 4 statements)")
			}
		})
	}
}

// ====================================================================================
// Additional test scenarios will be added in subsequent commits
// ====================================================================================

