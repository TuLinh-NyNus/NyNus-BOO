package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// AchievementRepository implements the AchievementRepository interface
type AchievementRepository struct {
	db *sql.DB
}

// NewAchievementRepository creates a new achievement repository instance
func NewAchievementRepository(db *sql.DB) interfaces.AchievementRepository {
	return &AchievementRepository{db: db}
}

// GetUserAchievements retrieves all achievements for a user
func (r *AchievementRepository) GetUserAchievements(ctx context.Context, userID string) ([]*entity.Achievement, error) {
	query := `
		SELECT id, user_id, achievement_type, achievement_name, description, icon_url, earned_at
		FROM user_achievements
		WHERE user_id = $1
		ORDER BY earned_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user achievements: %w", err)
	}
	defer rows.Close()

	var achievements []*entity.Achievement
	for rows.Next() {
		var achievement entity.Achievement
		var iconURL sql.NullString

		err := rows.Scan(
			&achievement.ID,
			&achievement.UserID,
			&achievement.AchievementType,
			&achievement.AchievementName,
			&achievement.Description,
			&iconURL,
			&achievement.EarnedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan achievement: %w", err)
		}

		if iconURL.Valid {
			achievement.IconURL = &iconURL.String
		}

		achievements = append(achievements, &achievement)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating achievements: %w", err)
	}

	return achievements, nil
}

// UnlockAchievement unlocks an achievement for a user
func (r *AchievementRepository) UnlockAchievement(ctx context.Context, userID string, achievementType entity.AchievementType) error {
	// Get achievement details
	name, description, icon := getAchievementDetails(achievementType)

	query := `
		INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon_url, earned_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id, achievement_type) DO NOTHING
	`

	_, err := r.db.ExecContext(ctx, query, userID, achievementType, name, description, icon, time.Now())
	if err != nil {
		return fmt.Errorf("failed to unlock achievement: %w", err)
	}

	return nil
}

// HasAchievement checks if a user has a specific achievement
func (r *AchievementRepository) HasAchievement(ctx context.Context, userID string, achievementType entity.AchievementType) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM user_achievements 
			WHERE user_id = $1 AND achievement_type = $2
		)
	`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, userID, achievementType).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check achievement: %w", err)
	}

	return exists, nil
}

// CheckAndUnlock checks conditions and unlocks achievements based on user stats
func (r *AchievementRepository) CheckAndUnlock(ctx context.Context, userID string, stats interface{}) ([]*entity.Achievement, error) {
	var newAchievements []*entity.Achievement

	// Type assertion based on stats type
	switch s := stats.(type) {
	case *entity.UserStreak:
		// Check streak achievements
		streakAchievements := []struct {
			threshold int
			achType   entity.AchievementType
		}{
			{3, entity.AchievementType3DayStreak},
			{7, entity.AchievementType7DayStreak},
			{30, entity.AchievementType30DayStreak},
			{100, entity.AchievementType100DayStreak},
			{365, entity.AchievementType365DayStreak},
		}

		for _, sa := range streakAchievements {
			if s.CurrentStreak >= sa.threshold {
				has, err := r.HasAchievement(ctx, userID, sa.achType)
				if err != nil {
					continue
				}
				if !has {
					if err := r.UnlockAchievement(ctx, userID, sa.achType); err != nil {
						continue
					}
					ach := &entity.Achievement{
						UserID:          userID,
						AchievementType: sa.achType,
						EarnedAt:        time.Now(),
					}
					newAchievements = append(newAchievements, ach)
				}
			}
		}

		// Check total time achievements
		timeAchievements := []struct {
			threshold int64 // seconds
			achType   entity.AchievementType
		}{
			{36000, entity.AchievementType10Hours},     // 10 hours
			{180000, entity.AchievementType50Hours},    // 50 hours
			{360000, entity.AchievementType100Hours},   // 100 hours
			{1800000, entity.AchievementType500Hours},  // 500 hours
			{3600000, entity.AchievementType1000Hours}, // 1000 hours
		}

		for _, ta := range timeAchievements {
			if s.TotalFocusTimeSeconds >= ta.threshold {
				has, err := r.HasAchievement(ctx, userID, ta.achType)
				if err != nil {
					continue
				}
				if !has {
					if err := r.UnlockAchievement(ctx, userID, ta.achType); err != nil {
						continue
					}
					ach := &entity.Achievement{
						UserID:          userID,
						AchievementType: ta.achType,
						EarnedAt:        time.Now(),
					}
					newAchievements = append(newAchievements, ach)
				}
			}
		}
	}

	return newAchievements, nil
}

