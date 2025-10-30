package repository

import (
	"context"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/google/uuid"
	"go.uber.org/multierr"
)

// QuestionTagRepository handles database operations for QuestionTag
type QuestionTagRepository struct{}

// Create creates a new QuestionTag with timestamps
func (r *QuestionTagRepository) Create(ctx context.Context, db database.QueryExecer, questionTag *entity.QuestionTag) error {
	span, ctx := util.StartSpan(ctx, "QuestionTagRepository.Create")
	defer span.Finish()

	// Generate ID if not provided
	if questionTag.ID.String == "" {
		if err := questionTag.ID.Set(uuid.New().String()); err != nil {
			span.FinishWithError(err)
			return fmt.Errorf("failed to set QuestionTag ID: %w", err)
		}
	}

	now := time.Now()
	if err := questionTag.CreatedAt.Set(now); err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to set QuestionTag created_at: %w", err)
	}

	// Use InsertExcept to insert the QuestionTag
	cmdTag, err := database.InsertExcept(ctx, questionTag, []string{}, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err insert QuestionTag: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// GetByQuestionID retrieves all tags for a question
func (r *QuestionTagRepository) GetByQuestionID(ctx context.Context, db database.QueryExecer, questionID string) ([]entity.QuestionTag, error) {
	span, ctx := util.StartSpan(ctx, "QuestionTagRepository.GetByQuestionID")
	defer span.Finish()

	query := `
		SELECT id, question_id, tag_name, created_at
		FROM question_tag
		WHERE question_id = $1
		ORDER BY tag_name
	`

	rows, err := db.QueryContext(ctx, query, questionID)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to query QuestionTags: %w", err)
	}
	defer rows.Close()

	var questionTags []entity.QuestionTag
	for rows.Next() {
		var qt entity.QuestionTag
		err := rows.Scan(
			&qt.ID,
			&qt.QuestionID,
			&qt.TagName,
			&qt.CreatedAt,
		)
		if err != nil {
			span.FinishWithError(err)
			return nil, fmt.Errorf("failed to scan QuestionTag: %w", err)
		}
		questionTags = append(questionTags, qt)
	}

	if err = rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("error iterating QuestionTag rows: %w", err)
	}

	return questionTags, nil
}

// DeleteByQuestionID deletes all tags for a question
func (r *QuestionTagRepository) DeleteByQuestionID(ctx context.Context, db database.QueryExecer, questionID string) error {
	span, ctx := util.StartSpan(ctx, "QuestionTagRepository.DeleteByQuestionID")
	defer span.Finish()

	query := `DELETE FROM question_tag WHERE question_id = $1`

	cmdTag, err := db.ExecContext(ctx, query, questionID)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to delete QuestionTags: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	// Note: It's OK if no rows are affected (question had no tags)
	_ = rowsAffected

	return nil
}

// CreateMultiple creates multiple QuestionTags for a question
func (r *QuestionTagRepository) CreateMultiple(ctx context.Context, db database.QueryExecer, questionID string, tagNames []string) error {
	span, ctx := util.StartSpan(ctx, "QuestionTagRepository.CreateMultiple")
	defer span.Finish()

	if len(tagNames) == 0 {
		return nil // Nothing to create
	}

	// First, delete existing tags for this question
	if err := r.DeleteByQuestionID(ctx, db, questionID); err != nil {
		return fmt.Errorf("failed to delete existing tags: %w", err)
	}

	// Create new tags
	for _, tagName := range tagNames {
		if tagName == "" {
			continue // Skip empty tag names
		}

		questionTag := &entity.QuestionTag{}
		if err := multierr.Combine(
			questionTag.QuestionID.Set(questionID),
			questionTag.TagName.Set(tagName),
		); err != nil {
			span.FinishWithError(err)
			return fmt.Errorf("failed to set QuestionTag fields: %w", err)
		}

		if err := r.Create(ctx, db, questionTag); err != nil {
			return fmt.Errorf("failed to create QuestionTag for tag '%s': %w", tagName, err)
		}
	}

	return nil
}
