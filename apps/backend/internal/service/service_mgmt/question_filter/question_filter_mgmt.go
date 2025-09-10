package question_filter_mgmt

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	questionFilterService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/question_filter"
	questionCodeService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/questioncode"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/jackc/pgtype"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// IQuestionFilterService defines the interface for question filter domain service
type IQuestionFilterService interface {
	ListQuestionsByFilter(ctx context.Context, db database.QueryExecer, filter *questionFilterService.QuestionFilter) ([]entity.Question, int, *questionFilterService.FilterSummary, error)
	SearchQuestions(ctx context.Context, db database.QueryExecer, searchFilter *questionFilterService.SearchFilter) ([]questionFilterService.QuestionSearchResult, int, error)
	GetQuestionsByQuestionCode(ctx context.Context, db database.QueryExecer, filter *questionFilterService.QuestionCodeFilterCriteria, pagination *questionFilterService.FilterPagination) ([]entity.Question, int, []questionFilterService.QuestionCodeSummary, error)
}

// IQuestionCodeService defines the interface for question code domain service
type IQuestionCodeService interface {
	GetHumanReadableInfo(questionCodeStr string) (*questionCodeService.QuestionCodeInfo, error)
}

// QuestionFilterMgmt handles question filtering operations following the service management pattern
type QuestionFilterMgmt struct {
	DB                    database.QueryExecer
	QuestionFilterService IQuestionFilterService
	QuestionCodeService   IQuestionCodeService
}

// NewQuestionFilterMgmt creates a new question filter management service
func NewQuestionFilterMgmt(db database.QueryExecer) *QuestionFilterMgmt {
	return &QuestionFilterMgmt{
		DB:                    db,
		QuestionFilterService: questionFilterService.NewQuestionFilterService(),
		QuestionCodeService:   questionCodeService.NewQuestionCodeService(),
	}
}

// ListQuestionsByFilter performs comprehensive question filtering with proto conversion
func (qfm *QuestionFilterMgmt) ListQuestionsByFilter(ctx context.Context, req *v1.ListQuestionsByFilterRequest) (*v1.ListQuestionsByFilterResponse, error) {
	// Convert proto request to service filter
	filter, err := qfm.convertProtoToServiceFilter(req)
	if err != nil {
		return nil, fmt.Errorf("failed to convert proto filter: %w", err)
	}

	// Call domain service
	questions, total, summary, err := qfm.QuestionFilterService.ListQuestionsByFilter(ctx, qfm.DB, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to filter questions: %w", err)
	}

	// Convert results to proto
	protoQuestions := make([]*v1.QuestionDetail, len(questions))
	for i, question := range questions {
		protoQuestions[i] = qfm.convertQuestionToProtoDetail(&question)
	}

	// Calculate pagination info
	page := int32(1)
	limit := int32(20)
	if filter.Pagination != nil {
		page = filter.Pagination.Page
		limit = filter.Pagination.Limit
	}
	totalPages := int32((total + int(limit) - 1) / int(limit))

	return &v1.ListQuestionsByFilterResponse{
		Questions:     protoQuestions,
		TotalCount:    int32(total),
		Page:          page,
		Limit:         limit,
		TotalPages:    totalPages,
		FilterSummary: qfm.convertFilterSummaryToProto(summary),
	}, nil
}

// SearchQuestions performs full-text search with filters
func (qfm *QuestionFilterMgmt) SearchQuestions(ctx context.Context, req *v1.SearchQuestionsRequest) (*v1.SearchQuestionsResponse, error) {
	// Convert proto request to service search filter
	searchFilter, err := qfm.convertProtoToSearchFilter(req)
	if err != nil {
		return nil, fmt.Errorf("failed to convert proto search filter: %w", err)
	}

	// Call domain service
	results, total, err := qfm.QuestionFilterService.SearchQuestions(ctx, qfm.DB, searchFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to search questions: %w", err)
	}

	// Convert results to proto
	protoResults := make([]*v1.QuestionSearchResult, len(results))
	for i, result := range results {
		protoResults[i] = &v1.QuestionSearchResult{
			Question:       qfm.convertQuestionToProtoDetail(&result.Question),
			Highlights:     qfm.convertHighlightsToProto(result.Highlights),
			RelevanceScore: result.RelevanceScore,
		}
	}

	// Calculate pagination info
	page := int32(1)
	limit := int32(20)
	if searchFilter.Filter != nil && searchFilter.Filter.Pagination != nil {
		page = searchFilter.Filter.Pagination.Page
		limit = searchFilter.Filter.Pagination.Limit
	}
	totalPages := int32((total + int(limit) - 1) / int(limit))

	return &v1.SearchQuestionsResponse{
		Questions:    protoResults,
		TotalCount:   int32(total),
		Page:         page,
		Limit:        limit,
		TotalPages:   totalPages,
		Query:        req.Query,
		SearchFields: req.SearchFields,
	}, nil
}

