package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/jackc/pgtype"
	"github.com/lib/pq"
)

// QuestionCodeRepository implements the QuestionCodeRepository interface
type QuestionCodeRepository struct {
	db *sql.DB
}

// NewQuestionCodeRepository creates a new question code repository
func NewQuestionCodeRepository(db *sql.DB) interfaces.QuestionCodeRepository {
	return &QuestionCodeRepository{db: db}
}

// Create creates a new question code
func (r *QuestionCodeRepository) Create(ctx context.Context, code *entity.QuestionCode) error {
	query := `
		INSERT INTO questioncode (
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`

	// Ensure Code is set (it's the primary key)
	if code.Code.Status != pgtype.Present || code.Code.String == "" {
		return fmt.Errorf("question code is required")
	}

	// Set timestamps
	now := time.Now()
	code.CreatedAt.Set(now)
	code.UpdatedAt.Set(now)

	_, err := r.db.ExecContext(ctx, query,
		code.Code.String,
		code.Format.String,
		code.Grade.String,
		code.Subject.String,
		code.Chapter.String,
		code.Lesson.String,
		nullableStringToSQL(code.Form),
		code.Level.String,
		code.CreatedAt.Time,
		code.UpdatedAt.Time,
	)

	return err
}

// GetByID retrieves a question code by ID
func (r *QuestionCodeRepository) GetByID(ctx context.Context, id string) (*entity.QuestionCode, error) {
	return r.GetByCode(ctx, id) // ID and Code are the same for QuestionCode
}

// GetByCode retrieves a question code by code
func (r *QuestionCodeRepository) GetByCode(ctx context.Context, code string) (*entity.QuestionCode, error) {
	query := `
		SELECT 
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		FROM questioncode
		WHERE code = $1
	`

	var qc entity.QuestionCode
	var form sql.NullString

	err := r.db.QueryRowContext(ctx, query, code).Scan(
		&qc.Code.String,
		&qc.Format.String,
		&qc.Grade.String,
		&qc.Subject.String,
		&qc.Chapter.String,
		&qc.Lesson.String,
		&form,
		&qc.Level.String,
		&qc.CreatedAt.Time,
		&qc.UpdatedAt.Time,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("question code not found")
		}
		return nil, err
	}

	// Set statuses
	qc.Code.Status = pgtype.Present
	qc.Format.Status = pgtype.Present
	qc.Grade.Status = pgtype.Present
	qc.Subject.Status = pgtype.Present
	qc.Chapter.Status = pgtype.Present
	qc.Lesson.Status = pgtype.Present
	qc.Level.Status = pgtype.Present
	qc.CreatedAt.Status = pgtype.Present
	qc.UpdatedAt.Status = pgtype.Present

	if form.Valid {
		qc.Form.Set(form.String)
	}

	return &qc, nil
}

// Update updates an existing question code
func (r *QuestionCodeRepository) Update(ctx context.Context, code *entity.QuestionCode) error {
	query := `
		UPDATE questioncode SET
			format = $2,
			grade = $3,
			subject = $4,
			chapter = $5,
			lesson = $6,
			form = $7,
			level = $8,
			updated_at = $9
		WHERE code = $1
	`

	code.UpdatedAt.Set(time.Now())

	_, err := r.db.ExecContext(ctx, query,
		code.Code.String,
		code.Format.String,
		code.Grade.String,
		code.Subject.String,
		code.Chapter.String,
		code.Lesson.String,
		nullableStringToSQL(code.Form),
		code.Level.String,
		code.UpdatedAt.Time,
	)

	return err
}

