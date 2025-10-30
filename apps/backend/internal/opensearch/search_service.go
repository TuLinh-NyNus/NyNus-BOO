package opensearch

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

// SearchService provides Vietnamese search capabilities
type SearchService struct {
	client *Client
	config *Config
}

// NewSearchService creates a new Vietnamese search service
func NewSearchService(client *Client) *SearchService {
	return &SearchService{
		client: client,
		config: client.GetConfig(),
	}
}

// SearchRequest represents a Vietnamese search request
type SearchRequest struct {
	Query        string                   `json:"query"`
	Fields       []string                 `json:"fields,omitempty"`
	Filters      map[string]interface{}   `json:"filters,omitempty"`
	Sort         []map[string]interface{} `json:"sort,omitempty"`
	From         int                      `json:"from,omitempty"`
	Size         int                      `json:"size,omitempty"`
	Highlight    bool                     `json:"highlight,omitempty"`
	Suggest      bool                     `json:"suggest,omitempty"`
	Fuzziness    string                   `json:"fuzziness,omitempty"`
	MinScore     float64                  `json:"min_score,omitempty"`
	IncludeScore bool                     `json:"include_score,omitempty"`
	Timeout      time.Duration            `json:"timeout,omitempty"`
}

// SearchResponse represents a Vietnamese search response
type SearchResponse struct {
	Hits         []SearchHit            `json:"hits"`
	Total        int64                  `json:"total"`
	MaxScore     float64                `json:"max_score"`
	Took         int                    `json:"took"`
	TimedOut     bool                   `json:"timed_out"`
	Suggestions  []Suggestion           `json:"suggestions,omitempty"`
	Aggregations map[string]interface{} `json:"aggregations,omitempty"`
}

// SearchHit represents a single search result
type SearchHit struct {
	ID        string                 `json:"id"`
	Score     float64                `json:"score"`
	Source    map[string]interface{} `json:"source"`
	Highlight map[string][]string    `json:"highlight,omitempty"`
	Sort      []interface{}          `json:"sort,omitempty"`
}

// Suggestion represents an auto-completion suggestion
type Suggestion struct {
	Text    string                 `json:"text"`
	Score   float64                `json:"score"`
	Payload map[string]interface{} `json:"payload,omitempty"`
}

// Search performs Vietnamese text search with education domain optimization
func (s *SearchService) Search(ctx context.Context, req *SearchRequest) (*SearchResponse, error) {
	if !s.client.IsEnabled() {
		return &SearchResponse{}, nil
	}

	// Build OpenSearch query
	query := s.buildSearchQuery(req)

	// Execute search
	searchReq := opensearchapi.SearchRequest{
		Index: []string{s.config.GetQuestionsAliasName()},
		Body:  strings.NewReader(query),
	}

	res, err := searchReq.Do(ctx, s.client.client)
	if err != nil {
		return nil, fmt.Errorf("search request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("search failed with status: %s", res.Status())
	}

	// Parse response
	var osResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&osResponse); err != nil {
		return nil, fmt.Errorf("failed to decode search response: %w", err)
	}

	return s.parseSearchResponse(osResponse), nil
}

// MultiSearch performs multiple searches in a single request
func (s *SearchService) MultiSearch(ctx context.Context, requests []*SearchRequest) ([]*SearchResponse, error) {
	if !s.client.IsEnabled() {
		return make([]*SearchResponse, len(requests)), nil
	}

	// Build multi-search body
	var body strings.Builder
	for _, req := range requests {
		// Header line
		header := map[string]interface{}{
			"index": s.config.GetQuestionsAliasName(),
		}
		headerJSON, _ := json.Marshal(header)
		body.WriteString(string(headerJSON))
		body.WriteString("\n")

		// Query line
		query := s.buildSearchQuery(req)
		body.WriteString(query)
		body.WriteString("\n")
	}

	// Execute multi-search
	msearchReq := opensearchapi.MsearchRequest{
		Body: strings.NewReader(body.String()),
	}

	res, err := msearchReq.Do(ctx, s.client.client)
	if err != nil {
		return nil, fmt.Errorf("multi-search request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("multi-search failed with status: %s", res.Status())
	}

	// Parse response
	var osResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&osResponse); err != nil {
		return nil, fmt.Errorf("failed to decode multi-search response: %w", err)
	}

	return s.parseMultiSearchResponse(osResponse), nil
}

