# 📋 CHECKLIST CẬP NHẬT HỆ THỐNG AUTH

## 📊 Tổng Quan Tiến Độ
- **Thiết kế**: Đã hoàn thành (AUTH_COMPLETE_GUIDE.md)
- **Hiện trạng**: 
  - ✅ Backend: Auth cơ bản (email/password + JWT)
  - ✅ Frontend: NextAuth với Google OAuth setup
  - ❌ Chỉ có 3 roles (thiếu GUEST, TUTOR)
  - ❌ Chưa có OAuth backend, session management
  - ❌ Chưa có các tables mới theo thiết kế
- **Mục tiêu**: Nâng cấp lên hệ thống auth đầy đủ 5 roles + Google OAuth + Session management

---

## 🔴 PHASE 1: CORE DATABASE & BACKEND (Ưu tiên cao nhất)

### ⚡ **Pre-requisites** ⏱️ 30 phút
- [x] **Update .env.example với các biến mới**
  ```env
  # Google OAuth
  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
  
  # JWT Secrets  
  JWT_ACCESS_SECRET=your_access_secret
  JWT_REFRESH_SECRET=your_refresh_secret
  
  # Session Config
  SESSION_SECRET=your_session_secret
  MAX_CONCURRENT_SESSIONS=3
  SESSION_EXPIRE_HOURS=720
  
  # Security
  BCRYPT_COST=10
  MAX_LOGIN_ATTEMPTS=5
  LOCK_DURATION_MINUTES=30
  ```
- [x] **Copy .env.example to .env và điền values**
- [ ] **Verify database connection** (Docker chưa chạy)

### 1️⃣ **Database Schema Updates** ⏱️ 2-3 giờ

#### A. Enhanced Users Table
- [ ] **Thêm các fields mới vào users table**
  - [ ] `google_id` (TEXT UNIQUE) - OAuth primary
  - [ ] `username` (TEXT UNIQUE) - Display name  
  - [ ] `avatar` (TEXT) - Profile picture
  - [ ] `bio` (TEXT) - User description
  - [ ] `phone` (TEXT) - Contact info
  - [ ] `address` (TEXT) - Simple address
  - [ ] `school` (TEXT) - Educational background
  - [ ] `date_of_birth` (DATE) - Age verification
  - [ ] `gender` (TEXT) - Analytics
  - [ ] `level` (INTEGER) - Hierarchy level 1-9
  - [ ] `max_concurrent_sessions` (INTEGER DEFAULT 3) - Anti-sharing
  - [ ] `status` (TEXT DEFAULT 'ACTIVE') - Account control
  - [ ] `email_verified` (BOOLEAN DEFAULT FALSE) - Security
  - [ ] `last_login_at` (TIMESTAMPTZ) - Security monitoring
  - [ ] `last_login_ip` (TEXT) - Suspicious detection
  - [ ] `login_attempts` (INTEGER DEFAULT 0) - Brute force protection
  - [ ] `locked_until` (TIMESTAMPTZ) - Account locking

- [ ] **Update role constraints**
  - [ ] Thay đổi role từ ('student', 'teacher', 'admin') thành ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')
  - [ ] Thêm status CHECK constraint: ('ACTIVE', 'INACTIVE', 'SUSPENDED')
  - [ ] Thêm validate_user_role_level function để kiểm tra role-level combination
  - [ ] GUEST và ADMIN: không có level (NULL)
  - [ ] STUDENT, TUTOR, TEACHER: bắt buộc có level 1-9

- [ ] **Tạo indexes cho performance**
  - [ ] idx_users_google_id
  - [ ] idx_users_role_level
  - [ ] idx_users_status
  - [ ] idx_users_username
  - [ ] idx_users_last_login

