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

		// âœ… FIX: Skip CSRF validation for GetCurrentUser
		// REASON: This is a read-only operation already protected by JWT token
		// CSRF token may not be synced immediately after login (NextAuth timing issue)
		// Security: Still protected by JWT authentication in AuthInterceptor
		"/v1.UserService/GetCurrentUser": true,

		// âœ… FIX: Skip CSRF validation for GetNotifications (temporary)
		// REASON: Same as GetCurrentUser - CSRF token timing issue after login
		// TODO: Refactor to not call GetNotifications immediately after login
		// Security: Still protected by JWT authentication in AuthInterceptor
		"/v1.NotificationService/GetNotifications": true,
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
			fmt.Printf("[CSRF] WARNING: CSRF protection disabled for %s (development mode)\n", info.FullMethod)
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
			fmt.Printf("[CSRF] ERROR: Missing CSRF token for method %s\n", info.FullMethod)
			return nil, status.Errorf(codes.PermissionDenied, "missing CSRF token")
		}

		csrfToken := csrfTokens[0]

		// Validate CSRF token against expected value from cookie
		if !i.validateCSRFToken(ctx, csrfToken, md) {
			fmt.Printf("[SECURITY] ALERT: Invalid CSRF token for method %s\n", info.FullMethod)
			return nil, status.Errorf(codes.PermissionDenied, "invalid CSRF token")
		}

		fmt.Printf("[CSRF] OK: CSRF token validated for %s\n", info.FullMethod)
		return handler(ctx, req)
	}
}

// validateCSRFToken validates the CSRF token against the expected value from cookie
// Uses constant-time comparison to prevent timing attacks
func (i *CSRFInterceptor) validateCSRFToken(ctx context.Context, token string, md metadata.MD) bool {
	// Get expected CSRF token from NextAuth cookie
	expectedToken := i.getExpectedCSRFToken(md)
	if expectedToken == "" {
		fmt.Printf("[CSRF] WARNING: No expected CSRF token found in cookies\n")
		return false
	}

	// DEBUG: Log tokens for comparison
	fmt.Printf("[CSRF] DEBUG: Token from header: '%s' (len=%d)\n", token, len(token))
	fmt.Printf("[CSRF] DEBUG: Token from cookie: '%s' (len=%d)\n", expectedToken, len(expectedToken))

	// Constant-time comparison to prevent timing attacks
	match := subtle.ConstantTimeCompare([]byte(token), []byte(expectedToken)) == 1
	if !match {
		fmt.Printf("[CSRF] ERROR: Tokens do not match!\n")
	} else {
		fmt.Printf("[CSRF] OK: Tokens match!\n")
	}
	return match
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

	// DEBUG: Log cookies received
	fmt.Printf("[CSRF] DEBUG: Cookies received: %v\n", cookies)

	// Parse cookies to find NextAuth CSRF token
	for _, cookieHeader := range cookies {
		// DEBUG: Log each cookie header
		fmt.Printf("[CSRF] DEBUG: Processing cookie header: '%s'\n", cookieHeader)

		// Split multiple cookies (separated by semicolon)
		cookiePairs := strings.Split(cookieHeader, ";")

		for _, pair := range cookiePairs {
			pair = strings.TrimSpace(pair)

			// Check for NextAuth CSRF token cookie
			// Development: next-auth.csrf-token
			// Production: __Host-next-auth.csrf-token
			if strings.HasPrefix(pair, "next-auth.csrf-token=") ||
				strings.HasPrefix(pair, "__Host-next-auth.csrf-token=") {

				// DEBUG: Log found CSRF cookie
				fmt.Printf("[CSRF] DEBUG: Found CSRF cookie: '%s'\n", pair)

				// Extract token value
				parts := strings.SplitN(pair, "=", 2)
				if len(parts) != 2 {
					continue
				}

				tokenValue := parts[1]
				fmt.Printf("[CSRF] DEBUG: Token value (URL-encoded): '%s'\n", tokenValue)

				// FIX: URL-decode cookie value
				// Cookies are URL-encoded, need to decode before parsing
				// %7C is URL-encoded pipe character |
				decodedValue := strings.ReplaceAll(tokenValue, "%7C", "|")
				fmt.Printf("[CSRF] DEBUG: Token value (decoded): '%s'\n", decodedValue)

				// NextAuth CSRF token format: "token|hash"
				// We only need the token part (before the pipe)
				tokenParts := strings.Split(decodedValue, "|")
				if len(tokenParts) > 0 {
					fmt.Printf("[CSRF] DEBUG: Extracted token (before pipe): '%s'\n", tokenParts[0])
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
