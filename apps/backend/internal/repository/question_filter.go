package repository

import (
	"context"
	"fmt"
	"strings"

	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/jackc/pgtype"
)

// QuestionFilterRepository handles advanced question filtering operations
type QuestionFilterRepository struct{}

// NewQuestionFilterRepository creates a new QuestionFilterRepository instance
func NewQuestionFilterRepository() *QuestionFilterRepository {
	return &QuestionFilterRepository{}
}

// QuestionFilterCriteria represents comprehensive filter criteria for questions
type QuestionFilterCriteria struct {
	// QuestionCode filters
	Grades     []string // 0,1,2 (10th, 11th, 12th grade)
	Subjects   []string // P,L,H,T,S (Math, Physics, Chemistry, English, Biology)
	Chapters   []string // 1,2,3,4,5... (Chapter numbers)
	Levels     []string // N,H,V,C,T,M (Recognition, Understanding, Application, High Application, VIP, Note)
	Lessons    []string // 1,2,3,A,B,C... (Lesson identifiers)
	Forms      []string // 1,2,3... (Form numbers, only for ID6 format)
	IncludeID5 bool     // Include ID5 format questions (default: true)
	IncludeID6 bool     // Include ID6 format questions (default: true)

	// Metadata filters
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

	// Date range filters
	CreatedAfter  *string // Created after this date (ISO format)
	CreatedBefore *string // Created before this date (ISO format)
	UpdatedAfter  *string // Updated after this date (ISO format)
	UpdatedBefore *string // Updated before this date (ISO format)

	// Content filters
	HasImages      *bool  // Filter questions with/without images
	HasSolution    *bool  // Filter questions with/without solution
	HasAnswers     *bool  // Filter questions with/without answers
	HasFeedback    *bool  // Filter questions with/without feedback
	HasTags        *bool  // Filter questions with/without tags
	ContentSearch  string // Full-text search in content
	SolutionSearch string // Full-text search in solution

	// Pagination and sorting
	Offset    int32  // Offset for pagination
	Limit     int32  // Limit for pagination
	SortBy    string // Field to sort by
	SortOrder string // ASC or DESC
}

