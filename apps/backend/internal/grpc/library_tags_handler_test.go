package grpc

import (
	"context"
	"errors"
	"testing"

	"github.com/sirupsen/logrus"
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// Mock TagRepository
type mockTagRepo struct {
	createTagFunc     func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error)
	getTagFunc        func(ctx context.Context, tagID string) (*entity.Tag, error)
	listTagsFunc      func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error)
	updateTagFunc     func(ctx context.Context, tag *entity.Tag) error
	deleteTagFunc     func(ctx context.Context, tagID string) error
	getPopularFunc    func(ctx context.Context, limit int) ([]*entity.Tag, error)
	incrementUseFunc  func(ctx context.Context, tagID string) error
}

func (m *mockTagRepo) CreateTag(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
	if m.createTagFunc != nil {
		return m.createTagFunc(ctx, tag)
	}
	return tag, nil
}

func (m *mockTagRepo) GetTag(ctx context.Context, tagID string) (*entity.Tag, error) {
	if m.getTagFunc != nil {
		return m.getTagFunc(ctx, tagID)
	}
	return nil, errors.New("not found")
}

func (m *mockTagRepo) ListTags(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error) {
	if m.listTagsFunc != nil {
		return m.listTagsFunc(ctx, filters)
	}
	return []*entity.Tag{}, nil
}

func (m *mockTagRepo) UpdateTag(ctx context.Context, tag *entity.Tag) error {
	if m.updateTagFunc != nil {
		return m.updateTagFunc(ctx, tag)
	}
	return nil
}

func (m *mockTagRepo) DeleteTag(ctx context.Context, tagID string) error {
	if m.deleteTagFunc != nil {
		return m.deleteTagFunc(ctx, tagID)
	}
	return nil
}

func (m *mockTagRepo) GetPopularTags(ctx context.Context, limit int) ([]*entity.Tag, error) {
	if m.getPopularFunc != nil {
		return m.getPopularFunc(ctx, limit)
	}
	return []*entity.Tag{}, nil
}

func (m *mockTagRepo) IncrementUsageCount(ctx context.Context, tagID string) error {
	if m.incrementUseFunc != nil {
		return m.incrementUseFunc(ctx, tagID)
	}
	return nil
}

func TestCreateTag(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	tests := []struct {
		name        string
		req         *CreateTagRequest
		mockCreate  func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error)
		expectError bool
	}{
		{
			name: "successful create",
			req: &CreateTagRequest{
				Name:        "Toán học",
				Description: "Môn toán",
				Color:       "#3b82f6",
				IsTrending:  false,
			},
			mockCreate: func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
				tag.ID = "tag-123"
				return tag, nil
			},
			expectError: false,
		},
		{
			name: "empty name",
			req: &CreateTagRequest{
				Name: "",
			},
			expectError: true,
		},
		{
			name: "database error",
			req: &CreateTagRequest{
				Name: "Test",
			},
			mockCreate: func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
				return nil, errors.New("db error")
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockTagRepo{createTagFunc: tt.mockCreate}
			handler := NewLibraryTagsHandler(mockRepo, logger)

			resp, err := handler.CreateTag(context.Background(), tt.req)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if !tt.expectError && resp == nil {
				t.Error("expected response but got nil")
			}
		})
	}
}

func TestGetTag(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	tests := []struct {
		name        string
		tagID       string
		mockGet     func(ctx context.Context, tagID string) (*entity.Tag, error)
		expectError bool
	}{
		{
			name:  "successful get",
			tagID: "tag-123",
			mockGet: func(ctx context.Context, tagID string) (*entity.Tag, error) {
				return &entity.Tag{
					ID:   tagID,
					Name: "Test Tag",
				}, nil
			},
			expectError: false,
		},
		{
			name:        "empty tag ID",
			tagID:       "",
			expectError: true,
		},
		{
			name:  "tag not found",
			tagID: "nonexistent",
			mockGet: func(ctx context.Context, tagID string) (*entity.Tag, error) {
				return nil, errors.New("not found")
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockTagRepo{getTagFunc: tt.mockGet}
			handler := NewLibraryTagsHandler(mockRepo, logger)

			resp, err := handler.GetTag(context.Background(), tt.tagID)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if !tt.expectError && resp == nil {
				t.Error("expected response but got nil")
			}
		})
	}
}

