package entity

import (
	"time"

	"github.com/google/uuid"
)

// TaskPriority represents the priority level of a task
type TaskPriority string

const (
	TaskPriorityLow    TaskPriority = "low"    // Thấp
	TaskPriorityMedium TaskPriority = "medium" // Trung bình
	TaskPriorityHigh   TaskPriority = "high"   // Cao
)

// FocusTask represents a task/todo item for students
type FocusTask struct {
	ID                 uuid.UUID     `json:"id" db:"id"`
	UserID             string        `json:"user_id" db:"user_id"`
	Title              string        `json:"title" db:"title"`
	Description        *string       `json:"description,omitempty" db:"description"`
	SubjectTag         *string       `json:"subject_tag,omitempty" db:"subject_tag"`
	Priority           TaskPriority  `json:"priority" db:"priority"`
	IsCompleted        bool          `json:"is_completed" db:"is_completed"`
	DueDate            *time.Time    `json:"due_date,omitempty" db:"due_date"`
	EstimatedPomodoros *int          `json:"estimated_pomodoros,omitempty" db:"estimated_pomodoros"`
	ActualPomodoros    int           `json:"actual_pomodoros" db:"actual_pomodoros"`
	CompletedAt        *time.Time    `json:"completed_at,omitempty" db:"completed_at"`
	CreatedAt          time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time     `json:"updated_at" db:"updated_at"`
}

// TableName returns the table name for FocusTask
func (FocusTask) TableName() string {
	return "focus_tasks"
}

// Validate validates the FocusTask entity
func (t *FocusTask) Validate() error {
	if t.Title == "" {
		return ErrInvalidInput{Field: "title", Message: "Tiêu đề task không được để trống"}
	}
	if len(t.Title) > 500 {
		return ErrInvalidInput{Field: "title", Message: "Tiêu đề task không được quá 500 ký tự"}
	}
	if t.UserID == "" {
		return ErrInvalidInput{Field: "user_id", Message: "User ID không được để trống"}
	}
	if t.Priority != TaskPriorityLow && t.Priority != TaskPriorityMedium && t.Priority != TaskPriorityHigh {
		return ErrInvalidInput{Field: "priority", Message: "Priority không hợp lệ"}
	}
	if t.EstimatedPomodoros != nil && *t.EstimatedPomodoros < 0 {
		return ErrInvalidInput{Field: "estimated_pomodoros", Message: "Estimated pomodoros không được âm"}
	}
	return nil
}

// Complete marks the task as completed
func (t *FocusTask) Complete() {
	t.IsCompleted = true
	now := time.Now()
	t.CompletedAt = &now
	t.UpdatedAt = now
}

// Uncomplete marks the task as not completed
func (t *FocusTask) Uncomplete() {
	t.IsCompleted = false
	t.CompletedAt = nil
	t.UpdatedAt = time.Now()
}

// IsOverdue checks if task is overdue
func (t *FocusTask) IsOverdue() bool {
	if t.IsCompleted || t.DueDate == nil {
		return false
	}
	return time.Now().After(*t.DueDate)
}

// IncrementPomodoro increases actual pomodoros count
func (t *FocusTask) IncrementPomodoro() {
	t.ActualPomodoros++
	t.UpdatedAt = time.Now()
}


