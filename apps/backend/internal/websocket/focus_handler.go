package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"exam-bank-system/apps/backend/internal/service/focus"
	"github.com/google/uuid"
)

// FocusRoomHandler handles Focus Room specific WebSocket events
type FocusRoomHandler struct {
	chatService *focus.ChatService
	roomRepo    interfaces.FocusRoomRepository
	pubsub      PubSubPublisher
	presence    *PresenceTracker
	logger      *log.Logger
}

// PubSubPublisher defines interface for Redis Pub/Sub
type PubSubPublisher interface {
	Publish(ctx context.Context, channel string, message interface{}) error
}

// NewFocusRoomHandler creates a new Focus Room handler
func NewFocusRoomHandler(
	chatService *focus.ChatService,
	roomRepo interfaces.FocusRoomRepository,
	pubsub PubSubPublisher,
	presence *PresenceTracker,
) *FocusRoomHandler {
	return &FocusRoomHandler{
		chatService: chatService,
		roomRepo:    roomRepo,
		pubsub:      pubsub,
		presence:    presence,
		logger:      log.New(log.Writer(), "[Focus Room Handler] ", log.LstdFlags),
	}
}

// FocusRoomMessage represents messages for Focus Rooms
type FocusRoomMessage struct {
	Type    string                 `json:"type"`
	RoomID  string                 `json:"room_id,omitempty"`
	Payload map[string]interface{} `json:"payload,omitempty"`
}

// HandleJoinRoom handles user joining a room
func (h *FocusRoomHandler) HandleJoinRoom(ctx context.Context, client *Client, roomID string) error {
	// Parse room UUID
	roomUUID, err := uuid.Parse(roomID)
	if err != nil {
		return fmt.Errorf("invalid room ID: %w", err)
	}

	// Verify room exists
	room, err := h.roomRepo.GetByID(ctx, roomUUID)
	if err != nil {
		return fmt.Errorf("room not found: %w", err)
	}

	// Add user to presence tracker
	if err := h.presence.JoinRoom(ctx, roomID, client.UserID); err != nil {
		h.logger.Printf("[WARN] Failed to add user %s to presence: %v", client.UserID, err)
	}

	// Get online users
	onlineUsers, err := h.presence.GetOnlineUsers(ctx, roomID)
	if err != nil {
		h.logger.Printf("[WARN] Failed to get online users: %v", err)
		onlineUsers = []string{client.UserID}
	}

	// Broadcast "user_joined" event to room
	joinEvent := map[string]interface{}{
		"type":    "user_joined",
		"room_id": roomID,
		"user_id": client.UserID,
		"data": map[string]interface{}{
			"user_id":           client.UserID,
			"participant_count": len(onlineUsers),
			"online_users":      onlineUsers,
		},
		"timestamp": getCurrentTimestamp(),
	}

	channel := fmt.Sprintf("room:%s:events", roomID)
	if err := h.pubsub.Publish(ctx, channel, joinEvent); err != nil {
		h.logger.Printf("[ERROR] Failed to publish join event: %v", err)
	}

	h.logger.Printf("[INFO] User %s joined room %s (%s)", client.UserID, room.Name, roomID)

	return nil
}

// HandleLeaveRoom handles user leaving a room
func (h *FocusRoomHandler) HandleLeaveRoom(ctx context.Context, client *Client, roomID string) error {
	// Remove user from presence tracker
	if err := h.presence.LeaveRoom(ctx, roomID, client.UserID); err != nil {
		h.logger.Printf("[WARN] Failed to remove user %s from presence: %v", client.UserID, err)
	}

	// Get remaining online users
	onlineUsers, err := h.presence.GetOnlineUsers(ctx, roomID)
	if err != nil {
		h.logger.Printf("[WARN] Failed to get online users: %v", err)
		onlineUsers = []string{}
	}

	// Broadcast "user_left" event to room
	leaveEvent := map[string]interface{}{
		"type":    "user_left",
		"room_id": roomID,
		"user_id": client.UserID,
		"data": map[string]interface{}{
			"user_id":           client.UserID,
			"participant_count": len(onlineUsers),
			"online_users":      onlineUsers,
		},
		"timestamp": getCurrentTimestamp(),
	}

	channel := fmt.Sprintf("room:%s:events", roomID)
	if err := h.pubsub.Publish(ctx, channel, leaveEvent); err != nil {
		h.logger.Printf("[ERROR] Failed to publish leave event: %v", err)
	}

	h.logger.Printf("[INFO] User %s left room %s", client.UserID, roomID)

	return nil
}

