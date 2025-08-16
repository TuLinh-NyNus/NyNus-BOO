#!/bin/bash

# Database Setup Script with Migration Support

set -e

echo "🗄️ Setting up PostgreSQL Database with Migrations..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [ -f "apps/backend/.env" ]; then
    export $(cat apps/backend/.env | grep -v '^#' | xargs)
fi

# Default database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-exam_bank_user}
DB_PASSWORD=${DB_PASSWORD:-exam_bank_password}
DB_NAME=${DB_NAME:-exam_bank_db}
DB_SSLMODE=${DB_SSLMODE:-disable}

# Check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL connection..."
    
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
            print_success "PostgreSQL is running"
            return 0
        fi
    fi
    
    print_warning "PostgreSQL is not running. Starting with Docker..."
    start_postgres_docker
}

# Start PostgreSQL with Docker
start_postgres_docker() {
    print_status "Starting PostgreSQL with Docker..."
    
    # Check if container already exists
    if docker ps -a --format "table {{.Names}}" | grep -q "exam-bank-postgres"; then
        print_status "Container exists. Starting..."
        docker start exam-bank-postgres
    else
        print_status "Creating new PostgreSQL container..."
        docker run -d \
            --name exam-bank-postgres \
            -e POSTGRES_DB=$DB_NAME \
            -e POSTGRES_USER=$DB_USER \
            -e POSTGRES_PASSWORD=$DB_PASSWORD \
            -p $DB_PORT:5432 \
            -v exam_bank_data:/var/lib/postgresql/data \
            postgres:14
    fi
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "PostgreSQL is ready!"
            return 0
        fi
        sleep 2
    done
    
    print_error "PostgreSQL failed to start"
    exit 1
}

# Create migration table
create_migration_table() {
    print_status "Creating schema_migrations table..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
    version BIGINT PRIMARY KEY,
    dirty BOOLEAN NOT NULL DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
SQL

    print_success "Schema migrations table created"
}

# Run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    MIGRATION_DIR="packages/database/migrations"
    
    if [ ! -d "$MIGRATION_DIR" ]; then
        print_error "Migration directory not found: $MIGRATION_DIR"
        exit 1
    fi
    
    # Check if migrate tool is available
    if ! command -v migrate &> /dev/null; then
        print_warning "golang-migrate not found. Installing..."
        install_migrate_tool
    fi
    
    DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"
    
    # Run migrations
    migrate -path $MIGRATION_DIR -database "$DATABASE_URL" up
    
    print_success "Migrations completed successfully"
}

# Install migrate tool
install_migrate_tool() {
    print_status "Installing golang-migrate..."
    
    if command -v go &> /dev/null; then
        go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
        print_success "golang-migrate installed"
    else
        print_error "Go is not installed. Cannot install migrate tool."
        print_status "Please install manually:"
        echo "  https://github.com/golang-migrate/migrate/tree/master/cmd/migrate"
        exit 1
    fi
}

# Show database status
show_status() {
    print_status "Database Status:"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
        print_success "Database connection: OK"
        
        # Show migration status
        MIGRATION_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM schema_migrations;" 2>/dev/null | tr -d ' ' || echo "0")
        echo "  Applied migrations: $MIGRATION_COUNT"
        
        # Show table count
        TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
        echo "  Tables: $TABLE_COUNT"
    else
        print_error "Database connection: FAILED"
    fi
}

# Seed database with sample data
seed_database() {
    print_status "Seeding database with sample data..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'SQL'
-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@exambank.com', '$2a$10$hash', 'Admin', 'User', 'admin', true),
('550e8400-e29b-41d4-a716-446655440002', 'teacher@exambank.com', '$2a$10$hash', 'Teacher', 'User', 'teacher', true),
('550e8400-e29b-41d4-a716-446655440003', 'student@exambank.com', '$2a$10$hash', 'Student', 'User', 'student', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (id, text, type, difficulty, explanation, tags) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'What is 2 + 2?', 'multiple_choice', 'easy', 'Basic arithmetic', ARRAY['math', 'basic']),
('550e8400-e29b-41d4-a716-446655440102', 'What is the capital of Vietnam?', 'multiple_choice', 'medium', 'Geography question', ARRAY['geography', 'vietnam']),
('550e8400-e29b-41d4-a716-446655440103', 'Explain quantum mechanics', 'essay', 'hard', 'Physics concept', ARRAY['physics', 'quantum'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample answers
INSERT INTO answers (id, question_id, text, is_correct) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', '4', true),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440101', '3', false),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440101', '5', false),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440102', 'Hanoi', true),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440102', 'Ho Chi Minh City', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample exams
INSERT INTO exams (id, title, description, duration_minutes, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Basic Math Test', 'Simple arithmetic test', 30, '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440302', 'Geography Quiz', 'World geography test', 45, '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;
SQL

    print_success "Sample data inserted"
}

# Main execution
case "${1:-setup}" in
    "setup")
        check_postgres
        create_migration_table
        run_migrations
        seed_database
        show_status
        ;;
    "start")
        check_postgres
        show_status
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "status")
        show_status
        ;;
    "reset")
        print_warning "This will drop all tables and recreate them!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
            create_migration_table
            run_migrations
            seed_database
            print_success "Database reset completed"
        fi
        ;;
    *)
        echo "Database Management Commands:"
        echo "  setup   - Full database setup (default)"
        echo "  start   - Start database and check status"
        echo "  migrate - Run migrations only"
        echo "  seed    - Insert sample data"
        echo "  status  - Show database status"
        echo "  reset   - Reset database (dangerous!)"
        ;;
esac
