package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration values
type Config struct {
	// Database configuration
	Database DatabaseConfig

	// Server configuration
	Server ServerConfig

	// JWT configuration (legacy - use Auth.JWT instead)
	JWT JWTConfig

	// Authentication configuration (unified)
	Auth *AuthConfig

	// Image Processing configuration
	ImageProcessing ImageProcessingConfig

	// Google Drive configuration
	GoogleDrive GoogleDriveConfig

	// Cloudinary configuration
	Cloudinary CloudinaryConfig

	// Redis configuration
	Redis RedisConfig

	// Production configuration
	Production *ProductionConfig
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

// ServerConfig holds server configuration
type ServerConfig struct {
	GRPCPort    string
	HTTPPort    string
	Environment string
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret string
}

// ImageProcessingConfig holds image processing configuration
type ImageProcessingConfig struct {
	Enabled        bool
	TexLiveBin     string
	LatexEngine    string
	ImageConverter string
	TmpDir         string
	OutputDir      string
	CacheDir       string
	ImageQuality   int
	MaxConcurrency int
}

// GoogleDriveConfig holds Google Drive configuration
type GoogleDriveConfig struct {
	Enabled      bool
	ClientID     string
	ClientSecret string
	RefreshToken string
	RootFolderID string
}

// CloudinaryConfig holds Cloudinary configuration
type CloudinaryConfig struct {
	Enabled    bool
	CloudName  string
	APIKey     string
	APISecret  string
	Folder     string // e.g., "exam-bank/questions"
	UseRealSDK bool   // Flag to switch between simulation and real SDK
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	URL          string
	Password     string
	Enabled      bool
	MaxRetries   int
	Timeout      string
	PoolSize     int
	MinIdleConns int
	// Pub/Sub configuration (added for Phase 1 - Task 1.3.1)
	PubSubEnabled       bool
	PubSubChannelPrefix string
	MessageQueueSize    int
	WorkerPoolSize      int
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "exam_bank_user"),
			Password: getEnv("DB_PASSWORD", "exam_bank_password"),
			Name:     getEnv("DB_NAME", "exam_bank_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Server: ServerConfig{
			GRPCPort:    getEnv("GRPC_PORT", "50051"),
			HTTPPort:    getEnv("HTTP_PORT", "8080"),
			Environment: getEnv("ENV", "development"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		},
		Auth: LoadAuthConfig(), // Load unified auth configuration
		ImageProcessing: ImageProcessingConfig{
			Enabled:        getEnv("IMAGE_PROCESSING_ENABLED", "true") == "true",
			TexLiveBin:     getEnv("TEXLIVE_BIN", "C:\\texlive\\2024\\bin\\windows"),
			LatexEngine:    getEnv("LATEX_ENGINE", "lualatex"),
			ImageConverter: getEnv("IMAGE_CONVERTER", "magick"),
			TmpDir:         getEnv("IMAGE_TMP_DIR", "./tmp/images"),
			OutputDir:      getEnv("IMAGE_OUTPUT_DIR", "./output/images"),
			CacheDir:       getEnv("IMAGE_CACHE_DIR", "./cache/images"),
			ImageQuality:   85,
			MaxConcurrency: 5,
		},
		GoogleDrive: GoogleDriveConfig{
			Enabled:      getEnv("GOOGLE_DRIVE_ENABLED", "false") == "true",
			ClientID:     getEnv("DRIVE_CLIENT_ID", ""),
			ClientSecret: getEnv("DRIVE_CLIENT_SECRET", ""),
			RefreshToken: getEnv("DRIVE_REFRESH_TOKEN", ""),
			RootFolderID: getEnv("DRIVE_ROOT_FOLDER_ID", ""),
		},
		Cloudinary: CloudinaryConfig{
			Enabled:    getEnv("CLOUDINARY_ENABLED", "false") == "true",
			CloudName:  getEnv("CLOUDINARY_CLOUD_NAME", ""),
			APIKey:     getEnv("CLOUDINARY_API_KEY", ""),
			APISecret:  getEnv("CLOUDINARY_API_SECRET", ""),
			Folder:     getEnv("CLOUDINARY_FOLDER", "exam-bank/questions"),
			UseRealSDK: getEnv("CLOUDINARY_USE_REAL_SDK", "false") == "true",
		},
		Redis: RedisConfig{
			URL:          getEnv("REDIS_URL", "redis://localhost:6379"),
			Password:     getEnv("REDIS_PASSWORD", ""),
			Enabled:      getEnv("REDIS_ENABLED", "true") == "true",
			MaxRetries:   getIntEnv("REDIS_MAX_RETRIES", 3),
			Timeout:      getEnv("REDIS_TIMEOUT", "5s"),
			PoolSize:     getIntEnv("REDIS_POOL_SIZE", 10),
			MinIdleConns: getIntEnv("REDIS_MIN_IDLE_CONNS", 2),
			// Pub/Sub configuration (added for Phase 1 - Task 1.3.2)
			PubSubEnabled:       getEnv("REDIS_PUBSUB_ENABLED", "true") == "true",
			PubSubChannelPrefix: getEnv("REDIS_PUBSUB_CHANNEL_PREFIX", "exam_bank"),
			MessageQueueSize:    getIntEnv("REDIS_MESSAGE_QUEUE_SIZE", 100),
			WorkerPoolSize:      getIntEnv("REDIS_WORKER_POOL_SIZE", 10),
		},
		Production: LoadProductionConfig(),
	}
}

