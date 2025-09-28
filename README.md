# 🎓 NyNus Exam Bank System

Hệ thống ngân hàng đề thi hiện đại, có khả năng mở rộng cao được xây dựng với Go gRPC backend và Next.js frontend.

## ✨ Tính năng đã hoàn thành

### 🔐 Hệ thống xác thực & phân quyền
- **Đăng nhập/Đăng ký**: Hỗ trợ email/password và Google OAuth
- **Phân quyền 5 cấp**: Guest, Student, Tutor, Teacher, Admin
- **JWT + Session Management**: Dual-token system với refresh token rotation
- **Bảo mật nâng cao**: Rate limiting, account locking, audit logs
- **Quản lý phiên**: Tối đa 3 thiết bị đồng thời, session tracking

### 📝 Quản lý câu hỏi
- **CRUD hoàn chỉnh**: Tạo, đọc, cập nhật, xóa câu hỏi
- **Import CSV**: Nhập hàng loạt câu hỏi từ file CSV (2,795+ câu hỏi mẫu)
- **Hệ thống phân loại**: QuestionCode với ID5/ID6 format
- **Tìm kiếm nâng cao**: Full-text search với filters phức tạp
- **5 loại câu hỏi**: Multiple Choice, True/False, Short Answer, Essay, Matching
- **4 mức độ khó**: Easy, Medium, Hard, Expert

### 👥 Quản trị hệ thống
- **Admin Dashboard**: Giao diện quản trị hoàn chỉnh
- **User Management**: Quản lý người dùng, roles, permissions
- **Question Management**: Quản lý ngân hàng câu hỏi
- **System Monitoring**: Audit logs, resource access tracking
- **Contact & Newsletter**: Hệ thống liên hệ và newsletter

### 🌐 API & Communication
- **gRPC Services**: 8 services hoàn chỉnh (User, Question, Admin, Profile, Contact, Newsletter, QuestionFilter, Notification)
- **gRPC-Web Client**: Frontend integration với TypeScript
- **HTTP Gateway**: REST API compatibility qua grpc-gateway
- **Protocol Buffers**: Type-safe API definitions

## 🏗️ Kiến trúc hệ thống

### Monorepo Structure
```
exam-bank-system/
├── apps/
│   ├── frontend/           # Next.js 15 + React 19 + TypeScript
│   └── backend/            # Go 1.23 + gRPC + PostgreSQL
├── packages/
│   ├── proto/              # Protocol Buffer definitions
│   └── database/           # Database migrations & schemas
├── docs/                   # Documentation & work tracking
├── scripts/                # Development & deployment scripts
└── tools/                  # Build tools & utilities
```

### Communication Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │     │  HTTP Gateway   │     │  gRPC Server    │
│   (Port 3000)   │───▶│   (Port 8080)    │───▶│   (Port 50051)  │
│                 │     │                 │     │                 │
│ • gRPC-Web      │     │ • gRPC-Gateway  │     │ • 8 gRPC Services│
│ • TypeScript    │     │ • CORS Support  │     │ • JWT Auth      │
│ • Auth Context  │     │ • REST Compat   │     │ • PostgreSQL    │
│ • Shadcn UI     │     │ • Metadata Pass │     │ • Interceptors  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### gRPC Services
- **UserService**: Authentication, registration, user management
- **ProfileService**: User profiles, sessions, preferences
- **AdminService**: Admin operations, user management, audit logs
- **QuestionService**: Question CRUD operations
- **QuestionFilterService**: Advanced search & filtering
- **ContactService**: Contact form submissions
- **NewsletterService**: Newsletter subscriptions & campaigns
- **NotificationService**: System notifications

## 🚀 Tech Stack thực tế

### Backend (Go)
- **Language**: Go 1.23.5
- **Framework**: gRPC + Protocol Buffers
- **Database**: PostgreSQL 15+ với 16+ tables
- **Authentication**: JWT + Google OAuth + Session Management
- **Repository Pattern**: Custom với pgtype, pgx/v5
- **Security**: 6-layer interceptor chain (Auth, Rate Limit, RBAC, Audit)
- **Migration**: golang-migrate với versioned SQL

