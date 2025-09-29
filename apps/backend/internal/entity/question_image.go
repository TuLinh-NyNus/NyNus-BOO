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
	ID              pgtype.Text        `json:"id"`
	QuestionID      pgtype.Text        `json:"question_id"`
	ImageType       pgtype.Text        `json:"image_type"` // ImageType enum
	ImagePath       pgtype.Text        `json:"image_path"`
	DriveURL        pgtype.Text        `json:"drive_url"`
	DriveFileID     pgtype.Text        `json:"drive_file_id"`
	Status          pgtype.Text        `json:"status"` // ImageStatus enum
	CreatedAt       pgtype.Timestamptz `json:"created_at"`
	UpdatedAt       pgtype.Timestamptz `json:"updated_at"`
	// Additional fields for image upload management
	Type            pgtype.Text        `json:"type"`             // Alias for ImageType
	TikzCode        pgtype.Text        `json:"tikz_code"`        // LaTeX TikZ code
	WebViewLink     pgtype.Text        `json:"web_view_link"`    // Google Drive web view link
	WebContentLink  pgtype.Text        `json:"web_content_link"` // Google Drive content link
	ThumbnailLink   pgtype.Text        `json:"thumbnail_link"`   // Google Drive thumbnail link
}

// TableName returns the table name for QuestionImage
func (qi QuestionImage) TableName() string {
	return "question_image"
}

// FieldMap returns the field mapping for database operations
func (qi QuestionImage) FieldMap() ([]string, []interface{}) {
	fields := []string{
		"id",
		"question_id",
		"image_type",
		"image_path",
		"drive_url",
		"drive_file_id",
		"status",
		"created_at",
		"updated_at",
		"type",
		"tikz_code",
		"web_view_link",
		"web_content_link",
		"thumbnail_link",
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
		&qi.Type,
		&qi.TikzCode,
		&qi.WebViewLink,
		&qi.WebContentLink,
		&qi.ThumbnailLink,
	}

	return fields, values
}
