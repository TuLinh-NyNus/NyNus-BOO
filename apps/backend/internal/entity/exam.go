package entity

import (
	"time"
)

type Exam struct {
	ID              string    `json:"id" db:"id"`
	Title           string    `json:"title" db:"title"`
	Description     string    `json:"description" db:"description"`
	DurationMinutes int       `json:"duration_minutes" db:"duration_minutes"`
	CreatedBy       string    `json:"created_by" db:"created_by"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}
