package cache

import (
	"context"
	"crypto/md5"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ExamCacheHelper provides high-level caching operations for exam-related data
type ExamCacheHelper struct {
	cache CacheService
}

// NewExamCacheHelper creates a new exam cache helper
func NewExamCacheHelper(cache CacheService) *ExamCacheHelper {
	return &ExamCacheHelper{
		cache: cache,
	}
}

// Level 1: Individual Question Cache

// GetQuestion retrieves a question from cache
func (h *ExamCacheHelper) GetQuestion(ctx context.Context, questionID string) (*entity.Question, error) {
	key := GetQuestionCacheKey(questionID)
	var question entity.Question

	err := h.cache.GetJSON(ctx, key, &question)
	if err != nil {
		return nil, err
	}

	return &question, nil
}

// SetQuestion stores a question in cache
func (h *ExamCacheHelper) SetQuestion(ctx context.Context, question *entity.Question) error {
	key := GetQuestionCacheKey(question.ID.String)
	return h.cache.SetJSON(ctx, key, question, QuestionCacheTTL)
}

// Level 2: Exam Context Cache

// GetExamQuestions retrieves all questions for an exam from cache
func (h *ExamCacheHelper) GetExamQuestions(ctx context.Context, examID string) ([]*entity.Question, error) {
	key := GetExamQuestionsCacheKey(examID)
	var questions []*entity.Question

	err := h.cache.GetJSON(ctx, key, &questions)
	if err != nil {
		return nil, err
	}

	return questions, nil
}

// SetExamQuestions stores all questions for an exam in cache
func (h *ExamCacheHelper) SetExamQuestions(ctx context.Context, examID string, questions []*entity.Question) error {
	key := GetExamQuestionsCacheKey(examID)
	return h.cache.SetJSON(ctx, key, questions, ExamQuestionsCacheTTL)
}

// Level 3: Question Pool Cache

// GetQuestionPool retrieves question IDs from pool cache
func (h *ExamCacheHelper) GetQuestionPool(ctx context.Context, grade, subject, difficulty string) ([]string, error) {
	key := GetQuestionPoolCacheKey(grade, subject, difficulty)
	var questionIDs []string

	err := h.cache.GetJSON(ctx, key, &questionIDs)
	if err != nil {
		return nil, err
	}

	return questionIDs, nil
}

// SetQuestionPool stores question IDs in pool cache
func (h *ExamCacheHelper) SetQuestionPool(ctx context.Context, grade, subject, difficulty string, questionIDs []string) error {
	key := GetQuestionPoolCacheKey(grade, subject, difficulty)
	return h.cache.SetJSON(ctx, key, questionIDs, QuestionPoolCacheTTL)
}

// Level 4: Search Results Cache

// GetSearchResults retrieves search results from cache
func (h *ExamCacheHelper) GetSearchResults(ctx context.Context, filters map[string]interface{}) (interface{}, error) {
	filtersHash := h.hashFilters(filters)
	key := GetQuestionSearchCacheKey(filtersHash)

	var results interface{}
	err := h.cache.GetJSON(ctx, key, &results)
	if err != nil {
		return nil, err
	}

	return results, nil
}

// SetSearchResults stores search results in cache
func (h *ExamCacheHelper) SetSearchResults(ctx context.Context, filters map[string]interface{}, results interface{}) error {
	filtersHash := h.hashFilters(filters)
	key := GetQuestionSearchCacheKey(filtersHash)
	return h.cache.SetJSON(ctx, key, results, QuestionSearchCacheTTL)
}

// Exam-specific cache operations

// GetExam retrieves an exam from cache
func (h *ExamCacheHelper) GetExam(ctx context.Context, examID string) (*entity.Exam, error) {
	key := GetExamCacheKey(examID)
	var exam entity.Exam

	err := h.cache.GetJSON(ctx, key, &exam)
	if err != nil {
		return nil, err
	}

	return &exam, nil
}

// SetExam stores an exam in cache
func (h *ExamCacheHelper) SetExam(ctx context.Context, exam *entity.Exam) error {
	key := GetExamCacheKey(exam.ID)
	return h.cache.SetJSON(ctx, key, exam, ExamCacheTTL)
}

// GetExamStats retrieves exam statistics from cache
func (h *ExamCacheHelper) GetExamStats(ctx context.Context, examID string) (interface{}, error) {
	key := GetExamStatsCacheKey(examID)
	var stats interface{}

	err := h.cache.GetJSON(ctx, key, &stats)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// SetExamStats stores exam statistics in cache
func (h *ExamCacheHelper) SetExamStats(ctx context.Context, examID string, stats interface{}) error {
	key := GetExamStatsCacheKey(examID)
	return h.cache.SetJSON(ctx, key, stats, ExamStatsCacheTTL)
}

// Cache invalidation methods

// InvalidateQuestion removes question from all related caches
func (h *ExamCacheHelper) InvalidateQuestion(ctx context.Context, questionID string) error {
	// Remove individual question cache
	questionKey := GetQuestionCacheKey(questionID)
	if err := h.cache.Del(ctx, questionKey); err != nil {
		return err
	}

	// Remove question pool caches (pattern-based)
	return h.cache.DelPattern(ctx, "question_pool:*")
}

// InvalidateExam removes exam from all related caches
func (h *ExamCacheHelper) InvalidateExam(ctx context.Context, examID string) error {
	keys := []string{
		GetExamCacheKey(examID),
		GetExamQuestionsCacheKey(examID),
		GetExamStatsCacheKey(examID),
	}

	return h.cache.Del(ctx, keys...)
}

// InvalidateQuestionPools removes all question pool caches
func (h *ExamCacheHelper) InvalidateQuestionPools(ctx context.Context) error {
	return h.cache.DelPattern(ctx, "question_pool:*")
}

// InvalidateSearchResults removes all search result caches
func (h *ExamCacheHelper) InvalidateSearchResults(ctx context.Context) error {
	return h.cache.DelPattern(ctx, "question_search:*")
}

// InvalidateUserAttempts removes user attempt caches
func (h *ExamCacheHelper) InvalidateUserAttempts(ctx context.Context, userID, examID string) error {
	key := GetUserAttemptsCacheKey(userID, examID)
	return h.cache.Del(ctx, key)
}

// Helper methods

// hashFilters creates a hash from filter map for cache key
func (h *ExamCacheHelper) hashFilters(filters map[string]interface{}) string {
	// Simple hash implementation - in production, use a more robust method
	hash := md5.New()
	for k, v := range filters {
		hash.Write([]byte(fmt.Sprintf("%s:%v", k, v)))
	}
	return fmt.Sprintf("%x", hash.Sum(nil))
}

// GetCacheStats returns cache statistics
func (h *ExamCacheHelper) GetCacheStats() CacheStats {
	return h.cache.Stats()
}

// GetCacheHealth returns cache health information
func (h *ExamCacheHelper) GetCacheHealth(ctx context.Context) map[string]interface{} {
	return h.cache.Health(ctx)
}
