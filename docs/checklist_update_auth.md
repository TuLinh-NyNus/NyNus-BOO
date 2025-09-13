# 📋 CHECKLIST CẬP NHẬT HỆ THỐNG AUTH

## 📊 Tổng Quan Tiến Độ
- **Thiết kế**: Đã hoàn thành (AUTH_COMPLETE_GUIDE.md)
- **Hiện trạng**: Hệ thống auth cơ bản (email/password + JWT)
- **Mục tiêu**: Nâng cấp lên hệ thống auth đầy đủ theo thiết kế

---

## 🔴 PHẦN 1: BACKEND & DATABASE

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
- [ ] **Tạo migration file 004_enhanced_auth_system.up.sql**
  - [ ] Thêm role hierarchy function
  - [ ] Thêm level validation triggers
  - [ ] Thêm role-level constraints
- [ ] **Tạo migration file 004_enhanced_auth_system.down.sql**
- [ ] **Run migrations để update database**

### 2️⃣ **Backend Services & Proto Definitions** ⏱️ 3-4 giờ

#### Proto Files Updates
- [ ] **Update packages/proto/v1/user.proto**
  - [ ] Add GoogleLoginRequest/Response messages
  - [ ] Add RefreshTokenRequest/Response messages
  - [ ] Add role enum with 5 values
  - [ ] Add level field (1-9) to User message
- [ ] **Create packages/proto/v1/profile.proto**
  - [ ] Define ProfileService
  - [ ] Add session management messages
  - [ ] Add preferences messages
- [ ] **Create packages/proto/v1/admin.proto**
  - [ ] Define AdminService
  - [ ] Add user management messages
  - [ ] Add audit log messages

#### A. OAuth Service (Mới)
- [ ] **Tạo internal/service/domain_service/oauth/oauth.go**
  - [ ] Google OAuth configuration
  - [ ] OAuth flow handlers
  - [ ] Token exchange logic
  - [ ] Profile sync from Google

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

### 3️⃣ **Repository Layer** ⏱️ 2 giờ

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

### 4️⃣ **gRPC Service Methods** ⏱️ 2 giờ

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

### 5️⃣ **gRPC Interceptors & Guards** ⏱️ 1 giờ

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

### 6️⃣ **Configuration & Environment** ⏱️ 30 phút

- [ ] **Update .env.example**
  ```env
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  GOOGLE_REDIRECT_URI=
  JWT_ACCESS_SECRET=
  JWT_REFRESH_SECRET=
  SESSION_SECRET=
  MAX_CONCURRENT_SESSIONS=3
  ```

- [ ] **Update config/config.go**
  - [ ] Add OAuth config structure
  - [ ] Add session config
  - [ ] Add security config

---

## 🔵 PHẦN 2: FRONTEND

### 1️⃣ **Authentication UI** ⏱️ 2 giờ

#### A. Login Page Enhancement
- [ ] **Update login page với Google OAuth**
  - [ ] Add "Đăng nhập bằng Google" button
  - [ ] Style OAuth buttons properly
  - [ ] Handle OAuth callbacks
  - [ ] Show loading states

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

## 📊 TỔNG KẾT CÔNG VIỆC

### Backend & Database
- **Tổng cộng**: ~40 tasks chính (bao gồm gRPC methods)
- **Thời gian ước tính**: 12-14 giờ
- **Độ ưu tiên**: 
  - 🔴 Critical: Database schema với 5 roles + levels, OAuth, Sessions, gRPC services
  - 🟡 Important: Resource protection, Audit logs, Role hierarchy logic
  - 🟢 Nice-to-have: Notifications, Advanced preferences

### Frontend
- **Tổng cộng**: ~40 tasks chính
- **Thời gian ước tính**: 10-12 giờ
- **Độ ưu tiên**:
  - 🔴 Critical: Google OAuth UI, Session management, gRPC-Web integration
  - 🟡 Important: Profile, Settings, Admin dashboard, Role/Level display
  - 🟢 Nice-to-have: Notifications, Advanced analytics

### Tổng thời gian dự kiến: **20-24 giờ**

---

## 🚀 ROADMAP TRIỂN KHAI

### Phase 1: Core Auth (Tuần 1)
1. Database migrations
2. Google OAuth backend
3. Session management
4. Basic frontend integration

### Phase 2: Security (Tuần 2)
1. Resource protection
2. Risk scoring
3. Audit logging
4. Admin monitoring

### Phase 3: Enhancement (Tuần 3)
1. User preferences
2. Notifications
3. Advanced UI
4. Testing & optimization

---

## ✅ DEFINITION OF DONE

Mỗi task được coi là hoàn thành khi:
1. ✅ Code implemented & working
2. ✅ Database migrations run successfully
3. ✅ API endpoints tested
4. ✅ Frontend integrated
5. ✅ No console errors
6. ✅ Type-safe (TypeScript/Go)
7. ✅ Documented in code

---

## 📝 GHI CHÚ

- Ưu tiên Google OAuth và session management trước
- Resource protection có thể implement từng phần
- Notifications và preferences có thể để sau
- Admin features phát triển song song
- Testing cần được thực hiện liên tục

**Cập nhật lần cuối**: 13/09/2025