// Suggest provides auto-completion suggestions for Vietnamese text
func (s *SearchService) Suggest(ctx context.Context, text string, size int) ([]Suggestion, error) {
	if !s.client.IsEnabled() {
		return []Suggestion{}, nil
	}

	suggestQuery := map[string]interface{}{
		"suggest": map[string]interface{}{
			"question_suggest": map[string]interface{}{
				"prefix": text,
				"completion": map[string]interface{}{
					"field": "suggest",
					"size":  size,
					"contexts": map[string]interface{}{
						"subject": []string{"toÃ¡n", "lÃ½", "hÃ³a", "sinh", "vÄƒn"},
					},
				},
			},
		},
	}

	queryJSON, err := json.Marshal(suggestQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal suggest query: %w", err)
	}

	searchReq := opensearchapi.SearchRequest{
		Index: []string{s.config.GetQuestionsAliasName()},
		Body:  strings.NewReader(string(queryJSON)),
	}

	res, err := searchReq.Do(ctx, s.client.client)
	if err != nil {
		return nil, fmt.Errorf("suggest request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("suggest failed with status: %s", res.Status())
	}

	// Parse suggestions
	var osResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&osResponse); err != nil {
		return nil, fmt.Errorf("failed to decode suggest response: %w", err)
	}

	return s.parseSuggestResponse(osResponse), nil
}

// AnalyzeText analyzes Vietnamese text using configured analyzers
func (s *SearchService) AnalyzeText(ctx context.Context, text, analyzer string) ([]string, error) {
	if !s.client.IsEnabled() {
		return []string{text}, nil
	}

	analyzeQuery := map[string]interface{}{
		"analyzer": s.config.GetAnalyzerName(analyzer),
		"text":     text,
	}

	queryJSON, err := json.Marshal(analyzeQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal analyze query: %w", err)
	}

	analyzeReq := opensearchapi.IndicesAnalyzeRequest{
		Index: s.config.GetQuestionsAliasName(),
		Body:  strings.NewReader(string(queryJSON)),
	}

	res, err := analyzeReq.Do(ctx, s.client.client)
	if err != nil {
		return nil, fmt.Errorf("analyze request failed: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("analyze failed with status: %s", res.Status())
	}

	// Parse tokens
	var osResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&osResponse); err != nil {
		return nil, fmt.Errorf("failed to decode analyze response: %w", err)
	}

	return s.parseAnalyzeResponse(osResponse), nil
}

// buildSearchQuery builds OpenSearch query with Vietnamese optimization
func (s *SearchService) buildSearchQuery(req *SearchRequest) string {
	query := map[string]interface{}{
		"from": req.From,
		"size": s.getSearchSize(req.Size),
	}

	// Build main query
	if req.Query != "" {
		query["query"] = s.buildMainQuery(req)
	} else {
		query["query"] = map[string]interface{}{"match_all": map[string]interface{}{}}
	}

	// Add filters
	if len(req.Filters) > 0 {
		query = s.addFilters(query, req.Filters)
	}

	// Add sorting
	if len(req.Sort) > 0 {
		query["sort"] = req.Sort
	} else {
		query["sort"] = []map[string]interface{}{
			{"_score": map[string]interface{}{"order": "desc"}},
			{"created_at": map[string]interface{}{"order": "desc"}},
		}
	}

	// Add highlighting
	if req.Highlight {
		query["highlight"] = s.config.GetHighlightFields()
	}

	// Add suggestions
	if req.Suggest {
		query["suggest"] = s.buildSuggestQuery(req.Query)
	}

	// Add minimum score
	if req.MinScore > 0 {
		query["min_score"] = req.MinScore
	}

	// Add timeout
	if req.Timeout > 0 {
		query["timeout"] = req.Timeout.String()
	}

	queryJSON, _ := json.Marshal(query)
	return string(queryJSON)
}

// buildMainQuery builds the main search query with Vietnamese analysis
func (s *SearchService) buildMainQuery(req *SearchRequest) map[string]interface{} {
	fields := req.Fields
	if len(fields) == 0 {
		fields = s.config.GetSearchFields()
	}

	// Multi-match query with Vietnamese optimization
	multiMatch := map[string]interface{}{
		"multi_match": map[string]interface{}{
			"query":     req.Query,
			"fields":    fields,
			"type":      "best_fields",
			"operator":  "or",
			"fuzziness": s.getFuzziness(req.Fuzziness),
			"analyzer":  s.config.GetAnalyzerName("search"),
		},
	}

	// Add boost for exact matches
	exactMatch := map[string]interface{}{
		"multi_match": map[string]interface{}{
			"query":    req.Query,
			"fields":   []string{"content.exact^5", "solution.exact^3"},
			"type":     "phrase",
			"analyzer": s.config.GetAnalyzerName("exact"),
		},
	}

	// Combine queries with boost
	return map[string]interface{}{
		"bool": map[string]interface{}{
			"should": []map[string]interface{}{
				multiMatch,
				exactMatch,
			},
			"minimum_should_match": 1,
		},
	}
}

