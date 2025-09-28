# Exam System API Documentation

## Overview
This document describes the gRPC API endpoints for the NyNus Exam System, including performance optimizations and usage guidelines.

## Performance Considerations
- All endpoints implement connection pooling (max 25 connections)
- Database queries are optimized to prevent N+1 problems
- Caching is implemented for frequently accessed data
- Rate limiting: 100 requests/minute per user

## Authentication
All endpoints require JWT authentication via gRPC metadata:
```
Authorization: Bearer <jwt_token>
```

## Exam Management Endpoints

### CreateExam
Creates a new exam with validation and performance optimization.

**Request:**
```protobuf
message CreateExamRequest {
  string title = 1;
  string description = 2;
  string instructions = 3;
  int32 duration_minutes = 4;
  int32 total_points = 5;
  float pass_percentage = 6;
  ExamType exam_type = 7;
  string subject = 8;
  int32 grade = 9;
  Difficulty difficulty = 10;
  repeated string tags = 11;
  bool shuffle_questions = 12;
  bool show_results = 13;
  int32 max_attempts = 14;
}
```

**Response:**
```protobuf
message CreateExamResponse {
  string exam_id = 1;
  string message = 2;
}
```

**Performance Notes:**
- Uses optimized database indexes on (created_by, exam_type, status)
- Validates input to prevent invalid data insertion
- Returns immediately after creation, background processing for complex operations

### GetExam
Retrieves exam details with optimized query.

**Request:**
```protobuf
message GetExamRequest {
  string exam_id = 1;
  bool include_questions = 2;
  bool include_statistics = 3;
}
```

**Performance Notes:**
- Single query with JOINs to avoid N+1 problems
- Conditional loading of questions and statistics
- Cached for 5 minutes for published exams

### ListExams
Lists exams with pagination and filtering.

**Request:**
```protobuf
message ListExamsRequest {
  ExamFilters filters = 1;
  Pagination pagination = 2;
}
```

**Performance Notes:**
- Uses composite indexes for filtering
- Implements cursor-based pagination for large datasets
- Maximum 100 items per page

### UpdateExam
Updates exam with optimistic locking.

**Performance Notes:**
- Uses version field for optimistic locking
- Invalidates related caches
- Batch updates for multiple fields

### DeleteExam
Soft deletes exam and related data.

**Performance Notes:**
- Soft delete to maintain referential integrity
- Background cleanup of related data
- Immediate cache invalidation

## Exam Taking Endpoints

### StartExam
Initiates an exam attempt with session management.

**Request:**
```protobuf
message StartExamRequest {
  string exam_id = 1;
  bool resume_existing = 2;
}
```

**Performance Notes:**
- Creates exam session with optimized queries
- Pre-loads all questions to avoid repeated database calls
- Implements session timeout management

### SubmitAnswer
Submits answer with auto-save functionality.

**Request:**
```protobuf
message SubmitAnswerRequest {
  string attempt_id = 1;
  string question_id = 2;
  google.protobuf.Any answer_data = 3;
  int32 time_spent_seconds = 4;
}
```

**Performance Notes:**
- Immediate response with background processing
- Auto-save every 30 seconds
- Optimistic updates with conflict resolution

### SubmitExam
Completes exam attempt and calculates results.

**Performance Notes:**
- Batch processing of all answers
- Immediate result calculation
- Background statistics update

## Question Management Endpoints

### GetExamQuestions
Retrieves all questions for an exam with optimization.

**Performance Notes:**
- Single query with JOIN to questions table
- Ordered by question order for consistent display
- Cached per exam version

### AddQuestionToExam
Adds question to exam with validation.

**Performance Notes:**
- Validates question exists and is active
- Updates exam total points automatically
- Maintains question order integrity

### RemoveQuestionFromExam
Removes question from exam with cleanup.

**Performance Notes:**
- Soft removal to maintain attempt history
- Recalculates exam total points
- Updates existing attempts if needed

## Results and Analytics Endpoints

### GetExamResults
Retrieves exam results with analytics.

**Performance Notes:**
- Aggregated queries for statistics
- Cached results for completed exams
- Pagination for large result sets

### GetExamStatistics
Provides comprehensive exam analytics.

**Performance Notes:**
- Pre-calculated statistics updated hourly
- Uses materialized views for complex aggregations
- Cached for 1 hour

## Error Handling

### Standard Error Codes
- `INVALID_ARGUMENT`: Invalid request parameters
- `NOT_FOUND`: Exam or resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `RESOURCE_EXHAUSTED`: Rate limit exceeded
- `DEADLINE_EXCEEDED`: Request timeout

### Performance Error Codes
- `RESOURCE_EXHAUSTED`: Too many concurrent exam attempts
- `UNAVAILABLE`: Database connection pool exhausted
- `DEADLINE_EXCEEDED`: Query timeout (>30 seconds)

## Rate Limiting

### Per-User Limits
- Exam creation: 10/hour
- Exam attempts: 5/hour per exam
- Answer submissions: 1000/hour
- General API calls: 1000/hour

### Global Limits
- Concurrent exam sessions: 1000
- Database connections: 25
- Memory usage: 80% of available heap

## Caching Strategy

### Cache Levels
1. **Application Cache**: In-memory caching for 5 minutes
2. **Database Cache**: Query result caching for 1 hour
3. **CDN Cache**: Static content caching for 24 hours

### Cache Keys
- Exams: `exam:{exam_id}`
- Questions: `exam:{exam_id}:questions`
- Results: `exam:{exam_id}:results`
- Statistics: `exam:{exam_id}:stats`

## Monitoring and Logging

### Performance Metrics
- Response time: <200ms for simple queries
- Throughput: 1000 requests/second
- Error rate: <1%
- Cache hit rate: >80%

### Logging Levels
- `DEBUG`: Detailed query information
- `INFO`: Request/response logging
- `WARN`: Performance degradation
- `ERROR`: System errors and failures

## Best Practices

### Client Implementation
1. Implement exponential backoff for retries
2. Use connection pooling for gRPC clients
3. Cache exam data locally during exam taking
4. Implement offline support for answer submission

### Performance Optimization
1. Batch multiple operations when possible
2. Use pagination for large datasets
3. Implement client-side caching
4. Monitor memory usage during exam taking

### Security Considerations
1. Validate all input parameters
2. Implement proper authentication
3. Use HTTPS for all communications
4. Log security-related events

## Migration and Deployment

### Database Migrations
- All migrations are backward compatible
- Performance indexes are created with `CONCURRENTLY`
- Migration rollback procedures are documented

### Deployment Checklist
- [ ] Database migrations applied
- [ ] Performance indexes created
- [ ] Cache warming completed
- [ ] Monitoring alerts configured
- [ ] Load testing completed

## Support and Troubleshooting

### Common Issues
1. **Slow query performance**: Check index usage
2. **Memory leaks**: Monitor heap usage
3. **Connection timeouts**: Check pool configuration
4. **Cache misses**: Verify cache key patterns

### Performance Tuning
1. Adjust connection pool size based on load
2. Optimize database queries using EXPLAIN
3. Monitor cache hit rates and adjust TTL
4. Scale horizontally for high load scenarios
