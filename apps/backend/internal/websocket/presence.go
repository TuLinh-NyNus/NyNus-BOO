package websocket

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

// PresenceTracker tracks online users per room using Redis.
type PresenceTracker struct {
	client *redis.Client
	logger *log.Logger
	ttl    time.Duration
}

// NewPresenceTracker creates a new presence tracker.
func NewPresenceTracker(client *redis.Client) *PresenceTracker {
	return &PresenceTracker{
		client: client,
		logger: log.New(log.Writer(), "[Presence Tracker] ", log.LstdFlags),
		ttl:    60 * time.Second, // 60 seconds TTL
	}
}

// JoinRoom adds a user to room's online users set.
func (p *PresenceTracker) JoinRoom(ctx context.Context, roomID, userID string) error {
	key := fmt.Sprintf("room:%s:online", roomID)

	// Add user to Redis SET
	if err := p.client.SAdd(ctx, key, userID).Err(); err != nil {
		return fmt.Errorf("failed to add user to room: %w", err)
	}

	// Set TTL on the key
	if err := p.client.Expire(ctx, key, p.ttl).Err(); err != nil {
		p.logger.Printf("[WARN] Failed to set TTL for room %s: %v", roomID, err)
	}

	// Also set individual user presence with status
	statusKey := fmt.Sprintf("room:%s:user:%s:status", roomID, userID)
	if err := p.client.Set(ctx, statusKey, "online", p.ttl).Err(); err != nil {
		p.logger.Printf("[WARN] Failed to set user status: %v", err)
	}

	p.logger.Printf("[INFO] User %s joined room %s", userID, roomID)

	return nil
}

// LeaveRoom removes a user from room's online users set.
func (p *PresenceTracker) LeaveRoom(ctx context.Context, roomID, userID string) error {
	key := fmt.Sprintf("room:%s:online", roomID)

	// Remove user from Redis SET
	if err := p.client.SRem(ctx, key, userID).Err(); err != nil {
		return fmt.Errorf("failed to remove user from room: %w", err)
	}

	// Delete user status
	statusKey := fmt.Sprintf("room:%s:user:%s:status", roomID, userID)
	if err := p.client.Del(ctx, statusKey).Err(); err != nil {
		p.logger.Printf("[WARN] Failed to delete user status: %v", err)
	}

	p.logger.Printf("[INFO] User %s left room %s", userID, roomID)

	return nil
}

// GetOnlineUsers returns list of online users in a room.
func (p *PresenceTracker) GetOnlineUsers(ctx context.Context, roomID string) ([]string, error) {
	key := fmt.Sprintf("room:%s:online", roomID)

	// Get all members from Redis SET
	users, err := p.client.SMembers(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return []string{}, nil
		}
		return nil, fmt.Errorf("failed to get online users: %w", err)
	}

	return users, nil
}

// GetOnlineCount returns count of online users in a room.
func (p *PresenceTracker) GetOnlineCount(ctx context.Context, roomID string) (int, error) {
	key := fmt.Sprintf("room:%s:online", roomID)

	count, err := p.client.SCard(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return 0, nil
		}
		return 0, fmt.Errorf("failed to get online count: %w", err)
	}

	return int(count), nil
}

// IsUserOnline checks if a user is online in a room.
func (p *PresenceTracker) IsUserOnline(ctx context.Context, roomID, userID string) (bool, error) {
	key := fmt.Sprintf("room:%s:online", roomID)

	isMember, err := p.client.SIsMember(ctx, key, userID).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check user presence: %w", err)
	}

	return isMember, nil
}

// UpdateStatus updates user's status in a room (online, focusing, away).
func (p *PresenceTracker) UpdateStatus(ctx context.Context, roomID, userID, status string) error {
	statusKey := fmt.Sprintf("room:%s:user:%s:status", roomID, userID)

	if err := p.client.Set(ctx, statusKey, status, p.ttl).Err(); err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}

	p.logger.Printf("[INFO] User %s status updated to '%s' in room %s", userID, status, roomID)

	return nil
}

// GetUserStatus returns user's current status in a room.
func (p *PresenceTracker) GetUserStatus(ctx context.Context, roomID, userID string) (string, error) {
	statusKey := fmt.Sprintf("room:%s:user:%s:status", roomID, userID)

	status, err := p.client.Get(ctx, statusKey).Result()
	if err != nil {
		if err == redis.Nil {
			return "offline", nil
		}
		return "", fmt.Errorf("failed to get user status: %w", err)
	}

	return status, nil
}

// RefreshPresence refreshes TTL for user's presence (heartbeat).
func (p *PresenceTracker) RefreshPresence(ctx context.Context, roomID, userID string) error {
	// Refresh room set TTL
	roomKey := fmt.Sprintf("room:%s:online", roomID)
	if err := p.client.Expire(ctx, roomKey, p.ttl).Err(); err != nil {
		p.logger.Printf("[WARN] Failed to refresh room presence TTL: %v", err)
	}

	// Refresh user status TTL
	statusKey := fmt.Sprintf("room:%s:user:%s:status", roomID, userID)
	if err := p.client.Expire(ctx, statusKey, p.ttl).Err(); err != nil {
		return fmt.Errorf("failed to refresh user presence: %w", err)
	}

	return nil
}

// CleanupRoom removes all presence data for a room.
func (p *PresenceTracker) CleanupRoom(ctx context.Context, roomID string) error {
	// Get all online users first
	users, err := p.GetOnlineUsers(ctx, roomID)
	if err != nil {
		return err
	}

	// Delete all user status keys
	for _, userID := range users {
		statusKey := fmt.Sprintf("room:%s:user:%s:status", roomID, userID)
		if err := p.client.Del(ctx, statusKey).Err(); err != nil {
			p.logger.Printf("[WARN] Failed to delete status for user %s: %v", userID, err)
		}
	}

	// Delete room online users set
	roomKey := fmt.Sprintf("room:%s:online", roomID)
	if err := p.client.Del(ctx, roomKey).Err(); err != nil {
		return fmt.Errorf("failed to delete room presence: %w", err)
	}

	p.logger.Printf("[INFO] Cleaned up presence for room %s", roomID)

	return nil
}

// GetAllRoomPresence returns presence data for all rooms (admin/monitoring).
func (p *PresenceTracker) GetAllRoomPresence(ctx context.Context) (map[string][]string, error) {
	// Scan for all room:*:online keys
	var cursor uint64
	var keys []string

	for {
		var scanKeys []string
		var err error

		scanKeys, cursor, err = p.client.Scan(ctx, cursor, "room:*:online", 100).Result()
		if err != nil {
			return nil, fmt.Errorf("failed to scan room keys: %w", err)
		}

		keys = append(keys, scanKeys...)

		if cursor == 0 {
			break
		}
	}

	// Get online users for each room
	presence := make(map[string][]string)
	for _, key := range keys {
		users, err := p.client.SMembers(ctx, key).Result()
		if err != nil {
			p.logger.Printf("[WARN] Failed to get members for key %s: %v", key, err)
			continue
		}
		presence[key] = users
	}

	return presence, nil
}

// SetTTL sets the TTL duration for presence tracking.
func (p *PresenceTracker) SetTTL(ttl time.Duration) {
	p.ttl = ttl
	p.logger.Printf("[INFO] Presence TTL set to %v", ttl)
}
