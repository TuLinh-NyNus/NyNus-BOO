package grpc

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// LibraryAnalyticsHandler handles analytics-related operations
type LibraryAnalyticsHandler struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewLibraryAnalyticsHandler creates a new analytics handler
func NewLibraryAnalyticsHandler(db *sql.DB, logger *logrus.Logger) *LibraryAnalyticsHandler {
	return &LibraryAnalyticsHandler{
		db:     db,
		logger: logger,
	}
}

// AnalyticsSummary represents summary statistics
type AnalyticsSummary struct {
	TotalDownloads int64
	TotalViews     int64
	AverageRating  float64
	ActiveUsers    int64
	TrendingGrowth float64
	TotalItems     int64
	TotalExams     int64
	TotalBooks     int64
	TotalVideos    int64
}

// TopItemStats represents statistics for a top-performing item
type TopItemStats struct {
	ItemID        string
	Title         string
	Type          string
	DownloadCount int64
	Rating        float64
	ReviewCount   int32
	Rank          int
}

// ContentDistribution represents content type distribution
type ContentDistribution struct {
	Type       string
	Count      int64
	Percentage float64
}

// GetAnalyticsSummary retrieves overall summary statistics
func (h *LibraryAnalyticsHandler) GetAnalyticsSummary(ctx context.Context) (*AnalyticsSummary, error) {
	h.logger.Debug("Getting analytics summary")

	summary := &AnalyticsSummary{}

	// Get total downloads
	err := h.db.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(download_count), 0) 
		FROM library_items 
		WHERE is_active = true AND upload_status = 'approved'
	`).Scan(&summary.TotalDownloads)
	if err != nil && err != sql.ErrNoRows {
		h.logger.WithError(err).Error("Failed to get total downloads")
		return nil, status.Error(codes.Internal, "Failed to get analytics")
	}

	// Get average rating
	err = h.db.QueryRowContext(ctx, `
		SELECT COALESCE(AVG(average_rating), 0) 
		FROM library_items 
		WHERE is_active = true AND upload_status = 'approved' AND review_count > 0
	`).Scan(&summary.AverageRating)
	if err != nil && err != sql.ErrNoRows {
		h.logger.WithError(err).Error("Failed to get average rating")
	}

	// Get active users (users who downloaded in last 30 days)
	err = h.db.QueryRowContext(ctx, `
		SELECT COUNT(DISTINCT user_id) 
		FROM download_history 
		WHERE downloaded_at > NOW() - INTERVAL '30 days'
	`).Scan(&summary.ActiveUsers)
	if err != nil && err != sql.ErrNoRows {
		h.logger.WithError(err).Error("Failed to get active users")
	}

	// Get content counts
	err = h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM library_items WHERE is_active = true
	`).Scan(&summary.TotalItems)
	if err != nil && err != sql.ErrNoRows {
		h.logger.WithError(err).Error("Failed to get total items")
	}

	// Get type-specific counts
	h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM library_items WHERE type = 'exam' AND is_active = true
	`).Scan(&summary.TotalExams)

	h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM library_items WHERE type = 'book' AND is_active = true
	`).Scan(&summary.TotalBooks)

	h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM library_items WHERE type = 'video' AND is_active = true
	`).Scan(&summary.TotalVideos)

	// Calculate trending growth (compare last 7 days vs previous 7 days)
	var currentWeek, previousWeek int64
	h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM download_history 
		WHERE downloaded_at > NOW() - INTERVAL '7 days'
	`).Scan(&currentWeek)

	h.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM download_history 
		WHERE downloaded_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
	`).Scan(&previousWeek)

	if previousWeek > 0 {
		summary.TrendingGrowth = float64(currentWeek-previousWeek) / float64(previousWeek) * 100
	}

	// Total views (approximation: downloads * 3)
	summary.TotalViews = summary.TotalDownloads * 3

	h.logger.WithFields(logrus.Fields{
		"total_downloads": summary.TotalDownloads,
		"total_items":     summary.TotalItems,
		"active_users":    summary.ActiveUsers,
	}).Info("Analytics summary retrieved")

	return summary, nil
}

// GetTopDownloaded retrieves most downloaded items
func (h *LibraryAnalyticsHandler) GetTopDownloaded(ctx context.Context, limit int) ([]*TopItemStats, error) {
	h.logger.WithField("limit", limit).Debug("Getting top downloaded items")

	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT id, title, type, download_count, average_rating, review_count
		FROM library_items
		WHERE is_active = true AND upload_status = 'approved'
		ORDER BY download_count DESC
		LIMIT $1
	`

	rows, err := h.db.QueryContext(ctx, query, limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get top downloaded items")
		return nil, status.Error(codes.Internal, "Failed to get top items")
	}
	defer rows.Close()

	items := make([]*TopItemStats, 0, limit)
	rank := 1

	for rows.Next() {
		item := &TopItemStats{Rank: rank}
		err := rows.Scan(&item.ItemID, &item.Title, &item.Type, &item.DownloadCount, &item.Rating, &item.ReviewCount)
		if err != nil {
			h.logger.WithError(err).Error("Failed to scan top item")
			continue
		}
		items = append(items, item)
		rank++
	}

	return items, nil
}

