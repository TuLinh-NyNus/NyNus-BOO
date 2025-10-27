package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/lib/pq"
)

// QuestionRepository implements the QuestionRepository interface
type QuestionRepository struct {
	db *sql.DB
}

// NewQuestionRepository creates a new question repository
func NewQuestionRepository(db *sql.DB) interfaces.QuestionRepository {
	return &QuestionRepository{db: db}
}

// Create creates a new question
func (r *QuestionRepository) Create(ctx context.Context, question *entity.Question) error {
	query := `
		INSERT INTO question (
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, question_code_id,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
			$12, $13, $14, $15, $16, $17, $18
		)
	`

	// Generate ID if not provided
	if question.ID.Status != pgtype.Present || question.ID.String == "" {
		question.ID.Set(uuid.New().String())
	}

	// Set timestamps
	now := time.Now()
	question.CreatedAt.Set(now)
	question.UpdatedAt.Set(now)

	// Convert tags to pq.StringArray for PostgreSQL
	var tags pq.StringArray
	if question.Tag.Status == pgtype.Present {
		for _, elem := range question.Tag.Elements {
			if elem.Status == pgtype.Present {
				tags = append(tags, elem.String)
			}
		}
	}

	_, err := r.db.ExecContext(ctx, query,
		question.ID.String,
		question.RawContent.String,
		question.Content.String,
		util.PgTextToNullString(question.Subcount),
		question.Type.String,
		util.PgTextToNullString(question.Source),
		util.PgJSONBToNullString(question.Answers),
		util.PgJSONBToNullString(question.CorrectAnswer),
		util.PgTextToNullString(question.Solution),
		tags,
		question.UsageCount.Int,
		question.Creator.String,
		question.Status.String,
		question.Feedback.Int,
		question.Difficulty.String,
		question.IsFavorite.Bool,
		question.QuestionCodeID.String,
		question.CreatedAt.Time,
		question.UpdatedAt.Time,
	)

	return err
}

// GetByID retrieves a question by ID
func (r *QuestionRepository) GetByID(ctx context.Context, id string) (*entity.Question, error) {
	query := `
		SELECT 
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, question_code_id,
			created_at, updated_at
		FROM question
		WHERE id = $1
	`

	var q entity.Question
	var tags pq.StringArray
	var subcount, source, solution sql.NullString
	var answers, correctAnswer sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&q.ID.String,
		&q.RawContent.String,
		&q.Content.String,
		&subcount,
		&q.Type.String,
		&source,
		&answers,
		&correctAnswer,
		&solution,
		&tags,
		&q.UsageCount.Int,
		&q.Creator.String,
		&q.Status.String,
		&q.Feedback.Int,
		&q.Difficulty.String,
		&q.QuestionCodeID.String,
		&q.CreatedAt.Time,
		&q.UpdatedAt.Time,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("question not found")
		}
		return nil, err
	}

	// Set statuses for pgtype fields
	q.ID.Status = pgtype.Present
	q.RawContent.Status = pgtype.Present
	q.Content.Status = pgtype.Present
	q.Type.Status = pgtype.Present
	q.UsageCount.Status = pgtype.Present
	q.Creator.Status = pgtype.Present
	q.Status.Status = pgtype.Present
	q.Feedback.Status = pgtype.Present
	q.Difficulty.Status = pgtype.Present
	q.QuestionCodeID.Status = pgtype.Present
	q.CreatedAt.Status = pgtype.Present
	q.UpdatedAt.Status = pgtype.Present

	// Handle nullable fields
	if subcount.Valid {
		q.Subcount.Set(subcount.String)
	}
	if source.Valid {
		q.Source.Set(source.String)
	}
	if solution.Valid {
		q.Solution.Set(solution.String)
	}
	if answers.Valid {
		q.Answers.Set([]byte(answers.String))
	}
	if correctAnswer.Valid {
		q.CorrectAnswer.Set([]byte(correctAnswer.String))
	}

	// Convert tags
	if len(tags) > 0 {
		q.Tag.Elements = make([]pgtype.Text, len(tags))
		for i, tag := range tags {
			q.Tag.Elements[i] = pgtype.Text{String: tag, Status: pgtype.Present}
		}
		q.Tag.Status = pgtype.Present
	}

	return &q, nil
}

