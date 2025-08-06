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
	Code       pgtype.Text        `json:"code"`        // Primary key: 7-character code
	Format     pgtype.Text        `json:"format"`      // ID5 or ID6
	Grade      pgtype.Int4        `json:"grade"`       // Grade level (numeric)
	Subject    pgtype.Text        `json:"subject"`     // Subject code (1 character)
	Chapter    pgtype.Int4        `json:"chapter"`     // Chapter code (numeric)
	Lesson     pgtype.Int4        `json:"lesson"`      // Lesson code (numeric)
	Form       pgtype.Int4        `json:"form"`        // Form code (numeric, optional)
	Level      pgtype.Text        `json:"level"`       // Difficulty level (1 character)
	FolderPath pgtype.Text        `json:"folder_path"` // Generated folder path
	CreatedAt  pgtype.Timestamptz `json:"created_at"`
	UpdatedAt  pgtype.Timestamptz `json:"updated_at"`
}

// TableName returns the table name for QuestionCode
func (qc QuestionCode) TableName() string {
	return "questioncode"
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
		"folder_path",
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
		&qc.FolderPath,
		&qc.CreatedAt,
		&qc.UpdatedAt,
	}

	return fields, values
}
