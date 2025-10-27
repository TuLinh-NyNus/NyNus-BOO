package rating

import (
	"context"
	"strings"

	"exam-bank-system/apps/backend/internal/repository"
)

// Service encapsulates rating related operations.
type Service struct {
	repo     repository.ItemRatingRepository
	itemRepo repository.LibraryItemRepository
}

// NewService builds a rating service instance.
func NewService(repo repository.ItemRatingRepository, itemRepo repository.LibraryItemRepository) *Service {
	return &Service{
		repo:     repo,
		itemRepo: itemRepo,
	}
}

// Submit stores or updates a rating and refreshes aggregate metrics.
func (s *Service) Submit(ctx context.Context, itemID, userID string, rating int, review string) (repository.RatingAggregate, error) {
	item := strings.TrimSpace(itemID)
	user := strings.TrimSpace(userID)
	if item == "" || user == "" {
		return repository.RatingAggregate{}, repository.ErrInvalidInput
	}

	if err := s.repo.Upsert(ctx, item, user, rating, review); err != nil {
		return repository.RatingAggregate{}, err
	}

	agg, err := s.repo.GetAggregate(ctx, item)
	if err != nil {
		return repository.RatingAggregate{}, err
	}

	if err := s.itemRepo.UpdateRatingAggregate(ctx, item, agg.Average, agg.Count); err != nil {
		return repository.RatingAggregate{}, err
	}

	return agg, nil
}

// Remove deletes a rating and recalculates the aggregate statistics.
func (s *Service) Remove(ctx context.Context, itemID, userID string) (repository.RatingAggregate, error) {
	item := strings.TrimSpace(itemID)
	user := strings.TrimSpace(userID)
	if item == "" || user == "" {
		return repository.RatingAggregate{}, repository.ErrInvalidInput
	}

	if err := s.repo.Delete(ctx, item, user); err != nil {
		return repository.RatingAggregate{}, err
	}

	agg, err := s.repo.GetAggregate(ctx, item)
	if err != nil {
		return repository.RatingAggregate{}, err
	}

	if err := s.itemRepo.UpdateRatingAggregate(ctx, item, agg.Average, agg.Count); err != nil {
		return repository.RatingAggregate{}, err
	}

	return agg, nil
}

// GetUserRating returns the rating and review a user submitted for an item.
func (s *Service) GetUserRating(ctx context.Context, itemID, userID string) (int, string, error) {
	item := strings.TrimSpace(itemID)
	user := strings.TrimSpace(userID)
	if item == "" || user == "" {
		return 0, "", repository.ErrInvalidInput
	}

	return s.repo.GetUserRating(ctx, item, user)
}
