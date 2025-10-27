package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"exam-bank-system/apps/backend/internal/redis"
)

// RedisBridge connects Redis Pub/Sub with WebSocket manager
// Implements task 3.1.1: Create RedisBridge struct
type RedisBridge struct {
	redisPubSub     *redis.PubSubClient
	wsManager       *ConnectionManager
	channelHelper   *redis.ChannelHelper
	logger          *log.Logger
	
	// Message deduplication (task 3.1.4)
	recentMessages  map[string]time.Time
	recentMessagesMu sync.RWMutex
	maxRecentMessages int
	
	// Retry configuration
	maxRetries      int
	retryDelay      time.Duration
	
	ctx             context.Context
	cancel          context.CancelFunc
}

// NewRedisBridge creates a new Redis-WebSocket bridge
func NewRedisBridge(
	redisPubSub *redis.PubSubClient,
	wsManager *ConnectionManager,
	channelHelper *redis.ChannelHelper,
) *RedisBridge {
	ctx, cancel := context.WithCancel(context.Background())
	
	return &RedisBridge{
		redisPubSub:       redisPubSub,
		wsManager:         wsManager,
		channelHelper:     channelHelper,
		logger:            log.New(log.Writer(), "[Redis Bridge] ", log.LstdFlags),
		recentMessages:    make(map[string]time.Time),
		maxRecentMessages: 1000, // Store last 1000 message IDs
		maxRetries:        3,
		retryDelay:        100 * time.Millisecond,
		ctx:               ctx,
		cancel:            cancel,
	}
}

// Start starts the bridge
// Implements task 3.1.2: Subscribe to Redis channels and handle messages
func (b *RedisBridge) Start(workerPoolSize int) error {
	b.logger.Printf("[INFO] Starting Redis-WebSocket bridge")
	
	// Subscribe to all notification channels (task 3.1.2)
	pattern := b.channelHelper.GetAllNotificationsPattern()
	err := b.redisPubSub.SubscribePattern(b.ctx, pattern)
	if err != nil {
		return fmt.Errorf("failed to subscribe to notifications pattern: %w", err)
	}
	
	// Register message handler
	b.redisPubSub.RegisterHandler(pattern, redis.MessageHandlerFunc(b.handleRedisMessage))
	
	// Start Redis Pub/Sub listener with worker pool
	if err := b.redisPubSub.Start(workerPoolSize); err != nil {
		return fmt.Errorf("failed to start Redis Pub/Sub listener: %w", err)
	}
	
	// Start cleanup routine for recent messages cache
	go b.cleanupRecentMessages()
	
	b.logger.Printf("[INFO] Bridge started with %d workers", workerPoolSize)
	
	return nil
}

// handleRedisMessage handles messages from Redis Pub/Sub
// Implements task 3.1.2: Handle incoming Redis messages, parse, and route
func (b *RedisBridge) handleRedisMessage(channel string, payload []byte) error {
	// Parse notification message
	var notification redis.NotificationMessage
	if err := json.Unmarshal(payload, &notification); err != nil {
		b.logger.Printf("[ERROR] Failed to unmarshal notification from channel '%s': %v", channel, err)
		return fmt.Errorf("invalid notification format: %w", err)
	}
	
	// Validate notification
	if err := redis.ValidateNotificationMessage(&notification); err != nil {
		b.logger.Printf("[ERROR] Invalid notification message: %v", err)
		return fmt.Errorf("validation failed: %w", err)
	}
	
	// Check for duplicate (task 3.1.4: Message deduplication)
	if b.isDuplicate(notification.ID) {
		b.logger.Printf("[DEBUG] Duplicate notification detected: %s", notification.ID)
		return nil
	}
	
	// Transform message for WebSocket (task 3.1.3)
	wsMessage, err := b.transformMessage(&notification)
	if err != nil {
		b.logger.Printf("[ERROR] Failed to transform message: %v", err)
		return fmt.Errorf("transformation failed: %w", err)
	}
	
	// Route to WebSocket connections (task 3.1.2)
	if err := b.routeToWebSocket(channel, wsMessage); err != nil {
		// Retry delivery (task 3.1.4)
		b.logger.Printf("[WARN] Initial delivery failed, retrying: %v", err)
		return b.retryDelivery(channel, wsMessage)
	}
	
	// Mark as processed
	b.markAsProcessed(notification.ID)
	
	return nil
}

// transformMessage transforms Redis notification to WebSocket format
// Implements task 3.1.3: Message transformation with metadata
func (b *RedisBridge) transformMessage(notification *redis.NotificationMessage) ([]byte, error) {
	// Create WebSocket message format
	wsMessage := map[string]interface{}{
		"type": "notification",
		"data": map[string]interface{}{
			"id":         notification.ID,
			"user_id":    notification.UserID,
			"type":       notification.Type,
			"title":      notification.Title,
			"message":    notification.Message,
			"data":       notification.Data,
			"timestamp":  notification.Timestamp.Format(time.RFC3339),
			"is_read":    notification.IsRead,
		},
		"metadata": map[string]interface{}{
			"received_at": time.Now().Format(time.RFC3339),
			"sequence":    time.Now().UnixNano(), // Simple sequence number
		},
	}
	
	// Add expires_at if present
	if notification.ExpiresAt != nil {
		wsMessage["data"].(map[string]interface{})["expires_at"] = notification.ExpiresAt.Format(time.RFC3339)
	}
	
	// Serialize to JSON
	payload, err := json.Marshal(wsMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal WebSocket message: %w", err)
	}
	
	// TODO: Compress large messages if needed (task 3.1.3)
	// if len(payload) > 1024 {
	//     payload = compress(payload)
	// }
	
	return payload, nil
}

