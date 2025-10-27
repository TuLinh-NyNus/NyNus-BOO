package grpc

import (
	"context"
	"strings"

	"exam-bank-system/apps/backend/internal/util"
	"google.golang.org/grpc/metadata"
)

// getClientIP extracts client IP address from gRPC context metadata
// TrÃ­ch xuáº¥t Ä‘á»‹a chá»‰ IP cá»§a client tá»« gRPC metadata
//
// Parameters:
//   - ctx: gRPC context containing metadata
//
// Returns:
//   - string: Client IP address, or "unknown" if not found
//
// Note: Kiá»ƒm tra cÃ¡c headers phá»• biáº¿n theo thá»© tá»± Æ°u tiÃªn:
//  1. x-real-ip (tá»« reverse proxy)
//  2. x-forwarded-for (tá»« load balancer)
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
			ip = strings.TrimSpace(ip)
			// Remove brackets from IPv6 addresses (e.g., [::1] -> ::1)
			ip = strings.Trim(ip, "[]")
			return ip
		}
	}

	// Check grpc peer address as fallback
	if values := md.Get(":authority"); len(values) > 0 {
		// Extract IP from authority (format: "ip:port" or "[ipv6]:port")
		authority := values[0]
		// Handle IPv6 format: [::1]:port
		if strings.HasPrefix(authority, "[") {
			endIdx := strings.Index(authority, "]")
			if endIdx > 0 {
				return authority[1:endIdx]
			}
		}
		// Handle IPv4 format: ip:port
		parts := strings.Split(authority, ":")
		if len(parts) > 0 {
			return parts[0]
		}
	}

	return "unknown"
}

// getUserAgent extracts user agent string from gRPC context metadata
// TrÃ­ch xuáº¥t user agent string tá»« gRPC metadata
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
// Táº¡o device fingerprint tá»« user agent vÃ  IP address
//
// Parameters:
//   - userAgent: User agent string
//
// Returns:
//   - string: Device fingerprint (always non-empty, uses fallback if needed)
//
// Note: Sá»­ dá»¥ng util.GenerateDeviceFingerprint() Ä‘á»ƒ táº¡o fingerprint
// tá»« user agent. Náº¿u user agent lÃ  "unknown", váº«n táº¡o fingerprint
// Ä‘á»ƒ trÃ¡nh lá»—i validation.
func generateDeviceFingerprint(userAgent string) string {
	// Use util.GenerateDeviceFingerprint() to create a proper fingerprint
	// Even if userAgent is "unknown", this will generate a valid fingerprint
	// to avoid validation errors
	return util.GenerateDeviceFingerprint(userAgent, "", "")
}