// GetTopRated retrieves highest rated items
func (h *LibraryAnalyticsHandler) GetTopRated(ctx context.Context, limit int) ([]*TopItemStats, error) {
	h.logger.WithField("limit", limit).Debug("Getting top rated items")

	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT id, title, type, download_count, average_rating, review_count
		FROM library_items
		WHERE is_active = true AND upload_status = 'approved' AND review_count >= 5
		ORDER BY average_rating DESC, review_count DESC
		LIMIT $1
	`

	rows, err := h.db.QueryContext(ctx, query, limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get top rated items")
		return nil, status.Error(codes.Internal, "Failed to get top rated items")
	}
	defer rows.Close()

	items := make([]*TopItemStats, 0, limit)
	rank := 1

	for rows.Next() {
		item := &TopItemStats{Rank: rank}
		err := rows.Scan(&item.ItemID, &item.Title, &item.Type, &item.DownloadCount, &item.Rating, &item.ReviewCount)
		if err != nil {
			h.logger.WithError(err).Error("Failed to scan top rated item")
			continue
		}
		items = append(items, item)
		rank++
	}

	return items, nil
}

// GetRecentlyAdded retrieves recently added items
func (h *LibraryAnalyticsHandler) GetRecentlyAdded(ctx context.Context, limit int) ([]*TopItemStats, error) {
	h.logger.WithField("limit", limit).Debug("Getting recently added items")

	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT id, title, type, download_count, average_rating, review_count
		FROM library_items
		WHERE is_active = true AND upload_status = 'approved'
		ORDER BY created_at DESC
		LIMIT $1
	`

	rows, err := h.db.QueryContext(ctx, query, limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get recently added items")
		return nil, status.Error(codes.Internal, "Failed to get recent items")
	}
	defer rows.Close()

	items := make([]*TopItemStats, 0, limit)
	rank := 1

	for rows.Next() {
		item := &TopItemStats{Rank: rank}
		err := rows.Scan(&item.ItemID, &item.Title, &item.Type, &item.DownloadCount, &item.Rating, &item.ReviewCount)
		if err != nil {
			h.logger.WithError(err).Error("Failed to scan recent item")
			continue
		}
		items = append(items, item)
		rank++
	}

	return items, nil
}