// GetDatabaseConnectionString returns the database connection string with UTF-8 encoding
func (c *Config) GetDatabaseConnectionString() string {
	// Include client_encoding=UTF8 to ensure proper Vietnamese character support
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&client_encoding=UTF8",
		c.Database.User,
		c.Database.Password,
		c.Database.Host,
		c.Database.Port,
		c.Database.Name,
		c.Database.SSLMode,
	)
	fmt.Printf("DEBUG: Database connection string: %s\n", connStr)
	return connStr
}

// Validate validates the configuration comprehensively
func (c *Config) Validate() error {
	// Validate database configuration
	if err := c.validateDatabase(); err != nil {
		return fmt.Errorf("database validation failed: %w", err)
	}

	// Validate server configuration
	if err := c.validateServer(); err != nil {
		return fmt.Errorf("server validation failed: %w", err)
	}

	// Validate JWT configuration (legacy - auth config is validated separately)
	if err := c.validateJWT(); err != nil {
		return fmt.Errorf("JWT validation failed: %w", err)
	}

	// Validate image processing configuration
	if err := c.validateImageProcessing(); err != nil {
		return fmt.Errorf("image processing validation failed: %w", err)
	}

	// Validate Google Drive configuration
	if err := c.validateGoogleDrive(); err != nil {
		return fmt.Errorf("Google Drive validation failed: %w", err)
	}

	return nil
}

// validateDatabase validates database configuration
func (c *Config) validateDatabase() error {
	if c.Database.Host == "" {
		return fmt.Errorf("DB_HOST is required")
	}
	if c.Database.Port == "" {
		return fmt.Errorf("DB_PORT is required")
	}
	if c.Database.User == "" {
		return fmt.Errorf("DB_USER is required")
	}
	if c.Database.Password == "" {
		return fmt.Errorf("DB_PASSWORD is required")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("DB_NAME is required")
	}

	// Validate port format
	if _, err := strconv.Atoi(c.Database.Port); err != nil {
		return fmt.Errorf("DB_PORT must be a valid integer, got: %s", c.Database.Port)
	}

	// Validate SSL mode
	validSSLModes := []string{"disable", "require", "verify-ca", "verify-full"}
	isValidSSL := false
	for _, mode := range validSSLModes {
		if c.Database.SSLMode == mode {
			isValidSSL = true
			break
		}
	}
	if !isValidSSL {
		return fmt.Errorf("DB_SSLMODE must be one of: %v, got: %s", validSSLModes, c.Database.SSLMode)
	}

	return nil
}