// HandleSendMessage handles sending a chat message
func (h *FocusRoomHandler) HandleSendMessage(ctx context.Context, client *Client, payload map[string]interface{}) error {
	// Extract room ID and message
	roomIDStr, ok := payload["room_id"].(string)
	if !ok {
		return fmt.Errorf("room_id is required")
	}

	messageText, ok := payload["message"].(string)
	if !ok {
		return fmt.Errorf("message is required")
	}

	// Parse room UUID
	roomUUID, err := uuid.Parse(roomIDStr)
	if err != nil {
		return fmt.Errorf("invalid room ID: %w", err)
	}

	// Send message via chat service (includes validation & sanitization)
	if err := h.chatService.SendMessage(ctx, roomUUID, client.UserID, messageText); err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}

	// Broadcast message to room via Redis Pub/Sub
	messageEvent := map[string]interface{}{
		"type":    "new_message",
		"room_id": roomIDStr,
		"data": map[string]interface{}{
			"user_id":   client.UserID,
			"message":   messageText,
			"timestamp": getCurrentTimestamp(),
		},
		"timestamp": getCurrentTimestamp(),
	}

	channel := fmt.Sprintf("room:%s:messages", roomIDStr)
	if err := h.pubsub.Publish(ctx, channel, messageEvent); err != nil {
		return fmt.Errorf("failed to broadcast message: %w", err)
	}

	h.logger.Printf("[INFO] User %s sent message to room %s", client.UserID, roomIDStr)

	return nil
}

// HandleFocusStart handles user starting focus session
func (h *FocusRoomHandler) HandleFocusStart(ctx context.Context, client *Client, payload map[string]interface{}) error {
	roomIDStr, ok := payload["room_id"].(string)
	if !ok {
		return fmt.Errorf("room_id is required")
	}

	task, _ := payload["task"].(string) // Optional

	// Update presence status
	if err := h.presence.UpdateStatus(ctx, roomIDStr, client.UserID, "focusing"); err != nil {
		h.logger.Printf("[WARN] Failed to update focus status: %v", err)
	}

	// Broadcast focus_started event
	focusEvent := map[string]interface{}{
		"type":    "focus_started",
		"room_id": roomIDStr,
		"data": map[string]interface{}{
			"user_id": client.UserID,
			"task":    task,
		},
		"timestamp": getCurrentTimestamp(),
	}

	channel := fmt.Sprintf("room:%s:events", roomIDStr)
	if err := h.pubsub.Publish(ctx, channel, focusEvent); err != nil {
		h.logger.Printf("[ERROR] Failed to publish focus start event: %v", err)
	}

	h.logger.Printf("[INFO] User %s started focusing in room %s", client.UserID, roomIDStr)

	return nil
}

// HandleFocusEnd handles user ending focus session
func (h *FocusRoomHandler) HandleFocusEnd(ctx context.Context, client *Client, payload map[string]interface{}) error {
	roomIDStr, ok := payload["room_id"].(string)
	if !ok {
		return fmt.Errorf("room_id is required")
	}

	duration, _ := payload["duration"].(float64) // Optional

	// Update presence status back to online
	if err := h.presence.UpdateStatus(ctx, roomIDStr, client.UserID, "online"); err != nil {
		h.logger.Printf("[WARN] Failed to update online status: %v", err)
	}

	// Broadcast focus_ended event
	focusEvent := map[string]interface{}{
		"type":    "focus_ended",
		"room_id": roomIDStr,
		"data": map[string]interface{}{
			"user_id":  client.UserID,
			"duration": duration,
		},
		"timestamp": getCurrentTimestamp(),
	}

	channel := fmt.Sprintf("room:%s:events", roomIDStr)
	if err := h.pubsub.Publish(ctx, channel, focusEvent); err != nil {
		h.logger.Printf("[ERROR] Failed to publish focus end event: %v", err)
	}

	h.logger.Printf("[INFO] User %s ended focus session in room %s", client.UserID, roomIDStr)

	return nil
}

// BroadcastToRoom broadcasts a message to all users in a room
func (h *FocusRoomHandler) BroadcastToRoom(ctx context.Context, roomID string, message interface{}) error {
	channel := fmt.Sprintf("room:%s:events", roomID)
	return h.pubsub.Publish(ctx, channel, message)
}

// getCurrentTimestamp returns current Unix timestamp in milliseconds
func getCurrentTimestamp() int64 {
	return time.Now().UnixMilli()
}

// SerializeMessage serializes a message to JSON bytes
func SerializeMessage(message interface{}) ([]byte, error) {
	return json.Marshal(message)
}