// GetQuestionsByQuestionCode gets questions by QuestionCode components
func (qfm *QuestionFilterMgmt) GetQuestionsByQuestionCode(ctx context.Context, req *v1.GetQuestionsByQuestionCodeRequest) (*v1.GetQuestionsByQuestionCodeResponse, error) {
	// Convert proto request to service filter
	filter, pagination, err := qfm.convertProtoToQuestionCodeFilter(req)
	if err != nil {
		return nil, fmt.Errorf("failed to convert proto QuestionCode filter: %w", err)
	}

	// Call domain service
	questions, total, summary, err := qfm.QuestionFilterService.GetQuestionsByQuestionCode(ctx, qfm.DB, filter, pagination)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions by QuestionCode: %w", err)
	}

	// Convert results to proto
	var protoQuestions []*v1.QuestionWithCodeInfo
	if req.IncludeQuestionCodeInfo {
		protoQuestions = make([]*v1.QuestionWithCodeInfo, len(questions))
		for i, question := range questions {
			questionCodeInfo, err := qfm.getQuestionCodeInfo(question.QuestionCodeID.String)
			if err != nil {
				// Log error but continue
				questionCodeInfo = nil
			}

			protoQuestions[i] = &v1.QuestionWithCodeInfo{
				Question:         qfm.convertQuestionToProtoDetail(&question),
				QuestionCodeInfo: questionCodeInfo,
			}
		}
	} else {
		// Just convert questions without code info
		basicQuestions := make([]*v1.QuestionDetail, len(questions))
		for i, question := range questions {
			basicQuestions[i] = qfm.convertQuestionToProtoDetail(&question)
		}
		// Convert to QuestionWithCodeInfo format for consistency
		protoQuestions = make([]*v1.QuestionWithCodeInfo, len(basicQuestions))
		for i, q := range basicQuestions {
			protoQuestions[i] = &v1.QuestionWithCodeInfo{
				Question:         q,
				QuestionCodeInfo: nil,
			}
		}
	}

	// Calculate pagination info
	page := int32(1)
	limit := int32(20)
	if pagination != nil {
		page = pagination.Page
		limit = pagination.Limit
	}
	totalPages := int32((total + int(limit) - 1) / int(limit))

	return &v1.GetQuestionsByQuestionCodeResponse{
		Questions:           protoQuestions,
		TotalCount:          int32(total),
		Page:                page,
		Limit:               limit,
		TotalPages:          totalPages,
		QuestionCodeSummary: qfm.convertQuestionCodeSummaryToProto(summary),
	}, nil
}

// Helper methods for proto conversion