// SearchFilterCriteria represents full-text search criteria
type SearchFilterCriteria struct {
	Query        string   // Search query
	SearchFields []string // Fields to search: content, solution, tags
	Filter       *QuestionFilterCriteria
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

// FindByFilter finds questions using comprehensive filter criteria
func (r *QuestionFilterRepository) FindByFilter(ctx context.Context, db database.QueryExecer, filter QuestionFilterCriteria) ([]entity.Question, int, error) {
	span, ctx := util.StartSpan(ctx, "QuestionFilterRepository.FindByFilter")
	defer span.Finish()

	// Build the base query
	baseQuery := `
		SELECT DISTINCT q.id, q.raw_content, q.content, q.subcount, q.type, q.source,
		       q.answers, q.correct_answer, q.solution, q.tag, q.usage_count,
		       q.creator, q.status, q.feedback, q.difficulty, q.created_at,
		       q.updated_at, q.question_code_id
		FROM question q
	`

	// Build WHERE conditions and JOIN clauses
	whereConditions := []string{"1=1"}
	joinClauses := []string{}
	args := []interface{}{}
	argIndex := 1

	// Add QuestionCode filters if needed
	if r.hasQuestionCodeFilters(filter) {
		joinClauses = append(joinClauses, "LEFT JOIN question_code qc ON q.question_code_id = qc.code")
		qcConditions, qcArgs, newArgIndex := r.buildQuestionCodeConditions(filter, argIndex)
		if len(qcConditions) > 0 {
			whereConditions = append(whereConditions, fmt.Sprintf("(%s)", strings.Join(qcConditions, " AND ")))
			args = append(args, qcArgs...)
			argIndex = newArgIndex
		}
	}

	// Add metadata filters
	metaConditions, metaArgs, newArgIndex := r.buildMetadataConditions(filter, argIndex)
	whereConditions = append(whereConditions, metaConditions...)
	args = append(args, metaArgs...)
	argIndex = newArgIndex

	// Add date range filters
	dateConditions, dateArgs, newArgIndex := r.buildDateRangeConditions(filter, argIndex)
	whereConditions = append(whereConditions, dateConditions...)
	args = append(args, dateArgs...)
	argIndex = newArgIndex

	// Add content filters
	contentConditions, contentArgs, newArgIndex := r.buildContentConditions(filter, argIndex)
	whereConditions = append(whereConditions, contentConditions...)
	args = append(args, contentArgs...)
	argIndex = newArgIndex

	// Add tag filters if needed
	if len(filter.Tags) > 0 {
		tagConditions, tagArgs, newArgIndex := r.buildTagConditions(filter, argIndex)
		if len(tagConditions) > 0 {
			joinClauses = append(joinClauses, "LEFT JOIN question_tag qt ON q.id = qt.question_id")
			whereConditions = append(whereConditions, fmt.Sprintf("(%s)", strings.Join(tagConditions, " OR ")))
			args = append(args, tagArgs...)
			argIndex = newArgIndex
		}
	}

	// Build the complete query
	query := baseQuery
	if len(joinClauses) > 0 {
		query += " " + strings.Join(joinClauses, " ")
	}
	query += " WHERE " + strings.Join(whereConditions, " AND ")

	// Add sorting
	if filter.SortBy != "" {
		order := "ASC"
		if filter.SortOrder == "DESC" {
			order = "DESC"
		}
		query += fmt.Sprintf(" ORDER BY %s %s", filter.SortBy, order)
	} else {
		query += " ORDER BY q.created_at DESC"
	}

	// Get total count first
	countQuery := r.buildCountQuery(joinClauses, whereConditions)
	var total int
	err := db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("failed to get total count: %w", err)
	}

	// Add pagination
	if filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argIndex)
		args = append(args, filter.Limit)
		argIndex++
	}
	if filter.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argIndex)
		args = append(args, filter.Offset)
	}

	// Execute the query
	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("failed to execute filter query: %w", err)
	}
	defer rows.Close()

	// Scan results
	var questions []entity.Question
	for rows.Next() {
		var question entity.Question
		err := rows.Scan(
			&question.ID,
			&question.RawContent,
			&question.Content,
			&question.Subcount,
			&question.Type,
			&question.Source,
			&question.Answers,
			&question.CorrectAnswer,
			&question.Solution,
			&question.Tag,
			&question.UsageCount,
			&question.Creator,
			&question.Status,
			&question.Feedback,
			&question.Difficulty,
			&question.CreatedAt,
			&question.UpdatedAt,
			&question.QuestionCodeID,
		)
		if err != nil {
			span.FinishWithError(err)
			return nil, 0, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, question)
	}

	if err = rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("error iterating rows: %w", err)
	}

	return questions, total, nil
}

