#!/bin/bash

# Stop Database and Backend Services

echo "🛑 Stopping Exam Bank System Services..."

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

# Stop Backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_status "Stopping Backend API (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        sleep 2
        if kill -0 $BACKEND_PID 2>/dev/null; then
            print_warning "Force killing Backend API..."
            kill -9 $BACKEND_PID
        fi
        print_success "Backend API stopped"
    else
        print_warning "Backend API not running"
    fi
    rm -f .backend.pid
else
    print_warning "Backend PID file not found"
fi

# Stop any process on port 8080
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Stopping process on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
fi

# Stop PostgreSQL container (optional)
case "${1:-keep}" in
    "all"|"db")
        print_status "Stopping PostgreSQL container..."
        docker stop exam-bank-postgres 2>/dev/null || print_warning "PostgreSQL container not running"
        print_success "PostgreSQL container stopped"
        ;;
    *)
        print_status "Keeping PostgreSQL running (use 'stop-services.sh all' to stop database too)"
        ;;
esac

# Stop Frontend if running
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_status "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        print_success "Frontend stopped"
    fi
    rm -f .frontend.pid
fi

# Stop any process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Stopping process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

print_success "Services stopped successfully!"

echo ""
echo "Usage:"
echo "  ./tools/scripts/stop-services.sh        # Stop backend only"
echo "  ./tools/scripts/stop-services.sh all    # Stop all services including database"
echo "  ./tools/scripts/stop-services.sh db     # Stop database only"
