# Exam Bank System - Backend Makefile
# =================================

# Variables
APP_NAME := exam-bank-backend
BINARY_DIR := bin
BINARY_PATH := $(BINARY_DIR)/$(APP_NAME)
MAIN_PATH := ./apps/backend/cmd/main.go
DOCKER_IMAGE := exam-bank-backend
DOCKER_TAG := latest

# Go variables
GO_VERSION := 1.21
GOOS := $(shell go env GOOS)
GOARCH := $(shell go env GOARCH)

# Database variables
DB_HOST := localhost
DB_PORT := 5439
DB_NAME := exam_bank_db
DB_USER := exam_bank_user
DB_PASSWORD := exam_bank_password
DB_URL := postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

.PHONY: help build run clean test lint proto dev docker db-up db-down db-reset migrate seed

# Default target
.DEFAULT_GOAL := help

## Help
help: ## Show this help message
	@echo "$(CYAN)Exam Bank System - Backend Makefile$(NC)"
	@echo "$(CYAN)====================================$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Development
dev: proto build run ## Generate proto, build and run the application

build: ## Build the backend application
	@echo "$(BLUE)🔨 Building $(APP_NAME)...$(NC)"
	@mkdir -p $(BINARY_DIR)
	@go build -o $(BINARY_PATH) $(MAIN_PATH)
	@echo "$(GREEN)✅ Build completed: $(BINARY_PATH)$(NC)"

run: ## Run the backend application
	@echo "$(BLUE)🚀 Starting $(APP_NAME)...$(NC)"
	@./$(BINARY_PATH)

build-run: build run ## Build and run the application

clean: ## Clean build artifacts
	@echo "$(YELLOW)🧹 Cleaning build artifacts...$(NC)"
	@rm -rf $(BINARY_DIR)
	@go clean
	@echo "$(GREEN)✅ Clean completed$(NC)"

## Code Quality
test: ## Run tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	@go test -v ./apps/backend/...

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)🧪 Running tests with coverage...$(NC)"
	@go test -v -coverprofile=coverage.out ./apps/backend/...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✅ Coverage report generated: coverage.html$(NC)"

lint: ## Run linter
	@echo "$(BLUE)🔍 Running linter...$(NC)"
	@golangci-lint run ./apps/backend/...

fmt: ## Format Go code
	@echo "$(BLUE)📝 Formatting Go code...$(NC)"
	@go fmt ./apps/backend/...
	@echo "$(GREEN)✅ Code formatted$(NC)"

vet: ## Run go vet
	@echo "$(BLUE)🔍 Running go vet...$(NC)"
	@go vet ./apps/backend/...

## Protocol Buffers
proto: ## Generate Protocol Buffer code
	@echo "$(BLUE)🔧 Generating Protocol Buffer code...$(NC)"
	@./tools/scripts/gen-proto.sh
	@echo "$(GREEN)✅ Protocol Buffer code generated$(NC)"

proto-clean: ## Clean generated proto files
	@echo "$(YELLOW)🧹 Cleaning generated proto files...$(NC)"
	@rm -rf packages/proto/gen
	@echo "$(GREEN)✅ Proto files cleaned$(NC)"

## Database
db-up: ## Start database with Docker Compose
	@echo "$(BLUE)🐘 Starting PostgreSQL database...$(NC)"
	@docker-compose up -d postgres
	@echo "$(GREEN)✅ Database started$(NC)"

db-down: ## Stop database
	@echo "$(YELLOW)🛑 Stopping PostgreSQL database...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Database stopped$(NC)"

db-reset: db-down db-up ## Reset database (stop and start)
	@echo "$(GREEN)✅ Database reset completed$(NC)"

migrate: ## Run database migrations
	@echo "$(BLUE)🔄 Running database migrations...$(NC)"
	@go run $(MAIN_PATH) --migrate-only
	@echo "$(GREEN)✅ Migrations completed$(NC)"