### Frontend (Next.js)
- **Framework**: Next.js 15.4.5 với App Router
- **React**: React 19.1.0 + TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.1.11 + Shadcn UI
- **gRPC Client**: @improbable-eng/grpc-web + generated TypeScript
- **State Management**: Zustand + React Query + Auth Context
- **Package Manager**: pnpm workspaces

### Database Schema
- **Users System**: users, sessions, refresh_tokens, oauth_accounts
- **Question System**: Question, QuestionCode, QuestionImage, QuestionTag, QuestionFeedback
- **Admin System**: audit_logs, resource_access, user_preferences
- **Communication**: contact_submissions, newsletter_subscriptions, newsletter_campaigns
- **Exam System**: exams, exam_questions, exam_attempts, exam_answers (6 tables)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Development**: PowerShell scripts (Windows-optimized)
- **Proto Generation**: buf + protoc với TypeScript/Go generation
- **Ports**: Frontend :3000, HTTP Gateway :8080, gRPC :50051, PostgreSQL :5432

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** (v18+ recommended) - cho Next.js frontend
- **pnpm** (package manager) - quản lý dependencies
- **Go** (v1.23+) - cho gRPC backend
- **PostgreSQL** (v15+) - database chính
- **PowerShell** (Windows) - development scripts
- **Docker** (optional) - containerization
- **protoc** + buf (optional) - Protocol Buffer compilation

### 1. Clone Repository
```bash
git clone https://github.com/AnhPhan49/exam-bank-system.git
cd exam-bank-system
```

### 2. Environment Setup

#### Option A: Quick OAuth Setup (Recommended)
```powershell
# Run automated OAuth setup script
./scripts/setup-oauth-dev.ps1
# Follow the prompts to enter your Google OAuth credentials
```

#### Option B: Manual Setup
```powershell
# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local
# Edit .env files with your configuration
```

#### Google OAuth Setup
For Google login functionality, you need OAuth credentials:
1. **Follow the complete guide**: [Google OAuth Setup Guide](docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md)
2. **Quick validation**: Run `./scripts/validate-oauth-config.ps1` to check your configuration

### 3. Choose Your Development Mode

#### 🔧 **Native Development** (Recommended for development)
```powershell
# Start all services (Native PostgreSQL + Go + Next.js)
.\scripts\project\start-project.ps1

# Or start specific services
.\scripts\project\start-project.ps1 -Backend     # Backend only
.\scripts\project\start-project.ps1 -Frontend    # Frontend only
.\scripts\project\start-project.ps1 -Database    # Database only
.\scripts\project\start-project.ps1 -Help        # Show help

# Stop all services
.\scripts\project\stop-project.ps1
```

#### 🐳 **Full Docker Stack** (Production-like environment)
```powershell
# Development Docker environment
.\scripts\docker\docker-dev.ps1

# Production Docker environment
.\scripts\docker\docker-prod.ps1

# Advanced Docker setup
.\scripts\docker\setup-docker.ps1

# Options
.\scripts\docker\docker-dev.ps1 -Build        # Force rebuild images
.\scripts\docker\docker-dev.ps1 -Stop         # Stop all services
.\scripts\docker\docker-dev.ps1 -Clean        # Clean up containers & volumes
.\scripts\docker\docker-dev.ps1 -Logs         # View service logs
.\scripts\docker\docker-dev.ps1 -Status       # Check service status
```

#### ⚡ **Hybrid Mode** (Docker DB + Native apps)
```powershell
# PostgreSQL in Docker, Backend/Frontend native
.\scripts\project\quick-start.ps1

# Options
.\scripts\project\quick-start.ps1 -Stop          # Stop all services
.\scripts\project\quick-start.ps1 -Clean         # Clean up database
.\scripts\project\quick-start.ps1 -Status        # Check status
```

