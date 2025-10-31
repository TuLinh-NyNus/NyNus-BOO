package interfaces

import (
	"context"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
)

// FocusRoomRepository defines the interface for focus room operations
type FocusRoomRepository interface {
	// Room Management
	Create(ctx context.Context, room *entity.FocusRoom) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.FocusRoom, error)
	List(ctx context.Context, filter RoomFilter) ([]*entity.FocusRoom, int, error)
	Update(ctx context.Context, room *entity.FocusRoom) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Participants
	AddParticipant(ctx context.Context, roomID uuid.UUID, userID string) error
	RemoveParticipant(ctx context.Context, roomID uuid.UUID, userID string) error
	GetParticipants(ctx context.Context, roomID uuid.UUID) ([]*entity.RoomParticipant, error)
	GetParticipantCount(ctx context.Context, roomID uuid.UUID) (int, error)
	UpdateParticipantStatus(ctx context.Context, roomID uuid.UUID, userID string, isFocusing bool, currentTask *string) error
}

// RoomFilter defines filters for listing rooms
type RoomFilter struct {
	RoomType    *entity.RoomType
	ActiveOnly  bool
	OwnerUserID *string
	Page        int
	PageSize    int
}

// FocusSessionRepository defines the interface for focus session operations
type FocusSessionRepository interface {
	Create(ctx context.Context, session *entity.FocusSession) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.FocusSession, error)
	GetActiveSession(ctx context.Context, userID string) (*entity.FocusSession, error)
	EndSession(ctx context.Context, id uuid.UUID, endTime time.Time) error
	ListUserSessions(ctx context.Context, userID string, limit, offset int) ([]*entity.FocusSession, error)
	GetDailySessions(ctx context.Context, userID string, date time.Time) ([]*entity.FocusSession, error)
	GetSessionsByDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*entity.FocusSession, error)
}

// UserStreakRepository defines the interface for user streak operations
type UserStreakRepository interface {
	Get(ctx context.Context, userID string) (*entity.UserStreak, error)
	Upsert(ctx context.Context, streak *entity.UserStreak) error
	IncrementStreak(ctx context.Context, userID string, date time.Time) error
	ResetStreak(ctx context.Context, userID string) error
	GetTopStreaks(ctx context.Context, limit int) ([]*entity.UserStreak, error)
}

// StudyAnalyticsRepository defines the interface for study analytics operations
type StudyAnalyticsRepository interface {
	GetDailyStats(ctx context.Context, userID string, date time.Time) (*entity.DailyAnalytics, error)
	UpsertDailyStats(ctx context.Context, stats *entity.DailyAnalytics) error
	GetWeeklyStats(ctx context.Context, userID string, startDate time.Time) ([]*entity.DailyAnalytics, error)
	GetMonthlyStats(ctx context.Context, userID string, year, month int) ([]*entity.DailyAnalytics, error)
	GetContributionGraph(ctx context.Context, userID string, days int) ([]*entity.ContributionDay, error)
	UpdateDailyStats(ctx context.Context, userID string, date time.Time, session *entity.FocusSession) error
}

// LeaderboardRepository defines the interface for leaderboard operations
type LeaderboardRepository interface {
	GetGlobalLeaderboard(ctx context.Context, period entity.LeaderboardPeriod, periodStart time.Time, limit int) ([]*entity.LeaderboardEntry, error)
	GetClassLeaderboard(ctx context.Context, classID int, period entity.LeaderboardPeriod, periodStart time.Time, limit int) ([]*entity.LeaderboardEntry, error)
	GetUserRank(ctx context.Context, userID string, period entity.LeaderboardPeriod, periodStart time.Time) (int, error)
	UpsertEntry(ctx context.Context, entry *entity.LeaderboardEntry) error
	RefreshLeaderboard(ctx context.Context, period entity.LeaderboardPeriod, periodStart, periodEnd time.Time) error
}

// FocusTaskRepository defines the interface for focus task operations
type FocusTaskRepository interface {
	Create(ctx context.Context, task *entity.FocusTask) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.FocusTask, error)
	ListUserTasks(ctx context.Context, userID string, filter TaskFilter) ([]*entity.FocusTask, int, error)
	Update(ctx context.Context, task *entity.FocusTask) error
	Delete(ctx context.Context, id uuid.UUID) error
	CompleteTask(ctx context.Context, id uuid.UUID) error
	IncrementPomodoro(ctx context.Context, id uuid.UUID) error
}

// TaskFilter defines filters for listing tasks
type TaskFilter struct {
	CompletedOnly bool
	ActiveOnly    bool
	SubjectTag    *string
	Page          int
	PageSize      int
}

// ChatMessageRepository defines the interface for chat message operations
type ChatMessageRepository interface {
	Create(ctx context.Context, roomID uuid.UUID, userID string, message string, messageType string) error
	ListRoomMessages(ctx context.Context, roomID uuid.UUID, limit, offset int) ([]ChatMessage, error)
	DeleteOldMessages(ctx context.Context, beforeDate time.Time) error
}

// ChatMessage represents a chat message (not full entity)
type ChatMessage struct {
	ID          uuid.UUID
	RoomID      uuid.UUID
	UserID      string
	Message     string
	MessageType string
	CreatedAt   time.Time
	Username    string
	Avatar      string
}

// AchievementRepository defines the interface for achievement operations
type AchievementRepository interface {
	GetUserAchievements(ctx context.Context, userID string) ([]*entity.Achievement, error)
	UnlockAchievement(ctx context.Context, userID string, achievementType entity.AchievementType) error
	HasAchievement(ctx context.Context, userID string, achievementType entity.AchievementType) (bool, error)
	CheckAndUnlock(ctx context.Context, userID string, stats interface{}) ([]*entity.Achievement, error)
}
