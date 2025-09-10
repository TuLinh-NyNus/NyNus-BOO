package validation

import (
	"fmt"
	"regexp"
	"strings"

	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
)

// QuestionFilterValidator provides validation for question filter requests
type QuestionFilterValidator struct{}

// NewQuestionFilterValidator creates a new question filter validator
func NewQuestionFilterValidator() *QuestionFilterValidator {
	return &QuestionFilterValidator{}
}

// ValidateListQuestionsByFilterRequest validates ListQuestionsByFilterRequest
func (v *QuestionFilterValidator) ValidateListQuestionsByFilterRequest(req *v1.ListQuestionsByFilterRequest) error {
	if req == nil {
		return fmt.Errorf("request cannot be nil")
	}

	// Validate QuestionCode filter
	if req.QuestionCodeFilter != nil {
		if err := v.validateQuestionCodeFilter(req.QuestionCodeFilter); err != nil {
			return fmt.Errorf("invalid question code filter: %w", err)
		}
	}

	// Validate metadata filter
	if req.MetadataFilter != nil {
		if err := v.validateMetadataFilter(req.MetadataFilter); err != nil {
			return fmt.Errorf("invalid metadata filter: %w", err)
		}
	}

	// Validate date filter
	if req.DateFilter != nil {
		if err := v.validateDateFilter(req.DateFilter); err != nil {
			return fmt.Errorf("invalid date filter: %w", err)
		}
	}

	// Validate content filter
	if req.ContentFilter != nil {
		if err := v.validateContentFilter(req.ContentFilter); err != nil {
			return fmt.Errorf("invalid content filter: %w", err)
		}
	}

	// Validate pagination
	if req.Pagination != nil {
		if err := v.validatePagination(req.Pagination); err != nil {
			return fmt.Errorf("invalid pagination: %w", err)
		}
	}

	return nil
}

// ValidateSearchQuestionsRequest validates SearchQuestionsRequest
func (v *QuestionFilterValidator) ValidateSearchQuestionsRequest(req *v1.SearchQuestionsRequest) error {
	if req == nil {
		return fmt.Errorf("request cannot be nil")
	}

	// Validate search query
	if strings.TrimSpace(req.Query) == "" {
		return fmt.Errorf("search query cannot be empty")
	}

	if len(req.Query) > 1000 {
		return fmt.Errorf("search query too long (max 1000 characters)")
	}

	// Validate search fields
	if len(req.SearchFields) > 0 {
		validFields := map[string]bool{
			"content":  true,
			"solution": true,
			"tags":     true,
		}
		for _, field := range req.SearchFields {
			if !validFields[field] {
				return fmt.Errorf("invalid search field: %s", field)
			}
		}
	}

	// Validate underlying filters (reuse validation logic)
	tempReq := &v1.ListQuestionsByFilterRequest{
		QuestionCodeFilter: req.QuestionCodeFilter,
		MetadataFilter:     req.MetadataFilter,
		DateFilter:         req.DateFilter,
		Pagination:         req.Pagination,
	}

	return v.ValidateListQuestionsByFilterRequest(tempReq)
}

// ValidateGetQuestionsByQuestionCodeRequest validates GetQuestionsByQuestionCodeRequest
func (v *QuestionFilterValidator) ValidateGetQuestionsByQuestionCodeRequest(req *v1.GetQuestionsByQuestionCodeRequest) error {
	if req == nil {
		return fmt.Errorf("request cannot be nil")
	}

	// Validate QuestionCode filter (required for this endpoint)
	if req.QuestionCodeFilter == nil {
		return fmt.Errorf("question code filter is required")
	}

	if err := v.validateQuestionCodeFilter(req.QuestionCodeFilter); err != nil {
		return fmt.Errorf("invalid question code filter: %w", err)
	}

	// Validate metadata filter
	if req.MetadataFilter != nil {
		if err := v.validateMetadataFilter(req.MetadataFilter); err != nil {
			return fmt.Errorf("invalid metadata filter: %w", err)
		}
	}

	// Validate pagination
	if req.Pagination != nil {
		if err := v.validatePagination(req.Pagination); err != nil {
			return fmt.Errorf("invalid pagination: %w", err)
		}
	}

	return nil
}

// validateQuestionCodeFilter validates QuestionCode filter parameters
func (v *QuestionFilterValidator) validateQuestionCodeFilter(filter *v1.QuestionCodeFilter) error {
	// Validate grades (0,1,2 for 10th, 11th, 12th)
	validGrades := map[string]bool{"0": true, "1": true, "2": true}
	for _, grade := range filter.Grades {
		if !validGrades[grade] {
			return fmt.Errorf("invalid grade: %s (must be 0, 1, or 2)", grade)
		}
	}

	// Validate subjects (D,E,H,M,P,S based on actual data in database)
	validSubjects := map[string]bool{"D": true, "E": true, "H": true, "M": true, "P": true, "S": true}
	for _, subject := range filter.Subjects {
		if !validSubjects[subject] {
			return fmt.Errorf("invalid subject: %s (must be D, E, H, M, P, or S)", subject)
		}
	}

	// Validate chapters (1-20)
	chapterRegex := regexp.MustCompile(`^([1-9]|1[0-9]|20)$`)
	for _, chapter := range filter.Chapters {
		if !chapterRegex.MatchString(chapter) {
			return fmt.Errorf("invalid chapter: %s (must be 1-20)", chapter)
		}
	}

	// Validate levels (N,H,V,C,T,M)
	validLevels := map[string]bool{"N": true, "H": true, "V": true, "C": true, "T": true, "M": true}
	for _, level := range filter.Levels {
		if !validLevels[level] {
			return fmt.Errorf("invalid level: %s (must be N, H, V, C, T, or M)", level)
		}
	}

	// Validate lessons (1-99, A-Z)
	lessonRegex := regexp.MustCompile(`^([1-9][0-9]?|[A-Z])$`)
	for _, lesson := range filter.Lessons {
		if !lessonRegex.MatchString(lesson) {
			return fmt.Errorf("invalid lesson: %s (must be 1-99 or A-Z)", lesson)
		}
	}

	// Validate forms (1-9)
	formRegex := regexp.MustCompile(`^[1-9]$`)
	for _, form := range filter.Forms {
		if !formRegex.MatchString(form) {
			return fmt.Errorf("invalid form: %s (must be 1-9)", form)
		}
	}

	return nil
}