#### 🐋 **Docker Compose Only**
```powershell
# Development environment
docker-compose -f docker/compose/docker-compose.yml up -d

# Production environment
docker-compose -f docker/compose/docker-compose.prod.yml up -d

# Check services
docker-compose -f docker/compose/docker-compose.yml ps
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
.\scripts\project\start-project.ps1     # 🔧 Start everything (native)
.\scripts\project\stop-project.ps1      # 🚫 Stop everything

# Quick start with Docker DB
.\scripts\project\quick-start.ps1       # ⚡ Hybrid mode

# Docker development
.\scripts\docker\docker-dev.ps1         # 🐳 Full Docker environment
.\quick-start.ps1 -Stop          # Stop hybrid mode

# Full Docker environment
.\setup-docker.ps1               # 🐳 Production-like setup
.\setup-docker.ps1 -Stop         # Stop Docker stack
```

## 🌐 Service URLs & Endpoints

### Main Services
| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js application |
| **Admin Dashboard** | http://localhost:3000/admin/dashboard | Admin panel |
| **gRPC-Gateway** | http://localhost:8080 | HTTP/REST gateway |
| **gRPC Server** | localhost:50051 | Pure gRPC server |
| **PostgreSQL** | localhost:5432 | Database server |

### Key Pages
| Page | URL | Chức năng |
|------|-----|-----------|
| **Trang chủ** | http://localhost:3000 | Landing page với features |
| **Đăng nhập** | http://localhost:3000/login | Authentication |
| **Câu hỏi** | http://localhost:3000/questions | Question browsing & search |
| **Luyện tập** | http://localhost:3000/practice | Practice exercises |
| **Liên hệ** | http://localhost:3000/lien-he | Contact form |
| **Hướng dẫn** | http://localhost:3000/huong-dan | User guide |

### gRPC API Endpoints
```bash
# Authentication
v1.UserService/Login
v1.UserService/GoogleLogin
v1.UserService/Register
v1.UserService/RefreshToken

# User Management
v1.UserService/GetCurrentUser
v1.UserService/ListUsers
v1.ProfileService/GetProfile
v1.AdminService/ListUsers

# Question Management
v1.QuestionService/CreateQuestion
v1.QuestionService/GetQuestion
v1.QuestionFilterService/ListQuestionsByFilter
v1.QuestionFilterService/SearchQuestions

# System Services
v1.ContactService/SubmitContact
v1.NewsletterService/Subscribe
v1.NotificationService/GetNotifications
```

## 🔧 Development Features

### 📜 **Available Scripts:**

**Project Management Scripts** (in `scripts/project/`):
| Script | Purpose | Docker | Use Case |
|--------|---------|--------|----------|
| **`scripts/project/start-project.ps1`** | Native development | ❌ No | Main development work |
| **`scripts/project/quick-start.ps1`** | Hybrid development | 🕸️ Partial | Quick testing with Docker DB |
| **`scripts/project/stop-project.ps1`** | Stop native services | ❌ No | Clean shutdown |

**Docker Management Scripts** (in `scripts/docker/`):
| Script | Purpose | Docker | Use Case |
|--------|---------|--------|----------|
| **`scripts/docker/docker-dev.ps1`** | Development Docker | ✅ Yes | Full Docker development |
| **`scripts/docker/docker-prod.ps1`** | Production Docker | ✅ Yes | Production deployment |
| **`scripts/docker/setup-docker.ps1`** | Advanced Docker setup | ✅ Yes | Docker configuration |

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

### Development Guides
- **[Development Setup](docs/DEVELOPMENT_SETUP.md)** - Complete development environment setup
- **[gRPC Web Setup](docs/GRPC_WEB_SETUP.md)** - gRPC-Web configuration guide
- **[Git Workflow](docs/GIT_WORKFLOW.md)** - Development workflow guidelines

### Architecture Documentation
- **[Auth Complete Guide](docs/arch/AUTH_COMPLETE_GUIDE.md)** - Authentication system architecture
- **[Library Implementation](docs/arch/LIBRARY_IMPLEMENT.md)** - Library system design

### Implementation Status
- **[Auth System Checklist](docs/checklist/checklist_update_auth.md)** - Authentication implementation status
- **[Question System Checklist](docs/checklist/checklist_update_ques.md)** - Question management status
- **[Migration Success Report](apps/frontend/docs/MIGRATION_SUCCESS_100_PERCENT.md)** - gRPC migration completion

