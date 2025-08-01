#!/bin/bash

# API Testing Script for Exam Bank System

echo "🧪 Testing Exam Bank System APIs..."

BASE_URL="http://localhost:8080"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

test_api() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${BLUE}[TEST]${NC} $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}[PASS]${NC} HTTP $http_code"
        echo "Response: $(echo "$body" | jq -r '.success // "N/A"') - $(echo "$body" | jq -r '.data | length // 0') items"
    else
        echo -e "${RED}[FAIL]${NC} HTTP $http_code"
        echo "Error: $body"
    fi
    echo ""
}

echo "================================================================"
echo "🏥 Exam Bank System API Tests"
echo "================================================================"
echo ""

# Health check
test_api "GET" "/health" "Health Check"

# API info
test_api "GET" "/api/info" "API Information"

# User APIs
test_api "GET" "/api/v1/users" "Get All Users"

test_api "POST" "/api/v1/users" "Create New User" '{
    "email": "newuser@exambank.com",
    "first_name": "New",
    "last_name": "User",
    "role": "student",
    "is_active": true
}'

# Question APIs
test_api "GET" "/api/v1/questions" "Get All Questions"

test_api "POST" "/api/v1/questions" "Create New Question" '{
    "text": "What is the speed of light?",
    "type": "multiple_choice",
    "difficulty": "hard",
    "explanation": "Speed of light in vacuum",
    "tags": ["physics", "light"]
}'

# Exam APIs
test_api "GET" "/api/v1/exams" "Get All Exams"

test_api "POST" "/api/v1/exams" "Create New Exam" '{
    "title": "Physics Test",
    "description": "Basic physics concepts",
    "duration_minutes": 60,
    "created_by": "1"
}'

# Start exam
test_api "POST" "/api/v1/exams/start" "Start Exam" '{
    "exam_id": "1",
    "user_id": "2"
}'

# Get attempts
test_api "GET" "/api/v1/attempts?user_id=2" "Get User Attempts"

echo "================================================================"
echo "✅ API Testing Complete!"
echo "================================================================"
