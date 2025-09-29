package entity

import (
	"time"

	"github.com/google/uuid"
)

// ExamStatus represents the status of an exam
// Aligned with ExamSystem.md design and Question system
type ExamStatus string

const (
	ExamStatusActive   ExamStatus = "ACTIVE"   // Đã xuất bản, students có thể làm (was 'published')
	ExamStatusPending  ExamStatus = "PENDING"  // Đang soạn thảo, chờ review (was 'draft')
	ExamStatusInactive ExamStatus = "INACTIVE" // Tạm ngưng (new status)
	ExamStatusArchived ExamStatus = "ARCHIVED" // Đã lưu trữ (was 'archived')
)

// ExamType represents the type of exam
// Aligned with ExamSystem.md design - simplified to focus on source distinction
type ExamType string

const (
	ExamTypeGenerated ExamType = "generated" // Đề thi tạo từ ngân hàng câu hỏi
	ExamTypeOfficial  ExamType = "official"  // Đề thi thật từ trường/sở
)

// Difficulty represents the difficulty level of an exam
// Aligned with Question system difficulty enum
type Difficulty string

const (
	DifficultyEasy   Difficulty = "EASY"   // Dễ
	DifficultyMedium Difficulty = "MEDIUM" // Trung bình
	DifficultyHard   Difficulty = "HARD"   // Khó
	DifficultyExpert Difficulty = "EXPERT" // Rất khó (aligned with Question system)
)

// Exam represents an exam definition
// Updated to align with ExamSystem.md design
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

	// Academic Classification (ESSENTIAL - from ExamSystem.md)
	Subject    string     `json:"subject" db:"subject"`       // Môn học (REQUIRED)
	Grade      *int       `json:"grade" db:"grade"`           // Khối lớp (1-12)
	Difficulty Difficulty `json:"difficulty" db:"difficulty"` // EASY, MEDIUM, HARD, EXPERT
	Tags       []string   `json:"tags" db:"tags"`             // Tags tìm kiếm

	// Settings
	ShuffleQuestions bool `json:"shuffle_questions" db:"shuffle_questions"`
	ShowResults      bool `json:"show_results" db:"show_results"`
	MaxAttempts      int  `json:"max_attempts" db:"max_attempts"`

	// Official Exam Fields (OPTIONAL - chỉ cho exam_type = 'official')
	SourceInstitution *string `json:"source_institution,omitempty" db:"source_institution"` // Tên trường/sở
	ExamYear          *string `json:"exam_year,omitempty" db:"exam_year"`                   // Năm thi (VD: "2024")
	ExamCode          *string `json:"exam_code,omitempty" db:"exam_code"`                   // Mã đề (VD: "001", "A")
	FileURL           *string `json:"file_url,omitempty" db:"file_url"`                     // Link file PDF

	// Integration Fields (NEW)
	Version int `json:"version" db:"version"` // For optimistic locking

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
	ID          string    `json:"id" db:"id"`
	ExamID      string    `json:"exam_id" db:"exam_id"`
	QuestionID  string    `json:"question_id" db:"question_id"`
	OrderNumber int       `json:"order_number" db:"order_number"`
	Points      int       `json:"points" db:"points"`
	IsBonus     bool      `json:"is_bonus" db:"is_bonus"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// ExamAnswer represents a user's answer to a question in an exam attempt
type ExamAnswer struct {
	ID               string    `json:"id" db:"id"`
	AttemptID        string    `json:"attempt_id" db:"attempt_id"`
	QuestionID       string    `json:"question_id" db:"question_id"`
	AnswerData       string    `json:"answer_data" db:"answer_data"` // JSONB stored as string
	IsCorrect        *bool     `json:"is_correct" db:"is_correct"`   // Nullable for manual grading
	PointsEarned     float64   `json:"points_earned" db:"points_earned"`
	TimeSpentSeconds *int      `json:"time_spent_seconds" db:"time_spent_seconds"`
	AnsweredAt       time.Time `json:"answered_at" db:"answered_at"`
}

// ExamResult represents summary statistics for a completed exam attempt
type ExamResult struct {
	ID                 string    `json:"id" db:"id"`
	AttemptID          string    `json:"attempt_id" db:"attempt_id"`
	TotalQuestions     int       `json:"total_questions" db:"total_questions"`
	CorrectAnswers     int       `json:"correct_answers" db:"correct_answers"`
	IncorrectAnswers   int       `json:"incorrect_answers" db:"incorrect_answers"`
	Unanswered         int       `json:"unanswered" db:"unanswered"`
	ScoreBreakdown     string    `json:"score_breakdown" db:"score_breakdown"` // JSONB stored as string
	AccuracyPercentage *float64  `json:"accuracy_percentage" db:"accuracy_percentage"`
	AvgTimePerQuestion *float64  `json:"avg_time_per_question" db:"avg_time_per_question"`
	Feedback           *string   `json:"feedback" db:"feedback"`
	Grade              *string   `json:"grade" db:"grade"` // A+, A, B+, B, C, D, F
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
}

// ExamFeedback represents user feedback about an exam
type ExamFeedback struct {
	ID               string    `json:"id" db:"id"`
	ExamID           string    `json:"exam_id" db:"exam_id"`
	UserID           string    `json:"user_id" db:"user_id"`
	AttemptID        *string   `json:"attempt_id" db:"attempt_id"`
	Rating           *int      `json:"rating" db:"rating"`                       // 1-5 scale
	DifficultyRating *int      `json:"difficulty_rating" db:"difficulty_rating"` // 1-5 scale
	Content          *string   `json:"content" db:"content"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

// NewExam creates a new exam with defaults
// Updated to align with ExamSystem.md design
func NewExam(title, description string, createdBy string) *Exam {
	return &Exam{
		ID:              uuid.New().String(),
		Title:           title,
		Description:     description,
		DurationMinutes: 60,
		PassPercentage:  60,
		ExamType:        ExamTypeGenerated, // Default to 'generated'
		Status:          ExamStatusPending, // Default to 'PENDING'

		// Academic Classification defaults
		Subject:    "",               // Must be set by caller
		Grade:      nil,              // Optional
		Difficulty: DifficultyMedium, // Default difficulty
		Tags:       []string{},

		// Settings defaults
		ShuffleQuestions: false,
		ShowResults:      true,
		MaxAttempts:      1,

		// Official exam fields (nil for generated exams)
		SourceInstitution: nil,
		ExamYear:          nil,
		ExamCode:          nil,
		FileURL:           nil,

		// Integration fields
		Version: 1, // Start with version 1

		// Questions
		QuestionIDs: []string{},

		// Timestamps
		CreatedBy: createdBy,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}
