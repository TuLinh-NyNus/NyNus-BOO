# Nested Objects Solution Plan - Detailed Implementation

## 📋 Overview
**Problem**: AdminUser.stats và AdminUser.profile bị undefined khi chuyển từ mock sang real data  
**Root Cause**: Protobuf User message chỉ có 12 basic fields, thiếu nested objects  
**Solution**: Extend User protobuf với nested UserStats và UserProfile messages

## 🎯 Solution Design: Option 1 - Extend User Protobuf

### Why Option 1?
- ✅ **Minimal Changes**: Chỉ cần extend existing User message
- ✅ **Performance**: 1 query với JOIN, không có N+1 problem
- ✅ **Backward Compatible**: Optional fields không break old clients
- ✅ **Consistent**: Tất cả user data trong 1 response
- ✅ **Type Safe**: Protobuf validation tự động

### Alternative Options Rejected
- ❌ **Option 2 (Separate AdminUser protobuf)**: Duplicate code, maintenance overhead
- ❌ **Option 3 (Multiple gRPC calls)**: N+1 queries, poor performance
- ❌ **Option 4 (Frontend computes)**: Extra API calls, complexity
- ❌ **Option 5 (Separate endpoint)**: Inconsistent API design

---

## 📐 Protobuf Design

### 1. UserStats Message
```protobuf
// User statistics for admin dashboard
message UserStats {
  int32 total_exam_results = 1;    // COUNT from exam_attempts
  int32 total_courses = 2;         // COUNT from course_enrollments
  int32 total_lessons = 3;         // Computed from course progress
  float average_score = 4;         // AVG(percentage) from exam_attempts
  int32 completed_courses = 5;     // COUNT where status = 'completed'
  int32 active_sessions_count = 6; // COUNT from user_sessions WHERE is_active = true
}
```

**Data Sources:**
- `total_exam_results`: `SELECT COUNT(*) FROM exam_attempts WHERE user_id = ? AND status = 'submitted'`
- `total_courses`: `SELECT COUNT(*) FROM course_enrollments WHERE user_id = ?`
- `average_score`: `SELECT AVG(percentage) FROM exam_attempts WHERE user_id = ? AND status = 'submitted'`
- `active_sessions_count`: `SELECT COUNT(*) FROM user_sessions WHERE user_id = ? AND is_active = true`

### 2. UserProfileData Message
```protobuf
// User profile data for admin view
message UserProfileData {
  string bio = 1;                  // From users.bio
  string phone_number = 2;         // From users.phone
  string address = 3;              // From users.address
  string school = 4;               // From users.school
  float completion_rate = 5;       // Computed from course progress
  UserPreferences preferences = 6; // From user_preferences table
}
```

**Data Sources:**
- `bio, phone_number, address, school`: Directly from `users` table
- `completion_rate`: `SELECT AVG(progress) FROM course_enrollments WHERE user_id = ?`
- `preferences`: Join with `user_preferences` table

### 3. Extended User Message
```protobuf
message User {
  // ===== EXISTING FIELDS (1-12) =====
  string id = 1;
  string email = 2;
  string first_name = 3;
  string last_name = 4;
  common.UserRole role = 5;
  bool is_active = 6;
  int32 level = 7;
  string username = 8;
  string avatar = 9;
  common.UserStatus status = 10;
  bool email_verified = 11;
  string google_id = 12;
  
  // ===== NEW NESTED OBJECTS (13-14) =====
  UserStats stats = 13;            // Optional - only populated for admin endpoints
  UserProfileData profile = 14;    // Optional - only populated when requested
}
```

**Backward Compatibility:**
- Fields 13-14 are **optional** (protobuf3 default)
- Old clients ignore unknown fields
- New clients check for null before accessing

---

## 🔧 Backend Implementation

### 1. Helper Functions in admin_service.go

