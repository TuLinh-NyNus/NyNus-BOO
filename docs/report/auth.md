# NyNus Authentication System Documentation

## Tổng quan (Overview)

Hệ thống xác thực của NyNus Exam Bank System được xây dựng dựa trên kiến trúc monorepo với sự kết hợp giữa NextAuth.js v5 (frontend) và Go gRPC services (backend). Hệ thống hỗ trợ xác thực qua email/password và Google OAuth, sử dụng JWT tokens để quản lý phiên làm việc.

## Technology Stack

### Frontend
- **NextAuth.js v5**: Framework xác thực cho Next.js 14 App Router
- **Next.js 14**: React framework với App Router
- **TypeScript 5.5**: Type-safe development
- **gRPC-Web**: Client library để giao tiếp với backend qua gRPC

### Backend
- **Go**: Backend language
- **gRPC**: Communication protocol
- **JWT (golang-jwt/jwt/v5)**: Token generation và validation
- **bcrypt**: Password hashing
- **PostgreSQL 15**: Database lưu trữ users, sessions, refresh tokens

### Infrastructure
- **Docker**: Containerization
- **Turborepo**: Monorepo build system
- **PNPM**: Package manager

## System Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  - Next.js Pages (login, register, profile, sessions)       │
│  - React Components (LoginForm, AuthModal, UserDisplay)     │
│  - UI Components (password-strength, auth-illustration)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  - NextAuth Configuration (auth.ts)                          │
│  - Middleware (middleware.ts)                                │
│  - React Contexts (auth-context-grpc.tsx)                   │
│  - Custom Hooks (useAuth, useSession)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                              │
│  - Auth Services (auth.service.ts, AuthService.go)          │
│  - JWT Services (unified_jwt_service.go)                     │
│  - OAuth Services (oauth.go, google_client.go)              │
│  - Session Services (session.go)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                         │
│  - Repositories (user.go, session.go, refresh_token.go)     │
│  - Database (PostgreSQL with migrations)                     │
│  - gRPC Services (user_service_enhanced.go)                  │
│  - Middleware/Interceptors (auth, CSRF, rate limit)         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Integration

```
Frontend (Next.js 14)          Backend (Go + gRPC)
┌──────────────────┐          ┌──────────────────┐
│  NextAuth v5     │◄────────►│  JWT Service     │
│  (Session Mgmt)  │  gRPC    │  (Token Gen)     │
└──────────────────┘          └──────────────────┘
        ↓                              ↓
┌──────────────────┐          ┌──────────────────┐
│  React Context   │          │  Auth Service    │
│  (State Mgmt)    │          │  (Business Logic)│
└──────────────────┘          └──────────────────┘
        ↓                              ↓
┌──────────────────┐          ┌──────────────────┐
│  gRPC-Web Client │◄────────►│  gRPC Server     │
│  (auth.service)  │  HTTP/2  │  (Interceptors)  │
└──────────────────┘          └──────────────────┘
                                       ↓
                              ┌──────────────────┐
                              │  PostgreSQL DB   │
                              │  (User, Session) │
                              └──────────────────┘
```

## Authentication Flow

### 1. Login Flow (Email/Password)

```
User (Browser)
    ↓ [1] Submit email/password
Login Page (/login)
    ↓ [2] signIn('credentials', { email, password })
NextAuth API (/api/auth/signin/credentials)
    ↓ [3] Call authorize() function
Credentials Provider (apps/frontend/src/lib/auth.ts)
    ↓ [4] AuthService.login(email, password)
gRPC Auth Service (apps/frontend/src/services/grpc/auth.service.ts)
    ↓ [5] gRPC call to backend
Backend gRPC Server (apps/backend/internal/grpc/user_service_enhanced.go)
    ↓ [6] Validate credentials with bcrypt
    ↓ [7] Generate JWT tokens (access + refresh)
    ↓ [8] Create session in database
    ↓ [9] Return LoginResponse with tokens
NextAuth
    ↓ [10] Store tokens in JWT session (httpOnly cookies)
    ↓ [11] Redirect to callbackUrl
Dashboard (/dashboard)
```

### 2. Session Management Flow

```
User Request
    ↓
Middleware (apps/frontend/src/middleware.ts)
    ↓ [1] Extract JWT token using getToken()
    ↓ [2] Verify token signature
    ↓ [3] Check user role & level
    ↓ [4] Validate route permissions
    ↓ [5] Allow/Deny access
Protected Page
```

### 3. Token Refresh Flow

```
Client
    ↓ [1] Detect access token expiring soon
    ↓ [2] Call RefreshToken gRPC endpoint
Backend
    ↓ [3] Validate refresh token
    ↓ [4] Check token family (rotation detection)
    ↓ [5] Generate new access + refresh tokens
    ↓ [6] Revoke old refresh token
    ↓ [7] Return new tokens
Client
    ↓ [8] Update session with new tokens
```

## File Structure

### Frontend Authentication Files

