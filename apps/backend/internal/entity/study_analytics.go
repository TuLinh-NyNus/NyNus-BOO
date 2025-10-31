package entity

import (
	"time"
)

// SubjectsStudied represents time spent per subject (JSONB in database)
type SubjectsStudied map[string]int // subject -> seconds

// DailyAnalytics represents daily study statistics
type DailyAnalytics struct {
	ID                    int             `json:"id" db:"id"`
	UserID                string          `json:"user_id" db:"user_id"`
	Date                  time.Time       `json:"date" db:"date"`
	TotalFocusTimeSeconds int             `json:"total_focus_time_seconds" db:"total_focus_time_seconds"`
	TotalBreakTimeSeconds int             `json:"total_break_time_seconds" db:"total_break_time_seconds"`
	SessionsCompleted     int             `json:"sessions_completed" db:"sessions_completed"`
	TasksCompleted        int             `json:"tasks_completed" db:"tasks_completed"`
	MostProductiveHour    *int            `json:"most_productive_hour,omitempty" db:"most_productive_hour"` // 0-23
	SubjectsStudied       SubjectsStudied `json:"subjects_studied" db:"subjects_studied"`                    // JSONB
	CreatedAt             time.Time       `json:"created_at" db:"created_at"`
}

// TableName returns the table name for DailyAnalytics
func (DailyAnalytics) TableName() string {
	return "study_analytics"
}

// ContributionLevel tính mức độ đóng góp (0-4) dựa trên focus time
func (d *DailyAnalytics) ContributionLevel() int {
	seconds := d.TotalFocusTimeSeconds
	if seconds == 0 {
		return 0
	} else if seconds < 1800 { // < 30 min
		return 1
	} else if seconds < 3600 { // 30-60 min
		return 2
	} else if seconds < 7200 { // 1-2h
		return 3
	}
	return 4 // > 2h
}

// WeeklyAnalytics represents weekly study statistics
type WeeklyAnalytics struct {
	WeekStart             time.Time        `json:"week_start"`
	WeekEnd               time.Time        `json:"week_end"`
	TotalFocusTimeSeconds int              `json:"total_focus_time_seconds"`
	DailyBreakdown        []DailyAnalytics `json:"daily_breakdown"` // 7 days
	AverageDailyTime      int              `json:"average_daily_time"`
	MostProductiveDay     *time.Time       `json:"most_productive_day,omitempty"`
	Streak                int              `json:"streak"`
	Improvement           float64          `json:"improvement"` // % so với tuần trước
}

// MonthlyAnalytics represents monthly study statistics
type MonthlyAnalytics struct {
	Month                 int                `json:"month"` // 1-12
	Year                  int                `json:"year"`
	TotalFocusTimeSeconds int                `json:"total_focus_time_seconds"`
	TotalDaysActive       int                `json:"total_days_active"`
	AverageDailyTime      int                `json:"average_daily_time"`
	LongestStreak         int                `json:"longest_streak"`
	TopSubjects           []SubjectTime      `json:"top_subjects"`
	WeeklyBreakdown       []WeeklyAnalytics  `json:"weekly_breakdown"`
}

// SubjectTime represents time spent on a subject
type SubjectTime struct {
	Subject    string  `json:"subject"`
	TimeSeconds int    `json:"time_seconds"`
	Percentage float64 `json:"percentage"`
}

// ContributionDay represents a single day in contribution graph
type ContributionDay struct {
	Date                  time.Time `json:"date"`
	FocusTimeSeconds      int       `json:"focus_time_seconds"`
	Level                 int       `json:"level"` // 0-4 intensity
	SessionsCount         int       `json:"sessions_count"`
}

// GetContributionLevel helper function
func GetContributionLevel(focusTimeSeconds int) int {
	if focusTimeSeconds == 0 {
		return 0
	} else if focusTimeSeconds < 1800 {
		return 1
	} else if focusTimeSeconds < 3600 {
		return 2
	} else if focusTimeSeconds < 7200 {
		return 3
	}
	return 4
}


