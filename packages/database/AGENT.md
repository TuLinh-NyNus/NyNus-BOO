# Database - PostgreSQL Schema Agent Guide
*Hướng dẫn cho AI agents làm việc với database schema và migrations*

## 📋 Tổng quan Database

**NyNus Database** sử dụng PostgreSQL 15 với golang-migrate để quản lý schema evolution.

### Thông tin kỹ thuật
- **Database**: PostgreSQL 15
- **Migration Tool**: golang-migrate
- **Connection**: pgx driver (Go), connection pooling
- **Port**: 5432 (default), 5439 (development)
- **Schema**: 16+ tables across 6 migration files

## 🏗️ Cấu trúc Database Package

```
packages/database/
├── migrations/                    # Migration files
│   ├── 000001_initial_schema.up.sql        # Users, basic auth
│   ├── 000001_initial_schema.down.sql
│   ├── 000002_question_bank_system.up.sql  # Questions, answers
│   ├── 000002_question_bank_system.down.sql
│   ├── 000003_add_missing_question_fields.up.sql
│   ├── 000003_add_missing_question_fields.down.sql
│   ├── 000004_enhanced_auth_system.up.sql  # JWT, sessions, OAuth
│   ├── 000004_enhanced_auth_system.down.sql
│   ├── 000005_contact_newsletter_system.up.sql
│   ├── 000005_contact_newsletter_system.down.sql
│   ├── 000006_exam_system.up.sql           # Exams, attempts
│   └── 000006_exam_system.down.sql
└── README.md                      # Database documentation
```

## 🗄️ Database Schema Overview

### Core Tables (16+ tables)

#### 1. User Management (Migration 001, 004)
```sql
-- users: Core user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- refresh_tokens: JWT refresh token management
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- sessions: User session tracking
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- oauth_accounts: OAuth integration (Google, etc.)
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Question System (Migration 002, 003)
```sql
-- questions: Core question data
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    subject VARCHAR(100),
    topic VARCHAR(100),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- answers: Answer options for questions
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- question_codes: Question classification system (ID5/ID6)
CREATE TABLE question_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- question_tags: Tagging system
CREATE TABLE question_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- question_images: Image attachments
CREATE TABLE question_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Communication System (Migration 005)
```sql
-- contacts: Contact form submissions
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- newsletters: Newsletter subscriptions
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);
```

#### 4. Exam System (Migration 006)
```sql
-- exams: Exam configurations
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passing_score DECIMAL(5,2),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- exam_attempts: User exam attempts
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress'
);
```

## 🚀 Migration Commands

### Basic Migration Operations
```bash
# Start database
make db-up                     # Start PostgreSQL container

# Run migrations
make migrate                   # Apply all pending migrations

# Database management
make db-reset                  # Reset database (down + up)
make db-shell                  # Connect to database shell
make seed                      # Seed default data
```

### Manual Migration Commands
```bash
# Using custom migrator (recommended)
# Migrations are automatically run when starting the application
go run apps/backend/cmd/main.go

# Manual migration using scripts
./scripts/database/gen-db.sh migrate

# Check migration status (connect to database)
psql -h localhost -p 5439 -U exam_bank_user -d exam_bank_db -c "SELECT version, dirty, applied_at FROM schema_migrations ORDER BY version;"
```

## 🔧 Database Configuration

### Connection Settings
```bash
# Environment variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exam_bank_db
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_URL=postgres://exam_bank_user:exam_bank_password@localhost:5432/exam_bank_db?sslmode=disable
```

### Docker Compose Configuration
```yaml
# docker-compose.yml
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
```

## 📊 Key Relationships

### Entity Relationships
```
Users (1) ←→ (N) Questions
Users (1) ←→ (N) RefreshTokens
Users (1) ←→ (N) Sessions
Users (1) ←→ (N) OAuthAccounts
Users (1) ←→ (N) ExamAttempts

Questions (1) ←→ (N) Answers
Questions (1) ←→ (1) QuestionCodes
Questions (1) ←→ (N) QuestionTags
Questions (1) ←→ (N) QuestionImages

Exams (1) ←→ (N) ExamAttempts
```

