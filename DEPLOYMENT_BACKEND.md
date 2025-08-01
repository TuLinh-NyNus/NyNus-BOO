# 🚀 Backend Deployment Guide

## Required Files for Backend Deployment

### **Core Application**
```
apps/backend/
├── cmd/main.go                 # Application entry point
├── internal/                   # Business logic
│   ├── app/                   # Application setup
│   ├── config/                # Configuration management
│   ├── container/             # Dependency injection
│   ├── database/              # Database utilities
│   ├── entity/                # Domain entities
│   ├── grpc/                  # gRPC handlers
│   ├── middleware/            # Authentication middleware
│   ├── repository/            # Data access layer
│   ├── service/               # Business services
│   └── util/                  # Utility functions
├── pkg/proto/                 # Generated proto files
├── go.mod                     # Go dependencies
├── go.sum                     # Dependency checksums
└── Dockerfile                 # Container configuration
```

### **Shared Dependencies**
```
packages/
├── proto/                     # Proto definitions (for compilation)
│   ├── common/common.proto
│   └── v1/
│       ├── user.proto
│       ├── question.proto
│       └── exam.proto
└── database/                  # Database setup
    └── migrations/
        └── 000001_initial_schema.up.sql
```

### **Build Tools**
```
tools/
├── scripts/gen-proto.sh       # Proto generation script
└── docker/docker-compose.yml  # Database setup
```

### **Root Files**
```
Makefile                       # Build commands
.env.example                   # Environment variables template
```

## Environment Variables Needed

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_NAME=exam_bank_db

# Server Configuration
GRPC_PORT=50051
JWT_SECRET=your-super-secret-jwt-key-here

# Optional
LOG_LEVEL=info
```

## Deployment Commands

```bash
# 1. Install dependencies
go mod download

# 2. Generate proto files
make proto

# 3. Build application
go build -o bin/grpc-server cmd/main.go

# 4. Run migrations (if needed)
# Setup PostgreSQL and run migration

# 5. Start server
./bin/grpc-server
```

## Docker Deployment

```dockerfile
# Dockerfile for backend
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN make proto
RUN go build -o bin/grpc-server cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/bin/grpc-server .
EXPOSE 50051
CMD ["./grpc-server"]
```

## What the Backend Provides

- **gRPC API** on port 50051
- **User Management**: Registration, login, user listing
- **JWT Authentication**: Secure token-based auth
- **PostgreSQL Integration**: User data persistence
- **Role-based Access**: Admin, Teacher, Student roles
