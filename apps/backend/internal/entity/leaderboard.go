package entity

import (
	"time"
)

// LeaderboardPeriod represents the period for leaderboard rankings
type LeaderboardPeriod string

const (
	LeaderboardPeriodDaily   LeaderboardPeriod = "daily"    // Hàng ngày
	LeaderboardPeriodWeekly  LeaderboardPeriod = "weekly"   // Hàng tuần
	LeaderboardPeriodMonthly LeaderboardPeriod = "monthly"  // Hàng tháng
	LeaderboardPeriodAllTime LeaderboardPeriod = "all_time" // Tất cả thời gian
)

// LeaderboardEntry represents an entry in the leaderboard
type LeaderboardEntry struct {
	ID                    int               `json:"id" db:"id"`
	UserID                string            `json:"user_id" db:"user_id"`
	Period                LeaderboardPeriod `json:"period" db:"period"`
	PeriodStart           time.Time         `json:"period_start" db:"period_start"`
	PeriodEnd             *time.Time        `json:"period_end,omitempty" db:"period_end"`
	TotalFocusTimeSeconds int64             `json:"total_focus_time_seconds" db:"total_focus_time_seconds"`
	Rank                  *int              `json:"rank,omitempty" db:"rank"`
	Score                 float64           `json:"score" db:"score"`
	UpdatedAt             time.Time         `json:"updated_at" db:"updated_at"`
	
	// Additional fields for display (not in DB, loaded separately)
	Username string `json:"username,omitempty" db:"-"`
	Avatar   string `json:"avatar,omitempty" db:"-"`
	CurrentStreak int `json:"current_streak,omitempty" db:"-"`
	SessionsCompleted int `json:"sessions_completed,omitempty" db:"-"`
}

// TableName returns the table name for LeaderboardEntry
func (LeaderboardEntry) TableName() string {
	return "leaderboard"
}

// CalculateScore tính score dựa trên nhiều yếu tố
// Formula: focus_time * 1.0 + sessions * 300 + streak * 1000 + tasks * 500
func CalculateScore(focusTimeSeconds int64, sessionsCompleted, currentStreak, tasksCompleted int) float64 {
	score := float64(focusTimeSeconds) * 1.0         // 1 point per second
	score += float64(sessionsCompleted) * 300.0      // 300 bonus per session
	score += float64(currentStreak) * 1000.0         // 1000 bonus per streak day
	score += float64(tasksCompleted) * 500.0         // 500 bonus per task
	return score
}

// GetRankBadge trả về emoji badge theo rank
func GetRankBadge(rank int) string {
	switch rank {
	case 1:
		return "🥇"
	case 2:
		return "🥈"
	case 3:
		return "🥉"
	default:
		return ""
	}
}