// Delete deletes a question code
func (r *QuestionCodeRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM questioncode WHERE code = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateBatch creates multiple question codes
func (r *QuestionCodeRepository) CreateBatch(ctx context.Context, codes []*entity.QuestionCode) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO questioncode (
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	now := time.Now()
	for _, qc := range codes {
		// Set timestamps
		qc.CreatedAt.Set(now)
		qc.UpdatedAt.Set(now)

		_, err := stmt.ExecContext(ctx,
			qc.Code.String,
			qc.Format.String,
			qc.Grade.String,
			qc.Subject.String,
			qc.Chapter.String,
			qc.Lesson.String,
			nullableStringToSQL(qc.Form),
			qc.Level.String,
			qc.CreatedAt.Time,
			qc.UpdatedAt.Time,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetByIDs retrieves multiple question codes by IDs
func (r *QuestionCodeRepository) GetByIDs(ctx context.Context, ids []string) ([]*entity.QuestionCode, error) {
	if len(ids) == 0 {
		return []*entity.QuestionCode{}, nil
	}

	query := `
		SELECT 
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		FROM questioncode
		WHERE code = ANY($1)
	`

	rows, err := r.db.QueryContext(ctx, query, pq.Array(ids))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestionCodes(rows)
}

// GetAll retrieves all question codes with pagination
func (r *QuestionCodeRepository) GetAll(ctx context.Context, offset, limit int) ([]*entity.QuestionCode, error) {
	query := `
		SELECT 
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		FROM questioncode
		ORDER BY code
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestionCodes(rows)
}

// Count returns the total number of question codes
func (r *QuestionCodeRepository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM questioncode`
	var count int
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	return count, err
}

// FindByGrade finds question codes by grade
func (r *QuestionCodeRepository) FindByGrade(ctx context.Context, grade string) ([]*entity.QuestionCode, error) {
	query := `
		SELECT 
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		FROM questioncode
		WHERE grade = $1
		ORDER BY code
	`

	rows, err := r.db.QueryContext(ctx, query, grade)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestionCodes(rows)
}

// FindBySubject finds question codes by subject
func (r *QuestionCodeRepository) FindBySubject(ctx context.Context, subject string) ([]*entity.QuestionCode, error) {
	query := `
		SELECT 
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		FROM questioncode
		WHERE subject = $1
		ORDER BY code
	`

	rows, err := r.db.QueryContext(ctx, query, subject)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestionCodes(rows)
}

// FindByGradeAndSubject finds question codes by grade and subject
func (r *QuestionCodeRepository) FindByGradeAndSubject(ctx context.Context, grade, subject string) ([]*entity.QuestionCode, error) {
	query := `
		SELECT 
			code, format, grade, subject, chapter, lesson, form, level,
			created_at, updated_at
		FROM questioncode
		WHERE grade = $1 AND subject = $2
		ORDER BY code
	`

	rows, err := r.db.QueryContext(ctx, query, grade, subject)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestionCodes(rows)
}

// Exists checks if a question code exists
func (r *QuestionCodeRepository) Exists(ctx context.Context, code string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM questioncode WHERE code = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, code).Scan(&exists)
	return exists, err
}

// scanQuestionCodes scans multiple question code rows
func (r *QuestionCodeRepository) scanQuestionCodes(rows *sql.Rows) ([]*entity.QuestionCode, error) {
	var codes []*entity.QuestionCode

	for rows.Next() {
		var qc entity.QuestionCode
		var form sql.NullString

		err := rows.Scan(
			&qc.Code.String,
			&qc.Format.String,
			&qc.Grade.String,
			&qc.Subject.String,
			&qc.Chapter.String,
			&qc.Lesson.String,
			&form,
			&qc.Level.String,
			&qc.CreatedAt.Time,
			&qc.UpdatedAt.Time,
		)

		if err != nil {
			return nil, err
		}

		// Set statuses
		qc.Code.Status = pgtype.Present
		qc.Format.Status = pgtype.Present
		qc.Grade.Status = pgtype.Present
		qc.Subject.Status = pgtype.Present
		qc.Chapter.Status = pgtype.Present
		qc.Lesson.Status = pgtype.Present
		qc.Level.Status = pgtype.Present
		qc.CreatedAt.Status = pgtype.Present
		qc.UpdatedAt.Status = pgtype.Present

		if form.Valid {
			qc.Form.Set(form.String)
		}

		codes = append(codes, &qc)
	}

	return codes, nil
}

// nullableStringToSQL converts pgtype.Text to sql.NullString
func nullableStringToSQL(t pgtype.Text) sql.NullString {
	if t.Status == pgtype.Present {
		return sql.NullString{String: t.String, Valid: true}
	}
	return sql.NullString{Valid: false}
}
