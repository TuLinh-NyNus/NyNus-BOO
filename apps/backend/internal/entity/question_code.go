package entity

import (
	"github.com/jackc/pgtype"
)

// CodeFormat represents the format of question codes
type CodeFormat string

const (
	CodeFormatID5 CodeFormat = "ID5"
	CodeFormatID6 CodeFormat = "ID6"
)

// QuestionCode represents a question code with hierarchical structure
type QuestionCode struct {
	Code      pgtype.Text        `json:"code"`    // Primary key: 7-character code
	Format    pgtype.Text        `json:"format"`  // ID5 or ID6
	Grade     pgtype.Text        `json:"grade"`   // Grade level (1 character)
	Subject   pgtype.Text        `json:"subject"` // Subject code (1 character)
	Chapter   pgtype.Text        `json:"chapter"` // Chapter code (1 character)
	Lesson    pgtype.Text        `json:"lesson"`  // Lesson code (1 character)
	Form      pgtype.Text        `json:"form"`    // Form code (1 character, optional)
	Level     pgtype.Text        `json:"level"`   // Difficulty level (1 character)
	CreatedAt pgtype.Timestamptz `json:"created_at"`
	UpdatedAt pgtype.Timestamptz `json:"updated_at"`
}

// TableName returns the table name for QuestionCode
func (qc QuestionCode) TableName() string {
	return "question_code"
}

// FieldMap returns the field mapping for database operations
func (qc QuestionCode) FieldMap() ([]string, []interface{}) {
	fields := []string{
		"code",
		"format",
		"grade",
		"subject",
		"chapter",
		"lesson",
		"form",
		"level",
		"created_at",
		"updated_at",
	}

	values := []interface{}{
		&qc.Code,
		&qc.Format,
		&qc.Grade,
		&qc.Subject,
		&qc.Chapter,
		&qc.Lesson,
		&qc.Form,
		&qc.Level,
		&qc.CreatedAt,
		&qc.UpdatedAt,
	}

	return fields, values
}
