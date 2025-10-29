package main

import (
	"os"
	"os/signal"
	"syscall"

	"exam-bank-system/apps/backend/internal/app"
	"exam-bank-system/apps/backend/internal/config"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"golang.org/x/text/encoding/unicode"
	"golang.org/x/text/transform"
)

func main() {
	// Enable UTF-8 support for Windows console
	// This ensures Vietnamese characters and emojis are displayed correctly
	if _, err := os.Stdout.Stat(); err == nil {
		// Create UTF-8 encoder for Windows console
		encoder := unicode.UTF8.NewEncoder()
		writer := transform.NewWriter(os.Stdout, encoder)
		
		// Use the UTF-8 encoded writer for standard output
		// Note: We keep os.Stdout for logger to use directly
		// as logrus handles encoding internally
		_ = writer // Keep this for potential future use
	}

	// Initialize standard logger with consistent format: 2006/01/02 15:04:05
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)
	logger.SetOutput(os.Stdout)
	logger.SetFormatter(&logrus.TextFormatter{
		TimestampFormat:        "2006/01/02 15:04:05",
		FullTimestamp:          true,
		DisableTimestamp:       false,
		ForceColors:            false,
		DisableColors:          true,
		ForceQuote:             false,
		DisableQuote:           true,
		DisableLevelTruncation: false,
	})

	logger.Info("[STARTUP] Starting NyNus Exam Bank System...")

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logger.Warn("[WARN] .env file not found, using system environment variables")
	} else {
		logger.Info("[OK] Environment variables loaded from .env file")
	}

	// Load configuration
	logger.Info("[CONFIG] Loading application configuration...")
	cfg := config.LoadConfig()
	logger.WithFields(logrus.Fields{
		"environment": cfg.Server.Environment,
		"grpc_port":   cfg.Server.GRPCPort,
		"http_port":   cfg.Server.HTTPPort,
	}).Info("[OK] Configuration loaded successfully")

	// Comprehensive configuration validation
	logger.Info("[VALIDATE] Validating configuration...")
	if err := cfg.Validate(); err != nil {
		logger.WithError(err).Fatal("[ERROR] Configuration validation failed")
	}

	// Validate auth configuration
	if err := cfg.Auth.ValidateAuthConfig(); err != nil {
		logger.WithError(err).Fatal("[ERROR] Authentication configuration validation failed")
	}

	logger.Info("[OK] Configuration validation passed")

	// Create application
	logger.Info("[INIT] Initializing application...")
	application, err := app.NewApp(cfg)
	if err != nil {
		logger.WithError(err).Fatal("[ERROR] Failed to create application")
	}
	logger.Info("[OK] Application initialized successfully")

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		sig := <-sigChan

		logger.WithField("signal", sig.String()).Warn("[SHUTDOWN] Received shutdown signal, initiating graceful shutdown...")
		application.Shutdown()
		logger.Info("[OK] Graceful shutdown completed")
		os.Exit(0)
	}()

	// Run application
	logger.Info("[STARTUP] Starting application services...")
	if err := application.Run(); err != nil {
		logger.WithError(err).Fatal("[ERROR] Failed to run application")
	}
	
	// ✅ CRITICAL FIX: application.Run() is BLOCKING and should never return
	// If we reach this point, it means the server stopped unexpectedly
	logger.Error("[FATAL] Server stopped unexpectedly - this should never happen!")
	logger.Error("[FATAL] If you see this message, the gRPC server crashed or was stopped")
	os.Exit(1)
}