// validateServer validates server configuration
func (c *Config) validateServer() error {
	if c.Server.GRPCPort == "" {
		return fmt.Errorf("GRPC_PORT is required")
	}
	if c.Server.HTTPPort == "" {
		return fmt.Errorf("HTTP_PORT is required")
	}

	// Validate port formats
	if _, err := strconv.Atoi(c.Server.GRPCPort); err != nil {
		return fmt.Errorf("GRPC_PORT must be a valid integer, got: %s", c.Server.GRPCPort)
	}
	if _, err := strconv.Atoi(c.Server.HTTPPort); err != nil {
		return fmt.Errorf("HTTP_PORT must be a valid integer, got: %s", c.Server.HTTPPort)
	}

	// Validate environment
	validEnvs := []string{"development", "dev", "staging", "stage", "production", "prod", "test"}
	isValidEnv := false
	for _, env := range validEnvs {
		if strings.ToLower(c.Server.Environment) == env {
			isValidEnv = true
			break
		}
	}
	if !isValidEnv {
		return fmt.Errorf("ENV must be one of: %v, got: %s", validEnvs, c.Server.Environment)
	}

	return nil
}

// validateJWT validates JWT configuration (legacy)
func (c *Config) validateJWT() error {
	if c.JWT.Secret == "" || c.JWT.Secret == "your-secret-key-change-in-production" {
		return fmt.Errorf("JWT_SECRET must be set and not use default value")
	}

	// Validate JWT secret strength
	if len(c.JWT.Secret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters long for security, got: %d characters", len(c.JWT.Secret))
	}

	return nil
}

// validateImageProcessing validates image processing configuration
func (c *Config) validateImageProcessing() error {
	if !c.ImageProcessing.Enabled {
		return nil // Skip validation if disabled
	}

	if c.ImageProcessing.TexLiveBin == "" {
		return fmt.Errorf("TEXLIVE_BIN is required when image processing is enabled")
	}

	// Validate LaTeX engine
	validEngines := []string{"lualatex", "xelatex", "pdflatex"}
	isValidEngine := false
	for _, engine := range validEngines {
		if c.ImageProcessing.LatexEngine == engine {
			isValidEngine = true
			break
		}
	}
	if !isValidEngine {
		return fmt.Errorf("LATEX_ENGINE must be one of: %v, got: %s", validEngines, c.ImageProcessing.LatexEngine)
	}

	// Validate image converter
	validConverters := []string{"magick", "cwebp"}
	isValidConverter := false
	for _, converter := range validConverters {
		if c.ImageProcessing.ImageConverter == converter {
			isValidConverter = true
			break
		}
	}
	if !isValidConverter {
		return fmt.Errorf("IMAGE_CONVERTER must be one of: %v, got: %s", validConverters, c.ImageProcessing.ImageConverter)
	}

	return nil
}

// validateGoogleDrive validates Google Drive configuration
func (c *Config) validateGoogleDrive() error {
	if !c.GoogleDrive.Enabled {
		return nil // Skip validation if disabled
	}

	if c.GoogleDrive.ClientID == "" {
		return fmt.Errorf("DRIVE_CLIENT_ID is required when Google Drive is enabled")
	}
	if c.GoogleDrive.ClientSecret == "" {
		return fmt.Errorf("DRIVE_CLIENT_SECRET is required when Google Drive is enabled")
	}
	if c.GoogleDrive.RefreshToken == "" {
		return fmt.Errorf("DRIVE_REFRESH_TOKEN is required when Google Drive is enabled")
	}
	if c.GoogleDrive.RootFolderID == "" {
		return fmt.Errorf("DRIVE_ROOT_FOLDER_ID is required when Google Drive is enabled")
	}

	return nil
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getIntEnv gets environment variable as integer or returns default value
func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
