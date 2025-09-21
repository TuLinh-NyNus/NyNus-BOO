#!/bin/bash

# Simple Database Setup

set -e

echo "🗄️ Setting up Simple PostgreSQL Database..."

# Load environment variables
if [ -f "apps/backend/.env" ]; then
    export $(cat apps/backend/.env | grep -v '^#' | xargs)
fi

# Default configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-exam_bank_db}

# Remove existing container
docker stop exam-bank-postgres 2>/dev/null || true
docker rm exam-bank-postgres 2>/dev/null || true

# Start PostgreSQL with Docker
echo "Starting PostgreSQL container on port $DB_PORT..."
docker run -d \
    --name exam-bank-postgres \
    -e POSTGRES_DB=$DB_NAME \
    -e POSTGRES_USER=$DB_USER \
    -e POSTGRES_PASSWORD=$DB_PASSWORD \
    -p $DB_PORT:5432 \
    postgres:14

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
sleep 15

# Create tables
echo "Creating database schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'SQL'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version BIGINT PRIMARY KEY,
    dirty BOOLEAN NOT NULL DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert sample data
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@exambank.com', '$2a$10$hash', 'Admin', 'User', 'admin', true),
('550e8400-e29b-41d4-a716-446655440002', 'teacher@exambank.com', '$2a$10$hash', 'Teacher', 'User', 'teacher', true),
('550e8400-e29b-41d4-a716-446655440003', 'student@exambank.com', '$2a$10$hash', 'Student', 'User', 'student', true)
ON CONFLICT (id) DO NOTHING;

-- Insert migration record
INSERT INTO schema_migrations (version, dirty) VALUES (1, false) ON CONFLICT DO NOTHING;
SQL

echo "✅ Database setup completed!"
echo "Database: postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "Users created: admin@exambank.com, teacher@exambank.com, student@exambank.com"