// SearchQuestions performs full-text search with filters
func (r *QuestionFilterRepository) SearchQuestions(ctx context.Context, db database.QueryExecer, searchFilter SearchFilterCriteria) ([]QuestionSearchResult, int, error) {
	span, ctx := util.StartSpan(ctx, "QuestionFilterRepository.SearchQuestions")
	defer span.Finish()

	// Build the base search query with full-text search
	baseQuery := `
		SELECT DISTINCT q.id, q.raw_content, q.content, q.subcount, q.type, q.source,
		       q.answers, q.correct_answer, q.solution, q.tag, q.usage_count,
		       q.creator, q.status, q.feedback, q.difficulty, q.created_at,
		       q.updated_at, q.question_code_id,
		       ts_rank(to_tsvector('simple', q.content), plainto_tsquery('simple', $1)) as relevance_score
		FROM question q
	`

	// Build WHERE conditions and JOIN clauses
	whereConditions := []string{"1=1"}
	joinClauses := []string{}
	args := []interface{}{searchFilter.Query} // First arg is the search query
	argIndex := 2

	// Add full-text search condition
	searchConditions := r.buildFullTextSearchConditions(searchFilter, argIndex)
	whereConditions = append(whereConditions, searchConditions...)

	// Add filter conditions if provided
	if searchFilter.Filter != nil {
		// Add QuestionCode filters if needed
		if r.hasQuestionCodeFilters(*searchFilter.Filter) {
			joinClauses = append(joinClauses, "LEFT JOIN question_code qc ON q.question_code_id = qc.code")
			qcConditions, qcArgs, newArgIndex := r.buildQuestionCodeConditions(*searchFilter.Filter, argIndex)
			if len(qcConditions) > 0 {
				whereConditions = append(whereConditions, fmt.Sprintf("(%s)", strings.Join(qcConditions, " AND ")))
				args = append(args, qcArgs...)
				argIndex = newArgIndex
			}
		}

		// Add metadata filters
		metaConditions, metaArgs, newArgIndex := r.buildMetadataConditions(*searchFilter.Filter, argIndex)
		whereConditions = append(whereConditions, metaConditions...)
		args = append(args, metaArgs...)
		argIndex = newArgIndex

		// Add date range filters
		dateConditions, dateArgs, newArgIndex := r.buildDateRangeConditions(*searchFilter.Filter, argIndex)
		whereConditions = append(whereConditions, dateConditions...)
		args = append(args, dateArgs...)
		argIndex = newArgIndex

		// Add content filters
		contentConditions, contentArgs, newArgIndex := r.buildContentConditions(*searchFilter.Filter, argIndex)
		whereConditions = append(whereConditions, contentConditions...)
		args = append(args, contentArgs...)
		argIndex = newArgIndex

		// Add tag filters if needed
		if len(searchFilter.Filter.Tags) > 0 {
			tagConditions, tagArgs, newArgIndex := r.buildTagConditions(*searchFilter.Filter, argIndex)
			if len(tagConditions) > 0 {
				joinClauses = append(joinClauses, "LEFT JOIN question_tag qt ON q.id = qt.question_id")
				whereConditions = append(whereConditions, fmt.Sprintf("(%s)", strings.Join(tagConditions, " OR ")))
				args = append(args, tagArgs...)
				argIndex = newArgIndex
			}
		}
	}

	// Build the complete query
	query := baseQuery
	if len(joinClauses) > 0 {
		query += " " + strings.Join(joinClauses, " ")
	}
	query += " WHERE " + strings.Join(whereConditions, " AND ")

	// Add ordering by relevance score
	query += " ORDER BY relevance_score DESC, q.created_at DESC"

	// Get total count first
	countQuery := r.buildSearchCountQuery(joinClauses, whereConditions)
	var total int
	err := db.QueryRowContext(ctx, countQuery, args...).Scan(&total) // Use all args for count
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("failed to get search total count: %w", err)
	}

	// Add pagination if specified in filter
	if searchFilter.Filter != nil && searchFilter.Filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argIndex)
		args = append(args, searchFilter.Filter.Limit)
		argIndex++
	}
	if searchFilter.Filter != nil && searchFilter.Filter.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argIndex)
		args = append(args, searchFilter.Filter.Offset)
	}

	// Execute the search query
	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("failed to execute search query: %w", err)
	}
	defer rows.Close()

	// Scan results
	var results []QuestionSearchResult
	for rows.Next() {
		var question entity.Question
		var relevanceScore float32
		err := rows.Scan(
			&question.ID,
			&question.RawContent,
			&question.Content,
			&question.Subcount,
			&question.Type,
			&question.Source,
			&question.Answers,
			&question.CorrectAnswer,
			&question.Solution,
			&question.Tag,
			&question.UsageCount,
			&question.Creator,
			&question.Status,
			&question.Feedback,
			&question.Difficulty,
			&question.CreatedAt,
			&question.UpdatedAt,
			&question.QuestionCodeID,
			&relevanceScore,
		)
		if err != nil {
			span.FinishWithError(err)
			return nil, 0, fmt.Errorf("failed to scan search result: %w", err)
		}

		// Generate highlights if requested
		var highlights []SearchHighlight
		if searchFilter.Highlight {
			highlights = r.generateHighlights(question, searchFilter.Query, searchFilter.SearchFields)
		}

		results = append(results, QuestionSearchResult{
			Question:       question,
			Highlights:     highlights,
			RelevanceScore: relevanceScore,
		})
	}

	if err = rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, 0, fmt.Errorf("error iterating search results: %w", err)
	}

	return results, total, nil
}

// GetQuestionsByQuestionCodeFilter gets questions by QuestionCode components
func (r *QuestionFilterRepository) GetQuestionsByQuestionCodeFilter(ctx context.Context, db database.QueryExecer, filter QuestionFilterCriteria) ([]entity.Question, int, error) {
	span, ctx := util.StartSpan(ctx, "QuestionFilterRepository.GetQuestionsByQuestionCodeFilter")
	defer span.Finish()

	// This is a specialized version of FindByFilter focusing only on QuestionCode filters
	// Reset non-QuestionCode filters
	codeOnlyFilter := QuestionFilterCriteria{
		Grades:     filter.Grades,
		Subjects:   filter.Subjects,
		Chapters:   filter.Chapters,
		Levels:     filter.Levels,
		Lessons:    filter.Lessons,
		Forms:      filter.Forms,
		IncludeID5: filter.IncludeID5,
		IncludeID6: filter.IncludeID6,
		Offset:     filter.Offset,
		Limit:      filter.Limit,
		SortBy:     filter.SortBy,
		SortOrder:  filter.SortOrder,
	}

	return r.FindByFilter(ctx, db, codeOnlyFilter)
}

