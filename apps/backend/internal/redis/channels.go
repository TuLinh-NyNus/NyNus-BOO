package redis

import (
	"fmt"
	"strings"
	"time"
)

// Channel naming constants
// Implements task 1.2.1: Define channel naming convention
const (
	// ChannelUserNotification is the channel pattern for per-user notifications
	// Format: notifications:user:{userID}
	ChannelUserNotification = "notifications:user:%s"

	// ChannelSystemBroadcast is the channel for system-wide broadcasts
	ChannelSystemBroadcast = "notifications:system"

	// ChannelRoleBroadcast is the channel pattern for role-based broadcasts
	// Format: notifications:role:{role}
	ChannelRoleBroadcast = "notifications:role:%s"

	// ChannelAllNotifications is the pattern to subscribe to all notification channels
	ChannelAllNotifications = "notifications:*"
)

// ChannelType represents the type of notification channel
type ChannelType string

const (
	// ChannelTypeUser represents a user-specific channel
	ChannelTypeUser ChannelType = "user"

	// ChannelTypeSystem represents a system-wide channel
	ChannelTypeSystem ChannelType = "system"

	// ChannelTypeRole represents a role-based channel
	ChannelTypeRole ChannelType = "role"

	// ChannelTypeUnknown represents an unknown channel type
	ChannelTypeUnknown ChannelType = "unknown"
)

