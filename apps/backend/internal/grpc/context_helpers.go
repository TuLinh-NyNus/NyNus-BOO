package grpc

import (
	"context"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"google.golang.org/grpc/metadata"
)

// getClientIP extracts client IP address from gRPC context metadata
// Trích xuất địa chỉ IP của client từ gRPC metadata
//
// Parameters:
//   - ctx: gRPC context containing metadata
//
// Returns:
//   - string: Client IP address, or "unknown" if not found
//
// Note: Kiểm tra các headers phổ biến theo thứ tự ưu tiên:
//  1. x-real-ip (từ reverse proxy)
//  2. x-forwarded-for (từ load balancer)
//  3. x-client-ip (custom header)
//  4. :authority (gRPC peer address)
func getClientIP(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "unknown"
	}

	// Check common headers in priority order
	headers := []string{"x-real-ip", "x-forwarded-for", "x-client-ip"}
	for _, header := range headers {
		if values := md.Get(header); len(values) > 0 {
			// For x-forwarded-for, take the first IP (original client)
			ip := strings.Split(values[0], ",")[0]
			return strings.TrimSpace(ip)
		}
	}

	// Check grpc peer address as fallback
	if values := md.Get(":authority"); len(values) > 0 {
		// Extract IP from authority (format: "ip:port")
		parts := strings.Split(values[0], ":")
		if len(parts) > 0 {
			return parts[0]
		}
	}

	return "unknown"
}

// getUserAgent extracts user agent string from gRPC context metadata
// Trích xuất user agent string từ gRPC metadata
//
// Parameters:
//   - ctx: gRPC context containing metadata
//
// Returns:
//   - string: User agent string, or "unknown" if not found
func getUserAgent(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "unknown"
	}

	// Check user-agent header
	if values := md.Get("user-agent"); len(values) > 0 {
		return values[0]
	}

	return "unknown"
}

// generateDeviceFingerprint creates a device fingerprint from user agent and IP
// Tạo device fingerprint từ user agent và IP address
//
// Parameters:
//   - userAgent: User agent string
//
// Returns:
//   - string: Device fingerprint (always non-empty, uses fallback if needed)
//
// Note: Sử dụng util.GenerateDeviceFingerprint() để tạo fingerprint
// từ user agent. Nếu user agent là "unknown", vẫn tạo fingerprint
// để tránh lỗi validation.
func generateDeviceFingerprint(userAgent string) string {
	// Use util.GenerateDeviceFingerprint() to create a proper fingerprint
	// Even if userAgent is "unknown", this will generate a valid fingerprint
	// to avoid validation errors
	return util.GenerateDeviceFingerprint(userAgent, "", "")
}
