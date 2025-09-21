# Backend - Go gRPC Server Agent Guide
*Hướng dẫn cho AI agents làm việc với Go backend*

## 📋 Tổng quan Backend

**NyNus Backend** là gRPC server được viết bằng Go 1.23.5, cung cấp 8 services chính cho hệ thống exam bank.

### Thông tin kỹ thuật
- **Framework**: Native Go với gRPC
- **Database**: PostgreSQL 15 với pgx driver
- **Authentication**: JWT + Refresh Token + Session Token
- **Ports**: 50051 (gRPC), 8080 (HTTP Gateway)
- **Architecture**: Clean Architecture với Repository pattern

## 🏗️ Cấu trúc Backend

```
apps/backend/
├── cmd/main.go                    # Entry point
├── internal/
│   ├── app/app.go                # Application bootstrap
│   ├── config/config.go          # Configuration management
│   ├── grpc/                     # gRPC service implementations
│   │   ├── user_service.go       # Authentication & user management
│   │   ├── question_service.go   # Question CRUD operations
│   │   ├── admin_service.go      # Admin operations
│   │   ├── profile_service.go    # User profile management
│   │   ├── contact_service.go    # Contact form handling
│   │   ├── newsletter_service.go # Newsletter subscription
│   │   ├── question_filter_service.go # Advanced question filtering
│   │   └── notification_service.go    # Notification system
│   ├── repository/               # Data access layer
│   ├── entity/                   # Database entities
│   ├── middleware/               # gRPC interceptors
│   ├── server/http.go           # gRPC-Gateway HTTP server
│   └── util/                    # Utilities
├── go.mod                       # Go dependencies
└── Dockerfile                   # Container build
```

## 🚀 Development Commands

### Build & Run
```bash
# Quick development (recommended)
make dev                    # Generate proto + build + run

# Step by step
make proto                  # Generate Protocol Buffer code
make build                  # Build binary to bin/exam-bank-backend
make run                    # Run existing binary

# Alternative direct run
go run ./cmd/main.go
```

### Testing
```bash
make test                   # Run all tests
make test-coverage         # Generate coverage report
make lint                  # Run golangci-lint
make fmt                   # Format code
make vet                   # Run go vet

# Specific package tests
go test -v ./internal/latex/...
go test -v ./internal/repository/...
```

### Database Operations
```bash
make db-up                 # Start PostgreSQL container
make migrate              # Run database migrations
make seed                 # Seed default data
make db-shell             # Connect to database shell
make db-reset             # Reset database (down + up)
```

## 🔧 Key Components

### 1. gRPC Services (internal/grpc/)

#### UserService (user_service.go)
- **Methods**: Login, Register, GoogleLogin, RefreshToken, Logout, etc.
- **Features**: JWT authentication, refresh token rotation, session management
- **Security**: Password hashing, rate limiting, device fingerprinting

#### QuestionService (question_service.go)
- **Methods**: CreateQuestion, GetQuestion, UpdateQuestion, DeleteQuestion, ListQuestions
- **Features**: LaTeX parsing, image handling, question code generation
- **Validation**: Content validation, duplicate detection

#### QuestionFilterService (question_filter_service.go)
- **Methods**: FilterQuestions, GetFilterOptions, SearchQuestions
- **Features**: Advanced filtering by difficulty, type, category, date range
- **Performance**: Optimized queries with pagination

#### AdminService (admin_service.go)
- **Methods**: GetUsers, UpdateUserRole, GetSystemStats, ManageContent
- **Features**: User management, system monitoring, content moderation
- **Authorization**: Role-based access control (RBAC)

### 2. Repository Layer (internal/repository/)

#### Key Repositories
- `user.go` - User CRUD operations
- `question_repository.go` - Question management
- `question_filter.go` - Advanced filtering logic
- `refresh_token.go` - Token management
- `session.go` - Session handling

#### Database Patterns
```go
// Repository interface pattern
type UserRepository interface {
    Create(ctx context.Context, user *entity.User) error
    GetByEmail(ctx context.Context, email string) (*entity.User, error)
    Update(ctx context.Context, user *entity.User) error
    Delete(ctx context.Context, id string) error
}

// Implementation with pgx
type userRepository struct {
    db *pgx.Conn
}
```

### 3. Middleware Chain (internal/middleware/)

**6-Layer Interceptor Chain:**
1. `auth_interceptor.go` - JWT validation
2. `session_interceptor.go` - Session management
3. `rate_limit_interceptor.go` - Rate limiting
4. `role_level_interceptor.go` - RBAC authorization
5. `resource_protection_interceptor.go` - Resource access control
6. `audit_log_interceptor.go` - Request logging

### 4. Database Entities (internal/entity/)

#### Core Entities
- `user.go` - User model with roles, status
- `question.go` - Question with LaTeX content, metadata
- `answer.go` - Answer options for questions
- `exam.go` - Exam configuration
- `question_code.go` - Question classification system

