package grpc

import (
	"context"
	"strings"

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

// generateDeviceFingerprint creates a simple device fingerprint from user agent
// Tạo device fingerprint đơn giản từ user agent
//
// Parameters:
//   - userAgent: User agent string
//
// Returns:
//   - string: Device fingerprint, or empty string if user agent is unknown
//
// Note: Đây là phiên bản đơn giản. Trong production, nên sử dụng
// fingerprinting phức tạp hơn (browser info, OS, screen resolution, etc.)
func generateDeviceFingerprint(userAgent string) string {
	// Simple fingerprint based on user agent
	// In production, you might want to use more sophisticated fingerprinting
	if userAgent == "" || userAgent == "unknown" {
		return ""
	}

	// For now, just use the user agent as fingerprint
	// TODO: Implement more sophisticated fingerprinting in future
	return userAgent
}
