package entity

import (
	"time"
)

type Question struct {
	ID          string    `json:"id" db:"id"`
	Text        string    `json:"text" db:"text"`
	Type        string    `json:"type" db:"type"`
	Difficulty  string    `json:"difficulty" db:"difficulty"`
	Explanation string    `json:"explanation" db:"explanation"`
	Tags        []string  `json:"tags" db:"tags"`
	Points      int       `json:"points" db:"points"`
	CreatedBy   string    `json:"created_by" db:"created_by"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