#### B. OAuth Accounts Table (Mới)
- [ ] **Tạo table oauth_accounts**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT FK to users)
  - provider (TEXT) - google, facebook, etc
  - provider_account_id (TEXT)
  - type (TEXT DEFAULT 'oauth')
  - scope (TEXT)
  - access_token (TEXT)
  - refresh_token (TEXT)  
  - id_token (TEXT)
  - expires_at (INTEGER)
  - token_type (TEXT)
  - created_at, updated_at
  ```
- [ ] **Tạo indexes**
  - [ ] Unique index on (provider, provider_account_id)
  - [ ] Index on user_id

#### C. User Sessions Table (Mới)
- [ ] **Tạo table user_sessions**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT FK to users)
  - session_token (TEXT UNIQUE)
  - ip_address (TEXT)
  - user_agent (TEXT)
  - device_fingerprint (TEXT)
  - location (TEXT)
  - is_active (BOOLEAN DEFAULT TRUE)
  - last_activity (TIMESTAMPTZ)
  - expires_at (TIMESTAMPTZ)
  - created_at
  ```
- [ ] **Tạo indexes cho performance**

#### D. Resource Access Table (Mới)
- [ ] **Tạo table resource_access**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT FK to users)
  - resource_type (TEXT) - COURSE, VIDEO, PDF, etc
  - resource_id (TEXT)
  - action (TEXT) - VIEW, DOWNLOAD, STREAM
  - ip_address (TEXT)
  - user_agent (TEXT)
  - session_token (TEXT)
  - is_valid_access (BOOLEAN DEFAULT TRUE)
  - risk_score (INTEGER DEFAULT 0)
  - duration (INTEGER)
  - metadata (JSONB)
  - created_at
  ```
- [ ] **Tạo indexes cho security queries**

#### E. Course Enrollments Table (Mới)
- [ ] **Tạo table course_enrollments**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT FK)
  - course_id (TEXT)
  - status (TEXT) - ACTIVE, COMPLETED, DROPPED, SUSPENDED, EXPIRED
  - access_level (TEXT) - BASIC, PREMIUM, FULL
  - max_downloads (INTEGER)
  - current_downloads (INTEGER DEFAULT 0)
  - max_streams (INTEGER)
  - expires_at (TIMESTAMPTZ)
  - progress (INTEGER DEFAULT 0)
  - enrolled_at, updated_at
  ```

#### F. Notifications Table (Mới)
- [ ] **Tạo table notifications**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT FK)
  - type (TEXT) - SECURITY_ALERT, COURSE_UPDATE, etc
  - title (TEXT)
  - message (TEXT)
  - data (JSONB)
  - is_read (BOOLEAN DEFAULT FALSE)
  - read_at (TIMESTAMPTZ)
  - created_at
  - expires_at (TIMESTAMPTZ)
  ```

#### G. User Preferences Table (Mới)
- [ ] **Tạo table user_preferences**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT UNIQUE FK)
  - email_notifications (BOOLEAN DEFAULT TRUE)
  - push_notifications (BOOLEAN DEFAULT TRUE)
  - sms_notifications (BOOLEAN DEFAULT FALSE)
  - auto_play_videos (BOOLEAN DEFAULT TRUE)
  - default_video_quality (TEXT DEFAULT '720p')
  - playback_speed (DECIMAL DEFAULT 1.0)
  - profile_visibility (TEXT DEFAULT 'PUBLIC')
  - timezone (TEXT DEFAULT 'Asia/Ho_Chi_Minh')
  - language (TEXT DEFAULT 'vi')
  - updated_at
  ```

#### H. Audit Logs Table (Mới)
- [ ] **Tạo table audit_logs**
  ```sql
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT FK nullable)
  - action (TEXT)
  - resource (TEXT)
  - resource_id (TEXT)
  - old_values (JSONB)
  - new_values (JSONB)
  - ip_address (TEXT)
  - user_agent (TEXT)
  - session_id (TEXT)
  - success (BOOLEAN DEFAULT TRUE)
  - error_message (TEXT)
  - metadata (JSONB)
  - created_at
  ```

