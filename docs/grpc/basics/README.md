# gRPC Implementation trong NyNus Exam Bank System

## 📋 Tổng quan

NyNus Exam Bank System sử dụng **gRPC** làm giao thức chính cho communication giữa Frontend (Next.js 14) và Backend (Go + NestJS-style architecture). Hệ thống implement **dual protocol architecture**:

- **gRPC-Web**: Frontend ↔ Backend qua HTTP/1.1 (port 8080)
- **Pure gRPC**: Backend internal services qua HTTP/2 (port 50051)

## 🚀 Quick Start

### Prerequisites

```bash
# Required tools
- Go 1.23.5+
- Node.js 18+
- pnpm 8+
- buf CLI (Protocol Buffers compiler)
- Docker (optional)
```

### Installation

```bash
# Clone repository
git clone https://github.com/AnhPhan49/exam-bank-system.git
cd exam-bank-system

# Install dependencies
pnpm install

# Generate proto code
cd packages/proto
buf generate --template buf.gen.yaml        # Go code
buf generate --template buf.gen.ts.yaml    # TypeScript code
```

### Running the System

```bash
# Terminal 1: Start Backend (gRPC Server + HTTP Gateway)
cd apps/backend
go run cmd/server/main.go

# Terminal 2: Start Frontend (Next.js)
cd apps/frontend
pnpm dev

# Access
# - Frontend: http://localhost:3000
# - HTTP Gateway: http://localhost:8080
# - gRPC Server: localhost:50051
```

### Testing gRPC Endpoints

```bash
# Using grpcurl (install: brew install grpcurl)
grpcurl -plaintext localhost:50051 list                    # List all services
grpcurl -plaintext localhost:50051 list v1.UserService     # List service methods

# Test Login endpoint
grpcurl -plaintext -d '{"email":"test@example.com","password":"password123"}' \
  localhost:50051 v1.UserService/Login

# Using HTTP Gateway (via curl)
curl -X POST http://localhost:8080/v1.UserService/Login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🏗️ Architecture Overview

### Dual Protocol System

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 14)                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Service │  │Question Svc  │  │  Exam Svc    │  ...     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                     gRPC-Web Client                              │
│                     (HTTP/1.1 + JSON)                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP Gateway (Port 8080)                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  gRPC-Web → gRPC Transcoding                               │ │
│  │  - HTTP/1.1 → HTTP/2                                       │ │
│  │  - JSON → Protocol Buffers                                 │ │
│  │  - CORS handling                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    gRPC Server (Port 50051)                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  7-Layer Interceptor Chain:                                │ │
│  │  1. Rate Limit → 2. CSRF → 3. Auth → 4. Session →         │ │
│  │  5. Role/Level → 6. Resource Protection → 7. Audit Log    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ UserService  │  │QuestionSvc   │  │  ExamSvc     │  ...     │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Frontend** tạo gRPC-Web request với metadata (Authorization, CSRF token)
2. **HTTP Gateway** nhận HTTP/1.1 request, transcode sang gRPC
3. **Interceptor Chain** xử lý security, auth, rate limiting
4. **gRPC Service** thực thi business logic
5. **Response** được trả về qua cùng đường đi ngược lại

## 📦 Available Services

| Service | Status | Backend | Frontend | HTTP Gateway | Proto File |
|---------|--------|---------|----------|--------------|------------|
| **UserService** | ✅ 95% | ✅ | ✅ | ✅ | `user.proto` |
| **QuestionService** | ✅ 90% | ✅ | ✅ | ✅ | `question.proto` |
| **QuestionFilterService** | ✅ 95% | ✅ | ✅ | ✅ | `question_filter.proto` |
| **ExamService** | ⚠️ 75% | ✅ | ⚠️ Mock | ❌ Commented | `exam.proto` |
| **AdminService** | ✅ 90% | ✅ | ✅ | ✅ | `admin.proto` |
| **ProfileService** | ✅ 90% | ✅ | ✅ | ✅ | `profile.proto` |
| **ContactService** | ✅ 95% | ✅ | ✅ | ✅ | `contact.proto` |
| **NewsletterService** | ✅ 95% | ✅ | ✅ | ✅ | `newsletter.proto` |
| **NotificationService** | ⚠️ 70% | ✅ | ⚠️ Mock | ❌ Missing | `notification.proto` |
| **MapCodeService** | ❌ 60% | ✅ | ❌ Stub | ❌ Commented | `mapcode.proto` |
| **BlogService** | ❌ 40% | ❌ | ❌ | ❌ | `blog.proto` |
| **SearchService** | ❌ 40% | ❌ | ❌ | ❌ | `search.proto` |
| **ImportService** | ❌ 40% | ❌ | ❌ | ❌ | `import.proto` |
| **TikzCompilerService** | ❌ 30% | ❌ | ❌ | ❌ | `tikz.proto` |

**Legend**:
- ✅ Fully implemented
- ⚠️ Partially implemented / Mock
- ❌ Not implemented

### Service Categories

#### **Core Services** (Production Ready)
- **UserService**: Authentication, OAuth, user management
- **QuestionService**: CRUD, LaTeX parsing, image processing
- **QuestionFilterService**: Advanced filtering, full-text search
- **AdminService**: User management, audit logs, system stats
- **ProfileService**: User profiles, sessions, preferences

#### **Utility Services** (Production Ready)
- **ContactService**: Contact form handling
- **NewsletterService**: Newsletter subscriptions

#### **Partially Implemented** (Needs Work)
- **ExamService**: Backend ready, frontend using mock data, HTTP Gateway commented out
- **NotificationService**: Backend ready, frontend using mock WebSocket, HTTP Gateway missing
- **MapCodeService**: Backend ready, frontend stub only, HTTP Gateway commented out

#### **Planned Services** (Proto Only)
- **BlogService**: Blog/theory content management
- **SearchService**: Full-text search with streaming
- **ImportService**: File import with streaming
- **TikzCompilerService**: TikZ diagram compilation

## 🔐 Security Features

### 7-Layer Interceptor Chain

1. **RateLimitInterceptor**: Prevent abuse (e.g., 1 login per 10s)
2. **CSRFInterceptor**: CSRF token validation
3. **AuthInterceptor**: JWT token validation
4. **SessionInterceptor**: Session management
5. **RoleLevelInterceptor**: Role-based + Level-based authorization
6. **ResourceProtectionInterceptor**: Resource access tracking
7. **AuditLogInterceptor**: Audit logging for compliance

### Authentication Flow

```
1. User login → UserService.Login()
2. Backend validates credentials
3. Generate JWT access token (15 min) + refresh token (7 days)
4. Return tokens to frontend
5. Frontend stores tokens in localStorage
6. Subsequent requests include Authorization header
7. AuthInterceptor validates JWT on every request
```

### Authorization

- **Role Hierarchy**: GUEST < STUDENT < TUTOR < TEACHER < ADMIN
- **Level System**: 1-9 for STUDENT/TUTOR/TEACHER roles
- **Permission Checks**: RoleLevelInterceptor enforces access control

## 📚 Documentation Links

### Core Documentation
- **[Architecture Details](./GRPC_ARCHITECTURE.md)** - Deep dive into architecture
- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - How to add new services
- **[Security](./SECURITY.md)** - Security best practices
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Migrating from REST to gRPC

### Proto System Documentation (Comprehensive Analysis)
- **[🔍 System Analysis](./PROTO_SYSTEM_ANALYSIS.md)** - Comprehensive analysis of all 18 services
- **[💻 Usage Guide](./PROTO_USAGE_GUIDE.md)** - Developer guide with code examples
- **[🏗️ Architecture Diagrams](./GRPC_ARCHITECTURE.md)** - Visual representations
- **[⚡ Quick Reference](./PROTO_QUICK_REFERENCE.md)** - Daily reference guide
- **[🔧 Generation Workflow](./GENERATION_WORKFLOW.md)** - Proto code generation steps
- **[📋 Tooling Versions](./TOOLING_VERSIONS.md)** - Required tools and versions

> 💡 **New to gRPC?** Start with this [README](./README.md) for a guided tour!

## 🛠️ Development Workflow

### 1. Modify Proto Files

```bash
cd packages/proto
# Edit .proto files in v1/ or common/
```

### 2. Generate Code

```bash
# Generate Go code
buf generate --template buf.gen.yaml

