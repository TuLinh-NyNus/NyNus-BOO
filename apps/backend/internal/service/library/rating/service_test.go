package rating

import (
	"context"
	"errors"
	"testing"

	"exam-bank-system/apps/backend/internal/repository"
)

// mockRatingRepository implements repository.ItemRatingRepository for testing.
type mockRatingRepository struct {
	upsertFunc        func(ctx context.Context, itemID, userID string, rating int, review string) error
	deleteFunc        func(ctx context.Context, itemID, userID string) error
	getAggregateFunc  func(ctx context.Context, itemID string) (repository.RatingAggregate, error)
	getUserRatingFunc func(ctx context.Context, itemID, userID string) (int, string, error)
}

func (m *mockRatingRepository) Upsert(ctx context.Context, itemID, userID string, rating int, review string) error {
	if m.upsertFunc != nil {
		return m.upsertFunc(ctx, itemID, userID, rating, review)
	}
	return nil
}

func (m *mockRatingRepository) Delete(ctx context.Context, itemID, userID string) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(ctx, itemID, userID)
	}
	return nil
}

func (m *mockRatingRepository) GetAggregate(ctx context.Context, itemID string) (repository.RatingAggregate, error) {
	if m.getAggregateFunc != nil {
		return m.getAggregateFunc(ctx, itemID)
	}
	return repository.RatingAggregate{}, nil
}

func (m *mockRatingRepository) GetUserRating(ctx context.Context, itemID, userID string) (int, string, error) {
	if m.getUserRatingFunc != nil {
		return m.getUserRatingFunc(ctx, itemID, userID)
	}
	return 0, "", nil
}

// mockLibraryItemRepository implements repository.LibraryItemRepository for testing.
type mockLibraryItemRepository struct {
	updateRatingFunc  func(ctx context.Context, itemID string, avgRating float64, reviewCount int) error
	getAccessMetaFunc func(ctx context.Context, itemID string) (repository.LibraryItemAccess, error)
}

func (m *mockLibraryItemRepository) UpdateRatingAggregate(ctx context.Context, itemID string, avgRating float64, reviewCount int) error {
	if m.updateRatingFunc != nil {
		return m.updateRatingFunc(ctx, itemID, avgRating, reviewCount)
	}
	return nil
}

func (m *mockLibraryItemRepository) GetAccessMetadata(ctx context.Context, itemID string) (repository.LibraryItemAccess, error) {
	if m.getAccessMetaFunc != nil {
		return m.getAccessMetaFunc(ctx, itemID)
	}
	return repository.LibraryItemAccess{}, nil
}

func (m *mockLibraryItemRepository) UpdateApproval(ctx context.Context, itemID, status string, reviewerID *string) error {
	return nil
}

func TestNewService(t *testing.T) {
	ratingRepo := &mockRatingRepository{}
	itemRepo := &mockLibraryItemRepository{}
	svc := NewService(ratingRepo, itemRepo)

	if svc == nil {
		t.Fatal("expected non-nil service")
	}

	if svc.repo != ratingRepo {
		t.Error("rating repository not set correctly")
	}

	if svc.itemRepo != itemRepo {
		t.Error("item repository not set correctly")
	}
}

func TestService_Submit(t *testing.T) {
	tests := []struct {
		name           string
		itemID         string
		userID         string
		rating         int
		review         string
		mockUpsertErr  error
		mockAggregate  repository.RatingAggregate
		mockAggErr     error
		mockUpdateErr  error
		expectErr      bool
		expectAvg      float64
		expectCount    int
	}{
		{
			name:          "successful submit",
			itemID:        "item-123",
			userID:        "user-456",
			rating:        5,
			review:        "Excellent!",
			mockUpsertErr: nil,
			mockAggregate: repository.RatingAggregate{
				Average: 4.5,
				Count:   10,
			},
			mockAggErr:    nil,
			mockUpdateErr: nil,
			expectErr:     false,
			expectAvg:     4.5,
			expectCount:   10,
		},
		{
			name:          "empty item ID",
			itemID:        "",
			userID:        "user-456",
			rating:        5,
			review:        "Great",
			expectErr:     true,
		},
		{
			name:          "empty user ID",
			itemID:        "item-123",
			userID:        "",
			rating:        5,
			review:        "Great",
			expectErr:     true,
		},
		{
			name:          "whitespace IDs",
			itemID:        "   ",
			userID:        "   ",
			rating:        5,
			review:        "Great",
			expectErr:     true,
		},
		{
			name:          "upsert error",
			itemID:        "item-123",
			userID:        "user-456",
			rating:        5,
			review:        "Good",
			mockUpsertErr: errors.New("database error"),
			expectErr:     true,
		},
		{
			name:          "aggregate error",
			itemID:        "item-123",
			userID:        "user-456",
			rating:        5,
			review:        "Good",
			mockUpsertErr: nil,
			mockAggErr:    errors.New("aggregate calculation failed"),
			expectErr:     true,
		},
		{
			name:          "update error",
			itemID:        "item-123",
			userID:        "user-456",
			rating:        5,
			review:        "Good",
			mockUpsertErr: nil,
			mockAggregate: repository.RatingAggregate{Average: 4.0, Count: 5},
			mockAggErr:    nil,
			mockUpdateErr: errors.New("update failed"),
			expectErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ratingRepo := &mockRatingRepository{
				upsertFunc: func(ctx context.Context, itemID, userID string, rating int, review string) error {
					return tt.mockUpsertErr
				},
				getAggregateFunc: func(ctx context.Context, itemID string) (repository.RatingAggregate, error) {
					return tt.mockAggregate, tt.mockAggErr
				},
			}

			itemRepo := &mockLibraryItemRepository{
				updateRatingFunc: func(ctx context.Context, itemID string, avgRating float64, reviewCount int) error {
					return tt.mockUpdateErr
				},
			}

			svc := NewService(ratingRepo, itemRepo)
			agg, err := svc.Submit(context.Background(), tt.itemID, tt.userID, tt.rating, tt.review)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if agg.Average != tt.expectAvg {
				t.Errorf("expected average %f, got %f", tt.expectAvg, agg.Average)
			}

			if agg.Count != tt.expectCount {
				t.Errorf("expected count %d, got %d", tt.expectCount, agg.Count)
			}
		})
	}
}

