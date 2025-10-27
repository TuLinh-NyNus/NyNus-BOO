package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// RateLimiter implements token bucket algorithm for rate limiting
type RateLimiter struct {
	buckets map[string]*bucket
	mu      sync.RWMutex
	rate    int           // tokens per window
	window  time.Duration // time window
	logger  *logrus.Logger
}

// bucket represents a token bucket for rate limiting
type bucket struct {
	tokens     int
	lastRefill time.Time
	mu         sync.Mutex
}

// NewRateLimiter creates a new rate limiter
// rate: number of requests allowed per window
// window: time window duration (e.g., 1 minute)
func NewRateLimiter(rate int, window time.Duration, logger *logrus.Logger) *RateLimiter {
	rl := &RateLimiter{
		buckets: make(map[string]*bucket),
		rate:    rate,
		window:  window,
		logger:  logger,
	}

	// Start cleanup goroutine
	go rl.cleanup()

	return rl
}

// Allow checks if a request is allowed for the given key
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	b, exists := rl.buckets[key]
	if !exists {
		b = &bucket{
			tokens:     rl.rate,
			lastRefill: time.Now(),
		}
		rl.buckets[key] = b
	}
	rl.mu.Unlock()

	b.mu.Lock()
	defer b.mu.Unlock()

	// Refill tokens based on elapsed time
	now := time.Now()
	elapsed := now.Sub(b.lastRefill)
	if elapsed >= rl.window {
		// Full refill
		b.tokens = rl.rate
		b.lastRefill = now
	}

	// Check if we have tokens available
	if b.tokens > 0 {
		b.tokens--
		return true
	}

	return false
}

// GetRemaining returns remaining tokens for a key
func (rl *RateLimiter) GetRemaining(key string) int {
	rl.mu.RLock()
	b, exists := rl.buckets[key]
	rl.mu.RUnlock()

	if !exists {
		return rl.rate
	}

	b.mu.Lock()
	defer b.mu.Unlock()

	// Refill if needed
	now := time.Now()
	elapsed := now.Sub(b.lastRefill)
	if elapsed >= rl.window {
		return rl.rate
	}

	return b.tokens
}

// Reset resets rate limit for a key
func (rl *RateLimiter) Reset(key string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	delete(rl.buckets, key)
}

// cleanup removes old buckets periodically
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, b := range rl.buckets {
			b.mu.Lock()
			if now.Sub(b.lastRefill) > rl.window*2 {
				delete(rl.buckets, key)
			}
			b.mu.Unlock()
		}
		rl.mu.Unlock()
	}
}

// DownloadRateLimiter wraps RateLimiter for download operations
type DownloadRateLimiter struct {
	limiter *RateLimiter
	logger  *logrus.Logger
}

// NewDownloadRateLimiter creates a rate limiter for downloads
// Default: 10 downloads per minute per user
func NewDownloadRateLimiter(logger *logrus.Logger) *DownloadRateLimiter {
	return &DownloadRateLimiter{
		limiter: NewRateLimiter(10, 1*time.Minute, logger),
		logger:  logger,
	}
}

// NewDownloadRateLimiterWithConfig creates a rate limiter with custom config
func NewDownloadRateLimiterWithConfig(rate int, window time.Duration, logger *logrus.Logger) *DownloadRateLimiter {
	return &DownloadRateLimiter{
		limiter: NewRateLimiter(rate, window, logger),
		logger:  logger,
	}
}

// UnaryServerInterceptor returns a gRPC unary interceptor for rate limiting
func (drl *DownloadRateLimiter) UnaryServerInterceptor() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Only apply to download endpoints
		if !isDownloadEndpoint(info.FullMethod) {
			return handler(ctx, req)
		}

		// Extract user ID from context
		userID := getUserIDFromContext(ctx)
		if userID == "" {
			// Extract from metadata as fallback
			if md, ok := metadata.FromIncomingContext(ctx); ok {
				if vals := md.Get("user-id"); len(vals) > 0 {
					userID = vals[0]
				}
			}
		}

		// Use IP address if no user ID
		if userID == "" {
			userID = getIPFromContext(ctx)
		}

		// Check rate limit
		if !drl.limiter.Allow(userID) {
			remaining := drl.limiter.GetRemaining(userID)
			drl.logger.WithFields(logrus.Fields{
				"user_id":   userID,
				"method":    info.FullMethod,
				"remaining": remaining,
			}).Warn("Rate limit exceeded for download")

			return nil, status.Errorf(
				codes.ResourceExhausted,
				"Rate limit exceeded. Please try again later. (Limit: %d downloads per minute)",
				drl.limiter.rate,
			)
		}

		// Log successful download attempt
		remaining := drl.limiter.GetRemaining(userID)
		drl.logger.WithFields(logrus.Fields{
			"user_id":   userID,
			"method":    info.FullMethod,
			"remaining": remaining,
		}).Debug("Download rate limit check passed")

		return handler(ctx, req)
	}
}

// HTTPMiddleware returns HTTP middleware for rate limiting
func (drl *DownloadRateLimiter) HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only apply to download endpoints
		if !isDownloadPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		// Extract user ID from header or use IP
		userID := r.Header.Get("X-User-ID")
		if userID == "" {
			userID = getIPFromRequest(r)
		}

		// Check rate limit
		if !drl.limiter.Allow(userID) {
			remaining := drl.limiter.GetRemaining(userID)
			drl.logger.WithFields(logrus.Fields{
				"user_id":   userID,
				"path":      r.URL.Path,
				"remaining": remaining,
			}).Warn("Rate limit exceeded for HTTP download")

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", drl.limiter.rate))
			w.Header().Set("X-RateLimit-Remaining", "0")
			w.Header().Set("Retry-After", fmt.Sprintf("%d", int(drl.limiter.window.Seconds())))
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(fmt.Sprintf(
				`{"error": "Rate limit exceeded. Please try again later. (Limit: %d downloads per minute)"}`,
				drl.limiter.rate,
			)))
			return
		}

		// Add rate limit headers
		remaining := drl.limiter.GetRemaining(userID)
		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", drl.limiter.rate))
		w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

		next.ServeHTTP(w, r)
	})
}

// Helper functions

func isDownloadEndpoint(method string) bool {
	// Check if method is a download endpoint
	downloadMethods := []string{
		"/v1.LibraryService/DownloadItem",
		"/api.v1.LibraryService/DownloadItem",
	}
	for _, dm := range downloadMethods {
		if method == dm {
			return true
		}
	}
	return false
}

func isDownloadPath(path string) bool {
	// Check if path is a download endpoint
	downloadPaths := []string{
		"/api/v1/library/download",
		"/v1/library/download",
	}
	for _, dp := range downloadPaths {
		if path == dp {
			return true
		}
	}
	return false
}

func getUserIDFromContext(ctx context.Context) string {
	// Try to extract from custom context key
	if userID, ok := ctx.Value("user_id").(string); ok {
		return userID
	}
	return ""
}

func getIPFromContext(ctx context.Context) string {
	// Try to extract IP from metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("x-forwarded-for"); len(vals) > 0 {
			return vals[0]
		}
		if vals := md.Get("x-real-ip"); len(vals) > 0 {
			return vals[0]
		}
	}
	return "unknown"
}

func getIPFromRequest(r *http.Request) string {
	// Try X-Forwarded-For first
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	// Try X-Real-IP
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	// Use RemoteAddr as fallback
	return r.RemoteAddr
}

