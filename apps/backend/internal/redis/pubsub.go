package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

// PubSubClient wraps Redis Pub/Sub functionality
type PubSubClient struct {
	client   *redis.Client
	pubsub   *redis.PubSub
	logger   *log.Logger
	mu       sync.RWMutex
	handlers map[string]MessageHandler
	ctx      context.Context
	cancel   context.CancelFunc
}

// MessageHandler defines the interface for handling messages
type MessageHandler interface {
	HandleMessage(channel string, payload []byte) error
}

// MessageHandlerFunc is a function adapter for MessageHandler
type MessageHandlerFunc func(channel string, payload []byte) error

// HandleMessage implements MessageHandler interface
func (f MessageHandlerFunc) HandleMessage(channel string, payload []byte) error {
	return f(channel, payload)
}

// NewPubSubClient creates a new Redis Pub/Sub client
func NewPubSubClient(client *redis.Client) (*PubSubClient, error) {
	if client == nil {
		return nil, fmt.Errorf("redis client cannot be nil")
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &PubSubClient{
		client:   client,
		logger:   log.New(log.Writer(), "[Redis PubSub] ", log.LstdFlags),
		handlers: make(map[string]MessageHandler),
		ctx:      ctx,
		cancel:   cancel,
	}, nil
}

// Publish publishes a message to a channel
// Implements task 1.1.2: Publish with validation, serialization, retry, and logging
func (c *PubSubClient) Publish(ctx context.Context, channel string, message interface{}) error {
	// Validate channel name
	if channel == "" {
		return fmt.Errorf("channel name cannot be empty")
	}

	// Serialize message to JSON
	payload, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	// Publish with retry logic (max 3 attempts)
	maxRetries := 3
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := c.client.Publish(ctx, channel, payload).Err()
		if err == nil {
			// Log success (debug level)
			c.logger.Printf("[DEBUG] Published message to channel '%s' (size: %d bytes)", channel, len(payload))
			return nil
		}

		lastErr = err
		c.logger.Printf("[WARN] Publish attempt %d/%d failed for channel '%s': %v", attempt, maxRetries, channel, err)

		// Wait before retry with exponential backoff
		if attempt < maxRetries {
			backoff := time.Duration(attempt) * 100 * time.Millisecond
			time.Sleep(backoff)
		}
	}

	return fmt.Errorf("failed to publish after %d attempts: %w", maxRetries, lastErr)
}

// Subscribe subscribes to one or more channels
// Implements task 1.1.3: Subscribe with multiple channels, error handling, auto-reconnect
func (c *PubSubClient) Subscribe(ctx context.Context, channels ...string) error {
	if len(channels) == 0 {
		return fmt.Errorf("at least one channel is required")
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// Create subscription if not exists
	if c.pubsub == nil {
		c.pubsub = c.client.Subscribe(ctx, channels...)
	} else {
		// Subscribe to additional channels
		err := c.pubsub.Subscribe(ctx, channels...)
		if err != nil {
			return fmt.Errorf("failed to subscribe to channels: %w", err)
		}
	}

	// Verify subscription
	_, err := c.pubsub.Receive(ctx)
	if err != nil {
		return fmt.Errorf("failed to confirm subscription: %w", err)
	}

	c.logger.Printf("[INFO] Subscribed to channels: %v", channels)

	return nil
}

// SubscribePattern subscribes to channels matching a pattern
// Supports pattern-based subscriptions (e.g., notifications:*)
func (c *PubSubClient) SubscribePattern(ctx context.Context, pattern string) error {
	if pattern == "" {
		return fmt.Errorf("pattern cannot be empty")
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// Create pattern subscription
	if c.pubsub == nil {
		c.pubsub = c.client.PSubscribe(ctx, pattern)
	} else {
		err := c.pubsub.PSubscribe(ctx, pattern)
		if err != nil {
			return fmt.Errorf("failed to subscribe to pattern: %w", err)
		}
	}

	// Verify subscription
	_, err := c.pubsub.Receive(ctx)
	if err != nil {
		return fmt.Errorf("failed to confirm pattern subscription: %w", err)
	}

	c.logger.Printf("[INFO] Subscribed to pattern: %s", pattern)

	return nil
}

// Unsubscribe unsubscribes from channels
// Implements task 1.1.4: Cleanup subscriptions and close channels
func (c *PubSubClient) Unsubscribe(ctx context.Context, channels ...string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.pubsub == nil {
		return nil // Already unsubscribed
	}

	if len(channels) == 0 {
		// Unsubscribe from all channels
		err := c.pubsub.Close()
		if err != nil {
			return fmt.Errorf("failed to close subscription: %w", err)
		}
		c.pubsub = nil
		c.logger.Printf("[INFO] Unsubscribed from all channels")
		return nil
	}

	// Unsubscribe from specific channels
	err := c.pubsub.Unsubscribe(ctx, channels...)
	if err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}

	c.logger.Printf("[INFO] Unsubscribed from channels: %v", channels)

	return nil
}

// RegisterHandler registers a message handler for a specific channel pattern
// Implements task 1.1.5: Message handler pattern
func (c *PubSubClient) RegisterHandler(pattern string, handler MessageHandler) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.handlers[pattern] = handler
	c.logger.Printf("[INFO] Registered handler for pattern: %s", pattern)
}

