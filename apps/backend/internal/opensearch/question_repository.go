package opensearch

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/jackc/pgtype"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

// QuestionRepository provides OpenSearch-based question search and indexing
type QuestionRepository struct {
	client        *Client
	searchService *SearchService
	config        *Config
	logger        *log.Logger
}

// NewQuestionRepository creates a new OpenSearch question repository
func NewQuestionRepository(client *Client) *QuestionRepository {
	return &QuestionRepository{
		client:        client,
		searchService: NewSearchService(client),
		config:        client.GetConfig(),
		logger:        log.New(log.Writer(), "[OpenSearch-Questions] ", log.LstdFlags),
	}
}

// IndexQuestion indexes a question document in OpenSearch
func (r *QuestionRepository) IndexQuestion(ctx context.Context, question *entity.Question) error {
	if !r.client.IsEnabled() {
		r.logger.Printf("OpenSearch disabled, skipping question indexing: %s", question.ID.String)
		return nil
	}

	// Convert question to OpenSearch document
	doc := r.questionToDocument(question)

	// Index document
	docJSON, err := json.Marshal(doc)
	if err != nil {
		return fmt.Errorf("failed to marshal question document: %w", err)
	}

	req := opensearchapi.IndexRequest{
		Index:      r.config.GetQuestionsAliasName(),
		DocumentID: question.ID.String,
		Body:       strings.NewReader(string(docJSON)),
		Refresh:    "wait_for",
	}

	res, err := req.Do(ctx, r.client.client)
	if err != nil {
		return fmt.Errorf("failed to index question: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("index question failed with status: %s", res.Status())
	}

	r.logger.Printf("Indexed question: %s", question.ID.String)
	return nil
}

// BulkIndexQuestions indexes multiple questions in a single bulk request
func (r *QuestionRepository) BulkIndexQuestions(ctx context.Context, questions []*entity.Question) error {
	if !r.client.IsEnabled() {
		return nil
	}

	if len(questions) == 0 {
		return nil
	}

	// Build bulk request body
	var body strings.Builder
	for _, question := range questions {
		// Action line
		action := map[string]interface{}{
			"index": map[string]interface{}{
				"_index": r.config.GetQuestionsAliasName(),
				"_id":    question.ID.String,
			},
		}
		actionJSON, _ := json.Marshal(action)
		body.WriteString(string(actionJSON))
		body.WriteString("\n")

		// Document line
		doc := r.questionToDocument(question)
		docJSON, _ := json.Marshal(doc)
		body.WriteString(string(docJSON))
		body.WriteString("\n")
	}

	// Execute bulk request
	req := opensearchapi.BulkRequest{
		Body:    strings.NewReader(body.String()),
		Refresh: "wait_for",
	}

	res, err := req.Do(ctx, r.client.client)
	if err != nil {
		return fmt.Errorf("bulk index request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("bulk index failed with status: %s", res.Status())
	}

	// Parse response to check for errors
	var bulkResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&bulkResponse); err != nil {
		return fmt.Errorf("failed to decode bulk response: %w", err)
	}

	if errors, ok := bulkResponse["errors"].(bool); ok && errors {
		r.logger.Printf("Bulk index completed with some errors")
		// Log individual errors but don't fail the entire operation
		if items, ok := bulkResponse["items"].([]interface{}); ok {
			for i, item := range items {
				if itemMap, ok := item.(map[string]interface{}); ok {
					if indexResult, ok := itemMap["index"].(map[string]interface{}); ok {
						if errorInfo, ok := indexResult["error"]; ok {
							r.logger.Printf("Error indexing question %d: %v", i, errorInfo)
						}
					}
				}
			}
		}
	}

	r.logger.Printf("Bulk indexed %d questions", len(questions))
	return nil
}

// DeleteQuestion removes a question from the OpenSearch index
func (r *QuestionRepository) DeleteQuestion(ctx context.Context, questionID string) error {
	if !r.client.IsEnabled() {
		return nil
	}

	req := opensearchapi.DeleteRequest{
		Index:      r.config.GetQuestionsAliasName(),
		DocumentID: questionID,
		Refresh:    "wait_for",
	}

	res, err := req.Do(ctx, r.client.client)
	if err != nil {
		return fmt.Errorf("delete question request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() && res.StatusCode != 404 {
		return fmt.Errorf("delete question failed with status: %s", res.Status())
	}

	r.logger.Printf("Deleted question from index: %s", questionID)
	return nil
}

// SearchQuestions performs Vietnamese text search on questions
func (r *QuestionRepository) SearchQuestions(ctx context.Context, searchCriteria interfaces.SearchCriteria, filterCriteria *interfaces.FilterCriteria, offset, limit int) ([]*interfaces.SearchResult, int, error) {
	if !r.client.IsEnabled() {
		r.logger.Printf("OpenSearch disabled, returning empty search results")
		return []*interfaces.SearchResult{}, 0, nil
	}

	// Build search request
	searchReq := &SearchRequest{
		Query:     searchCriteria.Query,
		From:      offset,
		Size:      limit,
		Highlight: true,
		Suggest:   false,
		Fuzziness: "AUTO",
		MinScore:  0.1,
		Timeout:   30 * time.Second,
	}

	// Add search fields based on criteria
	if searchCriteria.SearchInContent || searchCriteria.SearchInSolution || searchCriteria.SearchInTags {
		searchReq.Fields = r.buildSearchFields(searchCriteria)
	}

	// Add filters
	if filterCriteria != nil {
		searchReq.Filters = r.buildFilters(filterCriteria)
	}

	// Execute search
	response, err := r.searchService.Search(ctx, searchReq)
	if err != nil {
		return nil, 0, fmt.Errorf("search failed: %w", err)
	}

	// Convert to search results
	results := make([]*interfaces.SearchResult, len(response.Hits))
	for i, hit := range response.Hits {
		question := r.documentToQuestion(hit.Source)

		// Extract snippet from highlights
		snippet := r.extractSnippet(hit.Highlight, searchCriteria.Query)

		// Extract matches from highlights
		matches := r.extractMatches(hit.Highlight)

		results[i] = &interfaces.SearchResult{
			Question: *question,
			Score:    float32(hit.Score),
			Matches:  matches,
			Snippet:  snippet,
		}
	}

	return results, int(response.Total), nil
}

// SuggestQuestions provides auto-completion suggestions
func (r *QuestionRepository) SuggestQuestions(ctx context.Context, text string, size int) ([]string, error) {
	if !r.client.IsEnabled() {
		return []string{}, nil
	}

	suggestions, err := r.searchService.Suggest(ctx, text, size)
	if err != nil {
		return nil, fmt.Errorf("suggest failed: %w", err)
	}

	var results []string
	for _, suggestion := range suggestions {
		results = append(results, suggestion.Text)
	}

	return results, nil
}

// AnalyzeVietnameseText analyzes Vietnamese text using configured analyzers
func (r *QuestionRepository) AnalyzeVietnameseText(ctx context.Context, text string) ([]string, error) {
	if !r.client.IsEnabled() {
		return []string{text}, nil
	}

	return r.searchService.AnalyzeText(ctx, text, "content")
}

// RefreshIndex refreshes the questions index
func (r *QuestionRepository) RefreshIndex(ctx context.Context) error {
	if !r.client.IsEnabled() {
		return nil
	}

	req := opensearchapi.IndicesRefreshRequest{
		Index: []string{r.config.GetQuestionsAliasName()},
	}

	res, err := req.Do(ctx, r.client.client)
	if err != nil {
		return fmt.Errorf("refresh index request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("refresh index failed with status: %s", res.Status())
	}

	r.logger.Printf("Refreshed questions index")
	return nil
}

// Helper methods

// questionToDocument converts a Question entity to OpenSearch document
func (r *QuestionRepository) questionToDocument(question *entity.Question) map[string]interface{} {
	doc := map[string]interface{}{
		"id":          question.ID.String,
		"content":     question.Content.String,
		"raw_content": question.RawContent.String,
		"type":        question.Type.String,
		"difficulty":  question.Difficulty.String,
		"status":      question.Status.String,
		"creator":     question.Creator.String,
		"usage_count": question.UsageCount.Int,
		"feedback":    question.Feedback.Int,
		"created_at":  question.CreatedAt.Time,
		"updated_at":  question.UpdatedAt.Time,
	}

	// Add optional fields
	if question.Solution.Status == pgtype.Present {
		doc["solution"] = question.Solution.String
	}

	if question.Source.Status == pgtype.Present {
		doc["source"] = question.Source.String
	}

	if question.Subcount.Status == pgtype.Present {
		doc["subcount"] = question.Subcount.String
	}

	// Add tags
	if question.Tag.Status == pgtype.Present && len(question.Tag.Elements) > 0 {
		doc["tags"] = question.Tag.Elements
	}

	// Add structured answers
	// TODO: StructuredAnswers field does not exist in entity.Question
	// if question.StructuredAnswers != nil {
	//	doc["structured_answers"] = question.StructuredAnswers
	// }

	// Add question code information (if available)
	if question.QuestionCodeID.Status == pgtype.Present {
		doc["question_code_id"] = question.QuestionCodeID.String
		// Note: In a real implementation, you might want to denormalize
		// question code information here for better search performance
	}

	// Add suggestion field for auto-completion
	if question.Content.Status == pgtype.Present {
		doc["suggest"] = map[string]interface{}{
			"input": []string{
				question.Content.String,
				// Add other suggestion inputs based on content analysis
			},
			"contexts": map[string]interface{}{
				"subject": []string{"toán", "lý", "hóa", "sinh", "văn"},   // Extract from question code
				"grade":   []string{"6", "7", "8", "9", "10", "11", "12"}, // Extract from question code
			},
		}
	}

	return doc
}

// documentToQuestion converts OpenSearch document back to Question entity
func (r *QuestionRepository) documentToQuestion(doc map[string]interface{}) *entity.Question {
	question := &entity.Question{}

	if id, ok := doc["id"].(string); ok {
		question.ID.String = id
		question.ID.Status = pgtype.Present
	}

	if content, ok := doc["content"].(string); ok {
		question.Content.String = content
		question.Content.Status = pgtype.Present
	}

	if rawContent, ok := doc["raw_content"].(string); ok {
		question.RawContent.String = rawContent
		question.RawContent.Status = pgtype.Present
	}

	if qType, ok := doc["type"].(string); ok {
		question.Type.String = qType
		question.Type.Status = pgtype.Present
	}

	if difficulty, ok := doc["difficulty"].(string); ok {
		question.Difficulty.String = difficulty
		question.Difficulty.Status = pgtype.Present
	}

	if status, ok := doc["status"].(string); ok {
		question.Status.String = status
		question.Status.Status = pgtype.Present
	}

	if creator, ok := doc["creator"].(string); ok {
		question.Creator.String = creator
		question.Creator.Status = pgtype.Present
	}

	if usageCount, ok := doc["usage_count"].(float64); ok {
		question.UsageCount.Int = int32(usageCount)
		question.UsageCount.Status = pgtype.Present
	}

	if feedback, ok := doc["feedback"].(float64); ok {
		question.Feedback.Int = int32(feedback)
		question.Feedback.Status = pgtype.Present
	}

	// Parse timestamps
	if createdAt, ok := doc["created_at"].(string); ok {
		if t, err := time.Parse(time.RFC3339, createdAt); err == nil {
			question.CreatedAt.Time = t
			question.CreatedAt.Status = pgtype.Present
		}
	}

	if updatedAt, ok := doc["updated_at"].(string); ok {
		if t, err := time.Parse(time.RFC3339, updatedAt); err == nil {
			question.UpdatedAt.Time = t
			question.UpdatedAt.Status = pgtype.Present
		}
	}

	// Parse optional fields
	if solution, ok := doc["solution"].(string); ok {
		question.Solution.String = solution
		question.Solution.Status = pgtype.Present
	}

	if source, ok := doc["source"].(string); ok {
		question.Source.String = source
		question.Source.Status = pgtype.Present
	}

	if subcount, ok := doc["subcount"].(string); ok {
		question.Subcount.String = subcount
		question.Subcount.Status = pgtype.Present
	}

	if questionCodeID, ok := doc["question_code_id"].(string); ok {
		question.QuestionCodeID.String = questionCodeID
		question.QuestionCodeID.Status = pgtype.Present
	}

	// Parse tags
	if tags, ok := doc["tags"].([]interface{}); ok {
		var tagStrings []string
		for _, tag := range tags {
			if tagStr, ok := tag.(string); ok {
				tagStrings = append(tagStrings, tagStr)
			}
		}
		// Convert to pgtype.TextArray
		question.Tag.Elements = make([]pgtype.Text, len(tagStrings))
		for i, tag := range tagStrings {
			question.Tag.Elements[i] = pgtype.Text{String: tag, Status: pgtype.Present}
		}
		question.Tag.Status = pgtype.Present
	}

	// Parse structured answers
	// TODO: StructuredAnswers field does not exist in entity.Question
	// if answers, ok := doc["structured_answers"]; ok {
	//	question.StructuredAnswers = answers
	// }

	return question
}

// buildSearchFields builds search fields based on search criteria
func (r *QuestionRepository) buildSearchFields(criteria interfaces.SearchCriteria) []string {
	var fields []string

	if criteria.SearchInContent {
		fields = append(fields, "content^3", "content.exact^2")
	}

	if criteria.SearchInSolution {
		fields = append(fields, "solution^2", "solution.exact^1.5")
	}

	if criteria.SearchInTags {
		fields = append(fields, "tags^1.5")
	}

	// Always include source as a fallback
	fields = append(fields, "source")

	return fields
}

// buildFilters builds OpenSearch filters from filter criteria
func (r *QuestionRepository) buildFilters(criteria *interfaces.FilterCriteria) map[string]interface{} {
	filters := make(map[string]interface{})

	if len(criteria.Types) > 0 {
		filters["type"] = criteria.Types
	}

	if len(criteria.Difficulties) > 0 {
		filters["difficulty"] = criteria.Difficulties
	}

	if len(criteria.Statuses) > 0 {
		filters["status"] = criteria.Statuses
	}

	if len(criteria.Creators) > 0 {
		filters["creator"] = criteria.Creators
	}

	if len(criteria.Tags) > 0 {
		filters["tags"] = criteria.Tags
	}

	if len(criteria.QuestionCodeIDs) > 0 {
		filters["question_code_id"] = criteria.QuestionCodeIDs
	}

	// Date range filters
	if criteria.CreatedAfter != "" || criteria.CreatedBefore != "" {
		dateFilter := make(map[string]interface{})
		if criteria.CreatedAfter != "" {
			dateFilter["from"] = criteria.CreatedAfter
		}
		if criteria.CreatedBefore != "" {
			dateFilter["to"] = criteria.CreatedBefore
		}
		filters["created_at"] = dateFilter
	}

	return filters
}

// extractSnippet extracts search snippet from highlights
func (r *QuestionRepository) extractSnippet(highlights map[string][]string, query string) string {
	// Priority order for snippet extraction
	fields := []string{"content", "solution", "tags"}

	for _, field := range fields {
		if fragments, ok := highlights[field]; ok && len(fragments) > 0 {
			return fragments[0] // Return first fragment
		}
	}

	// Fallback to query if no highlights
	return fmt.Sprintf("...%s...", query)
}

// extractMatches extracts matched terms from highlights
func (r *QuestionRepository) extractMatches(highlights map[string][]string) []string {
	var matches []string
	seen := make(map[string]bool)

	for _, fragments := range highlights {
		for _, fragment := range fragments {
			// Extract text between <mark> tags
			parts := strings.Split(fragment, "<mark>")
			for i := 1; i < len(parts); i++ {
				if endIdx := strings.Index(parts[i], "</mark>"); endIdx > 0 {
					match := parts[i][:endIdx]
					if !seen[match] {
						matches = append(matches, match)
						seen[match] = true
					}
				}
			}
		}
	}

	return matches
}
