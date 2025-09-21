package util

import (
	"crypto/sha256"
	"fmt"
	"regexp"
	"strings"
)

// DeviceInfo represents parsed device information
type DeviceInfo struct {
	Browser    string
	OS         string
	Device     string
	Resolution string
}

// ParseUserAgent extracts device information from user-agent string
func ParseUserAgent(userAgent string) *DeviceInfo {
	info := &DeviceInfo{
		Browser:    "Unknown",
		OS:         "Unknown",
		Device:     "Desktop",
		Resolution: "Unknown",
	}

	if userAgent == "" {
		return info
	}

	// Convert to lowercase for easier matching
	ua := strings.ToLower(userAgent)

	// Parse Browser
	if strings.Contains(ua, "chrome") && !strings.Contains(ua, "edg") {
		info.Browser = "Chrome"
	} else if strings.Contains(ua, "firefox") {
		info.Browser = "Firefox"
	} else if strings.Contains(ua, "safari") && !strings.Contains(ua, "chrome") {
		info.Browser = "Safari"
	} else if strings.Contains(ua, "edg") {
		info.Browser = "Edge"
	} else if strings.Contains(ua, "opera") {
		info.Browser = "Opera"
	}

	// Parse OS
	if strings.Contains(ua, "windows") {
		info.OS = "Windows"
		if strings.Contains(ua, "windows nt 10") {
			info.OS = "Windows 10"
		} else if strings.Contains(ua, "windows nt 6") {
			info.OS = "Windows 7/8"
		}
	} else if strings.Contains(ua, "mac os x") || strings.Contains(ua, "macos") {
		info.OS = "macOS"
		// Extract version if possible
		re := regexp.MustCompile(`mac os x (\d+[._]\d+)`)
		if matches := re.FindStringSubmatch(ua); len(matches) > 1 {
			version := strings.Replace(matches[1], "_", ".", -1)
			info.OS = fmt.Sprintf("macOS %s", version)
		}
	} else if strings.Contains(ua, "linux") {
		info.OS = "Linux"
		if strings.Contains(ua, "ubuntu") {
			info.OS = "Ubuntu"
		}
	} else if strings.Contains(ua, "android") {
		info.OS = "Android"
		info.Device = "Mobile"
		// Extract version if possible
		re := regexp.MustCompile(`android (\d+(?:\.\d+)?)`)
		if matches := re.FindStringSubmatch(ua); len(matches) > 1 {
			info.OS = fmt.Sprintf("Android %s", matches[1])
		}
	} else if strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad") {
		if strings.Contains(ua, "iphone") {
			info.OS = "iOS"
			info.Device = "iPhone"
		} else {
			info.OS = "iPadOS"
			info.Device = "iPad"
		}
		// Extract version if possible
		re := regexp.MustCompile(`os (\d+[._]\d+)`)
		if matches := re.FindStringSubmatch(ua); len(matches) > 1 {
			version := strings.Replace(matches[1], "_", ".", -1)
			info.OS = fmt.Sprintf("%s %s", strings.Split(info.OS, " ")[0], version)
		}
	}

	// Detect device type more specifically
	if strings.Contains(ua, "mobile") || strings.Contains(ua, "phone") {
		if info.Device == "Desktop" { // Only change if not already set
			info.Device = "Mobile"
		}
	} else if strings.Contains(ua, "tablet") || strings.Contains(ua, "ipad") {
		info.Device = "Tablet"
	}

	return info
}

// GenerateDeviceFingerprint creates a unique fingerprint from device information
func GenerateDeviceFingerprint(userAgent, ipAddress, additionalData string) string {
	// Parse device info from user agent
	deviceInfo := ParseUserAgent(userAgent)

	// Create fingerprint components
	components := []string{
		deviceInfo.Browser,
		deviceInfo.OS,
		deviceInfo.Device,
		deviceInfo.Resolution,
		getIPSubnet(ipAddress), // Use subnet instead of full IP for some privacy
		additionalData,
	}

	// Join all components
	fingerprintData := strings.Join(components, "|")

	// Hash the fingerprint data for consistent length and privacy
	hash := sha256.Sum256([]byte(fingerprintData))
	return fmt.Sprintf("fp_%x", hash[:16]) // Use first 16 bytes for shorter fingerprint
}

// getIPSubnet extracts subnet from IP address for fingerprinting
// This provides some privacy while still allowing detection of network changes
func getIPSubnet(ipAddress string) string {
	if ipAddress == "" {
		return "unknown"
	}

	// For IPv4, use first 3 octets (e.g., 192.168.1.xxx -> 192.168.1)
	parts := strings.Split(ipAddress, ".")
	if len(parts) >= 3 {
		return strings.Join(parts[:3], ".")
	}

	// For IPv6 or other formats, use first part
	if colonIndex := strings.Index(ipAddress, ":"); colonIndex > 0 {
		return ipAddress[:colonIndex]
	}

	return ipAddress
}

// DetectSuspiciousIPChange checks if IP change is suspicious
func DetectSuspiciousIPChange(oldFingerprint, newFingerprint string) bool {
	if oldFingerprint == "" || newFingerprint == "" {
		return false
	}

	// Extract device info from fingerprints (simplified)
	// In production, you might store device info separately
	// For now, just check if fingerprints are completely different
	return oldFingerprint != newFingerprint
}

// IsLikelySameDevice checks if two fingerprints likely belong to same device
func IsLikelySameDevice(fp1, fp2 string) bool {
	if fp1 == "" || fp2 == "" {
		return false
	}

	return fp1 == fp2
}

// GetDeviceDisplayName returns a human-readable device name
func GetDeviceDisplayName(userAgent string) string {
	info := ParseUserAgent(userAgent)

	if info.Device == "iPhone" || info.Device == "iPad" {
		return fmt.Sprintf("%s (%s, %s)", info.Device, info.OS, info.Browser)
	}

	if info.Device == "Mobile" {
		return fmt.Sprintf("Mobile Device (%s, %s)", info.OS, info.Browser)
	}

	if info.Device == "Tablet" {
		return fmt.Sprintf("Tablet (%s, %s)", info.OS, info.Browser)
	}

	// Desktop
	return fmt.Sprintf("%s (%s)", info.Browser, info.OS)
}