// UnregisterHandler removes a message handler
func (c *PubSubClient) UnregisterHandler(pattern string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.handlers, pattern)
	c.logger.Printf("[INFO] Unregistered handler for pattern: %s", pattern)
}

// Start starts listening for messages with concurrent processing
// Implements task 1.1.5: Concurrent message processing with worker pool
func (c *PubSubClient) Start(workerPoolSize int) error {
	if c.pubsub == nil {
		return fmt.Errorf("no active subscription")
	}

	if workerPoolSize <= 0 {
		workerPoolSize = 10 // Default worker pool size
	}

	// Create worker pool
	messageChan := make(chan *redis.Message, 100)
	
	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < workerPoolSize; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			c.worker(workerID, messageChan)
		}(i)
	}

	// Start message receiver
	go func() {
		channel := c.pubsub.Channel()
		for {
			select {
			case <-c.ctx.Done():
				c.logger.Printf("[INFO] Stopping message receiver")
				close(messageChan)
				return
			case msg := <-channel:
				if msg == nil {
					continue
				}
				messageChan <- msg
			}
		}
	}()

	c.logger.Printf("[INFO] Started Pub/Sub listener with %d workers", workerPoolSize)

	return nil
}

// worker processes messages from the message channel
func (c *PubSubClient) worker(workerID int, messageChan <-chan *redis.Message) {
	for msg := range messageChan {
		c.processMessage(workerID, msg)
	}
	c.logger.Printf("[INFO] Worker %d stopped", workerID)
}

// processMessage processes a single message
func (c *PubSubClient) processMessage(workerID int, msg *redis.Message) {
	c.mu.RLock()
	handlers := make(map[string]MessageHandler)
	for k, v := range c.handlers {
		handlers[k] = v
	}
	c.mu.RUnlock()

	// Try to match message channel with registered handlers
	for pattern, handler := range handlers {
		if c.matchPattern(pattern, msg.Channel) {
			err := handler.HandleMessage(msg.Channel, []byte(msg.Payload))
			if err != nil {
				c.logger.Printf("[ERROR] Worker %d: Handler error for channel '%s': %v", 
					workerID, msg.Channel, err)
			} else {
				c.logger.Printf("[DEBUG] Worker %d: Processed message from channel '%s'", 
					workerID, msg.Channel)
			}
			return
		}
	}

	c.logger.Printf("[WARN] Worker %d: No handler found for channel '%s'", workerID, msg.Channel)
}

// matchPattern checks if a channel matches a pattern
func (c *PubSubClient) matchPattern(pattern, channel string) bool {
	// Simple pattern matching
	// TODO: Implement proper glob pattern matching if needed
	if pattern == channel {
		return true
	}
	
	// Support wildcard patterns like "notifications:*"
	if len(pattern) > 0 && pattern[len(pattern)-1] == '*' {
		prefix := pattern[:len(pattern)-1]
		return len(channel) >= len(prefix) && channel[:len(prefix)] == prefix
	}
	
	return false
}

// Stop stops the Pub/Sub client
func (c *PubSubClient) Stop() error {
	c.logger.Printf("[INFO] Stopping Pub/Sub client")

	// Cancel context to stop workers
	c.cancel()

	// Close subscription
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.pubsub != nil {
		err := c.pubsub.Close()
		c.pubsub = nil
		if err != nil {
			return fmt.Errorf("failed to close subscription: %w", err)
		}
	}

	c.logger.Printf("[INFO] Pub/Sub client stopped")
	return nil
}

// IsSubscribed checks if there's an active subscription
func (c *PubSubClient) IsSubscribed() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.pubsub != nil
}

// GetSubscribedChannels returns the list of subscribed channels
func (c *PubSubClient) GetSubscribedChannels(ctx context.Context) ([]string, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if c.pubsub == nil {
		return nil, nil
	}

	// Get channels from handlers map
	channels := make([]string, 0, len(c.handlers))
	for channel := range c.handlers {
		channels = append(channels, channel)
	}

	return channels, nil
}