// Update updates an existing question
func (r *QuestionRepository) Update(ctx context.Context, question *entity.Question) error {
	query := `
		UPDATE question SET
			raw_content = $2,
			content = $3,
			subcount = $4,
			type = $5,
			source = $6,
			answers = $7,
			correct_answer = $8,
			solution = $9,
			tag = $10,
			status = $11,
			difficulty = $12,
			question_code_id = $13,
			updated_at = $14
		WHERE id = $1
	`

	// Update timestamp
	question.UpdatedAt.Set(time.Now())

	// Convert tags
	var tags pq.StringArray
	if question.Tag.Status == pgtype.Present {
		for _, elem := range question.Tag.Elements {
			if elem.Status == pgtype.Present {
				tags = append(tags, elem.String)
			}
		}
	}

	_, err := r.db.ExecContext(ctx, query,
		question.ID.String,
		question.RawContent.String,
		question.Content.String,
		util.PgTextToNullString(question.Subcount),
		question.Type.String,
		util.PgTextToNullString(question.Source),
		util.PgJSONBToNullString(question.Answers),
		util.PgJSONBToNullString(question.CorrectAnswer),
		util.PgTextToNullString(question.Solution),
		tags,
		question.Status.String,
		question.Difficulty.String,
		question.QuestionCodeID.String,
		question.UpdatedAt.Time,
	)

	return err
}