#### I. Migration Files
- [x] **Tạo migration file 000004_enhanced_auth_system.up.sql**
  - [x] Copy template từ docs/migration-example-enhanced-auth.sql
  - [x] Update users table với các fields mới
  - [x] Tạo 7 tables mới (oauth_accounts, user_sessions, etc.)
  - [x] Thêm role hierarchy function validate_user_role_level()
  - [x] Thêm indexes cho performance
  - [x] Thêm triggers cho updated_at
- [x] **Tạo migration file 000004_enhanced_auth_system.down.sql**
  - [x] Drop các tables mới theo thứ tự ngược lại
  - [x] Revert users table về trạng thái cũ
  - [x] Drop functions và triggers
- [ ] **Test migrations locally**
  ```bash
  # Up migration
  migrate -path packages/database/migrations -database "postgresql://..." up
  
  # Verify schema
  psql -d exam_bank_system -c "\dt"
  
  # Test rollback
  migrate -path packages/database/migrations -database "postgresql://..." down 1
  ```
- [x] **Tạo seed data script** (optional)
  - [x] Test script test_migration.sql đã bao gồm test data
  - [x] Users với các roles khác nhau
  - [x] Test OAuth accounts
  - [x] Sample sessions

### 2️⃣ **Proto Definitions Updates** ⏱️ 1 giờ

#### A. Update Common Proto
- [x] **Update packages/proto/common/common.proto**
  - [x] Update UserRole enum:
    ```proto
    enum UserRole {
      USER_ROLE_UNSPECIFIED = 0;
      USER_ROLE_GUEST = 1;      // NEW
      USER_ROLE_STUDENT = 2;    // was 1
      USER_ROLE_TUTOR = 3;      // NEW
      USER_ROLE_TEACHER = 4;    // was 2
      USER_ROLE_ADMIN = 5;      // was 3
    }
    ```
  - [x] Add UserStatus enum:
    ```proto
    enum UserStatus {
      USER_STATUS_UNSPECIFIED = 0;
      USER_STATUS_ACTIVE = 1;
      USER_STATUS_INACTIVE = 2;
      USER_STATUS_SUSPENDED = 3;
    }
    ```

#### B. Update User Proto
- [x] **Update packages/proto/v1/user.proto**
  - [x] Add to User message:
    ```proto
    int32 level = 7;              // 1-9 for STUDENT/TUTOR/TEACHER
    string username = 8;          // unique username
    string avatar = 9;            // avatar URL
    common.UserStatus status = 10;
    bool email_verified = 11;
    string google_id = 12;        // for OAuth
    ```
  - [x] Add OAuth messages:
    ```proto
    message GoogleLoginRequest {
      string id_token = 1;        // Google ID token
    }
    
    message RefreshTokenRequest {
      string refresh_token = 1;
    }
    
    message RefreshTokenResponse {
      common.Response response = 1;
      string access_token = 2;
      string refresh_token = 3;
    }
    ```

#### C. Create New Proto Files
- [x] **Create packages/proto/v1/profile.proto**
  - [x] Define ProfileService
  - [x] Session management messages
  - [x] Preferences messages
- [x] **Create packages/proto/v1/admin.proto**
  - [x] Define AdminService
  - [x] User management messages
  - [x] Audit log messages

#### D. Generate Proto Code
- [ ] **Run proto generation**
  ```bash
  make proto-gen
  ```
- [ ] **Verify generated files**
  - [ ] Check Go files in apps/backend/pkg/proto/
  - [ ] Check TypeScript files in packages/proto/generated/

### 3️⃣ **Backend Services Implementation** ⏱️ 3-4 giờ

#### A. OAuth Service (Mới)
- [ ] **Tạo apps/backend/internal/service/domain_service/oauth/oauth.go**
  - [ ] Google OAuth client setup
  - [ ] Verify Google ID token
  - [ ] Create/link user from Google profile
  - [ ] Handle existing email conflicts
- [ ] **Tạo apps/backend/internal/service/domain_service/oauth/google_client.go**
  - [ ] Google API client wrapper
  - [ ] Token validation
  - [ ] Profile fetching

