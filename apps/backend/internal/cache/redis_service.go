package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"sync/atomic"
	"time"

	"exam-bank-system/apps/backend/internal/redis"
)

// RedisService implements CacheService using Redis
type RedisService struct {
	client *redis.Client
	stats  *cacheStats
}

// cacheStats holds cache statistics with atomic operations
type cacheStats struct {
	hits    int64
	misses  int64
	sets    int64
	deletes int64
}

// NewRedisService creates a new Redis cache service
func NewRedisService(client *redis.Client) CacheService {
	return &RedisService{
		client: client,
		stats:  &cacheStats{},
	}
}

// Get retrieves a value from cache
func (r *RedisService) Get(ctx context.Context, key string) ([]byte, error) {
	if !r.client.IsEnabled() {
		atomic.AddInt64(&r.stats.misses, 1)
		return nil, fmt.Errorf("Redis is disabled")
	}

	value, err := r.client.Get(ctx, key)
	if err != nil || value == "" {
		atomic.AddInt64(&r.stats.misses, 1)
		return nil, err
	}

	atomic.AddInt64(&r.stats.hits, 1)
	return []byte(value), nil
}

// Set stores a value in cache with TTL
func (r *RedisService) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	if !r.client.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	err := r.client.Set(ctx, key, value, ttl)
	if err == nil {
		atomic.AddInt64(&r.stats.sets, 1)
	}
	return err
}

// Del deletes keys from cache
func (r *RedisService) Del(ctx context.Context, keys ...string) error {
	if !r.client.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	err := r.client.Del(ctx, keys...)
	if err == nil {
		atomic.AddInt64(&r.stats.deletes, int64(len(keys)))
	}
	return err
}

// Exists checks if keys exist in cache
func (r *RedisService) Exists(ctx context.Context, keys ...string) (int64, error) {
	if !r.client.IsEnabled() {
		return 0, fmt.Errorf("Redis is disabled")
	}

	return r.client.Exists(ctx, keys...)
}

// DelPattern deletes all keys matching a pattern
func (r *RedisService) DelPattern(ctx context.Context, pattern string) error {
	if !r.client.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	keys, err := r.client.Keys(ctx, pattern)
	if err != nil {
		return err
	}

	if len(keys) > 0 {
		err = r.client.Del(ctx, keys...)
		if err == nil {
			atomic.AddInt64(&r.stats.deletes, int64(len(keys)))
		}
	}

	return err
}

// Keys returns all keys matching pattern
func (r *RedisService) Keys(ctx context.Context, pattern string) ([]string, error) {
	if !r.client.IsEnabled() {
		return nil, fmt.Errorf("Redis is disabled")
	}

	return r.client.Keys(ctx, pattern)
}

// TTL returns the time to live for a key
func (r *RedisService) TTL(ctx context.Context, key string) (time.Duration, error) {
	if !r.client.IsEnabled() {
		return 0, fmt.Errorf("Redis is disabled")
	}

	return r.client.TTL(ctx, key)
}

// Expire sets a timeout on key
func (r *RedisService) Expire(ctx context.Context, key string, ttl time.Duration) error {
	if !r.client.IsEnabled() {
		return fmt.Errorf("Redis is disabled")
	}

	return r.client.Expire(ctx, key, ttl)
}

// GetJSON retrieves and unmarshals JSON from cache
func (r *RedisService) GetJSON(ctx context.Context, key string, dest interface{}) error {
	data, err := r.Get(ctx, key)
	if err != nil {
		return err
	}

	if len(data) == 0 {
		return fmt.Errorf("key not found")
	}

	return json.Unmarshal(data, dest)
}

// SetJSON marshals and stores JSON in cache
func (r *RedisService) SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	return r.Set(ctx, key, data, ttl)
}

// Health returns cache health information
func (r *RedisService) Health(ctx context.Context) map[string]interface{} {
	health := map[string]interface{}{
		"enabled": r.client.IsEnabled(),
		"stats":   r.Stats(),
	}

	if !r.client.IsEnabled() {
		health["status"] = "disabled"
		return health
	}

	// Get Redis health
	redisHealth := r.client.Health(ctx)
	health["redis"] = redisHealth

	if status, ok := redisHealth["status"]; ok && status == "healthy" {
		health["status"] = "healthy"
	} else {
		health["status"] = "unhealthy"
	}

	return health
}

// Stats returns cache statistics
func (r *RedisService) Stats() CacheStats {
	hits := atomic.LoadInt64(&r.stats.hits)
	misses := atomic.LoadInt64(&r.stats.misses)
	sets := atomic.LoadInt64(&r.stats.sets)
	deletes := atomic.LoadInt64(&r.stats.deletes)

	totalOps := hits + misses
	hitRate := float64(0)
	if totalOps > 0 {
		hitRate = float64(hits) / float64(totalOps)
	}

	return CacheStats{
		Hits:     hits,
		Misses:   misses,
		Sets:     sets,
		Deletes:  deletes,
		HitRate:  hitRate,
		TotalOps: totalOps,
	}
}

// Close closes the cache service
func (r *RedisService) Close() error {
	if r.client != nil {
		return r.client.Close()
	}
	return nil
}

