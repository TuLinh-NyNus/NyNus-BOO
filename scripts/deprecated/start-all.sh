#!/bin/bash

# Start All Services - Database and Backend

set -e

echo "🚀 Starting Exam Bank System - All Services..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

echo "================================================================"
echo "🏗️  Exam Bank System - Complete Setup"
echo "================================================================"
echo ""

# Step 1: Setup Database
print_status "Step 1: Setting up PostgreSQL Database..."
./tools/scripts/setup-simple-db.sh

# Step 2: Start Backend
print_status "Step 2: Starting Backend API Server..."

# Stop any existing backend
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Stopping existing backend on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend
cd apps/backend
nohup go run cmd/main.go > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../../.backend.pid
cd ../..

# Wait for backend to start
print_status "Waiting for backend to start..."
for i in {1..15}; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        print_success "Backend API is ready!"
        break
    fi
    sleep 2
done

# Step 3: Test Services
print_status "Step 3: Testing Services..."

# Test database
if PGPASSWORD=postgres psql -h localhost -p 5439 -U postgres -d exam_bank_db -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database: OK"
else
    print_warning "Database: Connection failed"
fi

# Test backend
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    print_success "Backend API: OK"
    
    # Get user count
    USER_COUNT=$(curl -s http://localhost:8080/api/v1/users | jq -r '.count // 0')
    echo "  Users in database: $USER_COUNT"
else
    print_warning "Backend API: Failed"
fi

echo ""
echo "================================================================"
echo "✅ Exam Bank System Started Successfully!"
echo "================================================================"
echo ""
echo "🌐 Service URLs:"
echo "  📊 Database:  postgresql://postgres@localhost:5439/exam_bank_db"
echo "  🔧 Backend:   http://localhost:8080"
echo "  📋 API Info:  http://localhost:8080/api/info"
echo "  👥 Users:     http://localhost:8080/api/v1/users"
echo ""
echo "📝 Logs:"
echo "  Backend: tail -f logs/backend.log"
echo ""
echo "🛑 Stop Services:"
echo "  ./tools/scripts/stop-services.sh"
echo ""
echo "🧪 Test APIs:"
echo "  curl http://localhost:8080/health"
echo "  curl http://localhost:8080/api/v1/users"
echo ""
echo "📊 Database Stats:"
curl -s http://localhost:8080/api/v1/stats | jq '.'
echo ""
