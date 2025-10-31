package entity

import (
	"time"

	"github.com/google/uuid"
)

// RoomType represents the type of focus room
type RoomType string

const (
	RoomTypePublic  RoomType = "public"  // Công khai, ai cũng join được
	RoomTypePrivate RoomType = "private" // Riêng tư, cần mời
	RoomTypeClass   RoomType = "class"   // Phòng lớp học
)

// RoomSettings chứa cài đặt cho phòng học
type RoomSettings struct {
	FocusDuration      int  `json:"focus_duration"`       // seconds (default: 1500 = 25 min)
	ShortBreakDuration int  `json:"short_break_duration"` // seconds (default: 300 = 5 min)
	LongBreakDuration  int  `json:"long_break_duration"`  // seconds (default: 900 = 15 min)
	AutoStartBreak     bool `json:"auto_start_break"`     // Tự động chuyển sang break
	SoundEnabled       bool `json:"sound_enabled"`        // Cho phép âm thanh
}

// DefaultRoomSettings trả về settings mặc định
func DefaultRoomSettings() RoomSettings {
	return RoomSettings{
		FocusDuration:      1500, // 25 phút
		ShortBreakDuration: 300,  // 5 phút
		LongBreakDuration:  900,  // 15 phút
		AutoStartBreak:     false,
		SoundEnabled:       true,
	}
}

// FocusRoom represents a focus room/study room
type FocusRoom struct {
	ID              uuid.UUID    `json:"id" db:"id"`
	Name            string       `json:"name" db:"name"`
	Description     string       `json:"description" db:"description"`
	OwnerUserID     string       `json:"owner_user_id" db:"owner_user_id"`
	RoomType        RoomType     `json:"room_type" db:"room_type"`
	MaxParticipants int          `json:"max_participants" db:"max_participants"`
	IsActive        bool         `json:"is_active" db:"is_active"`
	Settings        RoomSettings `json:"settings" db:"settings"` // JSONB in database
	CreatedAt       time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at" db:"updated_at"`
}

// TableName returns the table name for FocusRoom
func (FocusRoom) TableName() string {
	return "focus_rooms"
}

// Validate validates the FocusRoom entity
func (r *FocusRoom) Validate() error {
	if r.Name == "" {
		return ErrInvalidInput{Field: "name", Message: "Tên phòng không được để trống"}
	}
	if len(r.Name) > 255 {
		return ErrInvalidInput{Field: "name", Message: "Tên phòng không được quá 255 ký tự"}
	}
	if r.OwnerUserID == "" {
		return ErrInvalidInput{Field: "owner_user_id", Message: "Owner user ID không được để trống"}
	}
	if r.MaxParticipants < 1 || r.MaxParticipants > 100 {
		return ErrInvalidInput{Field: "max_participants", Message: "Số người tối đa phải từ 1-100"}
	}
	if r.RoomType != RoomTypePublic && r.RoomType != RoomTypePrivate && r.RoomType != RoomTypeClass {
		return ErrInvalidInput{Field: "room_type", Message: "Room type không hợp lệ"}
	}
	return nil
}

// RoomParticipant represents a participant in a focus room
type RoomParticipant struct {
	ID             int       `json:"id" db:"id"`
	RoomID         uuid.UUID `json:"room_id" db:"room_id"`
	UserID         string    `json:"user_id" db:"user_id"`
	JoinedAt       time.Time `json:"joined_at" db:"joined_at"`
	IsFocusing     bool      `json:"is_focusing" db:"is_focusing"`
	CurrentTask    *string   `json:"current_task,omitempty" db:"current_task"`
	LastActivityAt time.Time `json:"last_activity_at" db:"last_activity_at"`
}

// TableName returns the table name for RoomParticipant
func (RoomParticipant) TableName() string {
	return "room_participants"
}


