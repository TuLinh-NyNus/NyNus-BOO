package parse_error

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/sirupsen/logrus"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/latex"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// ParseErrorMgmt manages parse errors and retry mechanisms
type ParseErrorMgmt struct {
	parseErrorRepo *repository.ParseErrorRepository
	questionRepo   *repository.QuestionRepository
	logger         *logrus.Logger
}

// NewParseErrorMgmt creates a new parse error management service
func NewParseErrorMgmt(
	parseErrorRepo *repository.ParseErrorRepository,
	questionRepo *repository.QuestionRepository,
	logger *logrus.Logger,
) *ParseErrorMgmt {
	return &ParseErrorMgmt{
		parseErrorRepo: parseErrorRepo,
		questionRepo:   questionRepo,
		logger:         logger,
	}
}

// ParseWithErrorHandling parses LaTeX content with comprehensive error handling
func (m *ParseErrorMgmt) ParseWithErrorHandling(ctx context.Context, latexContent string, creator string) (*entity.ParseResult, error) {
	// Create enhanced parser
	parser := latex.NewEnhancedLaTeXParser()

	// Parse with detailed errors
	result := parser.ParseWithDetailedErrors(latexContent)

	// If parsing was successful, create the question
	if result.Success && result.Question != nil {
		// Set creator and generate ID
		if creator != "" {
			result.Question.Creator = util.StringToPgText(creator)
		}
		result.Question.ID.Set(uuid.New().String())

		// Set status based on warnings
		if len(result.Warnings) > 0 {
			result.Question.Status = util.StringToPgText(string(entity.QuestionStatusPending))
			result.Status = entity.QuestionStatusPending
		} else {
			result.Question.Status = util.StringToPgText(string(entity.QuestionStatusActive))
			result.Status = entity.QuestionStatusActive
		}

		// Save question to database
		err := m.questionRepo.Create(ctx, result.Question)
		if err != nil {
			m.logger.WithError(err).Error("Failed to save parsed question")
			return nil, fmt.Errorf("failed to save question: %w", err)
		}

		// Save warnings as parse errors if any
		if len(result.Warnings) > 0 {
			err = m.parseErrorRepo.SaveParseErrors(ctx, result.Question.ID.String, result.Warnings)
			if err != nil {
				m.logger.WithError(err).Warn("Failed to save parse warnings")
			}
		}

		// Save parse history
		status := string(result.Status)
		lastError := ""
		if len(result.Warnings) > 0 {
			lastError = "Has warnings"
		}

		err = m.parseErrorRepo.SaveParseHistory(ctx, result.Question.ID.String, status, lastError)
		if err != nil {
			m.logger.WithError(err).Warn("Failed to save parse history")
		}

	} else {
		// Parsing failed - create a pending question with errors
		if result.Question == nil {
			// Create minimal question structure for error tracking
			result.Question = &entity.Question{
				ID:      util.StringToPgText(uuid.New().String()),
				Content: util.StringToPgText(latexContent),
				Status:  util.StringToPgText(string(entity.QuestionStatusPending)),
				Creator: util.StringToPgText(creator),
			}
		} else {
			result.Question.Status = util.StringToPgText(string(entity.QuestionStatusPending))
		}

		// Save question with pending status
		err := m.questionRepo.Create(ctx, result.Question)
		if err != nil {
			m.logger.WithError(err).Error("Failed to save pending question")
			return nil, fmt.Errorf("failed to save pending question: %w", err)
		}

		// Save parse errors
		if len(result.Errors) > 0 {
			err = m.parseErrorRepo.SaveParseErrors(ctx, result.Question.ID.String, result.Errors)
			if err != nil {
				m.logger.WithError(err).Error("Failed to save parse errors")
			}
		}

		// Save parse history
		lastError := "Parse failed"
		if len(result.Errors) > 0 {
			lastError = util.PgTextToString(result.Errors[0].Message)
		}

		err = m.parseErrorRepo.SaveParseHistory(ctx, result.Question.ID.String, string(entity.QuestionStatusPending), lastError)
		if err != nil {
			m.logger.WithError(err).Warn("Failed to save parse history")
		}
	}

	return result, nil
}

