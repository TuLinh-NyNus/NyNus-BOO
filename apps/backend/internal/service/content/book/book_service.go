package book

import (
	"context"
	"database/sql"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/util"
)

// DownloadAudit stores metadata when logging download events.
type DownloadAudit struct {
	UserID    *string
	IPAddress string
	UserAgent string
}

// CreateBookInput carries the data required to create a new book entry.
type CreateBookInput struct {
	Title           string
	Description     string
	Category        string
	Subject         string
	Grade           string
	BookType        string
	Author          string
	Publisher       string
	PublicationYear *int32
	PublicationDate *time.Time
	ISBN            string
	PageCount       *int32
	CoverImage      string
	FileURL         string
	FileID          string
	ThumbnailURL    string
	FileSize        *int64
	FileType        string
	Tags            []string
	UploadedBy      string
	ApprovedBy      string
	IsActive        bool
	UploadStatus    string
	RequiredRole    string
	RequiredLevel   *int32
	TargetRoles     []string
}

// UpdateBookInput carries the data used when updating a book.
type UpdateBookInput struct {
	Title           string
	Description     string
	Category        string
	Subject         string
	Grade           string
	BookType        string
	Author          string
	Publisher       string
	PublicationYear *int32
	PublicationDate *time.Time
	ISBN            string
	PageCount       *int32
	CoverImage      string
	FileURL         string
	FileID          string
	ThumbnailURL    string
	FileSize        *int64
	FileType        string
	Tags            []string
	IsActive        bool
	UploadStatus    string
	RequiredRole    string
	RequiredLevel   *int32
	TargetRoles     []string
	ApprovedBy      string
}

// BookService orchestrates Book operations against the repository.
type BookService struct {
	repo repository.BookRepository
}

// NewBookService instantiates the service.
func NewBookService(repo repository.BookRepository) *BookService {
	return &BookService{repo: repo}
}

// ListBooks returns a slice of books together with the total count.
func (s *BookService) ListBooks(ctx context.Context, filters repository.BookListFilters) ([]*entity.Book, int, error) {
	return s.repo.List(ctx, filters)
}

// CountActiveBooks returns the number of active books.
func (s *BookService) CountActiveBooks(ctx context.Context) (int, error) {
	return s.repo.CountActive(ctx)
}

// GetBook fetches a book by ID.
func (s *BookService) GetBook(ctx context.Context, id string) (*entity.Book, error) {
	return s.repo.GetByID(ctx, id)
}

// CreateBook creates a new book record.
func (s *BookService) CreateBook(ctx context.Context, input CreateBookInput) (*entity.Book, error) {
	book := &entity.Book{
		ID:              util.ULIDNow(),
		Title:           strings.TrimSpace(input.Title),
		Description:     stringToNull(input.Description),
		Category:        stringToNull(input.Category),
		Author:          stringToNull(input.Author),
		Publisher:       stringToNull(input.Publisher),
		PublicationYear: int32ToNull(input.PublicationYear),
		PublicationDate: timeToNull(input.PublicationDate),
		ISBN:            stringToNull(input.ISBN),
		PageCount:       int32ToNull(input.PageCount),
		CoverImage:      stringToNull(input.CoverImage),
		FileURL:         stringToNull(input.FileURL),
		FileID:          stringToNull(input.FileID),
		ThumbnailURL:    stringToNull(input.ThumbnailURL),
		FileSize:        int64ToNull(input.FileSize),
		FileType:        stringToNull(input.FileType),
		Subject:         stringToNull(input.Subject),
		Grade:           stringToNull(input.Grade),
		BookType:        stringToNull(input.BookType),
		UploadStatus:    normalizeUploadStatus(input.UploadStatus),
		IsActive:        input.IsActive,
		DownloadCount:   0,
		AverageRating:   0,
		ReviewCount:     0,
		Tags:            dedupeTags(input.Tags),
		RequiredRole:    normalizeRole(input.RequiredRole),
		RequiredLevel:   int32ToNull(input.RequiredLevel),
		TargetRoles:     normalizeTargetRoles(input.TargetRoles),
		UploadedBy:      stringToNull(input.UploadedBy),
		ApprovedBy:      stringToNull(input.ApprovedBy),
	}

	if err := s.repo.Create(ctx, book); err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, book.ID)
}

