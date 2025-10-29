package scoring

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	examInterfaces "exam-bank-system/apps/backend/internal/repository/interfaces"
	questionInterfaces "exam-bank-system/apps/backend/internal/repository/interfaces"
)

// AutoGradingService handles automatic exam grading
type AutoGradingService struct {
	scoringService *ScoringService
	examRepo       examInterfaces.ExamRepository
	questionRepo   questionInterfaces.QuestionRepository
}

// NewAutoGradingService creates a new auto grading service
func NewAutoGradingService(
	scoringService *ScoringService,
	examRepo examInterfaces.ExamRepository,
	questionRepo questionInterfaces.QuestionRepository,
) *AutoGradingService {
	return &AutoGradingService{
		scoringService: scoringService,
		examRepo:       examRepo,
		questionRepo:   questionRepo,
	}
}

// ExamGradingResult represents the result of exam grading
type ExamGradingResult struct {
	AttemptID           string                  `json:"attempt_id"`
	TotalScore          float64                 `json:"total_score"`
	MaxPossibleScore    float64                 `json:"max_possible_score"`
	Percentage          float64                 `json:"percentage"`
	Passed              bool                    `json:"passed"`
	CorrectAnswers      int                     `json:"correct_answers"`
	IncorrectAnswers    int                     `json:"incorrect_answers"`
	UnansweredQuestions int                     `json:"unanswered_questions"`
	QuestionResults     []QuestionGradingResult `json:"question_results"`
	GradedAt            time.Time               `json:"graded_at"`
}

// QuestionGradingResult represents the result of grading a single question
type QuestionGradingResult struct {
	QuestionID   string  `json:"question_id"`
	QuestionType string  `json:"question_type"`
	MaxPoints    float64 `json:"max_points"`
	PointsEarned float64 `json:"points_earned"`
	IsCorrect    bool    `json:"is_correct"`
	IsAnswered   bool    `json:"is_answered"`
	ErrorMessage string  `json:"error_message,omitempty"`
}

// AutoGradeExam automatically grades an exam attempt
func (s *AutoGradingService) AutoGradeExam(ctx context.Context, attemptID string) (*ExamGradingResult, error) {
	// Get exam attempt
	attempt, err := s.examRepo.GetAttempt(ctx, attemptID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam attempt: %w", err)
	}

	// Get exam details
	exam, err := s.examRepo.GetByID(ctx, attempt.ExamID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam: %w", err)
	}

	// Get all answers for this attempt
	answers, err := s.examRepo.GetAnswers(ctx, attemptID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam answers: %w", err)
	}

	// Get exam questions with points
	examQuestions, err := s.examRepo.GetQuestions(ctx, attempt.ExamID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam questions: %w", err)
	}

	// Create maps for efficient lookup
	answerMap := make(map[string]*entity.ExamAnswer)
	for _, answer := range answers {
		answerMap[answer.QuestionID] = answer
	}

	questionPointsMap := make(map[string]float64)
	for _, eq := range examQuestions {
		questionPointsMap[eq.QuestionID] = float64(eq.Points)
	}

	// Initialize grading result
	result := &ExamGradingResult{
		AttemptID:       attemptID,
		QuestionResults: make([]QuestionGradingResult, 0, len(examQuestions)),
		GradedAt:        time.Now(),
	}

	var totalScore float64
	var maxPossibleScore float64
	var correctCount int
	var incorrectCount int
	var unansweredCount int

	// Grade each question
	for _, examQuestion := range examQuestions {
		questionID := examQuestion.QuestionID
		maxPoints := float64(examQuestion.Points)
		maxPossibleScore += maxPoints

		// Skip bonus questions from total calculation
		if examQuestion.IsBonus {
			maxPossibleScore -= maxPoints
		}

		questionResult := QuestionGradingResult{
			QuestionID:   questionID,
			MaxPoints:    maxPoints,
			PointsEarned: 0,
			IsCorrect:    false,
			IsAnswered:   false,
		}

		// Check if question was answered
		answer, hasAnswer := answerMap[questionID]
		if !hasAnswer || answer.AnswerData == "" {
			// Question not answered
			unansweredCount++
			questionResult.IsAnswered = false
			result.QuestionResults = append(result.QuestionResults, questionResult)
			continue
		}

		questionResult.IsAnswered = true

		// Get question details for correct answer
		question, err := s.questionRepo.GetByID(ctx, questionID)
		if err != nil {
			questionResult.ErrorMessage = fmt.Sprintf("Failed to get question: %v", err)
			incorrectCount++
			result.QuestionResults = append(result.QuestionResults, questionResult)
			continue
		}

		questionResult.QuestionType = question.Type.String

		// Score the answer
		pointsEarned, isCorrect, err := s.scoringService.ScoreAnswer(
			ctx,
			question.Type.String,
			[]byte(answer.AnswerData),
			question.CorrectAnswer.Bytes,
			maxPoints,
		)

		if err != nil {
			questionResult.ErrorMessage = fmt.Sprintf("Scoring error: %v", err)
			incorrectCount++
			result.QuestionResults = append(result.QuestionResults, questionResult)
			continue
		}

		questionResult.PointsEarned = pointsEarned
		questionResult.IsCorrect = isCorrect

		// Update answer in database
		answer.IsCorrect = &isCorrect
		answer.PointsEarned = pointsEarned
		err = s.examRepo.UpdateAnswer(ctx, answer)
		if err != nil {
			questionResult.ErrorMessage = fmt.Sprintf("Failed to update answer: %v", err)
		}

		// Update totals
		totalScore += pointsEarned
		if isCorrect {
			correctCount++
		} else {
			incorrectCount++
		}

		result.QuestionResults = append(result.QuestionResults, questionResult)
	}

	// Calculate final results
	result.TotalScore = totalScore
	result.MaxPossibleScore = maxPossibleScore
	result.CorrectAnswers = correctCount
	result.IncorrectAnswers = incorrectCount
	result.UnansweredQuestions = unansweredCount

	// Calculate percentage
	if maxPossibleScore > 0 {
		result.Percentage = (totalScore / maxPossibleScore) * 100
	} else {
		result.Percentage = 0
	}

	// Determine if passed
	result.Passed = result.Percentage >= float64(exam.PassPercentage)

	// Update exam attempt with final results
	err = s.examRepo.SubmitAttempt(
		ctx,
		attemptID,
		int(totalScore),
		int(maxPossibleScore),
		result.Percentage,
		result.Passed,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update exam attempt: %w", err)
	}

	// Create exam result record
	examResult := &entity.ExamResult{
		AttemptID:        attemptID,
		TotalQuestions:   len(examQuestions),
		CorrectAnswers:   correctCount,
		IncorrectAnswers: incorrectCount,
		Unanswered:       unansweredCount,
		CreatedAt:        time.Now(),
	}

	err = s.examRepo.SaveResult(ctx, examResult)
	if err != nil {
		return nil, fmt.Errorf("failed to save exam result: %w", err)
	}

	return result, nil
}

