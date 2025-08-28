# NyNus API Convention Rules
## Unified API Standards for NyNus Learning Platform

### **Core Principles**
- **Consistency**: Uniform patterns across all endpoints
- **RESTful Design**: Standard HTTP methods and status codes
- **Vietnamese Support**: Optimized for Vietnamese content and users
- **Security First**: Authentication and authorization built-in
- **Performance**: Efficient data structures and caching strategies

---

## **1. URL Structure Patterns**

### **Base URL Format**
```
https://api.nynus.com/v1/{resource}/{action}
```

### **Resource Naming**
- **Singular for single resources**: `/user/profile`, `/question/123`
- **Plural for collections**: `/users`, `/questions`, `/courses`
- **Kebab-case for multi-word**: `/question-codes`, `/user-sessions`

### **Endpoint Patterns**
```bash
# Authentication
POST   /auth/login
POST   /auth/logout  
POST   /auth/refresh
POST   /auth/google/callback

# User Management
GET    /users                    # List users (admin)
GET    /users/{id}              # Get user details
PUT    /users/{id}              # Update user
DELETE /users/{id}              # Delete user
GET    /users/me                # Current user profile
PUT    /users/me                # Update current user

# Question Management  
GET    /questions               # List questions with filters
POST   /questions               # Create question
GET    /questions/{id}          # Get question details
PUT    /questions/{id}          # Update question
DELETE /questions/{id}          # Delete question
POST   /questions/bulk-import   # Bulk import from LaTeX
GET    /questions/search        # Search questions (OpenSearch)

# Course Management
GET    /courses                 # List courses
POST   /courses                 # Create course
GET    /courses/{id}            # Get course details
PUT    /courses/{id}            # Update course
POST   /courses/{id}/enroll     # Enroll in course
DELETE /courses/{id}/enroll     # Unenroll from course
```

---

## **2. HTTP Methods & Status Codes**

### **HTTP Methods**
- **GET**: Retrieve data (idempotent)
- **POST**: Create new resources
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update
- **DELETE**: Remove resource (idempotent)

### **Standard Status Codes**
```typescript
// Success Responses
200 OK              // Successful GET, PUT, PATCH
201 Created         // Successful POST
204 No Content      // Successful DELETE

// Client Error Responses  
400 Bad Request     // Invalid request data
401 Unauthorized    // Authentication required
403 Forbidden       // Insufficient permissions
404 Not Found       // Resource not found
409 Conflict        // Resource conflict
422 Unprocessable   // Validation errors

// Server Error Responses
500 Internal Error  // Server error
503 Service Unavailable // Temporary unavailable
```

---

## **3. Request/Response Format Standards**

### **Request Headers**
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {jwt_token}",
  "Accept-Language": "vi-VN,en-US",
  "X-Request-ID": "uuid-v4"
}
```

### **Response Format**
```typescript
// Success Response
{
  "success": true,
  "data": any,
  "meta"?: {
    "pagination"?: PaginationMeta,
    "total"?: number,
    "requestId": string,
    "timestamp": string
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,           // "VALIDATION_ERROR", "NOT_FOUND"
    "message": string,        // Vietnamese user message
    "details"?: any,          // Additional error details
    "field"?: string          // Field name for validation errors
  },
  "meta": {
    "requestId": string,
    "timestamp": string
  }
}
```

### **Pagination Format**
```typescript
{
  "success": true,
  "data": any[],
  "meta": {
    "pagination": {
      "page": number,         // Current page (1-based)
      "limit": number,        // Items per page
      "total": number,        // Total items
      "totalPages": number,   // Total pages
      "hasNext": boolean,     // Has next page
      "hasPrev": boolean      // Has previous page
    }
  }
}
```

---

## **4. Authentication Patterns**

### **JWT Token Structure**
```typescript
// Access Token (15 minutes)
{
  "sub": "user_id",
  "email": "user@example.com", 
  "role": "STUDENT|TUTOR|TEACHER|ADMIN",
  "level": number,
  "permissions": string[],
  "exp": timestamp,
  "iat": timestamp
}

// Refresh Token (7 days)
{
  "sub": "user_id",
  "type": "refresh",
  "exp": timestamp,
  "iat": timestamp
}
```

### **Protected Endpoint Pattern**
```typescript
// All protected endpoints require:
Authorization: Bearer {access_token}

// Role-based access control:
GET /admin/users     // Requires ADMIN role
GET /questions       // Requires STUDENT+ role  
POST /questions      // Requires TEACHER+ role
```

---

## **5. Error Handling Patterns**

### **Error Codes**
```typescript
// Authentication Errors
"AUTH_REQUIRED"           // 401 - Authentication required
"AUTH_INVALID"            // 401 - Invalid credentials
"AUTH_EXPIRED"            // 401 - Token expired
"AUTH_FORBIDDEN"          // 403 - Insufficient permissions

