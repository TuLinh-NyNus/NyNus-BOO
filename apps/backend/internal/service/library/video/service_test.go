package video

import (
	"context"
	"errors"
	"testing"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// mockVideoRepository implements repository.LibraryVideoRepository for testing.
type mockVideoRepository struct {
	listFunc              func(ctx context.Context, filters repository.LibraryVideoListFilters) ([]*entity.LibraryVideo, int, error)
	getByIDFunc           func(ctx context.Context, id string) (*entity.LibraryVideo, error)
	incrementDownloadFunc func(ctx context.Context, id string, userID *string, ipAddr, userAgent string) (int, error)
}

func (m *mockVideoRepository) List(ctx context.Context, filters repository.LibraryVideoListFilters) ([]*entity.LibraryVideo, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, filters)
	}
	return nil, 0, nil
}

func (m *mockVideoRepository) GetByID(ctx context.Context, id string) (*entity.LibraryVideo, error) {
	if m.getByIDFunc != nil {
		return m.getByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockVideoRepository) IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddr, userAgent string) (int, error) {
	if m.incrementDownloadFunc != nil {
		return m.incrementDownloadFunc(ctx, id, userID, ipAddr, userAgent)
	}
	return 0, nil
}

func TestNewService(t *testing.T) {
	repo := &mockVideoRepository{}
	svc := NewService(repo)

	if svc == nil {
		t.Fatal("expected non-nil service")
	}

	if svc.repo != repo {
		t.Error("service repository not set correctly")
	}
}

func TestService_List(t *testing.T) {
	tests := []struct {
		name        string
		filters     repository.LibraryVideoListFilters
		mockVideos  []*entity.LibraryVideo
		mockTotal   int
		mockErr     error
		expectErr   bool
		expectCount int
	}{
		{
			name: "successful list",
			filters: repository.LibraryVideoListFilters{
				Subjects: []string{"ToÃ¡n há»c"},
				Grades:   []string{"12"},
				Limit:    10,
				Offset:   0,
			},
			mockVideos: []*entity.LibraryVideo{
				{ID: "vid1", Title: "Video 1"},
				{ID: "vid2", Title: "Video 2"},
			},
			mockTotal:   2,
			mockErr:     nil,
			expectErr:   false,
			expectCount: 2,
		},
		{
			name:        "empty result",
			filters:     repository.LibraryVideoListFilters{Limit: 10},
			mockVideos:  []*entity.LibraryVideo{},
			mockTotal:   0,
			mockErr:     nil,
			expectErr:   false,
			expectCount: 0,
		},
		{
			name:        "repository error",
			filters:     repository.LibraryVideoListFilters{Limit: 10},
			mockVideos:  nil,
			mockTotal:   0,
			mockErr:     errors.New("database error"),
			expectErr:   true,
			expectCount: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockVideoRepository{
				listFunc: func(ctx context.Context, filters repository.LibraryVideoListFilters) ([]*entity.LibraryVideo, int, error) {
					return tt.mockVideos, tt.mockTotal, tt.mockErr
				},
			}
			svc := NewService(repo)

			videos, total, err := svc.List(context.Background(), tt.filters)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if len(videos) != tt.expectCount {
				t.Errorf("expected %d videos, got %d", tt.expectCount, len(videos))
			}

			if total != tt.mockTotal {
				t.Errorf("expected total %d, got %d", tt.mockTotal, total)
			}
		})
	}
}

func TestService_Get(t *testing.T) {
	tests := []struct {
		name      string
		id        string
		mockVideo *entity.LibraryVideo
		mockErr   error
		expectErr bool
		expectID  string
	}{
		{
			name:      "successful get",
			id:        "video-123",
			mockVideo: &entity.LibraryVideo{ID: "video-123", Title: "Test Video"},
			mockErr:   nil,
			expectErr: false,
			expectID:  "video-123",
		},
		{
			name:      "empty id",
			id:        "",
			mockVideo: nil,
			mockErr:   nil,
			expectErr: true,
		},
		{
			name:      "whitespace id",
			id:        "   ",
			mockVideo: nil,
			mockErr:   nil,
			expectErr: true,
		},
		{
			name:      "id with spaces trimmed",
			id:        "  video-456  ",
			mockVideo: &entity.LibraryVideo{ID: "video-456", Title: "Spaced Video"},
			mockErr:   nil,
			expectErr: false,
			expectID:  "video-456",
		},
		{
			name:      "not found",
			id:        "nonexistent",
			mockVideo: nil,
			mockErr:   repository.ErrNotFound,
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockVideoRepository{
				getByIDFunc: func(ctx context.Context, id string) (*entity.LibraryVideo, error) {
					if tt.mockVideo != nil && id == tt.mockVideo.ID {
						return tt.mockVideo, tt.mockErr
					}
					return nil, tt.mockErr
				},
			}
			svc := NewService(repo)

			video, err := svc.Get(context.Background(), tt.id)

			if tt.expectErr {
				if err == nil {
					t.Error("expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if video == nil {
				t.Fatal("expected non-nil video")
			}

			if video.ID != tt.expectID {
				t.Errorf("expected ID %s, got %s", tt.expectID, video.ID)
			}
		})
	}
}

func TestService_IncrementDownload(t *testing.T) {
	userID := "user-123"
	tests := []struct {
		name        string
		id          string
		audit       DownloadAudit
		mockCount   int
		mockErr     error
		expectErr   bool
		expectCount int
	}{
		{
			name: "successful increment",
			id:   "video-789",
			audit: DownloadAudit{
				UserID:    &userID,
				IPAddress: "192.168.1.1",
				UserAgent: "Mozilla/5.0",
			},
			mockCount:   5,
			mockErr:     nil,
			expectErr:   false,
			expectCount: 5,
		},
		{
			name: "empty id",
			id:   "",
			audit: DownloadAudit{
				IPAddress: "192.168.1.1",
				UserAgent: "Mozilla/5.0",
			},
			mockCount: 0,
			mockErr:   nil,
			expectErr: true,
		},
		{
			name: "whitespace id",
			id:   "   ",
			audit: DownloadAudit{
				IPAddress: "192.168.1.1",
				UserAgent: "Mozilla/5.0",
			},
			mockCount: 0,
			mockErr:   nil,
			expectErr: true,
		},
		{
			name: "anonymous user",
			id:   "video-anonymous",
			audit: DownloadAudit{
				UserID:    nil,
				IPAddress: "10.0.0.1",
				UserAgent: "curl/7.0",
			},
			mockCount:   1,
			mockErr:     nil,
			expectErr:   false,
			expectCount: 1,
		},
		{
			name: "repository error",
			id:   "video-error",
			audit: DownloadAudit{
				UserID:    &userID,
				IPAddress: "192.168.1.1",
				UserAgent: "Mozilla/5.0",
			},
			mockCount: 0,
			mockErr:   errors.New("database error"),
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockVideoRepository{
				incrementDownloadFunc: func(ctx context.Context, id string, userID *string, ipAddr, userAgent string) (int, error) {
					return tt.mockCount, tt.mockErr
				},
			}
			svc := NewService(repo)

			count, err := svc.IncrementDownload(context.Background(), tt.id, tt.audit)

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

// Helper functions
func stringPtr(s string) *string {
	return &s
}
