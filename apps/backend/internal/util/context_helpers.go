package util

import (
	"context"

	"google.golang.org/grpc/metadata"
)

// ContextKey type for context keys
type ContextKey string

const (
	// Context keys
	UserIDKey     ContextKey = "user_id"
	UserRoleKey   ContextKey = "user_role"
	UserEmailKey  ContextKey = "user_email"
	IPAddressKey  ContextKey = "ip_address"
	UserAgentKey  ContextKey = "user_agent"
	RequestIDKey  ContextKey = "request_id"
)

// GetUserIDFromContext extracts user ID from context
func GetUserIDFromContext(ctx context.Context) string {
	// Try context value first
	if userID, ok := ctx.Value(UserIDKey).(string); ok && userID != "" {
		return userID
	}

	// Try metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("user-id"); len(vals) > 0 {
			return vals[0]
		}
		if vals := md.Get("user_id"); len(vals) > 0 {
			return vals[0]
		}
	}

	return ""
}

// GetUserRoleFromContext extracts user role from context
func GetUserRoleFromContext(ctx context.Context) string {
	// Try context value first
	if role, ok := ctx.Value(UserRoleKey).(string); ok && role != "" {
		return role
	}

	// Try metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("user-role"); len(vals) > 0 {
			return vals[0]
		}
		if vals := md.Get("user_role"); len(vals) > 0 {
			return vals[0]
		}
	}

	return "GUEST"
}

// GetUserEmailFromContext extracts user email from context
func GetUserEmailFromContext(ctx context.Context) string {
	// Try context value first
	if email, ok := ctx.Value(UserEmailKey).(string); ok && email != "" {
		return email
	}

	// Try metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("user-email"); len(vals) > 0 {
			return vals[0]
		}
		if vals := md.Get("user_email"); len(vals) > 0 {
			return vals[0]
		}
	}

	return ""
}

// GetIPAddressFromContext extracts IP address from context
func GetIPAddressFromContext(ctx context.Context) string {
	// Try context value first
	if ip, ok := ctx.Value(IPAddressKey).(string); ok && ip != "" {
		return ip
	}

	// Try metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		// Try various IP header formats
		headers := []string{"x-forwarded-for", "x-real-ip", "x-client-ip", "ip-address"}
		for _, header := range headers {
			if vals := md.Get(header); len(vals) > 0 {
				return vals[0]
			}
		}
	}

	return "unknown"
}

// GetUserAgentFromContext extracts user agent from context
func GetUserAgentFromContext(ctx context.Context) string {
	// Try context value first
	if ua, ok := ctx.Value(UserAgentKey).(string); ok && ua != "" {
		return ua
	}

	// Try metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("user-agent"); len(vals) > 0 {
			return vals[0]
		}
	}

	return ""
}

// GetRequestIDFromContext extracts request ID from context
func GetRequestIDFromContext(ctx context.Context) string {
	// Try context value first
	if reqID, ok := ctx.Value(RequestIDKey).(string); ok && reqID != "" {
		return reqID
	}

	// Try metadata
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if vals := md.Get("request-id"); len(vals) > 0 {
			return vals[0]
		}
		if vals := md.Get("x-request-id"); len(vals) > 0 {
			return vals[0]
		}
	}

	return ""
}

// WithUserID adds user ID to context
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, UserIDKey, userID)
}

// WithUserRole adds user role to context
func WithUserRole(ctx context.Context, role string) context.Context {
	return context.WithValue(ctx, UserRoleKey, role)
}

// WithUserEmail adds user email to context
func WithUserEmail(ctx context.Context, email string) context.Context {
	return context.WithValue(ctx, UserEmailKey, email)
}

// WithIPAddress adds IP address to context
func WithIPAddress(ctx context.Context, ip string) context.Context {
	return context.WithValue(ctx, IPAddressKey, ip)
}

// WithUserAgent adds user agent to context
func WithUserAgent(ctx context.Context, ua string) context.Context {
	return context.WithValue(ctx, UserAgentKey, ua)
}

// WithRequestID adds request ID to context
func WithRequestID(ctx context.Context, reqID string) context.Context {
	return context.WithValue(ctx, RequestIDKey, reqID)
}

// EnrichContext enriches context with all available metadata
func EnrichContext(ctx context.Context) context.Context {
	ctx = WithUserID(ctx, GetUserIDFromContext(ctx))
	ctx = WithUserRole(ctx, GetUserRoleFromContext(ctx))
	ctx = WithUserEmail(ctx, GetUserEmailFromContext(ctx))
	ctx = WithIPAddress(ctx, GetIPAddressFromContext(ctx))
	ctx = WithUserAgent(ctx, GetUserAgentFromContext(ctx))
	ctx = WithRequestID(ctx, GetRequestIDFromContext(ctx))
	return ctx
}

