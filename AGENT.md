# NyNus Exam Bank System - AI Agent Guide
*Hướng dẫn cho AI agents để làm việc hiệu quả với codebase*

## 📋 Tổng quan hệ thống

**NyNus Exam Bank System** là hệ thống ngân hàng câu hỏi trực tuyến sử dụng kiến trúc monorepo với gRPC communication.

### Thông tin cơ bản
- **Loại project**: Monorepo với pnpm workspaces
- **Ngôn ngữ chính**: Go 1.23.5 (backend), TypeScript/Next.js 15.4.5 (frontend)
- **Database**: PostgreSQL 15 với golang-migrate
- **Communication**: gRPC + gRPC-Web với Protocol Buffers
- **Containerization**: Docker Compose
- **Kích thước**: ~2000+ files, 8 gRPC services, 16+ database tables

## 🏗️ Kiến trúc Monorepo

```
exam-bank-system/
├── apps/
│   ├── backend/          # Go gRPC server (port 50051, HTTP gateway 8080)
│   └── frontend/         # Next.js 15 app (port 3000)
├── packages/
│   ├── proto/            # Protocol Buffer definitions
│   └── database/         # PostgreSQL migrations
├── scripts/              # Development & build scripts
├── tools/                # Build tools & utilities
└── docs/                 # Documentation
```

## 🚀 Build & Development Commands

### Khởi động nhanh (Recommended)
```powershell
# Khởi động toàn bộ hệ thống
.\start-project.ps1

# Hoặc khởi động từng service
.\start-project.ps1 -Backend    # Chỉ backend + database
.\start-project.ps1 -Frontend   # Chỉ frontend
.\start-project.ps1 -Database   # Chỉ PostgreSQL
```

### Backend (Go gRPC Server)
```bash
# Build và chạy backend
make dev                    # Generate proto + build + run
make build                  # Build binary
make run                    # Run existing binary
make test                   # Run tests
make proto                  # Generate Protocol Buffer code

# Database operations
make db-up                  # Start PostgreSQL
make migrate               # Run migrations
make seed                  # Seed default data
make db-shell              # Connect to database
```

### Frontend (Next.js)
```bash
cd apps/frontend
pnpm dev                   # Development server (port 3000)
pnpm build                 # Production build
pnpm type-check           # TypeScript validation
pnpm lint                 # ESLint check

# Generate gRPC-Web code
../../scripts/development/gen-proto-web.ps1
```

### Protocol Buffers
```bash
# Generate Go code (backend)
make proto

# Generate TypeScript code (frontend)
./scripts/development/gen-proto-web.ps1
```

## 📁 Cấu trúc dự án chi tiết

### Backend (apps/backend/)
```
apps/backend/
├── cmd/main.go              # Entry point
├── internal/
│   ├── app/                 # Application setup
│   ├── grpc/               # 8 gRPC service implementations
│   ├── repository/         # Data access layer
│   ├── entity/             # Database entities
│   ├── middleware/         # 6-layer interceptor chain
│   ├── migration/          # Database migration runner
│   └── server/http.go      # gRPC-Gateway HTTP server
├── go.mod                  # Go dependencies
└── Dockerfile              # Container build
```

**Key Services**: UserService, QuestionService, AdminService, ProfileService, ContactService, NewsletterService, QuestionFilterService, NotificationService

### Frontend (apps/frontend/)
```
apps/frontend/
├── src/
│   ├── app/                # Next.js 15 App Router
│   ├── components/         # React components
│   ├── services/grpc/      # gRPC-Web clients
│   ├── generated/          # Generated protobuf code
│   ├── contexts/           # React contexts
│   └── lib/                # Utilities & configs
├── package.json            # Dependencies & scripts
└── next.config.js          # Next.js configuration
```

### Protocol Buffers (packages/proto/)
```
packages/proto/
├── v1/                     # API version 1
│   ├── user.proto          # User authentication & management
│   ├── question.proto      # Question management
│   ├── admin.proto         # Admin operations
│   └── *.proto             # Other service definitions
├── common/                 # Shared definitions
│   └── common.proto        # Enums, Response wrappers
├── buf.yaml               # Buf configuration
└── gen/                   # Generated code (auto-generated)
```

