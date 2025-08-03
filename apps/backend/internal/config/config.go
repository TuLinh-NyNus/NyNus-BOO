package config

import (
	"fmt"
	"os"
)

// Config holds all configuration values
type Config struct {
	// Database configuration
	Database DatabaseConfig

	// Server configuration
	Server ServerConfig

	// JWT configuration
	JWT JWTConfig
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

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5439"),
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
	}
}

// GetDatabaseConnectionString returns the database connection string
func (c *Config) GetDatabaseConnectionString() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
	)
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.Database.Host == "" {
		return fmt.Errorf("database host is required")
	}
	if c.Database.Port == "" {
		return fmt.Errorf("database port is required")
	}
	if c.Database.User == "" {
		return fmt.Errorf("database user is required")
	}
	if c.Database.Password == "" {
		return fmt.Errorf("database password is required")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("database name is required")
	}
	if c.JWT.Secret == "" || c.JWT.Secret == "your-secret-key-change-in-production" {
		return fmt.Errorf("JWT secret must be set and not use default value")
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