#### B. Enhanced Auth Service
- [ ] **Update internal/service/domain_service/auth/auth.go**
  - [ ] Thêm OAuth login support
  - [ ] Implement refresh token logic
  - [ ] Session management functions
  - [ ] Device fingerprinting
  - [ ] Multi-session support (max 3)
  - [ ] Account locking logic
  - [ ] Email verification flow

#### C. Session Service (Mới)
- [ ] **Tạo internal/service/domain_service/session/session.go**
  - [ ] Create session
  - [ ] Validate session
  - [ ] Terminate session
  - [ ] List user sessions
  - [ ] Auto-terminate oldest session
  - [ ] Session activity tracking

#### D. Resource Protection Service (Mới)
- [ ] **Tạo internal/service/domain_service/resource/resource_protection.go**
  - [ ] Access validation
  - [ ] Risk score calculation
  - [ ] Auto-blocking logic
  - [ ] Download limit enforcement
  - [ ] Access logging

#### E. Notification Service (Mới)
- [ ] **Tạo internal/service/domain_service/notification/notification.go**
  - [ ] Create notification
  - [ ] Mark as read
  - [ ] Get user notifications
  - [ ] Auto-expire old notifications

### 4️⃣ **Repository Layer** ⏱️ 2 giờ

#### A. Enhanced User Repository
- [ ] **Update internal/repository/user.go**
  - [ ] Add GetByGoogleId method
  - [ ] Add UpdateLastLogin method
  - [ ] Add IncrementLoginAttempts method
  - [ ] Add LockAccount method

#### B. New Repositories
- [ ] **Tạo internal/repository/oauth_account.go**
- [ ] **Tạo internal/repository/session.go**
- [ ] **Tạo internal/repository/resource_access.go**
- [ ] **Tạo internal/repository/enrollment.go**
- [ ] **Tạo internal/repository/notification.go**
- [ ] **Tạo internal/repository/user_preference.go**
- [ ] **Tạo internal/repository/audit_log.go**

### 5️⃣ **gRPC Service Methods** ⏱️ 2 giờ

#### A. Enhanced UserService Methods
- [ ] **GoogleLogin** - Handle Google OAuth authentication
  ```proto
  rpc GoogleLogin(GoogleLoginRequest) returns (LoginResponse);
  ```
- [ ] **RefreshToken** - Refresh JWT access token
  ```proto
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  ```
- [ ] **VerifyEmail** - Email verification
  ```proto
  rpc VerifyEmail(VerifyEmailRequest) returns (VerifyEmailResponse);
  ```
- [ ] **ForgotPassword** - Password reset request
  ```proto
  rpc ForgotPassword(ForgotPasswordRequest) returns (ForgotPasswordResponse);
  ```
- [ ] **ResetPassword** - Reset password with token
  ```proto
  rpc ResetPassword(ResetPasswordRequest) returns (ResetPasswordResponse);
  ```

#### B. ProfileService Methods (New Service)
- [ ] **GetProfile** - Get current user profile
  ```proto
  rpc GetProfile(GetProfileRequest) returns (GetProfileResponse);
  ```
- [ ] **UpdateProfile** - Update user profile
  ```proto
  rpc UpdateProfile(UpdateProfileRequest) returns (UpdateProfileResponse);
  ```
- [ ] **GetSessions** - List user sessions
  ```proto
  rpc GetSessions(GetSessionsRequest) returns (GetSessionsResponse);
  ```
- [ ] **TerminateSession** - Terminate specific session
  ```proto
  rpc TerminateSession(TerminateSessionRequest) returns (TerminateSessionResponse);
  ```
- [ ] **GetPreferences** - Get user preferences
  ```proto
  rpc GetPreferences(GetPreferencesRequest) returns (GetPreferencesResponse);
  ```
- [ ] **UpdatePreferences** - Update preferences
  ```proto
  rpc UpdatePreferences(UpdatePreferencesRequest) returns (UpdatePreferencesResponse);
  ```