// RetryParseQuestion retries parsing for a question with errors
func (m *ParseErrorMgmt) RetryParseQuestion(ctx context.Context, questionID string) (*entity.ParseResult, error) {
	// Get existing question
	question, err := m.questionRepo.GetByID(ctx, questionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get question: %w", err)
	}

	if question == nil {
		return nil, fmt.Errorf("question not found")
	}

	// Check if question is in retryable state
	if util.PgTextToString(question.Status) != string(entity.QuestionStatusPending) {
		return nil, fmt.Errorf("question is not in pending state")
	}

	// Get parse history to check retry limits
	history, err := m.parseErrorRepo.GetParseHistory(ctx, questionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get parse history: %w", err)
	}

	maxRetries := 5
	if history != nil && history.AttemptCount.Status == pgtype.Present && int(history.AttemptCount.Int) >= maxRetries {
		return nil, fmt.Errorf("maximum retry attempts (%d) exceeded", maxRetries)
	}

	// Clear existing parse errors
	err = m.parseErrorRepo.ClearParseErrors(ctx, questionID)
	if err != nil {
		m.logger.WithError(err).Warn("Failed to clear existing parse errors")
	}

	// Retry parsing with original content
	latexContent := util.PgTextToString(question.Content)
	_ = util.PgTextToString(question.Creator) // creator not used in retry logic

	// Create enhanced parser
	parser := latex.NewEnhancedLaTeXParser()

	// Parse with detailed errors
	result := parser.ParseWithDetailedErrors(latexContent)

	// Update question based on parse result
	if result.Success && result.Question != nil {
		// Copy parsed data to existing question
		question.Type = result.Question.Type
		question.Content = result.Question.Content
		question.Solution = result.Question.Solution
		question.Difficulty = result.Question.Difficulty
		question.QuestionCodeID = result.Question.QuestionCodeID

		// Update status
		if len(result.Warnings) > 0 {
			question.Status = util.StringToPgText(string(entity.QuestionStatusPending))
			result.Status = entity.QuestionStatusPending
		} else {
			question.Status = util.StringToPgText(string(entity.QuestionStatusActive))
			result.Status = entity.QuestionStatusActive
		}

		// Update question in database
		err = m.questionRepo.Update(ctx, question)
		if err != nil {
			return nil, fmt.Errorf("failed to update question: %w", err)
		}

		result.Question = question

		// Save warnings as parse errors if any
		if len(result.Warnings) > 0 {
			err = m.parseErrorRepo.SaveParseErrors(ctx, questionID, result.Warnings)
			if err != nil {
				m.logger.WithError(err).Warn("Failed to save parse warnings")
			}
		}

	} else {
		// Still has errors - save them
		if len(result.Errors) > 0 {
			err = m.parseErrorRepo.SaveParseErrors(ctx, questionID, result.Errors)
			if err != nil {
				m.logger.WithError(err).Error("Failed to save parse errors")
			}
		}

		result.Question = question
		result.Status = entity.QuestionStatusPending
	}

	// Update parse history
	status := string(result.Status)
	lastError := ""
	if len(result.Errors) > 0 {
		lastError = util.PgTextToString(result.Errors[0].Message)
	} else if len(result.Warnings) > 0 {
		lastError = "Has warnings"
	}

	err = m.parseErrorRepo.SaveParseHistory(ctx, questionID, status, lastError)
	if err != nil {
		m.logger.WithError(err).Warn("Failed to update parse history")
	}

	return result, nil
}

// GetQuestionParseErrors retrieves parse errors for a question
func (m *ParseErrorMgmt) GetQuestionParseErrors(ctx context.Context, questionID string) ([]entity.DetailedParseError, error) {
	return m.parseErrorRepo.GetParseErrors(ctx, questionID)
}

// GetQuestionParseHistory retrieves parse history for a question
func (m *ParseErrorMgmt) GetQuestionParseHistory(ctx context.Context, questionID string) (*entity.ParseErrorHistory, error) {
	return m.parseErrorRepo.GetParseHistory(ctx, questionID)
}

// GetRetryableQuestions retrieves questions that can be retried
func (m *ParseErrorMgmt) GetRetryableQuestions(ctx context.Context, limit int) ([]string, error) {
	maxAttempts := 5
	return m.parseErrorRepo.GetRetryableQuestions(ctx, maxAttempts, limit)
}

// BatchRetryQuestions retries parsing for multiple questions
func (m *ParseErrorMgmt) BatchRetryQuestions(ctx context.Context, questionIDs []string) (map[string]*entity.ParseResult, error) {
	results := make(map[string]*entity.ParseResult)

	for _, questionID := range questionIDs {
		result, err := m.RetryParseQuestion(ctx, questionID)
		if err != nil {
			m.logger.WithError(err).WithField("question_id", questionID).Error("Failed to retry question")
			// Continue with other questions
			results[questionID] = &entity.ParseResult{
				Success: false,
				Errors: []entity.DetailedParseError{
					{
						Type:     entity.ParseErrorTypeValidation,
						Severity: entity.ParseErrorSeverityError,
						Message:  util.StringToPgText(fmt.Sprintf("Retry failed: %v", err)),
					},
				},
			}
		} else {
			results[questionID] = result
		}
	}

	return results, nil
}

// GetErrorStatistics retrieves comprehensive error statistics
func (m *ParseErrorMgmt) GetErrorStatistics(ctx context.Context) (map[string]interface{}, error) {
	return m.parseErrorRepo.GetErrorStatistics(ctx)
}

// ScheduleAutoRetry schedules automatic retry for questions with errors
func (m *ParseErrorMgmt) ScheduleAutoRetry(ctx context.Context) error {
	// Get retryable questions
	questionIDs, err := m.GetRetryableQuestions(ctx, 10) // Limit to 10 at a time
	if err != nil {
		return fmt.Errorf("failed to get retryable questions: %w", err)
	}

	if len(questionIDs) == 0 {
		m.logger.Info("No questions available for auto-retry")
		return nil
	}

	m.logger.WithField("count", len(questionIDs)).Info("Starting auto-retry for questions")

	// Retry questions in batch
	results, err := m.BatchRetryQuestions(ctx, questionIDs)
	if err != nil {
		return fmt.Errorf("failed to batch retry questions: %w", err)
	}

	// Log results
	successCount := 0
	for questionID, result := range results {
		if result.Success {
			successCount++
			m.logger.WithField("question_id", questionID).Info("Auto-retry successful")
		} else {
			m.logger.WithField("question_id", questionID).Warn("Auto-retry failed")
		}
	}

	m.logger.WithFields(logrus.Fields{
		"total":   len(questionIDs),
		"success": successCount,
		"failed":  len(questionIDs) - successCount,
	}).Info("Auto-retry batch completed")

	return nil
}
