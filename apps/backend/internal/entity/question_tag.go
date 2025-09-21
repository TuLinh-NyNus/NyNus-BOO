package entity

import (
	"github.com/jackc/pgtype"
)

// QuestionTag represents a tag associated with a question
type QuestionTag struct {
	ID         pgtype.Text        `json:"id"`
	QuestionID pgtype.Text        `json:"question_id"`
	TagName    pgtype.Text        `json:"tag_name"`
	CreatedAt  pgtype.Timestamptz `json:"created_at"`
}

// TableName returns the table name for QuestionTag
func (qt QuestionTag) TableName() string {
	return "QuestionTag"
}

// FieldMap returns the field mapping for database operations
func (qt QuestionTag) FieldMap() ([]string, []interface{}) {
	fields := []string{
		"id",
		"question_id",
		"tag_name",
		"created_at",
	}

	values := []interface{}{
		&qt.ID,
		&qt.QuestionID,
		&qt.TagName,
		&qt.CreatedAt,
	}

	return fields, values
}
