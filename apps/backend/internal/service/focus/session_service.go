package focus

import (
	"context"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// SessionService handles business logic for focus sessions
type SessionService struct {
	sessionRepo     interfaces.FocusSessionRepository
	streakRepo      interfaces.UserStreakRepository
	analyticsRepo   interfaces.StudyAnalyticsRepository
	achievementRepo interfaces.AchievementRepository
}

// NewSessionService creates a new session service instance
func NewSessionService(
	sessionRepo interfaces.FocusSessionRepository,
	streakRepo interfaces.UserStreakRepository,
	analyticsRepo interfaces.StudyAnalyticsRepository,
	achievementRepo interfaces.AchievementRepository,
) *SessionService {
	return &SessionService{
		sessionRepo:     sessionRepo,
		streakRepo:      streakRepo,
		analyticsRepo:   analyticsRepo,
		achievementRepo: achievementRepo,
	}
}

// SessionStats represents session completion stats
type SessionStats struct {
	Session         *entity.FocusSession
	NewStreak       int
	NewAchievements []*entity.Achievement
	TodayFocusTime  int
	WeeklyFocusTime int
}

// StartSession starts a new focus session
func (s *SessionService) StartSession(ctx context.Context, userID string, sessionType entity.SessionType, roomID *uuid.UUID, task *string, subjectTag *string) (*entity.FocusSession, error) {
	// Check if user already has an active session
	activeSession, err := s.sessionRepo.GetActiveSession(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check active session: %w", err)
	}
	if activeSession != nil {
		return nil, fmt.Errorf("user already has an active session")
	}

	// Create new session
	session := &entity.FocusSession{
		ID:              uuid.New(),
		UserID:          userID,
		RoomID:          roomID,
		SessionType:     sessionType,
		TaskDescription: task,
		SubjectTag:      subjectTag,
		StartedAt:       time.Now(),
		Completed:       false,
	}

	// Validate
	if err := session.Validate(); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Save session
	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return session, nil
}

// EndSession ends an active focus session and updates stats
func (s *SessionService) EndSession(ctx context.Context, sessionID uuid.UUID, userID string) (*SessionStats, error) {
	// Get session
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, fmt.Errorf("session does not belong to user")
	}

	// Check if already ended
	if session.EndedAt != nil {
		return nil, fmt.Errorf("session already ended")
	}

	// End session
	now := time.Now()
	if err := s.sessionRepo.EndSession(ctx, sessionID, now); err != nil {
		return nil, fmt.Errorf("failed to end session: %w", err)
	}

	// Update session object
	session.EndedAt = &now
	session.Completed = true
	session.DurationSeconds = session.GetDuration()

	// Update streak (only for focus sessions)
	var newStreak int
	if session.SessionType == entity.SessionTypeFocus {
		if err := s.streakRepo.IncrementStreak(ctx, userID, now); err != nil {
			// Log error but don't fail
			fmt.Printf("failed to update streak: %v\n", err)
		}

		streak, err := s.streakRepo.Get(ctx, userID)
		if err == nil {
			newStreak = streak.CurrentStreak
		}
	}

	// Update analytics
	if err := s.analyticsRepo.UpdateDailyStats(ctx, userID, now, session); err != nil {
		// Log error but don't fail
		fmt.Printf("failed to update analytics: %v\n", err)
	}

	// Check and unlock achievements
	streak, err := s.streakRepo.Get(ctx, userID)
	var newAchievements []*entity.Achievement
	if err == nil {
		newAchievements, _ = s.achievementRepo.CheckAndUnlock(ctx, userID, streak)
	}

	// Get today's focus time
	todayStats, _ := s.analyticsRepo.GetDailyStats(ctx, userID, now)
	todayFocusTime := 0
	if todayStats != nil {
		todayFocusTime = todayStats.TotalFocusTimeSeconds
	}

	// Get weekly focus time
	weekStart := now.AddDate(0, 0, -int(now.Weekday()))
	weeklyStats, _ := s.analyticsRepo.GetWeeklyStats(ctx, userID, weekStart)
	weeklyFocusTime := 0
	for _, day := range weeklyStats {
		weeklyFocusTime += day.TotalFocusTimeSeconds
	}

	return &SessionStats{
		Session:         session,
		NewStreak:       newStreak,
		NewAchievements: newAchievements,
		TodayFocusTime:  todayFocusTime,
		WeeklyFocusTime: weeklyFocusTime,
	}, nil
}

// PauseSession pauses an active session (not implemented - can extend later)
func (s *SessionService) PauseSession(ctx context.Context, sessionID uuid.UUID, userID string) error {
	return fmt.Errorf("pause not implemented yet")
}

// GetActiveSession retrieves the active session for a user
func (s *SessionService) GetActiveSession(ctx context.Context, userID string) (*entity.FocusSession, error) {
	session, err := s.sessionRepo.GetActiveSession(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active session: %w", err)
	}

	return session, nil
}

// GetUserSessions retrieves session history for a user
func (s *SessionService) GetUserSessions(ctx context.Context, userID string, limit, offset int) ([]*entity.FocusSession, error) {
	sessions, err := s.sessionRepo.ListUserSessions(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}

	return sessions, nil
}
