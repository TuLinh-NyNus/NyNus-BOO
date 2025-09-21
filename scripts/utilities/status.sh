#!/bin/bash

# Show System Status

echo "📊 Exam Bank System - Status Report"
echo "================================================================"
echo ""

# Check Database
echo "🗄️ Database Status:"
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "exam-bank-postgres"; then
    echo "  ✅ PostgreSQL Container: Running"
    echo "  📍 URL: postgresql://postgres@localhost:5439/exam_bank_db"
    
    # Test connection
    if PGPASSWORD=postgres psql -h localhost -p 5439 -U postgres -d exam_bank_db -c "SELECT 1;" > /dev/null 2>&1; then
        echo "  ✅ Connection: OK"
        
        # Get user count
        USER_COUNT=$(PGPASSWORD=postgres psql -h localhost -p 5439 -U postgres -d exam_bank_db -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
        echo "  👥 Users: $USER_COUNT"
    else
        echo "  ❌ Connection: Failed"
    fi
else
    echo "  ❌ PostgreSQL Container: Not running"
fi

echo ""

# Check Backend
echo "🔧 Backend API Status:"
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Server: Running on port 8080"
    echo "  📍 URL: http://localhost:8080"
    
    # Test API
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "  ✅ Health Check: OK"
        
        # Get API stats
        STATS=$(curl -s http://localhost:8080/api/v1/stats 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "  📊 API Stats: $(echo $STATS | jq -r '.data | to_entries | map("\(.key): \(.value)") | join(", ")')"
        fi
    else
        echo "  ❌ Health Check: Failed"
    fi
else
    echo "  ❌ Server: Not running"
fi

echo ""

# Check Frontend
echo "🌐 Frontend Status:"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Frontend: Running on port 3000"
    echo "  📍 URL: http://localhost:3000"
else
    echo "  ❌ Frontend: Not running"
fi

echo ""

# Show logs if available
echo "📝 Recent Logs:"
if [ -f "logs/backend.log" ]; then
    echo "  Backend (last 3 lines):"
    tail -3 logs/backend.log | sed 's/^/    /'
else
    echo "  No backend logs found"
fi

echo ""
echo "================================================================"
echo "🛠️  Management Commands:"
echo "  ./tools/scripts/start-all.sh     - Start all services"
echo "  ./tools/scripts/stop-services.sh - Stop services"
echo "  ./tools/scripts/status.sh        - Show this status"
echo ""
echo "🧪 Quick Tests:"
echo "  curl http://localhost:8080/health"
echo "  curl http://localhost:8080/api/v1/users"
echo ""
