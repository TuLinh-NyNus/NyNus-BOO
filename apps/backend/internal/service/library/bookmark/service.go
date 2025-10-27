package bookmark

import (
	"context"
	"errors"
	"strings"

	"exam-bank-system/apps/backend/internal/repository"
)

// Service coordinates bookmark operations.
type Service struct {
	repo repository.UserBookmarkRepository
}

// NewService constructs a bookmark service instance.
func NewService(repo repository.UserBookmarkRepository) *Service {
	return &Service{repo: repo}
}

// Set toggles bookmark status for a user and returns the resulting state.
func (s *Service) Set(ctx context.Context, itemID, userID string, bookmarked bool) (bool, error) {
	item := strings.TrimSpace(itemID)
	user := strings.TrimSpace(userID)
	if item == "" || user == "" {
		return false, repository.ErrInvalidInput
	}

	if bookmarked {
		if err := s.repo.Add(ctx, item, user); err != nil {
			return false, err
		}
		return true, nil
	}

	if err := s.repo.Remove(ctx, item, user); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return false, nil
		}
		return false, err
	}
	return false, nil
}

// IsBookmarked checks bookmark existence for user and item.
func (s *Service) IsBookmarked(ctx context.Context, itemID, userID string) (bool, error) {
	item := strings.TrimSpace(itemID)
	user := strings.TrimSpace(userID)
	if item == "" || user == "" {
		return false, repository.ErrInvalidInput
	}

	return s.repo.IsBookmarked(ctx, item, user)
}

// Count returns the number of bookmarks for an item.
func (s *Service) Count(ctx context.Context, itemID string) (int, error) {
	item := strings.TrimSpace(itemID)
	if item == "" {
		return 0, repository.ErrInvalidInput
	}
	return s.repo.Count(ctx, item)
}
