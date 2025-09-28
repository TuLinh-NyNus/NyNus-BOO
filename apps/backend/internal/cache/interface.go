package cache

import (
	"context"
	"fmt"
	"time"
)

// CacheService defines the interface for caching operations
type CacheService interface {
	// Basic operations
	Get(ctx context.Context, key string) ([]byte, error)
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
	Del(ctx context.Context, keys ...string) error
	Exists(ctx context.Context, keys ...string) (int64, error)
	
	// Pattern operations
	DelPattern(ctx context.Context, pattern string) error
	Keys(ctx context.Context, pattern string) ([]string, error)
	
	// TTL operations
	TTL(ctx context.Context, key string) (time.Duration, error)
	Expire(ctx context.Context, key string, ttl time.Duration) error
	
	// JSON operations
	GetJSON(ctx context.Context, key string, dest interface{}) error
	SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	
	// Health and stats
	Health(ctx context.Context) map[string]interface{}
	Stats() CacheStats
	
	// Cleanup
	Close() error
}

// CacheStats represents cache statistics
type CacheStats struct {
	Hits        int64 `json:"hits"`
	Misses      int64 `json:"misses"`
	Sets        int64 `json:"sets"`
	Deletes     int64 `json:"deletes"`
	HitRate     float64 `json:"hit_rate"`
	TotalOps    int64 `json:"total_ops"`
}

// CacheKey constants for different cache levels
const (
	// Level 1: Individual Question Cache (1 hour TTL)
	QuestionCacheKey = "question:%s"
	QuestionCacheTTL = 1 * time.Hour
	
	// Level 2: Exam Context Cache (4 hours TTL)
	ExamQuestionsCacheKey = "exam_questions:%s"
	ExamQuestionsCacheTTL = 4 * time.Hour
	
	// Level 3: Question Pool Cache (24 hours TTL)
	QuestionPoolCacheKey = "question_pool:%s:%s:%s" // grade:subject:difficulty
	QuestionPoolCacheTTL = 24 * time.Hour
	
	// Level 4: Search Results Cache (30 minutes TTL)
	QuestionSearchCacheKey = "question_search:%s" // hash of filters
	QuestionSearchCacheTTL = 30 * time.Minute
	
	// Exam-related cache keys
	ExamCacheKey         = "exam:%s"
	ExamCacheTTL         = 1 * time.Hour
	ExamStatsCacheKey    = "exam_stats:%s"
	ExamStatsCacheTTL    = 5 * time.Minute
	UserAttemptsCacheKey = "user_attempts:%s:%s" // user_id:exam_id
	UserAttemptsCacheTTL = 30 * time.Minute
)

// Cache key generators
func GetQuestionCacheKey(questionID string) string {
	return fmt.Sprintf(QuestionCacheKey, questionID)
}

func GetExamQuestionsCacheKey(examID string) string {
	return fmt.Sprintf(ExamQuestionsCacheKey, examID)
}

func GetQuestionPoolCacheKey(grade, subject, difficulty string) string {
	return fmt.Sprintf(QuestionPoolCacheKey, grade, subject, difficulty)
}

func GetQuestionSearchCacheKey(filtersHash string) string {
	return fmt.Sprintf(QuestionSearchCacheKey, filtersHash)
}

func GetExamCacheKey(examID string) string {
	return fmt.Sprintf(ExamCacheKey, examID)
}

func GetExamStatsCacheKey(examID string) string {
	return fmt.Sprintf(ExamStatsCacheKey, examID)
}

func GetUserAttemptsCacheKey(userID, examID string) string {
	return fmt.Sprintf(UserAttemptsCacheKey, userID, examID)
}