// NotificationMessage represents a message published to notification channels
// Implements task 1.2.3: Define message format
type NotificationMessage struct {
	ID        string                 `json:"id"`
	UserID    string                 `json:"user_id"`
	Type      string                 `json:"type"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
	IsRead    bool                   `json:"is_read,omitempty"`
	ExpiresAt *time.Time             `json:"expires_at,omitempty"`
}

// ChannelHelper provides helper functions for channel operations
type ChannelHelper struct {
	prefix string // Channel prefix for multi-tenant support
}

// NewChannelHelper creates a new channel helper with optional prefix
func NewChannelHelper(prefix string) *ChannelHelper {
	return &ChannelHelper{
		prefix: prefix,
	}
}

// GetUserNotificationChannel returns the channel name for a specific user
// Implements task 1.2.2: Helper function for user channels
func (h *ChannelHelper) GetUserNotificationChannel(userID string) string {
	if userID == "" {
		return ""
	}

	channel := fmt.Sprintf(ChannelUserNotification, userID)

	if h.prefix != "" {
		return fmt.Sprintf("%s:%s", h.prefix, channel)
	}

	return channel
}

// GetRoleNotificationChannel returns the channel name for a specific role
// Implements task 1.2.2: Helper function for role channels
func (h *ChannelHelper) GetRoleNotificationChannel(role string) string {
	if role == "" {
		return ""
	}

	// Normalize role name (uppercase)
	role = strings.ToUpper(role)

	channel := fmt.Sprintf(ChannelRoleBroadcast, role)

	if h.prefix != "" {
		return fmt.Sprintf("%s:%s", h.prefix, channel)
	}

	return channel
}

// GetSystemBroadcastChannel returns the system broadcast channel name
func (h *ChannelHelper) GetSystemBroadcastChannel() string {
	if h.prefix != "" {
		return fmt.Sprintf("%s:%s", h.prefix, ChannelSystemBroadcast)
	}

	return ChannelSystemBroadcast
}

// GetAllNotificationsPattern returns the pattern to subscribe to all notification channels
func (h *ChannelHelper) GetAllNotificationsPattern() string {
	if h.prefix != "" {
		return fmt.Sprintf("%s:%s", h.prefix, ChannelAllNotifications)
	}

	return ChannelAllNotifications
}

// ParseChannelPattern parses a channel name and extracts its type and ID
// Implements task 1.2.2: Parse channel pattern function
func (h *ChannelHelper) ParseChannelPattern(channel string) (ChannelType, string, error) {
	if channel == "" {
		return ChannelTypeUnknown, "", fmt.Errorf("channel name cannot be empty")
	}

	// Remove prefix if exists
	if h.prefix != "" {
		expectedPrefix := h.prefix + ":"
		if !strings.HasPrefix(channel, expectedPrefix) {
			return ChannelTypeUnknown, "", fmt.Errorf("channel does not have expected prefix: %s", h.prefix)
		}
		channel = strings.TrimPrefix(channel, expectedPrefix)
	}

	// Parse channel format: notifications:{type}:{id}
	parts := strings.Split(channel, ":")

	if len(parts) < 2 {
		return ChannelTypeUnknown, "", fmt.Errorf("invalid channel format: %s", channel)
	}

	if parts[0] != "notifications" {
		return ChannelTypeUnknown, "", fmt.Errorf("channel must start with 'notifications': %s", channel)
	}

	// System broadcast (no ID)
	if len(parts) == 2 && parts[1] == "system" {
		return ChannelTypeSystem, "", nil
	}

	// User or Role channel (with ID)
	if len(parts) < 3 {
		return ChannelTypeUnknown, "", fmt.Errorf("invalid channel format for typed channel: %s", channel)
	}

	channelType := ChannelType(parts[1])
	id := parts[2]

	switch channelType {
	case ChannelTypeUser, ChannelTypeRole:
		return channelType, id, nil
	default:
		return ChannelTypeUnknown, id, fmt.Errorf("unknown channel type: %s", channelType)
	}
}

// IsValidChannelName validates if a channel name follows the expected format
func (h *ChannelHelper) IsValidChannelName(channel string) bool {
	_, _, err := h.ParseChannelPattern(channel)
	return err == nil
}

// GetChannelsByUser returns all possible channels a user should subscribe to
// This includes their personal channel and role-based channels
func (h *ChannelHelper) GetChannelsByUser(userID string, role string) []string {
	channels := []string{}

	// Add user-specific channel
	if userChannel := h.GetUserNotificationChannel(userID); userChannel != "" {
		channels = append(channels, userChannel)
	}

	// Add role-based channel
	if roleChannel := h.GetRoleNotificationChannel(role); roleChannel != "" {
		channels = append(channels, roleChannel)
	}

	// Add system broadcast channel
	channels = append(channels, h.GetSystemBroadcastChannel())

	return channels
}

// ValidateNotificationMessage validates a notification message
func ValidateNotificationMessage(msg *NotificationMessage) error {
	if msg == nil {
		return fmt.Errorf("message cannot be nil")
	}

	if msg.ID == "" {
		return fmt.Errorf("message ID cannot be empty")
	}

	if msg.UserID == "" {
		return fmt.Errorf("message user ID cannot be empty")
	}

	if msg.Type == "" {
		return fmt.Errorf("message type cannot be empty")
	}

	if msg.Title == "" {
		return fmt.Errorf("message title cannot be empty")
	}

	if msg.Message == "" {
		return fmt.Errorf("message content cannot be empty")
	}

	if msg.Timestamp.IsZero() {
		return fmt.Errorf("message timestamp cannot be zero")
	}

	return nil
}

// CreateNotificationMessage creates a new notification message with default values
func CreateNotificationMessage(userID, notifType, title, message string, data map[string]interface{}) *NotificationMessage {
	return &NotificationMessage{
		UserID:    userID,
		Type:      notifType,
		Title:     title,
		Message:   message,
		Data:      data,
		Timestamp: time.Now(),
		IsRead:    false,
	}
}

// Global channel helper instance (can be initialized with custom prefix)
var DefaultChannelHelper = NewChannelHelper("")

// Convenience functions using default helper

// GetUserNotificationChannel returns the channel name for a specific user using default helper
func GetUserNotificationChannel(userID string) string {
	return DefaultChannelHelper.GetUserNotificationChannel(userID)
}

// GetRoleNotificationChannel returns the channel name for a specific role using default helper
func GetRoleNotificationChannel(role string) string {
	return DefaultChannelHelper.GetRoleNotificationChannel(role)
}

// GetSystemBroadcastChannel returns the system broadcast channel using default helper
func GetSystemBroadcastChannel() string {
	return DefaultChannelHelper.GetSystemBroadcastChannel()
}

// ParseChannelPattern parses a channel name using default helper
func ParseChannelPattern(channel string) (ChannelType, string, error) {
	return DefaultChannelHelper.ParseChannelPattern(channel)
}
