package redis

import (
	"context"
	"fmt"
	"log"
	"time"

	"exam-bank-system/apps/backend/internal/config"
	"github.com/go-redis/redis/v8"
)

// Client wraps Redis client with additional functionality
type Client struct {
	client *redis.Client
	config *config.RedisConfig
	logger *log.Logger
}

// NewClient creates a new Redis client
func NewClient(cfg *config.RedisConfig) (*Client, error) {
	if !cfg.Enabled {
		return &Client{
			client: nil,
			config: cfg,
			logger: log.New(log.Writer(), "[Redis] ", log.LstdFlags),
		}, nil
	}

	// Parse Redis URL
	opt, err := redis.ParseURL(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	// Override with config values
	if cfg.Password != "" {
		opt.Password = cfg.Password
	}
	opt.PoolSize = cfg.PoolSize
	opt.MinIdleConns = cfg.MinIdleConns

	// Parse timeout
	if timeout, err := time.ParseDuration(cfg.Timeout); err == nil {
		opt.DialTimeout = timeout
		opt.ReadTimeout = timeout
		opt.WriteTimeout = timeout
	}

	// Create Redis client
	rdb := redis.NewClient(opt)

	client := &Client{
		client: rdb,
		config: cfg,
		logger: log.New(log.Writer(), "[Redis] ", log.LstdFlags),
	}

	// Test connection
	if err := client.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	client.logger.Printf("Connected to Redis at %s", cfg.URL)
	return client, nil
}

// IsEnabled returns whether Redis is enabled
func (c *Client) IsEnabled() bool {
	return c.config.Enabled && c.client != nil
}

// Ping tests the Redis connection
func (c *Client) Ping(ctx context.Context) error {
	if !c.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	_, err := c.client.Ping(ctx).Result()
	return err
}

// Get retrieves a value from Redis
func (c *Client) Get(ctx context.Context, key string) (string, error) {
	if !c.IsEnabled() {
		return "", fmt.Errorf("Redis is disabled")
	}

	result, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil // Key does not exist
	}
	return result, err
}

// Set stores a value in Redis with TTL
func (c *Client) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if !c.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	return c.client.Set(ctx, key, value, ttl).Err()
}

// Del deletes keys from Redis
func (c *Client) Del(ctx context.Context, keys ...string) error {
	if !c.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	return c.client.Del(ctx, keys...).Err()
}

// Exists checks if keys exist in Redis
func (c *Client) Exists(ctx context.Context, keys ...string) (int64, error) {
	if !c.IsEnabled() {
		return 0, fmt.Errorf("Redis is disabled")
	}

	return c.client.Exists(ctx, keys...).Result()
}

// Keys returns all keys matching pattern
func (c *Client) Keys(ctx context.Context, pattern string) ([]string, error) {
	if !c.IsEnabled() {
		return nil, fmt.Errorf("Redis is disabled")
	}

	return c.client.Keys(ctx, pattern).Result()
}

// TTL returns the time to live for a key
func (c *Client) TTL(ctx context.Context, key string) (time.Duration, error) {
	if !c.IsEnabled() {
		return 0, fmt.Errorf("Redis is disabled")
	}

	return c.client.TTL(ctx, key).Result()
}

// Expire sets a timeout on key
func (c *Client) Expire(ctx context.Context, key string, ttl time.Duration) error {
	if !c.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	return c.client.Expire(ctx, key, ttl).Err()
}

// FlushDB removes all keys from the current database
func (c *Client) FlushDB(ctx context.Context) error {
	if !c.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	return c.client.FlushDB(ctx).Err()
}

// Close closes the Redis connection
func (c *Client) Close() error {
	if c.client != nil {
		return c.client.Close()
	}
	return nil
}

// GetClient returns the underlying Redis client for advanced operations
func (c *Client) GetClient() *redis.Client {
	return c.client
}

// Health returns Redis health information
func (c *Client) Health(ctx context.Context) map[string]interface{} {
	health := map[string]interface{}{
		"enabled": c.IsEnabled(),
	}

	if !c.IsEnabled() {
		health["status"] = "disabled"
		return health
	}

	// Test connection
	if err := c.Ping(ctx); err != nil {
		health["status"] = "unhealthy"
		health["error"] = err.Error()
		return health
	}

	health["status"] = "healthy"

	// Get Redis info
	if info, err := c.client.Info(ctx).Result(); err == nil {
		health["info"] = info
	}

	return health
}

