package entity

import (
	"time"

	"github.com/google/uuid"
)

// ExamStatus represents the status of an exam
type ExamStatus string

const (
	ExamStatusDraft     ExamStatus = "draft"
	ExamStatusPublished ExamStatus = "published"
	ExamStatusArchived  ExamStatus = "archived"
)

// ExamType represents the type of exam
type ExamType string

const (
	ExamTypePractice ExamType = "practice"
	ExamTypeQuiz     ExamType = "quiz"
	ExamTypeMidterm  ExamType = "midterm"
	ExamTypeFinal    ExamType = "final"
	ExamTypeCustom   ExamType = "custom"
)

// Exam represents an exam definition
type Exam struct {
	ID              string     `json:"id" db:"id"`
	Title           string     `json:"title" db:"title"`
	Description     string     `json:"description" db:"description"`
	Instructions    string     `json:"instructions" db:"instructions"`
	DurationMinutes int        `json:"duration_minutes" db:"duration_minutes"`
	TotalPoints     int        `json:"total_points" db:"total_points"`
	PassPercentage  int        `json:"pass_percentage" db:"pass_percentage"`
	ExamType        ExamType   `json:"exam_type" db:"exam_type"`
	Status          ExamStatus `json:"status" db:"status"`

	// Settings
	ShuffleQuestions bool `json:"shuffle_questions" db:"shuffle_questions"`
	ShuffleAnswers   bool `json:"shuffle_answers" db:"shuffle_answers"`
	ShowResults      bool `json:"show_results" db:"show_results"`
	ShowAnswers      bool `json:"show_answers" db:"show_answers"`
	AllowReview      bool `json:"allow_review" db:"allow_review"`
	MaxAttempts      int  `json:"max_attempts" db:"max_attempts"`

	// Questions (loaded separately)
	QuestionIDs []string `json:"question_ids"`

	// Timestamps
	CreatedBy   string     `json:"created_by" db:"created_by"`
	PublishedAt *time.Time `json:"published_at" db:"published_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// AttemptStatus represents the status of an exam attempt
type AttemptStatus string

const (
	AttemptStatusInProgress AttemptStatus = "in_progress"
	AttemptStatusSubmitted  AttemptStatus = "submitted"
	AttemptStatusGraded     AttemptStatus = "graded"
	AttemptStatusCancelled  AttemptStatus = "cancelled"
)

// ExamAttempt represents a user's attempt at an exam
type ExamAttempt struct {
	ID            string        `json:"id" db:"id"`
	ExamID        string        `json:"exam_id" db:"exam_id"`
	UserID        string        `json:"user_id" db:"user_id"`
	AttemptNumber int           `json:"attempt_number" db:"attempt_number"`
	Status        AttemptStatus `json:"status" db:"status"`
	Score         int           `json:"score" db:"score"`
	TotalPoints   int           `json:"total_points" db:"total_points"`
	Percentage    float64       `json:"percentage" db:"percentage"`
	Passed        bool          `json:"passed" db:"passed"`
	StartedAt     time.Time     `json:"started_at" db:"started_at"`
	SubmittedAt   *time.Time    `json:"submitted_at" db:"submitted_at"`
	TimeSpent     int           `json:"time_spent_seconds" db:"time_spent_seconds"`
}

// ExamQuestion represents a question in an exam
type ExamQuestion struct {
	ID          string `json:"id" db:"id"`
	ExamID      string `json:"exam_id" db:"exam_id"`
	QuestionID  string `json:"question_id" db:"question_id"`
	OrderNumber int    `json:"order_number" db:"order_number"`
	Points      int    `json:"points" db:"points"`
	IsBonus     bool   `json:"is_bonus" db:"is_bonus"`
}

// NewExam creates a new exam with defaults
func NewExam(title, description string, createdBy string) *Exam {
	return &Exam{
		ID:               uuid.New().String(),
		Title:            title,
		Description:      description,
		DurationMinutes:  60,
		PassPercentage:   60,
		ExamType:         ExamTypePractice,
		Status:           ExamStatusDraft,
		ShuffleQuestions: false,
		ShuffleAnswers:   false,
		ShowResults:      true,
		ShowAnswers:      false,
		AllowReview:      true,
		MaxAttempts:      1,
		QuestionIDs:      []string{},
		CreatedBy:        createdBy,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}
}
