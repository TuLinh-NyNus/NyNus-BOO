package scoring

import (
	"context"
)

// ScoringServiceInterface defines the contract for scoring operations
type ScoringServiceInterface interface {
	// Score individual answers by question type
	CalculateMCScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error)
	CalculateTFScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error)
	CalculateSAScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error)
	CalculateESScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error)
	
	// Generic scoring method
	ScoreAnswer(ctx context.Context, questionType string, userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error)
}

// AutoGradingServiceInterface defines the contract for auto-grading operations
type AutoGradingServiceInterface interface {
	// Auto-grade entire exam attempt
	AutoGradeExam(ctx context.Context, attemptID string) (*ExamGradingResult, error)
	
	// Grade specific questions only
	GradeSpecificQuestions(ctx context.Context, attemptID string, questionIDs []string) ([]QuestionGradingResult, error)
	
	// Re-grade already submitted exam
	ReGradeExam(ctx context.Context, attemptID string) (*ExamGradingResult, error)
}