// convertProtoToServiceFilter converts proto filter to service filter
func (qfm *QuestionFilterMgmt) convertProtoToServiceFilter(req *v1.ListQuestionsByFilterRequest) (*questionFilterService.QuestionFilter, error) {
	filter := &questionFilterService.QuestionFilter{}

	// Convert QuestionCode filter
	if req.QuestionCodeFilter != nil {
		filter.QuestionCodeFilter = &questionFilterService.QuestionCodeFilterCriteria{
			Grades:     req.QuestionCodeFilter.Grades,
			Subjects:   req.QuestionCodeFilter.Subjects,
			Chapters:   req.QuestionCodeFilter.Chapters,
			Levels:     req.QuestionCodeFilter.Levels,
			Lessons:    req.QuestionCodeFilter.Lessons,
			Forms:      req.QuestionCodeFilter.Forms,
			IncludeID5: req.QuestionCodeFilter.IncludeId5,
			IncludeID6: req.QuestionCodeFilter.IncludeId6,
		}
	}

	// Convert metadata filter
	if req.MetadataFilter != nil {
		filter.MetadataFilter = &questionFilterService.MetadataFilterCriteria{
			Types:           req.MetadataFilter.Types,
			Statuses:        req.MetadataFilter.Statuses,
			Difficulties:    req.MetadataFilter.Difficulties,
			Creators:        req.MetadataFilter.Creators,
			Tags:            req.MetadataFilter.Tags,
			RequireAllTags:  req.MetadataFilter.RequireAllTags,
			SubcountPattern: req.MetadataFilter.SubcountPattern,
			MinUsageCount:   qfm.int32PtrOrNil(req.MetadataFilter.MinUsageCount),
			MaxUsageCount:   qfm.int32PtrOrNil(req.MetadataFilter.MaxUsageCount),
			MinFeedback:     qfm.int32PtrOrNil(req.MetadataFilter.MinFeedback),
			MaxFeedback:     qfm.int32PtrOrNil(req.MetadataFilter.MaxFeedback),
		}
	}

	// Convert date filter
	if req.DateFilter != nil {
		filter.DateFilter = &questionFilterService.DateRangeFilterCriteria{
			CreatedAfter:  qfm.timestampToStringPtr(req.DateFilter.CreatedAfter),
			CreatedBefore: qfm.timestampToStringPtr(req.DateFilter.CreatedBefore),
			UpdatedAfter:  qfm.timestampToStringPtr(req.DateFilter.UpdatedAfter),
			UpdatedBefore: qfm.timestampToStringPtr(req.DateFilter.UpdatedBefore),
		}
	}

	// Convert content filter
	if req.ContentFilter != nil {
		filter.ContentFilter = &questionFilterService.ContentFilterCriteria{
			HasImages:      qfm.boolPtrOrNil(req.ContentFilter.HasImages),
			HasSolution:    qfm.boolPtrOrNil(req.ContentFilter.HasSolution),
			HasAnswers:     qfm.boolPtrOrNil(req.ContentFilter.HasAnswers),
			HasFeedback:    qfm.boolPtrOrNil(req.ContentFilter.HasFeedback),
			HasTags:        qfm.boolPtrOrNil(req.ContentFilter.HasTags),
			ContentSearch:  req.ContentFilter.ContentSearch,
			SolutionSearch: req.ContentFilter.SolutionSearch,
		}
	}

	// Convert pagination
	if req.Pagination != nil {
		sortOptions := make([]*questionFilterService.FilterSortOptions, len(req.Pagination.Sort))
		for i, sort := range req.Pagination.Sort {
			sortOptions[i] = &questionFilterService.FilterSortOptions{
				Field: qfm.convertSortFieldToString(sort.Field),
				Order: qfm.convertSortOrderToString(sort.Order),
			}
		}

		filter.Pagination = &questionFilterService.FilterPagination{
			Page:  req.Pagination.Page,
			Limit: req.Pagination.Limit,
			Sort:  sortOptions,
		}
	}

	return filter, nil
}

// convertProtoToSearchFilter converts proto search request to service search filter
func (qfm *QuestionFilterMgmt) convertProtoToSearchFilter(req *v1.SearchQuestionsRequest) (*questionFilterService.SearchFilter, error) {
	searchFilter := &questionFilterService.SearchFilter{
		Query:        req.Query,
		SearchFields: req.SearchFields,
		Highlight:    req.HighlightMatches,
	}

	// Convert underlying filter if provided
	if req.QuestionCodeFilter != nil || req.MetadataFilter != nil || req.DateFilter != nil || req.Pagination != nil {
		// Create a temporary ListQuestionsByFilterRequest to reuse conversion logic
		tempReq := &v1.ListQuestionsByFilterRequest{
			QuestionCodeFilter: req.QuestionCodeFilter,
			MetadataFilter:     req.MetadataFilter,
			DateFilter:         req.DateFilter,
			Pagination:         req.Pagination,
		}

		filter, err := qfm.convertProtoToServiceFilter(tempReq)
		if err != nil {
			return nil, fmt.Errorf("failed to convert search filter: %w", err)
		}
		searchFilter.Filter = filter
	}

	return searchFilter, nil
}

