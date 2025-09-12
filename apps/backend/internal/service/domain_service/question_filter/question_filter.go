package question_filter

import (
	"context"
	"fmt"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// QuestionFilterService handles advanced question filtering operations
type QuestionFilterService struct {
	questionRepo       *repository.QuestionRepository
	questionCodeRepo   *repository.QuestionCodeRepository
	questionTagRepo    *repository.QuestionTagRepository
	questionFilterRepo *repository.QuestionFilterRepository
	parser             *util.QuestionCodeParser
}

// NewQuestionFilterService creates a new question filter service
func NewQuestionFilterService() *QuestionFilterService {
	return &QuestionFilterService{
		questionRepo:       &repository.QuestionRepository{},
		questionCodeRepo:   &repository.QuestionCodeRepository{},
		questionTagRepo:    &repository.QuestionTagRepository{},
		questionFilterRepo: &repository.QuestionFilterRepository{},
		parser:             util.NewQuestionCodeParser(),
	}
}

// QuestionFilter represents comprehensive filter criteria
type QuestionFilter struct {
	// QuestionCode filters
	QuestionCodeFilter *QuestionCodeFilterCriteria

	// Metadata filters
	MetadataFilter *MetadataFilterCriteria

	// Date range filters
	DateFilter *DateRangeFilterCriteria

	// Content filters
	ContentFilter *ContentFilterCriteria

	// Pagination and sorting
	Pagination *FilterPagination
}

// QuestionCodeFilterCriteria represents QuestionCode component filters
type QuestionCodeFilterCriteria struct {
	Grades     []string // 0,1,2 (10th, 11th, 12th grade)
	Subjects   []string // D,E,H,M,P,S (Probability, English, Chemistry, Math, Physics, Science)
	Chapters   []string // 1,2,3,4,5... (Chapter numbers)
	Levels     []string // N,H,V,C,T,M (Recognition, Understanding, Application, High Application, VIP, Note)
	Lessons    []string // 1,2,3,A,B,C... (Lesson identifiers)
	Forms      []string // 1,2,3... (Form numbers, only for ID6 format)
	IncludeID5 bool     // Include ID5 format questions (default: true)
	IncludeID6 bool     // Include ID6 format questions (default: true)
}

// MetadataFilterCriteria represents metadata-based filters
type MetadataFilterCriteria struct {
	Types           []string // MC, TF, SA, ES, MA
	Statuses        []string // ACTIVE, PENDING, INACTIVE, ARCHIVED
	Difficulties    []string // EASY, MEDIUM, HARD
	Creators        []string // Filter by creator usernames
	Tags            []string // Filter by tags
	RequireAllTags  bool     // If true, use AND logic for tags (default: OR)
	SubcountPattern string   // Pattern matching for subcount field
	MinUsageCount   *int32   // Minimum usage count
	MaxUsageCount   *int32   // Maximum usage count
	MinFeedback     *int32   // Minimum feedback score
	MaxFeedback     *int32   // Maximum feedback score
}

// DateRangeFilterCriteria represents date-based filters
type DateRangeFilterCriteria struct {
	CreatedAfter  *string // Created after this date (ISO format)
	CreatedBefore *string // Created before this date (ISO format)
	UpdatedAfter  *string // Updated after this date (ISO format)
	UpdatedBefore *string // Updated before this date (ISO format)
}

// ContentFilterCriteria represents content-based filters
type ContentFilterCriteria struct {
	HasImages      *bool  // Filter questions with/without images
	HasSolution    *bool  // Filter questions with/without solution
	HasAnswers     *bool  // Filter questions with/without answers
	HasFeedback    *bool  // Filter questions with/without feedback
	HasTags        *bool  // Filter questions with/without tags
	ContentSearch  string // Full-text search in content
	SolutionSearch string // Full-text search in solution
}

// FilterPagination represents pagination and sorting options
type FilterPagination struct {
	Page  int32                // Page number (1-based)
	Limit int32                // Items per page (max 100)
	Sort  []*FilterSortOptions // Multiple sort criteria
}

// FilterSortOptions represents sorting criteria
type FilterSortOptions struct {
	Field string // Field to sort by (created_at, updated_at, usage_count, etc.)
	Order string // Sort order (ASC/DESC)
}

// SearchFilter represents full-text search with filters
type SearchFilter struct {
	Query        string   // Search query
	SearchFields []string // Fields to search: content, solution, tags
	Filter       *QuestionFilter
	Highlight    bool // Return highlighted search matches
}

// QuestionSearchResult represents a question with search highlights
type QuestionSearchResult struct {
	Question       entity.Question
	Highlights     []SearchHighlight
	RelevanceScore float32
}

// SearchHighlight represents highlighted search matches
type SearchHighlight struct {
	Field     string  // Field name where match was found
	Snippet   string  // Text snippet with highlights
	Positions []int32 // Character positions of matches
}

// ListQuestionsByFilter performs comprehensive question filtering
func (s *QuestionFilterService) ListQuestionsByFilter(ctx context.Context, db database.QueryExecer, filter *QuestionFilter) ([]entity.Question, int, *FilterSummary, error) {
	span, ctx := util.StartSpan(ctx, "QuestionFilterService.ListQuestionsByFilter")
	defer span.Finish()

	// Validate filter
	if err := s.validateFilter(filter); err != nil {
		span.FinishWithError(err)
		return nil, 0, nil, fmt.Errorf("invalid filter: %w", err)
	}

	// Apply default pagination if not provided
	if filter.Pagination == nil {
		filter.Pagination = &FilterPagination{
			Page:  1,
			Limit: 20,
		}
	}

	// Convert service filter to repository filter
	repoFilter := s.convertToRepositoryFilter(filter)

	// Call repository for filtering
	questions, total, err := s.questionFilterRepo.FindByFilter(ctx, db, repoFilter)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, nil, fmt.Errorf("failed to filter questions: %w", err)
	}

	// Generate filter summary
	summary, err := s.generateFilterSummary(ctx, db, filter)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, nil, fmt.Errorf("failed to generate filter summary: %w", err)
	}

	return questions, total, summary, nil
}

