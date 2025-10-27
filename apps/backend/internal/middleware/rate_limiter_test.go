package middleware

import (
	"context"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func TestNewRateLimiter(t *testing.T) {
	logger := logrus.New()
	rl := NewRateLimiter(10, 1*time.Minute, logger)

	if rl == nil {
		t.Fatal("expected non-nil rate limiter")
	}

	if rl.rate != 10 {
		t.Errorf("expected rate 10, got %d", rl.rate)
	}

	if rl.window != 1*time.Minute {
		t.Errorf("expected window 1m, got %v", rl.window)
	}
}

func TestRateLimiter_Allow(t *testing.T) {
	logger := logrus.New()
	rl := NewRateLimiter(3, 1*time.Second, logger)

	key := "test-user"

	// First 3 requests should be allowed
	for i := 0; i < 3; i++ {
		if !rl.Allow(key) {
			t.Errorf("request %d should be allowed", i+1)
		}
	}

	// 4th request should be denied
	if rl.Allow(key) {
		t.Error("4th request should be denied")
	}

	// Wait for refill
	time.Sleep(1100 * time.Millisecond)

	// Should be allowed again after refill
	if !rl.Allow(key) {
		t.Error("request should be allowed after refill")
	}
}

func TestRateLimiter_GetRemaining(t *testing.T) {
	logger := logrus.New()
	rl := NewRateLimiter(5, 1*time.Minute, logger)

	key := "test-user"

	// Initial remaining should be rate
	if remaining := rl.GetRemaining(key); remaining != 5 {
		t.Errorf("expected remaining 5, got %d", remaining)
	}

	// Consume 2 tokens
	rl.Allow(key)
	rl.Allow(key)

	// Should have 3 remaining
	if remaining := rl.GetRemaining(key); remaining != 3 {
		t.Errorf("expected remaining 3, got %d", remaining)
	}
}

func TestRateLimiter_Reset(t *testing.T) {
	logger := logrus.New()
	rl := NewRateLimiter(2, 1*time.Minute, logger)

	key := "test-user"

	// Consume all tokens
	rl.Allow(key)
	rl.Allow(key)

	// Should be denied
	if rl.Allow(key) {
		t.Error("request should be denied")
	}

	// Reset the bucket
	rl.Reset(key)

	// Should be allowed again
	if !rl.Allow(key) {
		t.Error("request should be allowed after reset")
	}
}

func TestRateLimiter_MultipleKeys(t *testing.T) {
	logger := logrus.New()
	rl := NewRateLimiter(2, 1*time.Minute, logger)

	// Each key should have independent rate limits
	if !rl.Allow("user1") {
		t.Error("user1 request 1 should be allowed")
	}
	if !rl.Allow("user2") {
		t.Error("user2 request 1 should be allowed")
	}
	if !rl.Allow("user1") {
		t.Error("user1 request 2 should be allowed")
	}
	if !rl.Allow("user2") {
		t.Error("user2 request 2 should be allowed")
	}

	// Both should be rate limited now
	if rl.Allow("user1") {
		t.Error("user1 should be rate limited")
	}
	if rl.Allow("user2") {
		t.Error("user2 should be rate limited")
	}
}

func TestNewDownloadRateLimiter(t *testing.T) {
	logger := logrus.New()
	drl := NewDownloadRateLimiter(logger)

	if drl == nil {
		t.Fatal("expected non-nil download rate limiter")
	}

	if drl.limiter.rate != 10 {
		t.Errorf("expected default rate 10, got %d", drl.limiter.rate)
	}

	if drl.limiter.window != 1*time.Minute {
		t.Errorf("expected default window 1m, got %v", drl.limiter.window)
	}
}

func TestNewDownloadRateLimiterWithConfig(t *testing.T) {
	logger := logrus.New()
	drl := NewDownloadRateLimiterWithConfig(5, 30*time.Second, logger)

	if drl.limiter.rate != 5 {
		t.Errorf("expected rate 5, got %d", drl.limiter.rate)
	}

	if drl.limiter.window != 30*time.Second {
		t.Errorf("expected window 30s, got %v", drl.limiter.window)
	}
}

func TestDownloadRateLimiter_UnaryServerInterceptor(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel) // Reduce noise in tests

	drl := NewDownloadRateLimiterWithConfig(2, 1*time.Second, logger)
	interceptor := drl.UnaryServerInterceptor()

	// Mock handler
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return "success", nil
	}

	// Mock download endpoint info
	downloadInfo := &grpc.UnaryServerInfo{
		FullMethod: "/v1.LibraryService/DownloadItem",
	}

	// Mock non-download endpoint info
	nonDownloadInfo := &grpc.UnaryServerInfo{
		FullMethod: "/v1.LibraryService/ListItems",
	}

	ctx := context.Background()

	// Non-download endpoints should not be rate limited
	_, err := interceptor(ctx, nil, nonDownloadInfo, handler)
	if err != nil {
		t.Errorf("non-download endpoint should not be rate limited: %v", err)
	}

	// Download endpoints should be rate limited
	for i := 0; i < 2; i++ {
		_, err := interceptor(ctx, nil, downloadInfo, handler)
		if err != nil {
			t.Errorf("request %d should be allowed: %v", i+1, err)
		}
	}

	// 3rd request should be denied
	_, err = interceptor(ctx, nil, downloadInfo, handler)
	if err == nil {
		t.Error("3rd download request should be denied")
	}

	// Wait for refill
	time.Sleep(1100 * time.Millisecond)

	// Should be allowed again
	_, err = interceptor(ctx, nil, downloadInfo, handler)
	if err != nil {
		t.Errorf("request should be allowed after refill: %v", err)
	}
}

func TestIsDownloadEndpoint(t *testing.T) {
	tests := []struct {
		method   string
		expected bool
	}{
		{"/v1.LibraryService/DownloadItem", true},
		{"/api.v1.LibraryService/DownloadItem", true},
		{"/v1.LibraryService/ListItems", false},
		{"/v1.LibraryService/GetItem", false},
		{"/other/endpoint", false},
	}

	for _, tt := range tests {
		t.Run(tt.method, func(t *testing.T) {
			result := isDownloadEndpoint(tt.method)
			if result != tt.expected {
				t.Errorf("expected %v for %s, got %v", tt.expected, tt.method, result)
			}
		})
	}
}

func TestIsDownloadPath(t *testing.T) {
	tests := []struct {
		path     string
		expected bool
	}{
		{"/api/v1/library/download", true},
		{"/v1/library/download", true},
		{"/api/v1/library/list", false},
		{"/other/path", false},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			result := isDownloadPath(tt.path)
			if result != tt.expected {
				t.Errorf("expected %v for %s, got %v", tt.expected, tt.path, result)
			}
		})
	}
}

