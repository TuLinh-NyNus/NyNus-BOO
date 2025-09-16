package middleware

import (
	"context"
	"fmt"
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
			RequestsPerSecond: 0.1,  // 1 request per 10 seconds
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
		
		// Admin operations - moderate limits
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
		limiter := r.getLimiter(identifier, config)
		
		// Check rate limit
		if !limiter.Allow() {
			// Rate limit exceeded
			return nil, status.Errorf(codes.ResourceExhausted,
				"rate limit exceeded for %s, please try again later", info.FullMethod)
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
func (r *RateLimitInterceptor) getLimiter(identifier string, config RateLimitConfig) *rate.Limiter {
	r.limiterMutex.RLock()
	if ul, exists := r.limiters[identifier]; exists {
		ul.lastAccess = time.Now()
		r.limiterMutex.RUnlock()
		return ul.limiter
	}
	r.limiterMutex.RUnlock()
	
	// Create new limiter
	r.limiterMutex.Lock()
	defer r.limiterMutex.Unlock()
	
	// Double-check after acquiring write lock
	if ul, exists := r.limiters[identifier]; exists {
		ul.lastAccess = time.Now()
		return ul.limiter
	}
	
	// Create new rate limiter
	limiter := rate.NewLimiter(rate.Limit(config.RequestsPerSecond), config.Burst)
	r.limiters[identifier] = &userLimiter{
		limiter:    limiter,
		lastAccess: time.Now(),
	}
	
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
	
	r.limiterMutex.RLock()
	defer r.limiterMutex.RUnlock()
	
	if ul, exists := r.limiters[identifier]; exists {
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
	
	delete(r.limiters, identifier)
	fmt.Printf("Rate limit reset for: %s\n", identifier)
}