package performance

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// OptimisticLockingService handles optimistic locking operations
type OptimisticLockingService struct {
	db *sql.DB
}

// NewOptimisticLockingService creates a new optimistic locking service
func NewOptimisticLockingService(db *sql.DB) *OptimisticLockingService {
	return &OptimisticLockingService{
		db: db,
	}
}

// UpdateResult represents the result of an optimistic update
type UpdateResult struct {
	Success      bool   `json:"success"`
	NewVersion   int    `json:"new_version"`
	ErrorMessage string `json:"error_message,omitempty"`
}

// ExamUpdateData represents data for exam update
type ExamUpdateData struct {
	ID              string `json:"id"`
	CurrentVersion  int    `json:"current_version"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationMinutes int    `json:"duration_minutes"`
	TotalPoints     int    `json:"total_points"`
}

// QuestionUpdateData represents data for question update
type QuestionUpdateData struct {
	ID             string `json:"id"`
	CurrentVersion int    `json:"current_version"`
	Content        string `json:"content"`
	Type           string `json:"type"`
	Difficulty     string `json:"difficulty"`
}

// UpdateExamWithOptimisticLocking updates an exam using optimistic locking
func (s *OptimisticLockingService) UpdateExamWithOptimisticLocking(ctx context.Context, data *ExamUpdateData) (*UpdateResult, error) {
	query := `
		SELECT success, new_version, error_message 
		FROM update_exam_with_version_check($1, $2, $3, $4, $5, $6)
	`

	var result UpdateResult
	err := s.db.QueryRowContext(
		ctx,
		query,
		data.ID,
		data.CurrentVersion,
		data.Title,
		data.Description,
		data.DurationMinutes,
		data.TotalPoints,
	).Scan(&result.Success, &result.NewVersion, &result.ErrorMessage)

	if err != nil {
		return nil, fmt.Errorf("failed to update exam with optimistic locking: %w", err)
	}

	return &result, nil
}

// UpdateQuestionWithOptimisticLocking updates a question using optimistic locking
func (s *OptimisticLockingService) UpdateQuestionWithOptimisticLocking(ctx context.Context, data *QuestionUpdateData) (*UpdateResult, error) {
	query := `
		SELECT success, new_version, error_message 
		FROM update_question_with_version_check($1, $2, $3, $4, $5)
	`

	var result UpdateResult
	err := s.db.QueryRowContext(
		ctx,
		query,
		data.ID,
		data.CurrentVersion,
		data.Content,
		data.Type,
		data.Difficulty,
	).Scan(&result.Success, &result.NewVersion, &result.ErrorMessage)

	if err != nil {
		return nil, fmt.Errorf("failed to update question with optimistic locking: %w", err)
	}

	return &result, nil
}

// GetExamVersion gets the current version of an exam
func (s *OptimisticLockingService) GetExamVersion(ctx context.Context, examID string) (int, error) {
	query := `SELECT version FROM exams WHERE id = $1`

	var version int
	err := s.db.QueryRowContext(ctx, query, examID).Scan(&version)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("exam not found: %s", examID)
		}
		return 0, fmt.Errorf("failed to get exam version: %w", err)
	}

	return version, nil
}

// GetQuestionVersion gets the current version of a question
func (s *OptimisticLockingService) GetQuestionVersion(ctx context.Context, questionID string) (int, error) {
	query := `SELECT version FROM questions WHERE id = $1`

	var version int
	err := s.db.QueryRowContext(ctx, query, questionID).Scan(&version)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("question not found: %s", questionID)
		}
		return 0, fmt.Errorf("failed to get question version: %w", err)
	}

	return version, nil
}

// ValidateExamVersion validates that the provided version matches the current version
func (s *OptimisticLockingService) ValidateExamVersion(ctx context.Context, examID string, expectedVersion int) error {
	currentVersion, err := s.GetExamVersion(ctx, examID)
	if err != nil {
		return err
	}

	if currentVersion != expectedVersion {
		return fmt.Errorf("version conflict: expected %d, current %d", expectedVersion, currentVersion)
	}

	return nil
}

// ValidateQuestionVersion validates that the provided version matches the current version
func (s *OptimisticLockingService) ValidateQuestionVersion(ctx context.Context, questionID string, expectedVersion int) error {
	currentVersion, err := s.GetQuestionVersion(ctx, questionID)
	if err != nil {
		return err
	}

	if currentVersion != expectedVersion {
		return fmt.Errorf("version conflict: expected %d, current %d", expectedVersion, currentVersion)
	}

	return nil
}

// ConflictError represents a version conflict error
type ConflictError struct {
	EntityType      string `json:"entity_type"`
	EntityID        string `json:"entity_id"`
	ExpectedVersion int    `json:"expected_version"`
	CurrentVersion  int    `json:"current_version"`
	Message         string `json:"message"`
}

func (e *ConflictError) Error() string {
	return fmt.Sprintf("optimistic locking conflict for %s %s: expected version %d, current version %d - %s",
		e.EntityType, e.EntityID, e.ExpectedVersion, e.CurrentVersion, e.Message)
}

// NewConflictError creates a new conflict error
func NewConflictError(entityType, entityID string, expectedVersion, currentVersion int, message string) *ConflictError {
	return &ConflictError{
		EntityType:      entityType,
		EntityID:        entityID,
		ExpectedVersion: expectedVersion,
		CurrentVersion:  currentVersion,
		Message:         message,
	}
}

// IsConflictError checks if an error is a conflict error
func IsConflictError(err error) bool {
	_, ok := err.(*ConflictError)
	return ok
}

// RetryableUpdate represents a function that can be retried on conflict
type RetryableUpdate func(ctx context.Context, currentVersion int) (*UpdateResult, error)

// RetryOnConflict retries an update operation on version conflicts
func (s *OptimisticLockingService) RetryOnConflict(
	ctx context.Context,
	entityType, entityID string,
	maxRetries int,
	updateFunc RetryableUpdate,
) (*UpdateResult, error) {
	var lastResult *UpdateResult
	var lastError error

	for attempt := 0; attempt <= maxRetries; attempt++ {
		// Get current version
		var currentVersion int
		var err error

		switch entityType {
		case "exam":
			currentVersion, err = s.GetExamVersion(ctx, entityID)
		case "question":
			currentVersion, err = s.GetQuestionVersion(ctx, entityID)
		default:
			return nil, fmt.Errorf("unsupported entity type: %s", entityType)
		}

		if err != nil {
			return nil, fmt.Errorf("failed to get current version: %w", err)
		}

		// Attempt update
		result, err := updateFunc(ctx, currentVersion)
		if err != nil {
			lastError = err
			continue
		}

		// If successful, return result
		if result.Success {
			return result, nil
		}

		// If not successful due to conflict, retry
		lastResult = result
		lastError = NewConflictError(entityType, entityID, currentVersion, result.NewVersion, result.ErrorMessage)

		// Add exponential backoff
		if attempt < maxRetries {
			backoffDuration := time.Duration(attempt+1) * 100 * time.Millisecond
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(backoffDuration):
				// Continue to next attempt
			}
		}
	}

	// All retries exhausted
	if lastResult != nil {
		return lastResult, lastError
	}

	return nil, fmt.Errorf("failed to update after %d retries: %w", maxRetries, lastError)
}
