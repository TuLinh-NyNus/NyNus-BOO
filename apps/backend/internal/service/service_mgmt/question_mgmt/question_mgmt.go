package question_mgmt

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"fmt"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// QuestionMgmt manages question-related operations
type QuestionMgmt struct {
	questionRepo     interfaces.QuestionRepository
	questionCodeRepo interfaces.QuestionCodeRepository
}

// NewQuestionMgmt creates a new question management service
func NewQuestionMgmt(questionRepo interfaces.QuestionRepository, questionCodeRepo interfaces.QuestionCodeRepository) *QuestionMgmt {
	return &QuestionMgmt{
		questionRepo:     questionRepo,
		questionCodeRepo: questionCodeRepo,
	}
}

// CreateQuestion creates a new question
func (m *QuestionMgmt) CreateQuestion(ctx context.Context, question *entity.Question) error {
	// Validate question code exists
	if question.QuestionCodeID.Status == pgtype.Present {
		exists, err := m.questionCodeRepo.Exists(ctx, question.QuestionCodeID.String)
		if err != nil {
			return fmt.Errorf("failed to validate question code: %v", err)
		}
		if !exists {
			return fmt.Errorf("question code '%s' does not exist", question.QuestionCodeID.String)
		}
	}
	
	// Generate ID if not provided
	if question.ID.Status != pgtype.Present || question.ID.String == "" {
		question.ID.Set(uuid.New().String())
	}
	
	// Set defaults
	if question.Status.Status != pgtype.Present {
		question.Status.Set("PENDING")
	}
	if question.Creator.Status != pgtype.Present {
		question.Creator.Set("ADMIN")
	}
	if question.Difficulty.Status != pgtype.Present {
		question.Difficulty.Set("MEDIUM")
	}
	if question.UsageCount.Status != pgtype.Present {
		question.UsageCount.Set(0)
	}
	if question.Feedback.Status != pgtype.Present {
		question.Feedback.Set(0)
	}
	
	return m.questionRepo.Create(ctx, question)
}

// GetQuestionByID retrieves a question by ID
func (m *QuestionMgmt) GetQuestionByID(ctx context.Context, id string) (entity.Question, error) {
	question, err := m.questionRepo.GetByID(ctx, id)
	if err != nil {
		return entity.Question{}, err
	}
	return *question, nil
}

// UpdateQuestion updates an existing question
func (m *QuestionMgmt) UpdateQuestion(ctx context.Context, question *entity.Question) error {
	// Validate question exists
	existing, err := m.questionRepo.GetByID(ctx, question.ID.String)
	if err != nil {
		return fmt.Errorf("question not found: %v", err)
	}
	
	// Validate question code if changed
	if question.QuestionCodeID.String != existing.QuestionCodeID.String {
		exists, err := m.questionCodeRepo.Exists(ctx, question.QuestionCodeID.String)
		if err != nil {
			return fmt.Errorf("failed to validate question code: %v", err)
		}
		if !exists {
			return fmt.Errorf("question code '%s' does not exist", question.QuestionCodeID.String)
		}
	}
	
	return m.questionRepo.Update(ctx, question)
}

// DeleteQuestion deletes a question
func (m *QuestionMgmt) DeleteQuestion(ctx context.Context, id string) error {
	return m.questionRepo.Delete(ctx, id)
}

// GetQuestionsByPaging retrieves questions with pagination
func (m *QuestionMgmt) GetQuestionsByPaging(offset, limit int) (int, []entity.Question, error) {
	ctx := context.Background()
	
	// Get total count
	total, err := m.questionRepo.Count(ctx)
	if err != nil {
		return 0, nil, err
	}
	
	// Get questions
	questions, err := m.questionRepo.GetAll(ctx, offset, limit)
	if err != nil {
		return 0, nil, err
	}
	
	// Convert to entity slice
	result := make([]entity.Question, len(questions))
	for i, q := range questions {
		result[i] = *q
	}
	
	return total, result, nil
}