func TestListTags(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	tests := []struct {
		name         string
		req          *ListTagsRequest
		mockList     func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error)
		expectError  bool
		expectCount  int
	}{
		{
			name: "successful list",
			req: &ListTagsRequest{
				Limit:  10,
				Offset: 0,
			},
			mockList: func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error) {
				return []*entity.Tag{
					{ID: "tag1", Name: "Tag 1"},
					{ID: "tag2", Name: "Tag 2"},
				}, nil
			},
			expectError: false,
			expectCount: 2,
		},
		{
			name: "with search filter",
			req: &ListTagsRequest{
				Search: "toán",
				Limit:  5,
			},
			mockList: func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error) {
				return []*entity.Tag{
					{ID: "tag1", Name: "Toán học"},
				}, nil
			},
			expectError: false,
			expectCount: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockTagRepo{listTagsFunc: tt.mockList}
			handler := NewLibraryTagsHandler(mockRepo, logger)

			resp, err := handler.ListTags(context.Background(), tt.req)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if !tt.expectError && len(resp.Tags) != tt.expectCount {
				t.Errorf("expected %d tags, got %d", tt.expectCount, len(resp.Tags))
			}
		})
	}
}

func TestUpdateTag(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	tests := []struct {
		name        string
		req         *UpdateTagRequest
		mockGet     func(ctx context.Context, tagID string) (*entity.Tag, error)
		mockUpdate  func(ctx context.Context, tag *entity.Tag) error
		expectError bool
	}{
		{
			name: "successful update",
			req: &UpdateTagRequest{
				TagID:      "tag-123",
				Name:       "Updated Name",
				IsTrending: true,
			},
			mockGet: func(ctx context.Context, tagID string) (*entity.Tag, error) {
				return &entity.Tag{ID: tagID, Name: "Old Name"}, nil
			},
			mockUpdate:  func(ctx context.Context, tag *entity.Tag) error { return nil },
			expectError: false,
		},
		{
			name: "empty tag ID",
			req: &UpdateTagRequest{
				TagID: "",
			},
			expectError: true,
		},
		{
			name: "tag not found",
			req: &UpdateTagRequest{
				TagID: "nonexistent",
			},
			mockGet: func(ctx context.Context, tagID string) (*entity.Tag, error) {
				return nil, errors.New("not found")
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockTagRepo{
				getTagFunc:    tt.mockGet,
				updateTagFunc: tt.mockUpdate,
			}
			handler := NewLibraryTagsHandler(mockRepo, logger)

			resp, err := handler.UpdateTag(context.Background(), tt.req)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if !tt.expectError && resp == nil {
				t.Error("expected response but got nil")
			}
		})
	}
}

func TestDeleteTag(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	tests := []struct {
		name        string
		tagID       string
		mockDelete  func(ctx context.Context, tagID string) error
		expectError bool
	}{
		{
			name:        "successful delete",
			tagID:       "tag-123",
			mockDelete:  func(ctx context.Context, tagID string) error { return nil },
			expectError: false,
		},
		{
			name:        "empty tag ID",
			tagID:       "",
			expectError: true,
		},
		{
			name:  "delete error",
			tagID: "tag-123",
			mockDelete: func(ctx context.Context, tagID string) error {
				return errors.New("db error")
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockTagRepo{deleteTagFunc: tt.mockDelete}
			handler := NewLibraryTagsHandler(mockRepo, logger)

			err := handler.DeleteTag(context.Background(), tt.tagID)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

func TestGetPopularTags(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	mockRepo := &mockTagRepo{
		getPopularFunc: func(ctx context.Context, limit int) ([]*entity.Tag, error) {
			tags := make([]*entity.Tag, limit)
			for i := 0; i < limit; i++ {
				tags[i] = &entity.Tag{
					ID:         "tag" + string(rune(i)),
					Name:       "Tag " + string(rune(i)),
					UsageCount: 100 - i,
				}
			}
			return tags, nil
		},
	}

	handler := NewLibraryTagsHandler(mockRepo, logger)

	resp, err := handler.GetPopularTags(context.Background(), 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(resp.Tags) != 5 {
		t.Errorf("expected 5 tags, got %d", len(resp.Tags))
	}
}

func TestToggleTrending(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	tests := []struct {
		name        string
		tagID       string
		isTrending  bool
		mockGet     func(ctx context.Context, tagID string) (*entity.Tag, error)
		mockUpdate  func(ctx context.Context, tag *entity.Tag) error
		expectError bool
	}{
		{
			name:       "successful toggle to true",
			tagID:      "tag-123",
			isTrending: true,
			mockGet: func(ctx context.Context, tagID string) (*entity.Tag, error) {
				return &entity.Tag{ID: tagID, IsTrending: false}, nil
			},
			mockUpdate:  func(ctx context.Context, tag *entity.Tag) error { return nil },
			expectError: false,
		},
		{
			name:        "empty tag ID",
			tagID:       "",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockTagRepo{
				getTagFunc:    tt.mockGet,
				updateTagFunc: tt.mockUpdate,
			}
			handler := NewLibraryTagsHandler(mockRepo, logger)

			err := handler.ToggleTrending(context.Background(), tt.tagID, tt.isTrending)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

