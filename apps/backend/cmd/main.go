package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/app"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Comprehensive configuration validation
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}

	// Validate auth configuration
	if err := cfg.Auth.ValidateAuthConfig(); err != nil {
		log.Fatalf("Authentication configuration validation failed: %v", err)
	}

	log.Println("✅ Configuration validation passed")

	// Create application
	application, err := app.NewApp(cfg)
	if err != nil {
		log.Fatalf("Failed to create application: %v", err)
	}

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("🛑 Received shutdown signal...")
		application.Shutdown()
		os.Exit(0)
	}()

	// Run application
	if err := application.Run(); err != nil {
		log.Fatalf("Failed to run application: %v", err)
	}
}