// SearchQuestions performs full-text search with filters
func (s *QuestionFilterService) SearchQuestions(ctx context.Context, db database.QueryExecer, searchFilter *SearchFilter) ([]QuestionSearchResult, int, error) {
	span, ctx := util.StartSpan(ctx, "QuestionFilterService.SearchQuestions")
	defer span.Finish()

	// Validate search filter
	if err := s.validateSearchFilter(searchFilter); err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("invalid search filter: %w", err)
	}

	// Apply default pagination if not provided
	if searchFilter.Filter == nil {
		searchFilter.Filter = &QuestionFilter{}
	}
	if searchFilter.Filter.Pagination == nil {
		searchFilter.Filter.Pagination = &FilterPagination{
			Page:  1,
			Limit: 20,
		}
	}

	// Convert service search filter to repository search filter
	repoSearchFilter := s.convertToRepositorySearchFilter(searchFilter)

	// Call repository for search
	repoResults, total, err := s.questionFilterRepo.SearchQuestions(ctx, db, *repoSearchFilter)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("failed to search questions: %w", err)
	}

	// Convert repository results to service results
	results := make([]QuestionSearchResult, len(repoResults))
	for i, repoResult := range repoResults {
		results[i] = QuestionSearchResult{
			Question:       repoResult.Question,
			Highlights:     s.convertRepositoryHighlights(repoResult.Highlights),
			RelevanceScore: repoResult.RelevanceScore,
		}
	}

	return results, total, nil
}

// GetQuestionsByQuestionCode gets questions by QuestionCode components
func (s *QuestionFilterService) GetQuestionsByQuestionCode(ctx context.Context, db database.QueryExecer, filter *QuestionCodeFilterCriteria, pagination *FilterPagination) ([]entity.Question, int, []QuestionCodeSummary, error) {
	span, ctx := util.StartSpan(ctx, "QuestionFilterService.GetQuestionsByQuestionCode")
	defer span.Finish()

	// Validate QuestionCode filter
	if err := s.validateQuestionCodeFilter(filter); err != nil {
		span.FinishWithError(err)
		return nil, 0, nil, fmt.Errorf("invalid QuestionCode filter: %w", err)
	}

	// Apply default pagination if not provided
	if pagination == nil {
		pagination = &FilterPagination{
			Page:  1,
			Limit: 20,
		}
	}

	// Convert to repository filter
	repoFilter := s.convertQuestionCodeFilterToRepository(filter, pagination)

	// Call repository for QuestionCode filtering
	questions, total, err := s.questionFilterRepo.FindByFilter(ctx, db, *repoFilter)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, nil, fmt.Errorf("failed to filter questions by QuestionCode: %w", err)
	}

	// Generate QuestionCode summary (simplified for now)
	summary := []QuestionCodeSummary{}

	return questions, total, summary, nil
}

// FilterSummary represents analytics data for filter results
type FilterSummary struct {
	TotalQuestions int32
	ByType         map[string]int32
	ByStatus       map[string]int32
	ByDifficulty   map[string]int32
	ByGrade        map[string]int32
	BySubject      map[string]int32
	ByCreator      map[string]int32
	WithImages     int32
	WithSolution   int32
	WithFeedback   int32
}

