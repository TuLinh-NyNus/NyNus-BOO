#!/usr/bin/env pwsh
# ========================================
# NyNus Exam Bank System - Docker Setup
# ========================================
# Script to setup and run entire project with Docker
# Usage: .\setup-docker.ps1

param(
    [switch]$Build = $false,
    [switch]$Clean = $false,
    [switch]$Stop = $false,
    [switch]$Logs = $false,
    [switch]$Status = $false,
    [switch]$Help = $false
)

# Colors for output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

function Show-Help {
    Write-ColorOutput "`nNyNus Exam Bank System - Docker Setup" "Cyan"
    Write-ColorOutput "======================================" "Cyan"
    Write-Host "`nUsage: .\setup-docker.ps1 [options]"
    Write-Host "`nOptions:"
    Write-Host "  -Build      Force rebuild all Docker images"
    Write-Host "  -Clean      Clean up containers, images and volumes"
    Write-Host "  -Stop       Stop all services"
    Write-Host "  -Logs       Show logs from all services"
    Write-Host "  -Status     Show status of all services"
    Write-Host "  -Help       Show this help message"
    Write-Host "`nWithout options, the full stack will be started.`n"
}

function Show-Banner {
    Clear-Host
    Write-ColorOutput @"
    
    ███╗   ██╗██╗   ██╗███╗   ██╗██╗   ██╗███████╗
    ████╗  ██║╚██╗ ██╔╝████╗  ██║██║   ██║██╔════╝
    ██╔██╗ ██║ ╚████╔╝ ██╔██╗ ██║██║   ██║███████╗
    ██║╚██╗██║  ╚██╔╝  ██║╚██╗██║██║   ██║╚════██║
    ██║ ╚████║   ██║   ██║ ╚████║╚██████╔╝███████║
    ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
    
    Docker Environment Setup
    ========================
"@ "Cyan"
}

function Check-Docker {
    Write-ColorOutput "`n[CHECK] Checking Docker...`n" "Yellow"
    
    # Check Docker
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        Write-ColorOutput "[ERROR] Docker not found. Please install Docker Desktop." "Red"
        exit 1
    }
    Write-ColorOutput "[OK] Docker found: $(docker --version)" "Green"
    
    # Check Docker Compose
    $dockerCompose = Get-Command docker-compose -ErrorAction SilentlyContinue
    if (-not $dockerCompose) {
        Write-ColorOutput "[ERROR] Docker Compose not found." "Red"
        exit 1
    }
    Write-ColorOutput "[OK] Docker Compose found: $(docker-compose --version)" "Green"
    
    # Check if Docker is running
    try {
        docker info 2>&1 | Out-Null
        Write-ColorOutput "[OK] Docker daemon is running" "Green"
    } catch {
        Write-ColorOutput "[ERROR] Docker daemon is not running. Please start Docker Desktop." "Red"
        exit 1
    }
}

function Create-DockerFiles {
    Write-ColorOutput "`n[SETUP] Creating Docker configuration files...`n" "Blue"
    
    # Create Dockerfile for backend
    Create-Backend-Dockerfile
    
    # Create Dockerfile for frontend
    Create-Frontend-Dockerfile
    
    # Update docker-compose.yml
    Update-DockerCompose
    
    # Create .dockerignore files
    Create-DockerIgnore
    
    Write-ColorOutput "[OK] Docker configuration files created" "Green"
}

function Create-Backend-Dockerfile {
    $backendDockerfile = @"
# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY apps/backend .

# Install dependencies
RUN go mod download
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Expose ports
EXPOSE 50051 8080

# Run the binary
CMD ["./main"]
"@
    
    Set-Content -Path "apps/backend/Dockerfile" -Value $backendDockerfile -Encoding UTF8
    Write-ColorOutput "[OK] Backend Dockerfile created" "Green"
}

function Create-Frontend-Dockerfile {
    $frontendDockerfile = @"
# Frontend Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend .

# Build the application
RUN pnpm build

# Production image
FROM node:18-alpine AS runner

RUN npm install -g pnpm
WORKDIR /app

# Copy built application
COPY --from=base /app/next.config.js ./
COPY --from=base /app/package.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
"@
    
    Set-Content -Path "apps/frontend/Dockerfile" -Value $frontendDockerfile -Encoding UTF8
    Write-ColorOutput "[OK] Frontend Dockerfile created" "Green"
}