// addFilters adds filters to the query
func (s *SearchService) addFilters(query map[string]interface{}, filters map[string]interface{}) map[string]interface{} {
	if mainQuery, ok := query["query"]; ok {
		query["query"] = map[string]interface{}{
			"bool": map[string]interface{}{
				"must":   mainQuery,
				"filter": s.buildFilterClauses(filters),
			},
		}
	}
	return query
}

// buildFilterClauses builds filter clauses from filter map
func (s *SearchService) buildFilterClauses(filters map[string]interface{}) []map[string]interface{} {
	var clauses []map[string]interface{}

	for field, value := range filters {
		switch v := value.(type) {
		case string:
			clauses = append(clauses, map[string]interface{}{
				"term": map[string]interface{}{field: v},
			})
		case []string:
			clauses = append(clauses, map[string]interface{}{
				"terms": map[string]interface{}{field: v},
			})
		case map[string]interface{}:
			if from, ok := v["from"]; ok {
				if to, ok := v["to"]; ok {
					clauses = append(clauses, map[string]interface{}{
						"range": map[string]interface{}{
							field: map[string]interface{}{
								"gte": from,
								"lte": to,
							},
						},
					})
				}
			}
		}
	}

	return clauses
}

// buildSuggestQuery builds suggestion query
func (s *SearchService) buildSuggestQuery(text string) map[string]interface{} {
	return map[string]interface{}{
		"question_suggest": map[string]interface{}{
			"prefix": text,
			"completion": map[string]interface{}{
				"field": "suggest",
				"size":  5,
			},
		},
	}
}

// Helper methods for parsing responses
func (s *SearchService) parseSearchResponse(response map[string]interface{}) *SearchResponse {
	hits := response["hits"].(map[string]interface{})
	total := int64(hits["total"].(map[string]interface{})["value"].(float64))
	took := int(response["took"].(float64))
	timedOut := response["timed_out"].(bool)

	var maxScore float64
	if hits["max_score"] != nil {
		maxScore = hits["max_score"].(float64)
	}

	var searchHits []SearchHit
	for _, hit := range hits["hits"].([]interface{}) {
		h := hit.(map[string]interface{})
		searchHit := SearchHit{
			ID:     h["_id"].(string),
			Score:  h["_score"].(float64),
			Source: h["_source"].(map[string]interface{}),
		}

		if highlight, ok := h["highlight"]; ok {
			searchHit.Highlight = make(map[string][]string)
			for field, fragments := range highlight.(map[string]interface{}) {
				var frags []string
				for _, frag := range fragments.([]interface{}) {
					frags = append(frags, frag.(string))
				}
				searchHit.Highlight[field] = frags
			}
		}

		searchHits = append(searchHits, searchHit)
	}

	result := &SearchResponse{
		Hits:     searchHits,
		Total:    total,
		MaxScore: maxScore,
		Took:     took,
		TimedOut: timedOut,
	}

	// Parse suggestions if present
	if _, ok := response["suggest"]; ok {
		result.Suggestions = s.parseSuggestResponse(response)
	}

	return result
}

func (s *SearchService) parseMultiSearchResponse(response map[string]interface{}) []*SearchResponse {
	responses := response["responses"].([]interface{})
	var results []*SearchResponse

	for _, resp := range responses {
		r := resp.(map[string]interface{})
		if error, ok := r["error"]; ok {
			// Handle error response
			_ = error
			results = append(results, &SearchResponse{})
		} else {
			results = append(results, s.parseSearchResponse(r))
		}
	}

	return results
}

func (s *SearchService) parseSuggestResponse(response map[string]interface{}) []Suggestion {
	var suggestions []Suggestion

	if suggest, ok := response["suggest"]; ok {
		suggestMap := suggest.(map[string]interface{})
		if questionSuggest, ok := suggestMap["question_suggest"]; ok {
			for _, suggestion := range questionSuggest.([]interface{}) {
				s := suggestion.(map[string]interface{})
				for _, option := range s["options"].([]interface{}) {
					opt := option.(map[string]interface{})
					suggestions = append(suggestions, Suggestion{
						Text:  opt["text"].(string),
						Score: opt["_score"].(float64),
					})
				}
			}
		}
	}

	return suggestions
}

func (s *SearchService) parseAnalyzeResponse(response map[string]interface{}) []string {
	var tokens []string

	if tokensData, ok := response["tokens"]; ok {
		for _, token := range tokensData.([]interface{}) {
			t := token.(map[string]interface{})
			tokens = append(tokens, t["token"].(string))
		}
	}

	return tokens
}

// Helper methods
func (s *SearchService) getSearchSize(size int) int {
	if size <= 0 {
		return s.config.DefaultSize
	}
	if size > s.config.MaxSize {
		return s.config.MaxSize
	}
	return size
}

func (s *SearchService) getFuzziness(fuzziness string) string {
	if fuzziness == "" {
		return "AUTO"
	}
	return fuzziness
}
