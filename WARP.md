# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **modern exam management system** built with a **gRPC-first architecture**, consisting of a Go backend and React frontend. The system handles user authentication, question banking, and exam administration with role-based access control.

## Essential Development Commands

### Quick Start
```bash
# Full system startup with Docker
docker-compose up -d

# Manual development setup
make proto          # Generate Protocol Buffer code
make build          # Build backend binary  
make dev           # Generate proto, build and run backend
```

### Backend Development
```bash
# Core development workflow
make proto         # Generate Protocol Buffer files from packages/proto/
make build         # Build Go binary to bin/exam-bank-backend
make run          # Run the compiled backend server
make build-run    # Build and run in one command

# Database operations
make db-up        # Start PostgreSQL with docker-compose
make db-down      # Stop database
make db-reset     # Reset database (stop and start)
make migrate      # Run database migrations
make seed         # Seed database with default data
make db-shell     # Connect to database shell

# Code quality
make test         # Run Go tests
make test-coverage # Run tests with coverage report
make lint         # Run golangci-lint
make fmt          # Format Go code
```

### Frontend Development
```bash
cd apps/frontend

# Development
npm run dev       # Start Next.js dev server on port 3000
npm run dev:fast  # Start with Turbo mode
npm run build     # Build for production
npm run start     # Start production server

# Code quality
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting issues
npm run type-check # TypeScript type checking

# Performance
npm run build:fast    # Fast build without linting
npm run perf:build   # Performance monitoring for builds
```

### Protocol Buffers & Code Generation
```bash
make proto        # Generate Go and TypeScript code from .proto files
make proto-clean  # Clean generated proto files

# Proto files are located in packages/proto/
# Generated files: 
#   - Go: apps/backend/pkg/proto/
#   - TypeScript: apps/frontend/src/generated/
```

### Testing
```bash
# Backend testing
cd apps/backend
go test ./internal/service/... -v    # Test services
make test                            # Run all backend tests
make test-coverage                   # Generate coverage report

# Frontend testing  
cd apps/frontend
npm test                            # Run Jest tests
npx playwright test                 # Run E2E tests
```

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Envoy Proxy    │    │  gRPC Server    │
│   (Port 3000)   │───▶│   (Port 8080)   │───▶│   (Port 50051)  │
│                 │    │                 │    │                 │
│ • Authentication│    │ • HTTP → gRPC   │    │ • User Service  │
│ • User Interface│    │ • CORS Handling │    │ • Auth/JWT      │
│ • gRPC-Web      │    │ • Load Balancing│    │ • PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Architecture (Go gRPC)

**Layered Clean Architecture:**
```
apps/backend/
├── cmd/main.go                    # Application entry point
├── internal/
│   ├── container/                 # Dependency injection container
│   ├── grpc/                      # gRPC service implementations
│   │   ├── user_service.go        # User & Auth gRPC handlers
│   │   └── question_service.go    # Question management handlers
│   ├── service/
│   │   ├── service_mgmt/          # Service Management Layer
│   │   │   ├── auth/              # Authentication management
│   │   │   ├── user/              # User management  
│   │   │   └── question/          # Question management
│   │   └── domain_service/        # Domain Service Layer
│   │       ├── auth/              # Core auth business logic
│   │       ├── user/              # Core user business logic
│   │       └── question/          # Core question business logic
│   ├── repository/                # Data Access Layer
│   │   ├── user_repository.go     # User data operations
│   │   └── question_repository.go # Question data operations
│   ├── entity/                    # Domain entities/models
│   ├── middleware/                # gRPC interceptors (auth, logging)
│   └── util/                      # Shared utilities
└── pkg/proto/                     # Generated Protocol Buffer code
```

**Key Architectural Patterns:**
- **Three-Layer Service Pattern**: Service Management → Domain Service → Repository
- **gRPC-first API**: All operations exposed via gRPC with HTTP REST gateway
- **Dependency Injection**: Container-based DI for services and repositories  
- **JWT Authentication**: Token-based auth with role-based access control
- **PostgreSQL with Custom Repository Pattern**: Using pgtype for database operations

### Frontend Architecture (React + Next.js)

```
apps/frontend/src/
├── components/                    # Reusable UI components
├── services/                      # API client layer (gRPC-Web)
├── generated/                     # Generated gRPC client code
├── hooks/                         # Custom React hooks
├── contexts/                      # React context providers
├── store/                         # State management (Zustand)
└── lib/                          # Shared utilities
```

**Key Frontend Patterns:**
- **Next.js 15 App Router**: Modern React architecture with server components
- **gRPC-Web Integration**: Direct communication with gRPC backend
- **Component-driven UI**: Radix UI + Tailwind CSS + Shadcn components
- **State Management**: Zustand for global state, React Query for server state
- **TypeScript-first**: Full type safety with generated gRPC types

