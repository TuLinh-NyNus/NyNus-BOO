package entity

import (
	"github.com/jackc/pgtype"
)

// ImageType represents the type of image
type ImageType string

const (
	ImageTypeQuestion ImageType = "QUESTION"
	ImageTypeSolution ImageType = "SOLUTION"
)

// ImageStatus represents the status of an image
type ImageStatus string

const (
	ImageStatusPending   ImageStatus = "PENDING"
	ImageStatusUploading ImageStatus = "UPLOADING"
	ImageStatusUploaded  ImageStatus = "UPLOADED"
	ImageStatusFailed    ImageStatus = "FAILED"
)

// QuestionImage represents an image associated with a question
type QuestionImage struct {
	ID          pgtype.Text        `json:"id"`
	QuestionID  pgtype.Text        `json:"question_id"`
	ImageType   pgtype.Text        `json:"image_type"`   // ImageType enum
	ImagePath   pgtype.Text        `json:"image_path"`
	DriveURL    pgtype.Text        `json:"drive_url"`
	DriveFileID pgtype.Text        `json:"drive_file_id"`
	Status      pgtype.Text        `json:"status"`      // ImageStatus enum
	CreatedAt   pgtype.Timestamptz `json:"created_at"`
	UpdatedAt   pgtype.Timestamptz `json:"updated_at"`
}

// TableName returns the table name for QuestionImage
func (qi QuestionImage) TableName() string {
	return "questionimage"
}

// FieldMap returns the field mapping for database operations
func (qi QuestionImage) FieldMap() ([]string, []interface{}) {
	fields := []string{
		"id",
		"questionid",
		"imagetype",
		"imagepath",
		"driveurl",
		"drivefileid",
		"status",
		"created_at",
		"updated_at",
	}
	
	values := []interface{}{
		&qi.ID,
		&qi.QuestionID,
		&qi.ImageType,
		&qi.ImagePath,
		&qi.DriveURL,
		&qi.DriveFileID,
		&qi.Status,
		&qi.CreatedAt,
		&qi.UpdatedAt,
	}
	
	return fields, values
}