# Generate TypeScript code
buf generate --template buf.gen.ts.yaml
```

### 3. Implement Backend Service

```bash
cd apps/backend/internal/grpc
# Create or edit service implementation
```

### 4. Register Service

```go
// apps/backend/internal/app/app.go
v1.RegisterMyServiceServer(a.grpcServer, myService)

// apps/backend/internal/server/http.go
v1.RegisterMyServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts)
```

### 5. Create Frontend Client

```bash
cd apps/frontend/src/services/grpc
# Create service wrapper
```

### 6. Test

```bash
# Backend tests
cd apps/backend
go test ./internal/grpc/...

# Frontend tests
cd apps/frontend
pnpm test
```

## 🐛 Common Issues

### Issue: "Service not found" error

**Cause**: Service not registered in HTTP Gateway

**Solution**: Check `apps/backend/internal/server/http.go` for service registration

### Issue: CORS errors in browser

**Cause**: Frontend origin not in CORS allowed list

**Solution**: Add origin to `allowedOrigins` in `http.go`

### Issue: "Unauthenticated" error

**Cause**: Missing or invalid JWT token

**Solution**: Check token in localStorage, verify token not expired

### Issue: Generated code not found

**Cause**: Code generation not run after proto changes

**Solution**: Run `buf generate` commands

## 📊 Performance Metrics

- **API Response Time**: <200ms for simple queries, <500ms for complex
- **Concurrent Users**: 100+ simultaneous learners
- **Rate Limits**: Configurable per endpoint (e.g., 1 login per 10s)

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes to proto files
3. Generate code
4. Implement backend + frontend
5. Write tests
6. Create PR

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AnhPhan49/exam-bank-system/issues)
- **Documentation**: This directory
- **Team**: NyNus Development Team

---

## 📦 Archive

Historical and deprecated documentation has been moved to `archive/` folder for reference. These files are no longer maintained and should not be used. See [archive/README.md](./archive/README.md) for details.

**Archived files** (27/10/2025):
- Historical reports from Jan 2025 (3 files)
- Deprecated proto docs (2 files)

**Reason**: Replaced by comprehensive Proto System Documentation (6 new files)

---

**Last Updated**: 2025-10-27  
**Version**: 2.0.0  
**Status**: Production Ready (Core Services) + Comprehensive Proto Docs