### API & Testing
- **[Question CSV Format](docs/question_new_fixed.csv)** - Sample data với 2,795 câu hỏi
- **[Docker Setup Guide](DOCKER_SETUP.md)** - Container deployment guide

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

## 📍 Cấu trúc dự án thực tế

```
exam-bank-system/                    # Monorepo root
├── apps/
│   ├── backend/                     # Go gRPC Backend
│   │   ├── cmd/main.go             # Entry point
│   │   ├── internal/               # Business logic
│   │   │   ├── app/               # App initialization
│   │   │   ├── config/            # Configuration
│   │   │   ├── container/         # Dependency injection
│   │   │   ├── entity/            # Domain entities (16 files)
│   │   │   ├── grpc/              # gRPC service handlers (8 services)
│   │   │   ├── repository/        # Data access layer (15 repos)
│   │   │   ├── service/           # Business services
│   │   │   ├── middleware/        # gRPC interceptors (6 layers)
│   │   │   ├── migration/         # Database migrations
│   │   │   └── server/            # HTTP gateway server
│   │   ├── pkg/proto/             # Generated Go code
│   │   └── go.mod                 # Go dependencies
│   └── frontend/                   # Next.js Frontend
│       ├── src/
│       │   ├── app/               # Next.js App Router (20+ pages)
│       │   │   ├── admin/         # Admin dashboard
│       │   │   ├── questions/     # Question management
│       │   │   ├── login/         # Authentication
│       │   │   └── api/auth/      # NextAuth API routes
│       │   ├── components/        # React components (100+ files)
│       │   │   ├── admin/         # Admin components
│       │   │   ├── auth/          # Auth components
│       │   │   ├── questions/     # Question components
│       │   │   └── ui/            # Shadcn UI components
│       │   ├── services/grpc/     # gRPC client services (8 services)
│       │   ├── contexts/          # React contexts (auth, modal, notification)
│       │   ├── hooks/             # Custom hooks (20+ hooks)
│       │   ├── lib/               # Utilities & helpers
│       │   └── generated/         # Generated TypeScript from proto
│       ├── package.json           # Frontend dependencies
│       └── next.config.js         # Next.js configuration
├── packages/
│   ├── proto/                     # Protocol Buffer definitions
│   │   ├── common/common.proto    # Common types & enums
│   │   └── v1/                    # API version 1 (9 proto files)
│   │       ├── user.proto         # User & auth services
│   │       ├── question.proto     # Question management
│   │       ├── question_filter.proto # Advanced filtering
│   │       ├── admin.proto        # Admin operations
│   │       ├── profile.proto      # User profiles
│   │       ├── contact.proto      # Contact forms
│   │       ├── newsletter.proto   # Newsletter system
│   │       └── notification.proto # Notifications
│   └── database/migrations/       # Database migrations (6 migrations)
├── docs/                          # Documentation & tracking
│   ├── arch/                      # Architecture docs
│   ├── checklist/                 # Development checklists
│   └── work-tracking/             # Task management
├── scripts/                       # Development scripts
│   ├── development/               # Dev tools (proto generation)
│   ├── setup/                     # Setup scripts
│   └── utilities/                 # Utility scripts
├── tools/                         # Build tools
│   ├── protoc/                    # Protocol Buffer compiler
│   └── docker/                    # Docker configurations
└── pnpm-workspace.yaml            # Monorepo configuration
```

## 🔐 Demo Credentials

```bash
# Default test accounts (tự động tạo khi chạy migrations)
Admin:    admin@exambank.com    / password123
Teacher:  teacher@exambank.com  / password123
Student:  student@exambank.com  / password123

# Google OAuth
- Hỗ trợ đăng nhập bằng Google Account
- Tự động tạo user với role STUDENT
- Email verification qua Google
```

## 📊 Database Schema