// Delete deletes a question
func (r *QuestionRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM question WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateBatch creates multiple questions
func (r *QuestionRepository) CreateBatch(ctx context.Context, questions []*entity.Question) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, q := range questions {
		if err := r.createInTx(ctx, tx, q); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// createInTx creates a question within a transaction
func (r *QuestionRepository) createInTx(ctx context.Context, tx *sql.Tx, question *entity.Question) error {
	query := `
		INSERT INTO question (
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, question_code_id,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
			$12, $13, $14, $15, $16, $17, $18
		)
	`

	// Generate ID if not provided
	if question.ID.Status != pgtype.Present || question.ID.String == "" {
		question.ID.Set(uuid.New().String())
	}

	// Set timestamps
	now := time.Now()
	question.CreatedAt.Set(now)
	question.UpdatedAt.Set(now)

	// Convert tags
	var tags pq.StringArray
	if question.Tag.Status == pgtype.Present {
		for _, elem := range question.Tag.Elements {
			if elem.Status == pgtype.Present {
				tags = append(tags, elem.String)
			}
		}
	}

	_, err := tx.ExecContext(ctx, query,
		question.ID.String,
		question.RawContent.String,
		question.Content.String,
		util.PgTextToNullString(question.Subcount),
		question.Type.String,
		util.PgTextToNullString(question.Source),
		util.PgJSONBToNullString(question.Answers),
		util.PgJSONBToNullString(question.CorrectAnswer),
		util.PgTextToNullString(question.Solution),
		tags,
		question.UsageCount.Int,
		question.Creator.String,
		question.Status.String,
		question.Feedback.Int,
		question.Difficulty.String,
		question.QuestionCodeID.String,
		question.CreatedAt.Time,
		question.UpdatedAt.Time,
	)

	return err
}

// GetByIDs retrieves multiple questions by IDs
func (r *QuestionRepository) GetByIDs(ctx context.Context, ids []string) ([]*entity.Question, error) {
	if len(ids) == 0 {
		return []*entity.Question{}, nil
	}

	query := `
		SELECT 
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, question_code_id,
			created_at, updated_at
		FROM question
		WHERE id = ANY($1)
	`

	rows, err := r.db.QueryContext(ctx, query, pq.Array(ids))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestions(rows)
}

// GetAll retrieves all questions with pagination
func (r *QuestionRepository) GetAll(ctx context.Context, offset, limit int) ([]*entity.Question, error) {
	query := `
		SELECT 
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, question_code_id,
			created_at, updated_at
		FROM question
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestions(rows)
}

// Count returns the total number of questions
func (r *QuestionRepository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM question`
	var count int
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	return count, err
}

// FindWithFilters finds questions with advanced filtering
func (r *QuestionRepository) FindWithFilters(ctx context.Context, criteria *interfaces.FilterCriteria, offset, limit int, sortColumn, sortOrder string) ([]*entity.Question, int, error) {
	// Build WHERE clause
	whereClause, args := r.buildWhereClause(criteria)

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM question q
		JOIN question_code qc ON q.question_code_id = qc.code
		%s
	`, whereClause)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query with sorting and pagination
	dataQuery := fmt.Sprintf(`
		SELECT 
			q.id, q.raw_content, q.content, q.subcount, q.type, q.source,
			q.answers, q.correct_answer, q.solution, q.tag, q.usage_count,
			q.creator, q.status, q.feedback, q.difficulty, q.question_code_id,
			q.created_at, q.updated_at
		FROM question q
		JOIN question_code qc ON q.question_code_id = qc.code
		%s
		ORDER BY q.%s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortColumn, sortOrder, len(args)+1, len(args)+2)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	questions, err := r.scanQuestions(rows)
	if err != nil {
		return nil, 0, err
	}

	return questions, total, nil
}

// buildWhereClause builds WHERE clause for filtering
func (r *QuestionRepository) buildWhereClause(criteria *interfaces.FilterCriteria) (string, []interface{}) {
	if criteria == nil {
		return "", []interface{}{}
	}

	var conditions []string
	var args []interface{}
	argCount := 0

	// Helper function to add array conditions
	addArrayCondition := func(field string, values []string) {
		if len(values) > 0 {
			argCount++
			conditions = append(conditions, fmt.Sprintf("%s = ANY($%d)", field, argCount))
			args = append(args, pq.Array(values))
		}
	}

	// Classification filters
	addArrayCondition("qc.grade", criteria.Grades)
	addArrayCondition("qc.subject", criteria.Subjects)
	addArrayCondition("qc.chapter", criteria.Chapters)
	addArrayCondition("qc.level", criteria.Levels)
	addArrayCondition("qc.lesson", criteria.Lessons)
	addArrayCondition("qc.form", criteria.Forms)

	// Question properties
	addArrayCondition("q.type", criteria.Types)
	addArrayCondition("q.difficulty", criteria.Difficulties)
	addArrayCondition("q.status", criteria.Statuses)
	addArrayCondition("q.creator", criteria.Creators)

	// Tags
	if len(criteria.Tags) > 0 {
		argCount++
		if criteria.TagMatchAll {
			conditions = append(conditions, fmt.Sprintf("q.tag @> $%d", argCount))
		} else {
			conditions = append(conditions, fmt.Sprintf("q.tag && $%d", argCount))
		}
		args = append(args, pq.Array(criteria.Tags))
	}

	// Numeric ranges
	if criteria.MinUsageCount > 0 {
		argCount++
		conditions = append(conditions, fmt.Sprintf("q.usage_count >= $%d", argCount))
		args = append(args, criteria.MinUsageCount)
	}
	if criteria.MaxUsageCount > 0 {
		argCount++
		conditions = append(conditions, fmt.Sprintf("q.usage_count <= $%d", argCount))
		args = append(args, criteria.MaxUsageCount)
	}

	if criteria.MinFeedback > 0 {
		argCount++
		conditions = append(conditions, fmt.Sprintf("q.feedback >= $%d", argCount))
		args = append(args, criteria.MinFeedback)
	}
	if criteria.MaxFeedback > 0 {
		argCount++
		conditions = append(conditions, fmt.Sprintf("q.feedback <= $%d", argCount))
		args = append(args, criteria.MaxFeedback)
	}

	// Date ranges
	if criteria.CreatedAfter != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("q.created_at >= $%d", argCount))
		args = append(args, criteria.CreatedAfter)
	}
	if criteria.CreatedBefore != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("q.created_at <= $%d", argCount))
		args = append(args, criteria.CreatedBefore)
	}

	// Boolean filters
	if criteria.HasSolution != nil {
		if *criteria.HasSolution {
			conditions = append(conditions, "q.solution IS NOT NULL AND q.solution != ''")
		} else {
			conditions = append(conditions, "(q.solution IS NULL OR q.solution = '')")
		}
	}

	if criteria.HasSource != nil {
		if *criteria.HasSource {
			conditions = append(conditions, "q.source IS NOT NULL AND q.source != ''")
		} else {
			conditions = append(conditions, "(q.source IS NULL OR q.source = '')")
		}
	}

	// Question code IDs
	addArrayCondition("q.question_code_id", criteria.QuestionCodeIDs)

	if len(conditions) > 0 {
		return "WHERE " + strings.Join(conditions, " AND "), args
	}

	return "", args
}

