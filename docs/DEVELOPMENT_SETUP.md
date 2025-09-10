# Development Setup Guide

## Quick Start

### 1. Prerequisites
- Go 1.21+
- Docker & Docker Compose
- Make
- Git

### 2. Clone and Setup
```bash
git clone <repository-url>
cd exam-bank-system
```

### 3. Start Database
```bash
make db-up
```

### 4. Start Backend
```bash
make run-backend
```

### 5. Verify Setup
```bash
curl -s "http://localhost:8080/health"
```

## Database Setup

### PostgreSQL Container
The system uses PostgreSQL running in Docker:
- **Host**: localhost
- **Port**: 5438
- **Database**: exam_bank_db
- **User**: exam_bank_user
- **Password**: exam_bank_password

### Migrations
Migrations run automatically on server start. Manual migration:
```bash
cd packages/database
migrate -path migrations -database "postgres://exam_bank_user:exam_bank_password@localhost:5438/exam_bank_db?sslmode=disable" up
```

### Default Users
The system creates default users automatically:
```sql
-- Admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) 
VALUES ('01K2C3SDZVEJ8WNJ3F68JTM668', 'admin@exambank.com', '$2a$10$hash', 'Admin', 'User', 'admin', true);

-- Teacher user  
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES ('01K2C3SDZVEJ8WNJ3F68JTM669', 'teacher@exambank.com', '$2a$10$hash', 'Teacher', 'User', 'teacher', true);

-- Student user
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
VALUES ('01K2C3SDZVEJ8WNJ3F68JTM670', 'student@exambank.com', '$2a$10$hash', 'Student', 'User', 'student', true);
```

## Backend Architecture

### Services
- **UserService**: Authentication, user management
- **QuestionService**: CRUD operations for questions
- **QuestionFilterService**: Advanced filtering and search

### Key Components
- **gRPC Server**: Port 50051
- **HTTP REST Gateway**: Port 8080 (grpc-gateway)
- **JWT Authentication**: Role-based access control
- **PostgreSQL**: Database with full-text search
- **Protocol Buffers**: API definitions

### Project Structure
```
apps/backend/
├── cmd/main.go              # Server entry point
├── internal/
│   ├── config/              # Configuration
│   ├── database/            # Database connection
│   ├── entity/              # Database entities
│   ├── repository/          # Data access layer
│   ├── service/             # Business logic
│   │   ├── domain_service/  # Domain services
│   │   └── grpc_service/    # gRPC handlers
│   ├── middleware/          # Authentication middleware
│   ├── util/               # Utilities
│   └── validation/         # Input validation
└── pkg/proto/              # Generated protobuf code
```

## Development Workflow

### 1. Make Changes
Edit code in `apps/backend/` or proto files in `packages/proto/`

### 2. Regenerate Proto (if needed)
```bash
make proto
```

### 3. Build and Test
```bash
cd apps/backend
make build
./bin/grpc-server
```

### 4. Test APIs
Use the API Testing Guide in `docs/API_TESTING_GUIDE.md`

## Environment Configuration

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5438
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_NAME=exam_bank_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Server
GRPC_PORT=50051
HTTP_PORT=8080

# Environment
ENV=development
LOG_LEVEL=info
```

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **question**: Main questions table with LaTeX content
- **question_code**: Question categorization codes
- **question_tag**: Tags for questions
- **question_image**: Associated images
- **question_feedback**: User feedback and ratings

### Naming Convention
- **Tables**: snake_case (question_code, question_tag)
- **Columns**: snake_case (created_at, question_id)
- **Indexes**: Prefixed with idx_ (idx_question_content_fts)

## Sample Data

### Import Sample Questions
```bash
# Sample CSV file is available at docs/question_new_fixed.csv
# Contains 2,795 real questions with Vietnamese content and LaTeX

# Login and get token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exambank.com", "password": "admin123"}' | jq -r '.accessToken')

# Import questions
CSV_BASE64=$(base64 -w 0 docs/question_new_fixed.csv)
curl -X POST "http://localhost:8080/api/v1/questions/import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"csv_data_base64\": \"$CSV_BASE64\", \"upsert_mode\": false}"
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL container is running
   docker ps | grep postgres
   
   # Restart database
   make db-down
   make db-up
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   ss -tlnp | grep 8080
   
   # Kill the process
   kill <pid>
   ```

3. **Migration Errors**
   ```bash
   # Check migration status
   docker exec local-examinationbank-postgres psql -U exam_bank_user -d exam_bank_db -c "SELECT * FROM schema_migrations;"
   
   # Reset database (WARNING: destroys data)
   make db-reset
   ```

4. **Proto Generation Issues**
   ```bash
   # Install protoc and plugins
   make install-proto-deps
   
   # Regenerate proto files
   make proto
   ```

### Debug Commands
```bash
# Check server health
curl -s "http://localhost:8080/health"

# Check database tables
docker exec local-examinationbank-postgres psql -U exam_bank_user -d exam_bank_db -c "\dt"

# Check question count
docker exec local-examinationbank-postgres psql -U exam_bank_user -d exam_bank_db -c "SELECT COUNT(*) FROM question;"

# View server logs
# Check the terminal where grpc-server is running

# Test authentication
curl -s -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exambank.com", "password": "admin123"}'
```

## Performance Notes

### Database Optimization
- Full-text search indexes on question content
- Composite indexes for common filter combinations
- Proper foreign key constraints and cascading deletes

### API Performance
- Filter APIs: 3-12ms response time
- Search APIs: 50-75ms (full-text search)
- Import APIs: ~181 questions/second

### Scaling Considerations
- Database connection pooling
- JWT token caching
- Pagination for large result sets
- Batch processing for imports