// GetContentDistribution retrieves content type distribution
func (h *LibraryAnalyticsHandler) GetContentDistribution(ctx context.Context) ([]*ContentDistribution, error) {
	h.logger.Debug("Getting content distribution")

	query := `
		SELECT type, COUNT(*) as count
		FROM library_items
		WHERE is_active = true AND upload_status = 'approved'
		GROUP BY type
		ORDER BY count DESC
	`

	rows, err := h.db.QueryContext(ctx, query)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get content distribution")
		return nil, status.Error(codes.Internal, "Failed to get distribution")
	}
	defer rows.Close()

	distributions := make([]*ContentDistribution, 0)
	var total int64

	// First pass: get counts
	tempDist := make(map[string]int64)
	for rows.Next() {
		var itemType string
		var count int64
		err := rows.Scan(&itemType, &count)
		if err != nil {
			h.logger.WithError(err).Error("Failed to scan distribution")
			continue
		}
		tempDist[itemType] = count
		total += count
	}

	// Second pass: calculate percentages
	for itemType, count := range tempDist {
		percentage := float64(0)
		if total > 0 {
			percentage = float64(count) / float64(total) * 100
		}

		distributions = append(distributions, &ContentDistribution{
			Type:       itemType,
			Count:      count,
			Percentage: percentage,
		})
	}

	return distributions, nil
}

// GetDownloadTrends retrieves download trends over time
func (h *LibraryAnalyticsHandler) GetDownloadTrends(ctx context.Context, days int) (map[string]int64, error) {
	h.logger.WithField("days", days).Debug("Getting download trends")

	if days <= 0 {
		days = 30
	}

	query := `
		SELECT DATE(downloaded_at) as date, COUNT(*) as count
		FROM download_history
		WHERE downloaded_at > NOW() - INTERVAL '%d days'
		GROUP BY DATE(downloaded_at)
		ORDER BY date ASC
	`

	rows, err := h.db.QueryContext(ctx, fmt.Sprintf(query, days))
	if err != nil {
		h.logger.WithError(err).Error("Failed to get download trends")
		return nil, status.Error(codes.Internal, "Failed to get trends")
	}
	defer rows.Close()

	trends := make(map[string]int64)
	for rows.Next() {
		var date time.Time
		var count int64
		err := rows.Scan(&date, &count)
		if err != nil {
			h.logger.WithError(err).Error("Failed to scan trend")
			continue
		}
		trends[date.Format("2006-01-02")] = count
	}

	return trends, nil
}

// GetSubjectDistribution retrieves distribution by subject
func (h *LibraryAnalyticsHandler) GetSubjectDistribution(ctx context.Context) (map[string]int64, error) {
	h.logger.Debug("Getting subject distribution")

	query := `
		SELECT em.subject, COUNT(*) as count
		FROM library_items li
		INNER JOIN exam_metadata em ON li.id = em.item_id
		WHERE li.is_active = true AND li.upload_status = 'approved'
		GROUP BY em.subject
		ORDER BY count DESC
	`

	rows, err := h.db.QueryContext(ctx, query)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get subject distribution")
		return nil, status.Error(codes.Internal, "Failed to get subject distribution")
	}
	defer rows.Close()

	distribution := make(map[string]int64)
	for rows.Next() {
		var subject string
		var count int64
		err := rows.Scan(&subject, &count)
		if err != nil {
			h.logger.WithError(err).Error("Failed to scan subject")
			continue
		}
		distribution[subject] = count
	}

	return distribution, nil
}

// NOTE: gRPC endpoint integration example:
// func (s *LibraryService) GetAnalytics(ctx context.Context, req *pb.GetAnalyticsRequest) (*pb.AnalyticsResponse, error) {
//     summary, err := s.analyticsHandler.GetAnalyticsSummary(ctx)
//     if err != nil {
//         return nil, err
//     }
//
//     topDownloaded, _ := s.analyticsHandler.GetTopDownloaded(ctx, 10)
//     topRated, _ := s.analyticsHandler.GetTopRated(ctx, 10)
//     distribution, _ := s.analyticsHandler.GetContentDistribution(ctx)
//
//     return &pb.AnalyticsResponse{...}, nil
// }
