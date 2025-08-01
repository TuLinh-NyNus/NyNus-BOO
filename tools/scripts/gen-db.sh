#!/bin/bash

# Database Management Script

set -e

# Load environment variables
if [ -f "apps/backend/.env" ]; then
    export $(cat apps/backend/.env | grep -v '^#' | xargs)
fi

# Default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-exam_bank_user}
DB_PASSWORD=${DB_PASSWORD:-exam_bank_password}
DB_NAME=${DB_NAME:-exam_bank_db}
DB_SSLMODE=${DB_SSLMODE:-disable}

MIGRATION_DIR="packages/database/migrations"
DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"

case "${1:-help}" in
    "migrate")
        echo "🗄️ Running database migrations..."
        migrate -path $MIGRATION_DIR -database "$DATABASE_URL" up
        echo "✅ Migrations completed"
        ;;
    "create")
        if [ -z "$2" ]; then
            echo "❌ Migration name required"
            echo "Usage: $0 create <migration_name>"
            exit 1
        fi
        echo "📝 Creating migration: $2"
        mkdir -p $MIGRATION_DIR
        migrate create -ext sql -dir $MIGRATION_DIR -seq $2
        echo "✅ Migration created"
        ;;
    "rollback")
        echo "⏪ Rolling back migration..."
        migrate -path $MIGRATION_DIR -database "$DATABASE_URL" down 1
        echo "✅ Rollback completed"
        ;;
    "status")
        echo "📊 Migration status:"
        migrate -path $MIGRATION_DIR -database "$DATABASE_URL" version
        ;;
    *)
        echo "Database Management Commands:"
        echo "  migrate   - Run all pending migrations"
        echo "  create    - Create a new migration"
        echo "  rollback  - Rollback last migration"
        echo "  status    - Show migration status"
        ;;
esac