func TestService_Remove(t *testing.T) {
	tests := []struct {
		name          string
		itemID        string
		userID        string
		mockDeleteErr error
		mockAggregate repository.RatingAggregate
		mockAggErr    error
		mockUpdateErr error
		expectErr     bool
		expectAvg     float64
		expectCount   int
	}{
		{
			name:          "successful remove",
			itemID:        "item-789",
			userID:        "user-101",
			mockDeleteErr: nil,
			mockAggregate: repository.RatingAggregate{
				Average: 4.2,
				Count:   8,
			},
			mockAggErr:    nil,
			mockUpdateErr: nil,
			expectErr:     false,
			expectAvg:     4.2,
			expectCount:   8,
		},
		{
			name:          "empty item ID",
			itemID:        "",
			userID:        "user-101",
			expectErr:     true,
		},
		{
			name:          "empty user ID",
			itemID:        "item-789",
			userID:        "",
			expectErr:     true,
		},
		{
			name:          "delete error",
			itemID:        "item-789",
			userID:        "user-101",
			mockDeleteErr: errors.New("delete failed"),
			expectErr:     true,
		},
		{
			name:          "aggregate error after delete",
			itemID:        "item-789",
			userID:        "user-101",
			mockDeleteErr: nil,
			mockAggErr:    errors.New("aggregate failed"),
			expectErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ratingRepo := &mockRatingRepository{
				deleteFunc: func(ctx context.Context, itemID, userID string) error {
					return tt.mockDeleteErr
				},
				getAggregateFunc: func(ctx context.Context, itemID string) (repository.RatingAggregate, error) {
					return tt.mockAggregate, tt.mockAggErr
				},
			}

			itemRepo := &mockLibraryItemRepository{
				updateRatingFunc: func(ctx context.Context, itemID string, avgRating float64, reviewCount int) error {
					return tt.mockUpdateErr
				},
			}

			svc := NewService(ratingRepo, itemRepo)
			agg, err := svc.Remove(context.Background(), tt.itemID, tt.userID)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if agg.Average != tt.expectAvg {
				t.Errorf("expected average %f, got %f", tt.expectAvg, agg.Average)
			}

			if agg.Count != tt.expectCount {
				t.Errorf("expected count %d, got %d", tt.expectCount, agg.Count)
			}
		})
	}
}

func TestService_GetUserRating(t *testing.T) {
	tests := []struct {
		name         string
		itemID       string
		userID       string
		mockRating   int
		mockReview   string
		mockErr      error
		expectErr    bool
		expectRating int
		expectReview string
	}{
		{
			name:         "successful get",
			itemID:       "item-abc",
			userID:       "user-xyz",
			mockRating:   4,
			mockReview:   "Very good",
			mockErr:      nil,
			expectErr:    false,
			expectRating: 4,
			expectReview: "Very good",
		},
		{
			name:       "empty item ID",
			itemID:     "",
			userID:     "user-xyz",
			expectErr:  true,
		},
		{
			name:       "empty user ID",
			itemID:     "item-abc",
			userID:     "",
			expectErr:  true,
		},
		{
			name:       "not found",
			itemID:     "item-abc",
			userID:     "user-xyz",
			mockRating: 0,
			mockReview: "",
			mockErr:    repository.ErrNotFound,
			expectErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ratingRepo := &mockRatingRepository{
				getUserRatingFunc: func(ctx context.Context, itemID, userID string) (int, string, error) {
					return tt.mockRating, tt.mockReview, tt.mockErr
				},
			}

			itemRepo := &mockLibraryItemRepository{}
			svc := NewService(ratingRepo, itemRepo)

			rating, review, err := svc.GetUserRating(context.Background(), tt.itemID, tt.userID)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if rating != tt.expectRating {
				t.Errorf("expected rating %d, got %d", tt.expectRating, rating)
			}

			if review != tt.expectReview {
				t.Errorf("expected review %s, got %s", tt.expectReview, review)
			}
		})
	}
}

