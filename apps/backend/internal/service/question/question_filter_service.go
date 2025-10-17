package question

import (
	"context"
	"database/sql"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/opensearch"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// QuestionFilterService handles question filtering operations
type QuestionFilterService struct {
	DB                 *sql.DB
	questionRepo       interfaces.QuestionRepository
	questionFilterRepo *repository.QuestionFilterRepository
	openSearchRepo     *opensearch.QuestionRepository
	logger             *logrus.Logger
}

// NewQuestionFilterService creates a new question filter management service
func NewQuestionFilterService(db *sql.DB, openSearchClient *opensearch.Client) *QuestionFilterService {
	logger := logrus.WithField("service", "QuestionFilterService").Logger

	// Initialize repositories
	questionRepo := repository.NewQuestionRepository(db)
	questionFilterRepo := repository.NewQuestionFilterRepository()

	// Initialize OpenSearch repository if client is available
	var openSearchRepo *opensearch.QuestionRepository
	if openSearchClient != nil && openSearchClient.IsEnabled() {
		openSearchRepo = opensearch.NewQuestionRepository(openSearchClient)
		logger.Info("OpenSearch repository initialized for question filtering")
	} else {
		logger.Info("OpenSearch not available, using PostgreSQL for question filtering")
	}

	return &QuestionFilterService{
		DB:                 db,
		questionRepo:       questionRepo,
		questionFilterRepo: questionFilterRepo,
		openSearchRepo:     openSearchRepo,
		logger:             logger,
	}
}

// Helper functions to convert protobuf enums to string codes
func convertQuestionTypesToStrings(types []common.QuestionType) []string {
	result := make([]string, len(types))
	for i, t := range types {
		result[i] = convertQuestionTypeToString(t)
	}
	return result
}

func convertQuestionTypeToString(t common.QuestionType) string {
	switch t {
	case common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE:
		return "MC"
	case common.QuestionType_QUESTION_TYPE_TRUE_FALSE:
		return "TF"
	case common.QuestionType_QUESTION_TYPE_SHORT_ANSWER:
		return "SA"
	case common.QuestionType_QUESTION_TYPE_ESSAY:
		return "ES"
	case common.QuestionType_QUESTION_TYPE_MATCHING:
		return "MA"
	default:
		return ""
	}
}

func convertDifficultyLevelsToStrings(difficulties []common.DifficultyLevel) []string {
	result := make([]string, len(difficulties))
	for i, d := range difficulties {
		result[i] = convertDifficultyLevelToString(d)
	}
	return result
}

func convertDifficultyLevelToString(d common.DifficultyLevel) string {
	switch d {
	case common.DifficultyLevel_DIFFICULTY_LEVEL_EASY:
		return "EASY"
	case common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM:
		return "MEDIUM"
	case common.DifficultyLevel_DIFFICULTY_LEVEL_HARD:
		return "HARD"
	case common.DifficultyLevel_DIFFICULTY_LEVEL_EXPERT:
		return "EXPERT"
	default:
		return ""
	}
}

func convertQuestionStatusesToStrings(statuses []common.QuestionStatus) []string {
	result := make([]string, len(statuses))
	for i, s := range statuses {
		result[i] = convertQuestionStatusToString(s)
	}
	return result
}

func convertQuestionStatusToString(s common.QuestionStatus) string {
	switch s {
	case common.QuestionStatus_QUESTION_STATUS_ACTIVE:
		return "ACTIVE"
	case common.QuestionStatus_QUESTION_STATUS_PENDING:
		return "PENDING"
	case common.QuestionStatus_QUESTION_STATUS_INACTIVE:
		return "INACTIVE"
	case common.QuestionStatus_QUESTION_STATUS_ARCHIVED:
		return "ARCHIVED"
	default:
		return ""
	}
}

// Helper functions to convert string codes back to protobuf enums
func convertStringToQuestionType(s string) common.QuestionType {
	switch s {
	case "MC":
		return common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE
	case "TF":
		return common.QuestionType_QUESTION_TYPE_TRUE_FALSE
	case "SA":
		return common.QuestionType_QUESTION_TYPE_SHORT_ANSWER
	case "ES":
		return common.QuestionType_QUESTION_TYPE_ESSAY
	case "MA":
		return common.QuestionType_QUESTION_TYPE_MATCHING
	default:
		return common.QuestionType_QUESTION_TYPE_UNSPECIFIED
	}
}

func convertStringToDifficultyLevel(s string) common.DifficultyLevel {
	switch s {
	case "EASY":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_EASY
	case "MEDIUM":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM
	case "HARD":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_HARD
	case "EXPERT":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_EXPERT
	default:
		return common.DifficultyLevel_DIFFICULTY_LEVEL_UNSPECIFIED
	}
}

func convertStringToQuestionStatus(s string) common.QuestionStatus {
	switch s {
	case "ACTIVE":
		return common.QuestionStatus_QUESTION_STATUS_ACTIVE
	case "PENDING":
		return common.QuestionStatus_QUESTION_STATUS_PENDING
	case "INACTIVE":
		return common.QuestionStatus_QUESTION_STATUS_INACTIVE
	case "ARCHIVED":
		return common.QuestionStatus_QUESTION_STATUS_ARCHIVED
	default:
		return common.QuestionStatus_QUESTION_STATUS_UNSPECIFIED
	}
}

// ListQuestionsByFilter performs comprehensive question filtering with proto conversion
func (qfm *QuestionFilterService) ListQuestionsByFilter(ctx context.Context, req *v1.ListQuestionsByFilterRequest) (*v1.ListQuestionsByFilterResponse, error) {
	qfm.logger.WithFields(logrus.Fields{
		"has_question_code_filter": req.QuestionCodeFilter != nil,
		"has_metadata_filter":      req.MetadataFilter != nil,
		"has_date_filter":          req.DateFilter != nil,
		"has_content_filter":       req.ContentFilter != nil,
	}).Info("ListQuestionsByFilter called")

	// Build filter criteria from request
	filterCriteria := qfm.buildListFilterCriteria(req)

	// Calculate pagination
	page := req.Pagination.GetPage()
	if page < 1 {
		page = 1
	}
	limit := req.Pagination.GetLimit()
	if limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	// Determine sort column and order from pagination.sort array
	sortColumn := "created_at" // Default sort column
	sortOrder := "DESC"        // Default sort order
	if req.Pagination != nil && len(req.Pagination.Sort) > 0 {
		// Use first sort option
		firstSort := req.Pagination.Sort[0]
		sortColumn = convertSortFieldToColumn(firstSort.Field)
		sortOrder = convertSortOrderToString(firstSort.Order)
	}

	// Call repository to find questions with filters
	questions, total, err := qfm.questionRepo.FindWithFilters(ctx, filterCriteria, int(offset), int(limit), sortColumn, sortOrder)
	if err != nil {
		qfm.logger.WithError(err).Error("Failed to find questions with filters")
		return nil, err
	}

	// Convert to proto response
	protoQuestions := make([]*v1.QuestionDetail, len(questions))
	for i, question := range questions {
		protoQuestions[i] = qfm.convertQuestionToProto(question)
	}

	totalPages := (total + int(limit) - 1) / int(limit)

	response := &v1.ListQuestionsByFilterResponse{
		Questions:  protoQuestions,
		TotalCount: int32(total),
		Page:       page,
		Limit:      limit,
		TotalPages: int32(totalPages),
	}

	qfm.logger.WithFields(logrus.Fields{
		"total_results":  total,
		"returned_count": len(protoQuestions),
		"total_pages":    totalPages,
	}).Info("ListQuestionsByFilter completed successfully")

	return response, nil
}

// SearchQuestions performs full-text search with filters
func (qfm *QuestionFilterService) SearchQuestions(ctx context.Context, req *v1.SearchQuestionsRequest) (*v1.SearchQuestionsResponse, error) {
	qfm.logger.WithFields(logrus.Fields{
		"query":         req.Query,
		"search_fields": req.SearchFields,
		"page":          req.Pagination.GetPage(),
		"limit":         req.Pagination.GetLimit(),
	}).Info("Processing search questions request")

	// Build search criteria
	searchCriteria := interfaces.SearchCriteria{
		Query:            req.Query,
		SearchInContent:  qfm.containsField(req.SearchFields, "content"),
		SearchInSolution: qfm.containsField(req.SearchFields, "solution"),
		SearchInTags:     qfm.containsField(req.SearchFields, "tags"),
		UseRegex:         false,
		CaseSensitive:    false,
	}

	// If no specific fields specified, search in all fields
	if len(req.SearchFields) == 0 {
		searchCriteria.SearchInContent = true
		searchCriteria.SearchInSolution = true
		searchCriteria.SearchInTags = true
	}

	// Build filter criteria from request
	var filterCriteria *interfaces.FilterCriteria
	if req.QuestionCodeFilter != nil || req.MetadataFilter != nil || req.DateFilter != nil {
		filterCriteria = qfm.buildFilterCriteria(req)
	}

	// Calculate pagination
	page := req.Pagination.GetPage()
	if page < 1 {
		page = 1
	}
	limit := req.Pagination.GetLimit()
	if limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	// Perform search using OpenSearch if available, otherwise fallback to PostgreSQL
	var searchResults []*interfaces.SearchResult
	var total int
	var err error

	if qfm.openSearchRepo != nil {
		// Use OpenSearch for Vietnamese text search
		searchResults, total, err = qfm.openSearchRepo.SearchQuestions(ctx, searchCriteria, filterCriteria, int(offset), int(limit))
		if err != nil {
			qfm.logger.WithError(err).Warn("OpenSearch failed, falling back to PostgreSQL")
			// Fallback to PostgreSQL
			searchResults, total, err = qfm.questionRepo.Search(ctx, searchCriteria, filterCriteria, int(offset), int(limit))
		}
	} else {
		// Use PostgreSQL search
		searchResults, total, err = qfm.questionRepo.Search(ctx, searchCriteria, filterCriteria, int(offset), int(limit))
	}

	if err != nil {
		qfm.logger.WithError(err).Error("Failed to search questions")
		return nil, err
	}

	// Convert to proto response
	protoResults := make([]*v1.QuestionSearchResult, len(searchResults))
	for i, result := range searchResults {
		protoResults[i] = qfm.convertToProtoSearchResult(&result.Question, result.Score, result.Matches, result.Snippet)
	}

	totalPages := (total + int(limit) - 1) / int(limit)

	response := &v1.SearchQuestionsResponse{
		Questions:    protoResults,
		TotalCount:   int32(total),
		Page:         page,
		Limit:        limit,
		TotalPages:   int32(totalPages),
		Query:        req.Query,
		SearchFields: req.SearchFields,
	}

	qfm.logger.WithFields(logrus.Fields{
		"total_results":  total,
		"returned_count": len(protoResults),
		"total_pages":    totalPages,
	}).Info("Search completed successfully")

	return response, nil
}

// Helper methods

// containsField checks if a field is in the search fields list
func (qfm *QuestionFilterService) containsField(fields []string, field string) bool {
	for _, f := range fields {
		if f == field {
			return true
		}
	}
	return false
}

// buildFilterCriteria builds filter criteria from proto request
func (qfm *QuestionFilterService) buildFilterCriteria(req *v1.SearchQuestionsRequest) *interfaces.FilterCriteria {
	criteria := &interfaces.FilterCriteria{}

	// Question code filters
	if req.QuestionCodeFilter != nil {
		if len(req.QuestionCodeFilter.Grades) > 0 {
			criteria.Grades = req.QuestionCodeFilter.Grades
		}
		if len(req.QuestionCodeFilter.Subjects) > 0 {
			criteria.Subjects = req.QuestionCodeFilter.Subjects
		}
		if len(req.QuestionCodeFilter.Chapters) > 0 {
			criteria.Chapters = req.QuestionCodeFilter.Chapters
		}
		if len(req.QuestionCodeFilter.Levels) > 0 {
			criteria.Levels = req.QuestionCodeFilter.Levels
		}
		if len(req.QuestionCodeFilter.Lessons) > 0 {
			criteria.Lessons = req.QuestionCodeFilter.Lessons
		}
		if len(req.QuestionCodeFilter.Forms) > 0 {
			criteria.Forms = req.QuestionCodeFilter.Forms
		}
	}

	// Metadata filters
	if req.MetadataFilter != nil {
		if len(req.MetadataFilter.Types) > 0 {
			criteria.Types = convertQuestionTypesToStrings(req.MetadataFilter.Types)
		}
		if len(req.MetadataFilter.Difficulties) > 0 {
			criteria.Difficulties = convertDifficultyLevelsToStrings(req.MetadataFilter.Difficulties)
		}
		if len(req.MetadataFilter.Statuses) > 0 {
			criteria.Statuses = convertQuestionStatusesToStrings(req.MetadataFilter.Statuses)
		}
		if len(req.MetadataFilter.Creators) > 0 {
			criteria.Creators = req.MetadataFilter.Creators
		}
		if len(req.MetadataFilter.Tags) > 0 {
			criteria.Tags = req.MetadataFilter.Tags
			criteria.TagMatchAll = req.MetadataFilter.RequireAllTags
		}

		// Numeric ranges - updated field names
		if req.MetadataFilter.MinUsageCount > 0 {
			criteria.MinUsageCount = req.MetadataFilter.MinUsageCount
		}
		if req.MetadataFilter.MaxUsageCount > 0 {
			criteria.MaxUsageCount = req.MetadataFilter.MaxUsageCount
		}
		if req.MetadataFilter.MinFeedback > 0 {
			criteria.MinFeedback = req.MetadataFilter.MinFeedback
		}
		if req.MetadataFilter.MaxFeedback > 0 {
			criteria.MaxFeedback = req.MetadataFilter.MaxFeedback
		}
	}

	// Date filters
	if req.DateFilter != nil {
		if req.DateFilter.CreatedAfter != nil {
			criteria.CreatedAfter = req.DateFilter.CreatedAfter.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
		if req.DateFilter.CreatedBefore != nil {
			criteria.CreatedBefore = req.DateFilter.CreatedBefore.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
		if req.DateFilter.UpdatedAfter != nil {
			criteria.UpdatedAfter = req.DateFilter.UpdatedAfter.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
		if req.DateFilter.UpdatedBefore != nil {
			criteria.UpdatedBefore = req.DateFilter.UpdatedBefore.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
	}

	return criteria
}

// buildListFilterCriteria builds filter criteria from ListQuestionsByFilterRequest
func (qfm *QuestionFilterService) buildListFilterCriteria(req *v1.ListQuestionsByFilterRequest) *interfaces.FilterCriteria {
	criteria := &interfaces.FilterCriteria{}

	// Question code filters
	if req.QuestionCodeFilter != nil {
		if len(req.QuestionCodeFilter.Grades) > 0 {
			criteria.Grades = req.QuestionCodeFilter.Grades
		}
		if len(req.QuestionCodeFilter.Subjects) > 0 {
			criteria.Subjects = req.QuestionCodeFilter.Subjects
		}
		if len(req.QuestionCodeFilter.Chapters) > 0 {
			criteria.Chapters = req.QuestionCodeFilter.Chapters
		}
		if len(req.QuestionCodeFilter.Levels) > 0 {
			criteria.Levels = req.QuestionCodeFilter.Levels
		}
		if len(req.QuestionCodeFilter.Lessons) > 0 {
			criteria.Lessons = req.QuestionCodeFilter.Lessons
		}
		if len(req.QuestionCodeFilter.Forms) > 0 {
			criteria.Forms = req.QuestionCodeFilter.Forms
		}
	}

	// Metadata filters
	if req.MetadataFilter != nil {
		if len(req.MetadataFilter.Types) > 0 {
			criteria.Types = convertQuestionTypesToStrings(req.MetadataFilter.Types)
		}
		if len(req.MetadataFilter.Difficulties) > 0 {
			criteria.Difficulties = convertDifficultyLevelsToStrings(req.MetadataFilter.Difficulties)
		}
		if len(req.MetadataFilter.Statuses) > 0 {
			criteria.Statuses = convertQuestionStatusesToStrings(req.MetadataFilter.Statuses)
		}
		if len(req.MetadataFilter.Creators) > 0 {
			criteria.Creators = req.MetadataFilter.Creators
		}
		if len(req.MetadataFilter.Tags) > 0 {
			criteria.Tags = req.MetadataFilter.Tags
			criteria.TagMatchAll = req.MetadataFilter.RequireAllTags
		}

		// Numeric ranges
		if req.MetadataFilter.MinUsageCount > 0 {
			criteria.MinUsageCount = req.MetadataFilter.MinUsageCount
		}
		if req.MetadataFilter.MaxUsageCount > 0 {
			criteria.MaxUsageCount = req.MetadataFilter.MaxUsageCount
		}
		if req.MetadataFilter.MinFeedback > 0 {
			criteria.MinFeedback = req.MetadataFilter.MinFeedback
		}
		if req.MetadataFilter.MaxFeedback > 0 {
			criteria.MaxFeedback = req.MetadataFilter.MaxFeedback
		}
	}

	// Date filters
	if req.DateFilter != nil {
		if req.DateFilter.CreatedAfter != nil {
			criteria.CreatedAfter = req.DateFilter.CreatedAfter.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
		if req.DateFilter.CreatedBefore != nil {
			criteria.CreatedBefore = req.DateFilter.CreatedBefore.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
		if req.DateFilter.UpdatedAfter != nil {
			criteria.UpdatedAfter = req.DateFilter.UpdatedAfter.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
		if req.DateFilter.UpdatedBefore != nil {
			criteria.UpdatedBefore = req.DateFilter.UpdatedBefore.AsTime().Format("2006-01-02T15:04:05Z07:00")
		}
	}

	// Content filters
	if req.ContentFilter != nil {
		if req.ContentFilter.HasSolution {
			hasTrue := true
			criteria.HasSolution = &hasTrue
		}
		// Note: HasSource is not in ContentFilter proto, using HasSolution only
	}

	return criteria
}

// convertSortFieldToColumn converts proto SortField to database column name
func convertSortFieldToColumn(field v1.SortField) string {
	switch field {
	case v1.SortField_SORT_FIELD_CREATED_AT:
		return "created_at"
	case v1.SortField_SORT_FIELD_UPDATED_AT:
		return "updated_at"
	case v1.SortField_SORT_FIELD_USAGE_COUNT:
		return "usage_count"
	case v1.SortField_SORT_FIELD_FEEDBACK:
		return "feedback"
	case v1.SortField_SORT_FIELD_DIFFICULTY:
		return "difficulty"
	default:
		return "created_at" // Default
	}
}

// convertSortOrderToString converts proto SortOrder to SQL string
func convertSortOrderToString(order v1.SortOrder) string {
	switch order {
	case v1.SortOrder_SORT_ORDER_ASC:
		return "ASC"
	case v1.SortOrder_SORT_ORDER_DESC:
		return "DESC"
	default:
		return "DESC" // Default
	}
}

// convertToProtoSearchResult converts search result to proto format
func (qfm *QuestionFilterService) convertToProtoSearchResult(question *entity.Question, score float32, matches []string, snippet string) *v1.QuestionSearchResult {
	// Convert question to proto format (reuse existing conversion logic)
	protoQuestion := qfm.convertQuestionToProto(question)

	// Create highlights from matches and snippet
	highlights := make([]*v1.SearchHighlight, 0, len(matches))
	for range matches {
		highlights = append(highlights, &v1.SearchHighlight{
			Field:   "content", // Default field
			Snippet: snippet,
		})
	}

	return &v1.QuestionSearchResult{
		Question:       protoQuestion,
		RelevanceScore: score,
		Highlights:     highlights,
	}
}

// convertQuestionToProto converts entity.Question to proto format
func (qfm *QuestionFilterService) convertQuestionToProto(question *entity.Question) *v1.QuestionDetail {
	// Basic conversion using util functions
	protoQuestion := &v1.QuestionDetail{
		Id:         util.PgTextToString(question.ID),
		Content:    util.PgTextToString(question.Content),
		RawContent: util.PgTextToString(question.RawContent),
		Type:       convertStringToQuestionType(util.PgTextToString(question.Type)),
		Difficulty: convertStringToDifficultyLevel(util.PgTextToString(question.Difficulty)),
		Status:     convertStringToQuestionStatus(util.PgTextToString(question.Status)),
		Creator:    util.PgTextToString(question.Creator),
		UsageCount: util.PgInt4ToInt32(question.UsageCount),
		Feedback:   util.PgInt4ToInt32(question.Feedback),
		Tags:       util.PgTextArrayToStringSlice(question.Tag),
	}

	// Add optional fields
	if question.Solution.Status == 1 { // pgtype.Present
		protoQuestion.Solution = util.PgTextToString(question.Solution)
	}
	if question.Source.Status == 1 { // pgtype.Present
		protoQuestion.Source = util.PgTextToString(question.Source)
	}
	if question.Subcount.Status == 1 { // pgtype.Present
		protoQuestion.Subcount = util.PgTextToString(question.Subcount)
	}
	if question.QuestionCodeID.Status == 1 { // pgtype.Present
		protoQuestion.QuestionCodeId = util.PgTextToString(question.QuestionCodeID)
	}

	// Add timestamps
	if question.CreatedAt.Status == 1 { // pgtype.Present
		protoQuestion.CreatedAt = timestamppb.New(util.PgTimestamptzToTime(question.CreatedAt))
	}
	if question.UpdatedAt.Status == 1 { // pgtype.Present
		protoQuestion.UpdatedAt = timestamppb.New(util.PgTimestamptzToTime(question.UpdatedAt))
	}

	return protoQuestion
}

// GetQuestionsByQuestionCode gets questions by QuestionCode components
func (qfm *QuestionFilterService) GetQuestionsByQuestionCode(ctx context.Context, req *v1.GetQuestionsByQuestionCodeRequest) (*v1.GetQuestionsByQuestionCodeResponse, error) {
	// TODO: Implement logic using QuestionRepository
	return &v1.GetQuestionsByQuestionCodeResponse{
		Questions:  []*v1.QuestionWithCodeInfo{},
		TotalCount: 0,
		Page:       1,
		Limit:      20,
		TotalPages: 0,
	}, nil
}
