# Makefile Documentation

This document describes the comprehensive Makefile for the Exam Bank System backend development.

## Quick Start

```bash
# Show all available commands
make help

# Start development (proto + build + run)
make dev

# Build the application
make build

# Run the application
make run
```

## Available Commands

### 🚀 Development Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make dev` | Generate proto, build and run | `make dev` |
| `make build` | Build the backend application | `make build` |
| `make run` | Run the backend application | `make run` |
| `make build-run` | Build and run in sequence | `make build-run` |
| `make clean` | Clean build artifacts | `make clean` |

### 🧪 Code Quality Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make test` | Run all tests | `make test` |
| `make test-coverage` | Run tests with coverage report | `make test-coverage` |
| `make lint` | Run golangci-lint | `make lint` |
| `make fmt` | Format Go code | `make fmt` |
| `make vet` | Run go vet | `make vet` |

### 🔧 Protocol Buffers Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make proto` | Generate Protocol Buffer code | `make proto` |
| `make proto-clean` | Clean generated proto files | `make proto-clean` |

### 🐘 Database Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make db-up` | Start PostgreSQL with Docker Compose | `make db-up` |
| `make db-down` | Stop database | `make db-down` |
| `make db-reset` | Reset database (stop + start) | `make db-reset` |
| `make migrate` | Run database migrations | `make migrate` |
| `make seed` | Seed database with default data | `make seed` |
| `make db-shell` | Connect to database shell | `make db-shell` |

### 🐳 Docker Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make docker-build` | Build Docker image | `make docker-build` |
| `make docker-run` | Run Docker container | `make docker-run` |
| `make docker-push` | Push Docker image to registry | `make docker-push` |

### 📦 Dependencies Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make deps` | Download and tidy dependencies | `make deps` |
| `make deps-update` | Update all dependencies | `make deps-update` |
| `make install-tools` | Install development tools | `make install-tools` |

### 🚢 Release Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make build-all` | Build for all platforms | `make build-all` |
| `make release` | Full release build | `make release` |

### ℹ️ Information Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make info` | Show build information | `make info` |
| `make status` | Show application status | `make status` |
| `make help` | Show help message | `make help` |

## Configuration

The Makefile uses the following configurable variables:

```makefile
# Application
APP_NAME := exam-bank-backend
BINARY_DIR := bin
MAIN_PATH := ./apps/backend/cmd/main.go

# Docker
DOCKER_IMAGE := exam-bank-backend
DOCKER_TAG := latest

# Database
DB_HOST := localhost
DB_PORT := 5439
DB_NAME := exam_bank_db
DB_USER := exam_bank_user
DB_PASSWORD := exam_bank_password
```

## Common Workflows

### Development Workflow

```bash
# 1. Start development environment
make dev

# 2. In another terminal, make changes and rebuild
make build-run

# 3. Run tests
make test

# 4. Format and lint code
make fmt
make lint
```

### Testing Workflow

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Check code quality
make lint
make vet
```

### Database Workflow

```bash
# Start database
make db-up

# Run migrations
make migrate

# Seed with default data
make seed

# Connect to database
make db-shell

# Reset database
make db-reset
```

### Release Workflow

```bash
# Full release build
make release

# Or step by step:
make clean
make proto
make test
make build-all
```

## Output Examples

### Build Output
```
🔨 Building exam-bank-backend...
✅ Build completed: bin/exam-bank-backend
```

### Development Output
```
🔧 Generating Protocol Buffer code...
✅ Protocol Buffer code generated
🔨 Building exam-bank-backend...
✅ Build completed: bin/exam-bank-backend
🚀 Starting exam-bank-backend...
```

### Status Output
```
Application Status
==================
✅ Binary exists: bin/exam-bank-backend
-rwxrwxr-x 1 user user 20M Aug  6 15:21 bin/exam-bank-backend

Database Status:
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS   NAMES
```

## Prerequisites

- Go 1.21+
- Docker and Docker Compose
- Protocol Buffers compiler (protoc)
- Make

## Installation of Tools

```bash
# Install all development tools
make install-tools

# This installs:
# - golangci-lint (linter)
# - protoc-gen-go (Protocol Buffers Go plugin)
# - protoc-gen-go-grpc (gRPC Go plugin)
```

## Troubleshooting

### Build Issues
```bash
# Clean and rebuild
make clean
make build
```

### Database Issues
```bash
# Reset database
make db-reset

# Check database status
make status
```

### Proto Issues
```bash
# Clean and regenerate
make proto-clean
make proto
```

## Legacy Support

The Makefile maintains backward compatibility with the original simple commands:

```bash
make setup    # Legacy - use 'make install-tools' instead
```
