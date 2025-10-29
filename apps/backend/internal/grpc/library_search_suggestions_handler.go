package grpc

import (
	"context"
	"database/sql"
	"strings"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// LibrarySearchSuggestionsHandler handles search suggestions and autocomplete
type LibrarySearchSuggestionsHandler struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewLibrarySearchSuggestionsHandler creates a new search suggestions handler
func NewLibrarySearchSuggestionsHandler(db *sql.DB, logger *logrus.Logger) *LibrarySearchSuggestionsHandler {
	return &LibrarySearchSuggestionsHandler{
		db:     db,
		logger: logger,
	}
}

// SearchSuggestion represents a search suggestion
type SearchSuggestion struct {
	Text       string
	Type       string // "title", "subject", "tag", "trending"
	Count      int64  // Number of matches
	IsTrending bool
}

// GetSearchSuggestions retrieves search suggestions based on query
func (h *LibrarySearchSuggestionsHandler) GetSearchSuggestions(ctx context.Context, query string, limit int) ([]*SearchSuggestion, error) {
	if query == "" {
		return h.getTrendingSuggestions(ctx, limit)
	}

	h.logger.WithFields(logrus.Fields{
		"query": query,
		"limit": limit,
	}).Debug("Getting search suggestions")

	if limit <= 0 {
		limit = 10
	}

	suggestions := make([]*SearchSuggestion, 0)

	// Get title suggestions
	titleSuggestions, err := h.getTitleSuggestions(ctx, query, limit)
	if err == nil {
		suggestions = append(suggestions, titleSuggestions...)
	}

	// Get subject suggestions
	subjectSuggestions, err := h.getSubjectSuggestions(ctx, query, limit)
	if err == nil {
		suggestions = append(suggestions, subjectSuggestions...)
	}

	// Get tag suggestions
	tagSuggestions, err := h.getTagSuggestions(ctx, query, limit)
	if err == nil {
		suggestions = append(suggestions, tagSuggestions...)
	}

	// Limit total results
	if len(suggestions) > limit {
		suggestions = suggestions[:limit]
	}

	return suggestions, nil
}

// getTitleSuggestions gets suggestions from item titles
func (h *LibrarySearchSuggestionsHandler) getTitleSuggestions(ctx context.Context, query string, limit int) ([]*SearchSuggestion, error) {
	sqlQuery := `
		SELECT title, type, download_count
		FROM library_items
		WHERE is_active = true 
		AND upload_status = 'approved'
		AND title ILIKE $1
		ORDER BY download_count DESC
		LIMIT $2
	`

	rows, err := h.db.QueryContext(ctx, sqlQuery, "%"+query+"%", limit/3)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get title suggestions")
		return nil, err
	}
	defer rows.Close()

	suggestions := make([]*SearchSuggestion, 0)
	for rows.Next() {
		var title, itemType string
		var count int64
		err := rows.Scan(&title, &itemType, &count)
		if err != nil {
			continue
		}

		suggestions = append(suggestions, &SearchSuggestion{
			Text:       title,
			Type:       "title",
			Count:      count,
			IsTrending: false,
		})
	}

	return suggestions, nil
}

// getSubjectSuggestions gets suggestions from subjects
func (h *LibrarySearchSuggestionsHandler) getSubjectSuggestions(ctx context.Context, query string, limit int) ([]*SearchSuggestion, error) {
	sqlQuery := `
		SELECT DISTINCT em.subject, COUNT(*) as count
		FROM exam_metadata em
		INNER JOIN library_items li ON em.item_id = li.id
		WHERE li.is_active = true 
		AND li.upload_status = 'approved'
		AND em.subject ILIKE $1
		GROUP BY em.subject
		ORDER BY count DESC
		LIMIT $2
	`

	rows, err := h.db.QueryContext(ctx, sqlQuery, "%"+query+"%", limit/3)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get subject suggestions")
		return nil, err
	}
	defer rows.Close()

	suggestions := make([]*SearchSuggestion, 0)
	for rows.Next() {
		var subject string
		var count int64
		err := rows.Scan(&subject, &count)
		if err != nil {
			continue
		}

		suggestions = append(suggestions, &SearchSuggestion{
			Text:       subject,
			Type:       "subject",
			Count:      count,
			IsTrending: false,
		})
	}

	return suggestions, nil
}

