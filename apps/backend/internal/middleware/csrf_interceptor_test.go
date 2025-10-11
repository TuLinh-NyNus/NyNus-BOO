package middleware

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// Mock handler for testing
func mockHandler(ctx context.Context, req interface{}) (interface{}, error) {
	return "success", nil
}

// Test NewCSRFInterceptor
func TestNewCSRFInterceptor(t *testing.T) {
	tests := []struct {
		name    string
		enabled bool
	}{
		{
			name:    "CSRF enabled",
			enabled: true,
		},
		{
			name:    "CSRF disabled",
			enabled: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			interceptor := NewCSRFInterceptor(tt.enabled)
			require.NotNil(t, interceptor)
			assert.Equal(t, tt.enabled, interceptor.enabled)
			assert.NotNil(t, interceptor.publicEndpoints)
		})
	}
}

// Test public endpoints bypass CSRF validation
func TestCSRFInterceptor_PublicEndpoints(t *testing.T) {
	interceptor := NewCSRFInterceptor(true) // CSRF enabled

	publicEndpoints := []string{
		"/v1.UserService/Login",
		"/v1.UserService/Register",
		"/v1.UserService/GoogleLogin",
		"/grpc.health.v1.Health/Check",
		"/v1.ContactService/SubmitContact",
		"/v1.NewsletterService/Subscribe",
		"/v1.QuestionService/GetPublicQuestions",
	}

	for _, endpoint := range publicEndpoints {
		t.Run(endpoint, func(t *testing.T) {
			ctx := context.Background()
			info := &grpc.UnaryServerInfo{
				FullMethod: endpoint,
			}

			// Call interceptor
			resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)

			// Should succeed without CSRF token
			assert.NoError(t, err)
			assert.Equal(t, "success", resp)
		})
	}
}

// Test CSRF disabled in development mode
func TestCSRFInterceptor_DisabledMode(t *testing.T) {
	interceptor := NewCSRFInterceptor(false) // CSRF disabled

	ctx := context.Background()
	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser", // Protected endpoint
	}

	// Call interceptor without CSRF token
	resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)

	// Should succeed even without CSRF token (development mode)
	assert.NoError(t, err)
	assert.Equal(t, "success", resp)
}

// Test missing CSRF token rejection
func TestCSRFInterceptor_MissingToken(t *testing.T) {
	interceptor := NewCSRFInterceptor(true) // CSRF enabled

	ctx := context.Background()
	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser", // Protected endpoint
	}

	// Call interceptor without metadata
	_, err := interceptor.Unary()(ctx, nil, info, mockHandler)

	// Should fail with InvalidArgument
	assert.Error(t, err)
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.InvalidArgument, st.Code())
	assert.Contains(t, st.Message(), "missing metadata")
}