#### getUserStats()
```go
// getUserStats computes user statistics from database
func (s *AdminServiceServer) getUserStats(ctx context.Context, userID string) (*v1.UserStats, error) {
    stats := &v1.UserStats{}
    
    // Query 1: Exam attempts stats
    query1 := `
        SELECT 
            COUNT(*) as total_attempts,
            COALESCE(AVG(percentage), 0) as avg_score
        FROM exam_attempts
        WHERE user_id = $1 AND status = 'submitted'
    `
    err := s.db.QueryRowContext(ctx, query1, userID).Scan(
        &stats.TotalExamResults,
        &stats.AverageScore,
    )
    if err != nil && err != sql.ErrNoRows {
        return nil, err
    }
    
    // Query 2: Course enrollments stats
    query2 := `
        SELECT 
            COUNT(*) as total_courses,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_courses
        FROM course_enrollments
        WHERE user_id = $1
    `
    err = s.db.QueryRowContext(ctx, query2, userID).Scan(
        &stats.TotalCourses,
        &stats.CompletedCourses,
    )
    if err != nil && err != sql.ErrNoRows {
        return nil, err
    }
    
    // Query 3: Active sessions count
    query3 := `
        SELECT COUNT(*)
        FROM user_sessions
        WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
    `
    err = s.db.QueryRowContext(ctx, query3, userID).Scan(&stats.ActiveSessionsCount)
    if err != nil && err != sql.ErrNoRows {
        return nil, err
    }
    
    return stats, nil
}
```

#### getUserProfileData()
```go
// getUserProfileData gets user profile data from database
func (s *AdminServiceServer) getUserProfileData(ctx context.Context, userID string) (*v1.UserProfileData, error) {
    profile := &v1.UserProfileData{}
    
    // Query: Get profile fields from users table
    query := `
        SELECT 
            COALESCE(bio, '') as bio,
            COALESCE(phone, '') as phone,
            COALESCE(address, '') as address,
            COALESCE(school, '') as school,
            COALESCE(AVG(ce.progress), 0) as completion_rate
        FROM users u
        LEFT JOIN course_enrollments ce ON u.id = ce.user_id
        WHERE u.id = $1
        GROUP BY u.id, u.bio, u.phone, u.address, u.school
    `
    
    err := s.db.QueryRowContext(ctx, query, userID).Scan(
        &profile.Bio,
        &profile.PhoneNumber,
        &profile.Address,
        &profile.School,
        &profile.CompletionRate,
    )
    if err != nil {
        return nil, err
    }
    
    // TODO: Get preferences from user_preferences table
    // profile.Preferences = ...
    
    return profile, nil
}
```

### 2. Batch Optimization (Avoid N+1)

**Problem**: Calling getUserStats() for each user = N+1 queries  
**Solution**: Batch query with GROUP BY

```go
// getUserStatsBatch gets stats for multiple users in one query
func (s *AdminServiceServer) getUserStatsBatch(ctx context.Context, userIDs []string) (map[string]*v1.UserStats, error) {
    if len(userIDs) == 0 {
        return make(map[string]*v1.UserStats), nil
    }
    
    statsMap := make(map[string]*v1.UserStats)
    
    // Initialize all users with zero stats
    for _, userID := range userIDs {
        statsMap[userID] = &v1.UserStats{}
    }
    
    // Batch query for exam stats
    query1 := `
        SELECT 
            user_id,
            COUNT(*) as total_attempts,
            COALESCE(AVG(percentage), 0) as avg_score
        FROM exam_attempts
        WHERE user_id = ANY($1) AND status = 'submitted'
        GROUP BY user_id
    `
    rows, err := s.db.QueryContext(ctx, query1, pq.Array(userIDs))
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    for rows.Next() {
        var userID string
        var totalAttempts int32
        var avgScore float32
        
        if err := rows.Scan(&userID, &totalAttempts, &avgScore); err != nil {
            return nil, err
        }
        
        statsMap[userID].TotalExamResults = totalAttempts
        statsMap[userID].AverageScore = avgScore
    }
    
    // Similar batch queries for courses and sessions...
    
    return statsMap, nil
}
```

### 3. Update ListUsers() Method

