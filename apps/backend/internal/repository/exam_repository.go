package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ExamRepository handles database operations for exams
type ExamRepository struct {
	db *sql.DB
}

// NewExamRepository creates a new exam repository instance
func NewExamRepository(db *sql.DB) *ExamRepository {
	return &ExamRepository{db: db}
}

// Create creates a new exam
func (r *ExamRepository) Create(exam *entity.Exam) error {
	query := `
		INSERT INTO exams (
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			shuffle_questions, shuffle_answers, show_results, show_answers,
			allow_review, max_attempts, created_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
		)
	`

	// Generate ID if not provided
	if exam.ID == "" {
		exam.ID = uuid.New().String()
	}

	// Set defaults
	if exam.Status == "" {
		exam.Status = entity.ExamStatusDraft
	}
	if exam.ExamType == "" {
		exam.ExamType = entity.ExamTypePractice
	}
	if exam.DurationMinutes == 0 {
		exam.DurationMinutes = 60
	}
	if exam.PassPercentage == 0 {
		exam.PassPercentage = 60
	}
	if exam.MaxAttempts == 0 {
		exam.MaxAttempts = 1
	}

	// Set timestamps
	now := time.Now()
	exam.CreatedAt = now
	exam.UpdatedAt = now

	_, err := r.db.Exec(
		query,
		exam.ID,
		exam.Title,
		exam.Description,
		exam.Instructions,
		exam.DurationMinutes,
		exam.TotalPoints,
		exam.PassPercentage,
		string(exam.ExamType),
		string(exam.Status),
		exam.ShuffleQuestions,
		exam.ShuffleAnswers,
		exam.ShowResults,
		exam.ShowAnswers,
		exam.AllowReview,
		exam.MaxAttempts,
		exam.CreatedBy,
		exam.CreatedAt,
		exam.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create exam: %w", err)
	}

	return nil
}

// GetByID retrieves an exam by ID
func (r *ExamRepository) GetByID(id string) (*entity.Exam, error) {
	query := `
		SELECT 
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			shuffle_questions, shuffle_answers, show_results, show_answers,
			allow_review, max_attempts, created_by, published_at,
			created_at, updated_at
		FROM exams
		WHERE id = $1
	`

	var exam entity.Exam
	err := r.db.QueryRow(query, id).Scan(
		&exam.ID,
		&exam.Title,
		&exam.Description,
		&exam.Instructions,
		&exam.DurationMinutes,
		&exam.TotalPoints,
		&exam.PassPercentage,
		&exam.ExamType,
		&exam.Status,
		&exam.ShuffleQuestions,
		&exam.ShuffleAnswers,
		&exam.ShowResults,
		&exam.ShowAnswers,
		&exam.AllowReview,
		&exam.MaxAttempts,
		&exam.CreatedBy,
		&exam.PublishedAt,
		&exam.CreatedAt,
		&exam.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("exam not found")
		}
		return nil, fmt.Errorf("failed to get exam: %w", err)
	}

	// Load question IDs
	exam.QuestionIDs, err = r.getExamQuestionIDs(id)
	if err != nil {
		return nil, err
	}

	return &exam, nil
}

// Update updates an existing exam
func (r *ExamRepository) Update(exam *entity.Exam) error {
	query := `
		UPDATE exams
		SET title = $2, description = $3, instructions = $4,
		    duration_minutes = $5, pass_percentage = $6,
		    exam_type = $7, status = $8,
		    shuffle_questions = $9, shuffle_answers = $10,
		    show_results = $11, show_answers = $12,
		    allow_review = $13, max_attempts = $14,
		    updated_at = $15
		WHERE id = $1
	`

	exam.UpdatedAt = time.Now()

	result, err := r.db.Exec(
		query,
		exam.ID,
		exam.Title,
		exam.Description,
		exam.Instructions,
		exam.DurationMinutes,
		exam.PassPercentage,
		string(exam.ExamType),
		string(exam.Status),
		exam.ShuffleQuestions,
		exam.ShuffleAnswers,
		exam.ShowResults,
		exam.ShowAnswers,
		exam.AllowReview,
		exam.MaxAttempts,
		exam.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update exam: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("exam not found")
	}

	return nil
}

// Delete deletes an exam
func (r *ExamRepository) Delete(id string) error {
	query := "DELETE FROM exams WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete exam: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("exam not found")
	}

	return nil
}