// GetQuestionsByFilter retrieves questions with advanced filtering
func (m *QuestionMgmt) GetQuestionsByFilter(ctx context.Context, filterQuery map[string]interface{}, offset, limit int, sortColumn, sortOrder string) ([]entity.Question, int, error) {
	// Convert map to FilterCriteria
	criteria := m.mapToFilterCriteria(filterQuery)
	
	questions, total, err := m.questionRepo.FindWithFilters(ctx, criteria, offset, limit, sortColumn, sortOrder)
	if err != nil {
		return nil, 0, err
	}
	
	// Convert to entity slice
	result := make([]entity.Question, len(questions))
	for i, q := range questions {
		result[i] = *q
	}
	
	return result, total, nil
}

// SearchQuestions performs text search on questions
func (m *QuestionMgmt) SearchQuestions(ctx context.Context, searchOpts *SearchOptions, filterQuery map[string]interface{}, offset, limit int) ([]SearchResult, int, error) {
	searchCriteria := interfaces.SearchCriteria{
		Query:            searchOpts.Query,
		SearchInContent:  searchOpts.SearchInContent,
		SearchInSolution: searchOpts.SearchInSolution,
		SearchInTags:     searchOpts.SearchInTags,
		UseRegex:         searchOpts.UseRegex,
		CaseSensitive:    searchOpts.CaseSensitive,
	}
	
	var filterCriteria *interfaces.FilterCriteria
	if filterQuery != nil {
		filterCriteria = m.mapToFilterCriteria(filterQuery)
	}
	
	searchResults, total, err := m.questionRepo.Search(ctx, searchCriteria, filterCriteria, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	
	// Convert to our SearchResult type
	results := make([]SearchResult, len(searchResults))
	for i, sr := range searchResults {
		results[i] = SearchResult{
			Question: sr.Question,
			Score:    sr.Score,
			Matches:  sr.Matches,
			Snippet:  sr.Snippet,
		}
	}
	
	return results, total, nil
}

// GetQuestionsByQuestionCode retrieves all questions for a specific question code
func (m *QuestionMgmt) GetQuestionsByQuestionCode(ctx context.Context, questionCodeID string) ([]entity.Question, error) {
	questions, err := m.questionRepo.FindByQuestionCodeID(ctx, questionCodeID)
	if err != nil {
		return nil, err
	}
	
	// Convert to entity slice
	result := make([]entity.Question, len(questions))
	for i, q := range questions {
		result[i] = *q
	}
	
	return result, nil
}

// GetQuestionCodeByID retrieves a question code by ID
func (m *QuestionMgmt) GetQuestionCodeByID(ctx context.Context, id string) (*entity.QuestionCode, error) {
	return m.questionCodeRepo.GetByID(ctx, id)
}

// GetFilterStatistics gets statistics for filtered results
func (m *QuestionMgmt) GetFilterStatistics(ctx context.Context, filterQuery map[string]interface{}) (*FilterStatistics, error) {
	criteria := m.mapToFilterCriteria(filterQuery)
	
	stats, err := m.questionRepo.GetStatistics(ctx, criteria)
	if err != nil {
		return nil, err
	}
	
	return &FilterStatistics{
		TotalQuestions:         stats.TotalQuestions,
		TypeDistribution:       stats.TypeDistribution,
		DifficultyDistribution: stats.DifficultyDistribution,
		StatusDistribution:     stats.StatusDistribution,
		GradeDistribution:      stats.GradeDistribution,
		SubjectDistribution:    stats.SubjectDistribution,
		AverageUsageCount:      stats.AverageUsageCount,
		AverageFeedback:        stats.AverageFeedback,
	}, nil
}

// ImportQuestions imports questions from CSV
func (m *QuestionMgmt) ImportQuestions(ctx context.Context, req *ImportQuestionsRequest) (*ImportQuestionsResult, error) {
	// Decode base64 CSV data
	csvData, err := base64.StdEncoding.DecodeString(req.CsvDataBase64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode CSV data: %v", err)
	}
	
	// Parse CSV
	reader := csv.NewReader(strings.NewReader(string(csvData)))
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to parse CSV: %v", err)
	}
	
	if len(records) < 2 {
		return nil, fmt.Errorf("CSV file must contain header and at least one data row")
	}
	
	result := &ImportQuestionsResult{
		TotalProcessed: 0,
		CreatedCount:   0,
		UpdatedCount:   0,
		ErrorCount:     0,
		Errors:         []ImportError{},
	}
	
	// Process each row (skip header)
	for i := 1; i < len(records); i++ {
		result.TotalProcessed++
		
		question, err := m.parseQuestionFromCSV(records[i], records[0])
		if err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{
				RowNumber:    int32(i + 1),
				ErrorMessage: err.Error(),
				RowData:      strings.Join(records[i], ","),
			})
			continue
		}
		
		// Check if question exists (for upsert mode)
		if req.UpsertMode && question.ID.Status == pgtype.Present {
			existing, err := m.questionRepo.GetByID(ctx, question.ID.String)
			if err == nil && existing != nil {
				// Update existing
				if err := m.questionRepo.Update(ctx, question); err != nil {
					result.ErrorCount++
					result.Errors = append(result.Errors, ImportError{
						RowNumber:    int32(i + 1),
						ErrorMessage: fmt.Sprintf("failed to update: %v", err),
						RowData:      strings.Join(records[i], ","),
					})
				} else {
					result.UpdatedCount++
				}
				continue
			}
		}
		
		// Create new question
		if err := m.CreateQuestion(ctx, question); err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{
				RowNumber:    int32(i + 1),
				ErrorMessage: fmt.Sprintf("failed to create: %v", err),
				RowData:      strings.Join(records[i], ","),
			})
		} else {
			result.CreatedCount++
		}
	}
	
	result.Summary = fmt.Sprintf(
		"Import completed: %d processed, %d created, %d updated, %d errors",
		result.TotalProcessed, result.CreatedCount, result.UpdatedCount, result.ErrorCount,
	)
	
	return result, nil
}