// routeToWebSocket routes message to appropriate WebSocket connections
func (b *RedisBridge) routeToWebSocket(channel string, message []byte) error {
	// Parse channel to determine routing
	channelType, id, err := b.channelHelper.ParseChannelPattern(channel)
	if err != nil {
		return fmt.Errorf("failed to parse channel: %w", err)
	}
	
	switch channelType {
	case redis.ChannelTypeUser:
		// Send to specific user
		return b.wsManager.BroadcastToUser(id, message)
		
	case redis.ChannelTypeRole:
		// Send to all users with role
		return b.wsManager.BroadcastToRole(id, message)
		
	case redis.ChannelTypeSystem:
		// Send to all users
		return b.wsManager.BroadcastToAll(message)
		
	default:
		return fmt.Errorf("unknown channel type: %s", channelType)
	}
}

// retryDelivery retries message delivery with exponential backoff
// Implements task 3.1.4: Retry failed deliveries (3 attempts)
func (b *RedisBridge) retryDelivery(channel string, message []byte) error {
	var lastErr error
	
	for attempt := 1; attempt <= b.maxRetries; attempt++ {
		// Wait before retry with exponential backoff
		if attempt > 1 {
			backoff := time.Duration(attempt-1) * b.retryDelay
			time.Sleep(backoff)
		}
		
		err := b.routeToWebSocket(channel, message)
		if err == nil {
			b.logger.Printf("[INFO] Retry successful on attempt %d for channel '%s'", attempt, channel)
			return nil
		}
		
		lastErr = err
		b.logger.Printf("[WARN] Retry attempt %d/%d failed for channel '%s': %v", 
			attempt, b.maxRetries, channel, err)
	}
	
	// All retries failed - log to dead letter queue
	b.logDeadLetter(channel, message, lastErr)
	
	return fmt.Errorf("failed after %d retries: %w", b.maxRetries, lastErr)
}

// logDeadLetter logs failed messages to dead letter queue
// Implements task 3.1.4: Dead letter queue for failed messages
func (b *RedisBridge) logDeadLetter(channel string, message []byte, err error) {
	deadLetter := map[string]interface{}{
		"channel":   channel,
		"message":   string(message),
		"error":     err.Error(),
		"timestamp": time.Now().Format(time.RFC3339),
	}
	
	// TODO: Store in persistent dead letter queue (Redis list or database)
	b.logger.Printf("[ERROR] Dead letter: %+v", deadLetter)
}

// isDuplicate checks if a message was recently processed
// Implements task 3.1.4: Message deduplication
func (b *RedisBridge) isDuplicate(messageID string) bool {
	b.recentMessagesMu.RLock()
	_, exists := b.recentMessages[messageID]
	b.recentMessagesMu.RUnlock()
	
	return exists
}

// markAsProcessed marks a message as processed
func (b *RedisBridge) markAsProcessed(messageID string) {
	b.recentMessagesMu.Lock()
	defer b.recentMessagesMu.Unlock()
	
	// Add to recent messages
	b.recentMessages[messageID] = time.Now()
	
	// Limit cache size
	if len(b.recentMessages) > b.maxRecentMessages {
		// Remove oldest entries
		b.cleanupOldMessages()
	}
}

// cleanupOldMessages removes old entries from recent messages cache
func (b *RedisBridge) cleanupOldMessages() {
	// This is called while holding the write lock
	now := time.Now()
	maxAge := 5 * time.Minute
	
	for id, timestamp := range b.recentMessages {
		if now.Sub(timestamp) > maxAge {
			delete(b.recentMessages, id)
		}
	}
}

// cleanupRecentMessages periodically cleans up the recent messages cache
func (b *RedisBridge) cleanupRecentMessages() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for {
		select {
		case <-b.ctx.Done():
			return
		case <-ticker.C:
			b.recentMessagesMu.Lock()
			b.cleanupOldMessages()
			b.recentMessagesMu.Unlock()
		}
	}
}

// Stop stops the bridge
func (b *RedisBridge) Stop() error {
	b.logger.Printf("[INFO] Stopping Redis-WebSocket bridge")
	
	// Cancel context
	b.cancel()
	
	// Stop Redis Pub/Sub
	if b.redisPubSub != nil {
		if err := b.redisPubSub.Stop(); err != nil {
			return fmt.Errorf("failed to stop Redis Pub/Sub: %w", err)
		}
	}
	
	b.logger.Printf("[INFO] Bridge stopped")
	return nil
}

// GetStats returns bridge statistics
func (b *RedisBridge) GetStats() map[string]interface{} {
	b.recentMessagesMu.RLock()
	recentCount := len(b.recentMessages)
	b.recentMessagesMu.RUnlock()
	
	return map[string]interface{}{
		"recent_messages_cached": recentCount,
		"max_retries":            b.maxRetries,
		"retry_delay_ms":         b.retryDelay.Milliseconds(),
	}
}

