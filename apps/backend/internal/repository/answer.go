package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/entity"

	"github.com/google/uuid"
)

type AnswerRepository struct{}

func (r *AnswerRepository) GetByQuestionID(ctx context.Context, db database.QueryExecer, questionID string) ([]entity.Answer, error) {
	query := `
	SELECT id, question_id, text, is_correct, created_at
	FROM answers
	WHERE question_id = $1
	ORDER BY created_at ASC
	`

	rows, err := db.QueryContext(ctx, query, questionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query answers: %w", err)
	}
	defer rows.Close()

	var answers []entity.Answer
	for rows.Next() {
		var answer entity.Answer
		err := rows.Scan(
			&answer.ID, &answer.QuestionID, &answer.Text, &answer.IsCorrect, &answer.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan answer: %w", err)
		}
		answers = append(answers, answer)
	}

	return answers, nil
}

func (r *AnswerRepository) GetByID(ctx context.Context, db database.QueryExecer, id string) (*entity.Answer, error) {
	query := `
	SELECT id, question_id, text, is_correct, created_at
	FROM answers
	WHERE id = $1
	`

	var answer entity.Answer
	err := db.QueryRowContext(ctx, query, id).Scan(
		&answer.ID, &answer.QuestionID, &answer.Text, &answer.IsCorrect, &answer.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("answer not found")
		}
		return nil, fmt.Errorf("failed to get answer: %w", err)
	}

	return &answer, nil
}

func (r *AnswerRepository) Create(ctx context.Context, db database.QueryExecer, answer *entity.Answer) error {
	// Generate UUID if not provided
	if answer.ID == "" {
		answer.ID = uuid.New().String()
	}

	// Set timestamp
	answer.CreatedAt = time.Now()

	query := `
	INSERT INTO answers (id, question_id, text, is_correct, created_at)
	VALUES ($1, $2, $3, $4, $5)
	`

	_, err := db.ExecContext(ctx, query,
		answer.ID, answer.QuestionID, answer.Text, answer.IsCorrect, answer.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create answer: %w", err)
	}

	return nil
}

func (r *AnswerRepository) Update(ctx context.Context, db database.QueryExecer, answer *entity.Answer) error {
	query := `
	UPDATE answers
	SET text = $2, is_correct = $3
	WHERE id = $1
	`

	result, err := db.ExecContext(ctx, query, answer.ID, answer.Text, answer.IsCorrect)
	if err != nil {
		return fmt.Errorf("failed to update answer: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("answer not found")
	}

	return nil
}

func (r *AnswerRepository) Delete(ctx context.Context, db database.QueryExecer, id string) error {
	query := `DELETE FROM answers WHERE id = $1`

	result, err := db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete answer: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("answer not found")
	}

	return nil
}

func (r *AnswerRepository) DeleteByQuestionID(ctx context.Context, db database.QueryExecer, questionID string) error {
	query := `DELETE FROM answers WHERE question_id = $1`

	_, err := db.ExecContext(ctx, query, questionID)
	if err != nil {
		return fmt.Errorf("failed to delete answers for question: %w", err)
	}

	return nil
}