### Indexes for Performance
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Question indexes
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_created_at ON questions(created_at);

-- Question code indexes
CREATE INDEX idx_question_codes_code ON question_codes(code);
CREATE INDEX idx_question_codes_category ON question_codes(category);

-- Session indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Refresh token indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

## 🛠️ Development Workflow

### Adding New Migration
1. **Create migration files**:
```bash
# Create new migration files manually in apps/backend/internal/database/migrations/
# Follow naming convention: 000XXX_feature_name.up.sql and 000XXX_feature_name.down.sql
# Example:
# 000010_new_feature_name.up.sql
# 000010_new_feature_name.down.sql
```

2. **Write up migration** (000007_new_feature_name.up.sql):
```sql
-- Add new table or modify existing
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_new_table_name ON new_table(name);
```

3. **Write down migration** (000007_new_feature_name.down.sql):
```sql
-- Reverse the changes
DROP INDEX IF EXISTS idx_new_table_name;
DROP TABLE IF EXISTS new_table;
```

4. **Test migration**:
```bash
make migrate              # Apply migration
make db-reset            # Test rollback and reapply
```

### Modifying Existing Tables
```sql
-- Add column (safe)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add index (safe)
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);

-- Modify column (potentially breaking)
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(320);

-- Drop column (breaking)
ALTER TABLE users DROP COLUMN old_column;
```

## ⚠️ Common Issues & Solutions

### 1. Migration Fails
```bash
# Check migration status
psql -h localhost -p 5439 -U exam_bank_user -d exam_bank_db -c "SELECT version, dirty, applied_at FROM schema_migrations ORDER BY version;"

# Check application logs for migration status
# Migrations run automatically on application startup

# Manual migration using scripts
./scripts/database/gen-db.sh migrate
```

### 2. Database Connection Issues
```bash
# Check database status
make status
docker-compose ps postgres

# Check connection
psql -h localhost -p 5432 -U exam_bank_user -d exam_bank_db

# Reset database
make db-reset
```

### 3. Data Integrity Issues
```sql
-- Check foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';

-- Check for orphaned records
SELECT q.id FROM questions q
LEFT JOIN users u ON q.created_by = u.id
WHERE u.id IS NULL;
```

### 4. Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE questions;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔍 Database Monitoring

### Health Checks
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('exam_bank_db'));

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### Backup & Restore
```bash
# Backup database
pg_dump -h localhost -p 5432 -U exam_bank_user exam_bank_db > backup.sql

# Restore database
psql -h localhost -p 5432 -U exam_bank_user exam_bank_db < backup.sql

# Docker backup
docker exec exam_bank_postgres pg_dump -U exam_bank_user exam_bank_db > backup.sql
```

## 📚 Best Practices

### Migration Best Practices
1. **Always create both up and down migrations**
2. **Test migrations on copy of production data**
3. **Use transactions for complex migrations**
4. **Add indexes concurrently in production**
5. **Never modify existing migrations after deployment**

### Schema Design Best Practices
1. **Use UUIDs for primary keys**
2. **Add created_at/updated_at timestamps**
3. **Use proper foreign key constraints**
4. **Add appropriate indexes for queries**
5. **Use meaningful column names**

### Data Types
```sql
-- ✅ Good: Appropriate data types
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
email VARCHAR(255) NOT NULL
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
score DECIMAL(5,2)
is_active BOOLEAN NOT NULL DEFAULT TRUE

-- ❌ Bad: Generic or inappropriate types
id TEXT
email TEXT
created_at TEXT
score TEXT
is_active TEXT
```

---

**🚀 Quick Database Setup:**
1. `make db-up` - Start PostgreSQL
2. `make migrate` - Apply all migrations
3. `make seed` - Add default data
4. `make db-shell` - Connect to database

**🔧 Before Schema Changes:**
1. Create proper up/down migrations
2. Test on development database
3. Backup production data
4. Plan rollback strategy
