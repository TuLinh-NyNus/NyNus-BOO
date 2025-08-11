package entity

import (
	"github.com/jackc/pgtype"
)

// QuestionType represents the type of question
type QuestionType string

const (
	QuestionTypeMC QuestionType = "MC" // Multiple Choice
	QuestionTypeTF QuestionType = "TF" // True/False
	QuestionTypeSA QuestionType = "SA" // Short Answer
	QuestionTypeES QuestionType = "ES" // Essay
	QuestionTypeMA QuestionType = "MA" // Multiple Answer
)

// QuestionStatus represents the status of a question
type QuestionStatus string

const (
	QuestionStatusActive   QuestionStatus = "ACTIVE"
	QuestionStatusPending  QuestionStatus = "PENDING"
	QuestionStatusInactive QuestionStatus = "INACTIVE"
	QuestionStatusArchived QuestionStatus = "ARCHIVED"
)

// QuestionDifficulty represents the difficulty level of a question
type QuestionDifficulty string

const (
	QuestionDifficultyEasy   QuestionDifficulty = "EASY"
	QuestionDifficultyMedium QuestionDifficulty = "MEDIUM"
	QuestionDifficultyHard   QuestionDifficulty = "HARD"
)

// Question represents a question in the advanced question bank system
type Question struct {
	ID             pgtype.Text        `json:"id"`
	RawContent     pgtype.Text        `json:"raw_content"`
	Content        pgtype.Text        `json:"content"`
	Subcount       pgtype.Text        `json:"subcount"`
	Type           pgtype.Text        `json:"type"` // QuestionType enum
	Source         pgtype.Text        `json:"source"`
	Answers        pgtype.JSONB       `json:"answers"`        // JSON array of answer options
	CorrectAnswer  pgtype.JSONB       `json:"correct_answer"` // JSON of correct answer(s)
	Solution       pgtype.Text        `json:"solution"`
	Tag            pgtype.TextArray   `json:"tag"`
	UsageCount     pgtype.Int4        `json:"usage_count"`
	Creator        pgtype.Text        `json:"creator"`
	Status         pgtype.Text        `json:"status"` // QuestionStatus enum
	Feedback       pgtype.Int4        `json:"feedback"`
	Difficulty     pgtype.Text        `json:"difficulty"` // QuestionDifficulty enum
	CreatedAt      pgtype.Timestamptz `json:"created_at"`
	UpdatedAt      pgtype.Timestamptz `json:"updated_at"`
	QuestionCodeID pgtype.Text        `json:"question_code_id"` // Foreign key to QuestionCode
}

// TableName returns the table name for Question
func (q Question) TableName() string {
	return "question"
}

// FieldMap returns the field mapping for database operations
func (q Question) FieldMap() ([]string, []interface{}) {
	fields := []string{
		"id",
		"raw_content",
		"content",
		"subcount",
		"type",
		"source",
		"answers",
		"correct_answer",
		"solution",
		"tag",
		"usage_count",
		"creator",
		"status",
		"feedback",
		"difficulty",
		"created_at",
		"updated_at",
		"question_code_id",
	}

	values := []interface{}{
		&q.ID,
		&q.RawContent,
		&q.Content,
		&q.Subcount,
		&q.Type,
		&q.Source,
		&q.Answers,
		&q.CorrectAnswer,
		&q.Solution,
		&q.Tag,
		&q.UsageCount,
		&q.Creator,
		&q.Status,
		&q.Feedback,
		&q.Difficulty,
		&q.CreatedAt,
		&q.UpdatedAt,
		&q.QuestionCodeID,
	}

	return fields, values
}
