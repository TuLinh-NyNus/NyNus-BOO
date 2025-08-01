package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type QuestionRepository struct {
	db *sql.DB
}

func NewQuestionRepository(db *sql.DB) *QuestionRepository {
	return &QuestionRepository{db: db}
}

func (r *QuestionRepository) GetAll() ([]entity.Question, error) {
	query := `
	SELECT id, text, type, difficulty, explanation, tags, created_at, updated_at
	FROM questions
	ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query questions: %w", err)
	}
	defer rows.Close()

	var questions []entity.Question
	for rows.Next() {
		var question entity.Question
		err := rows.Scan(
			&question.ID, &question.Text, &question.Type, &question.Difficulty,
			&question.Explanation, pq.Array(&question.Tags), &question.CreatedAt, &question.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, question)
	}

	return questions, nil
}

func (r *QuestionRepository) GetByID(id string) (*entity.Question, error) {
	query := `
	SELECT id, text, type, difficulty, explanation, tags, created_at, updated_at
	FROM questions
	WHERE id = $1
	`

	var question entity.Question
	err := r.db.QueryRow(query, id).Scan(
		&question.ID, &question.Text, &question.Type, &question.Difficulty,
		&question.Explanation, pq.Array(&question.Tags), &question.CreatedAt, &question.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to get question: %w", err)
	}

	return &question, nil
}

func (r *QuestionRepository) Create(question *entity.Question) error {
	// Generate UUID if not provided
	if question.ID == "" {
		question.ID = uuid.New().String()
	}

	// Set timestamps
	question.CreatedAt = time.Now()
	question.UpdatedAt = time.Now()

	query := `
	INSERT INTO questions (id, text, type, difficulty, explanation, tags, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.Exec(query,
		question.ID, question.Text, question.Type, question.Difficulty,
		question.Explanation, pq.Array(question.Tags), question.CreatedAt, question.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create question: %w", err)
	}

	return nil
}

func (r *QuestionRepository) Update(question *entity.Question) error {
	question.UpdatedAt = time.Now()

	query := `
	UPDATE questions
	SET text = $2, type = $3, difficulty = $4, explanation = $5, tags = $6, updated_at = $7
	WHERE id = $1
	`

	result, err := r.db.Exec(query,
		question.ID, question.Text, question.Type, question.Difficulty,
		question.Explanation, pq.Array(question.Tags), question.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update question: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question not found")
	}

	return nil
}

func (r *QuestionRepository) Delete(id string) error {
	query := `DELETE FROM questions WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete question: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question not found")
	}

	return nil
}
