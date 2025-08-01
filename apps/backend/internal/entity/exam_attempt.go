package entity

import (
	"time"
)

type ExamAttempt struct {
	ID          string     `json:"id" db:"id"`
	ExamID      string     `json:"exam_id" db:"exam_id"`
	UserID      string     `json:"user_id" db:"user_id"`
	Score       int        `json:"score" db:"score"`
	Completed   bool       `json:"completed" db:"completed"`
	StartedAt   time.Time  `json:"started_at" db:"started_at"`
	CompletedAt *time.Time `json:"completed_at" db:"completed_at"`
}
