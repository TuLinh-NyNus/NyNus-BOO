package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ExamRepository handles database operations for exams
type ExamRepository struct {
	db *sql.DB
}

// NewExamRepository creates a new exam repository instance
func NewExamRepository(db *sql.DB) interfaces.ExamRepository {
	return &ExamRepository{db: db}
}

// Create creates a new exam
func (r *ExamRepository) Create(ctx context.Context, exam *entity.Exam) error {
	query := `
		INSERT INTO exams (
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
		)
	`

	// Generate ID if not provided
	if exam.ID == "" {
		exam.ID = uuid.New().String()
	}

	// Set defaults - updated to use new enum values aligned with ExamSystem.md
	if exam.Status == "" {
		exam.Status = entity.ExamStatusPending // Default to 'PENDING' (was ExamStatusDraft)
	}
	if exam.ExamType == "" {
		exam.ExamType = entity.ExamTypeGenerated // Default to 'generated' (was ExamTypePractice)
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

	_, err := r.db.ExecContext(
		ctx,
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
		exam.Subject,
		exam.Grade,
		exam.Difficulty,
		exam.Tags,
		exam.ShuffleQuestions,
		exam.ShowResults,
		exam.MaxAttempts,
		exam.SourceInstitution,
		exam.ExamYear,
		exam.ExamCode,
		exam.FileURL,
		exam.Version,
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
func (r *ExamRepository) GetByID(ctx context.Context, id string) (*entity.Exam, error) {
	query := `
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE id = $1
	`

	var exam entity.Exam
	var tags pq.StringArray
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&exam.ID,
		&exam.Title,
		&exam.Description,
		&exam.Instructions,
		&exam.DurationMinutes,
		&exam.TotalPoints,
		&exam.PassPercentage,
		&exam.ExamType,
		&exam.Status,
		&exam.Subject,
		&exam.Grade,
		&exam.Difficulty,
		&tags,
		&exam.ShuffleQuestions,
		&exam.ShowResults,
		&exam.MaxAttempts,
		&exam.SourceInstitution,
		&exam.ExamYear,
		&exam.ExamCode,
		&exam.FileURL,
		&exam.Version,
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

	// Convert pq.StringArray to []string
	exam.Tags = append([]string(nil), tags...)

	// Load question IDs
	exam.QuestionIDs, err = r.getExamQuestionIDs(id)
	if err != nil {
		return nil, err
	}

	return &exam, nil
}

// Update updates an existing exam
func (r *ExamRepository) Update(ctx context.Context, exam *entity.Exam) error {
	query := `
		UPDATE exams
		SET title = $2, description = $3, instructions = $4,
		    duration_minutes = $5, pass_percentage = $6,
		    exam_type = $7, status = $8,
		    subject = $9, grade = $10, difficulty = $11, tags = $12,
		    shuffle_questions = $13, show_results = $14, max_attempts = $15,
		    source_institution = $16, exam_year = $17, exam_code = $18, file_url = $19,
		    version = $20, updated_at = $21
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
		exam.Subject,
		exam.Grade,
		exam.Difficulty,
		exam.Tags,
		exam.ShuffleQuestions,
		exam.ShowResults,
		exam.MaxAttempts,
		exam.SourceInstitution,
		exam.ExamYear,
		exam.ExamCode,
		exam.FileURL,
		exam.Version,
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
func (r *ExamRepository) Delete(ctx context.Context, id string) error {
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
func (r *ExamRepository) List(ctx context.Context, filters *interfaces.ExamFilters, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	// Set defaults
	if pagination == nil {
		pagination = &interfaces.Pagination{
			Offset:     0,
			Limit:      20,
			SortColumn: "created_at",
			SortOrder:  "DESC",
		}
	}
	if filters == nil {
		filters = &interfaces.ExamFilters{}
	}

	// Build WHERE clause
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIndex := 1

	// Status filters
	if len(filters.Status) > 0 {
		statusPlaceholders := make([]string, len(filters.Status))
		for i, status := range filters.Status {
			statusPlaceholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, string(status))
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("status = ANY(ARRAY[%s])", strings.Join(statusPlaceholders, ",")))
	}

	// ExamType filters
	if len(filters.ExamType) > 0 {
		typePlaceholders := make([]string, len(filters.ExamType))
		for i, examType := range filters.ExamType {
			typePlaceholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, string(examType))
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("exam_type = ANY(ARRAY[%s])", strings.Join(typePlaceholders, ",")))
	}

	// CreatedBy filters
	if len(filters.CreatedBy) > 0 {
		createdByPlaceholders := make([]string, len(filters.CreatedBy))
		for i, createdBy := range filters.CreatedBy {
			createdByPlaceholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, createdBy)
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("created_by = ANY(ARRAY[%s])", strings.Join(createdByPlaceholders, ",")))
	}

	// Subject filters
	if len(filters.Subjects) > 0 {
		subjectPlaceholders := make([]string, len(filters.Subjects))
		for i, subject := range filters.Subjects {
			subjectPlaceholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, subject)
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("subject = ANY(ARRAY[%s])", strings.Join(subjectPlaceholders, ",")))
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM exams WHERE %s", whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count exams: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, pagination.SortColumn, pagination.SortOrder, argIndex, argIndex+1)

	args = append(args, pagination.Limit, pagination.Offset)
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list exams: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		var tags pq.StringArray
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
			&exam.Subject,
			&exam.Grade,
			&exam.Difficulty,
			&tags,
			&exam.ShuffleQuestions,
			&exam.ShowResults,
			&exam.MaxAttempts,
			&exam.SourceInstitution,
			&exam.ExamYear,
			&exam.ExamCode,
			&exam.FileURL,
			&exam.Version,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Convert pq.StringArray to []string
		exam.Tags = append([]string(nil), tags...)

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, totalCount, nil
}

// Publish publishes an exam
func (r *ExamRepository) Publish(ctx context.Context, examID string) error {
	query := `
		UPDATE exams
		SET status = $2, published_at = $3, updated_at = $4
		WHERE id = $1
	`

	now := time.Now()
	// Updated to use new enum value: ExamStatusActive (was ExamStatusPublished)
	result, err := r.db.ExecContext(ctx, query, examID, string(entity.ExamStatusActive), now, now)
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

// Archive archives an exam
func (r *ExamRepository) Archive(ctx context.Context, examID string) error {
	query := `
		UPDATE exams
		SET status = $2, updated_at = $3
		WHERE id = $1
	`

	now := time.Now()
	result, err := r.db.ExecContext(ctx, query, examID, string(entity.ExamStatusArchived), now)
	if err != nil {
		return fmt.Errorf("failed to archive exam: %w", err)
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

// UpdateStatus updates exam status
func (r *ExamRepository) UpdateStatus(ctx context.Context, examID string, status entity.ExamStatus) error {
	query := `
		UPDATE exams
		SET status = $2, updated_at = $3
		WHERE id = $1
	`

	now := time.Now()
	result, err := r.db.ExecContext(ctx, query, examID, string(status), now)
	if err != nil {
		return fmt.Errorf("failed to update exam status: %w", err)
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

// AddQuestion adds a question to an exam
func (r *ExamRepository) AddQuestion(ctx context.Context, eq *entity.ExamQuestion) error {
	// Generate ID if not provided
	if eq.ID == "" {
		eq.ID = uuid.New().String()
	}

	// Get current max order number if not provided
	if eq.OrderNumber == 0 {
		var maxOrder int
		err := r.db.QueryRowContext(ctx, "SELECT COALESCE(MAX(order_number), 0) FROM exam_questions WHERE exam_id = $1", eq.ExamID).Scan(&maxOrder)
		if err != nil {
			return fmt.Errorf("failed to get max order: %w", err)
		}
		eq.OrderNumber = maxOrder + 1
	}

	// Set default points if not provided
	if eq.Points == 0 {
		eq.Points = 1
	}

	// Insert question
	query := `
		INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		eq.ID,
		eq.ExamID,
		eq.QuestionID,
		eq.OrderNumber,
		eq.Points,
		eq.IsBonus,
	)
	if err != nil {
		return fmt.Errorf("failed to add question: %w", err)
	}

	return nil
}

// RemoveQuestion removes a question from an exam
func (r *ExamRepository) RemoveQuestion(ctx context.Context, examID, questionID string) error {
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
func (r *ExamRepository) CreateAttempt(ctx context.Context, attempt *entity.ExamAttempt) error {
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
func (r *ExamRepository) GetAttempt(ctx context.Context, id string) (*entity.ExamAttempt, error) {
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
func (r *ExamRepository) SubmitAttempt(ctx context.Context, attemptID string, score, totalPoints int, percentage float64, passed bool) error {
	query := `
		UPDATE exam_attempts
		SET status = $2, score = $3, total_points = $4,
		    percentage = $5, passed = $6, submitted_at = $7,
		    time_spent_seconds = EXTRACT(EPOCH FROM ($7 - started_at))::INT
		WHERE id = $1
	`

	now := time.Now()
	result, err := r.db.ExecContext(
		ctx,
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

// Count returns the total number of exams matching filters
func (r *ExamRepository) Count(ctx context.Context, filters *interfaces.ExamFilters) (int, error) {
	if filters == nil {
		filters = &interfaces.ExamFilters{}
	}

	// Build WHERE clause (reuse logic from List method)
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIndex := 1

	// Status filters
	if len(filters.Status) > 0 {
		statusPlaceholders := make([]string, len(filters.Status))
		for i, status := range filters.Status {
			statusPlaceholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, string(status))
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("status = ANY(ARRAY[%s])", strings.Join(statusPlaceholders, ",")))
	}

	// ExamType filters
	if len(filters.ExamType) > 0 {
		typePlaceholders := make([]string, len(filters.ExamType))
		for i, examType := range filters.ExamType {
			typePlaceholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, string(examType))
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("exam_type = ANY(ARRAY[%s])", strings.Join(typePlaceholders, ",")))
	}

	whereClause := strings.Join(whereClauses, " AND ")
	query := fmt.Sprintf("SELECT COUNT(*) FROM exams WHERE %s", whereClause)

	var count int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count exams: %w", err)
	}

	return count, nil
}

// CountByStatus returns the count of exams by status
func (r *ExamRepository) CountByStatus(ctx context.Context, status entity.ExamStatus) (int, error) {
	query := "SELECT COUNT(*) FROM exams WHERE status = $1"

	var count int
	err := r.db.QueryRowContext(ctx, query, string(status)).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count exams by status: %w", err)
	}

	return count, nil
}

// CountAttempts returns the count of attempts for an exam
func (r *ExamRepository) CountAttempts(ctx context.Context, examID string) (int, error) {
	query := "SELECT COUNT(*) FROM exam_attempts WHERE exam_id = $1"

	var count int
	err := r.db.QueryRowContext(ctx, query, examID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count exam attempts: %w", err)
	}

	return count, nil
}

// CreateBatch creates multiple exams in a single transaction
func (r *ExamRepository) CreateBatch(ctx context.Context, exams []*entity.Exam) error {
	if len(exams) == 0 {
		return nil
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO exams (
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
		)
	`

	for _, exam := range exams {
		// Generate ID if not provided
		if exam.ID == "" {
			exam.ID = uuid.New().String()
		}

		// Set defaults
		if exam.Status == "" {
			exam.Status = entity.ExamStatusPending
		}
		if exam.ExamType == "" {
			exam.ExamType = entity.ExamTypeGenerated
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
		if exam.Version == 0 {
			exam.Version = 1
		}

		// Set timestamps
		now := time.Now()
		exam.CreatedAt = now
		exam.UpdatedAt = now

		_, err := tx.ExecContext(
			ctx,
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
			exam.Subject,
			exam.Grade,
			exam.Difficulty,
			exam.Tags,
			exam.ShuffleQuestions,
			exam.ShowResults,
			exam.MaxAttempts,
			exam.SourceInstitution,
			exam.ExamYear,
			exam.ExamCode,
			exam.FileURL,
			exam.Version,
			exam.CreatedBy,
			exam.CreatedAt,
			exam.UpdatedAt,
		)
		if err != nil {
			return fmt.Errorf("failed to create exam %s: %w", exam.ID, err)
		}
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetByIDs retrieves multiple exams by IDs
func (r *ExamRepository) GetByIDs(ctx context.Context, examIDs []string) ([]*entity.Exam, error) {
	if len(examIDs) == 0 {
		return []*entity.Exam{}, nil
	}

	// Build placeholders for IN clause
	placeholders := make([]string, len(examIDs))
	args := make([]interface{}, len(examIDs))
	for i, id := range examIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE id IN (%s)
		ORDER BY created_at DESC
	`, strings.Join(placeholders, ","))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get exams by IDs: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		var tags pq.StringArray
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
			&exam.Subject,
			&exam.Grade,
			&exam.Difficulty,
			&tags,
			&exam.ShuffleQuestions,
			&exam.ShowResults,
			&exam.MaxAttempts,
			&exam.SourceInstitution,
			&exam.ExamYear,
			&exam.ExamCode,
			&exam.FileURL,
			&exam.Version,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Convert pq.StringArray to []string
		exam.Tags = append([]string(nil), tags...)

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, nil
}

// FindByCreator finds exams by creator ID
func (r *ExamRepository) FindByCreator(ctx context.Context, creatorID string, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	if pagination == nil {
		pagination = &interfaces.Pagination{
			Offset:     0,
			Limit:      20,
			SortColumn: "created_at",
			SortOrder:  "DESC",
		}
	}

	// Count total records
	countQuery := "SELECT COUNT(*) FROM exams WHERE created_by = $1"
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, creatorID).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count exams by creator: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE created_by = $1
		ORDER BY %s %s
		LIMIT $2 OFFSET $3
	`, pagination.SortColumn, pagination.SortOrder)

	rows, err := r.db.QueryContext(ctx, query, creatorID, pagination.Limit, pagination.Offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find exams by creator: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		var tags pq.StringArray
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
			&exam.Subject,
			&exam.Grade,
			&exam.Difficulty,
			&tags,
			&exam.ShuffleQuestions,
			&exam.ShowResults,
			&exam.MaxAttempts,
			&exam.SourceInstitution,
			&exam.ExamYear,
			&exam.ExamCode,
			&exam.FileURL,
			&exam.Version,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Convert pq.StringArray to []string
		exam.Tags = append([]string(nil), tags...)

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, totalCount, nil
}

// FindBySubject finds exams by subject
func (r *ExamRepository) FindBySubject(ctx context.Context, subject string, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	if pagination == nil {
		pagination = &interfaces.Pagination{
			Offset:     0,
			Limit:      20,
			SortColumn: "created_at",
			SortOrder:  "DESC",
		}
	}

	// Count total records
	countQuery := "SELECT COUNT(*) FROM exams WHERE subject = $1"
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, subject).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count exams by subject: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE subject = $1
		ORDER BY %s %s
		LIMIT $2 OFFSET $3
	`, pagination.SortColumn, pagination.SortOrder)

	rows, err := r.db.QueryContext(ctx, query, subject, pagination.Limit, pagination.Offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find exams by subject: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		var tags pq.StringArray
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
			&exam.Subject,
			&exam.Grade,
			&exam.Difficulty,
			&tags,
			&exam.ShuffleQuestions,
			&exam.ShowResults,
			&exam.MaxAttempts,
			&exam.SourceInstitution,
			&exam.ExamYear,
			&exam.ExamCode,
			&exam.FileURL,
			&exam.Version,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Convert pq.StringArray to []string
		exam.Tags = append([]string(nil), tags...)

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, totalCount, nil
}

// FindByGrade finds exams by grade
func (r *ExamRepository) FindByGrade(ctx context.Context, grade int, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	if pagination == nil {
		pagination = &interfaces.Pagination{
			Offset:     0,
			Limit:      20,
			SortColumn: "created_at",
			SortOrder:  "DESC",
		}
	}

	// Count total records
	countQuery := "SELECT COUNT(*) FROM exams WHERE grade = $1"
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, grade).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count exams by grade: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE grade = $1
		ORDER BY %s %s
		LIMIT $2 OFFSET $3
	`, pagination.SortColumn, pagination.SortOrder)

	rows, err := r.db.QueryContext(ctx, query, grade, pagination.Limit, pagination.Offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find exams by grade: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		var tags pq.StringArray
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
			&exam.Subject,
			&exam.Grade,
			&exam.Difficulty,
			&tags,
			&exam.ShuffleQuestions,
			&exam.ShowResults,
			&exam.MaxAttempts,
			&exam.SourceInstitution,
			&exam.ExamYear,
			&exam.ExamCode,
			&exam.FileURL,
			&exam.Version,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Convert pq.StringArray to []string
		exam.Tags = append([]string(nil), tags...)

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, totalCount, nil
}

// FindOfficialExams finds official exams with filters
func (r *ExamRepository) FindOfficialExams(ctx context.Context, filters *interfaces.OfficialExamFilters, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	if pagination == nil {
		pagination = &interfaces.Pagination{
			Offset:     0,
			Limit:      20,
			SortColumn: "created_at",
			SortOrder:  "DESC",
		}
	}
	if filters == nil {
		filters = &interfaces.OfficialExamFilters{}
	}

	// Build WHERE clause
	whereClauses := []string{"exam_type = 'official'"}
	args := []interface{}{}
	argIndex := 1

	// Source institution filters
	if len(filters.SourceInstitution) > 0 {
		placeholders := make([]string, len(filters.SourceInstitution))
		for i, institution := range filters.SourceInstitution {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, institution)
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("source_institution = ANY(ARRAY[%s])", strings.Join(placeholders, ",")))
	}

	// Exam year filters
	if len(filters.ExamYear) > 0 {
		placeholders := make([]string, len(filters.ExamYear))
		for i, year := range filters.ExamYear {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, year)
			argIndex++
		}
		whereClauses = append(whereClauses, fmt.Sprintf("exam_year = ANY(ARRAY[%s])", strings.Join(placeholders, ",")))
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM exams WHERE %s", whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count official exams: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT
			id, title, description, instructions, duration_minutes,
			total_points, pass_percentage, exam_type, status,
			subject, grade, difficulty, tags,
			shuffle_questions, show_results, max_attempts,
			source_institution, exam_year, exam_code, file_url,
			version, created_by, published_at, created_at, updated_at
		FROM exams
		WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, pagination.SortColumn, pagination.SortOrder, argIndex, argIndex+1)

	args = append(args, pagination.Limit, pagination.Offset)
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find official exams: %w", err)
	}
	defer rows.Close()

	exams := []*entity.Exam{}
	for rows.Next() {
		var exam entity.Exam
		var tags pq.StringArray
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
			&exam.Subject,
			&exam.Grade,
			&exam.Difficulty,
			&tags,
			&exam.ShuffleQuestions,
			&exam.ShowResults,
			&exam.MaxAttempts,
			&exam.SourceInstitution,
			&exam.ExamYear,
			&exam.ExamCode,
			&exam.FileURL,
			&exam.Version,
			&exam.CreatedBy,
			&exam.PublishedAt,
			&exam.CreatedAt,
			&exam.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		// Convert pq.StringArray to []string
		exam.Tags = append([]string(nil), tags...)

		// Initialize QuestionIDs as empty slice
		exam.QuestionIDs = []string{}

		exams = append(exams, &exam)
	}

	return exams, totalCount, nil
}

// Stub implementations for missing ExamRepository methods
// These will be implemented properly in subsequent tasks

// ReorderQuestions reorders questions in an exam
func (r *ExamRepository) ReorderQuestions(ctx context.Context, examID string, order map[string]int) error {
	// TODO: Implement proper reordering logic
	return fmt.Errorf("ReorderQuestions not implemented yet")
}

// GetQuestions retrieves all questions for an exam with optimized query
func (r *ExamRepository) GetQuestions(ctx context.Context, examID string) ([]*entity.ExamQuestion, error) {
	// Single query to avoid N+1 problem - join with questions table
	query := `
		SELECT
			eq.exam_id, eq.question_id, eq.order_number, eq.points, eq.is_bonus,
			eq.created_at,
			q.content, q.question_type, q.difficulty, q.subject, q.grade
		FROM exam_questions eq
		JOIN questions q ON eq.question_id = q.id
		WHERE eq.exam_id = $1
		ORDER BY eq.order_number ASC
	`

	rows, err := r.db.QueryContext(ctx, query, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam questions: %w", err)
	}
	defer rows.Close()

	var questions []*entity.ExamQuestion
	for rows.Next() {
		eq := &entity.ExamQuestion{}
		var questionContent, questionType, difficulty, subject string
		var grade int

		err := rows.Scan(
			&eq.ExamID, &eq.QuestionID, &eq.OrderNumber, &eq.Points, &eq.IsBonus,
			&eq.CreatedAt,
			&questionContent, &questionType, &difficulty, &subject, &grade,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan exam question: %w", err)
		}

		questions = append(questions, eq)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating exam questions: %w", err)
	}

	return questions, nil
}

// UpdateQuestionPoints updates points for a question in an exam
func (r *ExamRepository) UpdateQuestionPoints(ctx context.Context, examID, questionID string, points int) error {
	// TODO: Implement proper points update
	return fmt.Errorf("UpdateQuestionPoints not implemented yet")
}

// ListUserAttempts retrieves all attempts for a user on an exam
func (r *ExamRepository) ListUserAttempts(ctx context.Context, userID, examID string) ([]*entity.ExamAttempt, error) {
	// TODO: Implement proper user attempts retrieval
	return nil, fmt.Errorf("ListUserAttempts not implemented yet")
}

// UpdateAttemptStatus updates attempt status
func (r *ExamRepository) UpdateAttemptStatus(ctx context.Context, attemptID string, status entity.AttemptStatus) error {
	// TODO: Implement proper attempt status update
	return fmt.Errorf("UpdateAttemptStatus not implemented yet")
}

// SaveAnswer saves an exam answer
func (r *ExamRepository) SaveAnswer(ctx context.Context, answer *entity.ExamAnswer) error {
	// TODO: Implement proper answer saving
	return fmt.Errorf("SaveAnswer not implemented yet")
}

// GetAnswers retrieves all answers for an attempt with optimized query
func (r *ExamRepository) GetAnswers(ctx context.Context, attemptID string) ([]*entity.ExamAnswer, error) {
	// Single query to get all answers for an attempt - avoid N+1
	query := `
		SELECT
			id, attempt_id, question_id, answer_data, is_correct,
			points_earned, time_spent_seconds, answered_at
		FROM exam_answers
		WHERE attempt_id = $1
		ORDER BY answered_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, attemptID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam answers: %w", err)
	}
	defer rows.Close()

	var answers []*entity.ExamAnswer
	for rows.Next() {
		answer := &entity.ExamAnswer{}

		err := rows.Scan(
			&answer.ID, &answer.AttemptID, &answer.QuestionID, &answer.AnswerData,
			&answer.IsCorrect, &answer.PointsEarned, &answer.TimeSpentSeconds,
			&answer.AnsweredAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan exam answer: %w", err)
		}

		answers = append(answers, answer)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating exam answers: %w", err)
	}

	return answers, nil
}

