#!/bin/bash

# Development Server Script

set -e

echo "🚀 Starting Exam Bank System Development..."

SERVICE=${1:-"all"}

start_backend() {
    echo "📦 Starting backend server..."
    cd apps/backend
    if [ ! -f ".env" ]; then
        cp .env.example .env
    fi
    go run cmd/main.go &
    echo $! > ../../.backend.pid
    cd ../..
    echo "✅ Backend started on :50051 (gRPC) and :8080 (HTTP)"
}

start_frontend() {
    echo "🌐 Starting frontend server..."
    cd apps/frontend
    if [ ! -f ".env" ]; then
        cp .env.example .env
    fi
    npm run dev &
    echo $! > ../../.frontend.pid
    cd ../..
    echo "✅ Frontend started on :3000"
}

start_database() {
    echo "🗄️ Starting database..."
    if command -v docker-compose &> /dev/null; then
        cd tools/docker
        docker-compose up -d postgres
        cd ../..
        echo "✅ Database started on :5432"
    else
        echo "⚠️  Docker Compose not found. Please start PostgreSQL manually."
    fi
}

case "$SERVICE" in
    "all")
        start_database
        sleep 2
        start_backend
        sleep 2
        start_frontend
        echo ""
        echo "🎉 All services started!"
        echo "Frontend: http://localhost:3000"
        echo "Backend: http://localhost:8080"
        echo "gRPC: localhost:50051"
        ;;
    "backend")
        start_backend
        ;;
    "frontend")
        start_frontend
        ;;
    "database")
        start_database
        ;;
    *)
        echo "Usage: $0 [all|backend|frontend|database]"
        ;;
esac
