package entity

import (
	"time"
)

type Answer struct {
	ID         string    `json:"id" db:"id"`
	QuestionID string    `json:"question_id" db:"question_id"`
	Text       string    `json:"text" db:"text"`
	IsCorrect  bool      `json:"is_correct" db:"is_correct"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}