seed: ## Seed database with default data
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	@go run $(MAIN_PATH) --seed-only
	@echo "$(GREEN)✅ Database seeded$(NC)"

db-shell: ## Connect to database shell
	@echo "$(BLUE)🐘 Connecting to database...$(NC)"
	@docker exec -it exam-bank-postgres psql -U $(DB_USER) -d $(DB_NAME)

## Docker
docker-build: ## Build Docker image
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	@docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)✅ Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)$(NC)"

docker-run: ## Run Docker container
	@echo "$(BLUE)🐳 Running Docker container...$(NC)"
	@docker run --rm -p 50051:50051 -p 8080:8080 $(DOCKER_IMAGE):$(DOCKER_TAG)

docker-push: ## Push Docker image to registry
	@echo "$(BLUE)🐳 Pushing Docker image...$(NC)"
	@docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)✅ Docker image pushed$(NC)"

## Dependencies
deps: ## Download and tidy dependencies
	@echo "$(BLUE)📦 Downloading dependencies...$(NC)"
	@go mod download
	@go mod tidy
	@echo "$(GREEN)✅ Dependencies updated$(NC)"

deps-update: ## Update all dependencies
	@echo "$(BLUE)📦 Updating dependencies...$(NC)"
	@go get -u ./apps/backend/...
	@go mod tidy
	@echo "$(GREEN)✅ Dependencies updated$(NC)"

## Tools
install-tools: ## Install development tools
	@echo "$(BLUE)🔧 Installing development tools...$(NC)"
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	@go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest
	@go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest
	@echo "$(GREEN)✅ Development tools installed$(NC)"

## Release
build-all: ## Build for all platforms
	@echo "$(BLUE)🔨 Building for all platforms...$(NC)"
	@mkdir -p $(BINARY_DIR)
	@GOOS=linux GOARCH=amd64 go build -o $(BINARY_DIR)/$(APP_NAME)-linux-amd64 $(MAIN_PATH)
	@GOOS=darwin GOARCH=amd64 go build -o $(BINARY_DIR)/$(APP_NAME)-darwin-amd64 $(MAIN_PATH)
	@GOOS=windows GOARCH=amd64 go build -o $(BINARY_DIR)/$(APP_NAME)-windows-amd64.exe $(MAIN_PATH)
	@echo "$(GREEN)✅ Multi-platform build completed$(NC)"

release: clean proto test build-all ## Full release build (clean, proto, test, build-all)
	@echo "$(GREEN)🎉 Release build completed!$(NC)"

## Information
info: ## Show build information
	@echo "$(CYAN)Build Information$(NC)"
	@echo "$(CYAN)=================$(NC)"
	@echo "App Name:     $(APP_NAME)"
	@echo "Binary Path:  $(BINARY_PATH)"
	@echo "Go Version:   $(shell go version)"
	@echo "GOOS:         $(GOOS)"
	@echo "GOARCH:       $(GOARCH)"
	@echo "Database URL: $(DB_URL)"

status: ## Show application status
	@echo "$(CYAN)Application Status$(NC)"
	@echo "$(CYAN)==================$(NC)"
	@if [ -f $(BINARY_PATH) ]; then \
		echo "$(GREEN)✅ Binary exists: $(BINARY_PATH)$(NC)"; \
		ls -lh $(BINARY_PATH); \
	else \
		echo "$(RED)❌ Binary not found: $(BINARY_PATH)$(NC)"; \
	fi
	@echo ""
	@echo "$(CYAN)Database Status:$(NC)"
	@docker-compose ps postgres || echo "$(RED)❌ Database not running$(NC)"

## Legacy commands (for compatibility)
setup: ## Initial setup (legacy)
	@echo "$(YELLOW)⚠️  Legacy command. Use 'make install-tools' instead$(NC)"
	@chmod +x tools/scripts/*.sh
	@./tools/scripts/setup.sh
