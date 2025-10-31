package focus

import (
	"context"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// AnalyticsService handles business logic for study analytics
type AnalyticsService struct {
	analyticsRepo interfaces.StudyAnalyticsRepository
	sessionRepo   interfaces.FocusSessionRepository
}

// NewAnalyticsService creates a new analytics service instance
func NewAnalyticsService(
	analyticsRepo interfaces.StudyAnalyticsRepository,
	sessionRepo interfaces.FocusSessionRepository,
) *AnalyticsService {
	return &AnalyticsService{
		analyticsRepo: analyticsRepo,
		sessionRepo:   sessionRepo,
	}
}

// GetDailyStats retrieves daily statistics for a user
func (s *AnalyticsService) GetDailyStats(ctx context.Context, userID string, date time.Time) (*entity.DailyAnalytics, error) {
	stats, err := s.analyticsRepo.GetDailyStats(ctx, userID, date)
	if err != nil {
		return nil, fmt.Errorf("failed to get daily stats: %w", err)
	}

	return stats, nil
}

// GetWeeklyStats retrieves weekly statistics for a user
func (s *AnalyticsService) GetWeeklyStats(ctx context.Context, userID string, weekStart time.Time) (*entity.WeeklyAnalytics, error) {
	// Get daily stats for the week
	dailyStats, err := s.analyticsRepo.GetWeeklyStats(ctx, userID, weekStart)
	if err != nil {
		return nil, fmt.Errorf("failed to get weekly stats: %w", err)
	}

	// Aggregate weekly stats
	weeklyStats := &entity.WeeklyAnalytics{
		WeekStart:        weekStart,
		WeekEnd:          weekStart.AddDate(0, 0, 7),
		DailyBreakdown:   make([]entity.DailyAnalytics, 0),
		AverageDailyTime: 0,
		Streak:           0,
		Improvement:      0,
	}

	totalFocusTime := 0
	var mostProductiveDay *time.Time
	maxFocusTime := 0

	for _, daily := range dailyStats {
		weeklyStats.DailyBreakdown = append(weeklyStats.DailyBreakdown, *daily)
		totalFocusTime += daily.TotalFocusTimeSeconds

		if daily.TotalFocusTimeSeconds > maxFocusTime {
			maxFocusTime = daily.TotalFocusTimeSeconds
			mostProductiveDay = &daily.Date
		}
	}

	weeklyStats.TotalFocusTimeSeconds = totalFocusTime
	if len(dailyStats) > 0 {
		weeklyStats.AverageDailyTime = totalFocusTime / len(dailyStats)
	}
	weeklyStats.MostProductiveDay = mostProductiveDay

	// Calculate improvement (compare with previous week)
	prevWeekStart := weekStart.AddDate(0, 0, -7)
	prevWeekStats, err := s.analyticsRepo.GetWeeklyStats(ctx, userID, prevWeekStart)
	if err == nil && len(prevWeekStats) > 0 {
		prevTotalTime := 0
		for _, daily := range prevWeekStats {
			prevTotalTime += daily.TotalFocusTimeSeconds
		}
		if prevTotalTime > 0 {
			weeklyStats.Improvement = float64(totalFocusTime-prevTotalTime) / float64(prevTotalTime) * 100
		}
	}

	return weeklyStats, nil
}

// GetMonthlyStats retrieves monthly statistics for a user
func (s *AnalyticsService) GetMonthlyStats(ctx context.Context, userID string, year, month int) (*entity.MonthlyAnalytics, error) {
	// Get daily stats for the month
	dailyStats, err := s.analyticsRepo.GetMonthlyStats(ctx, userID, year, month)
	if err != nil {
		return nil, fmt.Errorf("failed to get monthly stats: %w", err)
	}

	// Aggregate monthly stats
	monthlyStats := &entity.MonthlyAnalytics{
		Month:           month,
		Year:            year,
		TotalDaysActive: len(dailyStats),
		TopSubjects:     make([]entity.SubjectTime, 0),
		WeeklyBreakdown: make([]entity.WeeklyAnalytics, 0),
	}

	totalFocusTime := 0
	subjectTotals := make(map[string]int)

	for _, daily := range dailyStats {
		totalFocusTime += daily.TotalFocusTimeSeconds

		// Aggregate subjects
		for subject, seconds := range daily.SubjectsStudied {
			subjectTotals[subject] += seconds
		}
	}

	monthlyStats.TotalFocusTimeSeconds = totalFocusTime
	if monthlyStats.TotalDaysActive > 0 {
		monthlyStats.AverageDailyTime = totalFocusTime / monthlyStats.TotalDaysActive
	}

	// Calculate top subjects
	for subject, seconds := range subjectTotals {
		percentage := 0.0
		if totalFocusTime > 0 {
			percentage = float64(seconds) / float64(totalFocusTime) * 100
		}
		monthlyStats.TopSubjects = append(monthlyStats.TopSubjects, entity.SubjectTime{
			Subject:     subject,
			TimeSeconds: seconds,
			Percentage:  percentage,
		})
	}

	// Sort top subjects (top 5)
	// TODO: Implement sorting

	return monthlyStats, nil
}

// GetContributionGraph retrieves contribution graph data
func (s *AnalyticsService) GetContributionGraph(ctx context.Context, userID string, days int) ([]*entity.ContributionDay, error) {
	contributions, err := s.analyticsRepo.GetContributionGraph(ctx, userID, days)
	if err != nil {
		return nil, fmt.Errorf("failed to get contribution graph: %w", err)
	}

	return contributions, nil
}

// CalculateBestHours calculates the most productive hours for a user
func (s *AnalyticsService) CalculateBestHours(ctx context.Context, userID string) ([]int, error) {
	// Get last 30 days of sessions
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30)

	sessions, err := s.sessionRepo.GetSessionsByDateRange(ctx, userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get sessions: %w", err)
	}

	// Count focus time by hour
	hourTotals := make(map[int]int)
	for _, session := range sessions {
		if session.SessionType == entity.SessionTypeFocus {
			hour := session.StartedAt.Hour()
			hourTotals[hour] += session.DurationSeconds
		}
	}

	// Find top 3 hours
	// TODO: Implement sorting and return top 3
	topHours := []int{}
	for hour := range hourTotals {
		topHours = append(topHours, hour)
		if len(topHours) >= 3 {
			break
		}
	}

	return topHours, nil
}

// GetProductivityInsights provides productivity insights for a user
func (s *AnalyticsService) GetProductivityInsights(ctx context.Context, userID string) (map[string]interface{}, error) {
	insights := make(map[string]interface{})

	// Get best hours
	bestHours, _ := s.CalculateBestHours(ctx, userID)
	insights["best_hours"] = bestHours

	// Get weekly trend
	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	weeklyStats, _ := s.GetWeeklyStats(ctx, userID, weekStart)
	insights["weekly_improvement"] = weeklyStats.Improvement

	// Get monthly average
	now := time.Now()
	monthlyStats, _ := s.GetMonthlyStats(ctx, userID, now.Year(), int(now.Month()))
	insights["monthly_average"] = monthlyStats.AverageDailyTime

	return insights, nil
}