// Helper methods for building query conditions

// hasQuestionCodeFilters checks if any QuestionCode filters are applied
func (r *QuestionFilterRepository) hasQuestionCodeFilters(filter QuestionFilterCriteria) bool {
	return len(filter.Grades) > 0 || len(filter.Subjects) > 0 || len(filter.Chapters) > 0 ||
		len(filter.Levels) > 0 || len(filter.Lessons) > 0 || len(filter.Forms) > 0 ||
		!filter.IncludeID5 || !filter.IncludeID6
}

// buildQuestionCodeConditions builds WHERE conditions for QuestionCode filters
func (r *QuestionFilterRepository) buildQuestionCodeConditions(filter QuestionFilterCriteria, startArgIndex int) ([]string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	argIndex := startArgIndex

	// Grade filter
	if len(filter.Grades) > 0 {
		placeholders := make([]string, len(filter.Grades))
		for i, grade := range filter.Grades {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, grade)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.grade IN (%s)", strings.Join(placeholders, ",")))
	}

	// Subject filter
	if len(filter.Subjects) > 0 {
		placeholders := make([]string, len(filter.Subjects))
		for i, subject := range filter.Subjects {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, subject)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.subject IN (%s)", strings.Join(placeholders, ",")))
	}

	// Chapter filter
	if len(filter.Chapters) > 0 {
		placeholders := make([]string, len(filter.Chapters))
		for i, chapter := range filter.Chapters {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, chapter)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.chapter IN (%s)", strings.Join(placeholders, ",")))
	}

	// Level filter
	if len(filter.Levels) > 0 {
		placeholders := make([]string, len(filter.Levels))
		for i, level := range filter.Levels {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, level)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.level IN (%s)", strings.Join(placeholders, ",")))
	}

	// Lesson filter
	if len(filter.Lessons) > 0 {
		placeholders := make([]string, len(filter.Lessons))
		for i, lesson := range filter.Lessons {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, lesson)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.lesson IN (%s)", strings.Join(placeholders, ",")))
	}

	// Form filter (only for ID6)
	if len(filter.Forms) > 0 {
		placeholders := make([]string, len(filter.Forms))
		for i, form := range filter.Forms {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, form)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.form IN (%s)", strings.Join(placeholders, ",")))
	}

	// Format filter (ID5/ID6)
	if !filter.IncludeID5 && filter.IncludeID6 {
		conditions = append(conditions, "qc.format = 'ID6'")
	} else if filter.IncludeID5 && !filter.IncludeID6 {
		conditions = append(conditions, "qc.format = 'ID5'")
	}

	return conditions, args, argIndex
}

// buildMetadataConditions builds WHERE conditions for metadata filters
func (r *QuestionFilterRepository) buildMetadataConditions(filter QuestionFilterCriteria, startArgIndex int) ([]string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	argIndex := startArgIndex

	// Type filter
	if len(filter.Types) > 0 {
		placeholders := make([]string, len(filter.Types))
		for i, qType := range filter.Types {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, qType)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("q.type IN (%s)", strings.Join(placeholders, ",")))
	}

	// Status filter
	if len(filter.Statuses) > 0 {
		placeholders := make([]string, len(filter.Statuses))
		for i, status := range filter.Statuses {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, status)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("q.status IN (%s)", strings.Join(placeholders, ",")))
	}

	// Difficulty filter
	if len(filter.Difficulties) > 0 {
		placeholders := make([]string, len(filter.Difficulties))
		for i, difficulty := range filter.Difficulties {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, difficulty)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("q.difficulty IN (%s)", strings.Join(placeholders, ",")))
	}

	// Creator filter
	if len(filter.Creators) > 0 {
		placeholders := make([]string, len(filter.Creators))
		for i, creator := range filter.Creators {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, creator)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("q.creator IN (%s)", strings.Join(placeholders, ",")))
	}

	// Usage count range
	if filter.MinUsageCount != nil {
		conditions = append(conditions, fmt.Sprintf("q.usage_count >= $%d", argIndex))
		args = append(args, *filter.MinUsageCount)
		argIndex++
	}
	if filter.MaxUsageCount != nil {
		conditions = append(conditions, fmt.Sprintf("q.usage_count <= $%d", argIndex))
		args = append(args, *filter.MaxUsageCount)
		argIndex++
	}

	// Feedback range
	if filter.MinFeedback != nil {
		conditions = append(conditions, fmt.Sprintf("q.feedback >= $%d", argIndex))
		args = append(args, *filter.MinFeedback)
		argIndex++
	}
	if filter.MaxFeedback != nil {
		conditions = append(conditions, fmt.Sprintf("q.feedback <= $%d", argIndex))
		args = append(args, *filter.MaxFeedback)
		argIndex++
	}

	// Subcount pattern
	if filter.SubcountPattern != "" {
		conditions = append(conditions, fmt.Sprintf("q.subcount ILIKE $%d", argIndex))
		args = append(args, "%"+filter.SubcountPattern+"%")
		argIndex++
	}

	return conditions, args, argIndex
}