// validateMetadataFilter validates metadata filter parameters
func (v *QuestionFilterValidator) validateMetadataFilter(filter *v1.MetadataFilter) error {
	// Validate types
	validTypes := map[string]bool{"MC": true, "TF": true, "SA": true, "ES": true, "MA": true}
	for _, qType := range filter.Types {
		if !validTypes[qType] {
			return fmt.Errorf("invalid question type: %s (must be MC, TF, SA, ES, or MA)", qType)
		}
	}

	// Validate statuses
	validStatuses := map[string]bool{"ACTIVE": true, "PENDING": true, "INACTIVE": true, "ARCHIVED": true}
	for _, status := range filter.Statuses {
		if !validStatuses[status] {
			return fmt.Errorf("invalid status: %s (must be ACTIVE, PENDING, INACTIVE, or ARCHIVED)", status)
		}
	}

	// Validate difficulties
	validDifficulties := map[string]bool{"EASY": true, "MEDIUM": true, "HARD": true}
	for _, difficulty := range filter.Difficulties {
		if !validDifficulties[difficulty] {
			return fmt.Errorf("invalid difficulty: %s (must be EASY, MEDIUM, or HARD)", difficulty)
		}
	}

	// Validate usage count range
	if filter.MinUsageCount < 0 {
		return fmt.Errorf("min usage count cannot be negative")
	}
	if filter.MaxUsageCount < 0 {
		return fmt.Errorf("max usage count cannot be negative")
	}
	if filter.MinUsageCount > 0 && filter.MaxUsageCount > 0 && filter.MinUsageCount > filter.MaxUsageCount {
		return fmt.Errorf("min usage count cannot be greater than max usage count")
	}

	// Validate feedback range
	if filter.MinFeedback < 0 {
		return fmt.Errorf("min feedback cannot be negative")
	}
	if filter.MaxFeedback < 0 {
		return fmt.Errorf("max feedback cannot be negative")
	}
	if filter.MinFeedback > 0 && filter.MaxFeedback > 0 && filter.MinFeedback > filter.MaxFeedback {
		return fmt.Errorf("min feedback cannot be greater than max feedback")
	}

	// Validate subcount pattern (basic regex validation)
	if filter.SubcountPattern != "" {
		if len(filter.SubcountPattern) > 100 {
			return fmt.Errorf("subcount pattern too long (max 100 characters)")
		}
	}

	return nil
}

// validateDateFilter validates date filter parameters
func (v *QuestionFilterValidator) validateDateFilter(filter *v1.DateRangeFilter) error {
	// Validate date ranges
	if filter.CreatedAfter != nil && filter.CreatedBefore != nil {
		if filter.CreatedAfter.AsTime().After(filter.CreatedBefore.AsTime()) {
			return fmt.Errorf("created_after cannot be after created_before")
		}
	}

	if filter.UpdatedAfter != nil && filter.UpdatedBefore != nil {
		if filter.UpdatedAfter.AsTime().After(filter.UpdatedBefore.AsTime()) {
			return fmt.Errorf("updated_after cannot be after updated_before")
		}
	}

	return nil
}

// validateContentFilter validates content filter parameters
func (v *QuestionFilterValidator) validateContentFilter(filter *v1.ContentFilter) error {
	// Validate search strings
	if len(filter.ContentSearch) > 1000 {
		return fmt.Errorf("content search too long (max 1000 characters)")
	}

	if len(filter.SolutionSearch) > 1000 {
		return fmt.Errorf("solution search too long (max 1000 characters)")
	}

	return nil
}

// validatePagination validates pagination parameters
func (v *QuestionFilterValidator) validatePagination(pagination *v1.FilterPagination) error {
	// Validate page
	if pagination.Page < 1 {
		return fmt.Errorf("page must be >= 1")
	}

	// Validate limit
	if pagination.Limit < 1 {
		return fmt.Errorf("limit must be >= 1")
	}
	if pagination.Limit > 100 {
		return fmt.Errorf("limit cannot exceed 100")
	}

	// Validate sort options
	for i, sort := range pagination.Sort {
		if sort.Field == v1.SortField_SORT_FIELD_UNSPECIFIED {
			return fmt.Errorf("sort field %d cannot be unspecified", i)
		}
		if sort.Order == v1.SortOrder_SORT_ORDER_UNSPECIFIED {
			return fmt.Errorf("sort order %d cannot be unspecified", i)
		}
	}

	return nil
}
