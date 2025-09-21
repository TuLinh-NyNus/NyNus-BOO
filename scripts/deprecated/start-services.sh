#!/bin/bash

# Start Database and Backend Services

set -e

echo "🚀 Starting Exam Bank System Services..."

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

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    
    print_status "Waiting for $service_name to be ready..."
    
    for i in $(seq 1 $max_attempts); do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        sleep 2
    done
    
    print_error "$service_name failed to start within timeout"
    return 1
}

# Load environment variables
if [ -f "apps/backend/.env" ]; then
    export $(cat apps/backend/.env | grep -v '^#' | xargs)
fi

# Default configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-exam_bank_user}
DB_PASSWORD=${DB_PASSWORD:-exam_bank_password}
DB_NAME=${DB_NAME:-exam_bank_db}
BACKEND_PORT=${HTTP_PORT:-8080}

echo "================================================================"
echo "🏗️  Exam Bank System Service Startup"
echo "================================================================"
echo ""

# Step 1: Setup Database
print_status "Step 1: Setting up PostgreSQL Database..."

if check_port $DB_PORT; then
    print_success "PostgreSQL is already running on port $DB_PORT"
else
    print_status "Starting PostgreSQL with Docker..."
    
    # Check if container exists
    if docker ps -a --format "table {{.Names}}" | grep -q "exam-bank-postgres"; then
        print_status "Starting existing container..."
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
    
    # Wait for PostgreSQL
    wait_for_service $DB_HOST $DB_PORT "PostgreSQL"
fi

# Step 2: Run Database Migrations
print_status "Step 2: Running Database Migrations..."
chmod +x tools/scripts/setup-db.sh
./tools/scripts/setup-db.sh setup

# Step 3: Install Backend Dependencies
print_status "Step 3: Installing Backend Dependencies..."
cd apps/backend

# Add required Go modules
if [ ! -f "go.mod" ]; then
    go mod init exam-bank-system/backend
fi

# Install dependencies
go get github.com/lib/pq
go get github.com/google/uuid
go get github.com/gorilla/mux
go get github.com/joho/godotenv

print_success "Backend dependencies installed"
cd ../..

# Step 4: Build Backend
print_status "Step 4: Building Backend..."
cd apps/backend
go build -o bin/server cmd/main.go
print_success "Backend built successfully"
cd ../..

# Step 5: Start Backend
print_status "Step 5: Starting Backend API Server..."

if check_port $BACKEND_PORT; then
    print_warning "Port $BACKEND_PORT is already in use. Stopping existing service..."
    # Kill process using the port
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend in background
cd apps/backend
nohup ./bin/server > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../../.backend.pid
cd ../..

# Wait for backend to start
wait_for_service localhost $BACKEND_PORT "Backend API"

# Step 6: Test Services
print_status "Step 6: Testing Services..."

# Test database connection
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection: OK"
else
    print_error "Database connection: FAILED"
fi

# Test backend API
if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    print_success "Backend API: OK"
else
    print_error "Backend API: FAILED"
fi

echo ""
echo "================================================================"
echo "✅ Exam Bank System Services Started Successfully!"
echo "================================================================"
echo ""
echo "🌐 Service URLs:"
echo "  📊 Database:  postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "  🔧 Backend:   http://localhost:$BACKEND_PORT"
echo "  📋 API Docs:  http://localhost:$BACKEND_PORT/api/info"
echo ""
echo "📝 Logs:"
echo "  Backend: tail -f logs/backend.log"
echo ""
echo "🛑 Stop Services:"
echo "  ./tools/scripts/stop-services.sh"
echo ""
echo "🧪 Test APIs:"
echo "  ./tools/scripts/test-apis.sh"
echo ""
