package focus

import (
	"context"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// StreakService handles business logic for user streaks
type StreakService struct {
	streakRepo interfaces.UserStreakRepository
}

// NewStreakService creates a new streak service instance
func NewStreakService(streakRepo interfaces.UserStreakRepository) *StreakService {
	return &StreakService{
		streakRepo: streakRepo,
	}
}

// GetStreak retrieves a user's streak information
func (s *StreakService) GetStreak(ctx context.Context, userID string) (*entity.UserStreak, error) {
	streak, err := s.streakRepo.Get(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get streak: %w", err)
	}

	return streak, nil
}

// UpdateStreak updates a user's streak after a study session
func (s *StreakService) UpdateStreak(ctx context.Context, userID string, sessionDate time.Time) error {
	if err := s.streakRepo.IncrementStreak(ctx, userID, sessionDate); err != nil {
		return fmt.Errorf("failed to update streak: %w", err)
	}

	return nil
}

// CalculateStreak calculates streak based on last study date and current date
func (s *StreakService) CalculateStreak(lastDate, currentDate time.Time) int {
	if lastDate.IsZero() {
		return 1 // First study day
	}

	lastDay := lastDate.Truncate(24 * time.Hour)
	currentDay := currentDate.Truncate(24 * time.Hour)

	// Same day - no change
	if lastDay.Equal(currentDay) {
		return 0 // No increment
	}

	// Consecutive day
	yesterday := currentDay.AddDate(0, 0, -1)
	if lastDay.Equal(yesterday) {
		return 1 // Increment by 1
	}

	// Missed days - reset
	return -1 // Reset to 1
}

// CheckStreakBreak checks if a user has broken their streak
func (s *StreakService) CheckStreakBreak(ctx context.Context, userID string) (bool, error) {
	streak, err := s.streakRepo.Get(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("failed to get streak: %w", err)
	}

	if streak.LastStudyDate == nil {
		return false, nil // No streak to break
	}

	// Check if last study was yesterday or today
	today := time.Now().Truncate(24 * time.Hour)
	yesterday := today.AddDate(0, 0, -1)
	lastDate := streak.LastStudyDate.Truncate(24 * time.Hour)

	if lastDate.Equal(today) || lastDate.Equal(yesterday) {
		return false, nil // Streak is still active
	}

	// Streak broken - reset
	if err := s.streakRepo.ResetStreak(ctx, userID); err != nil {
		return true, fmt.Errorf("failed to reset streak: %w", err)
	}

	return true, nil
}

// GetTopStreaks retrieves the top streaks for leaderboard
func (s *StreakService) GetTopStreaks(ctx context.Context, limit int) ([]*entity.UserStreak, error) {
	streaks, err := s.streakRepo.GetTopStreaks(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get top streaks: %w", err)
	}

	return streaks, nil
}

// CheckStreaksDaily is a background job to check all users' streaks
func (s *StreakService) CheckStreaksDaily(ctx context.Context) error {
	// This would be called by a cron job
	// For now, we'll just return nil
	// In production, this would fetch all users and check their streaks
	return nil
}
