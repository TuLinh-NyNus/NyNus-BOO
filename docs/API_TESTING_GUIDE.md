# API Testing Guide

## Overview
This guide provides comprehensive instructions for testing the Exam Bank System APIs, including authentication, question filtering, search, and import functionality.

## Prerequisites

### 1. Start the Backend Server
```bash
# Build and start the backend
cd apps/backend
make build
./bin/grpc-server
```

The server will start on:
- **gRPC Server**: `localhost:50051`
- **HTTP REST API**: `localhost:8080`

### 2. Health Check
```bash
curl -s "http://localhost:8080/health" | jq '.'
```

Expected response:
```json
{
  "status": "healthy",
  "service": "exam-bank-backend"
}
```

## Authentication

### 1. Default Users
The system comes with pre-configured users:

| Email | Password | Role |
|-------|----------|------|
| admin@exambank.com | admin123 | admin |
| teacher@exambank.com | teacher123 | teacher |
| student@exambank.com | student123 | student |

### 2. Login and Get Token
```bash
# Login as admin
curl -s -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@exambank.com",
    "password": "admin123"
  }' | jq -r '.accessToken'
```

Save the token for subsequent requests:
```bash
TOKEN="your_jwt_token_here"
```

## QuestionFilterService APIs

### 1. ListQuestionsByFilter API

**Endpoint**: `POST /api/v1/questions/filter`

#### Basic Filter (All Questions)
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pagination": {
      "page": 1,
      "limit": 10
    }
  }' | jq '.'
```

#### Filter by Grade
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_code_filter": {
      "grades": ["0"]
    },
    "pagination": {
      "page": 1,
      "limit": 5
    }
  }' | jq '.'
```

#### Filter by Subject
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_code_filter": {
      "subjects": ["D"]
    },
    "pagination": {
      "page": 1,
      "limit": 5
    }
  }' | jq '.'
```

#### Complex Filter
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_code_filter": {
      "grades": ["0"],
      "subjects": ["D"]
    },
    "metadata_filter": {
      "types": ["MC"]
    },
    "pagination": {
      "page": 1,
      "limit": 5
    }
  }' | jq '.'
```

### 2. SearchQuestions API

**Endpoint**: `POST /api/v1/questions/search`

#### Basic Search
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "xác suất",
    "pagination": {
      "page": 1,
      "limit": 3
    }
  }' | jq '.'
```

#### Search with Filters
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "phương trình",
    "question_code_filter": {
      "grades": ["0"]
    },
    "pagination": {
      "page": 1,
      "limit": 3
    }
  }' | jq '.'
```

### 3. GetQuestionsByQuestionCode API

**Endpoint**: `POST /api/v1/questions/by-code`

#### Filter by Grade
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/by-code" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_code_filter": {
      "grades": ["0"]
    },
    "pagination": {
      "page": 1,
      "limit": 5
    }
  }' | jq '.'
```

#### Filter by Subject
```bash
curl -s -X POST "http://localhost:8080/api/v1/questions/by-code" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_code_filter": {
      "subjects": ["P"]
    },
    "pagination": {
      "page": 1,
      "limit": 5
    }
  }' | jq '.'
```

## Question Import API

### CSV Import
**Endpoint**: `POST /api/v1/questions/import`

```bash
# Encode CSV file to base64
CSV_BASE64=$(base64 -w 0 docs/question_new_fixed.csv)

# Import questions
curl -X POST "http://localhost:8080/api/v1/questions/import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"csv_data_base64\": \"$CSV_BASE64\",
    \"upsert_mode\": false
  }" | jq '.'
```

## Filter Criteria Reference

### QuestionCode Filter
- **grades**: Array of strings ["0", "1", "2"] (Grade 10, 11, 12)
- **subjects**: Array of strings ["D", "E", "H", "M", "P", "S"]
  - D: Probability
  - E: English  
  - H: Chemistry
  - M: Math
  - P: Physics
  - S: Science
- **chapters**: Array of strings ["1", "2", "3", ...]
- **levels**: Array of strings ["N", "H", "V", "C", "T", "M"]
- **lessons**: Array of strings ["1", "2", "3", ...]
- **forms**: Array of strings ["1", "2", "3", ...]

### Metadata Filter
- **types**: Array of strings ["MC", "SA", "TF", "ES"]
  - MC: Multiple Choice
  - SA: Short Answer
  - TF: True/False
  - ES: Essay
- **difficulties**: Array of strings ["EASY", "MEDIUM", "HARD"]
- **sources**: Array of strings
- **creators**: Array of strings

### Date Range Filter
- **created_after**: ISO timestamp
- **created_before**: ISO timestamp
- **updated_after**: ISO timestamp
- **updated_before**: ISO timestamp

## Response Format

### Successful Response
```json
{
  "questions": [...],
  "total_count": 2878,
  "current_page": 1,
  "total_pages": 288,
  "filter_summary": {
    "total_questions": 2878,
    "grade_distribution": {...},
    "subject_distribution": {...},
    "type_distribution": {...}
  }
}
```

### Error Response
```json
{
  "error": "error message",
  "code": "ERROR_CODE",
  "details": "detailed error information"
}
```

## Performance Benchmarks

Based on dataset of 2,878 questions:

| API | Average Response Time | Notes |
|-----|----------------------|-------|
| Filter API | 3-12ms | Excellent performance |
| Search API | 50-75ms | Good for full-text search |
| Question Code API | 2-10ms | Very fast filtering |

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Token expired or invalid
   - Solution: Login again to get new token

2. **400 Bad Request**: Invalid request format
   - Solution: Check request structure matches proto definition

3. **500 Internal Server Error**: Server error
   - Solution: Check server logs and database connection

### Debug Commands
```bash
# Check server status
curl -s "http://localhost:8080/health"

# Check database connection
docker exec local-examinationbank-postgres psql -U exam_bank_user -d exam_bank_db -c "SELECT COUNT(*) FROM question;"

# View server logs
# Check terminal where grpc-server is running
```