// buildDateRangeConditions builds WHERE conditions for date range filters
func (r *QuestionFilterRepository) buildDateRangeConditions(filter QuestionFilterCriteria, startArgIndex int) ([]string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	argIndex := startArgIndex

	// Created date range
	if filter.CreatedAfter != nil {
		conditions = append(conditions, fmt.Sprintf("q.created_at >= $%d", argIndex))
		args = append(args, *filter.CreatedAfter)
		argIndex++
	}
	if filter.CreatedBefore != nil {
		conditions = append(conditions, fmt.Sprintf("q.created_at <= $%d", argIndex))
		args = append(args, *filter.CreatedBefore)
		argIndex++
	}

	// Updated date range
	if filter.UpdatedAfter != nil {
		conditions = append(conditions, fmt.Sprintf("q.updated_at >= $%d", argIndex))
		args = append(args, *filter.UpdatedAfter)
		argIndex++
	}
	if filter.UpdatedBefore != nil {
		conditions = append(conditions, fmt.Sprintf("q.updated_at <= $%d", argIndex))
		args = append(args, *filter.UpdatedBefore)
		argIndex++
	}

	return conditions, args, argIndex
}

// buildContentConditions builds WHERE conditions for content filters
func (r *QuestionFilterRepository) buildContentConditions(filter QuestionFilterCriteria, startArgIndex int) ([]string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	argIndex := startArgIndex

	// Has images filter
	if filter.HasImages != nil {
		if *filter.HasImages {
			conditions = append(conditions, "q.content LIKE '%<img%' OR q.content LIKE '%![%'")
		} else {
			conditions = append(conditions, "q.content NOT LIKE '%<img%' AND q.content NOT LIKE '%![%'")
		}
	}

	// Has solution filter
	if filter.HasSolution != nil {
		if *filter.HasSolution {
			conditions = append(conditions, "q.solution IS NOT NULL AND q.solution != ''")
		} else {
			conditions = append(conditions, "(q.solution IS NULL OR q.solution = '')")
		}
	}

	// Has answers filter
	if filter.HasAnswers != nil {
		if *filter.HasAnswers {
			conditions = append(conditions, "q.answers IS NOT NULL AND q.answers != ''")
		} else {
			conditions = append(conditions, "(q.answers IS NULL OR q.answers = '')")
		}
	}

	// Has feedback filter
	if filter.HasFeedback != nil {
		if *filter.HasFeedback {
			conditions = append(conditions, "q.feedback > 0")
		} else {
			conditions = append(conditions, "(q.feedback IS NULL OR q.feedback = 0)")
		}
	}

	// Content search
	if filter.ContentSearch != "" {
		conditions = append(conditions, fmt.Sprintf("q.content ILIKE $%d", argIndex))
		args = append(args, "%"+filter.ContentSearch+"%")
		argIndex++
	}

	// Solution search
	if filter.SolutionSearch != "" {
		conditions = append(conditions, fmt.Sprintf("q.solution ILIKE $%d", argIndex))
		args = append(args, "%"+filter.SolutionSearch+"%")
		argIndex++
	}

	return conditions, args, argIndex
}

// buildTagConditions builds WHERE conditions for tag filters
func (r *QuestionFilterRepository) buildTagConditions(filter QuestionFilterCriteria, startArgIndex int) ([]string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	argIndex := startArgIndex

	if len(filter.Tags) == 0 {
		return conditions, args, argIndex
	}

	if filter.RequireAllTags {
		// AND logic: question must have ALL specified tags
		// This requires a more complex query with GROUP BY and HAVING
		for _, tag := range filter.Tags {
			conditions = append(conditions, fmt.Sprintf("qt.tag_name = $%d", argIndex))
			args = append(args, tag)
			argIndex++
		}
		// Note: This will need special handling in the main query with GROUP BY
	} else {
		// OR logic: question must have ANY of the specified tags
		placeholders := make([]string, len(filter.Tags))
		for i, tag := range filter.Tags {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, tag)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qt.tag_name IN (%s)", strings.Join(placeholders, ",")))
	}

	return conditions, args, argIndex
}

