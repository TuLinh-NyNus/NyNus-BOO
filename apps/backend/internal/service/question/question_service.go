package question

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	repo_interfaces "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/image_processing"
	"github.com/sirupsen/logrus"
)

// QuestionServiceImpl implements the QuestionService interface
type QuestionServiceImpl struct {
	questionRepo      repo_interfaces.QuestionRepository
	questionCodeRepo  repo_interfaces.QuestionCodeRepository
	questionImageRepo repo_interfaces.QuestionImageRepository
	imageProcessor    *image_processing.ImageProcessingService
	imageWorkerPool   *image_processing.WorkerPool
	logger            *logrus.Logger
	db                database.QueryExecer
}

// NewQuestionService creates a new question service
func NewQuestionService(
	questionRepo repo_interfaces.QuestionRepository,
	questionCodeRepo repo_interfaces.QuestionCodeRepository,
	questionImageRepo repo_interfaces.QuestionImageRepository,
	imageProcessor *image_processing.ImageProcessingService,
	logger *logrus.Logger,
) QuestionService {
	service := &QuestionServiceImpl{
		questionRepo:      questionRepo,
		questionCodeRepo:  questionCodeRepo,
		questionImageRepo: questionImageRepo,
		imageProcessor:    imageProcessor,
		logger:            logger,
	}

	// Initialize worker pool if image processor is available
	if imageProcessor != nil {
		service.imageWorkerPool = image_processing.NewWorkerPool(imageProcessor, logger, 5)
		service.imageWorkerPool.Start()
	}

	return service
}

// NewQuestionServiceWithDB creates a new question service with database connection
func NewQuestionServiceWithDB(
	db database.QueryExecer,
	questionRepo repo_interfaces.QuestionRepository,
	questionCodeRepo repo_interfaces.QuestionCodeRepository,
	questionImageRepo repo_interfaces.QuestionImageRepository,
	imageProcessor *image_processing.ImageProcessingService,
	logger *logrus.Logger,
) QuestionService {
	service := &QuestionServiceImpl{
		questionRepo:      questionRepo,
		questionCodeRepo:  questionCodeRepo,
		questionImageRepo: questionImageRepo,
		imageProcessor:    imageProcessor,
		logger:            logger,
		db:                db,
	}

	// Initialize worker pool if image processor is available
	if imageProcessor != nil {
		service.imageWorkerPool = image_processing.NewWorkerPool(imageProcessor, logger, 5)
		service.imageWorkerPool.Start()
	}

	return service
}

// CRUD Operations
func (s *QuestionServiceImpl) CreateQuestion(ctx context.Context, question *entity.Question) error {
	return s.questionRepo.Create(ctx, question)
}

func (s *QuestionServiceImpl) GetQuestion(ctx context.Context, questionID string) (*entity.Question, error) {
	return s.questionRepo.GetByID(ctx, questionID)
}

func (s *QuestionServiceImpl) UpdateQuestion(ctx context.Context, question *entity.Question) error {
	return s.questionRepo.Update(ctx, question)
}

func (s *QuestionServiceImpl) DeleteQuestion(ctx context.Context, questionID string) error {
	return s.questionRepo.Delete(ctx, questionID)
}

// Query Operations
func (s *QuestionServiceImpl) ListQuestions(ctx context.Context, offset, limit int) (total int, questions []entity.Question, err error) {
	questionPtrs, err := s.questionRepo.GetAll(ctx, offset, limit)
	if err != nil {
		return 0, nil, err
	}

	// Convert []*entity.Question to []entity.Question
	questions = make([]entity.Question, len(questionPtrs))
	for i, q := range questionPtrs {
		questions[i] = *q
	}

	total, err = s.questionRepo.Count(ctx)
	if err != nil {
		return 0, nil, err
	}

	return total, questions, nil
}

func (s *QuestionServiceImpl) GetQuestionsByPaging(ctx context.Context, offset, limit int) (total int, questions []entity.Question, err error) {
	return s.ListQuestions(ctx, offset, limit)
}

// Filtering & Search Operations
func (s *QuestionServiceImpl) FilterByDifficulty(ctx context.Context, difficulty string, offset, limit int) ([]entity.Question, int, error) {
	// Use FindWithFilters with difficulty criteria
	criteria := &repo_interfaces.FilterCriteria{
		Difficulties: []string{difficulty},
	}

	questionPtrs, total, err := s.questionRepo.FindWithFilters(ctx, criteria, offset, limit, "created_at", "DESC")
	if err != nil {
		return nil, 0, err
	}

	// Convert []*entity.Question to []entity.Question
	questions := make([]entity.Question, len(questionPtrs))
	for i, q := range questionPtrs {
		questions[i] = *q
	}

	return questions, total, nil
}

func (s *QuestionServiceImpl) FilterByCategory(ctx context.Context, category string, offset, limit int) ([]entity.Question, int, error) {
	// Use FindWithFilters with subject criteria (assuming category maps to subject)
	criteria := &repo_interfaces.FilterCriteria{
		Subjects: []string{category},
	}

	questionPtrs, total, err := s.questionRepo.FindWithFilters(ctx, criteria, offset, limit, "created_at", "DESC")
	if err != nil {
		return nil, 0, err
	}

	// Convert []*entity.Question to []entity.Question
	questions := make([]entity.Question, len(questionPtrs))
	for i, q := range questionPtrs {
		questions[i] = *q
	}

	return questions, total, nil
}