// QuestionCodeSummary represents QuestionCode analytics
type QuestionCodeSummary struct {
	Grade            string
	Subject          string
	Chapter          string
	Level            string
	QuestionCount    int32
	AvailableLessons []string
	AvailableForms   []string
}

// validateFilter validates the comprehensive filter
func (s *QuestionFilterService) validateFilter(filter *QuestionFilter) error {
	if filter == nil {
		return fmt.Errorf("filter cannot be nil")
	}

	// Validate QuestionCode filter
	if filter.QuestionCodeFilter != nil {
		if err := s.validateQuestionCodeFilter(filter.QuestionCodeFilter); err != nil {
			return fmt.Errorf("invalid QuestionCode filter: %w", err)
		}
	}

	// Validate pagination
	if filter.Pagination != nil {
		if filter.Pagination.Page < 1 {
			return fmt.Errorf("page must be >= 1")
		}
		if filter.Pagination.Limit < 1 || filter.Pagination.Limit > 100 {
			return fmt.Errorf("limit must be between 1 and 100")
		}
	}

	return nil
}

// validateQuestionCodeFilter validates QuestionCode filter criteria
func (s *QuestionFilterService) validateQuestionCodeFilter(filter *QuestionCodeFilterCriteria) error {
	if filter == nil {
		return nil
	}

	// Validate grades
	for _, grade := range filter.Grades {
		if !s.isValidGrade(grade) {
			return fmt.Errorf("invalid grade: %s", grade)
		}
	}

	// Validate subjects
	for _, subject := range filter.Subjects {
		if !s.isValidSubject(subject) {
			return fmt.Errorf("invalid subject: %s", subject)
		}
	}

	// Validate levels
	for _, level := range filter.Levels {
		if !s.isValidLevel(level) {
			return fmt.Errorf("invalid level: %s", level)
		}
	}

	return nil
}

// validateSearchFilter validates search filter criteria
func (s *QuestionFilterService) validateSearchFilter(filter *SearchFilter) error {
	if filter == nil {
		return fmt.Errorf("search filter cannot be nil")
	}

	if strings.TrimSpace(filter.Query) == "" {
		return fmt.Errorf("search query cannot be empty")
	}

	// Validate underlying filter if provided
	if filter.Filter != nil {
		return s.validateFilter(filter.Filter)
	}

	return nil
}

// Helper validation methods
func (s *QuestionFilterService) isValidGrade(grade string) bool {
	validGrades := []string{"0", "1", "2"}
	for _, valid := range validGrades {
		if grade == valid {
			return true
		}
	}
	return false
}

func (s *QuestionFilterService) isValidSubject(subject string) bool {
	validSubjects := []string{"D", "E", "H", "M", "P", "S"}
	for _, valid := range validSubjects {
		if subject == valid {
			return true
		}
	}
	return false
}

func (s *QuestionFilterService) isValidLevel(level string) bool {
	validLevels := []string{"N", "H", "V", "C", "T", "M"}
	for _, valid := range validLevels {
		if level == valid {
			return true
		}
	}
	return false
}

// generateFilterSummary generates analytics summary for filter results
func (s *QuestionFilterService) generateFilterSummary(ctx context.Context, db database.QueryExecer, filter *QuestionFilter) (*FilterSummary, error) {
	// TODO: Implement summary generation using repository
	// This will query the database to get counts for different categories
	return &FilterSummary{
		TotalQuestions: 0,
		ByType:         make(map[string]int32),
		ByStatus:       make(map[string]int32),
		ByDifficulty:   make(map[string]int32),
		ByGrade:        make(map[string]int32),
		BySubject:      make(map[string]int32),
		ByCreator:      make(map[string]int32),
		WithImages:     0,
		WithSolution:   0,
		WithFeedback:   0,
	}, nil
}

