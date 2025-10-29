package config

import (
	"fmt"
	"strings"
	"time"
)

// AuthConfig holds all authentication-related configuration
type AuthConfig struct {
	// JWT Configuration
	JWT JWTAuthConfig

	// Session Configuration
	Session SessionAuthConfig

	// OAuth Configuration
	OAuth OAuthAuthConfig

	// Security Configuration
	Security SecurityAuthConfig

	// Rate Limiting Configuration
	RateLimit RateLimitAuthConfig

	// Feature Flags
	Features AuthFeatureFlags
}

// JWTAuthConfig holds JWT-specific configuration
type JWTAuthConfig struct {
	// Secrets
	Secret        string
	AccessSecret  string // Optional separate access secret
	RefreshSecret string // Optional separate refresh secret

	// Token expiry
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration

	// Token settings
	Issuer           string
	RefreshThreshold time.Duration // When to refresh token before expiry
}

// SessionAuthConfig holds session-specific configuration
type SessionAuthConfig struct {
	// Session timeout
	Timeout time.Duration

	// Session limits
	MaxConcurrentSessions int

	// Session security
	RequireHTTPS bool
	SameSite     string
	HTTPOnly     bool

	// Session refresh
	RefreshInterval       time.Duration
	SecurityCheckInterval time.Duration
}

// OAuthAuthConfig holds OAuth-specific configuration
type OAuthAuthConfig struct {
	// Google OAuth
	Google GoogleOAuthConfig

	// OAuth timeouts
	Timeout       time.Duration
	RetryAttempts int
}

// GoogleOAuthConfig holds Google OAuth configuration
type GoogleOAuthConfig struct {
	Enabled      bool
	ClientID     string
	ClientSecret string
	RedirectURI  string
	Scopes       []string
}

// SecurityAuthConfig holds security-specific configuration
type SecurityAuthConfig struct {
	// Password hashing
	BcryptCost int

	// Security features
	EnableCSRF            bool
	EnableHSTS            bool
	EnableXSSProtection   bool
	EnableSessionRotation bool

	// Cookie security
	SecureCookies bool
	CookieDomain  string

	// Trust settings
	TrustHost bool
}

// RateLimitAuthConfig holds rate limiting configuration
type RateLimitAuthConfig struct {
	// Login rate limiting
	MaxLoginAttempts        int
	LockDurationMinutes     int
	LoginRateLimitPerMinute int

	// Registration rate limiting
	RegistrationRateLimitPerHour  int
	PasswordResetRateLimitPerHour int

	// Risk scoring
	RiskScoreThreshold          int
	HighRiskScore               int
	SuspiciousActivityThreshold int
}

// AuthFeatureFlags holds authentication feature flags
type AuthFeatureFlags struct {
	// Authentication methods
	EnableEmailPassword bool
	EnableGoogleOAuth   bool
	EnableTwoFactor     bool

	// Email features
	EnableEmailVerification  bool
	EnablePasswordReset      bool
	EnableEmailNotifications bool

	// Session features
	EnableSessionManagement       bool
	EnableDeviceManagement        bool
	EnableConcurrentSessionLimits bool

	// Security features
	EnableRiskScoring                 bool
	EnableSuspiciousActivityDetection bool
	EnableAutoLogout                  bool

	// Development features
	EnableDebugLogging  bool
	EnableAuthDebugging bool
}

