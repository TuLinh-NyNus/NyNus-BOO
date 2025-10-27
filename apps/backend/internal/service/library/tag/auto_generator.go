package tag

import (
	"context"
	"fmt"
	"strings"

	"github.com/sirupsen/logrus"
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// AutoTagGenerator generates tags automatically based on item metadata
type AutoTagGenerator struct {
	tagRepo repository.TagRepository
	logger  *logrus.Logger
}

// NewAutoTagGenerator creates a new auto tag generator
func NewAutoTagGenerator(tagRepo repository.TagRepository, logger *logrus.Logger) *AutoTagGenerator {
	return &AutoTagGenerator{
		tagRepo: tagRepo,
		logger:  logger,
	}
}

// GenerateForExam generates tags for a library exam based on its metadata
func (g *AutoTagGenerator) GenerateForExam(ctx context.Context, exam *entity.LibraryExam) ([]string, error) {
	tags := make(map[string]bool) // Use map to avoid duplicates

	// Type tag
	tags["Đề thi"] = true

	// Upload status tags
	if exam.UploadStatus != "" {
		if statusTag := g.generateUploadStatusTag(exam.UploadStatus); statusTag != "" {
			tags[statusTag] = true
		}
	}

	// Add exam-specific tags
	g.addExamTags(tags, exam)

	return g.createTagIDs(ctx, tags)
}

// GenerateForVideo generates tags for a library video based on its metadata
func (g *AutoTagGenerator) GenerateForVideo(ctx context.Context, video *entity.LibraryVideo) ([]string, error) {
	tags := make(map[string]bool) // Use map to avoid duplicates

	// Type tag
	tags["Video"] = true

	// Upload status tags
	if video.UploadStatus != "" {
		if statusTag := g.generateUploadStatusTag(video.UploadStatus); statusTag != "" {
			tags[statusTag] = true
		}
	}

	// Add video-specific tags
	g.addVideoTags(tags, video)

	return g.createTagIDs(ctx, tags)
}

// createTagIDs finds or creates tags and returns their IDs
func (g *AutoTagGenerator) createTagIDs(ctx context.Context, tags map[string]bool) ([]string, error) {
	tagIDs := make([]string, 0, len(tags))
	for tagName := range tags {
		tagID, err := g.findOrCreateTag(ctx, tagName)
		if err != nil {
			g.logger.WithError(err).WithField("tag_name", tagName).Warn("Failed to find or create tag")
			continue
		}
		tagIDs = append(tagIDs, tagID)
	}
	return tagIDs, nil
}

// generateUploadStatusTag creates a tag based on upload status
func (g *AutoTagGenerator) generateUploadStatusTag(status string) string {
	switch status {
	case "pending":
		return "Chờ duyệt"
	case "approved":
		return "Đã duyệt"
	case "rejected":
		return "Từ chối"
	case "completed":
		return "Đã hoàn thành"
	default:
		return ""
	}
}

// addExamTags adds exam-specific tags
func (g *AutoTagGenerator) addExamTags(tags map[string]bool, exam *entity.LibraryExam) {
	// Subject tag
	if exam.Subject != "" {
		tags[exam.Subject] = true
	}

	// Grade tag
	if exam.Grade != "" {
		tags[fmt.Sprintf("Lớp %s", exam.Grade)] = true
	}

	// Difficulty tag
	if exam.Difficulty.Valid && exam.Difficulty.String != "" {
		switch strings.ToLower(exam.Difficulty.String) {
		case "easy":
			tags["Dễ"] = true
		case "medium":
			tags["Trung bình"] = true
		case "hard":
			tags["Khó"] = true
		}
	}

	// Exam type tag
	if exam.ExamType != "" {
		switch strings.ToLower(exam.ExamType) {
		case "midterm":
			tags["Giữa kỳ"] = true
		case "final":
			tags["Cuối kỳ"] = true
		case "practice":
			tags["Ôn tập"] = true
		case "mock":
			tags["Thử nghiệm"] = true
		}
	}

	// Province tag (for regional exams)
	if exam.Province.Valid && exam.Province.String != "" {
		tags[exam.Province.String] = true
	}

	// Academic year tag
	if exam.AcademicYear != "" {
		tags[fmt.Sprintf("Năm %s", exam.AcademicYear)] = true
	}

	// Duration-based tags
	if exam.ExamDuration.Valid && exam.ExamDuration.Int32 > 0 {
		duration := exam.ExamDuration.Int32
		if duration <= 45 {
			tags["Ngắn (≤45 phút)"] = true
		} else if duration <= 90 {
			tags["Trung bình (45-90 phút)"] = true
		} else {
			tags["Dài (>90 phút)"] = true
		}
	}

	// Question count tags
	if exam.QuestionCount.Valid && exam.QuestionCount.Int32 > 0 {
		count := exam.QuestionCount.Int32
		if count <= 20 {
			tags["Ít câu (≤20)"] = true
		} else if count <= 50 {
			tags["Trung bình (20-50 câu)"] = true
		} else {
			tags["Nhiều câu (>50)"] = true
		}
	}
}

// Note: Book entity not yet implemented in the system
// This function is a placeholder for future implementation

// addVideoTags adds video-specific tags
func (g *AutoTagGenerator) addVideoTags(tags map[string]bool, video *entity.LibraryVideo) {
	// Subject tag
	if video.Subject != "" {
		tags[video.Subject] = true
	}

	// Grade tag
	if video.Grade != "" {
		tags[fmt.Sprintf("Lớp %s", video.Grade)] = true
	}

	// Duration-based tags
	if video.Duration.Valid && video.Duration.Int32 > 0 {
		duration := video.Duration.Int32
		if duration <= 600 { // 10 minutes
			tags["Video ngắn (≤10 phút)"] = true
		} else if duration <= 1800 { // 30 minutes
			tags["Video trung bình (10-30 phút)"] = true
		} else {
			tags["Video dài (>30 phút)"] = true
		}
	}

	// Quality tags
	if video.Quality.Valid && video.Quality.String != "" {
		switch strings.ToLower(video.Quality.String) {
		case "360p":
			tags["SD"] = true
		case "480p":
			tags["SD"] = true
		case "720p":
			tags["HD"] = true
		case "1080p":
			tags["Full HD"] = true
		case "1440p":
			tags["2K"] = true
		case "2160p":
			tags["4K"] = true
		}
	}

	// YouTube tag
	if video.YoutubeURL != "" {
		tags["YouTube"] = true
	}

	// Instructor tag
	if video.InstructorName.Valid && video.InstructorName.String != "" {
		tags[fmt.Sprintf("Giảng viên: %s", video.InstructorName.String)] = true
	}
}

// findOrCreateTag finds existing tag or creates new one
func (g *AutoTagGenerator) findOrCreateTag(ctx context.Context, tagName string) (string, error) {
	// Try to find existing tag (case-insensitive)
	tags, err := g.tagRepo.ListTags(ctx, repository.TagListFilters{
		Search: tagName,
		Limit:  1,
	})
	if err != nil {
		return "", fmt.Errorf("failed to search tag: %w", err)
	}

	// If found exact match, return it
	for _, tag := range tags {
		if strings.EqualFold(tag.Name, tagName) {
			return tag.ID, nil
		}
	}

	// Create new tag
	newTag := &entity.Tag{
		Name:        tagName,
		Description: fmt.Sprintf("Auto-generated tag: %s", tagName),
		Color:       g.generateColorForTag(tagName),
		IsTrending:  false,
	}

	createdTag, err := g.tagRepo.CreateTag(ctx, newTag)
	if err != nil {
		return "", fmt.Errorf("failed to create tag: %w", err)
	}

	g.logger.WithFields(logrus.Fields{
		"tag_id":   createdTag.ID,
		"tag_name": tagName,
	}).Info("Auto-generated new tag")

	return createdTag.ID, nil
}

// generateColorForTag generates a color for a tag based on its name
func (g *AutoTagGenerator) generateColorForTag(tagName string) string {
	// Simple hash-based color generation
	hash := 0
	for _, c := range tagName {
		hash = int(c) + ((hash << 5) - hash)
	}

	// Map to predefined color palette
	colors := []string{
		"#3b82f6", // blue
		"#10b981", // green
		"#f59e0b", // amber
		"#ef4444", // red
		"#8b5cf6", // purple
		"#ec4899", // pink
		"#06b6d4", // cyan
		"#84cc16", // lime
	}

	return colors[abs(hash)%len(colors)]
}

// Helper function for absolute value
func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

