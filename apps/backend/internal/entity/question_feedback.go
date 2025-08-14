package entity

import (
	"github.com/jackc/pgtype"
)

// FeedbackType represents the type of feedback
type FeedbackType string

const (
	FeedbackTypeLike       FeedbackType = "LIKE"
	FeedbackTypeDislike    FeedbackType = "DISLIKE"
	FeedbackTypeReport     FeedbackType = "REPORT"
	FeedbackTypeSuggestion FeedbackType = "SUGGESTION"
)

// QuestionFeedback represents feedback on a question
type QuestionFeedback struct {
	ID           pgtype.Text        `json:"id"`
	QuestionID   pgtype.Text        `json:"question_id"`
	UserID       pgtype.Text        `json:"user_id"`
	FeedbackType pgtype.Text        `json:"feedback_type"` // FeedbackType enum
	Content      pgtype.Text        `json:"content"`
	Rating       pgtype.Int4        `json:"rating"`
	CreatedAt    pgtype.Timestamptz `json:"created_at"`
}

// TableName returns the table name for QuestionFeedback
func (qf QuestionFeedback) TableName() string {
	return "question_feedback"
}

// FieldMap returns the field mapping for database operations
func (qf QuestionFeedback) FieldMap() ([]string, []interface{}) {
	fields := []string{
		"id",
		"question_id",
		"user_id",
		"feedback_type",
		"content",
		"rating",
		"created_at",
	}

	values := []interface{}{
		&qf.ID,
		&qf.QuestionID,
		&qf.UserID,
		&qf.FeedbackType,
		&qf.Content,
		&qf.Rating,
		&qf.CreatedAt,
	}

	return fields, values
}
