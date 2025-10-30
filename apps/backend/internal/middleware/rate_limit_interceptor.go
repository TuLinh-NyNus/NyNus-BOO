package middleware

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// RateLimitInterceptor handles rate limiting for API endpoints
type RateLimitInterceptor struct {
	// Store rate limiters per user/IP
	// Keyed by "<method>|<identifier>" so each RPC has an isolated bucket per caller
	limiters     map[string]*userLimiter
	limiterMutex sync.RWMutex

	// Configuration for different endpoint groups
	endpointLimits map[string]RateLimitConfig

	// Cleanup goroutine
	cleanupTicker *time.Ticker
}

// userLimiter stores rate limiter and last access time for cleanup
type userLimiter struct {
	limiter    *rate.Limiter
	lastAccess time.Time
}

// RateLimitConfig defines rate limit configuration
type RateLimitConfig struct {
	RequestsPerSecond float64
	Burst             int
	PerUser           bool // If true, limit per user. If false, limit per IP
}

// NewRateLimitInterceptor creates a new rate limit interceptor
func NewRateLimitInterceptor() *RateLimitInterceptor {
	r := &RateLimitInterceptor{
		limiters:       make(map[string]*userLimiter),
		endpointLimits: initializeRateLimits(),
		cleanupTicker:  time.NewTicker(5 * time.Minute),
	}

	// Start cleanup goroutine
	go r.cleanupExpiredLimiters()

	return r
}