// buildCountQuery builds a count query from the main query components
func (r *QuestionFilterRepository) buildCountQuery(joinClauses, whereConditions []string) string {
	countQuery := "SELECT COUNT(DISTINCT q.id) FROM question q"
	if len(joinClauses) > 0 {
		countQuery += " " + strings.Join(joinClauses, " ")
	}
	countQuery += " WHERE " + strings.Join(whereConditions, " AND ")
	return countQuery
}

// buildFullTextSearchConditions builds WHERE conditions for full-text search
func (r *QuestionFilterRepository) buildFullTextSearchConditions(searchFilter SearchFilterCriteria, startArgIndex int) []string {
	conditions := []string{}

	// Default search across all text fields if no specific fields are specified
	if len(searchFilter.SearchFields) == 0 {
		// Search in content, solution, and tags using simple ILIKE for now
		// TODO: Implement proper PostgreSQL full-text search with tsvector
		conditions = append(conditions, "(q.content ILIKE '%' || $1 || '%' OR q.solution ILIKE '%' || $1 || '%' OR array_to_string(q.tag, ' ') ILIKE '%' || $1 || '%')")
	} else {
		// Search in specific fields
		fieldConditions := []string{}
		for _, field := range searchFilter.SearchFields {
			switch field {
			case "content":
				fieldConditions = append(fieldConditions, "q.content ILIKE '%' || $1 || '%'")
			case "solution":
				fieldConditions = append(fieldConditions, "q.solution ILIKE '%' || $1 || '%'")
			case "tags":
				fieldConditions = append(fieldConditions, "array_to_string(q.tag, ' ') ILIKE '%' || $1 || '%'")
			}
		}
		if len(fieldConditions) > 0 {
			conditions = append(conditions, fmt.Sprintf("(%s)", strings.Join(fieldConditions, " OR ")))
		}
	}

	return conditions
}

// buildSearchCountQuery builds a count query for search results
func (r *QuestionFilterRepository) buildSearchCountQuery(joinClauses, whereConditions []string) string {
	countQuery := "SELECT COUNT(DISTINCT q.id) FROM question q"
	if len(joinClauses) > 0 {
		countQuery += " " + strings.Join(joinClauses, " ")
	}
	countQuery += " WHERE " + strings.Join(whereConditions, " AND ")
	return countQuery
}

// generateHighlights generates search highlights for a question
func (r *QuestionFilterRepository) generateHighlights(question entity.Question, query string, searchFields []string) []SearchHighlight {
	highlights := []SearchHighlight{}
	queryLower := strings.ToLower(query)

	// Default to all fields if none specified
	if len(searchFields) == 0 {
		searchFields = []string{"content", "solution", "tags"}
	}

	for _, field := range searchFields {
		var text string
		switch field {
		case "content":
			if question.Content.Status == pgtype.Present {
				text = question.Content.String
			}
		case "solution":
			if question.Solution.Status == pgtype.Present {
				text = question.Solution.String
			}
		case "tags":
			// For TextArray, we need to convert to string representation
			if question.Tag.Status == pgtype.Present {
				// Convert TextArray to comma-separated string
				var tagStrings []string
				for _, element := range question.Tag.Elements {
					if element.Status == pgtype.Present {
						tagStrings = append(tagStrings, element.String)
					}
				}
				text = strings.Join(tagStrings, ", ")
			}
		default:
			continue
		}

		if text == "" {
			continue
		}

		textLower := strings.ToLower(text)
		if strings.Contains(textLower, queryLower) {
			// Find the position of the match
			pos := strings.Index(textLower, queryLower)
			if pos >= 0 {
				// Create a snippet around the match
				start := pos - 50
				if start < 0 {
					start = 0
				}
				end := pos + len(queryLower) + 50
				if end > len(text) {
					end = len(text)
				}

				snippet := text[start:end]
				if start > 0 {
					snippet = "..." + snippet
				}
				if end < len(text) {
					snippet = snippet + "..."
				}

				highlights = append(highlights, SearchHighlight{
					Field:     field,
					Snippet:   snippet,
					Positions: []int32{int32(pos)},
				})
			}
		}
	}

	return highlights
}