// getAchievementDetails returns the name, description, and icon for an achievement type
func getAchievementDetails(achType entity.AchievementType) (name, description string, icon *string) {
	achievements := map[entity.AchievementType]struct {
		name string
		desc string
		icon string
	}{
		entity.AchievementTypeFirstSession:  {"Phiên Đầu Tiên", "Hoàn thành phiên focus đầu tiên", "🎯"},
		entity.AchievementType3DayStreak:    {"Streak 3 Ngày", "Học liên tục 3 ngày", "🔥"},
		entity.AchievementType7DayStreak:    {"Streak 7 Ngày", "Học liên tục 1 tuần", "🔥🔥"},
		entity.AchievementType30DayStreak:   {"Streak 30 Ngày", "Học liên tục 1 tháng", "🔥🔥🔥"},
		entity.AchievementType100DayStreak:  {"Streak 100 Ngày", "Học liên tục 100 ngày", "💯"},
		entity.AchievementType365DayStreak:  {"Streak 365 Ngày", "Học liên tục cả năm", "👑"},
		entity.AchievementType10Hours:       {"10 Giờ Focus", "Tích lũy 10 giờ học tập", "⏱️"},
		entity.AchievementType50Hours:       {"50 Giờ Focus", "Tích lũy 50 giờ học tập", "⏱️⏱️"},
		entity.AchievementType100Hours:      {"100 Giờ Focus", "Tích lũy 100 giờ học tập", "⏱️⏱️⏱️"},
		entity.AchievementType500Hours:      {"500 Giờ Focus", "Tích lũy 500 giờ học tập", "🏆"},
		entity.AchievementType1000Hours:     {"1000 Giờ Focus", "Tích lũy 1000 giờ học tập", "👑"},
		entity.AchievementType10Sessions:    {"10 Phiên", "Hoàn thành 10 phiên học", "📚"},
		entity.AchievementType100Sessions:   {"100 Phiên", "Hoàn thành 100 phiên học", "📚📚"},
		entity.AchievementType1000Sessions:  {"1000 Phiên", "Hoàn thành 1000 phiên học", "📚📚📚"},
		entity.AchievementTypeMarathon:      {"Marathon", "Hoàn thành 1 phiên > 2 giờ", "🏃"},
		entity.AchievementTypeEarlyBird:     {"Chim Sơn Ca", "Focus trước 6h sáng", "🐦"},
		entity.AchievementTypeNightOwl:      {"Cú Đêm", "Focus sau 10h đêm", "🦉"},
		entity.AchievementTypeTaskMaster:    {"Bậc Thầy Nhiệm Vụ", "Hoàn thành 10 tasks", "✅"},
		entity.AchievementTypeProductiveDay: {"Ngày Hiệu Quả", "Hoàn thành 5 tasks trong 1 ngày", "✅✅"},
		entity.AchievementTypeSubjectExpert: {"Chuyên Gia Môn Học", "20 tasks cùng 1 môn", "🎓"},
		entity.AchievementTypeSocialLearner: {"Học Cùng Nhóm", "Tham gia 5 study rooms", "👥"},
		entity.AchievementTypeRoomCreator:   {"Người Tạo Phòng", "Tạo room đầu tiên", "🏠"},
		entity.AchievementTypeTop10:         {"Top 10", "Vào top 10 leaderboard", "🥇"},
	}

	if details, ok := achievements[achType]; ok {
		return details.name, details.desc, &details.icon
	}

	return string(achType), "Achievement", nil
}