// convertProtoToQuestionCodeFilter converts proto QuestionCode request to service filter
func (qfm *QuestionFilterMgmt) convertProtoToQuestionCodeFilter(req *v1.GetQuestionsByQuestionCodeRequest) (*questionFilterService.QuestionCodeFilterCriteria, *questionFilterService.FilterPagination, error) {
	var filter *questionFilterService.QuestionCodeFilterCriteria
	var pagination *questionFilterService.FilterPagination

	// Convert QuestionCode filter
	if req.QuestionCodeFilter != nil {
		filter = &questionFilterService.QuestionCodeFilterCriteria{
			Grades:     req.QuestionCodeFilter.Grades,
			Subjects:   req.QuestionCodeFilter.Subjects,
			Chapters:   req.QuestionCodeFilter.Chapters,
			Levels:     req.QuestionCodeFilter.Levels,
			Lessons:    req.QuestionCodeFilter.Lessons,
			Forms:      req.QuestionCodeFilter.Forms,
			IncludeID5: req.QuestionCodeFilter.IncludeId5,
			IncludeID6: req.QuestionCodeFilter.IncludeId6,
		}
	}

	// Convert metadata filter if provided
	if req.MetadataFilter != nil {
		// For QuestionCode filtering, we can include basic metadata filters
		// but the main focus is on QuestionCode components
	}

	// Convert pagination
	if req.Pagination != nil {
		sortOptions := make([]*questionFilterService.FilterSortOptions, len(req.Pagination.Sort))
		for i, sort := range req.Pagination.Sort {
			sortOptions[i] = &questionFilterService.FilterSortOptions{
				Field: qfm.convertSortFieldToString(sort.Field),
				Order: qfm.convertSortOrderToString(sort.Order),
			}
		}

		pagination = &questionFilterService.FilterPagination{
			Page:  req.Pagination.Page,
			Limit: req.Pagination.Limit,
			Sort:  sortOptions,
		}
	}

	return filter, pagination, nil
}

// Helper conversion methods

// convertQuestionToProtoDetail converts entity.Question to proto QuestionDetail
func (qfm *QuestionFilterMgmt) convertQuestionToProtoDetail(question *entity.Question) *v1.QuestionDetail {
	// Convert pgtype fields to strings
	var tags []string
	if question.Tag.Status == pgtype.Present {
		for _, element := range question.Tag.Elements {
			if element.Status == pgtype.Present {
				tags = append(tags, element.String)
			}
		}
	}

	return &v1.QuestionDetail{
		Id:             qfm.pgTextToString(question.ID),
		RawContent:     qfm.pgTextToString(question.RawContent),
		Content:        qfm.pgTextToString(question.Content),
		Subcount:       qfm.pgTextToString(question.Subcount),
		Type:           qfm.pgTextToString(question.Type),
		Source:         qfm.pgTextToString(question.Source),
		Answers:        qfm.pgJSONBToString(question.Answers),
		CorrectAnswer:  qfm.pgJSONBToString(question.CorrectAnswer),
		Solution:       qfm.pgTextToString(question.Solution),
		Tags:           tags,
		UsageCount:     qfm.pgInt4ToInt32(question.UsageCount),
		Creator:        qfm.pgTextToString(question.Creator),
		Status:         qfm.pgTextToString(question.Status),
		Feedback:       qfm.pgInt4ToInt32(question.Feedback),
		Difficulty:     qfm.pgTextToString(question.Difficulty),
		CreatedAt:      qfm.pgTimestamptzToProto(question.CreatedAt),
		UpdatedAt:      qfm.pgTimestamptzToProto(question.UpdatedAt),
		QuestionCodeId: qfm.pgTextToString(question.QuestionCodeID),
	}
}

// convertFilterSummaryToProto converts service FilterSummary to proto
func (qfm *QuestionFilterMgmt) convertFilterSummaryToProto(summary *questionFilterService.FilterSummary) *v1.FilterSummary {
	if summary == nil {
		return &v1.FilterSummary{}
	}

	return &v1.FilterSummary{
		TotalQuestions: summary.TotalQuestions,
		ByType:         summary.ByType,
		ByStatus:       summary.ByStatus,
		ByDifficulty:   summary.ByDifficulty,
		ByGrade:        summary.ByGrade,
		BySubject:      summary.BySubject,
		ByCreator:      summary.ByCreator,
		WithImages:     summary.WithImages,
		WithSolution:   summary.WithSolution,
		WithFeedback:   summary.WithFeedback,
	}
}

// convertHighlightsToProto converts service highlights to proto
func (qfm *QuestionFilterMgmt) convertHighlightsToProto(highlights []questionFilterService.SearchHighlight) []*v1.SearchHighlight {
	protoHighlights := make([]*v1.SearchHighlight, len(highlights))
	for i, highlight := range highlights {
		protoHighlights[i] = &v1.SearchHighlight{
			Field:     highlight.Field,
			Snippet:   highlight.Snippet,
			Positions: highlight.Positions,
		}
	}
	return protoHighlights
}

