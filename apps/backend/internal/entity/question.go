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
	QuestionTypeMA QuestionType = "MA" // Matching - GhÃ©p Ä‘Ã´i
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
	QuestionDifficultyExpert QuestionDifficulty = "EXPERT" // ChuyÃªn gia/Ráº¥t khÃ³
)

// Question represents a question in the advanced question bank system
type Question struct {
	ID            pgtype.Text      `json:"id"`
	RawContent    pgtype.Text      `json:"raw_content"`
	Content       pgtype.Text      `json:"content"`
	Subcount      pgtype.Text      `json:"subcount"`
	Type          pgtype.Text      `json:"type"` // QuestionType enum
	Source        pgtype.Text      `json:"source"`
	Answers       pgtype.JSONB     `json:"answers"`        // JSON array of answer options
	CorrectAnswer pgtype.JSONB     `json:"correct_answer"` // JSON of correct answer(s)
	Solution      pgtype.Text      `json:"solution"`
	Tag           pgtype.TextArray `json:"tag"`

	// Metadata & Classification (optional, for filtering purposes only)
	Grade   pgtype.Text `json:"grade"`   // Lá»›p (0,1,2) - Optional classification
	Subject pgtype.Text `json:"subject"` // MÃ´n há»c (P,L,H) - Optional classification
	Chapter pgtype.Text `json:"chapter"` // ChÆ°Æ¡ng (1-9) - Optional classification
	Level   pgtype.Text `json:"level"`   // Má»©c Ä‘á»™ (N,H,V,C,T,M) - Optional classification

	// Usage tracking
	UsageCount     pgtype.Int4        `json:"usage_count"`
	Creator        pgtype.Text        `json:"creator"`
	Status         pgtype.Text        `json:"status"` // QuestionStatus enum
	Feedback       pgtype.Int4        `json:"feedback"`
	Difficulty     pgtype.Text        `json:"difficulty"` // QuestionDifficulty enum
	IsFavorite     pgtype.Bool        `json:"is_favorite"`     // Favorite marking
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
		"grade",
		"subject",
		"chapter",
		"level",
		"usage_count",
		"creator",
		"status",
		"feedback",
		"difficulty",
		"is_favorite",
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
		&q.Grade,
		&q.Subject,
		&q.Chapter,
		&q.Level,
		&q.UsageCount,
		&q.Creator,
		&q.Status,
		&q.Feedback,
		&q.Difficulty,
		&q.IsFavorite,
		&q.CreatedAt,
		&q.UpdatedAt,
		&q.QuestionCodeID,
	}

	return fields, values
}