```go
func (s *AdminServiceServer) ListUsers(ctx context.Context, req *v1.AdminListUsersRequest) (*v1.AdminListUsersResponse, error) {
    // ... existing code to get users ...
    
    // Get user IDs for batch stats query
    userIDs := make([]string, len(users))
    for i, user := range users {
        userIDs[i] = user.ID
    }
    
    // Batch get stats and profiles
    statsMap, err := s.getUserStatsBatch(ctx, userIDs)
    if err != nil {
        // Log error but don't fail the request
        log.Printf("Failed to get user stats: %v", err)
        statsMap = make(map[string]*v1.UserStats)
    }
    
    profilesMap, err := s.getUserProfilesBatch(ctx, userIDs)
    if err != nil {
        log.Printf("Failed to get user profiles: %v", err)
        profilesMap = make(map[string]*v1.UserProfileData)
    }
    
    // Convert to proto users with stats and profiles
    protoUsers := make([]*v1.User, 0, len(users))
    for _, user := range users {
        protoUser := &v1.User{
            Id:            user.ID,
            Email:         user.Email,
            // ... other basic fields ...
            Stats:         statsMap[user.ID],   // Add stats
            Profile:       profilesMap[user.ID], // Add profile
        }
        protoUsers = append(protoUsers, protoUser)
    }
    
    return &v1.AdminListUsersResponse{
        Response: &common.Response{Success: true, Message: "Users retrieved successfully"},
        Users:    protoUsers,
        Pagination: paginationResponse,
    }, nil
}
```

---

## 🎨 Frontend Implementation

### Update mapUserFromPb() in admin.service.ts

```typescript
function mapUserFromPb(user: User): AdminUser {
  // ... existing basic field mapping ...
  
  return {
    // ===== BASIC FIELDS =====
    id: user.getId(),
    email: user.getEmail(),
    // ... other fields ...
    
    // ===== NESTED OBJECTS - NOW FROM PROTOBUF =====
    stats: user.getStats() ? {
      totalExamResults: user.getStats()!.getTotalExamResults(),
      totalCourses: user.getStats()!.getTotalCourses(),
      totalLessons: user.getStats()!.getTotalLessons(),
      averageScore: user.getStats()!.getAverageScore(),
    } : undefined,
    
    profile: user.getProfile() ? {
      bio: user.getProfile()!.getBio(),
      phoneNumber: user.getProfile()!.getPhoneNumber(),
      completionRate: user.getProfile()!.getCompletionRate(),
      preferences: user.getProfile()!.getPreferences() ? {
        language: user.getProfile()!.getPreferences()!.getLanguage(),
        timezone: user.getProfile()!.getPreferences()!.getTimezone(),
        // ... other preferences ...
      } : undefined,
    } : undefined,
  };
}
```

---

## ✅ Implementation Checklist

### Phase 1: Protobuf Definitions
- [ ] Add UserStats message to user.proto
- [ ] Add UserProfileData message to user.proto (or profile.proto)
- [ ] Add optional stats and profile fields to User message
- [ ] Run `buf generate` to regenerate code
- [ ] Verify generated Go code in apps/backend/pkg/proto/v1/
- [ ] Verify generated TypeScript code in apps/frontend/src/generated/

### Phase 2: Backend Implementation
- [ ] Create getUserStats() helper function
- [ ] Create getUserProfileData() helper function
- [ ] Create getUserStatsBatch() for optimization
- [ ] Create getUserProfilesBatch() for optimization
- [ ] Update ListUsers() to populate stats and profiles
- [ ] Add error handling and logging
- [ ] Test with database queries

### Phase 3: Frontend Integration
- [ ] Update mapUserFromPb() to map stats
- [ ] Update mapUserFromPb() to map profile
- [ ] Remove default undefined values
- [ ] Test type safety with TypeScript

### Phase 4: Testing
- [ ] Test user-detail-modal.tsx displays stats correctly
- [ ] Test admin/users/[id]/page.tsx displays stats correctly
- [ ] Test with different user roles (admin, teacher, student)
- [ ] Verify no 0/N/A values
- [ ] Performance test (ListUsers with 100 users < 500ms)

### Phase 5: Review & Documentation
- [ ] Verify stats calculations accuracy
- [ ] Check backward compatibility
- [ ] Update API documentation
- [ ] Update CHANGELOG.md

---

## 🚀 Performance Targets

- **ListUsers (20 users)**: < 200ms
- **ListUsers (100 users)**: < 500ms
- **Stats calculation per user**: < 50ms (batch mode)
- **Database queries**: Max 3 queries total (users + stats batch + profiles batch)

---

## 🔒 Backward Compatibility

- ✅ Old clients ignore fields 13-14 (protobuf3 behavior)
- ✅ New clients check `user.getStats()` for null before accessing
- ✅ No breaking changes to existing User fields (1-12)
- ✅ Optional fields don't affect serialization size for old clients

---

## 📝 Notes

- Stats are computed real-time (no caching initially)
- Future optimization: Materialized views for stats
- Profile data comes from users table (already exists)
- Preferences integration is TODO (user_preferences table)