// GradeSpecificQuestions grades only specific questions in an attempt
func (s *AutoGradingService) GradeSpecificQuestions(ctx context.Context, attemptID string, questionIDs []string) ([]QuestionGradingResult, error) {
	results := make([]QuestionGradingResult, 0, len(questionIDs))

	for _, questionID := range questionIDs {
		// Get answer
		answer, err := s.examRepo.GetAnswer(ctx, attemptID, questionID)
		if err != nil {
			if err == sql.ErrNoRows {
				// Question not answered
				results = append(results, QuestionGradingResult{
					QuestionID: questionID,
					IsAnswered: false,
				})
				continue
			}
			return nil, fmt.Errorf("failed to get answer for question %s: %w", questionID, err)
		}

		// Get question details
		question, err := s.questionRepo.GetByID(ctx, questionID)
		if err != nil {
			return nil, fmt.Errorf("failed to get question %s: %w", questionID, err)
		}

		// Get exam ID from attempt
		attempt, err := s.examRepo.GetAttempt(ctx, attemptID)
		if err != nil {
			return nil, fmt.Errorf("failed to get attempt: %w", err)
		}

		// Get exam questions to find points
		examQuestions, err := s.examRepo.GetQuestions(ctx, attempt.ExamID)
		if err != nil {
			return nil, fmt.Errorf("failed to get exam questions: %w", err)
		}

		// Find the specific question
		var examQuestion *entity.ExamQuestion
		for _, eq := range examQuestions {
			if eq.QuestionID == questionID {
				examQuestion = eq
				break
			}
		}

		if examQuestion == nil {
			return nil, fmt.Errorf("question %s not found in exam", questionID)
		}

		maxPoints := float64(examQuestion.Points)

		// Score the answer
		pointsEarned, isCorrect, err := s.scoringService.ScoreAnswer(
			ctx,
			question.Type.String,
			[]byte(answer.AnswerData),
			question.CorrectAnswer.Bytes,
			maxPoints,
		)

		if err != nil {
			results = append(results, QuestionGradingResult{
				QuestionID:   questionID,
				QuestionType: question.Type.String,
				MaxPoints:    maxPoints,
				IsAnswered:   true,
				ErrorMessage: fmt.Sprintf("Scoring error: %v", err),
			})
			continue
		}

		// Update answer in database
		answer.IsCorrect = &isCorrect
		answer.PointsEarned = pointsEarned
		err = s.examRepo.UpdateAnswer(ctx, answer)
		if err != nil {
			return nil, fmt.Errorf("failed to update answer for question %s: %w", questionID, err)
		}

		results = append(results, QuestionGradingResult{
			QuestionID:   questionID,
			QuestionType: question.Type.String,
			MaxPoints:    maxPoints,
			PointsEarned: pointsEarned,
			IsCorrect:    isCorrect,
			IsAnswered:   true,
		})
	}

	return results, nil
}

// ReGradeExam re-grades an already submitted exam (useful for manual corrections)
func (s *AutoGradingService) ReGradeExam(ctx context.Context, attemptID string) (*ExamGradingResult, error) {
	// Check if attempt exists and is submitted
	attempt, err := s.examRepo.GetAttempt(ctx, attemptID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam attempt: %w", err)
	}

	if attempt.Status != entity.AttemptStatusSubmitted {
		return nil, fmt.Errorf("can only re-grade submitted attempts, current status: %s", attempt.Status)
	}

	// Re-grade using the same logic as AutoGradeExam
	return s.AutoGradeExam(ctx, attemptID)
}