#### C. AdminService Methods (New Service)
- [ ] **ListUsers** - List all users with filters
  ```proto
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  ```
- [ ] **UpdateUserRole** - Update user role and level
  ```proto
  rpc UpdateUserRole(UpdateUserRoleRequest) returns (UpdateUserRoleResponse);
  ```
- [ ] **UpdateUserLevel** - Update user level (within same role)
  ```proto
  rpc UpdateUserLevel(UpdateUserLevelRequest) returns (UpdateUserLevelResponse);
  ```
- [ ] **UpdateUserStatus** - Update user status
  ```proto
  rpc UpdateUserStatus(UpdateUserStatusRequest) returns (UpdateUserStatusResponse);
  ```
- [ ] **GetAuditLogs** - View audit logs
  ```proto
  rpc GetAuditLogs(GetAuditLogsRequest) returns (GetAuditLogsResponse);
  ```
- [ ] **GetResourceAccess** - Monitor resource access
  ```proto
  rpc GetResourceAccess(GetResourceAccessRequest) returns (GetResourceAccessResponse);
  ```

### 6️⃣ **gRPC Interceptors & Guards** ⏱️ 1 giờ

- [ ] **Update auth_interceptor.go**
  - [ ] Add OAuth token validation
  - [ ] Add session validation
  - [ ] Add role-level authorization logic:
    - [ ] ADMIN: Full access to all methods
    - [ ] TEACHER (Level 1-9): Access to teaching methods
    - [ ] TUTOR (Level 1-9): Access to tutoring methods
    - [ ] STUDENT (Level 1-9): Access to student methods
    - [ ] GUEST: Limited read-only access
  - [ ] Add resource access validation

- [ ] **Create new interceptors**
  - [ ] SessionLimitInterceptor (max 3 sessions)
  - [ ] ResourceAccessInterceptor
  - [ ] RateLimitInterceptor
  - [ ] AuditLogInterceptor
  - [ ] RoleLevelInterceptor (check role + level permissions)

### 7️⃣ **Testing & Verification** ⏱️ 1 giờ

- [ ] **Unit Tests**
  - [ ] Auth service tests
  - [ ] OAuth service tests
  - [ ] Session service tests
  - [ ] Repository tests

- [ ] **Integration Tests**
  - [ ] Full OAuth flow test
  - [ ] Session limit test (3 devices)
  - [ ] Role-level validation test
  - [ ] Resource protection test

- [ ] **Manual Testing Checklist**
  - [ ] Google login flow
  - [ ] Email/password fallback
  - [ ] Session management (3 devices)
  - [ ] Role permissions
  - [ ] Profile update

---

## 🔵 PHASE 2: FRONTEND INTEGRATION

### 1️⃣ **Google OAuth Integration** ⏱️ 2 giờ 🔴

#### A. Backend Integration
- [ ] **Update auth flow để gọi backend**
  - [ ] Modify NextAuth callback để gọi backend GoogleLogin
  - [ ] Sync Google profile với backend user
  - [ ] Store backend JWT token
  - [ ] Handle refresh tokens

#### B. Login Page Enhancement  
- [ ] **Update login page UI**
  - [ ] "Đăng nhập bằng Google" button (primary)
  - [ ] Email/password form (secondary)
  - [ ] Loading states
  - [ ] Error handling

#### B. Registration Flow
- [ ] **Create enhanced registration page**
  - [ ] Multi-step registration form
  - [ ] Email verification UI
  - [ ] Profile setup step
  - [ ] Welcome screen

#### C. Password Reset Flow
- [ ] **Create password reset pages**
  - [ ] Forgot password form
  - [ ] Reset password form
  - [ ] Success confirmation

### 2️⃣ **User Profile & Settings** ⏱️ 2 giờ

#### A. Profile Management
- [ ] **Create profile pages**
  - [ ] View profile page
  - [ ] Edit profile form
  - [ ] Avatar upload
  - [ ] Role & level display