// Initialize rate limits for different endpoint groups
func initializeRateLimits() map[string]RateLimitConfig {
	return map[string]RateLimitConfig{
		// Authentication endpoints - stricter limits
		"/v1.UserService/Login": {
			RequestsPerSecond: 0.1,   // 1 request per 10 seconds
			Burst:             3,     // Allow 3 attempts quickly
			PerUser:           false, // Limit by IP
		},
		"/v1.UserService/Register": {
			RequestsPerSecond: 0.017, // 1 request per minute
			Burst:             1,
			PerUser:           false,
		},
		"/v1.UserService/ForgotPassword": {
			RequestsPerSecond: 0.017, // 1 request per minute
			Burst:             2,
			PerUser:           false,
		},
		"/v1.UserService/ResetPassword": {
			RequestsPerSecond: 0.033, // 1 request per 30 seconds
			Burst:             2,
			PerUser:           false,
		},

		// OAuth endpoints
		"/v1.UserService/GoogleLogin": {
			RequestsPerSecond: 0.2, // 1 request per 5 seconds
			Burst:             5,
			PerUser:           false,
		},
		"/v1.UserService/RefreshToken": {
			RequestsPerSecond: 0.5, // 1 request per 2 seconds
			Burst:             3,
			PerUser:           true,
		},

		// Admin operations - moderate limits for write operations
		"/v1.AdminService/UpdateUserRole": {
			RequestsPerSecond: 0.5,
			Burst:             5,
			PerUser:           true,
		},
		"/v1.AdminService/UpdateUserLevel": {
			RequestsPerSecond: 0.5,
			Burst:             5,
			PerUser:           true,
		},
		"/v1.AdminService/UpdateUserStatus": {
			RequestsPerSecond: 0.5,
			Burst:             5,
			PerUser:           true,
		},

		// Admin read operations - higher limits for dashboard loading
		"/v1.AdminService/ListUsers": {
			RequestsPerSecond: 10, // 10 requests per second
			Burst:             30, // Allow burst of 30 for initial dashboard load
			PerUser:           true,
		},
		"/v1.AdminService/GetAuditLogs": {
			RequestsPerSecond: 5,
			Burst:             20,
			PerUser:           true,
		},
		"/v1.AdminService/GetResourceAccess": {
			RequestsPerSecond: 5,
			Burst:             20,
			PerUser:           true,
		},
		// Admin system stats - very high limit for dashboard components
		// Reason: Multiple dashboard components (7+ hooks/components) fetch stats simultaneously
		// during page load with React Strict Mode double-render. Backend caching (10s TTL) reduces actual database load.
		// Very high limit allows concurrent requests from different components without blocking.
		// âœ… FIX: Increased to 200/500 to handle React Strict Mode + multiple concurrent components + browser tabs
		"/v1.AdminService/GetSystemStats": {
			RequestsPerSecond: 200, // 200 requests per second - supports React Strict Mode + 10+ concurrent components + multiple tabs
			Burst:             500, // Allow burst of 500 for initial dashboard load with multiple components + double-render + multiple tabs
			PerUser:           true,
		},
		// Admin metrics history - higher limit for sparkline data with caching
		// Used by dashboard components to fetch time series data for charts
		// âœ… FIX: Increased rate limit + added frontend caching to prevent rate limit exceeded
		"/v1.AdminService/GetMetricsHistory": {
			RequestsPerSecond: 50,  // 50 requests per second - higher limit with frontend caching (10s interval + 30s cache)
			Burst:             100, // Allow burst of 100 for initial dashboard load with React Strict Mode + multiple tabs
			PerUser:           true,
		},
		"/v1.AdminService/GetSecurityAlerts": {
			RequestsPerSecond: 2,
			Burst:             10,
			PerUser:           true,
		},

		// Question/Exam creation - prevent spam
		"/v1.QuestionService/CreateQuestion": {
			RequestsPerSecond: 1,
			Burst:             10,
			PerUser:           true,
		},
		"/v1.ExamService/CreateExam": {
			RequestsPerSecond: 0.5,
			Burst:             5,
			PerUser:           true,
		},

		// Exam submission - prevent rapid submissions
		"/v1.ExamService/SubmitExam": {
			RequestsPerSecond: 0.033, // 1 submission per 30 seconds
			Burst:             1,
			PerUser:           true,
		},

		// File uploads - strict limits
		"/v1.QuestionService/ImportQuestions": {
			RequestsPerSecond: 0.017, // 1 per minute
			Burst:             1,
			PerUser:           true,
		},

		// Read operations - more lenient
		"/v1.QuestionService/ListQuestions": {
			RequestsPerSecond: 10,
			Burst:             50,
			PerUser:           true,
		},
		"/v1.ExamService/ListExams": {
			RequestsPerSecond: 10,
			Burst:             50,
			PerUser:           true,
		},

		// Profile operations
		"/v1.ProfileService/UpdateProfile": {
			RequestsPerSecond: 0.1, // 1 update per 10 seconds
			Burst:             3,
			PerUser:           true,
		},
		"/v1.ProfileService/TerminateSession": {
			RequestsPerSecond: 0.5,
			Burst:             5,
			PerUser:           true,
		},
		"/v1.ProfileService/TerminateAllSessions": {
			RequestsPerSecond: 0.033, // 1 per 30 seconds
			Burst:             1,
			PerUser:           true,
		},

		// Notification operations - higher limits for read operations
		// âœ… FIX: Increased to handle React Strict Mode double-render + multiple notification components
		"/v1.NotificationService/GetNotifications": {
			RequestsPerSecond: 50,  // 50 requests per second - supports React Strict Mode
			Burst:             100, // Allow burst of 100 for initial page load with double-render
			PerUser:           true,
		},
		"/v1.NotificationService/MarkAsRead": {
			RequestsPerSecond: 5,
			Burst:             15,
			PerUser:           true,
		},
		"/v1.NotificationService/MarkAllAsRead": {
			RequestsPerSecond: 0.5, // 1 request per 2 seconds
			Burst:             2,
			PerUser:           true,
		},
		"/v1.NotificationService/DeleteNotification": {
			RequestsPerSecond: 2,
			Burst:             10,
			PerUser:           true,
		},

		// Library/Book operations - higher limit for browsing
		// âœ… FIX: Increased to handle React Strict Mode double-render
		"/v1.BookService/ListBooks": {
			RequestsPerSecond: 50,  // 50 requests per second - supports React Strict Mode
			Burst:             100, // Allow burst of 100 for initial dashboard load with double-render
			PerUser:           true,
		},
		"/v1.BookService/GetBook": {
			RequestsPerSecond: 10,
			Burst:             30,
			PerUser:           true,
		},
		"/v1.LibraryService/ListLibraryItems": {
			RequestsPerSecond: 10,
			Burst:             30,
			PerUser:           true,
		},
		"/v1.LibraryService/GetLibraryItem": {
			RequestsPerSecond: 10,
			Burst:             30,
			PerUser:           true,
		},

		// Default for unlisted endpoints
		"default": {
			RequestsPerSecond: 5,
			Burst:             20,
			PerUser:           true,
		},
	}
}

// Unary returns a unary server interceptor for rate limiting
func (r *RateLimitInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Get rate limit config for this endpoint
		config, exists := r.endpointLimits[info.FullMethod]
		if !exists {
			config = r.endpointLimits["default"]
		}

		// Get identifier (user ID or IP)
		identifier := r.getIdentifier(ctx, config.PerUser)
		if identifier == "" {
			// Can't identify the requester, allow the request
			return handler(ctx, req)
		}

		// Get or create rate limiter for this identifier
		limiter := r.getLimiter(info.FullMethod, identifier, config)

		// Check rate limit
		if !limiter.Allow() {
			// Rate limit exceeded - LOG THIS for debugging
			tokens := limiter.Tokens()
			fmt.Printf("[RATE_LIMIT] ERROR: EXCEEDED for %s | Identifier: %s | Tokens remaining: %.2f | Config: %.2f req/s, burst %d\n",
				info.FullMethod, identifier, tokens, config.RequestsPerSecond, config.Burst)
			return nil, status.Errorf(codes.ResourceExhausted,
				"rate limit exceeded for %s, please try again later", info.FullMethod)
		}

		// Log successful rate limit check (only for critical endpoints)
		if info.FullMethod == "/v1.AdminService/GetSystemStats" || info.FullMethod == "/v1.NotificationService/GetNotifications" {
			tokens := limiter.Tokens()
			fmt.Printf("[RATE_LIMIT] OK for %s | Identifier: %s | Tokens: %.2f/%d\n",
				info.FullMethod, identifier, tokens, config.Burst)
		}

		// Proceed with the request
		return handler(ctx, req)
	}
}