// Search performs text search on questions
func (r *QuestionRepository) Search(ctx context.Context, searchCriteria interfaces.SearchCriteria, filterCriteria *interfaces.FilterCriteria, offset, limit int) ([]*interfaces.SearchResult, int, error) {
	// For now, implement a simple LIKE search
	// In production, use PostgreSQL full-text search or OpenSearch

	whereClause, args := r.buildSearchWhereClause(searchCriteria, filterCriteria)

	// Count query
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM question q
		JOIN question_code qc ON q.question_code_id = qc.code
		%s
	`, whereClause)

	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query
	dataQuery := fmt.Sprintf(`
		SELECT 
			q.id, q.raw_content, q.content, q.subcount, q.type, q.source,
			q.answers, q.correct_answer, q.solution, q.tag, q.usage_count,
			q.creator, q.status, q.feedback, q.difficulty, q.question_code_id,
			q.created_at, q.updated_at
		FROM question q
		JOIN question_code qc ON q.question_code_id = qc.code
		%s
		ORDER BY q.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, len(args)+1, len(args)+2)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	questions, err := r.scanQuestions(rows)
	if err != nil {
		return nil, 0, err
	}

	// Convert to search results
	results := make([]*interfaces.SearchResult, len(questions))
	for i, q := range questions {
		results[i] = &interfaces.SearchResult{
			Question: *q,
			Score:    1.0, // Simple score for now
			Matches:  []string{},
			Snippet:  r.extractSnippet(q.Content.String, searchCriteria.Query),
		}
	}

	return results, total, nil
}

// buildSearchWhereClause builds WHERE clause for search
func (r *QuestionRepository) buildSearchWhereClause(searchCriteria interfaces.SearchCriteria, filterCriteria *interfaces.FilterCriteria) (string, []interface{}) {
	var conditions []string
	var args []interface{}
	argCount := 0

	// Add filter conditions first
	if filterCriteria != nil {
		filterWhere, filterArgs := r.buildWhereClause(filterCriteria)
		if filterWhere != "" {
			// Remove "WHERE " prefix as we'll add it later
			filterWhere = strings.TrimPrefix(filterWhere, "WHERE ")
			conditions = append(conditions, "("+filterWhere+")")
			args = append(args, filterArgs...)
			argCount = len(args)
		}
	}

	// Add search conditions
	if searchCriteria.Query != "" {
		var searchConditions []string
		searchPattern := "%" + searchCriteria.Query + "%"

		if searchCriteria.SearchInContent {
			argCount++
			searchConditions = append(searchConditions, fmt.Sprintf("q.content ILIKE $%d", argCount))
			args = append(args, searchPattern)
		}

		if searchCriteria.SearchInSolution {
			argCount++
			searchConditions = append(searchConditions, fmt.Sprintf("q.solution ILIKE $%d", argCount))
			args = append(args, searchPattern)
		}

		if searchCriteria.SearchInTags {
			argCount++
			searchConditions = append(searchConditions, fmt.Sprintf("array_to_string(q.tag, ' ') ILIKE $%d", argCount))
			args = append(args, searchPattern)
		}

		if len(searchConditions) > 0 {
			conditions = append(conditions, "("+strings.Join(searchConditions, " OR ")+")")
		}
	}

	if len(conditions) > 0 {
		return "WHERE " + strings.Join(conditions, " AND "), args
	}

	return "", args
}

// extractSnippet extracts a snippet around the search term
func (r *QuestionRepository) extractSnippet(content, query string) string {
	const snippetLength = 150
	lowerContent := strings.ToLower(content)
	lowerQuery := strings.ToLower(query)

	index := strings.Index(lowerContent, lowerQuery)
	if index == -1 {
		if len(content) > snippetLength {
			return content[:snippetLength] + "..."
		}
		return content
	}

	start := index - 50
	if start < 0 {
		start = 0
	}

	end := index + len(query) + 100
	if end > len(content) {
		end = len(content)
	}

	snippet := content[start:end]
	if start > 0 {
		snippet = "..." + snippet
	}
	if end < len(content) {
		snippet = snippet + "..."
	}

	return snippet
}

