package entity

import (
	"database/sql"
	"time"
)

// Book aggregates library_items and book_metadata records into a single view.
type Book struct {
	ID              string
	Title           string
	Description     sql.NullString
	Category        sql.NullString
	Author          sql.NullString
	Publisher       sql.NullString
	PublicationYear sql.NullInt32
	PublicationDate sql.NullTime
	ISBN            sql.NullString
	PageCount       sql.NullInt32
	CoverImage      sql.NullString
	FileURL         sql.NullString
	FileID          sql.NullString
	ThumbnailURL    sql.NullString
	FileSize        sql.NullInt64
	FileType        sql.NullString
	Subject         sql.NullString
	Grade           sql.NullString
	BookType        sql.NullString
	UploadStatus    string
	IsActive        bool
	DownloadCount   int
	AverageRating   float64
	ReviewCount     int
	Tags            []string
	RequiredRole    string
	RequiredLevel   sql.NullInt32
	TargetRoles     []string
	UploadedBy      sql.NullString
	ApprovedBy      sql.NullString
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
