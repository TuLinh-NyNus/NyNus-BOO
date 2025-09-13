# 🎓 Exam Bank System

A modern, scalable exam management system built with Go gRPC backend and React frontend.

## ✨ Features

- 👥 **User Management**: Role-based access control (Admin, Teacher, Student)
- 📝 **Question Bank**: Create and manage exam questions
- 📊 **Exam Administration**: Create, schedule, and grade exams
- 🔐 **JWT Authentication**: Secure token-based authentication
- 🌐 **gRPC API**: High-performance API with Protocol Buffers
- 📱 **Responsive UI**: Modern React interface with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │     │  Envoy Proxy    │     │  gRPC Server    │
│   (Port 3001)   │───▶│   (Port 8080)    │───▶│   (Port 50051)  │
│                 │     │                 │     │                 │
│ • Authentication│     │ • HTTP → gRPC   │     │ • User Service  │
│ • User Interface│     │ • CORS Handling │     │ • Auth/JWT      │
│ • gRPC-Web      │     │ • Load Balancing│     │ • PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: gRPC with Protocol Buffers
- **Database**: PostgreSQL 15+
- **Authentication**: JWT tokens
- **ORM**: Custom repository pattern with pgtype

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **API Client**: gRPC-Web
- **State Management**: React Hooks

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Proxy**: Envoy for gRPC-Web
- **CI/CD**: GitHub Actions
- **Database**: PostgreSQL with migrations

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### 1. Clone Repository
```bash
git clone https://github.com/AnhPhan49/exam-bank-system.git
cd exam-bank-system
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Check services
docker-compose ps
```

### 4. Manual Setup (Development)
```bash
# 1. Start database
make db-up

# 2. Start backend
make run-backend

# 3. Verify setup
curl http://localhost:8080/health

# 4. Start frontend (optional)
cd apps/frontend
npm install
npm run dev
```

## 📚 Documentation

- **[Development Setup](docs/DEVELOPMENT_SETUP.md)** - Complete development environment setup
- **[API Testing Guide](docs/API_TESTING_GUIDE.md)** - How to test all APIs with examples
- **[CSV Import Format](docs/question_import_csv_format.md)** - Question import format specification
- **[Example Test Script](docs/examples/test_apis_example.py)** - Python script for API testing

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
- **Frontend**: http://localhost:3001
- **Backend gRPC**: localhost:50051
- **gRPC-Web Proxy**: http://localhost:8080

## 📁 Project Structure

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
│   └── frontend/               # React Web Application
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── services/      # API clients
│       │   └── generated/     # Generated gRPC clients
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   ├── proto/                  # Protocol Buffer definitions
│   │   ├── common/            # Shared types
│   │   └── v1/                # API v1 definitions
│   └── database/              # Database schemas
│       └── migrations/        # SQL migrations
├── tools/
│   ├── scripts/               # Build scripts
│   └── docker/                # Docker configurations
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD pipelines
├── docker-compose.yml         # Full system setup
├── Makefile                   # Build commands
└── README.md
```

## 🔐 Demo Credentials

```bash
Admin:    admin@exambank.com    / password123
Teacher:  teacher@exambank.com  / password123
Student:  student@exambank.com  / password123
```

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
go test ./internal/service/... -v

# Frontend tests
cd apps/frontend
npm test

# Integration tests
make test
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
