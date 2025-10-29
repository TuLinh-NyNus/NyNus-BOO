package tag

import (
	"context"
	"database/sql"
	"testing"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"github.com/sirupsen/logrus"
)

type mockTagRepository struct {
	listTagsFunc  func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error)
	createTagFunc func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error)
}

func (m *mockTagRepository) ListTags(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error) {
	if m.listTagsFunc != nil {
		return m.listTagsFunc(ctx, filters)
	}
	return []*entity.Tag{}, nil
}

func (m *mockTagRepository) CreateTag(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
	if m.createTagFunc != nil {
		return m.createTagFunc(ctx, tag)
	}
	tag.ID = "generated-tag-id"
	return tag, nil
}

func (m *mockTagRepository) GetTag(ctx context.Context, tagID string) (*entity.Tag, error) {
	return nil, nil
}

func (m *mockTagRepository) UpdateTag(ctx context.Context, tag *entity.Tag) error {
	return nil
}

func (m *mockTagRepository) DeleteTag(ctx context.Context, tagID string) error {
	return nil
}

func (m *mockTagRepository) GetPopularTags(ctx context.Context, limit int) ([]*entity.Tag, error) {
	return []*entity.Tag{}, nil
}

func (m *mockTagRepository) IncrementUsageCount(ctx context.Context, tagID string) error {
	return nil
}

func TestNewAutoTagGenerator(t *testing.T) {
	logger := logrus.New()
	mockRepo := &mockTagRepository{}

	gen := NewAutoTagGenerator(mockRepo, logger)

	if gen == nil {
		t.Fatal("expected non-nil generator")
	}
}

