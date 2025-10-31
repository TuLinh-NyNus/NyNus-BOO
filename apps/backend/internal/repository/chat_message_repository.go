package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// ChatMessageRepository implements the ChatMessageRepository interface
type ChatMessageRepository struct {
	db *sql.DB
}

// NewChatMessageRepository creates a new chat message repository instance
func NewChatMessageRepository(db *sql.DB) interfaces.ChatMessageRepository {
	return &ChatMessageRepository{db: db}
}

// Create creates a new chat message
func (r *ChatMessageRepository) Create(ctx context.Context, roomID uuid.UUID, userID string, message string, messageType string) error {
	query := `
		INSERT INTO room_chat_messages (id, room_id, user_id, message, message_type, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	id := uuid.New()
	now := time.Now()

	_, err := r.db.ExecContext(ctx, query, id, roomID, userID, message, messageType, now)
	if err != nil {
		return fmt.Errorf("failed to create chat message: %w", err)
	}

	return nil
}

// ListRoomMessages retrieves chat messages for a room with pagination
func (r *ChatMessageRepository) ListRoomMessages(ctx context.Context, roomID uuid.UUID, limit, offset int) ([]interfaces.ChatMessage, error) {
	query := `
		SELECT 
			cm.id,
			cm.room_id,
			cm.user_id,
			cm.message,
			cm.message_type,
			cm.created_at,
			COALESCE(u.username, 'Unknown') as username,
			COALESCE(u.avatar_url, '') as avatar
		FROM room_chat_messages cm
		LEFT JOIN users u ON cm.user_id = u.id::text
		WHERE cm.room_id = $1
		ORDER BY cm.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, roomID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list room messages: %w", err)
	}
	defer rows.Close()

	var messages []interfaces.ChatMessage
	for rows.Next() {
		var msg interfaces.ChatMessage
		err := rows.Scan(
			&msg.ID,
			&msg.RoomID,
			&msg.UserID,
			&msg.Message,
			&msg.MessageType,
			&msg.CreatedAt,
			&msg.Username,
			&msg.Avatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chat message: %w", err)
		}
		messages = append(messages, msg)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating messages: %w", err)
	}

	// Reverse to get chronological order (oldest first)
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

// DeleteOldMessages deletes messages older than the specified date
func (r *ChatMessageRepository) DeleteOldMessages(ctx context.Context, beforeDate time.Time) error {
	query := `DELETE FROM room_chat_messages WHERE created_at < $1`

	result, err := r.db.ExecContext(ctx, query, beforeDate)
	if err != nil {
		return fmt.Errorf("failed to delete old messages: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	// Log the number of deleted messages (optional)
	_ = rows

	return nil
}