### Core Tables (16 tables)
```sql
-- User Management (8 tables)
users                    -- Main user table với 5 roles
sessions                 -- Active user sessions
refresh_tokens          -- JWT refresh token rotation
oauth_accounts          -- Google OAuth accounts
email_verification_tokens -- Email verification
password_reset_tokens   -- Password reset
user_preferences        -- User settings
audit_logs             -- System audit trail

-- Question System (5 tables)
Question               -- Main questions table
QuestionCode          -- Classification system (ID5/ID6)
QuestionImage         -- Image attachments
QuestionTag           -- Free-form tags
QuestionFeedback      -- User feedback

-- Communication (3 tables)
contact_submissions   -- Contact form data
newsletter_subscriptions -- Newsletter emails
newsletter_campaigns  -- Email campaigns

-- Exam System (6 tables) - In development
exams, exam_questions, exam_attempts,
exam_answers, exam_results, exam_feedback
```

## 🧪 Testing & Development

### Backend Testing
```powershell
cd apps/backend

# Unit tests
go test ./internal/service/... -v
go test ./internal/repository/... -v

# Test with coverage
go test -cover ./internal/...

# Specific service tests
go test ./internal/service/domain_service/auth/... -v
```

### Frontend Testing
```powershell
cd apps/frontend

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Component-specific linting
pnpm lint:components
pnpm lint:hooks
pnpm lint:contexts

# Build verification
pnpm build
```

### Integration Testing
```bash
# Test API endpoints với sample data
TOKEN=$(curl -s -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exambank.com", "password": "password123"}' | jq -r '.accessToken')

# Test question filtering
curl -s -X POST "http://localhost:8080/api/v1/questions/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question_code_filter": {"grades": ["0"]}, "pagination": {"page": 1, "limit": 5}}'
```

## 🚽 Troubleshooting

