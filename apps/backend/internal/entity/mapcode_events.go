package entity

import "time"

// MapCodeEvent represents different types of MapCode events
type MapCodeEvent string

const (
	MapCodeEventVersionCreated   MapCodeEvent = "VERSION_CREATED"
	MapCodeEventVersionActivated MapCodeEvent = "VERSION_ACTIVATED"
	MapCodeEventVersionDeleted   MapCodeEvent = "VERSION_DELETED"
	MapCodeEventCacheInvalidated MapCodeEvent = "CACHE_INVALIDATED"
)

// MapCodeVersionEvent represents an event related to MapCode version changes
type MapCodeVersionEvent struct {
	Event     MapCodeEvent `json:"event"`
	VersionID string       `json:"version_id"`
	Timestamp time.Time    `json:"timestamp"`
	UserID    string       `json:"user_id"`
	Details   string       `json:"details"` // Additional context
}

// NewMapCodeVersionEvent creates a new version event
func NewMapCodeVersionEvent(event MapCodeEvent, versionID, userID, details string) *MapCodeVersionEvent {
	return &MapCodeVersionEvent{
		Event:     event,
		VersionID: versionID,
		Timestamp: time.Now(),
		UserID:    userID,
		Details:   details,
	}
}


