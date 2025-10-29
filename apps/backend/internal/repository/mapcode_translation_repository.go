package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// MapCodeTranslationRepository handles MapCode translation caching
type MapCodeTranslationRepository struct {
	db *sql.DB
}

// NewMapCodeTranslationRepository creates a new repository
func NewMapCodeTranslationRepository(db *sql.DB) *MapCodeTranslationRepository {
	return &MapCodeTranslationRepository{db: db}
}

// CreateTranslation creates a new translation cache entry
func (r *MapCodeTranslationRepository) CreateTranslation(ctx context.Context, translation *entity.MapCodeTranslation) error {
	query := `
		INSERT INTO mapcode_translations (
			id, version_id, question_code, translation, grade, subject, 
			chapter, level, lesson, form, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		)
		ON CONFLICT (version_id, question_code) 
		DO UPDATE SET
			translation = EXCLUDED.translation,
			grade = EXCLUDED.grade,
			subject = EXCLUDED.subject,
			chapter = EXCLUDED.chapter,
			level = EXCLUDED.level,
			lesson = EXCLUDED.lesson,
			form = EXCLUDED.form,
			updated_at = EXCLUDED.updated_at
	`

	// Generate ID if not provided
	if translation.ID.Status != pgtype.Present || translation.ID.String == "" {
		translation.ID.Set(uuid.New().String())
	}

	// Set timestamps
	now := time.Now()
	translation.CreatedAt.Set(now)
	translation.UpdatedAt.Set(now)

	_, err := r.db.ExecContext(ctx, query,
		translation.ID.String,
		translation.VersionID.String,
		translation.QuestionCode.String,
		translation.Translation.String,
		nullableString(translation.Grade),
		nullableString(translation.Subject),
		nullableString(translation.Chapter),
		nullableString(translation.Level),
		nullableString(translation.Lesson),
		nullableString(translation.Form),
		translation.CreatedAt.Time,
		translation.UpdatedAt.Time,
	)

	return err
}

// GetTranslation retrieves a cached translation
func (r *MapCodeTranslationRepository) GetTranslation(ctx context.Context, versionID, questionCode string) (*entity.MapCodeTranslation, error) {
	query := `
		SELECT 
			id, version_id, question_code, translation, grade, subject,
			chapter, level, lesson, form, created_at, updated_at
		FROM mapcode_translations
		WHERE version_id = $1 AND question_code = $2
	`

	var translation entity.MapCodeTranslation
	var grade, subject, chapter, level, lesson, form sql.NullString

	err := r.db.QueryRowContext(ctx, query, versionID, questionCode).Scan(
		&translation.ID.String,
		&translation.VersionID.String,
		&translation.QuestionCode.String,
		&translation.Translation.String,
		&grade,
		&subject,
		&chapter,
		&level,
		&lesson,
		&form,
		&translation.CreatedAt.Time,
		&translation.UpdatedAt.Time,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("translation not found")
		}
		return nil, err
	}

	// Set status for all fields
	translation.ID.Status = pgtype.Present
	translation.VersionID.Status = pgtype.Present
	translation.QuestionCode.Status = pgtype.Present
	translation.Translation.Status = pgtype.Present
	translation.CreatedAt.Status = pgtype.Present
	translation.UpdatedAt.Status = pgtype.Present

	// Handle nullable fields
	if grade.Valid {
		translation.Grade.Set(grade.String)
	}
	if subject.Valid {
		translation.Subject.Set(subject.String)
	}
	if chapter.Valid {
		translation.Chapter.Set(chapter.String)
	}
	if level.Valid {
		translation.Level.Set(level.String)
	}
	if lesson.Valid {
		translation.Lesson.Set(lesson.String)
	}
	if form.Valid {
		translation.Form.Set(form.String)
	}

	return &translation, nil
}