### Database (packages/database/)
```
packages/database/
└── migrations/
    ├── 000001_initial_schema.up.sql        # Users, basic auth
    ├── 000002_question_bank_system.up.sql  # Questions, answers
    ├── 000003_add_missing_question_fields.up.sql
    ├── 000004_enhanced_auth_system.up.sql  # JWT, sessions
    ├── 000005_contact_newsletter_system.up.sql
    └── 000006_exam_system.up.sql           # Exams, attempts
```

## 🔧 Environment Setup

### Prerequisites
- **Go**: 1.23.5+
- **Node.js**: 18+
- **pnpm**: Latest
- **Docker**: For PostgreSQL
- **Protocol Buffers**: protoc compiler

### Environment Variables (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exam_bank_db
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# gRPC
GRPC_PORT=50051
HTTP_PORT=8080

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🧪 Testing

### Backend Tests
```bash
make test                  # Run all tests
make test-coverage        # Generate coverage report
go test -v ./apps/backend/internal/latex/...  # Specific package
```

### Frontend Tests
```bash
cd apps/frontend
pnpm test                 # Jest tests
pnpm test:e2e            # Playwright E2E tests
```

## 🐳 Docker Development

### Quick Start
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres    # Database only
docker-compose up -d backend     # Backend + database
```

### Docker Commands
```bash
# Build images
docker-compose build

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Stop services
docker-compose down
```

## ⚠️ Common Issues & Solutions

### 1. Protocol Buffer Generation Fails
```bash
# Install required tools
make install-tools

# Clean and regenerate
make proto-clean
make proto
```

### 2. Database Connection Issues
```bash
# Reset database
make db-reset

# Check database status
make status
```

### 3. Frontend gRPC-Web Issues
```powershell
# Regenerate TypeScript code
./scripts/development/gen-proto-web.ps1

# Clear Next.js cache
cd apps/frontend
pnpm clean:cache
```

### 4. Port Conflicts
- Backend gRPC: 50051
- Backend HTTP: 8080
- Frontend: 3000
- PostgreSQL: 5432

## 📊 Key Metrics & Performance

### Build Times
- Backend build: ~30s
- Frontend build: ~2-3 minutes
- Proto generation: ~10s
- Database migration: ~5s

### Service URLs
- **Frontend**: http://localhost:3000
- **Backend gRPC**: localhost:50051
- **Backend HTTP**: http://localhost:8080
- **Database**: localhost:5432

## 🔍 Debugging & Monitoring

### Logs
```bash
# Backend logs
./bin/exam-bank-backend

# Frontend logs
cd apps/frontend && pnpm dev:verbose

# Database logs
docker-compose logs postgres
```

### Health Checks
- Backend HTTP: `GET http://localhost:8080/health`
- Database: `make db-shell`

## 📚 Important Files to Know

### Configuration Files
- `Makefile` - Backend build commands
- `docker-compose.yml` - Container orchestration
- `pnpm-workspace.yaml` - Monorepo workspace
- `apps/frontend/next.config.js` - Next.js config
- `packages/proto/buf.yaml` - Protocol buffer config

### Entry Points
- `apps/backend/cmd/main.go` - Backend main
- `apps/frontend/src/app/layout.tsx` - Frontend root
- `apps/backend/internal/database/migrations/` - Database schema

### Generated Code (DO NOT EDIT)
- `packages/proto/gen/` - Generated Go code
- `apps/frontend/src/generated/` - Generated TypeScript code

---

**⚡ Quick Start Checklist:**
1. Clone repository
2. Run `.\start-project.ps1` (Windows) or equivalent
3. Wait for services to start
4. Access frontend at http://localhost:3000
5. Backend API at http://localhost:8080

**🔧 For Development:**
1. Always run `make proto` after changing .proto files
2. Use `make dev` for backend development
3. Use `pnpm dev` in apps/frontend for frontend development
4. Check `make status` for service health