#### Entity Relationships
```go
type Question struct {
    ID           string    `json:"id" db:"id"`
    Content      string    `json:"content" db:"content"`
    QuestionType string    `json:"question_type" db:"question_type"`
    Difficulty   string    `json:"difficulty" db:"difficulty"`
    CreatedBy    string    `json:"created_by" db:"created_by"`
    Answers      []Answer  `json:"answers,omitempty"`
    Tags         []Tag     `json:"tags,omitempty"`
}
```

## 🔐 Authentication System

### JWT Token Flow
1. **Login** → Access Token (15m) + Refresh Token (7d) + Session Token
2. **Request** → Validate Access Token via middleware
3. **Refresh** → Rotate refresh token, issue new access token
4. **Logout** → Invalidate all tokens

### Security Features
- Password hashing with bcrypt
- Refresh token rotation
- Device fingerprinting
- Rate limiting (5 attempts/15min)
- Session management

## 🗄️ Database Integration

### Connection Management
```go
// Database connection (internal/database/database.go)
func NewConnection(cfg *config.Config) (*pgx.Conn, error) {
    connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
        cfg.Database.User, cfg.Database.Password,
        cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
    
    return pgx.Connect(context.Background(), connStr)
}
```

### Migration System
- Uses golang-migrate
- Files in `packages/database/migrations/`
- Run with `make migrate`

## 🔧 Configuration (internal/config/)

### Environment Variables
```go
type Config struct {
    Database struct {
        Host     string `env:"DB_HOST" envDefault:"localhost"`
        Port     string `env:"DB_PORT" envDefault:"5432"`
        Name     string `env:"DB_NAME" envDefault:"exam_bank_db"`
        User     string `env:"DB_USER" envDefault:"exam_bank_user"`
        Password string `env:"DB_PASSWORD"`
    }
    JWT struct {
        Secret               string `env:"JWT_SECRET"`
        AccessTokenExpiry    string `env:"JWT_ACCESS_TOKEN_EXPIRY" envDefault:"15m"`
        RefreshTokenExpiry   string `env:"JWT_REFRESH_TOKEN_EXPIRY" envDefault:"7d"`
    }
    Server struct {
        GRPCPort string `env:"GRPC_PORT" envDefault:"50051"`
        HTTPPort string `env:"HTTP_PORT" envDefault:"8080"`
    }
}
```

## 🧪 Testing Strategy

### Test Structure
```bash
# Unit tests
internal/latex/latex_parser_test.go
internal/validation/question_filter_validation_test.go

# Integration tests (planned)
internal/repository/*_test.go
internal/grpc/*_test.go
```

### Test Commands
```bash
# Run specific tests
go test -v ./internal/latex/
go test -v ./internal/validation/

# With coverage
go test -coverprofile=coverage.out ./internal/...
go tool cover -html=coverage.out
```

## ⚠️ Common Issues & Solutions

### 1. Database Connection Issues
```bash
# Check database status
make status
docker-compose ps postgres

# Reset database
make db-reset

# Manual connection test
make db-shell
```

### 2. gRPC Generation Issues
```bash
# Install required tools
make install-tools

# Clean and regenerate
make proto-clean
make proto

# Check generated files
ls -la packages/proto/gen/
```

### 3. Build Issues
```bash
# Clean build
make clean
make deps
make build

# Check Go version
go version  # Should be 1.23.5+
```

### 4. Port Conflicts
```bash
# Check port usage
netstat -an | grep :50051  # gRPC port
netstat -an | grep :8080   # HTTP port

# Kill processes if needed
lsof -ti:50051 | xargs kill -9
```

## 🔍 Debugging

### Logging
```go
// Use structured logging
log.WithFields(log.Fields{
    "user_id": userID,
    "action":  "login",
}).Info("User login attempt")
```

### Health Checks
```bash
# HTTP health endpoint
curl http://localhost:8080/health

# gRPC health check (if implemented)
grpcurl -plaintext localhost:50051 grpc.health.v1.Health/Check
```

## 📊 Performance Considerations

### Database Optimization
- Use prepared statements
- Implement connection pooling
- Add database indexes for frequent queries
- Use pagination for large result sets

### gRPC Optimization
- Use streaming for large data transfers
- Implement proper error handling
- Add request/response compression
- Monitor interceptor performance

## 🔧 Development Workflow

### Adding New Service
1. Define service in `.proto` file
2. Run `make proto` to generate Go code
3. Implement service in `internal/grpc/`
4. Add repository layer if needed
5. Register service in `internal/container/container.go`
6. Add tests

### Adding New Entity
1. Create entity in `internal/entity/`
2. Create migration in `packages/database/migrations/`
3. Implement repository in `internal/repository/`
4. Add validation if needed
5. Update related services

---

**🚀 Quick Development Setup:**
1. `make db-up` - Start database
2. `make migrate` - Run migrations
3. `make dev` - Start development server
4. Test with `curl http://localhost:8080/health`

**🔧 Before Committing:**
1. `make test` - Run tests
2. `make lint` - Check code quality
3. `make fmt` - Format code
4. Ensure all services are working