// parseQuestionFromCSV parses a question from CSV row
func (m *QuestionMgmt) parseQuestionFromCSV(row []string, header []string) (*entity.Question, error) {
	if len(row) != len(header) {
		return nil, fmt.Errorf("row has %d columns, expected %d", len(row), len(header))
	}
	
	question := &entity.Question{}
	
	// Map CSV columns to question fields
	for i, col := range header {
		value := strings.TrimSpace(row[i])
		if value == "" {
			continue
		}
		
		switch strings.ToLower(col) {
		case "id":
			question.ID.Set(value)
		case "raw_content", "rawcontent":
			question.RawContent.Set(value)
		case "content":
			question.Content.Set(value)
		case "type":
			question.Type.Set(value)
		case "question_code_id", "questioncodeid", "code":
			question.QuestionCodeID.Set(value)
		case "difficulty":
			question.Difficulty.Set(value)
		case "source":
			question.Source.Set(value)
		case "solution":
			question.Solution.Set(value)
		case "status":
			question.Status.Set(value)
		case "creator":
			question.Creator.Set(value)
		case "tags", "tag":
			tags := strings.Split(value, ";")
			tagElements := make([]pgtype.Text, len(tags))
			for j, tag := range tags {
				tagElements[j] = pgtype.Text{String: strings.TrimSpace(tag), Status: pgtype.Present}
			}
			question.Tag = pgtype.TextArray{
				Elements: tagElements,
				Status:   pgtype.Present,
			}
		}
	}
	
	// Validate required fields
	if question.Content.Status != pgtype.Present {
		return nil, fmt.Errorf("content is required")
	}
	if question.Type.Status != pgtype.Present {
		return nil, fmt.Errorf("type is required")
	}
	if question.QuestionCodeID.Status != pgtype.Present {
		return nil, fmt.Errorf("question_code_id is required")
	}
	
	return question, nil
}

