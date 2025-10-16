# Users Mock Data vs Database Schema Analysis

## Executive Summary
**Status**: ✅ Database schema FULLY COMPATIBLE với mockUsers structure  
**Migration Needed**: ❌ NO - All fields đã có trong database  
**Seeding Strategy**: Seed realistic data directly vào existing schema

---

## Database Schema (users table)

### Core Fields (REQUIRED)
```sql
id TEXT PRIMARY KEY                    -- ✅ Matches mockUsers.id
email TEXT UNIQUE NOT NULL             -- ✅ Matches mockUsers.email
password_hash TEXT NOT NULL            -- ✅ Matches mockUsers.password_hash
first_name TEXT NOT NULL               -- ✅ Matches mockUsers.firstName
last_name TEXT NOT NULL                -- ✅ Matches mockUsers.lastName
role TEXT NOT NULL DEFAULT 'STUDENT'   -- ✅ Matches mockUsers.role
status TEXT NOT NULL DEFAULT 'ACTIVE'  -- ✅ Matches mockUsers.status
created_at TIMESTAMPTZ NOT NULL        -- ✅ Matches mockUsers.createdAt
updated_at TIMESTAMPTZ NOT NULL        -- ✅ Matches mockUsers.updatedAt
```

### Authentication Fields
```sql
google_id TEXT UNIQUE                  -- ✅ Matches mockUsers.googleId
username TEXT UNIQUE                   -- ✅ Matches mockUsers.username
avatar TEXT                            -- ✅ Matches mockUsers.avatar
```

### Business Logic Fields
```sql
level INTEGER                          -- ✅ Matches mockUsers.level (1-9 for STUDENT/TUTOR/TEACHER)
max_concurrent_sessions INTEGER DEFAULT 3  -- ✅ Matches mockUsers.maxConcurrentSessions
```

### Security Tracking Fields
```sql
email_verified BOOLEAN DEFAULT FALSE   -- ✅ Matches mockUsers.emailVerified
last_login_at TIMESTAMPTZ              -- ✅ Matches mockUsers.lastLoginAt
last_login_ip TEXT                     -- ✅ Matches mockUsers.lastLoginIp
login_attempts INTEGER DEFAULT 0       -- ✅ Matches mockUsers.loginAttempts
locked_until TIMESTAMPTZ               -- ✅ Matches mockUsers.lockedUntil
```

### Profile Information Fields
```sql
bio TEXT                               -- ✅ Matches mockUsers.bio
phone TEXT                             -- ✅ Matches mockUsers.phone
address TEXT                           -- ✅ Matches mockUsers.address
school TEXT                            -- ✅ Matches mockUsers.school
date_of_birth DATE                     -- ✅ Matches mockUsers.dateOfBirth
gender TEXT                            -- ✅ Matches mockUsers.gender
```

### Legacy Fields
```sql
is_active BOOLEAN DEFAULT true         -- ✅ Matches mockUsers.isActive (legacy)
resource_path TEXT                     -- ⚠️ Not in mockUsers (legacy field)
```

---

## Mock Data Structure (AdminUser interface)

### Fields in mockUsers but NOT in database
❌ **NONE** - All mockUsers fields có corresponding database columns

### Nested Objects in mockUsers (NOT stored in users table)
These are computed/aggregated from other tables:

#### 1. `profile` object
```typescript
profile: {
  bio: string                    // ✅ Stored in users.bio
  phoneNumber: string            // ✅ Stored in users.phone
  completionRate: number         // ❌ COMPUTED - from course_enrollments
  preferences: {                 // ❌ SEPARATE TABLE - user_preferences
    language: string
    timezone: string
    profileVisibility: string
    notifications: {...}
  }
}
```

#### 2. `stats` object
```typescript
stats: {
  totalExamResults: number       // ❌ COMPUTED - COUNT from exam_attempts
  totalCourses: number           // ❌ COMPUTED - COUNT from course_enrollments
  totalLessons: number           // ❌ COMPUTED - COUNT from lesson_progress (if exists)
  averageScore: number           // ❌ COMPUTED - AVG from exam_results
}
```

#### 3. Admin-specific fields (NOT in database)
```typescript
adminNotes: string               // ❌ NOT STORED - UI-only field
maxConcurrentIPs: number         // ❌ LEGACY - replaced by maxConcurrentSessions
activeSessionsCount: number      // ❌ COMPUTED - COUNT from user_sessions WHERE is_active=true
totalResourceAccess: number      // ❌ COMPUTED - COUNT from resource_access
riskScore: number                // ❌ COMPUTED - from security algorithm
```

---

## Seeding Strategy