// getTagSuggestions gets suggestions from tags
func (h *LibrarySearchSuggestionsHandler) getTagSuggestions(ctx context.Context, query string, limit int) ([]*SearchSuggestion, error) {
	sqlQuery := `
		SELECT t.name, t.usage_count, t.is_trending
		FROM tags t
		WHERE t.name ILIKE $1
		ORDER BY t.usage_count DESC, t.is_trending DESC
		LIMIT $2
	`

	rows, err := h.db.QueryContext(ctx, sqlQuery, "%"+query+"%", limit/3)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get tag suggestions")
		return nil, err
	}
	defer rows.Close()

	suggestions := make([]*SearchSuggestion, 0)
	for rows.Next() {
		var name string
		var count int64
		var isTrending bool
		err := rows.Scan(&name, &count, &isTrending)
		if err != nil {
			continue
		}

		suggestions = append(suggestions, &SearchSuggestion{
			Text:       name,
			Type:       "tag",
			Count:      count,
			IsTrending: isTrending,
		})
	}

	return suggestions, nil
}

// getTrendingSuggestions gets trending suggestions when no query provided
func (h *LibrarySearchSuggestionsHandler) getTrendingSuggestions(ctx context.Context, limit int) ([]*SearchSuggestion, error) {
	h.logger.Debug("Getting trending suggestions")

	// Get trending tags
	sqlQuery := `
		SELECT name, usage_count
		FROM tags
		WHERE is_trending = true
		ORDER BY usage_count DESC
		LIMIT $1
	`

	rows, err := h.db.QueryContext(ctx, sqlQuery, limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get trending suggestions")
		return nil, status.Error(codes.Internal, "Failed to get suggestions")
	}
	defer rows.Close()

	suggestions := make([]*SearchSuggestion, 0)
	for rows.Next() {
		var name string
		var count int64
		err := rows.Scan(&name, &count)
		if err != nil {
			continue
		}

		suggestions = append(suggestions, &SearchSuggestion{
			Text:       name,
			Type:       "trending",
			Count:      count,
			IsTrending: true,
		})
	}

	// Get popular searches (if we have search history table)
	// TODO: Implement when search_history table is available

	return suggestions, nil
}

// GetPopularSearches retrieves most popular recent searches
func (h *LibrarySearchSuggestionsHandler) GetPopularSearches(ctx context.Context, limit int) ([]*SearchSuggestion, error) {
	h.logger.WithField("limit", limit).Debug("Getting popular searches")

	// TODO: Implement when search_history table is available
	// For now, return trending tags as a placeholder
	return h.getTrendingSuggestions(ctx, limit)
}

// LogSearch logs a search query (for trending analysis)
func (h *LibrarySearchSuggestionsHandler) LogSearch(ctx context.Context, userID string, query string) error {
	if query == "" {
		return nil
	}

	// Normalize query
	normalizedQuery := strings.TrimSpace(strings.ToLower(query))

	h.logger.WithFields(logrus.Fields{
		"user_id": userID,
		"query":   normalizedQuery,
	}).Debug("Logging search query")

	// TODO: Implement search_history table and logging
	// For now, just log to logger
	h.logger.WithFields(logrus.Fields{
		"user_id": userID,
		"query":   normalizedQuery,
	}).Info("Search query logged")

	return nil
}

// GetRecentSearches retrieves user's recent searches
func (h *LibrarySearchSuggestionsHandler) GetRecentSearches(ctx context.Context, userID string, limit int) ([]*SearchSuggestion, error) {
	h.logger.WithFields(logrus.Fields{
		"user_id": userID,
		"limit":   limit,
	}).Debug("Getting recent searches")

	// TODO: Implement when search_history table is available
	// For now, return empty array
	return []*SearchSuggestion{}, nil
}

// NOTE: gRPC endpoint integration example:
// func (s *LibraryService) GetSearchSuggestions(ctx context.Context, req *pb.SearchSuggestionsRequest) (*pb.SearchSuggestionsResponse, error) {
//     suggestions, err := s.searchHandler.GetSearchSuggestions(ctx, req.Query, int(req.Limit))
//     if err != nil {
//         return nil, err
//     }
//
//     pbSuggestions := make([]*pb.SearchSuggestion, len(suggestions))
//     for i, s := range suggestions {
//         pbSuggestions[i] = &pb.SearchSuggestion{
//             Text:       s.Text,
//             Type:       s.Type,
//             Count:      s.Count,
//             IsTrending: s.IsTrending,
//         }
//     }
//
//     return &pb.SearchSuggestionsResponse{
//         Suggestions: pbSuggestions,
//     }, nil
// }
