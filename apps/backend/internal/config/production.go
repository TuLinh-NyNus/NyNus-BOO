package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

// ProductionConfig holds production-specific configurations
type ProductionConfig struct {
	// gRPC Gateway Control
	HTTPGatewayEnabled bool

	// Security Settings
	TLSEnabled  bool
	TLSCertFile string
	TLSKeyFile  string

	// Performance Settings
	MaxConcurrentStreams  uint32
	MaxReceiveMessageSize int
	MaxSendMessageSize    int
	ConnectionTimeout     int // seconds

	// Logging Settings
	LogLevel        string
	LogFormat       string // json or text
	EnableAccessLog bool
	EnableErrorLog  bool

	// Rate Limiting
	EnableRateLimit bool
	RateLimitRPS    int // requests per second
	RateLimitBurst  int

	// Health Check
	EnableHealthCheck bool
	HealthCheckPath   string

	// Monitoring
	EnableMetrics bool
	MetricsPort   string
	EnableTracing bool
}

// LoadProductionConfig loads production-specific configurations
func LoadProductionConfig() *ProductionConfig {
	return &ProductionConfig{
		// gRPC Gateway - DISABLED in production by default
		HTTPGatewayEnabled: getBoolEnv("HTTP_GATEWAY_ENABLED", false),

		// Security Settings - Enhanced for production
		TLSEnabled:  getBoolEnv("TLS_ENABLED", true), // Enable TLS in production
		TLSCertFile: getEnv("TLS_CERT_FILE", "/etc/ssl/certs/server.crt"),
		TLSKeyFile:  getEnv("TLS_KEY_FILE", "/etc/ssl/private/server.key"),

		// Performance Settings - Optimized for production workload
		MaxConcurrentStreams:  getUint32Env("MAX_CONCURRENT_STREAMS", 2000),       // Increased for higher load
		MaxReceiveMessageSize: getIntEnv("MAX_RECEIVE_MESSAGE_SIZE", 8*1024*1024), // 8MB for larger payloads
		MaxSendMessageSize:    getIntEnv("MAX_SEND_MESSAGE_SIZE", 8*1024*1024),    // 8MB for larger responses
		ConnectionTimeout:     getIntEnv("CONNECTION_TIMEOUT", 60),                // 60 seconds for production stability

		// Logging Settings - Optimized structured logging for production
		LogLevel:        getEnv("LOG_LEVEL", "info"),  // Info level for production
		LogFormat:       getEnv("LOG_FORMAT", "json"), // JSON format for log aggregation
		EnableAccessLog: getBoolEnv("ENABLE_ACCESS_LOG", true),
		EnableErrorLog:  getBoolEnv("ENABLE_ERROR_LOG", true),

		// Rate Limiting - Enhanced for production traffic
		EnableRateLimit: getBoolEnv("ENABLE_RATE_LIMIT", true),
		RateLimitRPS:    getIntEnv("RATE_LIMIT_RPS", 200),   // 200 RPS per client for higher throughput
		RateLimitBurst:  getIntEnv("RATE_LIMIT_BURST", 500), // Burst of 500 for traffic spikes

		// Health Check - Enhanced monitoring
		EnableHealthCheck: getBoolEnv("ENABLE_HEALTH_CHECK", true),
		HealthCheckPath:   getEnv("HEALTH_CHECK_PATH", "/health"),

		// Monitoring - Comprehensive production monitoring
		EnableMetrics: getBoolEnv("ENABLE_METRICS", true),
		MetricsPort:   getEnv("METRICS_PORT", "9090"),
		EnableTracing: getBoolEnv("ENABLE_TRACING", true),
	}
}

// IsProduction checks if the application is running in production mode
func IsProduction() bool {
	env := strings.ToLower(getEnv("ENV", "development"))
	return env == "production" || env == "prod"
}

// IsDevelopment checks if the application is running in development mode
func IsDevelopment() bool {
	env := strings.ToLower(getEnv("ENV", "development"))
	return env == "development" || env == "dev"
}

// IsStaging checks if the application is running in staging mode
func IsStaging() bool {
	env := strings.ToLower(getEnv("ENV", "development"))
	return env == "staging" || env == "stage"
}

// ValidateProductionConfig validates production configuration
func ValidateProductionConfig(cfg *ProductionConfig) error {
	if IsProduction() {
		// In production, ensure security settings are properly configured
		if cfg.TLSEnabled {
			if cfg.TLSCertFile == "" || cfg.TLSKeyFile == "" {
				log.Println("⚠️  WARNING: TLS enabled but cert/key files not specified")
			}

			// Check if cert files exist
			if _, err := os.Stat(cfg.TLSCertFile); os.IsNotExist(err) {
				log.Printf("⚠️  WARNING: TLS cert file not found: %s", cfg.TLSCertFile)
			}

			if _, err := os.Stat(cfg.TLSKeyFile); os.IsNotExist(err) {
				log.Printf("⚠️  WARNING: TLS key file not found: %s", cfg.TLSKeyFile)
			}
		}

		// Warn if HTTP Gateway is enabled in production
		if cfg.HTTPGatewayEnabled {
			log.Println("⚠️  WARNING: HTTP Gateway is enabled in production - consider disabling for security")
		}

		// Validate rate limiting settings
		if cfg.EnableRateLimit {
			if cfg.RateLimitRPS <= 0 {
				log.Println("⚠️  WARNING: Rate limit RPS should be positive")
			}
			if cfg.RateLimitBurst <= 0 {
				log.Println("⚠️  WARNING: Rate limit burst should be positive")
			}
		}
	}

	return nil
}

