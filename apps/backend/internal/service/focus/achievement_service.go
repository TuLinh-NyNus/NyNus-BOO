package focus

import (
	"context"
	"fmt"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// AchievementService handles business logic for achievements
type AchievementService struct {
	achievementRepo interfaces.AchievementRepository
	streakRepo      interfaces.UserStreakRepository
}

// NewAchievementService creates a new achievement service instance
func NewAchievementService(
	achievementRepo interfaces.AchievementRepository,
	streakRepo interfaces.UserStreakRepository,
) *AchievementService {
	return &AchievementService{
		achievementRepo: achievementRepo,
		streakRepo:      streakRepo,
	}
}

// GetAchievements retrieves all achievements for a user
func (s *AchievementService) GetAchievements(ctx context.Context, userID string) ([]*entity.Achievement, error) {
	achievements, err := s.achievementRepo.GetUserAchievements(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get achievements: %w", err)
	}

	return achievements, nil
}

// CheckAndUnlockAchievements checks user stats and unlocks achievements
func (s *AchievementService) CheckAndUnlockAchievements(ctx context.Context, userID string, event string) ([]*entity.Achievement, error) {
	// Get user streak
	streak, err := s.streakRepo.Get(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get streak: %w", err)
	}

	// Check and unlock based on stats
	newAchievements, err := s.achievementRepo.CheckAndUnlock(ctx, userID, streak)
	if err != nil {
		return nil, fmt.Errorf("failed to check achievements: %w", err)
	}

	return newAchievements, nil
}

// HasAchievement checks if a user has a specific achievement
func (s *AchievementService) HasAchievement(ctx context.Context, userID string, achievementType entity.AchievementType) (bool, error) {
	has, err := s.achievementRepo.HasAchievement(ctx, userID, achievementType)
	if err != nil {
		return false, fmt.Errorf("failed to check achievement: %w", err)
	}

	return has, nil
}

// UnlockAchievement manually unlocks an achievement for a user
func (s *AchievementService) UnlockAchievement(ctx context.Context, userID string, achievementType entity.AchievementType) error {
	// Check if already has achievement
	has, err := s.achievementRepo.HasAchievement(ctx, userID, achievementType)
	if err != nil {
		return fmt.Errorf("failed to check achievement: %w", err)
	}

	if has {
		return fmt.Errorf("achievement already unlocked")
	}

	// Unlock achievement
	if err := s.achievementRepo.UnlockAchievement(ctx, userID, achievementType); err != nil {
		return fmt.Errorf("failed to unlock achievement: %w", err)
	}

	return nil
}

// GetAchievementDefinitions returns all available achievement definitions
func (s *AchievementService) GetAchievementDefinitions() []entity.AchievementDefinition {
	return entity.GetAchievementDefinitions()
}


