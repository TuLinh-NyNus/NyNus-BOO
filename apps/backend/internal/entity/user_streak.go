package entity

import (
	"time"
)

// UserStreak represents a user's study streak (GitHub-style)
type UserStreak struct {
	UserID               string     `json:"user_id" db:"user_id"`
	CurrentStreak        int        `json:"current_streak" db:"current_streak"`
	LongestStreak        int        `json:"longest_streak" db:"longest_streak"`
	LastStudyDate        *time.Time `json:"last_study_date,omitempty" db:"last_study_date"`
	TotalStudyDays       int        `json:"total_study_days" db:"total_study_days"`
	TotalFocusTimeSeconds int64     `json:"total_focus_time_seconds" db:"total_focus_time_seconds"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
}

// TableName returns the table name for UserStreak
func (UserStreak) TableName() string {
	return "user_streaks"
}

// IsActiveToday kiểm tra user đã học hôm nay chưa
func (s *UserStreak) IsActiveToday() bool {
	if s.LastStudyDate == nil {
		return false
	}
	today := time.Now().Truncate(24 * time.Hour)
	lastDate := s.LastStudyDate.Truncate(24 * time.Hour)
	return today.Equal(lastDate)
}

// ShouldIncrementStreak kiểm tra có nên tăng streak không
func (s *UserStreak) ShouldIncrementStreak(sessionDate time.Time) bool {
	if s.LastStudyDate == nil {
		return true // First study ever
	}

	today := sessionDate.Truncate(24 * time.Hour)
	lastDate := s.LastStudyDate.Truncate(24 * time.Hour)

	// Nếu đã học hôm nay rồi, không tăng streak
	if today.Equal(lastDate) {
		return false
	}

	// Nếu hôm qua học, tăng streak
	yesterday := today.AddDate(0, 0, -1)
	return yesterday.Equal(lastDate)
}

// ShouldResetStreak kiểm tra có nên reset streak không
func (s *UserStreak) ShouldResetStreak(sessionDate time.Time) bool {
	if s.LastStudyDate == nil {
		return false
	}

	today := sessionDate.Truncate(24 * time.Hour)
	lastDate := s.LastStudyDate.Truncate(24 * time.Hour)

	// Nếu bỏ lỡ 1 ngày trở lên (không phải hôm qua, không phải hôm nay), reset
	yesterday := today.AddDate(0, 0, -1)
	return !yesterday.Equal(lastDate) && !today.Equal(lastDate)
}

// UpdateStreak cập nhật streak sau session
func (s *UserStreak) UpdateStreak(sessionDate time.Time) {
	if s.ShouldResetStreak(sessionDate) {
		s.CurrentStreak = 1
	} else if s.ShouldIncrementStreak(sessionDate) {
		s.CurrentStreak++
		if s.CurrentStreak > s.LongestStreak {
			s.LongestStreak = s.CurrentStreak
		}
		s.TotalStudyDays++
	}
	
	// Update last study date
	dateOnly := sessionDate.Truncate(24 * time.Hour)
	s.LastStudyDate = &dateOnly
	s.UpdatedAt = time.Now()
}


