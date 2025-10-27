package entity

import (
	"database/sql"
	"time"
)

// LibraryVideo represents a video resource composed from library_items and video_metadata.
type LibraryVideo struct {
	ID            string
	Title         string
	Description   sql.NullString
	Category      sql.NullString
	FileURL       sql.NullString
	FileID        sql.NullString
	ThumbnailURL  sql.NullString
	FileSize      sql.NullInt64
	UploadStatus  string
	IsActive      bool
	DownloadCount int
	AverageRating float64
	ReviewCount   int
	UploadedBy    sql.NullString
	ApprovedBy    sql.NullString
	CreatedAt     time.Time
	UpdatedAt     time.Time

	YoutubeURL     string
	YoutubeID      string
	Duration       sql.NullInt32
	Quality        sql.NullString
	InstructorName sql.NullString
	RelatedExamID  sql.NullString
	Subject        string
	Grade          string
	RequiredRole   string
	RequiredLevel  sql.NullInt32
	TargetRoles    []string
	Tags           []string
}