// GetOptimizedGRPCOptions returns gRPC server options optimized for the current environment
func GetOptimizedGRPCOptions(cfg *ProductionConfig) map[string]interface{} {
	options := make(map[string]interface{})

	if IsProduction() {
		// Production optimizations
		options["max_concurrent_streams"] = cfg.MaxConcurrentStreams
		options["max_receive_message_size"] = cfg.MaxReceiveMessageSize
		options["max_send_message_size"] = cfg.MaxSendMessageSize
		options["connection_timeout"] = cfg.ConnectionTimeout
		options["keepalive_time"] = 30                 // 30 seconds
		options["keepalive_timeout"] = 5               // 5 seconds
		options["keepalive_enforcement_min_time"] = 10 // 10 seconds
		options["max_connection_idle"] = 60            // 60 seconds
		options["max_connection_age"] = 300            // 5 minutes
		options["max_connection_age_grace"] = 30       // 30 seconds
	} else {
		// Development settings - more lenient
		options["max_concurrent_streams"] = uint32(100)
		options["max_receive_message_size"] = 1024 * 1024 // 1MB
		options["max_send_message_size"] = 1024 * 1024    // 1MB
		options["connection_timeout"] = 60                // 60 seconds
	}

	return options
}

// LogProductionSettings logs the current production settings with enhanced details
func LogProductionSettings(cfg *ProductionConfig) {
	if IsProduction() {
		log.Println("🚀 Production Configuration - Optimized Settings:")
		log.Printf("   🔒 Security:")
		log.Printf("      HTTP Gateway: %v (Disabled for security)", cfg.HTTPGatewayEnabled)
		log.Printf("      TLS Enabled: %v", cfg.TLSEnabled)
		if cfg.TLSEnabled {
			log.Printf("      TLS Cert: %s", cfg.TLSCertFile)
			log.Printf("      TLS Key: %s", cfg.TLSKeyFile)
		}

		log.Printf("   ⚡ Performance:")
		log.Printf("      Max Concurrent Streams: %d", cfg.MaxConcurrentStreams)
		log.Printf("      Max Message Size: %d MB", cfg.MaxReceiveMessageSize/(1024*1024))
		log.Printf("      Connection Timeout: %d seconds", cfg.ConnectionTimeout)

		log.Printf("   📊 Logging:")
		log.Printf("      Log Level: %s", cfg.LogLevel)
		log.Printf("      Log Format: %s (Structured for aggregation)", cfg.LogFormat)
		log.Printf("      Access Log: %v", cfg.EnableAccessLog)
		log.Printf("      Error Log: %v", cfg.EnableErrorLog)

		log.Printf("   🛡️  Rate Limiting:")
		log.Printf("      Enabled: %v", cfg.EnableRateLimit)
		if cfg.EnableRateLimit {
			log.Printf("      RPS Limit: %d requests/second", cfg.RateLimitRPS)
			log.Printf("      Burst Capacity: %d requests", cfg.RateLimitBurst)
		}

		log.Printf("   🔍 Monitoring:")
		log.Printf("      Health Check: %v (Path: %s)", cfg.EnableHealthCheck, cfg.HealthCheckPath)
		log.Printf("      Metrics: %v (Port: %s)", cfg.EnableMetrics, cfg.MetricsPort)
		log.Printf("      Tracing: %v", cfg.EnableTracing)
	} else if IsDevelopment() {
		log.Println("🔧 Development Configuration:")
		log.Printf("   HTTP Gateway: %v", cfg.HTTPGatewayEnabled)
		log.Printf("   TLS Enabled: %v", cfg.TLSEnabled)
		log.Printf("   Log Level: %s", cfg.LogLevel)
	}
}

// Helper functions for environment variable parsing
func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getUint32Env(key string, defaultValue uint32) uint32 {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseUint(value, 10, 32); err == nil {
			return uint32(parsed)
		}
	}
	return defaultValue
}

// GetSecurityHeaders returns security headers for HTTP responses
func GetSecurityHeaders() map[string]string {
	return map[string]string{
		"X-Content-Type-Options":    "nosniff",
		"X-Frame-Options":           "DENY",
		"X-XSS-Protection":          "1; mode=block",
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
		"Content-Security-Policy":   "default-src 'self'",
		"Referrer-Policy":           "strict-origin-when-cross-origin",
	}
}

// GetCORSConfig returns CORS configuration based on environment
func GetCORSConfig() map[string]interface{} {
	if IsProduction() {
		// Restrictive CORS for production
		return map[string]interface{}{
			"allowed_origins": []string{
				"https://nynus.edu.vn",
				"https://app.nynus.edu.vn",
				"https://admin.nynus.edu.vn",
			},
			"allowed_methods": []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			"allowed_headers": []string{
				"Accept",
				"Authorization",
				"Content-Type",
				"X-CSRF-Token",
				"X-Requested-With",
				"grpc-timeout",
				"grpc-encoding",
				"grpc-accept-encoding",
			},
			"allow_credentials": true,
			"max_age":           86400, // 24 hours
		}
	} else {
		// Permissive CORS for development
		return map[string]interface{}{
			"allowed_origins":   []string{"*"},
			"allowed_methods":   []string{"*"},
			"allowed_headers":   []string{"*"},
			"allow_credentials": true,
			"max_age":           3600, // 1 hour
		}
	}
}