// List retrieves exams with filters and pagination
func (r *ExamRepository) List(status, examType, createdBy string, offset, limit int) ([]*entity.Exam, int, error) {
	// Build WHERE clause
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIndex := 1

	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, status)
		argIndex++
	}

	if examType != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("exam_type = $%d", argIndex))
		args = append(args, examType)
		argIndex++
	}

	if createdBy != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("created_by = $%d", argIndex))
		args = append(args, createdBy)
		argIndex++
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM exams WHERE %s", whereClause)
	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count exams: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT 
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			shuffle_questions, shuffle_answers, show_results, show_answers,
			allow_review, max_attempts, created_by, published_at,
			created_at, updated_at
		FROM exams
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list exams: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		err := rows.Scan(
			&exam.ID,
			&exam.Title,
			&exam.Description,
			&exam.Instructions,
			&exam.DurationMinutes,
			&exam.TotalPoints,
			&exam.PassPercentage,
			&exam.ExamType,
			&exam.Status,
			&exam.ShuffleQuestions,
			&exam.ShuffleAnswers,
			&exam.ShowResults,
			&exam.ShowAnswers,
			&exam.AllowReview,
			&exam.MaxAttempts,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, totalCount, nil
}

// PublishExam publishes an exam
func (r *ExamRepository) PublishExam(id string) error {
	query := `
		UPDATE exams
		SET status = $2, published_at = $3, updated_at = $4
		WHERE id = $1
	`

	now := time.Now()
	result, err := r.db.Exec(query, id, string(entity.ExamStatusPublished), now, now)
	if err != nil {
		return fmt.Errorf("failed to publish exam: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("exam not found")
	}

	return nil
}

// AddQuestions adds questions to an exam
func (r *ExamRepository) AddQuestions(examID string, questionIDs []string, points []int) error {
	// Start transaction
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Get current max order number
	var maxOrder int
	err = tx.QueryRow("SELECT COALESCE(MAX(order_number), 0) FROM exam_questions WHERE exam_id = $1", examID).Scan(&maxOrder)
	if err != nil {
		return fmt.Errorf("failed to get max order: %w", err)
	}

	// Insert questions
	query := `
		INSERT INTO exam_questions (id, exam_id, question_id, order_number, points)
		VALUES ($1, $2, $3, $4, $5)
	`

	for i, questionID := range questionIDs {
		orderNumber := maxOrder + i + 1
		questionPoints := 1
		if i < len(points) {
			questionPoints = points[i]
		}

		_, err = tx.Exec(
			query,
			uuid.New().String(),
			examID,
			questionID,
			orderNumber,
			questionPoints,
		)
		if err != nil {
			return fmt.Errorf("failed to add question %s: %w", questionID, err)
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// RemoveQuestion removes a question from an exam
func (r *ExamRepository) RemoveQuestion(examID, questionID string) error {
	query := "DELETE FROM exam_questions WHERE exam_id = $1 AND question_id = $2"

	result, err := r.db.Exec(query, examID, questionID)
	if err != nil {
		return fmt.Errorf("failed to remove question: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question not found in exam")
	}

	// Reorder remaining questions
	if err := r.reorderQuestions(examID); err != nil {
		return err
	}

	return nil
}

// GetExamQuestions retrieves all questions for an exam
func (r *ExamRepository) GetExamQuestions(examID string) ([]*entity.ExamQuestion, error) {
	query := `
		SELECT id, exam_id, question_id, order_number, points, is_bonus
		FROM exam_questions
		WHERE exam_id = $1
		ORDER BY order_number
	`

	rows, err := r.db.Query(query, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam questions: %w", err)
	}
	defer rows.Close()

	questions := []*entity.ExamQuestion{}
	for rows.Next() {
		var q entity.ExamQuestion
		err := rows.Scan(
			&q.ID,
			&q.ExamID,
			&q.QuestionID,
			&q.OrderNumber,
			&q.Points,
			&q.IsBonus,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan exam question: %w", err)
		}
		questions = append(questions, &q)
	}

	return questions, nil
}

// Helper methods

func (r *ExamRepository) getExamQuestionIDs(examID string) ([]string, error) {
	query := `
		SELECT question_id
		FROM exam_questions
		WHERE exam_id = $1
		ORDER BY order_number
	`

	rows, err := r.db.Query(query, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get question IDs: %w", err)
	}
	defer rows.Close()

	ids := []string{}
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to scan question ID: %w", err)
		}
		ids = append(ids, id)
	}

	return ids, nil
}

func (r *ExamRepository) reorderQuestions(examID string) error {
	query := `
		UPDATE exam_questions
		SET order_number = subquery.new_order
		FROM (
			SELECT id, ROW_NUMBER() OVER (ORDER BY order_number) as new_order
			FROM exam_questions
			WHERE exam_id = $1
		) as subquery
		WHERE exam_questions.id = subquery.id
	`

	_, err := r.db.Exec(query, examID)
	if err != nil {
		return fmt.Errorf("failed to reorder questions: %w", err)
	}

	return nil
}

// CreateAttempt creates a new exam attempt
func (r *ExamRepository) CreateAttempt(attempt *entity.ExamAttempt) error {
	query := `
		INSERT INTO exam_attempts (
			id, exam_id, user_id, attempt_number, status,
			started_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
	`

	if attempt.ID == "" {
		attempt.ID = uuid.New().String()
	}

	if attempt.Status == "" {
		attempt.Status = entity.AttemptStatusInProgress
	}

	attempt.StartedAt = time.Now()

	_, err := r.db.Exec(
		query,
		attempt.ID,
		attempt.ExamID,
		attempt.UserID,
		attempt.AttemptNumber,
		string(attempt.Status),
		attempt.StartedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create attempt: %w", err)
	}

	return nil
}

// GetAttempt retrieves an exam attempt
func (r *ExamRepository) GetAttempt(id string) (*entity.ExamAttempt, error) {
	query := `
		SELECT 
			id, exam_id, user_id, attempt_number, status,
			score, total_points, percentage, passed,
			started_at, submitted_at, time_spent_seconds
		FROM exam_attempts
		WHERE id = $1
	`

	var attempt entity.ExamAttempt
	err := r.db.QueryRow(query, id).Scan(
		&attempt.ID,
		&attempt.ExamID,
		&attempt.UserID,
		&attempt.AttemptNumber,
		&attempt.Status,
		&attempt.Score,
		&attempt.TotalPoints,
		&attempt.Percentage,
		&attempt.Passed,
		&attempt.StartedAt,
		&attempt.SubmittedAt,
		&attempt.TimeSpent,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("attempt not found")
		}
		return nil, fmt.Errorf("failed to get attempt: %w", err)
	}

	return &attempt, nil
}

// GetUserAttempts retrieves all attempts for a user on an exam
func (r *ExamRepository) GetUserAttempts(examID, userID string) ([]*entity.ExamAttempt, error) {
	query := `
		SELECT 
			id, exam_id, user_id, attempt_number, status,
			score, total_points, percentage, passed,
			started_at, submitted_at, time_spent_seconds
		FROM exam_attempts
		WHERE exam_id = $1 AND user_id = $2
		ORDER BY attempt_number DESC
	`

	rows, err := r.db.Query(query, examID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user attempts: %w", err)
	}
	defer rows.Close()

	attempts := []*entity.ExamAttempt{}
	for rows.Next() {
		var attempt entity.ExamAttempt
		err := rows.Scan(
			&attempt.ID,
			&attempt.ExamID,
			&attempt.UserID,
			&attempt.AttemptNumber,
			&attempt.Status,
			&attempt.Score,
			&attempt.TotalPoints,
			&attempt.Percentage,
			&attempt.Passed,
			&attempt.StartedAt,
			&attempt.SubmittedAt,
			&attempt.TimeSpent,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan attempt: %w", err)
		}
		attempts = append(attempts, &attempt)
	}

	return attempts, nil
}

// SubmitAttempt marks an attempt as submitted
func (r *ExamRepository) SubmitAttempt(attemptID string, score, totalPoints int, percentage float64, passed bool) error {
	query := `
		UPDATE exam_attempts
		SET status = $2, score = $3, total_points = $4,
		    percentage = $5, passed = $6, submitted_at = $7,
		    time_spent_seconds = EXTRACT(EPOCH FROM ($7 - started_at))::INT
		WHERE id = $1
	`

	now := time.Now()
	result, err := r.db.Exec(
		query,
		attemptID,
		string(entity.AttemptStatusSubmitted),
		score,
		totalPoints,
		percentage,
		passed,
		now,
	)

	if err != nil {
		return fmt.Errorf("failed to submit attempt: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("attempt not found")
	}

	return nil
}

// GetAttemptCount returns the number of attempts a user has made on an exam
func (r *ExamRepository) GetAttemptCount(examID, userID string) (int, error) {
	query := "SELECT COUNT(*) FROM exam_attempts WHERE exam_id = $1 AND user_id = $2"
	
	var count int
	err := r.db.QueryRow(query, examID, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get attempt count: %w", err)
	}

	return count, nil
}