#### B. Preferences Settings
- [ ] **Create preferences page**
  - [ ] Notification settings
  - [ ] Learning preferences
  - [ ] Privacy settings
  - [ ] Localization settings

#### C. Session Management UI
- [ ] **Create sessions page**
  - [ ] List active sessions
  - [ ] Device information display
  - [ ] Terminate session action
  - [ ] Session activity timeline

### 3️⃣ **State Management** ⏱️ 1.5 giờ

#### A. Enhanced Auth Store (Zustand)
- [ ] **Update auth store**
  - [ ] Add OAuth login action
  - [ ] Add refresh token logic
  - [ ] Add session management
  - [ ] Add user preferences state

#### B. New Stores
- [ ] **Create notification store**
- [ ] **Create preferences store**
- [ ] **Create session store**

### 4️⃣ **gRPC-Web Integration** ⏱️ 2 giờ

#### A. Auth gRPC Client
- [ ] **Update services/grpc/auth.client.ts**
  - [ ] Google OAuth login call
  - [ ] Refresh token call
  - [ ] Email verification call
  - [ ] Password reset calls

#### B. User gRPC Client
- [ ] **Create services/grpc/user.client.ts**
  - [ ] Profile service calls
  - [ ] Sessions management calls
  - [ ] Preferences service calls
  - [ ] Role/Level queries

### 5️⃣ **Protected Routes & Guards** ⏱️ 1 giờ

- [ ] **Update route protection**
  - [ ] Role-based route guards
  - [ ] Level-based access control
  - [ ] Session validation
  - [ ] Redirect logic

### 6️⃣ **UI Components** ⏱️ 2 giờ

#### A. Auth Components
- [ ] **OAuth button components**
- [ ] **Session card component**
- [ ] **Role badge component**
- [ ] **Level indicator component**

#### B. Security Components
- [ ] **Security alert banner**
- [ ] **Account locked modal**
- [ ] **Session limit warning**
- [ ] **Risk score indicator**

#### C. Notification Components
- [ ] **Notification bell icon**
- [ ] **Notification dropdown**
- [ ] **Notification cards**
- [ ] **Mark as read action**

### 7️⃣ **Admin Dashboard** ⏱️ 2 giờ

#### A. User Management
- [ ] **Enhanced user list table**
  - [ ] Role & level columns
  - [ ] Status indicators
  - [ ] Last login info
  - [ ] Quick actions

#### B. Security Monitoring
- [ ] **Security dashboard**
  - [ ] Suspicious activity alerts
  - [ ] High risk users list
  - [ ] Resource access logs
  - [ ] Session analytics

#### C. Audit Logs Viewer
- [ ] **Audit log page**
  - [ ] Filterable log table
  - [ ] Action details modal
  - [ ] Export functionality

---

## 🟢 PHASE 3: SECURITY & MONITORING

### 1️⃣ **Resource Protection** ⏱️ 2 giờ

- [ ] **Implement Resource Access Tracking**
  - [ ] Log every PDF view/download
  - [ ] Track video streaming
  - [ ] Monitor exam attempts
  - [ ] Calculate simple risk scores

- [ ] **Anti-Piracy Logic**
  - [ ] Detect rapid downloads
  - [ ] Flag suspicious IP patterns
  - [ ] Auto-block high risk users
  - [ ] Send security alerts

### 2️⃣ **Admin Features** ⏱️ 2 giờ

- [ ] **Admin Dashboard Pages**
  - [ ] User management (5 roles + levels)
  - [ ] Security monitoring
  - [ ] Resource access logs
  - [ ] Audit trail viewer

- [ ] **Admin Actions**
  - [ ] Update user role/level
  - [ ] Suspend/activate users
  - [ ] View user sessions
  - [ ] Export reports

---

## 📊 TỔNG KẾT CÔNG VIỆC