// FindByQuestionCodeID finds all questions with a specific question code ID
func (r *QuestionRepository) FindByQuestionCodeID(ctx context.Context, questionCodeID string) ([]*entity.Question, error) {
	query := `
		SELECT 
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, question_code_id,
			created_at, updated_at
		FROM question
		WHERE question_code_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, questionCodeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanQuestions(rows)
}

// CountByQuestionCodeID counts questions with a specific question code ID
func (r *QuestionRepository) CountByQuestionCodeID(ctx context.Context, questionCodeID string) (int, error) {
	query := `SELECT COUNT(*) FROM question WHERE question_code_id = $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, questionCodeID).Scan(&count)
	return count, err
}

// GetStatistics gets aggregated statistics
func (r *QuestionRepository) GetStatistics(ctx context.Context, criteria *interfaces.FilterCriteria) (*interfaces.Statistics, error) {
	whereClause, args := r.buildWhereClause(criteria)

	// Base query with conditional WHERE
	baseQuery := `
		FROM question q
		JOIN question_code qc ON q.question_code_id = qc.code
		%s
	`
	baseQuery = fmt.Sprintf(baseQuery, whereClause)

	stats := &interfaces.Statistics{
		TypeDistribution:       make(map[string]int),
		DifficultyDistribution: make(map[string]int),
		StatusDistribution:     make(map[string]int),
		GradeDistribution:      make(map[string]int),
		SubjectDistribution:    make(map[string]int),
	}

	// Get total count
	countQuery := "SELECT COUNT(*) " + baseQuery
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&stats.TotalQuestions)
	if err != nil {
		return nil, err
	}

	// Get distributions
	// Type distribution
	typeQuery := fmt.Sprintf(`
		SELECT q.type, COUNT(*)
		%s
		GROUP BY q.type
	`, baseQuery)

	rows, err := r.db.QueryContext(ctx, typeQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var typ string
		var count int
		if err := rows.Scan(&typ, &count); err != nil {
			return nil, err
		}
		stats.TypeDistribution[typ] = count
	}

	// Similar queries for other distributions...
	// (Simplified for brevity)

	return stats, nil
}

// UpdateStatus updates the status of a question
func (r *QuestionRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE question SET status = $2, updated_at = $3 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id, status, time.Now())
	return err
}

// UpdateUsageCount increments the usage count
func (r *QuestionRepository) UpdateUsageCount(ctx context.Context, id string) error {
	query := `UPDATE question SET usage_count = usage_count + 1, updated_at = $2 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id, time.Now())
	return err
}

// UpdateFeedback updates the feedback score
func (r *QuestionRepository) UpdateFeedback(ctx context.Context, id string, feedbackDelta int) error {
	query := `UPDATE question SET feedback = feedback + $2, updated_at = $3 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id, feedbackDelta, time.Now())
	return err
}

// ToggleFavorite toggles the favorite status of a question
func (r *QuestionRepository) ToggleFavorite(ctx context.Context, id string, isFavorite bool) error {
	query := `UPDATE question SET is_favorite = $2, updated_at = $3 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id, isFavorite, time.Now())
	return err
}

// GetFavorites retrieves all favorite questions with pagination
func (r *QuestionRepository) GetFavorites(ctx context.Context, offset, limit int) ([]*entity.Question, int, error) {
	// Get total count of favorites
	countQuery := `SELECT COUNT(*) FROM question WHERE is_favorite = true`
	var total int
	err := r.db.QueryRowContext(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get favorite questions
	query := `
		SELECT 
			id, raw_content, content, subcount, type, source,
			answers, correct_answer, solution, tag, usage_count,
			creator, status, feedback, difficulty, is_favorite, question_code_id,
			created_at, updated_at
		FROM question
		WHERE is_favorite = true
		ORDER BY updated_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	questions, err := r.scanQuestionsWithFavorite(rows)
	if err != nil {
		return nil, 0, err
	}

	return questions, total, nil
}

