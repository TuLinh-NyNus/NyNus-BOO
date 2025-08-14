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

// QuestionCodeRepository handles database operations for QuestionCode
type QuestionCodeRepository struct{}

// Create creates a new QuestionCode with timestamps
func (r *QuestionCodeRepository) Create(ctx context.Context, db database.QueryExecer, questionCode *entity.QuestionCode) error {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.Create")
	defer span.Finish()

	now := time.Now()
	if err := multierr.Combine(
		questionCode.CreatedAt.Set(now),
		questionCode.UpdatedAt.Set(now),
	); err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to set QuestionCode fields: %w", err)
	}

	// Use InsertExcept to insert the QuestionCode
	cmdTag, err := database.InsertExcept(ctx, questionCode, []string{}, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err insert QuestionCode: %w", err)
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

// GetByID retrieves a QuestionCode by ID
func (r *QuestionCodeRepository) GetByID(ctx context.Context, db database.QueryExecer, id string) (questionCode entity.QuestionCode, err error) {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.GetByID")
	defer span.Finish()

	err = database.SelectByID(ctx, &questionCode, id, db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return questionCode, fmt.Errorf("failed to get QuestionCode by ID: %w", err)
	}

	return questionCode, nil
}

// GetByCode retrieves a QuestionCode by its code string
func (r *QuestionCodeRepository) GetByCode(ctx context.Context, db database.QueryExecer, code string) (questionCode entity.QuestionCode, err error) {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.GetByCode")
	defer span.Finish()

	query := `
		SELECT code, format, grade, subject, chapter, lesson, form, level,
		       created_at, updated_at
		FROM question_code
		WHERE code = $1
	`

	err = db.QueryRowContext(ctx, query, code).Scan(
		&questionCode.Code,
		&questionCode.Format,
		&questionCode.Grade,
		&questionCode.Subject,
		&questionCode.Chapter,
		&questionCode.Lesson,
		&questionCode.Form,
		&questionCode.Level,
		&questionCode.CreatedAt,
		&questionCode.UpdatedAt,
	)

	if err != nil {
		span.FinishWithError(err)
		return questionCode, fmt.Errorf("failed to get QuestionCode by code: %w", err)
	}

	return questionCode, nil
}

// Update updates an existing QuestionCode
func (r *QuestionCodeRepository) Update(ctx context.Context, db database.QueryExecer, questionCode *entity.QuestionCode) error {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.Update")
	defer span.Finish()

	// Set updated timestamp
	if err := questionCode.UpdatedAt.Set(time.Now()); err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to set updated timestamp: %w", err)
	}

	// Use UpdateByID with the code as the ID
	cmdTag, err := database.UpdateByID(ctx, questionCode, questionCode.Code.String, []string{"created_at"}, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err update QuestionCode: %w", err)
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

// Delete deletes a QuestionCode by ID
func (r *QuestionCodeRepository) Delete(ctx context.Context, db database.QueryExecer, id string) error {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.Delete")
	defer span.Finish()

	template := &entity.QuestionCode{}
	cmdTag, err := database.DeleteByID(ctx, template, id, db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("err delete QuestionCode: %w", err)
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

// FindByFilter finds QuestionCodes by filter criteria
func (r *QuestionCodeRepository) FindByFilter(ctx context.Context, db database.QueryExecer, filter QuestionCodeFilter) ([]entity.QuestionCode, error) {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.FindByFilter")
	defer span.Finish()

	query := `
		SELECT code, format, grade, subject, chapter, lesson, form, level,
		       created_at, updated_at
		FROM question_code
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	// Add filter conditions
	if filter.Grade != nil {
		query += fmt.Sprintf(" AND grade = $%d", argIndex)
		args = append(args, *filter.Grade)
		argIndex++
	}

	if filter.Subject != "" {
		query += fmt.Sprintf(" AND subject = $%d", argIndex)
		args = append(args, filter.Subject)
		argIndex++
	}

	if filter.Chapter != nil {
		query += fmt.Sprintf(" AND chapter = $%d", argIndex)
		args = append(args, *filter.Chapter)
		argIndex++
	}

	if filter.Level != "" {
		query += fmt.Sprintf(" AND level = $%d", argIndex)
		args = append(args, filter.Level)
		argIndex++
	}

	if filter.Lesson != nil {
		query += fmt.Sprintf(" AND lesson = $%d", argIndex)
		args = append(args, *filter.Lesson)
		argIndex++
	}

	if filter.Form != nil {
		query += fmt.Sprintf(" AND form = $%d", argIndex)
		args = append(args, *filter.Form)
		argIndex++
	}

	query += " ORDER BY grade, subject, chapter, lesson, form"

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to query QuestionCodes: %w", err)
	}
	defer rows.Close()

	var questionCodes []entity.QuestionCode
	for rows.Next() {
		var qc entity.QuestionCode
		err := rows.Scan(
			&qc.Code,
			&qc.Format,
			&qc.Grade,
			&qc.Subject,
			&qc.Chapter,
			&qc.Lesson,
			&qc.Form,
			&qc.Level,
			&qc.CreatedAt,
			&qc.UpdatedAt,
		)
		if err != nil {
			span.FinishWithError(err)
			return nil, fmt.Errorf("failed to scan QuestionCode: %w", err)
		}
		questionCodes = append(questionCodes, qc)
	}

	if err = rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("error iterating QuestionCode rows: %w", err)
	}

	return questionCodes, nil
}

// GetOrCreate gets an existing QuestionCode or creates a new one if it doesn't exist
func (r *QuestionCodeRepository) GetOrCreate(ctx context.Context, db database.QueryExecer, code string, components *util.QuestionCodeComponents) (*entity.QuestionCode, error) {
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.GetOrCreate")
	defer span.Finish()

	// Try to get existing QuestionCode
	existingQC, err := r.GetByCode(ctx, db, code)
	if err == nil {
		// QuestionCode exists, return it
		return &existingQC, nil
	}

	// QuestionCode doesn't exist, create new one
	// Determine format based on IsID6 flag
	format := "ID5"
	if components.IsID6 {
		format = "ID6"
	}

	newQC := &entity.QuestionCode{}
	if err := multierr.Combine(
		newQC.Code.Set(code),
		newQC.Format.Set(format),
		newQC.Grade.Set(components.Grade),
		newQC.Subject.Set(components.Subject),
		newQC.Chapter.Set(components.Chapter),
		newQC.Level.Set(components.Level),
		newQC.Lesson.Set(components.Lesson),
		newQC.Form.Set(components.Form),
	); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to set QuestionCode fields: %w", err)
	}

	if err := r.Create(ctx, db, newQC); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to create QuestionCode: %w", err)
	}

	return newQC, nil
}

// QuestionCodeFilter represents filter criteria for QuestionCode queries
type QuestionCodeFilter struct {
	Grade   *int32 `json:"grade"`
	Subject string `json:"subject"`
	Chapter *int32 `json:"chapter"`
	Level   string `json:"level"`
	Lesson  *int32 `json:"lesson"`
	Form    *int32 `json:"form"`
}

// GetQuestionCodesByPaging retrieves QuestionCodes with pagination
func (r *QuestionCodeRepository) GetQuestionCodesByPaging(db database.QueryExecer, offset int, limit int) (total int, questionCodes []entity.QuestionCode, err error) {
	ctx := context.Background()
	span, ctx := util.StartSpan(ctx, "QuestionCodeRepository.GetQuestionCodesByPaging")
	defer span.Finish()

	// Get total count
	countQuery := `SELECT COUNT(*) FROM question_code`
	err = db.QueryRowContext(ctx, countQuery).Scan(&total)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get total count: %w", err)
	}

	// Get paginated results
	query := `
		SELECT code, format, grade, subject, chapter, lesson, form, level,
		       created_at, updated_at
		FROM question_code
		ORDER BY grade, subject, chapter, lesson, form
		LIMIT $1 OFFSET $2
	`

	rows, err := db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to query QuestionCodes: %w", err)
	}
	defer rows.Close()

	questionCodes = []entity.QuestionCode{}
	for rows.Next() {
		var qc entity.QuestionCode
		err := rows.Scan(
			&qc.Code,
			&qc.Format,
			&qc.Grade,
			&qc.Subject,
			&qc.Chapter,
			&qc.Lesson,
			&qc.Form,
			&qc.Level,
			&qc.CreatedAt,
			&qc.UpdatedAt,
		)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to scan QuestionCode: %w", err)
		}
		questionCodes = append(questionCodes, qc)
	}

	if err = rows.Err(); err != nil {
		return 0, nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return total, questionCodes, nil
}
