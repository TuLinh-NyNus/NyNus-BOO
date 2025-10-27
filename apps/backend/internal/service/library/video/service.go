package video

import (
	"context"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// DownloadAudit stores metadata for download tracking.
type DownloadAudit struct {
	UserID    *string
	IPAddress string
	UserAgent string
}

// Service orchestrates library video operations.
type Service struct {
	repo repository.LibraryVideoRepository
}

// NewService creates a new video service instance.
func NewService(repo repository.LibraryVideoRepository) *Service {
	return &Service{repo: repo}
}

// List returns videos matching the provided filters.
func (s *Service) List(ctx context.Context, filters repository.LibraryVideoListFilters) ([]*entity.LibraryVideo, int, error) {
	return s.repo.List(ctx, filters)
}

// Get retrieves a single video by identifier.
func (s *Service) Get(ctx context.Context, id string) (*entity.LibraryVideo, error) {
	trimmed := strings.TrimSpace(id)
	if trimmed == "" {
		return nil, repository.ErrInvalidInput
	}
	return s.repo.GetByID(ctx, trimmed)
}

// IncrementDownload registers a download event and returns the new count.
func (s *Service) IncrementDownload(ctx context.Context, id string, audit DownloadAudit) (int, error) {
	trimmed := strings.TrimSpace(id)
	if trimmed == "" {
		return 0, repository.ErrInvalidInput
	}
	return s.repo.IncrementDownloadCount(ctx, trimmed, audit.UserID, audit.IPAddress, audit.UserAgent)
}