// GetTranslationsByVersion retrieves all translations for a version
func (r *MapCodeTranslationRepository) GetTranslationsByVersion(ctx context.Context, versionID string, offset, limit int) ([]*entity.MapCodeTranslation, error) {
	query := `
		SELECT 
			id, version_id, question_code, translation, grade, subject,
			chapter, level, lesson, form, created_at, updated_at
		FROM mapcode_translations
		WHERE version_id = $1
		ORDER BY question_code
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, versionID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var translations []*entity.MapCodeTranslation
	for rows.Next() {
		var translation entity.MapCodeTranslation
		var grade, subject, chapter, level, lesson, form sql.NullString

		err := rows.Scan(
			&translation.ID.String,
			&translation.VersionID.String,
			&translation.QuestionCode.String,
			&translation.Translation.String,
			&grade,
			&subject,
			&chapter,
			&level,
			&lesson,
			&form,
			&translation.CreatedAt.Time,
			&translation.UpdatedAt.Time,
		)
		if err != nil {
			return nil, err
		}

		// Set status for all fields
		translation.ID.Status = pgtype.Present
		translation.VersionID.Status = pgtype.Present
		translation.QuestionCode.Status = pgtype.Present
		translation.Translation.Status = pgtype.Present
		translation.CreatedAt.Status = pgtype.Present
		translation.UpdatedAt.Status = pgtype.Present

		// Handle nullable fields
		if grade.Valid {
			translation.Grade.Set(grade.String)
		}
		if subject.Valid {
			translation.Subject.Set(subject.String)
		}
		if chapter.Valid {
			translation.Chapter.Set(chapter.String)
		}
		if level.Valid {
			translation.Level.Set(level.String)
		}
		if lesson.Valid {
			translation.Lesson.Set(lesson.String)
		}
		if form.Valid {
			translation.Form.Set(form.String)
		}

		translations = append(translations, &translation)
	}

	return translations, rows.Err()
}

// DeleteTranslationsByVersion deletes all translations for a version
func (r *MapCodeTranslationRepository) DeleteTranslationsByVersion(ctx context.Context, versionID string) error {
	query := `DELETE FROM mapcode_translations WHERE version_id = $1`
	_, err := r.db.ExecContext(ctx, query, versionID)
	return err
}

// CountTranslationsByVersion counts translations for a version
func (r *MapCodeTranslationRepository) CountTranslationsByVersion(ctx context.Context, versionID string) (int, error) {
	query := `SELECT COUNT(*) FROM mapcode_translations WHERE version_id = $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, versionID).Scan(&count)
	return count, err
}

// BatchCreateTranslations creates multiple translations efficiently
func (r *MapCodeTranslationRepository) BatchCreateTranslations(ctx context.Context, translations []*entity.MapCodeTranslation) error {
	if len(translations) == 0 {
		return nil
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO mapcode_translations (
			id, version_id, question_code, translation, grade, subject,
			chapter, level, lesson, form, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		)
		ON CONFLICT (version_id, question_code) 
		DO UPDATE SET
			translation = EXCLUDED.translation,
			grade = EXCLUDED.grade,
			subject = EXCLUDED.subject,
			chapter = EXCLUDED.chapter,
			level = EXCLUDED.level,
			lesson = EXCLUDED.lesson,
			form = EXCLUDED.form,
			updated_at = EXCLUDED.updated_at
	`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	now := time.Now()
	for _, translation := range translations {
		// Generate ID if not provided
		if translation.ID.Status != pgtype.Present || translation.ID.String == "" {
			translation.ID.Set(uuid.New().String())
		}

		// Set timestamps
		translation.CreatedAt.Set(now)
		translation.UpdatedAt.Set(now)

		_, err := stmt.ExecContext(ctx,
			translation.ID.String,
			translation.VersionID.String,
			translation.QuestionCode.String,
			translation.Translation.String,
			nullableString(translation.Grade),
			nullableString(translation.Subject),
			nullableString(translation.Chapter),
			nullableString(translation.Level),
			nullableString(translation.Lesson),
			nullableString(translation.Form),
			translation.CreatedAt.Time,
			translation.UpdatedAt.Time,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// Helper function for nullable strings
func nullableString(pgText pgtype.Text) interface{} {
	if pgText.Status == pgtype.Present {
		return pgText.String
	}
	return nil
}