// Get identifier for rate limiting (user ID or IP)
func (r *RateLimitInterceptor) getIdentifier(ctx context.Context, perUser bool) string {
	if perUser {
		// Try to get user ID from context
		userID, err := GetUserIDFromContext(ctx)
		if err == nil && userID != "" {
			return "user:" + userID
		}
	}

	// Fall back to IP address
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return ""
	}

	clientIP := extractClientIP(md)
	if clientIP != "" {
		return "ip:" + clientIP
	}

	return ""
}

// Get or create rate limiter for an identifier
func (r *RateLimitInterceptor) getLimiter(method string, identifier string, config RateLimitConfig) *rate.Limiter {
	key := r.limiterKey(method, identifier)

	r.limiterMutex.RLock()
	if ul, exists := r.limiters[key]; exists {
		ul.lastAccess = time.Now()
		r.limiterMutex.RUnlock()
		return ul.limiter
	}
	r.limiterMutex.RUnlock()

	// Create new limiter
	r.limiterMutex.Lock()
	defer r.limiterMutex.Unlock()

	// Double-check after acquiring write lock
	if ul, exists := r.limiters[key]; exists {
		ul.lastAccess = time.Now()
		return ul.limiter
	}

	// Create new rate limiter
	limiter := rate.NewLimiter(rate.Limit(config.RequestsPerSecond), config.Burst)
	r.limiters[key] = &userLimiter{
		limiter:    limiter,
		lastAccess: time.Now(),
	}

	fmt.Printf("[RATE_LIMIT] Created limiter for %s | Identifier: %s | Limit: %.2f/s burst %d\n",
		method, identifier, config.RequestsPerSecond, config.Burst)

	return limiter
}

// Cleanup expired rate limiters
func (r *RateLimitInterceptor) cleanupExpiredLimiters() {
	for range r.cleanupTicker.C {
		r.limiterMutex.Lock()

		// Remove limiters that haven't been accessed in 10 minutes
		expireTime := time.Now().Add(-10 * time.Minute)
		for id, ul := range r.limiters {
			if ul.lastAccess.Before(expireTime) {
				delete(r.limiters, id)
			}
		}

		r.limiterMutex.Unlock()
	}
}

// Stop cleanup goroutine
func (r *RateLimitInterceptor) Stop() {
	r.cleanupTicker.Stop()
}

// GetRateLimitStatus returns the current rate limit status for a user/IP
func (r *RateLimitInterceptor) GetRateLimitStatus(ctx context.Context, method string) (remaining int, resetTime time.Time) {
	config, exists := r.endpointLimits[method]
	if !exists {
		config = r.endpointLimits["default"]
	}

	identifier := r.getIdentifier(ctx, config.PerUser)
	if identifier == "" {
		return config.Burst, time.Now()
	}

	key := r.limiterKey(method, identifier)
	r.limiterMutex.RLock()
	defer r.limiterMutex.RUnlock()

	if ul, exists := r.limiters[key]; exists {
		// Approximate remaining requests
		tokens := ul.limiter.Tokens()
		remaining = int(tokens)

		// Calculate reset time (when burst will be fully replenished)
		secondsToFullBurst := float64(config.Burst) / config.RequestsPerSecond
		resetTime = time.Now().Add(time.Duration(secondsToFullBurst) * time.Second)
	} else {
		remaining = config.Burst
		resetTime = time.Now()
	}

	return remaining, resetTime
}

// ResetRateLimit resets the rate limit for a specific identifier (admin use)
func (r *RateLimitInterceptor) ResetRateLimit(identifier string) {
	r.limiterMutex.Lock()
	defer r.limiterMutex.Unlock()

	for key := range r.limiters {
		if strings.HasSuffix(key, "|"+identifier) {
			delete(r.limiters, key)
		}
	}
	fmt.Printf("Rate limit reset for: %s\n", identifier)
}

func (r *RateLimitInterceptor) limiterKey(method string, identifier string) string {
	return method + "|" + identifier
}
