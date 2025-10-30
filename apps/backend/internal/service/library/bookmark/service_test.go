package bookmark

import (
	"context"
	"errors"
	"testing"

	"exam-bank-system/apps/backend/internal/repository"
)

// mockBookmarkRepository implements repository.UserBookmarkRepository for testing.
type mockBookmarkRepository struct {
	addFunc          func(ctx context.Context, itemID, userID string) error
	removeFunc       func(ctx context.Context, itemID, userID string) error
	isBookmarkedFunc func(ctx context.Context, itemID, userID string) (bool, error)
	countFunc        func(ctx context.Context, itemID string) (int, error)
}

func (m *mockBookmarkRepository) Add(ctx context.Context, itemID, userID string) error {
	if m.addFunc != nil {
		return m.addFunc(ctx, itemID, userID)
	}
	return nil
}

func (m *mockBookmarkRepository) Remove(ctx context.Context, itemID, userID string) error {
	if m.removeFunc != nil {
		return m.removeFunc(ctx, itemID, userID)
	}
	return nil
}

func (m *mockBookmarkRepository) IsBookmarked(ctx context.Context, itemID, userID string) (bool, error) {
	if m.isBookmarkedFunc != nil {
		return m.isBookmarkedFunc(ctx, itemID, userID)
	}
	return false, nil
}

func (m *mockBookmarkRepository) Count(ctx context.Context, itemID string) (int, error) {
	if m.countFunc != nil {
		return m.countFunc(ctx, itemID)
	}
	return 0, nil
}

func TestNewService(t *testing.T) {
	repo := &mockBookmarkRepository{}
	svc := NewService(repo)

	if svc == nil {
		t.Fatal("expected non-nil service")
	}

	if svc.repo != repo {
		t.Error("service repository not set correctly")
	}
}

func TestService_Set(t *testing.T) {
	tests := []struct {
		name          string
		itemID        string
		userID        string
		bookmarked    bool
		mockAddErr    error
		mockRemoveErr error
		expectErr     bool
		expectState   bool
	}{
		{
			name:        "set bookmark true - success",
			itemID:      "item-123",
			userID:      "user-456",
			bookmarked:  true,
			mockAddErr:  nil,
			expectErr:   false,
			expectState: true,
		},
		{
			name:          "set bookmark false - success",
			itemID:        "item-123",
			userID:        "user-456",
			bookmarked:    false,
			mockRemoveErr: nil,
			expectErr:     false,
			expectState:   false,
		},
		{
			name:          "set bookmark false - not found (graceful)",
			itemID:        "item-123",
			userID:        "user-456",
			bookmarked:    false,
			mockRemoveErr: repository.ErrNotFound,
			expectErr:     false,
			expectState:   false,
		},
		{
			name:       "empty item ID",
			itemID:     "",
			userID:     "user-456",
			bookmarked: true,
			expectErr:  true,
		},
		{
			name:       "empty user ID",
			itemID:     "item-123",
			userID:     "",
			bookmarked: true,
			expectErr:  true,
		},
		{
			name:       "whitespace IDs",
			itemID:     "   ",
			userID:     "   ",
			bookmarked: true,
			expectErr:  true,
		},
		{
			name:       "add error",
			itemID:     "item-123",
			userID:     "user-456",
			bookmarked: true,
			mockAddErr: errors.New("database error"),
			expectErr:  true,
		},
		{
			name:          "remove error (not ErrNotFound)",
			itemID:        "item-123",
			userID:        "user-456",
			bookmarked:    false,
			mockRemoveErr: errors.New("database error"),
			expectErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockBookmarkRepository{
				addFunc: func(ctx context.Context, itemID, userID string) error {
					return tt.mockAddErr
				},
				removeFunc: func(ctx context.Context, itemID, userID string) error {
					return tt.mockRemoveErr
				},
			}

			svc := NewService(repo)
			state, err := svc.Set(context.Background(), tt.itemID, tt.userID, tt.bookmarked)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if state != tt.expectState {
				t.Errorf("expected state %v, got %v", tt.expectState, state)
			}
		})
	}
}

func TestService_IsBookmarked(t *testing.T) {
	tests := []struct {
		name         string
		itemID       string
		userID       string
		mockResult   bool
		mockErr      error
		expectErr    bool
		expectResult bool
	}{
		{
			name:         "is bookmarked - true",
			itemID:       "item-abc",
			userID:       "user-xyz",
			mockResult:   true,
			mockErr:      nil,
			expectErr:    false,
			expectResult: true,
		},
		{
			name:         "is bookmarked - false",
			itemID:       "item-abc",
			userID:       "user-xyz",
			mockResult:   false,
			mockErr:      nil,
			expectErr:    false,
			expectResult: false,
		},
		{
			name:      "empty item ID",
			itemID:    "",
			userID:    "user-xyz",
			expectErr: true,
		},
		{
			name:      "empty user ID",
			itemID:    "item-abc",
			userID:    "",
			expectErr: true,
		},
		{
			name:       "repository error",
			itemID:     "item-abc",
			userID:     "user-xyz",
			mockResult: false,
			mockErr:    errors.New("database error"),
			expectErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockBookmarkRepository{
				isBookmarkedFunc: func(ctx context.Context, itemID, userID string) (bool, error) {
					return tt.mockResult, tt.mockErr
				},
			}

			svc := NewService(repo)
			result, err := svc.IsBookmarked(context.Background(), tt.itemID, tt.userID)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if result != tt.expectResult {
				t.Errorf("expected result %v, got %v", tt.expectResult, result)
			}
		})
	}
}

func TestService_Count(t *testing.T) {
	tests := []struct {
		name        string
		itemID      string
		mockCount   int
		mockErr     error
		expectErr   bool
		expectCount int
	}{
		{
			name:        "count bookmarks - success",
			itemID:      "item-789",
			mockCount:   42,
			mockErr:     nil,
			expectErr:   false,
			expectCount: 42,
		},
		{
			name:        "count bookmarks - zero",
			itemID:      "item-new",
			mockCount:   0,
			mockErr:     nil,
			expectErr:   false,
			expectCount: 0,
		},
		{
			name:      "empty item ID",
			itemID:    "",
			expectErr: true,
		},
		{
			name:      "whitespace item ID",
			itemID:    "   ",
			expectErr: true,
		},
		{
			name:      "repository error",
			itemID:    "item-789",
			mockCount: 0,
			mockErr:   errors.New("database error"),
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockBookmarkRepository{
				countFunc: func(ctx context.Context, itemID string) (int, error) {
					return tt.mockCount, tt.mockErr
				},
			}

			svc := NewService(repo)
			count, err := svc.Count(context.Background(), tt.itemID)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if count != tt.expectCount {
				t.Errorf("expected count %d, got %d", tt.expectCount, count)
			}
		})
	}
}