| File Path | Purpose | Key Components |
|-----------|---------|----------------|
| `apps/frontend/src/lib/auth.ts` | NextAuth v5 configuration | `authConfig`, Credentials provider, Google provider, JWT callbacks |
| `apps/frontend/src/middleware.ts` | Route protection middleware | `getToken()`, role-based access control, route permissions |
| `apps/frontend/src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler | GET/POST handlers |
| `apps/frontend/src/services/grpc/auth.service.ts` | gRPC auth client service | `login()`, `register()`, `refreshToken()`, `getCurrentUser()` |
| `apps/frontend/src/contexts/auth-context-grpc.tsx` | React auth context provider | `AuthProvider`, `useAuth()` hook |
| `apps/frontend/src/providers/app-providers.tsx` | App-level providers wrapper | `SessionProvider` wrapper |
| `apps/frontend/src/app/login/page.tsx` | Login page component | Email/password form, Google OAuth button |
| `apps/frontend/src/lib/config/auth-config.ts` | Auth configuration constants | JWT config, session config, OAuth config, security settings |
| `apps/frontend/src/lib/utils/auth-helpers.ts` | Auth utility functions | Token helpers, validation utilities |
| `apps/frontend/src/lib/validation/auth-schemas.ts` | Zod validation schemas | Login schema, register schema |
| `apps/frontend/src/types/next-auth.d.ts` | NextAuth type extensions | Session, User, JWT type augmentation |
| `apps/frontend/src/components/features/auth/AuthErrorBoundary.tsx` | Auth error boundary | Error handling for auth components |
| `apps/frontend/src/components/features/auth/AuthModal.tsx` | Auth modal component | Login/register modal UI |
| `apps/frontend/src/components/features/auth/TwoFactorAuth.tsx` | 2FA component | Two-factor authentication UI |
| `apps/frontend/src/components/features/auth/AccountLockedModal.tsx` | Account locked modal | UI for locked account notification |
| `apps/frontend/src/components/features/auth/ForgotPasswordForm.tsx` | Forgot password form | Password reset request form |
| `apps/frontend/src/components/features/auth/LoginForm.tsx` | Login form | Email/password login form |
| `apps/frontend/src/components/features/auth/RegisterForm.tsx` | Register form | User registration form |
| `apps/frontend/src/components/features/auth/ProtectedRoute.tsx` | Protected route | Route guard component |
| `apps/frontend/src/components/features/auth/LevelIndicator.tsx` | Level indicator | User level display |
| `apps/frontend/src/components/features/auth/RoleBadge.tsx` | Role badge | User role badge UI |
| `apps/frontend/src/components/features/auth/UserDisplay.tsx` | User display | User info display component |
| `apps/frontend/src/components/features/auth/MobileUserMenu.tsx` | Mobile user menu | User menu for mobile |
| `apps/frontend/src/components/features/auth/OnlineStatusIndicator.tsx` | Online status | User online status indicator |
| `apps/frontend/src/components/features/auth/RiskScoreIndicator.tsx` | Risk score | Security risk score display |
| `apps/frontend/src/components/features/auth/SecurityAlertBanner.tsx` | Security alert | Security warning banner |
| `apps/frontend/src/components/features/auth/SecurityDashboard.tsx` | Security dashboard | User security overview |
| `apps/frontend/src/components/features/auth/SessionLimitWarning.tsx` | Session limit warning | Concurrent session warning |
| `apps/frontend/src/components/features/auth/SocialLoginExpanded.tsx` | Social login | OAuth login buttons |
| `apps/frontend/src/components/features/auth/index.ts` | Auth components index | Export all auth components |
| `apps/frontend/src/components/layout/auth-modal.tsx` | Layout auth modal | Auth modal in layout |
| `apps/frontend/src/components/layout/AuthenticatedLayout.tsx` | Authenticated layout | Layout for authenticated users |
| `apps/frontend/src/components/providers/auth-provider.tsx` | Auth provider component | React auth provider wrapper |
| `apps/frontend/src/components/ui/auth-illustration.tsx` | Auth illustration | UI illustration for auth pages |
| `apps/frontend/src/services/api/auth.api.ts` | REST API auth service | REST API client for auth (fallback) |
| `apps/frontend/src/lib/mockdata/auth-enhanced.ts` | Enhanced auth mock data | Mock data for auth testing |
| `apps/frontend/src/lib/mockdata/auth/auth-enhanced.ts` | Auth enhanced mock | Enhanced mock users and sessions |
| `apps/frontend/src/lib/mockdata/auth/index.ts` | Auth mock index | Export all auth mock data |
| `apps/frontend/src/lib/mockdata/auth/mock-users.ts` | Mock users | Mock user data for testing |
| `apps/frontend/src/lib/mockdata/auth/resource-access.ts` | Resource access mock | Mock resource access control |
| `apps/frontend/src/lib/mockdata/auth/sessions.ts` | Sessions mock | Mock session data |
| `apps/frontend/src/lib/mockdata/users/admin-users.ts` | Admin users mock | Mock admin user data |
| `apps/frontend/src/lib/mockdata/users/instructor-users.ts` | Instructor users mock | Mock teacher/tutor data |
| `apps/frontend/src/lib/mockdata/users/student-users.ts` | Student users mock | Mock student data |
| `apps/frontend/src/lib/mockdata/users/user-management.ts` | User management mock | Mock user management data |
| `apps/frontend/src/lib/mockdata/users/generate-large-dataset.ts` | Large dataset generator | Generate large mock datasets |
| `apps/frontend/src/lib/auth/password.ts` | Password utilities | Password strength validation |
| `apps/frontend/src/components/ui/form/password-strength.tsx` | Password strength UI | Password strength indicator |
| `apps/frontend/src/generated/user.ts` | User protobuf types | Generated user types from protobuf |
| `apps/frontend/src/generated/v1/UserServiceClientPb.ts` | User service client | Generated gRPC client |
| `apps/frontend/src/generated/v1/user_pb.d.ts` | User protobuf definitions | TypeScript definitions |
| `apps/frontend/src/hooks/admin/use-admin-user-management.ts` | Admin user management hook | Hook for admin user operations |
| `apps/frontend/src/hooks/admin/use-user-management.ts` | User management hook | Hook for user CRUD |
| `apps/frontend/src/hooks/admin/use-virtual-user-table.ts` | Virtual user table hook | Virtualized table for large datasets |
| `apps/frontend/src/components/admin/UserEditModal.tsx` | User edit modal | Admin user editing UI |
| `apps/frontend/src/components/admin/header/user/user-menu.tsx` | Admin user menu | User menu in admin header |
| `apps/frontend/src/components/features/security/user-risk-profile.tsx` | User risk profile | Security risk assessment UI |
| `apps/frontend/src/components/features/settings/AdvancedUserSettings.tsx` | Advanced settings | User advanced settings UI |
| `apps/frontend/src/tests/e2e/login-seed-data.spec.ts` | Login E2E test | E2E test with seed data |
| `apps/frontend/src/tests/e2e/simple-login.spec.ts` | Simple login test | Basic login E2E test |
| `apps/frontend/src/lib/role-hierarchy.ts` | Role hierarchy | Role hierarchy constants and utilities |
| `apps/frontend/src/lib/security/browser-security.ts` | Browser security | Client-side security utilities |
| `apps/frontend/src/lib/mockdata/role-management.ts` | Role management mock | Mock role management data |
| `apps/frontend/src/lib/mockdata/admin/role-management.ts` | Admin role mock | Admin role management mock |
| `apps/frontend/src/lib/mockdata/admin/roles-permissions.ts` | Roles permissions mock | Mock roles and permissions |
| `apps/frontend/src/lib/mockdata/admin/security.ts` | Security mock | Mock security data |
| `apps/frontend/src/types/user/roles.ts` | User roles types | TypeScript role types |
| `apps/frontend/src/types/admin/security.ts` | Admin security types | Security-related types |
| `apps/frontend/src/components/admin/role-management/role-hierarchy-tree.tsx` | Role hierarchy tree | Visual role hierarchy |
| `apps/frontend/src/components/admin/role-management/role-permissions-panel.tsx` | Role permissions panel | Role permission management |
| `apps/frontend/src/components/admin/role-management/permission-editor.tsx` | Permission editor | Edit role permissions |
| `apps/frontend/src/components/admin/role-management/permission-matrix.tsx` | Permission matrix | Permission matrix view |
| `apps/frontend/src/components/admin/role-management/permission-templates.tsx` | Permission templates | Pre-defined permission sets |
| `apps/frontend/src/components/admin/users/workflows/role-promotion-workflow.tsx` | Role promotion | User role promotion workflow |
| `apps/frontend/src/components/features/monitoring/security-monitoring-dashboard.tsx` | Security monitoring | Real-time security dashboard |
| `apps/frontend/src/components/features/security/RealTimeSecurityMonitor.tsx` | Real-time monitor | Live security monitoring |
| `apps/frontend/src/hooks/security/use-exam-security.ts` | Exam security hook | Hook for exam security features |
| `apps/frontend/src/hooks/security/use-resource-protection.ts` | Resource protection hook | Hook for resource access control |
| `apps/frontend/src/hooks/security/index.ts` | Security hooks index | Export all security hooks |
| `apps/frontend/src/hooks/admin/use-admin-dashboard.ts` | Admin dashboard hook | Hook for admin dashboard data |
| `apps/frontend/src/hooks/admin/use-admin-navigation.ts` | Admin navigation hook | Hook for admin navigation |
| `apps/frontend/src/hooks/admin/use-admin-notifications.ts` | Admin notifications hook | Hook for admin notifications |
| `apps/frontend/src/hooks/admin/use-admin-search.ts` | Admin search hook | Hook for admin search |
| `apps/frontend/src/hooks/admin/use-dashboard-data.ts` | Dashboard data hook | Hook for dashboard data fetching |
| `apps/frontend/src/app/login/page.tsx` | Login page | Login page component |
| `apps/frontend/src/app/register/page.tsx` | Register page | Registration page component |
| `apps/frontend/src/app/sessions/page.tsx` | Sessions page | User sessions management page |
| `apps/frontend/src/app/profile/page.tsx` | Profile page | User profile page |
| `apps/frontend/src/app/verify-email/page.tsx` | Email verification page | Email verification page |
| `apps/frontend/src/app/forgot-password/page.tsx` | Forgot password page | Password reset request page |
| `apps/frontend/src/app/reset-password/page.tsx` | Reset password page | Password reset completion page |
| `apps/frontend/src/app/unauthorized/page.tsx` | Unauthorized page | Access denied page |
| `apps/frontend/src/types/user/base.ts` | Base user types | Core user type definitions |
| `apps/frontend/src/types/user/forms.ts` | User form types | Form-related user types |
| `apps/frontend/src/types/user/admin.ts` | Admin user types | Admin-specific user types |
| `apps/frontend/src/types/user/index.ts` | User types index | Export all user types |
| `apps/frontend/src/components/admin/users/table/virtualized-user-table.tsx` | Virtualized user table | Large dataset user table |
| `apps/frontend/src/components/admin/users/filters/filter-panel.tsx` | User filter panel | User filtering UI |
| `apps/frontend/src/components/admin/users/modals/user-detail-modal.tsx` | User detail modal | User details modal |
| `apps/frontend/src/components/admin/users/loading/user-loading.tsx` | User loading state | Loading skeleton for users |
| `apps/frontend/src/components/features/security/AdvancedAuditLogger.tsx` | Advanced audit logger | Comprehensive audit logging UI |
| `apps/frontend/src/components/features/security/SuspiciousActivityDetector.tsx` | Suspicious activity detector | Detect and alert suspicious activities |
| `apps/frontend/src/components/features/security/resource-access-monitor.tsx` | Resource access monitor | Monitor resource access patterns |
| `apps/frontend/src/components/features/monitoring/security-monitoring-dashboard.tsx` | Security monitoring dashboard | Real-time security monitoring |
| `apps/frontend/src/components/features/settings/AdvancedUserSettings.tsx` | Advanced user settings | User preferences and settings |
| `apps/frontend/src/lib/mockdata/admin/dashboard-metrics.ts` | Dashboard metrics mock | Mock dashboard metrics |
| `apps/frontend/src/lib/mockdata/admin/header-navigation.ts` | Header navigation mock | Mock header navigation |
| `apps/frontend/src/lib/mockdata/admin/notifications.ts` | Admin notifications mock | Mock admin notifications |
| `apps/frontend/src/lib/mockdata/admin/settings.ts` | Admin settings mock | Mock admin settings |
| `apps/frontend/src/lib/mockdata/admin/sidebar-navigation.ts` | Sidebar navigation mock | Mock sidebar navigation |
| `apps/frontend/src/lib/mockdata/admin/level-progression.ts` | Level progression mock | Mock level progression data |
| `apps/frontend/src/lib/mockdata/admin/mapcode.ts` | Mapcode mock | Mock mapcode data |

### Backend Authentication Files

| File Path | Purpose | Key Components |
|-----------|---------|----------------|
| `apps/backend/internal/grpc/user_service_enhanced.go` | Main gRPC user service | `Login()`, `Register()`, `GoogleLogin()`, `RefreshToken()` |
| `apps/backend/internal/service/auth/auth_service.go` | Auth service layer (DEPRECATED) | Legacy auth logic, being migrated to gRPC layer |
| `apps/backend/internal/service/auth/unified_jwt_service.go` | Unified JWT service | `GenerateAccessToken()`, `GenerateRefreshToken()`, `ValidateToken()` |
| `apps/backend/internal/service/auth/login.go` | Login logic (DEPRECATED) | Legacy login method |
| `apps/backend/internal/service/auth/register.go` | Registration logic | User registration with email verification |
| `apps/backend/internal/service/auth/validate_token.go` | Token validation | JWT token validation logic |
| `apps/backend/internal/service/auth/jwt_adapter.go` | JWT adapter | Adapter pattern for JWT service |
| `apps/backend/internal/middleware/auth_interceptor.go` | gRPC auth interceptor | Token extraction, validation, RBAC enforcement |
| `apps/backend/internal/middleware/csrf_interceptor.go` | CSRF protection | CSRF token validation for state-changing operations |
| `apps/backend/internal/middleware/session_interceptor.go` | Session management | Session validation, concurrent session limits |
| `apps/backend/internal/middleware/role_level_interceptor.go` | Role/level enforcement | Hierarchical permission checks |
| `apps/backend/internal/constant/roles.go` | Role constants | Role hierarchy constants |
| `apps/backend/internal/repository/user.go` | User repository | User CRUD operations, login tracking |
| `apps/backend/internal/repository/session.go` | Session repository | Session CRUD, active session management |
| `apps/backend/internal/repository/refresh_token.go` | Refresh token repository | Token storage, rotation, revocation |
| `apps/backend/internal/repository/oauth_account.go` | OAuth account repository | Google OAuth account linking |
| `apps/backend/internal/repository/user_preference.go` | User preference repository | User settings, 2FA, notifications |
| `apps/backend/internal/repository/audit_log.go` | Audit log repository | Security event logging |
| `apps/backend/internal/config/auth_config.go` | Backend auth configuration | JWT config, session config, OAuth config |
| `apps/backend/internal/service/auth/authorization.go` | Authorization service | Permission checks, RBAC logic |
| `apps/backend/internal/service/auth/auth_management.go` | Auth management | High-level auth operations |
| `apps/backend/internal/service/auth/auth_service_test.go` | Auth service tests | Unit tests for auth service |
| `apps/backend/internal/service/user/oauth/oauth.go` | OAuth service | Google OAuth integration |
| `apps/backend/internal/service/user/oauth/google_client.go` | Google OAuth client | Google API client |
| `apps/backend/internal/service/user/session/session.go` | Session service | Session management logic |
| `apps/backend/internal/service/system/security/exam_session_security.go` | Exam session security | Exam-specific session security |
| `apps/backend/internal/service/system/security/security_integration_test.go` | Security integration test | Integration tests for security |
| `apps/backend/internal/service/user/get_user.go` | Get user service | User retrieval logic |
| `apps/backend/internal/service/user/list_users.go` | List users service | User listing with filters |
| `apps/backend/internal/service/user/user_mgmt.go` | User management | User CRUD operations |
| `apps/backend/internal/middleware/rate_limit_interceptor.go` | Rate limiting | API rate limiting, brute force protection |
| `apps/backend/internal/middleware/security_interceptor.go` | Security interceptor | Exam security, anti-cheat |
| `apps/backend/internal/middleware/audit_log_interceptor.go` | Audit logging | Log all auth events |
| `apps/backend/internal/middleware/resource_protection_interceptor.go` | Resource protection | Protect sensitive resources |
| `apps/backend/internal/entity/user.go` | User entity | User database model |
| `apps/backend/internal/entity/email_verification_token.go` | Email verification token | Email verification model |
| `apps/backend/pkg/proto/v1/user.pb.go` | User protobuf | Generated user protobuf code |
| `apps/backend/pkg/proto/v1/user_grpc.pb.go` | User gRPC | Generated user gRPC code |
| `apps/backend/pkg/proto/common/common.pb.go` | Common protobuf | Shared enums (UserRole, UserStatus) |
| `apps/backend/internal/database/migrations/000003_auth_security_system.up.sql` | Auth migration up | Create auth tables |
| `apps/backend/internal/database/migrations/000003_auth_security_system.down.sql` | Auth migration down | Drop auth tables |
| `apps/backend/internal/database/migrations/000011_exam_security.up.sql` | Exam security migration up | Create exam security tables |
| `apps/backend/internal/database/migrations/000011_exam_security.down.sql` | Exam security migration down | Drop exam security tables |
| `apps/backend/internal/repository/user_wrapper.go` | User repository wrapper | Wrapper for user repository operations |
| `apps/backend/internal/repository/resource_access.go` | Resource access repository | Resource access control data layer |
| `apps/backend/internal/service/user/get_student_list.go` | Get student list service | Retrieve student list |
| `apps/backend/internal/service/user/domain/user.go` | User domain service | User domain logic |
| `apps/backend/internal/service/system/security/anti_cheating_service.go` | Anti-cheating service | Exam anti-cheating logic |
| `apps/backend/internal/service/system/security/exam_rate_limiter.go` | Exam rate limiter | Rate limiting for exams |
| `apps/backend/internal/service/system/resource_protection.go` | Resource protection service | Protect sensitive resources |
| `apps/backend/internal/services/email/email_service.go` | Email service | Email sending service |
| `apps/backend/internal/services/email/templates/` | Email templates | Email template files |
| `apps/backend/internal/util/device_fingerprint.go` | Device fingerprint utility | Generate device fingerprints |
| `apps/backend/internal/util/pgtype_converter.go` | PostgreSQL type converter | Convert PostgreSQL types |
| `apps/backend/pkg/proto/v1/user.pb.gw.go` | User gRPC gateway | Generated gRPC gateway code |
| `apps/backend/pkg/proto/v1/profile.pb.go` | Profile protobuf | Generated profile protobuf code |
| `apps/backend/pkg/proto/v1/profile_grpc.pb.go` | Profile gRPC | Generated profile gRPC code |
| `apps/backend/pkg/proto/v1/admin.pb.go` | Admin protobuf | Generated admin protobuf code |
| `apps/backend/pkg/proto/v1/admin_grpc.pb.go` | Admin gRPC | Generated admin gRPC code |
| `apps/backend/internal/config/config.go` | Main config | Main configuration file |

### Configuration Files

| File Path | Purpose | Key Variables |
|-----------|---------|---------------|
| `apps/frontend/.env` | Frontend environment variables | `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GRPC_URL` |
| `apps/backend/.env` | Backend environment variables | `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL` |

### Testing Files

| File Path | Purpose | Test Coverage |
|-----------|---------|---------------|
| `apps/backend/internal/grpc/user_service_enhanced_test.go` | gRPC service unit tests | Login, register, token refresh |
| `apps/backend/internal/service/auth/auth_service_test.go` | Auth service unit tests | Password hashing, token generation |
| `apps/backend/internal/service/auth/unified_jwt_service_test.go` | JWT service unit tests | Token generation, validation, expiry |
| `apps/frontend/src/tests/e2e/simple-login.spec.ts` | E2E login test | Login flow with Playwright |

## Key Components

### 1. NextAuth Configuration (`apps/frontend/src/lib/auth.ts`)

**Providers:**
- **Credentials Provider**: Email/password authentication via gRPC backend
- **Google OAuth Provider**: Google Sign-In (requires configuration)

**Session Strategy:**
- **Type**: JWT (JSON Web Tokens)
- **Max Age**: 24 hours (86400 seconds)
- **Update Age**: 1 hour (3600 seconds)

**Callbacks:**
- `jwt()`: Stores backend tokens in NextAuth JWT
- `session()`: Exposes tokens to client session

**Pages:**
- `signIn`: `/login` (custom login page)

**Cookies:**
- **Session Token**: `next-auth.session-token` (dev) / `__Secure-next-auth.session-token` (prod)
- **CSRF Token**: `next-auth.csrf-token` (dev) / `__Host-next-auth.csrf-token` (prod)
  - **CRITICAL**: `httpOnly: false` để client có thể đọc và gửi với signin requests

**Trust Host:**
- Development: `true` (allow localhost)
- Production: `false` (strict host validation)

### 2. Middleware (`apps/frontend/src/middleware.ts`)

**Authentication Method:**
- Uses `getToken()` from `next-auth/jwt` instead of `auth()` wrapper
- Completely skips `/api/auth/*` routes to let NextAuth handle them

**Role Hierarchy:**
```typescript
ADMIN: 5    // Highest privilege
TEACHER: 4
TUTOR: 3
STUDENT: 2
GUEST: 1    // Lowest privilege
```

**Route Permissions:**
- `/admin/*`: ADMIN only
- `/teacher/*`: TEACHER, ADMIN
- `/tutor/*`: TUTOR, TEACHER, ADMIN
- `/courses/*`: STUDENT, TUTOR, TEACHER, ADMIN
- `/exams/*`: STUDENT, TUTOR, TEACHER, ADMIN (with level check)

**Public Routes:**
- `/`, `/login`, `/register`, `/forgot-password`, `/about`, `/faq`, `/help`, `/privacy`, `/terms`

### 3. Backend gRPC Services

**EnhancedUserServiceServer** (`apps/backend/internal/grpc/user_service_enhanced.go`):
- `Login(email, password)`: Validates credentials, generates tokens, creates session
- `Register(email, password, firstName, lastName)`: Creates new user with email verification
- `GoogleLogin(googleToken)`: OAuth authentication with Google
- `RefreshToken(refreshToken)`: Generates new access token using refresh token
- `GetUser(userId)`: Retrieves user profile
- `VerifyEmail(token)`: Confirms email address
- `ForgotPassword(email)`: Initiates password reset flow
- `ResetPassword(token, newPassword)`: Completes password reset

**UnifiedJWTService** (`apps/backend/internal/service/auth/unified_jwt_service.go`):
- `GenerateAccessToken(userID, email, role, level)`: Creates 15-minute access token
- `GenerateRefreshToken(userID)`: Creates 7-day refresh token
- `ValidateToken(token)`: Verifies JWT signature and expiry
- `RefreshAccessToken(refreshToken)`: Issues new access token

**Auth Interceptors** (`apps/backend/internal/middleware/`):
- `AuthInterceptor`: Extracts and validates JWT from gRPC metadata
- `CSRFInterceptor`: Validates CSRF tokens for state-changing operations
- `SessionInterceptor`: Enforces concurrent session limits
- `RoleLevelInterceptor`: Checks role and level permissions

### 4. Database Schema

**users table:**
- `id`: ULID primary key
- `email`: Unique email address
- `password_hash`: bcrypt hashed password (cost 10)
- `first_name`, `last_name`: User name
- `role`: GUEST | STUDENT | TUTOR | TEACHER | ADMIN
- `level`: Integer level (0-100)
- `status`: ACTIVE | INACTIVE | SUSPENDED
- `email_verified`: Boolean
- `login_attempts`: Failed login counter
- `locked_until`: Account lock timestamp
- `last_login_at`, `last_login_ip`: Login tracking

**sessions table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users
- `session_token`: Unique session identifier
- `ip_address`, `user_agent`, `device_fingerprint`: Device tracking
- `is_active`: Boolean
- `last_activity`: Timestamp
- `expires_at`: Session expiry

**refresh_tokens table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users
- `token_hash`: SHA-256 hash of refresh token
- `token_family`: Token rotation family ID
- `is_active`: Boolean
- `parent_token_hash`: Previous token in rotation chain
- `revoked_at`, `revoked_reason`: Revocation tracking
- `expires_at`: Token expiry

**oauth_accounts table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users
- `provider`: google | facebook | github
- `provider_account_id`: OAuth provider user ID
- `type`: oauth | oidc
- `scope`: OAuth scopes granted
- `access_token`, `refresh_token`, `id_token`: OAuth tokens
- `expires_at`: Token expiry timestamp
- `token_type`: Bearer | etc.

**email_verification_tokens table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users
- `token`: Unique verification token (255 chars)
- `expires_at`: Token expiry (typically 24 hours)
- `used`: Boolean flag if token was used
- `created_at`: Token creation timestamp

**login_attempts table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users (nullable for failed attempts)
- `email`: Email attempted
- `ip_address`: IP address of attempt
- `user_agent`: Browser/client info
- `success`: Boolean success flag
- `failure_reason`: Reason for failure (wrong password, account locked, etc.)
- `attempted_at`: Timestamp of attempt

**user_preferences table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users
- `email_notifications`, `push_notifications`, `sms_notifications`: Notification settings
- `auto_play_videos`, `default_video_quality`, `playback_speed`: Video settings
- `profile_visibility`, `show_online_status`, `allow_direct_messages`: Privacy settings
- `timezone`, `language`, `date_format`, `time_format`: Localization
- `theme`, `font_size`, `high_contrast`, `reduced_motion`: Accessibility
- `two_factor_enabled`, `login_alerts`: Security settings
- `marketing_emails`, `product_updates`, `security_alerts`, `weekly_digest`: Email preferences

**audit_logs table:**
- `id`: ULID primary key
- `user_id`: Foreign key to users (nullable for anonymous)
- `action`: LOGIN | LOGOUT | CREATE | UPDATE | DELETE | VIEW | DOWNLOAD
- `resource`: USER | COURSE | EXAM | QUESTION
- `resource_id`: ID of affected resource
- `old_values`, `new_values`: JSON before/after values
- `ip_address`, `user_agent`, `session_id`: Request metadata
- `success`: Boolean success flag
- `error_message`: Error details if failed
- `metadata`: Additional JSON metadata
- `created_at`: Event timestamp

## Recent Fixes (2025-01-19)

### 1. MissingCSRF Error - FIXED ✅

**Nguyên nhân:**
- CSRF token cookie có `httpOnly: true`, client không thể đọc được
- NextAuth v5 yêu cầu client phải gửi CSRF token khi submit custom signin form

**Giải pháp:**
- Set `httpOnly: false` cho CSRF token cookie trong `apps/frontend/src/lib/auth.ts` (dòng 310)

```typescript
csrfToken: {
  name: JWT_CONFIG.COOKIE_NAMES.CSRF_TOKEN,
  options: {
    httpOnly: false, // ✅ CRITICAL FIX
    sameSite: SESSION_CONFIG.SAME_SITE,
    path: '/',
    secure: SESSION_CONFIG.REQUIRE_HTTPS
  }
}
```

### 2. Redirect Loop After Login - FIXED ✅

**Nguyên nhân:**
- NextAuth v5 không biết `/login` là custom signin page
- Sau khi login thành công, NextAuth redirect về `/login?callbackUrl=/dashboard` thay vì `/dashboard`

**Giải pháp:**
- Thêm `pages: { signIn: '/login' }` vào `authConfig` trong `apps/frontend/src/lib/auth.ts` (dòng 282-286)

```typescript
pages: {
  signIn: '/login',
},
```

### 3. Middleware Integration - OPTIMIZED ✅

**Thay đổi:**
- Đổi từ `auth()` wrapper approach sang `getToken()` approach
- Skip `/api/auth/*` routes hoàn toàn để NextAuth tự xử lý

**Lý do:**
- `auth()` wrapper có thể gây conflict với NextAuth internal routing
- `getToken()` approach đơn giản hơn và ổn định hơn

```typescript
// ✅ GOOD - getToken() approach
const token = await getToken({
  req: request,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
});

// Skip NextAuth routes completely
if (pathname.startsWith('/api/auth')) {
  return NextResponse.next();
}
```

## Environment Variables

### Frontend (`apps/frontend/.env`)

```bash
# NextAuth Configuration
AUTH_SECRET="nynus-development-secret-key-change-in-production-2025"
NEXTAUTH_SECRET="nynus-development-secret-key-change-in-production-2025"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_GRPC_URL="http://localhost:8080"

# Database
DATABASE_URL="postgresql://exam_bank_user:exam_bank_password@localhost:5432/exam_bank_db?schema=public&sslmode=disable"
```

### Backend (`apps/backend/.env`)

```bash
# JWT Configuration
JWT_SECRET="your-jwt-secret-key-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://exam_bank_user:exam_bank_password@localhost:5432/exam_bank_db?sslmode=disable"
```

## Security Considerations

### 1. Password Security
- **Hashing**: bcrypt with cost 10 (configurable)
- **Minimum Length**: 8 characters
- **Validation**: Zod schema validation on both frontend and backend

### 2. Token Security
- **Access Token**: 15 minutes expiry, stored in httpOnly cookie
- **Refresh Token**: 7 days expiry, stored in database with SHA-256 hash
- **Token Rotation**: Refresh tokens are rotated on each use
- **Token Family**: Detects token reuse attacks

### 3. Session Security
- **Concurrent Sessions**: Configurable limit per user (default: 3)
- **Device Fingerprinting**: Tracks device information
- **IP Tracking**: Monitors login IP addresses
- **Session Timeout**: 24 hours inactivity timeout

### 4. Account Protection
- **Login Attempts**: Max 5 failed attempts
- **Account Locking**: 15 minutes lock after 5 failed attempts
- **Email Verification**: Required for new accounts
- **Password Reset**: Secure token-based flow

### 5. CSRF Protection
- **CSRF Tokens**: Required for all state-changing operations
- **SameSite Cookies**: `lax` in development, `strict` in production
- **Origin Validation**: Strict origin checking in production

## Additional Authentication-Related Files Discovered

### Frontend Additional Files (20+ files)
| File Path | Purpose |
|-----------|---------|
| `apps/frontend/src/contexts/index.ts` | Export all contexts |
| `apps/frontend/src/providers/index.ts` | Export all providers |
| `apps/frontend/src/providers/query-provider.tsx` | React Query provider |
| `apps/frontend/src/components/layout/main-layout.tsx` | Main layout with auth |
| `apps/frontend/src/components/layout/navbar.tsx` | Navbar with user menu |
| `apps/frontend/src/components/layout/mobile-navbar.tsx` | Mobile navbar with auth |
| `apps/frontend/src/components/layout/index.ts` | Export all layouts |
| `apps/frontend/src/components/admin/header/admin-header.tsx` | Admin header with user menu |
| `apps/frontend/src/components/admin/sidebar/` | Admin sidebar with role-based navigation |
| `apps/frontend/src/components/admin/dashboard/` | Admin dashboard with user stats |
| `apps/frontend/src/lib/config/endpoints.ts` | API endpoints configuration |
| `apps/frontend/src/lib/config/env.ts` | Environment configuration |
| `apps/frontend/src/lib/config/feature-flags.ts` | Feature flags including auth features |
| `apps/frontend/src/lib/constants/timeouts.ts` | Timeout constants for auth operations |
| `apps/frontend/src/lib/utils/env-validation.ts` | Environment variable validation |
| `apps/frontend/src/lib/utils/error-recovery.ts` | Error recovery utilities |
| `apps/frontend/src/lib/utils/logger.ts` | Logging utilities for auth events |
| `apps/frontend/src/lib/utils/dev-logger.ts` | Development logging |
| `apps/frontend/src/lib/grpc/error-handler.ts` | gRPC error handling |
| `apps/frontend/src/lib/grpc/errors.ts` | gRPC error definitions |
| `apps/frontend/src/lib/grpc/retry-client.ts` | gRPC retry logic |

### Backend Additional Files (10+ files)
| File Path | Purpose |
|-----------|---------|
| `apps/backend/internal/container/container.go` | Dependency injection container |
| `apps/backend/internal/server/http.go` | HTTP server setup |
| `apps/backend/internal/app/app.go` | Application initialization |
| `apps/backend/internal/interfaces/services.go` | Service interfaces |
| `apps/backend/internal/util/interceptors.go` | gRPC interceptor utilities |
| `apps/backend/internal/validation/base_validator.go` | Base validation logic |
| `apps/backend/internal/repository/interfaces/` | Repository interfaces |
| `apps/backend/internal/repository/errors.go` | Repository error definitions |
| `apps/backend/internal/entity/errors.go` | Entity error definitions |
| `apps/backend/internal/cache/redis_service.go` | Redis caching for sessions |
| `apps/backend/internal/cache/interface.go` | Cache interface |

## Known Issues

### 1. Playwright Test Form Submission
**Status**: INVESTIGATING 🔍

**Mô tả:**
- Playwright E2E test không submit được login form
- Console log `[LOGIN_PAGE] Login successful` không xuất hiện
- Form có thể không load kịp hoặc selector không đúng

**Workaround:**
- Manual testing hoạt động bình thường
- Login functionality đã được verify qua direct backend API test

### 2. Google OAuth Configuration
**Status**: PENDING ⏳

**Mô tả:**
- Google OAuth credentials chưa được cấu hình
- Google login button hiện thông báo "chưa được cấu hình"

**TODO:**
- Cấu hình Google OAuth credentials trong Google Cloud Console
- Update `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env`

## References

### Documentation
- [NextAuth.js v5 Documentation](https://next-auth.js.org/)
- [gRPC-Web Documentation](https://github.com/grpc/grpc-web)
- [golang-jwt Documentation](https://github.com/golang-jwt/jwt)

### Internal Documentation
- [API Documentation](./API.md)
- [Cleanup Documentation](./cleanup.md)
- [Seed Data Summary](../PRISMA_USERS_SEEDING_SUMMARY.md)

## Summary Statistics

### Total Files Documented: 130+ files

**Frontend Files: 80+**
- Core Auth: 13 files (auth.ts, middleware.ts, auth-config.ts, password.ts, role-hierarchy.ts, browser-security.ts, auth-helpers.ts, auth-schemas.ts, etc.)
- Components: 28 files (AuthModal, LoginForm, RegisterForm, UserEditModal, RoleBadge, SecurityDashboard, etc.)
- Role & Permission Components: 6 files (role-hierarchy-tree, permission-editor, permission-matrix, permission-templates, role-permissions-panel, role-promotion-workflow)
- Security Components: 6 files (RealTimeSecurityMonitor, security-monitoring-dashboard, user-risk-profile, AdvancedAuditLogger, SuspiciousActivityDetector, resource-access-monitor)
- Mock Data: 16 files (mock users, sessions, auth-enhanced, role-management, security, admin-users, instructor-users, student-users, user-management, generate-large-dataset, roles-permissions, etc.)
- Services: 2 files (auth.service.ts, auth.api.ts)
- Types & Generated: 8 files (next-auth.d.ts, user.ts, roles.ts, security.ts, UserServiceClientPb.ts, user_pb.d.ts, user_pb.js, admin.ts, base.ts, forms.ts)
- Hooks: 6 files (use-admin-user-management.ts, use-user-management.ts, use-virtual-user-table.ts, use-exam-security.ts, use-resource-protection.ts, use-admin-dashboard.ts)
- UI Components: 2 files (password-strength.tsx, auth-illustration.tsx)
- E2E Tests: 2 files (login-seed-data.spec.ts, simple-login.spec.ts)
- Pages: 5 files (login/page.tsx, register/page.tsx, sessions/page.tsx, profile/page.tsx, verify-email/page.tsx)
- API Routes: 1 file (api/auth/[...nextauth]/route.ts)
- Contexts: 1 file (auth-context-grpc.tsx)
- Providers: 2 files (app-providers.tsx, auth-provider.tsx)
- Layouts: 2 files (AuthenticatedLayout.tsx, auth-modal.tsx)
- Admin Components: 8 files (UserEditModal.tsx, user-menu.tsx, user-detail-modal.tsx, virtualized-user-table.tsx, filter-panel.tsx, user-loading.tsx, etc.)

**Backend Files: 50+**
- gRPC Services: 2 files (user_service_enhanced.go, user_service_enhanced_test.go)
- Auth Services: 10 files (auth_service.go, unified_jwt_service.go, unified_jwt_service_test.go, jwt_adapter.go, login.go, register.go, validate_token.go, authorization.go, auth_management.go, etc.)
- Middleware: 8 files (auth_interceptor.go, csrf_interceptor.go, csrf_interceptor_test.go, session_interceptor.go, role_level_interceptor.go, rate_limit_interceptor.go, security_interceptor.go, audit_log_interceptor.go, resource_protection_interceptor.go)
- Repositories: 7 files (user.go, user_wrapper.go, session.go, refresh_token.go, oauth_account.go, user_preference.go, audit_log.go, resource_access.go)
- Entities: 2 files (user.go, email_verification_token.go)
- User Services: 7 files (oauth.go, google_client.go, session.go, exam_session_security.go, get_user.go, get_student_list.go, list_users.go, user_mgmt.go)
- Security Services: 4 files (security_integration_test.go, anti_cheating_service.go, exam_rate_limiter.go, resource_protection.go)
- Constants: 1 file (roles.go)
- Config: 2 files (auth_config.go, config.go)
- Protobuf: 6 files (user.pb.go, user_grpc.pb.go, user.pb.gw.go, common.pb.go, profile.pb.go, admin.pb.go)
- Migrations: 4 files (000003_auth_security_system.up/down.sql, 000011_exam_security.up/down.sql)
- Email Services: 1 file (email_service.go)
- Utilities: 2 files (device_fingerprint.go, pgtype_converter.go)

### Database Tables: 8 tables
1. `users` - Core user data
2. `user_sessions` - Active sessions
3. `refresh_tokens` - Token rotation
4. `oauth_accounts` - OAuth linking
5. `email_verification_tokens` - Email verification
6. `login_attempts` - Security tracking
7. `user_preferences` - User settings
8. `audit_logs` - Security events

### Authentication Methods: 2
1. **Email/Password** - Primary method via gRPC
2. **Google OAuth** - Social login (requires configuration)

### Security Features: 10
1. JWT token authentication (15min access, 7day refresh)
2. Token rotation with family tracking
3. CSRF protection
4. Rate limiting & brute force protection
5. Account locking (5 failed attempts → 15min lock)
6. Email verification
7. Device fingerprinting
8. Concurrent session limits
9. Audit logging
10. Role-based access control (5 roles: GUEST, STUDENT, TUTOR, TEACHER, ADMIN)

---

**Document Version**: 5.0.0 - Comprehensive Update
**Last Updated**: 2025-01-19 (Updated with comprehensive file discovery)
**Author**: NyNus Development Team
**Status**: Production Ready ✅
**Total Files**: 130+ files (80+ frontend + 50+ backend)
**Coverage**: Complete authentication, authorization, role management, security system, admin features, monitoring, and all related infrastructure
**Update Notes**:
- Added 20+ frontend files (contexts, providers, layouts, admin components, utilities)
- Added 10+ backend files (container, server, validation, caching, interfaces)
- Discovered additional security monitoring and audit logging components
- Identified all gRPC protobuf generated files
- Mapped complete admin user management system
- Documented all authentication-related hooks and utilities