### Phase 1: Core Backend & Database
- **Tổng cộng**: ~45 tasks chính
- **Thời gian ước tính**: 10-12 giờ
- **Độ ưu tiên**: 
  - 🔴 **MUST HAVE**: Database migration, Proto updates, OAuth service, Session management
  - 🟡 **SHOULD HAVE**: All repositories, gRPC methods, Interceptors
  - 🟢 **NICE TO HAVE**: Advanced preferences, Notifications

### Phase 2: Frontend Integration  
- **Tổng cộng**: ~35 tasks chính
- **Thời gian ước tính**: 8-10 giờ
- **Độ ưu tiên**:
  - 🔴 **MUST HAVE**: Google OAuth integration, Auth state management
  - 🟡 **SHOULD HAVE**: Profile UI, Session UI, Role guards
  - 🟢 **NICE TO HAVE**: Preferences, Notifications UI

### Phase 3: Security & Monitoring
- **Tổng cộng**: ~20 tasks
- **Thời gian ước tính**: 4-5 giờ
- **Độ ưu tiên**:
  - 🟡 **SHOULD HAVE**: Resource protection, Basic admin UI
  - 🟢 **NICE TO HAVE**: Advanced analytics, Reports

### Tổng thời gian dự kiến: **22-27 giờ**

---

## 🚀 ROADMAP TRIỂN KHAI (Updated)

### 📅 Phase 1: Core Auth Backend (3-4 ngày)
**Ngày 1-2: Database & Proto**
1. ✅ Environment setup (.env files)
2. ✅ Database migration (enhanced schema)
3. ✅ Proto definitions update
4. ✅ Generate proto code

**Ngày 3-4: Backend Services**
1. ✅ OAuth service (Google login)
2. ✅ Session management (3 devices)
3. ✅ Enhanced auth service
4. ✅ Repository layer
5. ✅ gRPC endpoints

### 📅 Phase 2: Frontend Integration (2-3 ngày)
**Ngày 5-6: Core Integration**
1. ✅ Connect NextAuth → Backend OAuth
2. ✅ Auth state management
3. ✅ Protected routes
4. ✅ Session UI

**Ngày 7: UI Components**
1. ✅ Profile management
2. ✅ User preferences
3. ✅ Role/Level display

### 📅 Phase 3: Security & Polish (2 ngày)
**Ngày 8: Security**
1. ✅ Resource protection
2. ✅ Anti-piracy logic
3. ✅ Admin dashboard

**Ngày 9: Testing & Docs**
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Documentation
4. ✅ Deployment prep

---

## ✅ DEFINITION OF DONE

Mỗi task được coi là hoàn thành khi:
1. ✅ Code implemented & working
2. ✅ Database migrations run successfully  
3. ✅ API endpoints tested (manual hoặc unit test)
4. ✅ Frontend integrated & functional
5. ✅ No console errors or warnings
6. ✅ Type-safe (TypeScript/Go) - pnpm type-check pass
7. ✅ Linting pass - pnpm lint
8. ✅ Documented in code (comments cho complex logic)
9. ✅ Error handling implemented
10. ✅ Loading states & user feedback

---

## 📝 GHI CHÚ QUAN TRỌNG

### 🎯 Top Priorities (làm trước)
1. **Database migration** - Nền tảng cho tất cả
2. **Proto updates** - Cần cho gRPC services  
3. **Google OAuth backend** - Core feature
4. **Session management** - Security requirement

### ⚡ Quick Wins (dễ làm, impact cao)
- Update proto enums (30 phút)
- Environment setup (30 phút)
- Basic OAuth flow (2 giờ)

### 🔧 Technical Notes
- Use existing migration example as template
- Test với Google OAuth playground first
- Session tokens dùng crypto-random, không JWT
- Risk scores tính đơn giản: tần suất + IP changes

### ⚠️ Common Pitfalls
- Đừng quên rollback migration file
- Test 3-device limit kỹ càng
- Handle email conflicts (Google vs existing)
- Proto enum values không được đổi số

**Cập nhật lần cuối**: 13/09/2025 - Reorganized với phases và priorities
