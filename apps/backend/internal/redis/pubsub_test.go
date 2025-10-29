package redis

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestPubSubClient_Publish tests publishing messages
// Phase 5 - Task 5.1.1: Test publish message
func TestPubSubClient_Publish(t *testing.T) {
	// Skip if Redis not available
	client := createTestRedisClient(t)
	if client == nil {
		t.Skip("Redis not available, skipping test")
	}
	defer client.Close()

	pubsub, err := NewPubSubClient(client)
	require.NoError(t, err)
	defer pubsub.Stop()

	ctx := context.Background()

	t.Run("publish simple message", func(t *testing.T) {
		message := map[string]string{
			"title":   "Test Notification",
			"message": "This is a test",
		}

		err := pubsub.Publish(ctx, "test:channel", message)
		assert.NoError(t, err)
	})

	t.Run("publish to empty channel should fail", func(t *testing.T) {
		err := pubsub.Publish(ctx, "", "test")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "channel name cannot be empty")
	})

	t.Run("publish complex notification message", func(t *testing.T) {
		notification := NotificationMessage{
			ID:        "notif_123",
			UserID:    "user_456",
			Type:      "INFO",
			Title:     "Test",
			Message:   "Test message",
			Data:      map[string]interface{}{"key": "value"},
			Timestamp: time.Now(),
		}

		err := pubsub.Publish(ctx, "notifications:user:user_456", notification)
		assert.NoError(t, err)
	})
}

// TestPubSubClient_Subscribe tests subscribing to channels
// Phase 5 - Task 5.1.1: Test subscribe/unsubscribe
func TestPubSubClient_Subscribe(t *testing.T) {
	client := createTestRedisClient(t)
	if client == nil {
		t.Skip("Redis not available, skipping test")
	}
	defer client.Close()

	pubsub, err := NewPubSubClient(client)
	require.NoError(t, err)
	defer pubsub.Stop()

	ctx := context.Background()

	t.Run("subscribe to single channel", func(t *testing.T) {
		err := pubsub.Subscribe(ctx, "test:channel:1")
		assert.NoError(t, err)
		assert.True(t, pubsub.IsSubscribed())
	})

	t.Run("subscribe to multiple channels", func(t *testing.T) {
		err := pubsub.Subscribe(ctx, "test:channel:2", "test:channel:3")
		assert.NoError(t, err)
	})

	t.Run("subscribe without channels should fail", func(t *testing.T) {
		pubsub2, _ := NewPubSubClient(client)
		err := pubsub2.Subscribe(ctx)
		assert.Error(t, err)
		pubsub2.Stop()
	})
}

// TestPubSubClient_SubscribePattern tests pattern subscriptions
func TestPubSubClient_SubscribePattern(t *testing.T) {
	client := createTestRedisClient(t)
	if client == nil {
		t.Skip("Redis not available, skipping test")
	}
	defer client.Close()

	pubsub, err := NewPubSubClient(client)
	require.NoError(t, err)
	defer pubsub.Stop()

	ctx := context.Background()

	t.Run("subscribe to pattern", func(t *testing.T) {
		err := pubsub.SubscribePattern(ctx, "notifications:*")
		assert.NoError(t, err)
		assert.True(t, pubsub.IsSubscribed())
	})

	t.Run("subscribe to empty pattern should fail", func(t *testing.T) {
		pubsub2, _ := NewPubSubClient(client)
		err := pubsub2.SubscribePattern(ctx, "")
		assert.Error(t, err)
		pubsub2.Stop()
	})
}

// TestPubSubClient_Unsubscribe tests unsubscribing
func TestPubSubClient_Unsubscribe(t *testing.T) {
	client := createTestRedisClient(t)
	if client == nil {
		t.Skip("Redis not available, skipping test")
	}
	defer client.Close()

	pubsub, err := NewPubSubClient(client)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("unsubscribe from channel", func(t *testing.T) {
		// Subscribe first
		err := pubsub.Subscribe(ctx, "test:channel")
		require.NoError(t, err)

		// Unsubscribe
		err = pubsub.Unsubscribe(ctx, "test:channel")
		assert.NoError(t, err)
	})

	t.Run("unsubscribe from all channels", func(t *testing.T) {
		// Subscribe to multiple channels
		err := pubsub.Subscribe(ctx, "test:1", "test:2")
		require.NoError(t, err)

		// Unsubscribe all
		err = pubsub.Unsubscribe(ctx)
		assert.NoError(t, err)
		assert.False(t, pubsub.IsSubscribed())
	})
}

// TestPubSubClient_PublishSubscribe tests end-to-end pub/sub
// Phase 5 - Task 5.1.1: Test error handling and reconnection
func TestPubSubClient_PublishSubscribe(t *testing.T) {
	client := createTestRedisClient(t)
	if client == nil {
		t.Skip("Redis not available, skipping test")
	}
	defer client.Close()

	// Create publisher
	publisher, err := NewPubSubClient(client)
	require.NoError(t, err)
	defer publisher.Stop()

	// Create subscriber
	subscriber, err := NewPubSubClient(client)
	require.NoError(t, err)
	defer subscriber.Stop()

	ctx := context.Background()
	channel := "test:pubsub:channel"

	t.Run("publish and receive message", func(t *testing.T) {
		// Subscribe
		err := subscriber.Subscribe(ctx, channel)
		require.NoError(t, err)

		// Create message handler
		received := make(chan []byte, 1)
		handler := MessageHandlerFunc(func(ch string, payload []byte) error {
			if ch == channel {
				received <- payload
			}
			return nil
		})

		subscriber.RegisterHandler(channel, handler)

		// Start subscriber
		err = subscriber.Start(1)
		require.NoError(t, err)

		// Wait a bit for subscription to be active
		time.Sleep(100 * time.Millisecond)

		// Publish message
		testMessage := map[string]string{
			"test": "data",
		}
		err = publisher.Publish(ctx, channel, testMessage)
		require.NoError(t, err)

		// Wait for message
		select {
		case payload := <-received:
			var decoded map[string]string
			err := json.Unmarshal(payload, &decoded)
			require.NoError(t, err)
			assert.Equal(t, "data", decoded["test"])
		case <-time.After(2 * time.Second):
			t.Fatal("Timeout waiting for message")
		}
	})
}

// TestMessageHandler tests message handler registration
func TestMessageHandler(t *testing.T) {
	client := createTestRedisClient(t)
	if client == nil {
		t.Skip("Redis not available, skipping test")
	}
	defer client.Close()

	pubsub, err := NewPubSubClient(client)
	require.NoError(t, err)
	defer pubsub.Stop()

	t.Run("register and unregister handler", func(t *testing.T) {
		called := false
		handler := MessageHandlerFunc(func(channel string, payload []byte) error {
			called = true
			return nil
		})

		pubsub.RegisterHandler("test:*", handler)
		assert.Len(t, pubsub.handlers, 1)

		pubsub.UnregisterHandler("test:*")
		assert.Len(t, pubsub.handlers, 0)
		assert.False(t, called)
	})
}

// Helper function to create test Redis client
func createTestRedisClient(t *testing.T) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "exam_bank_redis_password",
		DB:       1, // Use DB 1 for tests (different from production DB 0)
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	err := client.Ping(ctx).Err()
	if err != nil {
		t.Logf("Redis not available: %v", err)
		return nil
	}

	// Cleanup test data
	t.Cleanup(func() {
		client.FlushDB(context.Background())
		client.Close()
	})

	return client
}
