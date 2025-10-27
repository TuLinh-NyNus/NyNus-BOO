package entity

import (
	"database/sql"
	"time"
)

// LibraryExam aggregates library_items with exam_metadata to describe exam resources in the library.
type LibraryExam struct {
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

	Subject       string
	Grade         string
	Province      sql.NullString
	School        sql.NullString
	AcademicYear  string
	Semester      sql.NullString
	ExamDuration  sql.NullInt32
	QuestionCount sql.NullInt32
	Difficulty    sql.NullString
	ExamType      string
	RequiredRole  string
	RequiredLevel sql.NullInt32
	TargetRoles   []string
	Tags          []string
}