// convertToRepositoryFilter converts service filter to repository filter
func (s *QuestionFilterService) convertToRepositoryFilter(filter *QuestionFilter) repository.QuestionFilterCriteria {
	repoFilter := repository.QuestionFilterCriteria{
		IncludeID5: true, // Default values
		IncludeID6: true,
	}

	// Convert QuestionCode filters
	if filter.QuestionCodeFilter != nil {
		repoFilter.Grades = filter.QuestionCodeFilter.Grades
		repoFilter.Subjects = filter.QuestionCodeFilter.Subjects
		repoFilter.Chapters = filter.QuestionCodeFilter.Chapters
		repoFilter.Levels = filter.QuestionCodeFilter.Levels
		repoFilter.Lessons = filter.QuestionCodeFilter.Lessons
		repoFilter.Forms = filter.QuestionCodeFilter.Forms
		repoFilter.IncludeID5 = filter.QuestionCodeFilter.IncludeID5
		repoFilter.IncludeID6 = filter.QuestionCodeFilter.IncludeID6
	}

	// Convert metadata filters
	if filter.MetadataFilter != nil {
		repoFilter.Types = filter.MetadataFilter.Types
		repoFilter.Statuses = filter.MetadataFilter.Statuses
		repoFilter.Difficulties = filter.MetadataFilter.Difficulties
		repoFilter.Creators = filter.MetadataFilter.Creators
		repoFilter.Tags = filter.MetadataFilter.Tags
		repoFilter.RequireAllTags = filter.MetadataFilter.RequireAllTags
		repoFilter.SubcountPattern = filter.MetadataFilter.SubcountPattern
		repoFilter.MinUsageCount = filter.MetadataFilter.MinUsageCount
		repoFilter.MaxUsageCount = filter.MetadataFilter.MaxUsageCount
		repoFilter.MinFeedback = filter.MetadataFilter.MinFeedback
		repoFilter.MaxFeedback = filter.MetadataFilter.MaxFeedback
	}

	// Convert date filters
	if filter.DateFilter != nil {
		repoFilter.CreatedAfter = filter.DateFilter.CreatedAfter
		repoFilter.CreatedBefore = filter.DateFilter.CreatedBefore
		repoFilter.UpdatedAfter = filter.DateFilter.UpdatedAfter
		repoFilter.UpdatedBefore = filter.DateFilter.UpdatedBefore
	}

	// Convert content filters
	if filter.ContentFilter != nil {
		repoFilter.HasImages = filter.ContentFilter.HasImages
		repoFilter.HasSolution = filter.ContentFilter.HasSolution
		repoFilter.HasAnswers = filter.ContentFilter.HasAnswers
		repoFilter.HasFeedback = filter.ContentFilter.HasFeedback
		repoFilter.HasTags = filter.ContentFilter.HasTags
		repoFilter.ContentSearch = filter.ContentFilter.ContentSearch
		repoFilter.SolutionSearch = filter.ContentFilter.SolutionSearch
	}

	// Convert pagination and sorting
	if filter.Pagination != nil {
		repoFilter.Offset = (filter.Pagination.Page - 1) * filter.Pagination.Limit
		repoFilter.Limit = filter.Pagination.Limit

		// Convert sort options
		if len(filter.Pagination.Sort) > 0 {
			// Use the first sort option for now
			sortOption := filter.Pagination.Sort[0]
			repoFilter.SortBy = sortOption.Field
			repoFilter.SortOrder = sortOption.Order
		}
	}

	return repoFilter
}

// convertToRepositorySearchFilter converts service search filter to repository search filter
func (s *QuestionFilterService) convertToRepositorySearchFilter(searchFilter *SearchFilter) *repository.SearchFilterCriteria {
	repoFilter := &repository.SearchFilterCriteria{
		Query:        searchFilter.Query,
		SearchFields: searchFilter.SearchFields,
		Highlight:    searchFilter.Highlight,
	}

	// Convert underlying filter if provided
	if searchFilter.Filter != nil {
		convertedFilter := s.convertToRepositoryFilter(searchFilter.Filter)
		repoFilter.Filter = &convertedFilter
	}

	return repoFilter
}

// convertRepositoryHighlights converts repository highlights to service highlights
func (s *QuestionFilterService) convertRepositoryHighlights(repoHighlights []repository.SearchHighlight) []SearchHighlight {
	highlights := make([]SearchHighlight, len(repoHighlights))
	for i, repoHighlight := range repoHighlights {
		highlights[i] = SearchHighlight{
			Field:     repoHighlight.Field,
			Snippet:   repoHighlight.Snippet,
			Positions: repoHighlight.Positions,
		}
	}
	return highlights
}

// convertQuestionCodeFilterToRepository converts QuestionCode filter to repository filter
func (s *QuestionFilterService) convertQuestionCodeFilterToRepository(filter *QuestionCodeFilterCriteria, pagination *FilterPagination) *repository.QuestionFilterCriteria {
	repoFilter := &repository.QuestionFilterCriteria{
		Grades:     filter.Grades,
		Subjects:   filter.Subjects,
		Chapters:   filter.Chapters,
		Levels:     filter.Levels,
		Lessons:    filter.Lessons,
		Forms:      filter.Forms,
		IncludeID5: filter.IncludeID5,
		IncludeID6: filter.IncludeID6,
	}

	// Add pagination
	if pagination != nil {
		repoFilter.Offset = (pagination.Page - 1) * pagination.Limit
		repoFilter.Limit = pagination.Limit

		// Add sorting if provided
		if len(pagination.Sort) > 0 {
			sort := pagination.Sort[0] // Use first sort option
			repoFilter.SortBy = sort.Field
			repoFilter.SortOrder = sort.Order
		}
	}

	return repoFilter
}