## Database & Migrations

**PostgreSQL Schema Management:**
```bash
# Database is managed through SQL migrations in packages/database/migrations/
# Current migrations:
# - 000001_initial_schema.sql (Users, basic schema)
# - 000002_question_bank_system.sql (Questions, exams, answers)
# - 000003_rename_to_snake_case.sql (Schema standardization)

# Run migrations
make migrate

# Connect to database 
make db-shell
```

## Protocol Buffer Services

**API Services defined in packages/proto/v1/:**
- **UserService**: Authentication, user management, student listing
- **QuestionService**: Question CRUD, CSV import, pagination
- **ExamService**: Exam creation and management (planned)

**Key gRPC Endpoints:**
```
# Authentication
v1.UserService/Login
v1.UserService/Register

# User Management
v1.UserService/GetUser  
v1.UserService/ListUsers
v1.UserService/GetStudentList

# Question Management
v1.QuestionService/CreateQuestion
v1.QuestionService/GetQuestion
v1.QuestionService/ListQuestions
v1.QuestionService/ImportQuestions
```

## Key Development Guidelines

### Code Organization
- **Follow the established 3-layer service pattern** when adding new features
- **Use the dependency injection container** for service initialization
- **Generate Protocol Buffer code** before building when .proto files change
- **Maintain separation** between gRPC handlers, service logic, and data access

### Authentication Flow
- JWT tokens are required for most operations
- Role-based access: admin, teacher, student
- Authentication handled in middleware layer with context propagation
- Demo credentials available in README.md

### Database Operations
- Use the repository pattern with pgtype for type safety
- Always run migrations for schema changes
- Follow snake_case naming convention for database fields
- Use pagination for list operations

### Testing Strategy
- Backend: Unit tests for services, integration tests for repositories
- Frontend: Component tests with Jest, E2E tests with Playwright
- Coverage targets: 90%+ for business logic, 80%+ for services

## Development Rules Integration

This project **MUST STRICTLY FOLLOW** rules defined in `.augment/rules/`:

### Core Clean Code Standards (`.augment/rules/coding.md`)
- **🔴 CRITICAL Rules** (CI/CD will fail if violated):
  - Functions <20 lines, <4 parameters
  - Files <300 lines, Classes <200 lines
  - No `console.log` statements in production code
  - 90%+ test coverage for business logic
- **Language Policy**: Vietnamese for business logic comments, English for technical implementation
- **Single Responsibility**: Each service/function has one clear purpose
- **Fail-Fast Validation**: Validate inputs at function start
- **Error Messages**: Vietnamese for user-facing errors

### Practical Coding Rules (`.augment/rules/practical-coding.md`)
- **🔴 CRITICAL Readability Rules**:
  - No magic numbers (use named constants)
  - No boolean parameters (use options objects)
  - Comments explain WHY not WHAT
  - Organized imports (node_modules → internal → relative)
- **Go Backend Specific**:
  - Vietnamese error messages for users
  - Small, focused interfaces
  - Consistent error handling patterns
  - Proper struct validation tags
- **Advanced Patterns**:
  - Early return pattern (guard clauses first)
  - Type-safe configurations with Zod
  - Enum instead of multiple booleans

### RIPER-5 Development Protocol (`.augment/rules/nynus-development-protocol.md`)
- **RESEARCH** → **INNOVATE** → **PLAN** → **EXECUTE** → **REVIEW**
- Always work within established monorepo structure
- Create task files in `docs/work-tracking/active/` for complex features
- TypeScript strict mode required for all code

## Common Development Tasks

### Adding a New gRPC Service
1. Define service in `packages/proto/v1/service_name.proto`
2. Run `make proto` to generate code
3. Implement service in `apps/backend/internal/grpc/service_name.go`
4. Add to dependency container in `internal/container/container.go`
5. Update HTTP server to register new service

### Database Schema Changes
1. Create new migration file in `packages/database/migrations/`
2. Run `make migrate` to apply changes
3. Update entity models in `apps/backend/internal/entity/`
4. Modify repository methods as needed

### Adding Frontend Components
1. Create component in `apps/frontend/src/components/`
2. Follow Shadcn UI patterns for consistency
3. Use generated gRPC types for API communication
4. Add to appropriate pages or layouts

## Performance Considerations
- **Backend**: gRPC provides high-performance communication
- **Frontend**: Next.js optimizes bundle size and loading
- **Database**: Use pagination for large datasets, optimize queries
- **Caching**: Frontend uses React Query for server-side caching

## Deployment
- **Docker-based**: Full system runs with `docker-compose up -d`
- **Production builds**: Use `make release` for backend, `npm run build` for frontend
- **Environment**: Configure via `.env` files (see `.env.example`)