// UpdateBook updates an existing book.
func (s *BookService) UpdateBook(ctx context.Context, id string, input UpdateBookInput) (*entity.Book, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	existing.Title = strings.TrimSpace(input.Title)
	existing.Description = stringToNull(input.Description)
	existing.Category = stringToNull(input.Category)
	existing.Author = stringToNull(input.Author)
	existing.Publisher = stringToNull(input.Publisher)
	existing.PublicationYear = int32ToNull(input.PublicationYear)
	existing.PublicationDate = timeToNull(input.PublicationDate)
	existing.ISBN = stringToNull(input.ISBN)
	existing.PageCount = int32ToNull(input.PageCount)
	existing.CoverImage = stringToNull(input.CoverImage)
	existing.FileURL = stringToNull(input.FileURL)
	existing.FileID = stringToNull(input.FileID)
	existing.ThumbnailURL = stringToNull(input.ThumbnailURL)
	existing.FileSize = int64ToNull(input.FileSize)
	existing.FileType = stringToNull(input.FileType)
	existing.Subject = stringToNull(input.Subject)
	existing.Grade = stringToNull(input.Grade)
	existing.BookType = stringToNull(input.BookType)
	existing.Tags = dedupeTags(input.Tags)
	existing.UploadStatus = normalizeUploadStatus(input.UploadStatus)
	existing.IsActive = input.IsActive
	existing.RequiredRole = normalizeRole(input.RequiredRole)
	existing.RequiredLevel = int32ToNull(input.RequiredLevel)
	existing.TargetRoles = normalizeTargetRoles(input.TargetRoles)
	existing.ApprovedBy = stringToNull(input.ApprovedBy)

	if err := s.repo.Update(ctx, existing); err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, id)
}

// DeleteBook performs a soft delete (archive) operation.
func (s *BookService) DeleteBook(ctx context.Context, id string, archivedBy string) error {
	return s.repo.SoftDelete(ctx, id, archivedBy)
}

// IncrementDownload registers a download event.
func (s *BookService) IncrementDownload(ctx context.Context, id string, audit DownloadAudit) (int, error) {
	return s.repo.IncrementDownloadCount(ctx, id, audit.UserID, audit.IPAddress, audit.UserAgent)
}

func stringToNull(value string) sql.NullString {
	if strings.TrimSpace(value) == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: strings.TrimSpace(value), Valid: true}
}

func int32ToNull(value *int32) sql.NullInt32 {
	if value == nil {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{Int32: *value, Valid: true}
}

func int64ToNull(value *int64) sql.NullInt64 {
	if value == nil {
		return sql.NullInt64{Valid: false}
	}
	return sql.NullInt64{Int64: *value, Valid: true}
}

func timeToNull(value *time.Time) sql.NullTime {
	if value == nil {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{Time: *value, Valid: true}
}

func dedupeTags(tags []string) []string {
	seen := make(map[string]struct{}, len(tags))
	result := make([]string, 0, len(tags))
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}
		key := strings.ToLower(tag)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		result = append(result, tag)
	}
	return result
}

func normalizeUploadStatus(status string) string {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "pending", "approved", "rejected", "archived":
		return strings.ToLower(strings.TrimSpace(status))
	default:
		return "pending"
	}
}

func normalizeRole(role string) string {
	switch strings.ToUpper(strings.TrimSpace(role)) {
	case "GUEST", "STUDENT", "TUTOR", "TEACHER", "ADMIN":
		return strings.ToUpper(strings.TrimSpace(role))
	default:
		return "STUDENT"
	}
}

func normalizeTargetRoles(roles []string) []string {
	if len(roles) == 0 {
		return []string{"STUDENT", "TUTOR"}
	}
	normalized := make([]string, 0, len(roles))
	seen := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		role = strings.ToUpper(strings.TrimSpace(role))
		switch role {
		case "GUEST", "STUDENT", "TUTOR", "TEACHER", "ADMIN":
			if _, ok := seen[role]; !ok {
				seen[role] = struct{}{}
				normalized = append(normalized, role)
			}
		}
	}
	if len(normalized) == 0 {
		return []string{"STUDENT", "TUTOR"}
	}
	return normalized
}