// mapToFilterCriteria converts a map to FilterCriteria
func (m *QuestionMgmt) mapToFilterCriteria(filterQuery map[string]interface{}) *interfaces.FilterCriteria {
	if filterQuery == nil {
		return nil
	}
	
	criteria := &interfaces.FilterCriteria{}
	
	// Helper function to extract string slice
	getStringSlice := func(key string) []string {
		if val, ok := filterQuery[key]; ok {
			if slice, ok := val.([]string); ok {
				return slice
			}
			if slice, ok := val.([]interface{}); ok {
				result := make([]string, len(slice))
				for i, v := range slice {
					result[i] = fmt.Sprintf("%v", v)
				}
				return result
			}
		}
		return nil
	}
	
	// Map fields
	criteria.Grades = getStringSlice("grade")
	criteria.Subjects = getStringSlice("subject")
	criteria.Chapters = getStringSlice("chapter")
	criteria.Levels = getStringSlice("level")
	criteria.Lessons = getStringSlice("lesson")
	criteria.Forms = getStringSlice("form")
	criteria.Types = getStringSlice("type")
	criteria.Difficulties = getStringSlice("difficulty")
	criteria.Statuses = getStringSlice("status")
	criteria.Creators = getStringSlice("creator")
	criteria.Tags = getStringSlice("tags")
	criteria.QuestionCodeIDs = getStringSlice("question_code_id")
	
	// Boolean fields
	if val, ok := filterQuery["tag_match_all"]; ok {
		if b, ok := val.(bool); ok {
			criteria.TagMatchAll = b
		}
	}
	
	// Numeric ranges
	if val, ok := filterQuery["usage_count"]; ok {
		if rangeMap, ok := val.(map[string]int32); ok {
			criteria.MinUsageCount = rangeMap["min"]
			criteria.MaxUsageCount = rangeMap["max"]
		}
	}
	
	if val, ok := filterQuery["feedback"]; ok {
		if rangeMap, ok := val.(map[string]int32); ok {
			criteria.MinFeedback = rangeMap["min"]
			criteria.MaxFeedback = rangeMap["max"]
		}
	}
	
	// Date ranges
	if val, ok := filterQuery["created_at"]; ok {
		if rangeMap, ok := val.(map[string]string); ok {
			criteria.CreatedAfter = rangeMap["after"]
			criteria.CreatedBefore = rangeMap["before"]
		}
	}
	
	if val, ok := filterQuery["updated_at"]; ok {
		if rangeMap, ok := val.(map[string]string); ok {
			criteria.UpdatedAfter = rangeMap["after"]
			criteria.UpdatedBefore = rangeMap["before"]
		}
	}
	
	// Boolean filters
	if val, ok := filterQuery["has_solution"]; ok {
		if b, ok := val.(bool); ok {
			criteria.HasSolution = &b
		}
	}
	
	if val, ok := filterQuery["has_source"]; ok {
		if b, ok := val.(bool); ok {
			criteria.HasSource = &b
		}
	}
	
	return criteria
}

// Types

// SearchOptions contains search parameters
type SearchOptions struct {
	Query            string
	SearchInContent  bool
	SearchInSolution bool
	SearchInTags     bool
	UseRegex         bool
	CaseSensitive    bool
}

// SearchResult contains search results
type SearchResult struct {
	Question entity.Question
	Score    float32
	Matches  []string
	Snippet  string
}

// FilterStatistics contains aggregated statistics
type FilterStatistics struct {
	TotalQuestions         int
	TypeDistribution       map[string]int
	DifficultyDistribution map[string]int
	StatusDistribution     map[string]int
	GradeDistribution      map[string]int
	SubjectDistribution    map[string]int
	AverageUsageCount      float32
	AverageFeedback        float32
}

// ImportQuestionsRequest contains import parameters
type ImportQuestionsRequest struct {
	CsvDataBase64 string
	UpsertMode    bool
}

// ImportQuestionsResult contains import results
type ImportQuestionsResult struct {
	TotalProcessed int32
	CreatedCount   int32
	UpdatedCount   int32
	ErrorCount     int32
	Errors         []ImportError
	Summary        string
}

// ImportError contains import error details
type ImportError struct {
	RowNumber    int32
	FieldName    string
	ErrorMessage string
	RowData      string
}