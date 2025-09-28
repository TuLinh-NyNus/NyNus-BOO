package question

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/image_processing"
	"github.com/sirupsen/logrus"
)

// QuestionMgmt provides management layer for question operations
// This consolidates functionality from service_mgmt/question_mgmt and service_mgmt/question_filter
type QuestionMgmt struct {
	DB                database.QueryExecer
	QuestionService   QuestionService
	questionRepo      interfaces.QuestionRepository
	questionCodeRepo  interfaces.QuestionCodeRepository
	questionImageRepo interfaces.QuestionImageRepository
	imageProcessor    *image_processing.ImageProcessingService
	logger            *logrus.Logger
}

// NewQuestionMgmt creates a new question management service
func NewQuestionMgmt(
	db database.QueryExecer,
	questionRepo interfaces.QuestionRepository,
	questionCodeRepo interfaces.QuestionCodeRepository,
	questionImageRepo interfaces.QuestionImageRepository,
	imageProcessor *image_processing.ImageProcessingService,
	logger *logrus.Logger,
) *QuestionMgmt {
	questionService := NewQuestionServiceWithDB(
		db,
		questionRepo,
		questionCodeRepo,
		questionImageRepo,
		imageProcessor,
		logger,
	)

	return &QuestionMgmt{
		DB:                db,
		QuestionService:   questionService,
		questionRepo:      questionRepo,
		questionCodeRepo:  questionCodeRepo,
		questionImageRepo: questionImageRepo,
		imageProcessor:    imageProcessor,
		logger:            logger,
	}
}

// CRUD Operations - delegate to QuestionService
func (m *QuestionMgmt) CreateQuestion(ctx context.Context, question *entity.Question) error {
	return m.QuestionService.CreateQuestion(ctx, question)
}

func (m *QuestionMgmt) GetQuestion(ctx context.Context, questionID string) (*entity.Question, error) {
	return m.QuestionService.GetQuestion(ctx, questionID)
}

func (m *QuestionMgmt) UpdateQuestion(ctx context.Context, question *entity.Question) error {
	return m.QuestionService.UpdateQuestion(ctx, question)
}

func (m *QuestionMgmt) DeleteQuestion(ctx context.Context, questionID string) error {
	return m.QuestionService.DeleteQuestion(ctx, questionID)
}

// Query Operations
func (m *QuestionMgmt) ListQuestions(ctx context.Context, offset, limit int) (total int, questions []entity.Question, err error) {
	return m.QuestionService.ListQuestions(ctx, offset, limit)
}

func (m *QuestionMgmt) GetQuestionsByPaging(ctx context.Context, offset, limit int) (total int, questions []entity.Question, err error) {
	return m.QuestionService.GetQuestionsByPaging(ctx, offset, limit)
}

// Filtering Operations
func (m *QuestionMgmt) FilterByDifficulty(ctx context.Context, difficulty string, offset, limit int) ([]entity.Question, int, error) {
	return m.QuestionService.FilterByDifficulty(ctx, difficulty, offset, limit)
}

func (m *QuestionMgmt) FilterByCategory(ctx context.Context, category string, offset, limit int) ([]entity.Question, int, error) {
	return m.QuestionService.FilterByCategory(ctx, category, offset, limit)
}

func (m *QuestionMgmt) FilterBySubject(ctx context.Context, subject string, offset, limit int) ([]entity.Question, int, error) {
	return m.QuestionService.FilterBySubject(ctx, subject, offset, limit)
}

func (m *QuestionMgmt) SearchQuestions(ctx context.Context, searchOpts *SearchOptions, offset, limit int) ([]SearchResult, int, error) {
	return m.QuestionService.SearchQuestions(ctx, searchOpts, offset, limit)
}

// Bulk Operations
func (m *QuestionMgmt) BulkImportQuestions(ctx context.Context, questions []entity.Question) (*ImportResult, error) {
	return m.QuestionService.BulkImportQuestions(ctx, questions)
}

func (m *QuestionMgmt) ExportQuestions(ctx context.Context, filter *QuestionFilter) ([]entity.Question, error) {
	return m.QuestionService.ExportQuestions(ctx, filter)
}

func (m *QuestionMgmt) BulkUpdateQuestions(ctx context.Context, updates []QuestionUpdate) error {
	return m.QuestionService.BulkUpdateQuestions(ctx, updates)
}

func (m *QuestionMgmt) BulkDeleteQuestions(ctx context.Context, questionIDs []string) error {
	return m.QuestionService.BulkDeleteQuestions(ctx, questionIDs)
}

// Statistics Operations
func (m *QuestionMgmt) GetQuestionStatistics(ctx context.Context, filter *QuestionFilter) (*QuestionStatistics, error) {
	return m.QuestionService.GetQuestionStatistics(ctx, filter)
}

func (m *QuestionMgmt) GetUsageStatistics(ctx context.Context, questionID string) (*UsageStatistics, error) {
	return m.QuestionService.GetUsageStatistics(ctx, questionID)
}

func (m *QuestionMgmt) UpdateQuestionUsage(ctx context.Context, questionID string) error {
	return m.QuestionService.UpdateQuestionUsage(ctx, questionID)
}

// Image Operations
func (m *QuestionMgmt) UploadQuestionImage(ctx context.Context, questionID string, imageData []byte) (*ImageUploadResult, error) {
	return m.QuestionService.UploadQuestionImage(ctx, questionID, imageData)
}

func (m *QuestionMgmt) DeleteQuestionImage(ctx context.Context, questionID, imageID string) error {
	return m.QuestionService.DeleteQuestionImage(ctx, questionID, imageID)
}

func (m *QuestionMgmt) GetQuestionImages(ctx context.Context, questionID string) ([]entity.QuestionImage, error) {
	return m.QuestionService.GetQuestionImages(ctx, questionID)
}

// Legacy methods for backward compatibility
func (m *QuestionMgmt) GetFilterStatistics(ctx context.Context, filterQuery map[string]interface{}) (*FilterStatistics, error) {
	// Convert legacy filter query to new QuestionFilter
	filter := &QuestionFilter{
		// TODO: Map filterQuery to QuestionFilter fields
	}
	
	stats, err := m.QuestionService.GetQuestionStatistics(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	// Convert to legacy FilterStatistics format
	return &FilterStatistics{
		TotalQuestions:         stats.TotalQuestions,
		TypeDistribution:       stats.TypeDistribution,
		DifficultyDistribution: stats.DifficultyDistribution,
		StatusDistribution:     stats.StatusDistribution,
		GradeDistribution:      map[string]int{}, // TODO: Map from CategoryDistribution
		SubjectDistribution:    stats.SubjectDistribution,
		AverageUsageCount:      float32(stats.AverageUsageCount),
		AverageFeedback:        float32(stats.AverageFeedback),
	}, nil
}

// Legacy types are now defined in interfaces.go

// Legacy import method
func (m *QuestionMgmt) ImportQuestions(ctx context.Context, req *ImportQuestionsRequest) (*ImportQuestionsResult, error) {
	// TODO: Convert legacy import request to new format and delegate to QuestionService
	result, err := m.QuestionService.BulkImportQuestions(ctx, []entity.Question{})
	if err != nil {
		return nil, err
	}
	
	// Convert to legacy format
	return &ImportQuestionsResult{
		TotalProcessed: int32(result.TotalProcessed),
		CreatedCount:   int32(result.CreatedCount),
		UpdatedCount:   int32(result.UpdatedCount),
		ErrorCount:     int32(result.ErrorCount),
		Errors:         result.Errors,
		Summary:        result.Summary,
	}, nil
}