func (s *QuestionServiceImpl) FilterBySubject(ctx context.Context, subject string, offset, limit int) ([]entity.Question, int, error) {
	// Use FindWithFilters with subject criteria
	criteria := &repo_interfaces.FilterCriteria{
		Subjects: []string{subject},
	}

	questionPtrs, total, err := s.questionRepo.FindWithFilters(ctx, criteria, offset, limit, "created_at", "DESC")
	if err != nil {
		return nil, 0, err
	}

	// Convert []*entity.Question to []entity.Question
	questions := make([]entity.Question, len(questionPtrs))
	for i, q := range questionPtrs {
		questions[i] = *q
	}

	return questions, total, nil
}

func (s *QuestionServiceImpl) SearchQuestions(ctx context.Context, searchOpts *SearchOptions, offset, limit int) ([]SearchResult, int, error) {
	// Convert SearchOptions to repo SearchCriteria
	searchCriteria := repo_interfaces.SearchCriteria{
		Query:            searchOpts.Query,
		SearchInContent:  searchOpts.SearchInContent,
		SearchInSolution: searchOpts.SearchInSolution,
		SearchInTags:     searchOpts.SearchInTags,
		UseRegex:         searchOpts.UseRegex,
		CaseSensitive:    searchOpts.CaseSensitive,
	}

	searchResults, total, err := s.questionRepo.Search(ctx, searchCriteria, nil, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	// Convert repo SearchResult to service SearchResult
	results := make([]SearchResult, len(searchResults))
	for i, sr := range searchResults {
		results[i] = SearchResult{
			Question:    sr.Question,
			Score:       float64(sr.Score),
			Highlights:  sr.Matches,
			MatchFields: []string{sr.Snippet}, // Use snippet as match field
		}
	}

	return results, total, nil
}

// Bulk Operations - placeholder implementations
func (s *QuestionServiceImpl) BulkImportQuestions(ctx context.Context, questions []entity.Question) (*ImportResult, error) {
	// TODO: Implement bulk import logic
	return &ImportResult{
		TotalProcessed: len(questions),
		CreatedCount:   0,
		UpdatedCount:   0,
		ErrorCount:     len(questions),
		Errors:         []ImportError{{Row: 1, Message: "Bulk import not implemented yet"}},
		Summary:        "Bulk import functionality not implemented",
	}, nil
}

func (s *QuestionServiceImpl) ExportQuestions(ctx context.Context, filter *QuestionFilter) ([]entity.Question, error) {
	// TODO: Implement export logic
	return nil, fmt.Errorf("export functionality not implemented yet")
}

func (s *QuestionServiceImpl) BulkUpdateQuestions(ctx context.Context, updates []QuestionUpdate) error {
	// TODO: Implement bulk update logic using repository methods
	return fmt.Errorf("bulk update functionality not implemented yet")
}

func (s *QuestionServiceImpl) BulkDeleteQuestions(ctx context.Context, questionIDs []string) error {
	// Delete questions one by one (could be optimized with batch delete)
	for _, id := range questionIDs {
		if err := s.questionRepo.Delete(ctx, id); err != nil {
			return fmt.Errorf("failed to delete question %s: %w", id, err)
		}
	}
	return nil
}

// Statistics Operations
func (s *QuestionServiceImpl) GetQuestionStatistics(ctx context.Context, filter *QuestionFilter) (*QuestionStatistics, error) {
	// Convert QuestionFilter to repo FilterCriteria
	criteria := &repo_interfaces.FilterCriteria{
		// TODO: Map QuestionFilter fields to FilterCriteria
	}

	stats, err := s.questionRepo.GetStatistics(ctx, criteria)
	if err != nil {
		return nil, err
	}

	// Convert repo Statistics to service QuestionStatistics
	return &QuestionStatistics{
		TotalQuestions:         stats.TotalQuestions,
		TypeDistribution:       stats.TypeDistribution,
		DifficultyDistribution: stats.DifficultyDistribution,
		StatusDistribution:     stats.StatusDistribution,
		CategoryDistribution:   stats.SubjectDistribution, // Map subject to category
		SubjectDistribution:    stats.SubjectDistribution,
		AverageUsageCount:      float64(stats.AverageUsageCount),
		AverageFeedback:        float64(stats.AverageFeedback),
	}, nil
}

func (s *QuestionServiceImpl) GetUsageStatistics(ctx context.Context, questionID string) (*UsageStatistics, error) {
	// Get question to extract usage info
	question, err := s.questionRepo.GetByID(ctx, questionID)
	if err != nil {
		return nil, err
	}

	// TODO: Implement proper usage statistics
	return &UsageStatistics{
		QuestionID:       questionID,
		TotalUsage:       int(question.UsageCount.Int),
		CorrectAnswers:   0, // TODO: Calculate from exam results
		IncorrectAnswers: 0, // TODO: Calculate from exam results
		AverageTime:      0.0, // TODO: Calculate from exam results
		Difficulty:       0.0, // TODO: Calculate based on performance
		LastUsed:         question.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *QuestionServiceImpl) UpdateQuestionUsage(ctx context.Context, questionID string) error {
	return s.questionRepo.UpdateUsageCount(ctx, questionID)
}

// Image Operations - placeholder implementations
func (s *QuestionServiceImpl) UploadQuestionImage(ctx context.Context, questionID string, imageData []byte) (*ImageUploadResult, error) {
	// TODO: Implement image upload logic
	return nil, fmt.Errorf("image upload functionality not implemented yet")
}

func (s *QuestionServiceImpl) DeleteQuestionImage(ctx context.Context, questionID, imageID string) error {
	// TODO: Implement image deletion logic
	return fmt.Errorf("image deletion functionality not implemented yet")
}

func (s *QuestionServiceImpl) GetQuestionImages(ctx context.Context, questionID string) ([]entity.QuestionImage, error) {
	// TODO: Implement get images logic
	return nil, fmt.Errorf("get question images functionality not implemented yet")
}