// LoadAuthConfig loads authentication configuration from environment variables
func LoadAuthConfig() *AuthConfig {
	// Determine environment
	env := strings.ToLower(getEnv("ENV", "development"))
	isProduction := env == "production" || env == "prod"
	isDevelopment := env == "development" || env == "dev"

	// JWT Configuration
	jwtConfig := JWTAuthConfig{
		Secret:        getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		AccessSecret:  getEnv("JWT_ACCESS_SECRET", ""),  // Optional separate secret
		RefreshSecret: getEnv("JWT_REFRESH_SECRET", ""), // Optional separate secret

		AccessTokenExpiry:  15 * time.Minute,   // 15 minutes
		RefreshTokenExpiry: 7 * 24 * time.Hour, // 7 days

		Issuer:           "exam-bank-system",
		RefreshThreshold: 5 * time.Minute, // Refresh 5 minutes before expiry
	}

	// Use separate secrets if provided, otherwise use main secret
	if jwtConfig.AccessSecret == "" {
		jwtConfig.AccessSecret = jwtConfig.Secret
	}
	if jwtConfig.RefreshSecret == "" {
		jwtConfig.RefreshSecret = jwtConfig.Secret
	}

	// Session Configuration
	sessionConfig := SessionAuthConfig{
		Timeout:               24 * time.Hour, // 24 hours
		MaxConcurrentSessions: getIntEnv("MAX_CONCURRENT_SESSIONS", 5),

		RequireHTTPS: isProduction,
		SameSite:     "lax",
		HTTPOnly:     true,

		RefreshInterval:       30 * time.Second, // 30 seconds
		SecurityCheckInterval: 10 * time.Second, // 10 seconds
	}

	// OAuth Configuration
	googleClientID := getEnv("GOOGLE_CLIENT_ID", "")
	googleClientSecret := getEnv("GOOGLE_CLIENT_SECRET", "")

	oauthConfig := OAuthAuthConfig{
		Google: GoogleOAuthConfig{
			Enabled:      googleClientID != "" && googleClientSecret != "",
			ClientID:     googleClientID,
			ClientSecret: googleClientSecret,
			RedirectURI:  getEnv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google"),
			Scopes:       []string{"openid", "email", "profile"},
		},

		Timeout:       30 * time.Second,
		RetryAttempts: 3,
	}

	// Security Configuration
	securityConfig := SecurityAuthConfig{
		BcryptCost: getIntEnv("BCRYPT_COST", func() int {
			if isProduction {
				return 12 // Higher cost in production
			}
			return 10 // Lower cost in development for speed
		}()),

		EnableCSRF:            true, // SECURITY: Enable CSRF protection in all environments
		EnableHSTS:            isProduction,
		EnableXSSProtection:   true,
		EnableSessionRotation: true,

		SecureCookies: isProduction,
		CookieDomain: func() string {
			if isProduction {
				return ".nynus.edu.vn"
			}
			return ""
		}(),

		TrustHost: isDevelopment, // Only trust host in development
	}

	// Rate Limiting Configuration
	rateLimitConfig := RateLimitAuthConfig{
		MaxLoginAttempts:        5,
		LockDurationMinutes:     30,
		LoginRateLimitPerMinute: 5,

		RegistrationRateLimitPerHour:  3,
		PasswordResetRateLimitPerHour: 3,

		RiskScoreThreshold:          70,
		HighRiskScore:               85,
		SuspiciousActivityThreshold: 80,
	}

	// Feature Flags
	featureFlags := AuthFeatureFlags{
		// Authentication methods
		EnableEmailPassword: true,
		EnableGoogleOAuth:   oauthConfig.Google.Enabled,
		EnableTwoFactor:     false, // Future feature

		// Email features
		EnableEmailVerification:  isProduction,
		EnablePasswordReset:      true,
		EnableEmailNotifications: false, // Future feature

		// Session features
		EnableSessionManagement:       true,
		EnableDeviceManagement:        true,
		EnableConcurrentSessionLimits: false, // Simplified - disabled

		// Security features
		EnableRiskScoring:                 false, // Simplified - disabled
		EnableSuspiciousActivityDetection: false, // Simplified - disabled
		EnableAutoLogout:                  true,

		// Development features
		EnableDebugLogging:  isDevelopment,
		EnableAuthDebugging: isDevelopment,
	}

	return &AuthConfig{
		JWT:       jwtConfig,
		Session:   sessionConfig,
		OAuth:     oauthConfig,
		Security:  securityConfig,
		RateLimit: rateLimitConfig,
		Features:  featureFlags,
	}
}

// GetJWTSecret returns the appropriate JWT secret based on token type
func (c *AuthConfig) GetJWTSecret(tokenType string) string {
	switch strings.ToLower(tokenType) {
	case "access":
		return c.JWT.AccessSecret
	case "refresh":
		return c.JWT.RefreshSecret
	default:
		return c.JWT.Secret
	}
}

// IsFeatureEnabled checks if a specific auth feature is enabled
func (c *AuthConfig) IsFeatureEnabled(feature string) bool {
	switch strings.ToLower(feature) {
	case "email_password":
		return c.Features.EnableEmailPassword
	case "google_oauth":
		return c.Features.EnableGoogleOAuth
	case "two_factor":
		return c.Features.EnableTwoFactor
	case "email_verification":
		return c.Features.EnableEmailVerification
	case "password_reset":
		return c.Features.EnablePasswordReset
	case "session_management":
		return c.Features.EnableSessionManagement
	case "device_management":
		return c.Features.EnableDeviceManagement
	case "auto_logout":
		return c.Features.EnableAutoLogout
	case "debug_logging":
		return c.Features.EnableDebugLogging
	default:
		return false
	}
}

// GetSessionTimeout returns session timeout in different units
func (c *AuthConfig) GetSessionTimeout() (seconds int, minutes int, milliseconds int64) {
	seconds = int(c.Session.Timeout.Seconds())
	minutes = int(c.Session.Timeout.Minutes())
	milliseconds = c.Session.Timeout.Milliseconds()
	return
}

// GetJWTExpiry returns JWT token expiry in different units
func (c *AuthConfig) GetJWTExpiry(isRefreshToken bool) (seconds int, minutes int, milliseconds int64) {
	var duration time.Duration
	if isRefreshToken {
		duration = c.JWT.RefreshTokenExpiry
	} else {
		duration = c.JWT.AccessTokenExpiry
	}

	seconds = int(duration.Seconds())
	minutes = int(duration.Minutes())
	milliseconds = duration.Milliseconds()
	return
}

// ShouldRefreshToken checks if token should be refreshed based on expiry time
func (c *AuthConfig) ShouldRefreshToken(expiryTime time.Time) bool {
	return time.Now().After(expiryTime.Add(-c.JWT.RefreshThreshold))
}

// ValidateAuthConfig validates the authentication configuration
func (c *AuthConfig) ValidateAuthConfig() error {
	// Validate JWT secret
	if c.JWT.Secret == "" || c.JWT.Secret == "your-secret-key-change-in-production" {
		return fmt.Errorf("JWT secret must be set and not use default value")
	}

	// Validate OAuth configuration if enabled
	if c.Features.EnableGoogleOAuth {
		if c.OAuth.Google.ClientID == "" || c.OAuth.Google.ClientSecret == "" {
			return fmt.Errorf("Google OAuth is enabled but client ID or secret is missing")
		}
	}

	// Validate bcrypt cost
	if c.Security.BcryptCost < 10 || c.Security.BcryptCost > 15 {
		return fmt.Errorf("bcrypt cost must be between 10 and 15, got %d", c.Security.BcryptCost)
	}

	return nil
}

// Note: getIntEnv is already defined in config.go, so we don't need to redefine it here