// GetAnswer retrieves a specific answer
func (r *ExamRepository) GetAnswer(ctx context.Context, attemptID, questionID string) (*entity.ExamAnswer, error) {
	query := `
		SELECT id, attempt_id, question_id, answer_data, is_correct,
		       points_earned, time_spent_seconds, answered_at
		FROM exam_answers
		WHERE attempt_id = $1 AND question_id = $2
	`

	var answer entity.ExamAnswer
	err := r.db.QueryRowContext(ctx, query, attemptID, questionID).Scan(
		&answer.ID,
		&answer.AttemptID,
		&answer.QuestionID,
		&answer.AnswerData,
		&answer.IsCorrect,
		&answer.PointsEarned,
		&answer.TimeSpentSeconds,
		&answer.AnsweredAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("failed to get answer: %w", err)
	}

	return &answer, nil
}

// UpdateAnswer updates an exam answer
func (r *ExamRepository) UpdateAnswer(ctx context.Context, answer *entity.ExamAnswer) error {
	query := `
		UPDATE exam_answers
		SET answer_data = $2, is_correct = $3, points_earned = $4,
		    time_spent_seconds = $5, answered_at = $6
		WHERE id = $1
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		answer.ID,
		answer.AnswerData,
		answer.IsCorrect,
		answer.PointsEarned,
		answer.TimeSpentSeconds,
		answer.AnsweredAt,
	)

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

// SaveResult saves an exam result
// TODO: Fix entity.ExamResult fields to match database schema
func (r *ExamRepository) SaveResult(ctx context.Context, result *entity.ExamResult) error {
	// Temporarily commented out due to entity/schema mismatch
	// Need to align ExamResult entity fields with database schema
	return fmt.Errorf("SaveResult method temporarily disabled - entity/schema mismatch")
}

// GetResult retrieves a result for an attempt
func (r *ExamRepository) GetResult(ctx context.Context, attemptID string) (*entity.ExamResult, error) {
	// TODO: Implement proper result retrieval
	return nil, fmt.Errorf("GetResult not implemented yet")
}

// GetResultsByExam retrieves all results for an exam
func (r *ExamRepository) GetResultsByExam(ctx context.Context, examID string) ([]*entity.ExamResult, error) {
	// TODO: Implement proper results retrieval by exam
	return nil, fmt.Errorf("GetResultsByExam not implemented yet")
}

// GetResultsByUser retrieves all results for a user
func (r *ExamRepository) GetResultsByUser(ctx context.Context, userID string) ([]*entity.ExamResult, error) {
	// TODO: Implement proper results retrieval by user
	return nil, fmt.Errorf("GetResultsByUser not implemented yet")
}

// SaveFeedback saves exam feedback
func (r *ExamRepository) SaveFeedback(ctx context.Context, feedback *entity.ExamFeedback) error {
	// TODO: Implement proper feedback saving
	return fmt.Errorf("SaveFeedback not implemented yet")
}

// GetFeedback retrieves feedback for an exam and user
func (r *ExamRepository) GetFeedback(ctx context.Context, examID, userID string) (*entity.ExamFeedback, error) {
	// TODO: Implement proper feedback retrieval
	return nil, fmt.Errorf("GetFeedback not implemented yet")
}

// ListFeedback retrieves all feedback for an exam
func (r *ExamRepository) ListFeedback(ctx context.Context, examID string) ([]*entity.ExamFeedback, error) {
	// TODO: Implement proper feedback listing
	return nil, fmt.Errorf("ListFeedback not implemented yet")
}

// GetExamStatistics retrieves exam statistics
func (r *ExamRepository) GetExamStatistics(ctx context.Context, examID string) (*interfaces.ExamStatistics, error) {
	query := `
		SELECT
			e.id as exam_id,
			COUNT(ea.id) as total_attempts,
			COUNT(CASE WHEN ea.status = 'submitted' THEN 1 END) as completed_attempts,
			COALESCE(AVG(CASE WHEN ea.status = 'submitted' THEN ea.percentage END), 0) as average_score,
			COALESCE(AVG(CASE WHEN ea.status = 'submitted' THEN ea.time_spent_seconds END), 0) as average_time_spent,
			COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(CASE WHEN ea.status = 'submitted' THEN 1 END), 0) * 100 as pass_rate
		FROM exams e
		LEFT JOIN exam_attempts ea ON e.id = ea.exam_id
		WHERE e.id = $1
		GROUP BY e.id
	`

	var stats interfaces.ExamStatistics
	var avgTimeSpent sql.NullFloat64
	var passRate sql.NullFloat64

	err := r.db.QueryRowContext(ctx, query, examID).Scan(
		&stats.ExamID,
		&stats.TotalAttempts,
		&stats.CompletedAttempts,
		&stats.AverageScore,
		&avgTimeSpent,
		&passRate,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return &interfaces.ExamStatistics{
				ExamID:            examID,
				TotalAttempts:     0,
				CompletedAttempts: 0,
				AverageScore:      0,
				PassRate:          0,
				AverageTimeSpent:  0,
				QuestionStats:     []*interfaces.QuestionStatistics{},
			}, nil
		}
		return nil, fmt.Errorf("failed to get exam statistics: %w", err)
	}

	if avgTimeSpent.Valid {
		stats.AverageTimeSpent = int(avgTimeSpent.Float64)
	}
	if passRate.Valid {
		stats.PassRate = passRate.Float64
	}

	// Get question-level statistics
	questionStats, err := r.getQuestionStatistics(ctx, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get question statistics: %w", err)
	}
	stats.QuestionStats = questionStats

	return &stats, nil
}

// getQuestionStatistics retrieves question-level statistics for an exam
func (r *ExamRepository) getQuestionStatistics(ctx context.Context, examID string) ([]*interfaces.QuestionStatistics, error) {
	query := `
		SELECT
			eq.question_id,
			COUNT(ea.id) as total_answers,
			COUNT(CASE WHEN ea.is_correct = true THEN 1 END) as correct_answers,
			COALESCE(AVG(ea.time_spent_seconds), 0) as average_time_spent
		FROM exam_questions eq
		LEFT JOIN exam_answers ea ON eq.question_id = ea.question_id
		LEFT JOIN exam_attempts att ON ea.attempt_id = att.id
		WHERE eq.exam_id = $1 AND att.status = 'submitted'
		GROUP BY eq.question_id
		ORDER BY eq.order_number
	`

	rows, err := r.db.QueryContext(ctx, query, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to query question statistics: %w", err)
	}
	defer rows.Close()

	var questionStats []*interfaces.QuestionStatistics
	for rows.Next() {
		var stat interfaces.QuestionStatistics
		var avgTimeSpent sql.NullFloat64

		err := rows.Scan(
			&stat.QuestionID,
			&stat.TotalAnswers,
			&stat.CorrectAnswers,
			&avgTimeSpent,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question statistics: %w", err)
		}

		if avgTimeSpent.Valid {
			stat.AverageTimeSpent = int(avgTimeSpent.Float64)
		}

		// Calculate correct rate
		if stat.TotalAnswers > 0 {
			stat.CorrectRate = float64(stat.CorrectAnswers) / float64(stat.TotalAnswers) * 100
		}

		questionStats = append(questionStats, &stat)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating question statistics: %w", err)
	}

	return questionStats, nil
}

// GetUserPerformance retrieves user performance data
func (r *ExamRepository) GetUserPerformance(ctx context.Context, userID, examID string) (*interfaces.UserPerformance, error) {
	query := `
		SELECT
			$1 as user_id,
			$2 as exam_id,
			COUNT(*) as total_attempts,
			MAX(ea.score) as best_score,
			MAX(ea.percentage) as best_percentage,
			AVG(ea.percentage) as average_score,
			MAX(ea.submitted_at) as last_attempt_date
		FROM exam_attempts ea
		WHERE ea.user_id = $1 AND ea.exam_id = $2 AND ea.status = 'submitted'
	`

	var performance interfaces.UserPerformance
	var lastAttemptDate sql.NullTime
	var bestScore sql.NullInt64
	var bestPercentage sql.NullFloat64
	var averageScore sql.NullFloat64

	err := r.db.QueryRowContext(ctx, query, userID, examID).Scan(
		&performance.UserID,
		&performance.ExamID,
		&performance.TotalAttempts,
		&bestScore,
		&bestPercentage,
		&averageScore,
		&lastAttemptDate,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return &interfaces.UserPerformance{
				UserID:          userID,
				ExamID:          examID,
				TotalAttempts:   0,
				BestScore:       0,
				BestPercentage:  0,
				AverageScore:    0,
				LastAttemptDate: nil,
				ImprovementRate: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to get user performance: %w", err)
	}

	if bestScore.Valid {
		performance.BestScore = int(bestScore.Int64)
	}
	if bestPercentage.Valid {
		performance.BestPercentage = bestPercentage.Float64
	}
	if averageScore.Valid {
		performance.AverageScore = averageScore.Float64
	}
	if lastAttemptDate.Valid {
		dateStr := lastAttemptDate.Time.Format("2006-01-02T15:04:05Z")
		performance.LastAttemptDate = &dateStr
	}

	// Calculate improvement rate
	if performance.TotalAttempts > 1 {
		improvementRate, err := r.calculateImprovementRate(ctx, userID, examID)
		if err == nil {
			performance.ImprovementRate = improvementRate
		}
	}

	return &performance, nil
}

// calculateImprovementRate calculates the improvement rate for a user's exam attempts
func (r *ExamRepository) calculateImprovementRate(ctx context.Context, userID, examID string) (float64, error) {
	query := `
		SELECT percentage
		FROM exam_attempts
		WHERE user_id = $1 AND exam_id = $2 AND status = 'submitted'
		ORDER BY submitted_at ASC
		LIMIT 2
	`

	rows, err := r.db.QueryContext(ctx, query, userID, examID)
	if err != nil {
		return 0, fmt.Errorf("failed to query improvement rate: %w", err)
	}
	defer rows.Close()

	var scores []float64
	for rows.Next() {
		var score float64
		if err := rows.Scan(&score); err != nil {
			return 0, fmt.Errorf("failed to scan score: %w", err)
		}
		scores = append(scores, score)
	}

	if len(scores) < 2 {
		return 0, nil
	}

	// Calculate improvement rate: (latest - first) / first * 100
	firstScore := scores[0]
	latestScore := scores[len(scores)-1]

	if firstScore == 0 {
		return 0, nil
	}

	improvementRate := ((latestScore - firstScore) / firstScore) * 100
	return improvementRate, nil
}

// GetExamAnalytics retrieves comprehensive exam analytics
func (r *ExamRepository) GetExamAnalytics(ctx context.Context, examID string) (*interfaces.ExamAnalytics, error) {
	// Get basic statistics
	statistics, err := r.GetExamStatistics(ctx, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam statistics: %w", err)
	}

	// Get difficulty analysis
	difficultyAnalysis, err := r.getDifficultyAnalysis(ctx, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get difficulty analysis: %w", err)
	}

	// Get time analysis
	timeAnalysis, err := r.getTimeAnalysis(ctx, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get time analysis: %w", err)
	}

	// Get performance trends
	performanceTrends, err := r.getPerformanceTrends(ctx, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get performance trends: %w", err)
	}

	analytics := &interfaces.ExamAnalytics{
		ExamID:             examID,
		Statistics:         statistics,
		DifficultyAnalysis: difficultyAnalysis,
		TimeAnalysis:       timeAnalysis,
		PerformanceTrends:  performanceTrends,
	}

	return analytics, nil
}

// getDifficultyAnalysis analyzes question difficulty distribution
func (r *ExamRepository) getDifficultyAnalysis(ctx context.Context, examID string) (*interfaces.DifficultyAnalysis, error) {
	query := `
		SELECT
			q.difficulty,
			COUNT(*) as count
		FROM exam_questions eq
		JOIN question q ON eq.question_id = q.id
		WHERE eq.exam_id = $1
		GROUP BY q.difficulty
	`

	rows, err := r.db.QueryContext(ctx, query, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to query difficulty analysis: %w", err)
	}
	defer rows.Close()

	analysis := &interfaces.DifficultyAnalysis{
		EasyQuestions:   0,
		MediumQuestions: 0,
		HardQuestions:   0,
		ExpertQuestions: 0,
	}

	totalQuestions := 0
	for rows.Next() {
		var difficulty string
		var count int

		err := rows.Scan(&difficulty, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan difficulty analysis: %w", err)
		}

		totalQuestions += count

		switch difficulty {
		case "easy":
			analysis.EasyQuestions = count
		case "medium":
			analysis.MediumQuestions = count
		case "hard":
			analysis.HardQuestions = count
		case "expert":
			analysis.ExpertQuestions = count
		}
	}

	// Determine overall difficulty
	if totalQuestions > 0 {
		easyPercent := float64(analysis.EasyQuestions) / float64(totalQuestions) * 100
		hardPercent := float64(analysis.HardQuestions+analysis.ExpertQuestions) / float64(totalQuestions) * 100

		if easyPercent >= 60 {
			analysis.OverallDifficulty = "Easy"
		} else if hardPercent >= 40 {
			analysis.OverallDifficulty = "Hard"
		} else {
			analysis.OverallDifficulty = "Medium"
		}
	} else {
		analysis.OverallDifficulty = "Unknown"
	}

	return analysis, nil
}

// getTimeAnalysis analyzes time-based performance
func (r *ExamRepository) getTimeAnalysis(ctx context.Context, examID string) (*interfaces.TimeAnalysis, error) {
	query := `
		SELECT
			AVG(time_spent_seconds) as avg_time,
			MIN(time_spent_seconds) as min_time,
			MAX(time_spent_seconds) as max_time
		FROM exam_attempts
		WHERE exam_id = $1 AND status = 'submitted' AND time_spent_seconds > 0
	`

	var avgTime, minTime, maxTime sql.NullFloat64

	err := r.db.QueryRowContext(ctx, query, examID).Scan(&avgTime, &minTime, &maxTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return &interfaces.TimeAnalysis{
				AverageCompletionTime: 0,
				FastestCompletion:     0,
				SlowestCompletion:     0,
				TimeDistribution:      make(map[string]int),
			}, nil
		}
		return nil, fmt.Errorf("failed to get time analysis: %w", err)
	}

	analysis := &interfaces.TimeAnalysis{
		TimeDistribution: make(map[string]int),
	}

	if avgTime.Valid {
		analysis.AverageCompletionTime = int(avgTime.Float64)
	}
	if minTime.Valid {
		analysis.FastestCompletion = int(minTime.Float64)
	}
	if maxTime.Valid {
		analysis.SlowestCompletion = int(maxTime.Float64)
	}

	// Get time distribution
	distributionQuery := `
		SELECT
			CASE
				WHEN time_spent_seconds < 300 THEN '0-5 min'
				WHEN time_spent_seconds < 600 THEN '5-10 min'
				WHEN time_spent_seconds < 1200 THEN '10-20 min'
				WHEN time_spent_seconds < 1800 THEN '20-30 min'
				WHEN time_spent_seconds < 3600 THEN '30-60 min'
				ELSE '60+ min'
			END as time_range,
			COUNT(*) as count
		FROM exam_attempts
		WHERE exam_id = $1 AND status = 'submitted' AND time_spent_seconds > 0
		GROUP BY time_range
	`

	rows, err := r.db.QueryContext(ctx, distributionQuery, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to query time distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var timeRange string
		var count int

		err := rows.Scan(&timeRange, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan time distribution: %w", err)
		}

		analysis.TimeDistribution[timeRange] = count
	}

	return analysis, nil
}

// getPerformanceTrends analyzes performance trends over time
func (r *ExamRepository) getPerformanceTrends(ctx context.Context, examID string) ([]*interfaces.PerformanceTrend, error) {
	query := `
		SELECT
			DATE(submitted_at) as date,
			COUNT(*) as attempts,
			AVG(percentage) as avg_score,
			COUNT(CASE WHEN passed = true THEN 1 END)::FLOAT / COUNT(*) * 100 as pass_rate
		FROM exam_attempts
		WHERE exam_id = $1 AND status = 'submitted'
		GROUP BY DATE(submitted_at)
		ORDER BY date DESC
		LIMIT 30
	`

	rows, err := r.db.QueryContext(ctx, query, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to query performance trends: %w", err)
	}
	defer rows.Close()

	var trends []*interfaces.PerformanceTrend
	for rows.Next() {
		var trend interfaces.PerformanceTrend
		var date time.Time
		var avgScore sql.NullFloat64
		var passRate sql.NullFloat64

		err := rows.Scan(&date, &trend.AttemptCount, &avgScore, &passRate)
		if err != nil {
			return nil, fmt.Errorf("failed to scan performance trend: %w", err)
		}

		trend.Date = date.Format("2006-01-02")
		if avgScore.Valid {
			trend.AverageScore = avgScore.Float64
		}
		if passRate.Valid {
			trend.PassRate = passRate.Float64
		}

		trends = append(trends, &trend)
	}

	return trends, nil
}

// Search performs search on exams
func (r *ExamRepository) Search(ctx context.Context, searchCriteria *interfaces.ExamSearchCriteria, filters *interfaces.ExamFilters, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	// TODO: Implement proper search functionality
	return nil, 0, fmt.Errorf("Search not implemented yet")
}

