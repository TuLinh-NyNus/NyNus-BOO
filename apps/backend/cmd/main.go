package main

import (
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/app"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/config"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	// Initialize structured logger
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)
	logger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "level",
			logrus.FieldKeyMsg:   "message",
		},
	})

	logger.Info("🚀 Starting NyNus Exam Bank System...")

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logger.Warn("⚠️  .env file not found, using system environment variables")
	} else {
		logger.Info("✅ Environment variables loaded from .env file")
	}

	// Load configuration
	logger.Info("📋 Loading application configuration...")
	cfg := config.LoadConfig()
	logger.WithFields(logrus.Fields{
		"environment": cfg.Server.Environment,
		"grpc_port":   cfg.Server.GRPCPort,
		"http_port":   cfg.Server.HTTPPort,
	}).Info("✅ Configuration loaded successfully")

	// Comprehensive configuration validation
	logger.Info("🔍 Validating configuration...")
	if err := cfg.Validate(); err != nil {
		logger.WithError(err).Fatal("❌ Configuration validation failed")
	}

	// Validate auth configuration
	if err := cfg.Auth.ValidateAuthConfig(); err != nil {
		logger.WithError(err).Fatal("❌ Authentication configuration validation failed")
	}

	logger.Info("✅ Configuration validation passed")

	// Create application
	logger.Info("🏗️  Initializing application...")
	application, err := app.NewApp(cfg)
	if err != nil {
		logger.WithError(err).Fatal("❌ Failed to create application")
	}
	logger.Info("✅ Application initialized successfully")

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		sig := <-sigChan

		logger.WithField("signal", sig.String()).Warn("🛑 Received shutdown signal, initiating graceful shutdown...")
		application.Shutdown()
		logger.Info("✅ Graceful shutdown completed")
		os.Exit(0)
	}()

	// Run application
	logger.Info("🚀 Starting application services...")
	if err := application.Run(); err != nil {
		logger.WithError(err).Fatal("❌ Failed to run application")
	}
}