func TestGenerateUploadStatusTag(t *testing.T) {
	logger := logrus.New()
	gen := &AutoTagGenerator{logger: logger}

	tests := []struct {
		status   string
		expected string
	}{
		{"pending", "Chá» duyá»‡t"},
		{"approved", "ÄÃ£ duyá»‡t"},
		{"rejected", "Tá»« chá»‘i"},
		{"completed", "ÄÃ£ hoÃ n thÃ nh"},
		{"unknown", ""},
	}

	for _, tt := range tests {
		t.Run(tt.status, func(t *testing.T) {
			result := gen.generateUploadStatusTag(tt.status)
			if result != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestAddExamTags(t *testing.T) {
	logger := logrus.New()
	gen := &AutoTagGenerator{logger: logger}

	tags := make(map[string]bool)
	exam := &entity.LibraryExam{
		Subject:       "ToÃ¡n há»c",
		Grade:         "12",
		Difficulty:    sql.NullString{String: "hard", Valid: true},
		ExamType:      "final",
		Province:      sql.NullString{String: "HÃ  Ná»™i", Valid: true},
		AcademicYear:  "2024",
		ExamDuration:  sql.NullInt32{Int32: 120, Valid: true},
		QuestionCount: sql.NullInt32{Int32: 30, Valid: true},
	}

	gen.addExamTags(tags, exam)

	expectedTags := []string{
		"ToÃ¡n há»c",
		"Lá»›p 12",
		"KhÃ³",
		"Cuá»‘i ká»³",
		"HÃ  Ná»™i",
		"NÄƒm 2024",
		"DÃ i (>90 phÃºt)",
		"Trung bÃ¬nh (20-50 cÃ¢u)",
	}

	for _, expected := range expectedTags {
		if !tags[expected] {
			t.Errorf("expected tag %s not found", expected)
		}
	}
}

func TestAddVideoTags(t *testing.T) {
	logger := logrus.New()
	gen := &AutoTagGenerator{logger: logger}

	tags := make(map[string]bool)
	video := &entity.LibraryVideo{
		Subject:        "HÃ³a há»c",
		Grade:          "10",
		Duration:       sql.NullInt32{Int32: 1200, Valid: true},
		Quality:        sql.NullString{String: "1080p", Valid: true},
		YoutubeURL:     "https://youtube.com/watch?v=abc123",
		InstructorName: sql.NullString{String: "Tháº§y Nguyá»…n VÄƒn A", Valid: true},
	}

	gen.addVideoTags(tags, video)

	expectedTags := []string{
		"HÃ³a há»c",
		"Lá»›p 10",
		"Video trung bÃ¬nh (10-30 phÃºt)",
		"Full HD",
		"YouTube",
		"Giáº£ng viÃªn: Tháº§y Nguyá»…n VÄƒn A",
	}

	for _, expected := range expectedTags {
		if !tags[expected] {
			t.Errorf("expected tag %s not found", expected)
		}
	}
}

func TestGenerateForExam(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	createdTags := make(map[string]*entity.Tag)
	mockRepo := &mockTagRepository{
		listTagsFunc: func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error) {
			return []*entity.Tag{}, nil
		},
		createTagFunc: func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
			tag.ID = "tag-" + tag.Name
			createdTags[tag.Name] = tag
			return tag, nil
		},
	}

	gen := NewAutoTagGenerator(mockRepo, logger)

	exam := &entity.LibraryExam{
		UploadStatus: "approved",
		Subject:      "ToÃ¡n há»c",
		Grade:        "12",
		Difficulty:   sql.NullString{String: "medium", Valid: true},
	}

	tagIDs, err := gen.GenerateForExam(context.Background(), exam)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(tagIDs) == 0 {
		t.Error("expected at least one tag ID")
	}

	// Check that some expected tags were created
	expectedTagNames := []string{"Äá» thi", "ÄÃ£ duyá»‡t", "ToÃ¡n há»c", "Lá»›p 12"}
	for _, name := range expectedTagNames {
		if _, exists := createdTags[name]; !exists {
			t.Errorf("expected tag %s to be created", name)
		}
	}
}

func TestGenerateForVideo(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel)

	createdTags := make(map[string]*entity.Tag)
	mockRepo := &mockTagRepository{
		listTagsFunc: func(ctx context.Context, filters repository.TagListFilters) ([]*entity.Tag, error) {
			return []*entity.Tag{}, nil
		},
		createTagFunc: func(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
			tag.ID = "tag-" + tag.Name
			createdTags[tag.Name] = tag
			return tag, nil
		},
	}

	gen := NewAutoTagGenerator(mockRepo, logger)

	video := &entity.LibraryVideo{
		UploadStatus: "pending",
		Subject:      "Sinh há»c",
		Grade:        "8",
		Duration:     sql.NullInt32{Int32: 500, Valid: true},
		Quality:      sql.NullString{String: "720p", Valid: true},
		YoutubeURL:   "https://youtube.com/watch?v=xyz789",
	}

	tagIDs, err := gen.GenerateForVideo(context.Background(), video)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(tagIDs) == 0 {
		t.Error("expected at least one tag ID")
	}

	expectedTagNames := []string{"Video", "Chá» duyá»‡t", "Sinh há»c", "Lá»›p 8"}
	for _, name := range expectedTagNames {
		if _, exists := createdTags[name]; !exists {
			t.Errorf("expected tag %s to be created", name)
		}
	}
}

func TestGenerateColorForTag(t *testing.T) {
	logger := logrus.New()
	gen := &AutoTagGenerator{logger: logger}

	// Test that same tag name always generates same color
	color1 := gen.generateColorForTag("Test Tag")
	color2 := gen.generateColorForTag("Test Tag")

	if color1 != color2 {
		t.Error("same tag name should generate same color")
	}

	// Test that different tags generate colors
	color3 := gen.generateColorForTag("Different Tag")
	if color3 == "" {
		t.Error("should generate a non-empty color")
	}

	// Test that color is in hex format
	if len(color1) != 7 || color1[0] != '#' {
		t.Errorf("color should be in hex format, got %s", color1)
	}
}
