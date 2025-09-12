package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"go.uber.org/multierr"
)

// QuestionRepositoryInterface defines the interface for question repository operations
type QuestionRepositoryInterface interface {
	Create(ctx context.Context, db database.QueryExecer, question *entity.Question) error
	GetByID(ctx context.Context, db database.QueryExecer, id string) (entity.Question, error)
	GetByQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeID string) ([]entity.Question, error)
	Update(ctx context.Context, db database.QueryExecer, question *entity.Question) error
	Delete(ctx context.Context, db database.QueryExecer, id string) error
	GetByIDForUpdate(ctx context.Context, db database.QueryExecer, id string) (entity.Question, error)
	GetQuestionsByPaging(db database.QueryExecer, offset int, limit int) (total int, questions []entity.Question, err error)
}

// QuestionRepository handles question data access following payment system pattern
type QuestionRepository struct{}

// Create creates a new question with automatic ULID generation and timestamps
func (r *QuestionRepository) Create(ctx context.Context, db database.QueryExecer, question *entity.Question) error {
	span, ctx := util.StartSpan(ctx, "QuestionRepository.Create")
	defer span.Finish()

	now := time.Now()
	if err := multierr.Combine(
		question.ID.Set(util.ULIDNow()),
		question.CreatedAt.Set(now),
		question.UpdatedAt.Set(now),
	); err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("multierr.Combine: %w", err)
	}

	cmdTag, err := database.InsertExcept(ctx, question, []string{"resource_path"}, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err insert Question: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err get RowsAffected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("err insert Question: %d RowsAffected", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// GetByID retrieves a question by ID
func (r *QuestionRepository) GetByID(ctx context.Context, db database.QueryExecer, id string) (question entity.Question, err error) {
	span, ctx := util.StartSpan(ctx, "QuestionRepository.GetByID")
	defer span.Finish()

	err = database.SelectByID(ctx, &question, id, db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return question, fmt.Errorf("err get Question by ID: %w", err)
	}

	return question, nil
}

// GetByIDForUpdate retrieves a question by ID with FOR UPDATE lock
func (r *QuestionRepository) GetByIDForUpdate(ctx context.Context, db database.QueryExecer, id string) (question entity.Question, err error) {
	span, ctx := util.StartSpan(ctx, "QuestionRepository.GetByIDForUpdate")
	defer span.Finish()

	err = database.SelectByIDForUpdate(ctx, &question, id, db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return question, fmt.Errorf("err get Question by ID for update: %w", err)
	}

	return question, nil
}

// Update updates an existing question
func (r *QuestionRepository) Update(ctx context.Context, db database.QueryExecer, question *entity.Question) error {
	span, ctx := util.StartSpan(ctx, "QuestionRepository.Update")
	defer span.Finish()

	// Set updated timestamp
	if err := question.UpdatedAt.Set(time.Now()); err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("multierr.Combine: %w", err)
	}

	// Get the ID as string for the update
	questionID := util.PgTextToString(question.ID)
	if questionID == "" {
		err := fmt.Errorf("question ID is required for update")
		span.FinishWithError(err)
		return err
	}

	cmdTag, err := database.UpdateByID(ctx, question, questionID, []string{"resource_path", "created_at"}, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err update Question: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err get RowsAffected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("err update Question: %d RowsAffected", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// Delete deletes a question by ID
func (r *QuestionRepository) Delete(ctx context.Context, db database.QueryExecer, id string) error {
	span, ctx := util.StartSpan(ctx, "QuestionRepository.Delete")
	defer span.Finish()

	template := &entity.Question{}
	cmdTag, err := database.DeleteByID(ctx, template, id, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err delete Question: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err get RowsAffected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("err delete Question: %d RowsAffected", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// GetByQuestionCode retrieves questions by question code
func (r *QuestionRepository) GetByQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeID string) ([]entity.Question, error) {
	span, ctx := util.StartSpan(ctx, "QuestionRepository.GetByQuestionCode")
	defer span.Finish()

	query := `
		SELECT id, raw_content, content, subcount, type, source, answers, correct_answer, solution,
		       tag, usage_count, creator, status, feedback, difficulty, created_at, updated_at, question_code_id
		FROM question
		WHERE question_code_id = $1 AND status = 'ACTIVE'
		ORDER BY created_at DESC
	`

	rows, err := db.QueryContext(ctx, query, questionCodeID)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("err query questions by code: %w", err)
	}
	defer rows.Close()

	var questions []entity.Question
	for rows.Next() {
		var question entity.Question
		_, values := question.FieldMap()
		if err := rows.Scan(values...); err != nil {
			span.FinishWithError(err)
			return nil, fmt.Errorf("err scan question: %w", err)
		}
		questions = append(questions, question)
	}

	if err = rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("err iterating questions: %w", err)
	}

	return questions, nil
}

// GetQuestionsByPaging retrieves questions with pagination
func (r *QuestionRepository) GetQuestionsByPaging(db database.QueryExecer, offset int, limit int) (total int, questions []entity.Question, err error) {
	ctx := context.Background()
	span, ctx := util.StartSpan(ctx, "QuestionRepository.GetQuestionsByPaging")
	defer span.Finish()

	// Get total count
	countQuery := `SELECT COUNT(*) FROM question`
	err = db.QueryRowContext(ctx, countQuery).Scan(&total)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get total count: %w", err)
	}

	// Get paginated results
	query := `
		SELECT id, raw_content, content, subcount, type, source, answers, correct_answer, solution,
		       question_code_id, created_at, updated_at
		FROM question
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to query questions: %w", err)
	}
	defer rows.Close()

	questions = []entity.Question{}
	for rows.Next() {
		var question entity.Question
		err := rows.Scan(
			&question.ID,
			&question.RawContent,
			&question.Content,
			&question.Subcount,
			&question.Type,
			&question.Source,
			&question.Answers,
			&question.CorrectAnswer,
			&question.Solution,
			&question.QuestionCodeID,
			&question.CreatedAt,
			&question.UpdatedAt,
		)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, question)
	}

	if err = rows.Err(); err != nil {
		return 0, nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return total, questions, nil
}
