package entity

import (
	"time"
)

// AchievementType represents the type of achievement
type AchievementType string

const (
	// Streak achievements
	AchievementTypeFirstSession AchievementType = "first_session" // Hoàn thành session đầu tiên
	AchievementType3DayStreak   AchievementType = "streak_3"      // 3 ngày liên tục
	AchievementType7DayStreak   AchievementType = "streak_7"      // 7 ngày liên tục
	AchievementType30DayStreak  AchievementType = "streak_30"     // 30 ngày liên tục
	AchievementType100DayStreak AchievementType = "streak_100"    // 100 ngày liên tục
	AchievementType365DayStreak AchievementType = "streak_365"    // 365 ngày liên tục

	// Time achievements
	AchievementType10Hours   AchievementType = "time_10h"   // Tổng 10 giờ
	AchievementType50Hours   AchievementType = "time_50h"   // Tổng 50 giờ
	AchievementType100Hours  AchievementType = "time_100h"  // Tổng 100 giờ
	AchievementType500Hours  AchievementType = "time_500h"  // Tổng 500 giờ
	AchievementType1000Hours AchievementType = "time_1000h" // Tổng 1000 giờ

	// Session achievements
	AchievementType10Sessions   AchievementType = "sessions_10"   // 10 sessions
	AchievementType100Sessions  AchievementType = "sessions_100"  // 100 sessions
	AchievementType1000Sessions AchievementType = "sessions_1000" // 1000 sessions
	AchievementTypeMarathon     AchievementType = "marathon"      // 1 session > 2 giờ
	AchievementTypeEarlyBird    AchievementType = "early_bird"    // Focus trước 6am
	AchievementTypeNightOwl     AchievementType = "night_owl"     // Focus sau 10pm

	// Task achievements
	AchievementTypeTaskMaster    AchievementType = "task_master"    // 10 tasks hoàn thành
	AchievementTypeProductiveDay AchievementType = "productive_day" // 5 tasks trong 1 ngày
	AchievementTypeSubjectExpert AchievementType = "subject_expert" // 20 tasks cùng 1 môn

	// Social achievements
	AchievementTypeSocialLearner AchievementType = "social_learner" // Tham gia 5 rooms
	AchievementTypeRoomCreator   AchievementType = "room_creator"   // Tạo room đầu tiên
	AchievementTypeTop10         AchievementType = "top_10"         // Vào top 10 leaderboard

	// Legacy aliases for backward compatibility
	AchievementFirstSession  = AchievementTypeFirstSession
	AchievementStreak3       = AchievementType3DayStreak
	AchievementStreak7       = AchievementType7DayStreak
	AchievementStreak30      = AchievementType30DayStreak
	AchievementStreak100     = AchievementType100DayStreak
	AchievementStreak365     = AchievementType365DayStreak
	AchievementTime10H       = AchievementType10Hours
	AchievementTime50H       = AchievementType50Hours
	AchievementTime100H      = AchievementType100Hours
	AchievementTime500H      = AchievementType500Hours
	AchievementTime1000H     = AchievementType1000Hours
	AchievementSessions10    = AchievementType10Sessions
	AchievementSessions100   = AchievementType100Sessions
	AchievementSessions1000  = AchievementType1000Sessions
	AchievementMarathon      = AchievementTypeMarathon
	AchievementEarlyBird     = AchievementTypeEarlyBird
	AchievementNightOwl      = AchievementTypeNightOwl
	AchievementTaskMaster    = AchievementTypeTaskMaster
	AchievementProductiveDay = AchievementTypeProductiveDay
	AchievementSubjectExpert = AchievementTypeSubjectExpert
	AchievementSocialLearner = AchievementTypeSocialLearner
	AchievementRoomCreator   = AchievementTypeRoomCreator
	AchievementTop10         = AchievementTypeTop10
)

// Achievement represents a user achievement/badge
type Achievement struct {
	ID              int             `json:"id" db:"id"`
	UserID          string          `json:"user_id" db:"user_id"`
	AchievementType AchievementType `json:"achievement_type" db:"achievement_type"`
	AchievementName string          `json:"achievement_name" db:"achievement_name"`
	Description     *string         `json:"description,omitempty" db:"description"`
	IconURL         *string         `json:"icon_url,omitempty" db:"icon_url"`
	EarnedAt        time.Time       `json:"earned_at" db:"earned_at"`
}

// TableName returns the table name for Achievement
func (Achievement) TableName() string {
	return "user_achievements"
}

// AchievementDefinition defines the criteria for an achievement
type AchievementDefinition struct {
	Type        AchievementType
	Name        string
	Description string
	IconURL     string
	Criteria    func(userStats interface{}) bool // Function to check if criteria is met
}

// GetAchievementDefinitions returns all achievement definitions
func GetAchievementDefinitions() []AchievementDefinition {
	return []AchievementDefinition{
		{
			Type:        AchievementFirstSession,
			Name:        "First Steps",
			Description: "Hoàn thành phiên học đầu tiên",
			IconURL:     "/icons/achievements/first-session.svg",
		},
		{
			Type:        AchievementStreak3,
			Name:        "Getting Started",
			Description: "Học 3 ngày liên tục",
			IconURL:     "/icons/achievements/streak-3.svg",
		},
		{
			Type:        AchievementStreak7,
			Name:        "One Week Warrior",
			Description: "Học 7 ngày liên tục",
			IconURL:     "/icons/achievements/streak-7.svg",
		},
		{
			Type:        AchievementStreak30,
			Name:        "Monthly Master",
			Description: "Học 30 ngày liên tục",
			IconURL:     "/icons/achievements/streak-30.svg",
		},
		{
			Type:        AchievementStreak100,
			Name:        "Century Club",
			Description: "Học 100 ngày liên tục",
			IconURL:     "/icons/achievements/streak-100.svg",
		},
		{
			Type:        AchievementStreak365,
			Name:        "Year of Focus",
			Description: "Học 365 ngày liên tục",
			IconURL:     "/icons/achievements/streak-365.svg",
		},
		{
			Type:        AchievementTime10H,
			Name:        "10 Hours Club",
			Description: "Tổng cộng 10 giờ tập trung",
			IconURL:     "/icons/achievements/time-10h.svg",
		},
		{
			Type:        AchievementTime100H,
			Name:        "100 Hours Master",
			Description: "Tổng cộng 100 giờ tập trung",
			IconURL:     "/icons/achievements/time-100h.svg",
		},
		{
			Type:        AchievementSessions10,
			Name:        "Session Starter",
			Description: "Hoàn thành 10 phiên học",
			IconURL:     "/icons/achievements/sessions-10.svg",
		},
		{
			Type:        AchievementTaskMaster,
			Name:        "Task Master",
			Description: "Hoàn thành 10 tasks",
			IconURL:     "/icons/achievements/task-master.svg",
		},
		{
			Type:        AchievementSocialLearner,
			Name:        "Social Learner",
			Description: "Tham gia 5 phòng học khác nhau",
			IconURL:     "/icons/achievements/social-learner.svg",
		},
		{
			Type:        AchievementTop10,
			Name:        "Top 10",
			Description: "Lọt vào top 10 bảng xếp hạng",
			IconURL:     "/icons/achievements/top-10.svg",
		},
	}
}