// Validation Errors  
"VALIDATION_ERROR"        // 422 - Request validation failed
"REQUIRED_FIELD"          // 422 - Required field missing
"INVALID_FORMAT"          // 422 - Invalid field format

// Resource Errors
"NOT_FOUND"              // 404 - Resource not found
"ALREADY_EXISTS"         // 409 - Resource already exists
"RESOURCE_CONFLICT"      // 409 - Resource state conflict

// Business Logic Errors
"ENROLLMENT_LIMIT"       // 422 - Course enrollment limit reached
"QUESTION_PARSE_ERROR"   // 422 - LaTeX parsing failed
"IMAGE_UPLOAD_ERROR"     // 422 - Image upload failed
```

### **Vietnamese Error Messages**
```typescript
const ERROR_MESSAGES = {
  "AUTH_REQUIRED": "Vui lòng đăng nhập để tiếp tục",
  "AUTH_INVALID": "Thông tin đăng nhập không chính xác", 
  "AUTH_EXPIRED": "Phiên đăng nhập đã hết hạn",
  "NOT_FOUND": "Không tìm thấy tài nguyên yêu cầu",
  "VALIDATION_ERROR": "Dữ liệu không hợp lệ",
  "ENROLLMENT_LIMIT": "Đã đạt giới hạn đăng ký khóa học"
};
```

---

## **6. Query Parameters Standards**

### **Filtering**
```bash
# Single filter
GET /questions?type=MC&status=ACTIVE

# Multiple values  
GET /questions?grade=10,11,12&subject=P,L

# Range filters
GET /questions?createdAt[gte]=2024-01-01&createdAt[lte]=2024-12-31
```

### **Sorting**
```bash
# Single sort
GET /questions?sort=createdAt:desc

# Multiple sort
GET /questions?sort=usageCount:desc,createdAt:asc
```

### **Pagination**
```bash
GET /questions?page=1&limit=20
```

### **Search**
```bash
# Full-text search (OpenSearch)
GET /questions/search?q=toán+học+lớp+10

# Advanced search
GET /questions/search?q=đạo+hàm&grade=11&subject=P
```

---

## **7. WebSocket Patterns**

### **Connection**
```typescript
// WebSocket endpoint
wss://api.nynus.com/ws?token={jwt_token}

// Message format
{
  "type": "NOTIFICATION" | "REAL_TIME_UPDATE",
  "data": any,
  "timestamp": string
}
```

### **Real-time Events**
```typescript
// Question status updates
{
  "type": "QUESTION_STATUS_CHANGED",
  "data": {
    "questionId": string,
    "status": "ACTIVE" | "PENDING" | "INACTIVE",
    "updatedBy": string
  }
}

// User notifications
{
  "type": "USER_NOTIFICATION", 
  "data": {
    "title": string,
    "message": string,
    "type": "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  }
}
```

---

## **8. File Upload Patterns**

### **Image Upload**
```bash
POST /upload/images
Content-Type: multipart/form-data

# Response
{
  "success": true,
  "data": {
    "fileId": string,
    "url": string,
    "driveUrl": string,
    "size": number,
    "mimeType": string
  }
}
```

### **Bulk LaTeX Import**
```bash
POST /questions/bulk-import
Content-Type: multipart/form-data

# Response  
{
  "success": true,
  "data": {
    "imported": number,
    "failed": number,
    "errors": Array<{
      "line": number,
      "error": string
    }>
  }
}
```

---

## **9. Caching Strategies**

### **Cache Headers**
```typescript
// Static resources (1 year)
"Cache-Control": "public, max-age=31536000, immutable"

// Dynamic content (5 minutes)  
"Cache-Control": "public, max-age=300"

// Private user data (no cache)
"Cache-Control": "private, no-cache, no-store"
```

### **ETags for Conditional Requests**
```bash
GET /questions/123
If-None-Match: "abc123"

# 304 Not Modified if unchanged
# 200 OK with new ETag if changed
```

---

## **10. Rate Limiting**

### **Rate Limit Headers**
```typescript
{
  "X-RateLimit-Limit": "100",      // Requests per window
  "X-RateLimit-Remaining": "95",   // Remaining requests  
  "X-RateLimit-Reset": "1640995200", // Reset timestamp
  "X-RateLimit-Window": "3600"     // Window in seconds
}
```

### **Rate Limits by Endpoint**
```typescript
// Authentication endpoints
"POST /auth/login": "5 requests/15 minutes per IP",
"POST /auth/register": "3 requests/hour per IP",

// API endpoints (authenticated)
"GET /questions": "100 requests/hour per user",
"POST /questions": "20 requests/hour per user",
"GET /questions/search": "50 requests/hour per user"
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-07-30  
**Status**: Production Ready  
**Compliance**: RESTful, OpenAPI 3.0, Vietnamese Localization