### 1. Direct Database Fields (Seed vào users table)
```go
// Seed directly vào users table
type UserSeedData struct {
    // Core fields
    ID           string
    Email        string
    PasswordHash string  // bcrypt hash
    FirstName    string
    LastName     string
    Role         string  // ADMIN, TEACHER, TUTOR, STUDENT
    Status       string  // ACTIVE, INACTIVE, SUSPENDED
    
    // Auth fields
    GoogleID     *string
    Username     *string
    Avatar       *string
    
    // Business logic
    Level                 *int  // 1-9 for STUDENT/TUTOR/TEACHER, NULL for ADMIN
    MaxConcurrentSessions int   // Default 3
    
    // Security
    EmailVerified bool
    LastLoginAt   *time.Time
    LastLoginIP   *string
    LoginAttempts int
    LockedUntil   *time.Time
    
    // Profile
    Bio         *string
    Phone       *string
    Address     *string
    School      *string
    DateOfBirth *time.Time
    Gender      *string
    
    // Timestamps
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

### 2. Related Tables (Seed separately)
```go
// user_preferences table
type UserPreferenceSeedData struct {
    UserID                string
    Language              string  // 'vi', 'en'
    Timezone              string  // 'Asia/Ho_Chi_Minh'
    ProfileVisibility     string  // 'PUBLIC', 'FRIENDS', 'PRIVATE'
    EmailNotifications    bool
    PushNotifications     bool
    SMSNotifications      bool
}

// course_enrollments table (for stats.totalCourses)
type CourseEnrollmentSeedData struct {
    UserID     string
    CourseID   string
    Status     string  // 'ACTIVE', 'COMPLETED'
    Progress   int     // 0-100
    EnrolledAt time.Time
}

// exam_attempts table (for stats.totalExamResults, averageScore)
type ExamAttemptSeedData struct {
    UserID      string
    ExamID      string
    Score       float64
    CompletedAt time.Time
}

// user_sessions table (for activeSessionsCount)
type UserSessionSeedData struct {
    UserID         string
    SessionToken   string
    IPAddress      string
    IsActive       bool
    ExpiresAt      time.Time
}
```

---

## Seeder Implementation Plan

### Phase 1: Seed Users (100+ users)
```go
// apps/backend/internal/seeder/user_seeder.go
func SeedUsers(db *sql.DB) error {
    users := []UserSeedData{
        // 10 Admins
        {ID: "admin-001", Email: "admin@nynus.edu.vn", Role: "ADMIN", Level: nil, ...},
        
        // 20 Teachers (Level 5-9)
        {ID: "teacher-001", Email: "teacher1@nynus.edu.vn", Role: "TEACHER", Level: 5, ...},
        
        // 10 Tutors (Level 3-7)
        {ID: "tutor-001", Email: "tutor1@nynus.edu.vn", Role: "TUTOR", Level: 3, ...},
        
        // 60 Students (Level 1-9)
        {ID: "student-001", Email: "student1@nynus.edu.vn", Role: "STUDENT", Level: 9, ...},
    }
    
    for _, user := range users {
        _, err := db.Exec(`
            INSERT INTO users (
                id, email, password_hash, first_name, last_name, role, level, status,
                email_verified, max_concurrent_sessions, last_login_at, last_login_ip,
                bio, phone, address, school, date_of_birth, gender,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        `, user.ID, user.Email, user.PasswordHash, ...)
    }
}
```

### Phase 2: Seed User Preferences
```go
func SeedUserPreferences(db *sql.DB, userIDs []string) error {
    for _, userID := range userIDs {
        _, err := db.Exec(`
            INSERT INTO user_preferences (user_id, language, timezone, profile_visibility, ...)
            VALUES ($1, 'vi', 'Asia/Ho_Chi_Minh', 'PUBLIC', ...)
        `, userID)
    }
}
```

### Phase 3: Seed Course Enrollments (for stats)
```go
func SeedCourseEnrollments(db *sql.DB, studentIDs []string) error {
    // Seed 3-8 course enrollments per student
}
```

### Phase 4: Seed Exam Attempts (for stats)
```go
func SeedExamAttempts(db *sql.DB, studentIDs []string) error {
    // Seed 10-50 exam attempts per student với realistic scores
}
```

---

## Frontend Integration Changes

### 1. Remove Mock Data Imports
```typescript
// ❌ BEFORE
import { mockUsers, getMockUsersResponse } from '@/lib/mockdata';

// ✅ AFTER
// No mock imports - use gRPC only
```

### 2. Update Hooks to Use gRPC
```typescript
// apps/frontend/src/hooks/admin/use-user-management.ts
export function useUserManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['users', page, filters],
    queryFn: async () => {
      // ✅ Call real gRPC service
      const response = await UserService.listUsers({
        pagination: { page, limit },
        filters: apiFilters
      });
      return response;
    }
  });
}
```

### 3. Compute Nested Objects on Frontend
```typescript
// Compute stats from separate API calls
const userStats = {
  totalExamResults: await ExamService.countUserAttempts(userId),
  totalCourses: await CourseService.countUserEnrollments(userId),
  averageScore: await ExamService.getUserAverageScore(userId)
};

// Fetch preferences from separate table
const userPreferences = await PreferenceService.getUserPreferences(userId);
```

---

## Conclusion

### ✅ Database Schema is READY
- All mockUsers fields có corresponding database columns
- No migration needed
- Can seed data immediately

### 📋 Next Steps
1. ✅ Create user seeder script (100+ users)
2. ✅ Seed user_preferences for all users
3. ✅ Seed course_enrollments for students
4. ✅ Seed exam_attempts for students
5. ✅ Update frontend to use gRPC UserService
6. ✅ Remove mock fallback logic
7. ✅ Test authentication and user management flow

### 🎯 Success Criteria
- [ ] 100+ users seeded in database
- [ ] All users have preferences
- [ ] Students have course enrollments and exam attempts
- [ ] Frontend displays real data from gRPC
- [ ] No mock data imports remain
- [ ] Authentication flow works end-to-end

