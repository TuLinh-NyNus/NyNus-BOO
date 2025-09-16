# 🎓 NyNus Exam Bank System

A modern, scalable exam management system built with Go gRPC backend and Next.js frontend.

## ✨ Features

- 👥 **User Management**: Role-based access control (Admin, Teacher, Student)
- 📝 **Question Bank**: Create and manage exam questions with CSV import
- 📊 **Exam Administration**: Create, schedule, and grade exams
- 🔐 **JWT Authentication**: Secure token-based authentication with Google OAuth
- 🌐 **gRPC API**: High-performance API with Protocol Buffers
- 📱 **Responsive UI**: Modern Next.js interface with Tailwind CSS
- 🔍 **Advanced Search**: Full-text search and filtering for questions
- 📄 **CSV Import**: Bulk import questions from CSV files

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │     │  HTTP Gateway   │     │  gRPC Server    │
│   (Port 3000)   │───▶│   (Port 8080)    │───▶│   (Port 50051)  │
│                 │     │                 │     │                 │
│ • Authentication│     │ • HTTP → gRPC   │     │ • User Service  │
│ • User Interface│     │ • CORS Handling │     │ • Question Service│
│ • API Client    │     │ • REST Gateway  │     │ • Auth/JWT      │
│ • State Mgmt    │     │                 │     │ • PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: gRPC with Protocol Buffers
- **Database**: PostgreSQL 15+
- **Authentication**: JWT tokens + Google OAuth
- **ORM**: Custom repository pattern with pgtype

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Shadcn/ui
- **API Client**: Axios + gRPC-Web
- **State Management**: Zustand + React Query
- **Package Manager**: pnpm

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: PowerShell automation scripts
- **CI/CD**: GitHub Actions
- **Database**: PostgreSQL with migrations

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** (v18+ recommended)
- **pnpm** (package manager)
- **Go** (v1.21+)
- **PostgreSQL** (v15+)
- **PowerShell** (for development scripts)

### 1. Clone Repository
```bash
git clone https://github.com/AnhPhan49/exam-bank-system.git
cd exam-bank-system
```

### 2. Environment Setup
```powershell
# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local
# Edit .env files with your configuration
```

### 3. Choose Your Development Mode

#### 🔧 **Native Development** (Recommended for development)
```powershell
# Start all services (Native PostgreSQL + Go + Next.js)
.\start-project.ps1

# Or start specific services
.\start-project.ps1 -Backend     # Backend only
.\start-project.ps1 -Frontend    # Frontend only 
.\start-project.ps1 -Database    # Database only
.\start-project.ps1 -Help        # Show help

# Stop all services
.\stop-project.ps1
```

#### 🐳 **Full Docker Stack** (Production-like environment)
```powershell
# Setup and start everything in Docker containers
.\setup-docker.ps1

# Options
.\setup-docker.ps1 -Build        # Force rebuild images
.\setup-docker.ps1 -Stop         # Stop all services
.\setup-docker.ps1 -Clean        # Clean up containers & volumes
.\setup-docker.ps1 -Logs         # View service logs
.\setup-docker.ps1 -Status       # Check service status
```

#### ⚡ **Hybrid Mode** (Docker DB + Native apps)
```powershell
# PostgreSQL in Docker, Backend/Frontend native
.\quick-start.ps1

# Options
.\quick-start.ps1 -Stop          # Stop all services
.\quick-start.ps1 -Clean         # Clean up database
.\quick-start.ps1 -Status        # Check status
```

#### 🐋 **Docker Compose Only**
```powershell
# Full stack
docker-compose up -d

# Database only
docker-compose -f docker-compose.simple.yml up -d

# Check services
docker-compose ps
```

### 5. Manual Development Setup
```powershell
# Backend
cd apps/backend
go mod download
go run cmd/main.go

# Frontend (in new terminal)
cd apps/frontend
pnpm install
pnpm dev
```

