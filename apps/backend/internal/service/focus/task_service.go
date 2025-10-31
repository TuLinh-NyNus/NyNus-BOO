package focus

import (
	"context"
	"fmt"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// TaskService handles business logic for focus tasks
type TaskService struct {
	taskRepo interfaces.FocusTaskRepository
}

// NewTaskService creates a new task service instance
func NewTaskService(taskRepo interfaces.FocusTaskRepository) *TaskService {
	return &TaskService{
		taskRepo: taskRepo,
	}
}

// CreateTask creates a new focus task with validation
func (s *TaskService) CreateTask(ctx context.Context, task *entity.FocusTask) error {
	// Validate task
	if err := task.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Generate ID
	task.ID = uuid.New()

	// Create task
	if err := s.taskRepo.Create(ctx, task); err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}

	return nil
}

// UpdateTask updates an existing task
func (s *TaskService) UpdateTask(ctx context.Context, taskID uuid.UUID, userID string, updates *entity.FocusTask) error {
	// Get existing task
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// Verify ownership
	if task.UserID != userID {
		return fmt.Errorf("task does not belong to user")
	}

	// Update fields
	updates.ID = taskID
	updates.UserID = userID

	// Validate
	if err := updates.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Update task
	if err := s.taskRepo.Update(ctx, updates); err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	return nil
}

// DeleteTask deletes a task
func (s *TaskService) DeleteTask(ctx context.Context, taskID uuid.UUID, userID string) error {
	// Get task
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// Verify ownership
	if task.UserID != userID {
		return fmt.Errorf("task does not belong to user")
	}

	// Delete task
	if err := s.taskRepo.Delete(ctx, taskID); err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	return nil
}

// ListTasks retrieves tasks for a user with filters
func (s *TaskService) ListTasks(ctx context.Context, userID string, filter interfaces.TaskFilter) ([]*entity.FocusTask, int, error) {
	tasks, total, err := s.taskRepo.ListUserTasks(ctx, userID, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list tasks: %w", err)
	}

	return tasks, total, nil
}

// CompleteTask marks a task as completed
func (s *TaskService) CompleteTask(ctx context.Context, taskID uuid.UUID, userID string) error {
	// Get task
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// Verify ownership
	if task.UserID != userID {
		return fmt.Errorf("task does not belong to user")
	}

	// Complete task
	if err := s.taskRepo.CompleteTask(ctx, taskID); err != nil {
		return fmt.Errorf("failed to complete task: %w", err)
	}

	return nil
}

// LinkTaskToSession increments pomodoro count when a focus session is completed with this task
func (s *TaskService) LinkTaskToSession(ctx context.Context, taskID uuid.UUID) error {
	if err := s.taskRepo.IncrementPomodoro(ctx, taskID); err != nil {
		return fmt.Errorf("failed to link task to session: %w", err)
	}

	return nil
}

// GetTask retrieves a single task by ID
func (s *TaskService) GetTask(ctx context.Context, taskID uuid.UUID, userID string) (*entity.FocusTask, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}

	// Verify ownership
	if task.UserID != userID {
		return nil, fmt.Errorf("task does not belong to user")
	}

	return task, nil
}