// convertQuestionCodeSummaryToProto converts service QuestionCodeSummary to proto
func (qfm *QuestionFilterMgmt) convertQuestionCodeSummaryToProto(summary []questionFilterService.QuestionCodeSummary) []*v1.QuestionCodeSummary {
	protoSummary := make([]*v1.QuestionCodeSummary, len(summary))
	for i, s := range summary {
		protoSummary[i] = &v1.QuestionCodeSummary{
			Grade:            s.Grade,
			Subject:          s.Subject,
			Chapter:          s.Chapter,
			Level:            s.Level,
			QuestionCount:    s.QuestionCount,
			AvailableLessons: s.AvailableLessons,
			AvailableForms:   s.AvailableForms,
		}
	}
	return protoSummary
}

// getQuestionCodeInfo gets human-readable QuestionCode information
func (qfm *QuestionFilterMgmt) getQuestionCodeInfo(questionCodeID string) (*v1.QuestionCodeInfo, error) {
	if questionCodeID == "" {
		return nil, nil
	}

	info, err := qfm.QuestionCodeService.GetHumanReadableInfo(questionCodeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get QuestionCode info: %w", err)
	}

	return &v1.QuestionCodeInfo{
		Code:       info.Code,
		Format:     qfm.getFormatFromIsID6(info.IsID6),
		Grade:      info.Grade,
		Subject:    info.Subject,
		Chapter:    info.Chapter,
		Level:      info.Level,
		Lesson:     info.Lesson,
		Form:       info.Form,
		FolderPath: info.FolderPath,
		IsId6:      info.IsID6,
	}, nil
}

// Utility conversion methods

// pgTextToString safely converts pgtype.Text to string
func (qfm *QuestionFilterMgmt) pgTextToString(text pgtype.Text) string {
	if text.Status == pgtype.Present {
		return text.String
	}
	return ""
}

// pgJSONBToString safely converts pgtype.JSONB to string
func (qfm *QuestionFilterMgmt) pgJSONBToString(jsonb pgtype.JSONB) string {
	if jsonb.Status == pgtype.Present {
		return string(jsonb.Bytes)
	}
	return ""
}

// pgInt4ToInt32 safely converts pgtype.Int4 to int32
func (qfm *QuestionFilterMgmt) pgInt4ToInt32(int4 pgtype.Int4) int32 {
	if int4.Status == pgtype.Present {
		return int4.Int
	}
	return 0
}

// pgTimestamptzToProto converts pgtype.Timestamptz to proto timestamp
func (qfm *QuestionFilterMgmt) pgTimestamptzToProto(ts pgtype.Timestamptz) *timestamppb.Timestamp {
	if ts.Status == pgtype.Present {
		return timestamppb.New(ts.Time)
	}
	return nil
}

// int32PtrOrNil returns pointer to int32 if value is not 0, nil otherwise
func (qfm *QuestionFilterMgmt) int32PtrOrNil(value int32) *int32 {
	if value != 0 {
		return &value
	}
	return nil
}

// boolPtrOrNil returns pointer to bool if value is true, nil otherwise
func (qfm *QuestionFilterMgmt) boolPtrOrNil(value bool) *bool {
	if value {
		return &value
	}
	return nil
}

// timestampToStringPtr converts proto timestamp to string pointer
func (qfm *QuestionFilterMgmt) timestampToStringPtr(ts *timestamppb.Timestamp) *string {
	if ts != nil {
		str := ts.AsTime().Format("2006-01-02T15:04:05Z07:00")
		return &str
	}
	return nil
}

// convertSortFieldToString converts proto SortField to string
func (qfm *QuestionFilterMgmt) convertSortFieldToString(field v1.SortField) string {
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
	case v1.SortField_SORT_FIELD_QUESTION_CODE:
		return "question_code_id"
	case v1.SortField_SORT_FIELD_TYPE:
		return "type"
	case v1.SortField_SORT_FIELD_STATUS:
		return "status"
	default:
		return "created_at"
	}
}

// convertSortOrderToString converts proto SortOrder to string
func (qfm *QuestionFilterMgmt) convertSortOrderToString(order v1.SortOrder) string {
	switch order {
	case v1.SortOrder_SORT_ORDER_ASC:
		return "ASC"
	case v1.SortOrder_SORT_ORDER_DESC:
		return "DESC"
	default:
		return "DESC"
	}
}

// getFormatFromIsID6 converts boolean to format string
func (qfm *QuestionFilterMgmt) getFormatFromIsID6(isID6 bool) string {
	if isID6 {
		return "ID6"
	}
	return "ID5"
}
