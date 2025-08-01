package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"exam-bank-system/backend/internal/app"
	"exam-bank-system/backend/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Validate configuration (skip JWT validation for development)
	if cfg.Database.Host == "" || cfg.Database.Port == "" || cfg.Database.User == "" {
		log.Fatal("Database configuration is incomplete")
	}

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