// scanQuestions scans multiple question rows
func (r *QuestionRepository) scanQuestions(rows *sql.Rows) ([]*entity.Question, error) {
	var questions []*entity.Question

	for rows.Next() {
		var q entity.Question
		var tags pq.StringArray
		var subcount, source, solution sql.NullString
		var answers, correctAnswer sql.NullString

		err := rows.Scan(
			&q.ID.String,
			&q.RawContent.String,
			&q.Content.String,
			&subcount,
			&q.Type.String,
			&source,
			&answers,
			&correctAnswer,
			&solution,
			&tags,
			&q.UsageCount.Int,
			&q.Creator.String,
			&q.Status.String,
			&q.Feedback.Int,
			&q.Difficulty.String,
			&q.QuestionCodeID.String,
			&q.CreatedAt.Time,
			&q.UpdatedAt.Time,
		)

		if err != nil {
			return nil, err
		}

		// Set statuses
		q.ID.Status = pgtype.Present
		q.RawContent.Status = pgtype.Present
		q.Content.Status = pgtype.Present
		q.Type.Status = pgtype.Present
		q.UsageCount.Status = pgtype.Present
		q.Creator.Status = pgtype.Present
		q.Status.Status = pgtype.Present
		q.Feedback.Status = pgtype.Present
		q.Difficulty.Status = pgtype.Present
		q.QuestionCodeID.Status = pgtype.Present
		q.CreatedAt.Status = pgtype.Present
		q.UpdatedAt.Status = pgtype.Present

		// Handle nullable fields
		if subcount.Valid {
			q.Subcount.Set(subcount.String)
		}
		if source.Valid {
			q.Source.Set(source.String)
		}
		if solution.Valid {
			q.Solution.Set(solution.String)
		}
		if answers.Valid {
			q.Answers.Set([]byte(answers.String))
		}
		if correctAnswer.Valid {
			q.CorrectAnswer.Set([]byte(correctAnswer.String))
		}

		// Convert tags
		if len(tags) > 0 {
			q.Tag.Elements = make([]pgtype.Text, len(tags))
			for i, tag := range tags {
				q.Tag.Elements[i] = pgtype.Text{String: tag, Status: pgtype.Present}
			}
			q.Tag.Status = pgtype.Present
		}

		questions = append(questions, &q)
	}

	return questions, nil
}

// scanQuestionsWithFavorite scans multiple question rows including is_favorite field
func (r *QuestionRepository) scanQuestionsWithFavorite(rows *sql.Rows) ([]*entity.Question, error) {
	var questions []*entity.Question

	for rows.Next() {
		var q entity.Question
		var tags pq.StringArray
		var subcount, source, solution sql.NullString
		var answers, correctAnswer sql.NullString

		err := rows.Scan(
			&q.ID.String,
			&q.RawContent.String,
			&q.Content.String,
			&subcount,
			&q.Type.String,
			&source,
			&answers,
			&correctAnswer,
			&solution,
			&tags,
			&q.UsageCount.Int,
			&q.Creator.String,
			&q.Status.String,
			&q.Feedback.Int,
			&q.Difficulty.String,
			&q.IsFavorite.Bool,
			&q.QuestionCodeID.String,
			&q.CreatedAt.Time,
			&q.UpdatedAt.Time,
		)

		if err != nil {
			return nil, err
		}

		// Set statuses
		q.ID.Status = pgtype.Present
		q.RawContent.Status = pgtype.Present
		q.Content.Status = pgtype.Present
		q.Type.Status = pgtype.Present
		q.UsageCount.Status = pgtype.Present
		q.Creator.Status = pgtype.Present
		q.Status.Status = pgtype.Present
		q.Feedback.Status = pgtype.Present
		q.Difficulty.Status = pgtype.Present
		q.IsFavorite.Status = pgtype.Present
		q.QuestionCodeID.Status = pgtype.Present
		q.CreatedAt.Status = pgtype.Present
		q.UpdatedAt.Status = pgtype.Present

		// Handle nullable fields
		if subcount.Valid {
			q.Subcount.Set(subcount.String)
		}
		if source.Valid {
			q.Source.Set(source.String)
		}
		if solution.Valid {
			q.Solution.Set(solution.String)
		}
		if answers.Valid {
			q.Answers.Set([]byte(answers.String))
		}
		if correctAnswer.Valid {
			q.CorrectAnswer.Set([]byte(correctAnswer.String))
		}

		// Convert tags
		if len(tags) > 0 {
			q.Tag.Elements = make([]pgtype.Text, len(tags))
			for i, tag := range tags {
				q.Tag.Elements[i] = pgtype.Text{String: tag, Status: pgtype.Present}
			}
			q.Tag.Status = pgtype.Present
		}

		questions = append(questions, &q)
	}

	return questions, nil
}

