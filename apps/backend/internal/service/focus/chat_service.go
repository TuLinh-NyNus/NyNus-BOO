package focus

import (
	"context"
	"fmt"
	"strings"

	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// ChatService handles business logic for chat messages
type ChatService struct {
	chatRepo interfaces.ChatMessageRepository
	roomRepo interfaces.FocusRoomRepository
}

// NewChatService creates a new chat service instance
func NewChatService(
	chatRepo interfaces.ChatMessageRepository,
	roomRepo interfaces.FocusRoomRepository,
) *ChatService {
	return &ChatService{
		chatRepo: chatRepo,
		roomRepo: roomRepo,
	}
}

// SendMessage sends a chat message to a room
func (s *ChatService) SendMessage(ctx context.Context, roomID uuid.UUID, userID string, message string) error {
	// Validate message
	message = strings.TrimSpace(message)
	if message == "" {
		return fmt.Errorf("message cannot be empty")
	}

	if len(message) > 500 {
		return fmt.Errorf("message too long (max 500 characters)")
	}

	// Verify user is in room
	participants, err := s.roomRepo.GetParticipants(ctx, roomID)
	if err != nil {
		return fmt.Errorf("failed to verify room membership: %w", err)
	}

	isMember := false
	for _, p := range participants {
		if p.UserID == userID {
			isMember = true
			break
		}
	}

	if !isMember {
		return fmt.Errorf("user is not a member of this room")
	}

	// Sanitize message (basic XSS prevention)
	message = sanitizeMessage(message)

	// Create message
	if err := s.chatRepo.Create(ctx, roomID, userID, message, "text"); err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}

	return nil
}

// GetRoomMessages retrieves chat messages for a room
func (s *ChatService) GetRoomMessages(ctx context.Context, roomID uuid.UUID, limit, offset int) ([]interfaces.ChatMessage, error) {
	// Set default limit
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	messages, err := s.chatRepo.ListRoomMessages(ctx, roomID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}

	return messages, nil
}

// sanitizeMessage performs basic XSS sanitization
func sanitizeMessage(message string) string {
	// Replace common HTML/script tags
	message = strings.ReplaceAll(message, "<", "&lt;")
	message = strings.ReplaceAll(message, ">", "&gt;")
	message = strings.ReplaceAll(message, "\"", "&quot;")
	message = strings.ReplaceAll(message, "'", "&#39;")
	return message
}

// ValidateRateLimit checks if user has exceeded rate limit (would be called by middleware)
func (s *ChatService) ValidateRateLimit(userID string) error {
	// TODO: Implement Redis-based rate limiting
	// For now, just return nil
	// Rate limit: 10 messages per minute per user
	return nil
}


