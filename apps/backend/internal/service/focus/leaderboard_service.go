package focus

import (
	"context"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// LeaderboardService handles business logic for leaderboards
type LeaderboardService struct {
	leaderboardRepo interfaces.LeaderboardRepository
}

// NewLeaderboardService creates a new leaderboard service instance
func NewLeaderboardService(leaderboardRepo interfaces.LeaderboardRepository) *LeaderboardService {
	return &LeaderboardService{
		leaderboardRepo: leaderboardRepo,
	}
}

// GetLeaderboard retrieves the leaderboard for a specific type and period
func (s *LeaderboardService) GetLeaderboard(ctx context.Context, leaderboardType string, period entity.LeaderboardPeriod, limit int) ([]*entity.LeaderboardEntry, error) {
	// Calculate period start based on period type
	periodStart := calculatePeriodStart(period)

	var entries []*entity.LeaderboardEntry
	var err error

	switch leaderboardType {
	case "global":
		entries, err = s.leaderboardRepo.GetGlobalLeaderboard(ctx, period, periodStart, limit)
	default:
		return nil, fmt.Errorf("invalid leaderboard type: %s", leaderboardType)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get leaderboard: %w", err)
	}

	return entries, nil
}

// GetClassLeaderboard retrieves the leaderboard for a specific class
func (s *LeaderboardService) GetClassLeaderboard(ctx context.Context, classID int, period entity.LeaderboardPeriod, limit int) ([]*entity.LeaderboardEntry, error) {
	periodStart := calculatePeriodStart(period)

	entries, err := s.leaderboardRepo.GetClassLeaderboard(ctx, classID, period, periodStart, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get class leaderboard: %w", err)
	}

	return entries, nil
}

// GetUserRank retrieves a user's rank in the leaderboard
func (s *LeaderboardService) GetUserRank(ctx context.Context, userID string, period entity.LeaderboardPeriod) (int, error) {
	periodStart := calculatePeriodStart(period)

	rank, err := s.leaderboardRepo.GetUserRank(ctx, userID, period, periodStart)
	if err != nil {
		return 0, fmt.Errorf("failed to get user rank: %w", err)
	}

	return rank, nil
}

// RefreshLeaderboard recalculates leaderboard rankings
func (s *LeaderboardService) RefreshLeaderboard(ctx context.Context, period entity.LeaderboardPeriod) error {
	periodStart, periodEnd := calculatePeriodRange(period)

	if err := s.leaderboardRepo.RefreshLeaderboard(ctx, period, periodStart, periodEnd); err != nil {
		return fmt.Errorf("failed to refresh leaderboard: %w", err)
	}

	return nil
}

// CalculateScore calculates a weighted score for a leaderboard entry
func (s *LeaderboardService) CalculateScore(focusTimeSeconds int64, sessionsCompleted, currentStreak, tasksCompleted int) float64 {
	return entity.CalculateScore(focusTimeSeconds, sessionsCompleted, currentStreak, tasksCompleted)
}

// RefreshAllLeaderboards refreshes all leaderboard periods (scheduled job)
func (s *LeaderboardService) RefreshAllLeaderboards(ctx context.Context) error {
	periods := []entity.LeaderboardPeriod{
		entity.LeaderboardPeriodDaily,
		entity.LeaderboardPeriodWeekly,
		entity.LeaderboardPeriodMonthly,
		entity.LeaderboardPeriodAllTime,
	}

	for _, period := range periods {
		if err := s.RefreshLeaderboard(ctx, period); err != nil {
			// Log error but continue with other periods
			fmt.Printf("failed to refresh %s leaderboard: %v\n", period, err)
		}
	}

	return nil
}

// calculatePeriodStart calculates the start date for a period
func calculatePeriodStart(period entity.LeaderboardPeriod) time.Time {
	now := time.Now()

	switch period {
	case entity.LeaderboardPeriodDaily:
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	case entity.LeaderboardPeriodWeekly:
		// Start of week (Sunday)
		weekday := int(now.Weekday())
		return now.AddDate(0, 0, -weekday).Truncate(24 * time.Hour)
	case entity.LeaderboardPeriodMonthly:
		return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	case entity.LeaderboardPeriodAllTime:
		// Beginning of time (or app launch date)
		return time.Date(2025, 1, 1, 0, 0, 0, 0, now.Location())
	default:
		return now.Truncate(24 * time.Hour)
	}
}

// calculatePeriodRange calculates start and end dates for a period
func calculatePeriodRange(period entity.LeaderboardPeriod) (time.Time, time.Time) {
	start := calculatePeriodStart(period)
	now := time.Now()

	switch period {
	case entity.LeaderboardPeriodDaily:
		return start, start.AddDate(0, 0, 1)
	case entity.LeaderboardPeriodWeekly:
		return start, start.AddDate(0, 0, 7)
	case entity.LeaderboardPeriodMonthly:
		return start, start.AddDate(0, 1, 0)
	case entity.LeaderboardPeriodAllTime:
		return start, now
	default:
		return start, now
	}
}