## 🚀 Quick Reference

### ⚡ **Most Common Commands:**
```powershell
# Quick start for development
.\start-project.ps1              # 🔧 Start everything (native)
.\stop-project.ps1               # 🚫 Stop everything

# Quick start with Docker DB
.\quick-start.ps1                # ⚡ Hybrid mode
.\quick-start.ps1 -Stop          # Stop hybrid mode

# Full Docker environment
.\setup-docker.ps1               # 🐳 Production-like setup
.\setup-docker.ps1 -Stop         # Stop Docker stack
```

🌐 ## Service URLs

Once started, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Login Page** | http://localhost:3000/login | User login |
| **Backend gRPC** | http://localhost:50051 | gRPC server |
| **Backend HTTP** | http://localhost:8080 | HTTP/REST gateway |
| **PostgreSQL** | localhost:5432 | Database |

## 🔧 Development Features

### 📜 **Available Scripts:**

| Script | Purpose | Docker | Use Case |
|--------|---------|--------|----------|
| **`start-project.ps1`** | Native development | ❌ No | Main development work |
| **`setup-docker.ps1`** | Full containerization | ✅ Yes | Production testing, CI/CD |
| **`quick-start.ps1`** | Hybrid development | 🕸️ Partial | Quick testing with Docker DB |
| **`stop-project.ps1`** | Stop native services | ❌ No | Clean shutdown |

### ✨ **Script Features:**
- ✅ Automatic dependency checking
- ✅ Service status monitoring  
- ✅ Port availability checking
- ✅ Colored output for better readability
- ✅ Graceful shutdown on Ctrl+C
- ✅ Multiple service windows for logs
- ✅ Individual service control
- ✅ Docker health checks (setup-docker.ps1)
- ✅ Automatic Dockerfile generation (setup-docker.ps1)
- ✅ Volume management (Docker scripts)

## 📋 Documentation

- **[Development Setup](docs/DEVELOPMENT_SETUP.md)** - Complete development environment setup
- **[API Testing Guide](docs/API_TESTING_GUIDE.md)** - How to test all APIs with examples
- **[gRPC Web Setup](docs/GRPC_WEB_SETUP.md)** - gRPC-Web configuration guide
- **[CSV Import Format](docs/README_CSV.md)** - Question import format specification
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Development implementation summary

## 🧪 Quick API Testing

### 1. Login and Get Token
```bash
TOKEN=$(curl -s -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exambank.com", "password": "admin123"}' | jq -r '.accessToken')
```

### 2. Import Sample Data (2,795 questions)
```bash
CSV_BASE64=$(base64 -w 0 docs/question_new_fixed.csv)
curl -X POST "http://localhost:8080/api/v1/questions/import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"csv_data_base64\": \"$CSV_BASE64\", \"upsert_mode\": false}"
```