function Update-DockerCompose {
    $dockerCompose = @"
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: exam_bank_postgres
    environment:
      POSTGRES_DB: exam_bank_db
      POSTGRES_USER: exam_bank_user
      POSTGRES_PASSWORD: exam_bank_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - exam_bank_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U exam_bank_user -d exam_bank_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    container_name: exam_bank_backend
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=exam_bank_db
      - DB_USER=exam_bank_user
      - DB_PASSWORD=exam_bank_password
      - JWT_SECRET=your-secret-key-here
      - JWT_ACCESS_TOKEN_EXPIRY=15m
      - JWT_REFRESH_TOKEN_EXPIRY=7d
    ports:
      - "50051:50051"
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - exam_bank_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    container_name: exam_bank_frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080
      - NEXT_PUBLIC_GRPC_URL=http://localhost:8080
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-nextauth-secret-here
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - exam_bank_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  exam_bank_network:
    driver: bridge

volumes:
  postgres_data:
"@
    
    Set-Content -Path "docker-compose.yml" -Value $dockerCompose -Encoding UTF8
    Write-ColorOutput "[OK] docker-compose.yml updated" "Green"
}

function Create-DockerIgnore {
    # Backend .dockerignore
    $backendDockerIgnore = @"
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.dist
.tmp
.vscode
"@
    Set-Content -Path "apps/backend/.dockerignore" -Value $backendDockerIgnore -Encoding UTF8
    
    # Frontend .dockerignore
    $frontendDockerIgnore = @"
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.next
.git
.gitignore
README.md
.env*
.vercel
.DS_Store
*.tsbuildinfo
"@
    Set-Content -Path "apps/frontend/.dockerignore" -Value $frontendDockerIgnore -Encoding UTF8
    
    Write-ColorOutput "[OK] .dockerignore files created" "Green"
}

function Start-Services {
    Write-ColorOutput "`n[START] Starting Docker services...`n" "Blue"
    
    if ($Build) {
        Write-ColorOutput "[BUILD] Building images..." "Yellow"
        docker-compose build --no-cache
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "[ERROR] Failed to build images" "Red"
            exit 1
        }
    }
    
    Write-ColorOutput "[UP] Starting services..." "Yellow"
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[OK] All services started successfully!" "Green"
    } else {
        Write-ColorOutput "[ERROR] Failed to start services" "Red"
        exit 1
    }
}

function Stop-Services {
    Write-ColorOutput "`n[STOP] Stopping all services..." "Yellow"
    docker-compose down
    Write-ColorOutput "[OK] All services stopped" "Green"
}

function Clean-Services {
    Write-ColorOutput "`n[CLEAN] Cleaning up Docker environment..." "Yellow"
    
    # Stop and remove containers
    docker-compose down -v
    
    # Remove images
    Write-ColorOutput "[CLEAN] Removing images..." "Yellow"
    docker-compose down --rmi all
    
    # Clean up unused Docker resources
    Write-ColorOutput "[CLEAN] Cleaning up unused Docker resources..." "Yellow"
    docker system prune -f
    
    Write-ColorOutput "[OK] Docker environment cleaned" "Green"
}

function Show-Logs {
    Write-ColorOutput "`n[LOGS] Showing service logs..." "Blue"
    docker-compose logs -f --tail=100
}

function Show-Status {
    Write-ColorOutput "`n[STATUS] Service Status:" "Cyan"
    Write-ColorOutput "===================" "Cyan"
    
    # Check if services are running
    $containers = docker-compose ps --format "table"
    if ($containers) {
        Write-Host $containers
    } else {
        Write-ColorOutput "[INFO] No services running" "Yellow"
    }
    
    Write-ColorOutput "`nAccess URLs:" "Cyan"
    Write-ColorOutput "============" "Cyan"
    Write-ColorOutput "Frontend Application: http://localhost:3000" "White"
    Write-ColorOutput "Backend gRPC Server: http://localhost:50051" "White"
    Write-ColorOutput "Backend HTTP Gateway: http://localhost:8080" "White"
    Write-ColorOutput "PostgreSQL Database: localhost:5432" "White"
}

function Wait-For-Services {
    Write-ColorOutput "`n[WAIT] Waiting for services to be ready..." "Yellow"
    
    $maxAttempts = 60
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        
        # Check backend health
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2 2>&1
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "[OK] Backend is ready!" "Green"
                break
            }
        } catch {
            # Backend not ready yet
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-ColorOutput "`n[WARN] Backend may not be ready yet. Check logs with: .\setup-docker.ps1 -Logs" "Yellow"
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Show-Banner
Check-Docker

if ($Stop) {
    Stop-Services
    exit 0
}

if ($Clean) {
    Clean-Services
    exit 0
}

if ($Logs) {
    Show-Logs
    exit 0
}

if ($Status) {
    Show-Status
    exit 0
}

# Default: Setup and start services
Create-DockerFiles
Start-Services
Wait-For-Services
Show-Status

Write-ColorOutput "`n[SUCCESS] Docker setup completed!" "Green"
Write-ColorOutput "Use '.\setup-docker.ps1 -Logs' to view logs" "Cyan"
Write-ColorOutput "Use '.\setup-docker.ps1 -Stop' to stop services" "Cyan"
Write-ColorOutput "Use '.\setup-docker.ps1 -Clean' to clean up" "Cyan"