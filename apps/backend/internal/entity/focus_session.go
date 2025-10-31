package entity

import (
	"time"

	"github.com/google/uuid"
)

// SessionType represents the type of focus session
type SessionType string

const (
	SessionTypeFocus      SessionType = "focus"       // Pomodoro focus (25 min default)
	SessionTypeShortBreak SessionType = "short_break" // Short break (5 min default)
	SessionTypeLongBreak  SessionType = "long_break"  // Long break (15 min default)
)

// FocusSession represents a focus/study session
type FocusSession struct {
	ID              uuid.UUID   `json:"id" db:"id"`
	UserID          string      `json:"user_id" db:"user_id"`
	RoomID          *uuid.UUID  `json:"room_id,omitempty" db:"room_id"`
	DurationSeconds int         `json:"duration_seconds" db:"duration_seconds"`
	SessionType     SessionType `json:"session_type" db:"session_type"`
	SubjectTag      *string     `json:"subject_tag,omitempty" db:"subject_tag"`
	TaskDescription *string     `json:"task_description,omitempty" db:"task_description"`
	Completed       bool        `json:"completed" db:"completed"`
	StartedAt       time.Time   `json:"started_at" db:"started_at"`
	EndedAt         *time.Time  `json:"ended_at,omitempty" db:"ended_at"`
	CreatedAt       time.Time   `json:"created_at" db:"created_at"`
}

// TableName returns the table name for FocusSession
func (FocusSession) TableName() string {
	return "focus_sessions"
}

// Validate validates the FocusSession entity
func (s *FocusSession) Validate() error {
	if s.UserID == "" {
		return ErrInvalidInput{Field: "user_id", Message: "User ID không được để trống"}
	}
	if s.DurationSeconds < 0 {
		return ErrInvalidInput{Field: "duration_seconds", Message: "Duration không được âm"}
	}
	if s.SessionType != SessionTypeFocus && s.SessionType != SessionTypeShortBreak && s.SessionType != SessionTypeLongBreak {
		return ErrInvalidInput{Field: "session_type", Message: "Session type không hợp lệ"}
	}
	return nil
}

// IsActive kiểm tra session có đang active không
func (s *FocusSession) IsActive() bool {
	return s.EndedAt == nil
}

// Duration tính thời lượng thực tế của session
func (s *FocusSession) Duration() time.Duration {
	if s.EndedAt == nil {
		return time.Since(s.StartedAt)
	}
	return s.EndedAt.Sub(s.StartedAt)
}

// GetDuration returns the duration in seconds
func (s *FocusSession) GetDuration() int {
	return int(s.Duration().Seconds())
}