### 🔧 **Native Development Issues**
```powershell
# Port conflicts
.\scripts\project\stop-project.ps1              # Stop all native services
.\scripts\project\start-project.ps1             # Restart

# Check what's running
.\scripts\project\start-project.ps1 -Help       # Show available options
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

## 📚 gRPC API Documentation

### Protocol Buffer Communication
- **Transport**: gRPC-Web từ frontend → HTTP Gateway → gRPC Server
- **Serialization**: Protocol Buffers (binary, type-safe)
- **Authentication**: JWT tokens trong gRPC metadata
- **Error Handling**: gRPC status codes + custom error messages

### Implemented Services (8/8)

#### 1. UserService - Authentication & User Management
```protobuf
service UserService {
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc GoogleLogin(GoogleLoginRequest) returns (LoginResponse);
  rpc Register(RegisterRequest) returns (RegisterResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc VerifyEmail(VerifyEmailRequest) returns (VerifyEmailResponse);
  rpc ForgotPassword(ForgotPasswordRequest) returns (ForgotPasswordResponse);
  rpc ResetPassword(ResetPasswordRequest) returns (ResetPasswordResponse);
  rpc GetCurrentUser(GetCurrentUserRequest) returns (GetUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}
```

#### 2. QuestionFilterService - Advanced Search & Filtering
```protobuf
service QuestionFilterService {
  rpc ListQuestionsByFilter(ListQuestionsByFilterRequest) returns (ListQuestionsByFilterResponse);
  rpc SearchQuestions(SearchQuestionsRequest) returns (SearchQuestionsResponse);
  rpc GetQuestionsByQuestionCode(GetQuestionsByQuestionCodeRequest) returns (GetQuestionsByQuestionCodeResponse);
}
```

#### 3. AdminService - System Administration
```protobuf
service AdminService {
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
  rpc GetAuditLogs(GetAuditLogsRequest) returns (GetAuditLogsResponse);
}
```

#### 4. ProfileService - User Profiles & Sessions
```protobuf
service ProfileService {
  rpc GetProfile(GetProfileRequest) returns (GetProfileResponse);
  rpc UpdateProfile(UpdateProfileRequest) returns (UpdateProfileResponse);
  rpc GetSessions(GetSessionsRequest) returns (GetSessionsResponse);
  rpc TerminateSession(TerminateSessionRequest) returns (TerminateSessionResponse);
  rpc GetPreferences(GetPreferencesRequest) returns (GetPreferencesResponse);
  rpc UpdatePreferences(UpdatePreferencesRequest) returns (UpdatePreferencesResponse);
}
```

### Frontend gRPC Integration
```typescript
// Generated TypeScript clients
import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';
import { QuestionFilterServiceClient } from '@/generated/v1/Question_filterServiceClientPb';

// Authentication metadata
function getAuthMetadata(): { [key: string]: string } {
  const token = localStorage.getItem('nynus-auth-token');
  return token ? { 'authorization': `Bearer ${token}` } : {};
}

// Example service call
const response = await userServiceClient.login(request, getAuthMetadata());
```

## 🔗 gRPC Protocol Details

### Communication Flow
```
Frontend (TypeScript)  →  gRPC-Web  →  HTTP Gateway  →  gRPC Server (Go)
     ↓                       ↓              ↓               ↓
Generated Clients      Binary Proto    REST/HTTP      Native gRPC
Auth Context          Metadata Pass   CORS Headers   JWT Validation
Error Handling        Status Codes    Error Mapping  Business Logic
```

### Protocol Buffer Schema
```protobuf
// Common types (packages/proto/common/common.proto)
enum UserRole {
  USER_ROLE_GUEST = 1;      // Khách
  USER_ROLE_STUDENT = 2;    // Học sinh
  USER_ROLE_TUTOR = 3;      // Gia sư
  USER_ROLE_TEACHER = 4;    // Giáo viên
  USER_ROLE_ADMIN = 5;      // Quản trị viên
}

enum QuestionType {
  QUESTION_TYPE_MULTIPLE_CHOICE = 1;  // Trắc nghiệm
  QUESTION_TYPE_TRUE_FALSE = 2;       // Đúng/Sai
  QUESTION_TYPE_SHORT_ANSWER = 3;     // Trả lời ngắn
  QUESTION_TYPE_ESSAY = 4;            // Tự luận
  QUESTION_TYPE_MATCHING = 5;         // Ghép đôi
}

// Response wrapper cho tất cả API calls
message Response {
  bool success = 1;
  string message = 2;
  repeated string errors = 3;
}
```

### Authentication Flow
```typescript
// 1. Login request
const loginRequest = new LoginRequest();
loginRequest.setEmail('user@example.com');
loginRequest.setPassword('password');

// 2. gRPC call với metadata
const response = await userServiceClient.login(loginRequest, {
  'content-type': 'application/grpc-web+proto'
});

// 3. Extract tokens (dual-token system)
const accessToken = response.getAccessToken();      // JWT cho API calls
const refreshToken = response.getRefreshToken();    // Refresh token rotation
const sessionToken = response.getSessionToken();    // Session management

// 4. Store for subsequent requests
localStorage.setItem('nynus-auth-token', accessToken);
```

### Error Handling
```typescript
import { grpc } from '@improbable-eng/grpc-web';

try {
  const response = await questionFilterServiceClient.searchQuestions(request, getAuthMetadata());
  return response.getQuestionsList();
} catch (error) {
  if (error.code === grpc.Code.UNAUTHENTICATED) {
    // Token expired - redirect to login
    router.push('/login');
  } else if (error.code === grpc.Code.PERMISSION_DENIED) {
    // Insufficient permissions
    toast.error('Không có quyền truy cập chức năng này');
  } else if (error.code === grpc.Code.INVALID_ARGUMENT) {
    // Validation error
    toast.error('Dữ liệu không hợp lệ');
  } else {
    // Generic error
    toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
  }
}
```

### Code Generation Process
```bash
# Generate Go code (backend)
buf generate --template packages/proto/buf.gen.yaml

# Generate TypeScript code (frontend)
buf generate --template packages/proto/buf.gen.ts.yaml

# Manual generation với protoc (alternative)
protoc --proto_path=packages/proto \
  --go_out=apps/backend/pkg/proto \
  --go-grpc_out=apps/backend/pkg/proto \
  --grpc-gateway_out=apps/backend/pkg/proto \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:apps/frontend/src/generated \
  packages/proto/v1/*.proto packages/proto/common/*.proto
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
