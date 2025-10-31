package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// FocusTaskRepository implements the FocusTaskRepository interface
type FocusTaskRepository struct {
	db *sql.DB
}

// NewFocusTaskRepository creates a new focus task repository instance
func NewFocusTaskRepository(db *sql.DB) interfaces.FocusTaskRepository {
	return &FocusTaskRepository{db: db}
}

// Create creates a new focus task
func (r *FocusTaskRepository) Create(ctx context.Context, task *entity.FocusTask) error {
	query := `
		INSERT INTO focus_tasks (
			id, user_id, title, description, subject_tag, priority,
			is_completed, due_date, estimated_pomodoros, actual_pomodoros,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	// Generate ID if not provided
	if task.ID == uuid.Nil {
		task.ID = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	task.CreatedAt = now
	task.UpdatedAt = now

	_, err := r.db.ExecContext(
		ctx,
		query,
		task.ID,
		task.UserID,
		task.Title,
		task.Description,
		task.SubjectTag,
		task.Priority,
		task.IsCompleted,
		task.DueDate,
		task.EstimatedPomodoros,
		task.ActualPomodoros,
		task.CreatedAt,
		task.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create focus task: %w", err)
	}

	return nil
}

// GetByID retrieves a focus task by ID
func (r *FocusTaskRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.FocusTask, error) {
	query := `
		SELECT id, user_id, title, description, subject_tag, priority,
		       is_completed, due_date, estimated_pomodoros, actual_pomodoros,
		       completed_at, created_at, updated_at
		FROM focus_tasks
		WHERE id = $1
	`

	var task entity.FocusTask
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&task.ID,
		&task.UserID,
		&task.Title,
		&task.Description,
		&task.SubjectTag,
		&task.Priority,
		&task.IsCompleted,
		&task.DueDate,
		&task.EstimatedPomodoros,
		&task.ActualPomodoros,
		&task.CompletedAt,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("focus task not found: %w", err)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get focus task: %w", err)
	}

	return &task, nil
}

// ListUserTasks retrieves tasks for a user with filters and pagination
func (r *FocusTaskRepository) ListUserTasks(ctx context.Context, userID string, filter interfaces.TaskFilter) ([]*entity.FocusTask, int, error) {
	// Build WHERE clause
	where := "WHERE user_id = $1"
	args := []interface{}{userID}
	argPos := 2

	if filter.CompletedOnly {
		where += fmt.Sprintf(" AND is_completed = true")
	}

	if filter.ActiveOnly {
		where += fmt.Sprintf(" AND is_completed = false")
	}

	if filter.SubjectTag != nil {
		where += fmt.Sprintf(" AND subject_tag = $%d", argPos)
		args = append(args, *filter.SubjectTag)
		argPos++
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM focus_tasks %s", where)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to count tasks: %w", err)
	}

	// Set pagination defaults
	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 50
	}
	offset := (page - 1) * pageSize

	// Get tasks
	query := fmt.Sprintf(`
		SELECT id, user_id, title, description, subject_tag, priority,
		       is_completed, due_date, estimated_pomodoros, actual_pomodoros,
		       completed_at, created_at, updated_at
		FROM focus_tasks
		%s
		ORDER BY 
			CASE WHEN is_completed THEN 1 ELSE 0 END,
			due_date ASC NULLS LAST,
			created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argPos, argPos+1)

	args = append(args, pageSize, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list tasks: %w", err)
	}
	defer rows.Close()

	var tasks []*entity.FocusTask
	for rows.Next() {
		var task entity.FocusTask
		err := rows.Scan(
			&task.ID,
			&task.UserID,
			&task.Title,
			&task.Description,
			&task.SubjectTag,
			&task.Priority,
			&task.IsCompleted,
			&task.DueDate,
			&task.EstimatedPomodoros,
			&task.ActualPomodoros,
			&task.CompletedAt,
			&task.CreatedAt,
			&task.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, &task)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating tasks: %w", err)
	}

	return tasks, total, nil
}

// Update updates a focus task
func (r *FocusTaskRepository) Update(ctx context.Context, task *entity.FocusTask) error {
	query := `
		UPDATE focus_tasks
		SET title = $2, description = $3, subject_tag = $4, priority = $5,
		    is_completed = $6, due_date = $7, estimated_pomodoros = $8,
		    actual_pomodoros = $9, completed_at = $10, updated_at = $11
		WHERE id = $1
	`

	task.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		task.ID,
		task.Title,
		task.Description,
		task.SubjectTag,
		task.Priority,
		task.IsCompleted,
		task.DueDate,
		task.EstimatedPomodoros,
		task.ActualPomodoros,
		task.CompletedAt,
		task.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("task not found")
	}

	return nil
}

// Delete deletes a focus task
func (r *FocusTaskRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM focus_tasks WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("task not found")
	}

	return nil
}

// CompleteTask marks a task as completed
func (r *FocusTaskRepository) CompleteTask(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE focus_tasks
		SET is_completed = true, completed_at = $2, updated_at = $3
		WHERE id = $1 AND is_completed = false
	`

	now := time.Now()
	result, err := r.db.ExecContext(ctx, query, id, now, now)
	if err != nil {
		return fmt.Errorf("failed to complete task: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("task not found or already completed")
	}

	return nil
}

// IncrementPomodoro increments the actual pomodoro count for a task
func (r *FocusTaskRepository) IncrementPomodoro(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE focus_tasks
		SET actual_pomodoros = actual_pomodoros + 1, updated_at = $2
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id, time.Now())
	if err != nil {
		return fmt.Errorf("failed to increment pomodoro: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("task not found")
	}

	return nil
}


