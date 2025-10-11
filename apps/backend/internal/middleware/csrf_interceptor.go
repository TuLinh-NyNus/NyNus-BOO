package middleware

import (
	"context"
	"crypto/subtle"
	"fmt"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// CSRFInterceptor provides CSRF protection for gRPC endpoints
// Validates CSRF tokens from NextAuth to prevent Cross-Site Request Forgery attacks
type CSRFInterceptor struct {
	enabled         bool
	publicEndpoints map[string]bool
}

// NewCSRFInterceptor creates a new CSRF interceptor
// enabled: Whether CSRF protection is enabled (typically true in production)
func NewCSRFInterceptor(enabled bool) *CSRFInterceptor {
	// Define public endpoints that don't require CSRF protection
	publicEndpoints := map[string]bool{
		// Authentication endpoints (no session yet)
		"/v1.UserService/Login":       true,
		"/v1.UserService/Register":    true,
		"/v1.UserService/GoogleLogin": true,

		// Health check
		"/grpc.health.v1.Health/Check": true,

		// Public contact/newsletter endpoints
		"/v1.ContactService/SubmitContact": true,
		"/v1.NewsletterService/Subscribe":  true,

		// Public read-only endpoints
		"/v1.QuestionService/GetPublicQuestions": true,
	}

	return &CSRFInterceptor{
		enabled:         enabled,
		publicEndpoints: publicEndpoints,
	}
}

// Unary returns a unary server interceptor for CSRF validation
func (i *CSRFInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Skip CSRF validation for public endpoints
		if i.publicEndpoints[info.FullMethod] {
			return handler(ctx, req)
		}

		// Skip if CSRF protection is disabled (development mode)
		if !i.enabled {
			fmt.Printf("[CSRF] ⚠️  CSRF protection disabled for %s (development mode)\n", info.FullMethod)
			return handler(ctx, req)
		}

		// Extract metadata from context
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Errorf(codes.InvalidArgument, "missing metadata")
		}

		// Extract CSRF token from x-csrf-token header
		csrfTokens := md["x-csrf-token"]
		if len(csrfTokens) == 0 {
			fmt.Printf("[CSRF] ❌ Missing CSRF token for method %s\n", info.FullMethod)
			return nil, status.Errorf(codes.PermissionDenied, "missing CSRF token")
		}

		csrfToken := csrfTokens[0]

		// Validate CSRF token against expected value from cookie
		if !i.validateCSRFToken(ctx, csrfToken, md) {
			fmt.Printf("[SECURITY] 🚨 Invalid CSRF token for method %s\n", info.FullMethod)
			return nil, status.Errorf(codes.PermissionDenied, "invalid CSRF token")
		}

		fmt.Printf("[CSRF] ✅ CSRF token validated for %s\n", info.FullMethod)
		return handler(ctx, req)
	}
}

// validateCSRFToken validates the CSRF token against the expected value from cookie
// Uses constant-time comparison to prevent timing attacks
func (i *CSRFInterceptor) validateCSRFToken(ctx context.Context, token string, md metadata.MD) bool {
	// Get expected CSRF token from NextAuth cookie
	expectedToken := i.getExpectedCSRFToken(md)
	if expectedToken == "" {
		fmt.Printf("[CSRF] ⚠️  No expected CSRF token found in cookies\n")
		return false
	}

	// Constant-time comparison to prevent timing attacks
	return subtle.ConstantTimeCompare([]byte(token), []byte(expectedToken)) == 1
}

// getExpectedCSRFToken extracts the expected CSRF token from NextAuth cookies
// NextAuth CSRF token format: "token|hash" in cookie
func (i *CSRFInterceptor) getExpectedCSRFToken(md metadata.MD) string {
	// Extract cookie header from metadata
	cookies := md["cookie"]
	if len(cookies) == 0 {
		// Try grpc-metadata-cookie (gRPC-Web format)
		cookies = md["grpc-metadata-cookie"]
	}

	// Parse cookies to find NextAuth CSRF token
	for _, cookieHeader := range cookies {
		// Split multiple cookies (separated by semicolon)
		cookiePairs := strings.Split(cookieHeader, ";")

		for _, pair := range cookiePairs {
			pair = strings.TrimSpace(pair)

			// Check for NextAuth CSRF token cookie
			// Development: next-auth.csrf-token
			// Production: __Host-next-auth.csrf-token
			if strings.HasPrefix(pair, "next-auth.csrf-token=") ||
				strings.HasPrefix(pair, "__Host-next-auth.csrf-token=") {

				// Extract token value
				parts := strings.SplitN(pair, "=", 2)
				if len(parts) != 2 {
					continue
				}

				tokenValue := parts[1]

				// NextAuth CSRF token format: "token|hash"
				// We only need the token part (before the pipe)
				tokenParts := strings.Split(tokenValue, "|")
				if len(tokenParts) > 0 {
					return tokenParts[0]
				}
			}
		}
	}

	return ""
}

// isPublicEndpoint checks if an endpoint is public (no CSRF required)
func (i *CSRFInterceptor) isPublicEndpoint(method string) bool {
	return i.publicEndpoints[method]
}