### 3. Test Filter API
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question_code_filter": {"grades": ["0"]}, "pagination": {"page": 1, "limit": 5}}' | jq '.'
```

### 4. Test Search API
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "xác suất", "pagination": {"page": 1, "limit": 3}}' | jq '.'
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend gRPC**: localhost:50051
- **Backend HTTP**: http://localhost:8080

## 📍 Project Structure

```
exam-bank-system/
├── apps/
│   ├── backend/                 # Go gRPC API Server
│   │   ├── cmd/main.go         # Application entry point
│   │   ├── internal/           # Business logic
│   │   │   ├── app/           # Application setup
│   │   │   ├── config/        # Configuration
│   │   │   ├── entity/        # Domain entities
│   │   │   ├── grpc/          # gRPC handlers
│   │   │   ├── repository/    # Data access
│   │   │   └── service/       # Business services
│   │   ├── pkg/proto/         # Generated proto files
│   │   └── go.mod
│   └── frontend/               # Next.js Web Application
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   ├── components/    # React components
│       │   ├── lib/           # Utilities & helpers
│       │   ├── hooks/         # Custom React hooks
│       │   └── store/         # State management
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── proto/                  # Protocol Buffer definitions
│   └── database/              # Database schemas & migrations
├── tools/
│   ├── scripts/               # Development scripts
│   ├── docker/                # Docker configurations
│   └── protoc/                # Protocol Buffer compiler
├── scripts/                   # Additional build scripts
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD pipelines
├── bin/                       # Compiled binaries
├── content/                   # Static content
├── proto/                     # Proto files (root level)
├── src/                       # Source files (root level)
├── test/                      # Test files
├── start-project.ps1          # Main startup script
├── stop-project.ps1           # Stop all services script
├── quick-start.ps1            # Quick development script
├── setup-docker.ps1           # Docker setup script
├── docker-compose.yml         # Full system setup
├── docker-compose.simple.yml  # Database only
├── Makefile                   # Build commands
├── package.json               # Root package.json
├── pnpm-lock.yaml             # pnpm lock file
└── README.md
```

## 🔐 Demo Credentials

```bash
Admin:    admin@exambank.com    / password123
Teacher:  teacher@exambank.com  / password123
Student:  student@exambank.com  / password123
```

## 🧪 Testing

```powershell
# Backend tests
cd apps/backend
go test ./internal/service/... -v

# Frontend tests
cd apps/frontend
pnpm test
pnpm type-check
pnpm lint

# Integration tests
make test

# Using Makefile
make test-coverage    # Backend with coverage
make lint            # Backend linting
```

## 🚽 Troubleshooting

### 🔧 **Native Development Issues**
```powershell
# Port conflicts
.\stop-project.ps1              # Stop all native services
.\start-project.ps1             # Restart

# Check what's running
.\start-project.ps1 -Help       # Show available options
netstat -an | findstr ":3000"   # Check port 3000
netstat -an | findstr ":8080"   # Check port 8080
```

### 🐳 **Docker Issues**
```powershell
# Docker problems
.\setup-docker.ps1 -Status      # Check container status
.\setup-docker.ps1 -Logs        # View detailed logs
.\setup-docker.ps1 -Clean       # Nuclear option - clean everything
.\setup-docker.ps1 -Build       # Force rebuild if images corrupted

# Hybrid mode database issues
.\quick-start.ps1 -Clean        # Reset database container
docker ps                       # Check running containers
```

### 🚫 **Common Issues**

**PostgreSQL Not Starting:**
- **Native**: Check PostgreSQL service is installed
- **Docker**: Ensure Docker Desktop is running
- Verify port 5432 is not blocked by firewall

**Permission Errors:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Dependencies Missing:**
- **Node.js**: Download from nodejs.org
- **pnpm**: `npm install -g pnpm`
- **Go**: Download from golang.org
- **Docker**: Install Docker Desktop

**Services Won't Stop:**
```powershell
# Kill processes manually
Get-Process node | Stop-Process -Force
Get-Process go | Stop-Process -Force

# Or use task manager to kill:
# - node.exe (Frontend)
# - go.exe or main.exe (Backend)
```

## 📚 API Documentation

### gRPC Services
- **UserService**: User management and authentication
- **QuestionService**: Question bank management
- **ExamService**: Exam creation and administration

### Key Endpoints
```bash
# Authentication
v1.UserService/Register
v1.UserService/Login

# User Management
v1.UserService/GetUser
v1.UserService/ListUsers

# Questions (Coming Soon)
v1.QuestionService/CreateQuestion
v1.QuestionService/ListQuestions

# Exams (Coming Soon)
v1.ExamService/CreateExam
v1.ExamService/ListExams
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**PDA** - [AnhPhan49](https://github.com/AnhPhan49)

## 🙏 Acknowledgments

- Built with modern Go and React best practices
- Inspired by microservices architecture
- Uses Protocol Buffers for efficient communication