// Test missing CSRF token in metadata
func TestCSRFInterceptor_MissingCSRFHeader(t *testing.T) {
	interceptor := NewCSRFInterceptor(true) // CSRF enabled

	// Create context with metadata but no CSRF token
	md := metadata.New(map[string]string{
		"authorization": "Bearer test-token",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	// Call interceptor
	_, err := interceptor.Unary()(ctx, nil, info, mockHandler)

	// Should fail with PermissionDenied
	assert.Error(t, err)
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.PermissionDenied, st.Code())
	assert.Contains(t, st.Message(), "missing CSRF token")
}

// Test invalid CSRF token rejection
func TestCSRFInterceptor_InvalidToken(t *testing.T) {
	interceptor := NewCSRFInterceptor(true) // CSRF enabled

	// Create context with CSRF token but no cookie
	md := metadata.New(map[string]string{
		"x-csrf-token": "invalid-token",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	// Call interceptor
	_, err := interceptor.Unary()(ctx, nil, info, mockHandler)

	// Should fail with PermissionDenied
	assert.Error(t, err)
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.PermissionDenied, st.Code())
	assert.Contains(t, st.Message(), "invalid CSRF token")
}

// Test valid CSRF token acceptance
func TestCSRFInterceptor_ValidToken(t *testing.T) {
	interceptor := NewCSRFInterceptor(true) // CSRF enabled

	// Create context with matching CSRF token and cookie
	csrfToken := "test-csrf-token"
	md := metadata.New(map[string]string{
		"x-csrf-token": csrfToken,
		"cookie":       "next-auth.csrf-token=" + csrfToken + "|hash",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	// Call interceptor
	resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)

	// Should succeed
	assert.NoError(t, err)
	assert.Equal(t, "success", resp)
}

// Test NextAuth cookie parsing (development)
func TestCSRFInterceptor_NextAuthCookieDev(t *testing.T) {
	interceptor := NewCSRFInterceptor(true)

	csrfToken := "dev-csrf-token"
	md := metadata.New(map[string]string{
		"x-csrf-token": csrfToken,
		"cookie":       "next-auth.csrf-token=" + csrfToken + "|hash123",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)
	assert.NoError(t, err)
	assert.Equal(t, "success", resp)
}

// Test NextAuth cookie parsing (production)
func TestCSRFInterceptor_NextAuthCookieProd(t *testing.T) {
	interceptor := NewCSRFInterceptor(true)

	csrfToken := "prod-csrf-token"
	md := metadata.New(map[string]string{
		"x-csrf-token": csrfToken,
		"cookie":       "__Host-next-auth.csrf-token=" + csrfToken + "|hash456",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)
	assert.NoError(t, err)
	assert.Equal(t, "success", resp)
}

// Test gRPC-Web cookie format
func TestCSRFInterceptor_GrpcWebCookie(t *testing.T) {
	interceptor := NewCSRFInterceptor(true)

	csrfToken := "grpc-web-token"
	md := metadata.New(map[string]string{
		"x-csrf-token":         csrfToken,
		"grpc-metadata-cookie": "next-auth.csrf-token=" + csrfToken + "|hash789",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)
	assert.NoError(t, err)
	assert.Equal(t, "success", resp)
}

// Test multiple cookies parsing
func TestCSRFInterceptor_MultipleCookies(t *testing.T) {
	interceptor := NewCSRFInterceptor(true)

	csrfToken := "multi-cookie-token"
	md := metadata.New(map[string]string{
		"x-csrf-token": csrfToken,
		"cookie":       "session=abc123; next-auth.csrf-token=" + csrfToken + "|hash; other=xyz",
	})
	ctx := metadata.NewIncomingContext(context.Background(), md)

	info := &grpc.UnaryServerInfo{
		FullMethod: "/v1.UserService/GetCurrentUser",
	}

	resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)
	assert.NoError(t, err)
	assert.Equal(t, "success", resp)
}

// Test constant-time comparison (timing attack prevention)
func TestCSRFInterceptor_ConstantTimeComparison(t *testing.T) {
	interceptor := NewCSRFInterceptor(true)

	// Test with slightly different tokens
	tests := []struct {
		name          string
		sentToken     string
		cookieToken   string
		shouldSucceed bool
	}{
		{
			name:          "Exact match",
			sentToken:     "exact-token",
			cookieToken:   "exact-token",
			shouldSucceed: true,
		},
		{
			name:          "Different length",
			sentToken:     "short",
			cookieToken:   "very-long-token",
			shouldSucceed: false,
		},
		{
			name:          "One character different",
			sentToken:     "token123",
			cookieToken:   "token124",
			shouldSucceed: false,
		},
		{
			name:          "Case sensitive",
			sentToken:     "Token",
			cookieToken:   "token",
			shouldSucceed: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			md := metadata.New(map[string]string{
				"x-csrf-token": tt.sentToken,
				"cookie":       "next-auth.csrf-token=" + tt.cookieToken + "|hash",
			})
			ctx := metadata.NewIncomingContext(context.Background(), md)

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.UserService/GetCurrentUser",
			}

			resp, err := interceptor.Unary()(ctx, nil, info, mockHandler)

			if tt.shouldSucceed {
				assert.NoError(t, err)
				assert.Equal(t, "success", resp)
			} else {
				assert.Error(t, err)
				st, ok := status.FromError(err)
				require.True(t, ok)
				assert.Equal(t, codes.PermissionDenied, st.Code())
			}
		})
	}
}
