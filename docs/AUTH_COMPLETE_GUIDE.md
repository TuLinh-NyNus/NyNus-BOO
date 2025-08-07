# 🔐 User & Auth System - Complete Guide

## 📋 Tổng Quan Dự Án
- **Dự án**: NyNus - User & Auth System
- **Kiến trúc**: Monorepo với Turbo
- **Backend**: NestJS + PostgreSQL + Prisma
- **Frontend**: Next.js 15 + Shadcn UI + Zustand
- **Auth Strategy**: Gmail OAuth Primary + Simple Fallback
- **Mục tiêu**: Bảo vệ tài nguyên học liệu NyNus, ngăn chặn chia sẻ tài khoản
- **Thời gian ước tính**: 13-18 giờ (synchronized với Checklist Overview.md)
- **Sessions đồng thời**: 3 thiết bị (Phone + Laptop + Tablet)
- **Chi phí**: 0 VNĐ (không cần AI API, chỉ dùng logic đơn giản)

## 🎯 **Triết Lý Thiết Kế**

### **✅ Đơn Giản Nhưng Hiệu Quả**
- **Gmail OAuth Primary**: 1-click login, user-friendly
- **Logic đơn giản**: Không cần AI, không cần API bên ngoài
- **3 Sessions**: Cân bằng giữa UX và security
- **Resource Protection**: Focus vào bảo vệ tài nguyên học liệu

### **✅ Quy Tắc Vàng**
1. **User Experience First**: Đăng nhập dễ dàng, sử dụng thoải mái
2. **Security by Design**: Bảo vệ tài nguyên từ đầu
3. **Simple Logic**: Dễ maintain, ít bugs
4. **Cost Effective**: Không tốn tiền cho external services

---

## 🗄️ **Database Schema Architecture**

### **Core Schema Requirements**

#### **1. Enhanced User Model**
```prisma
model User {
  // ===== CORE REQUIRED FIELDS (MVP) =====
  id          String      @id @default(cuid())        // REQUIRED - Primary key
  email       String      @unique                      // REQUIRED - Login identifier
  role        UserRole    @default(STUDENT)            // REQUIRED - Authorization
  status      UserStatus  @default(ACTIVE)            // REQUIRED - Account control
  emailVerified Boolean   @default(false)             // REQUIRED - Security
  createdAt   DateTime    @default(now())             // REQUIRED - Audit trail
  updatedAt   DateTime    @updatedAt                  // REQUIRED - Audit trail

  // ===== AUTHENTICATION FIELDS (IMPORTANT) =====
  googleId    String?     @unique                     // IMPORTANT - OAuth primary
  password    String?                                 // IMPORTANT - Fallback only

  // ===== CORE BUSINESS LOGIC (IMPORTANT) =====
  level       Int?                                    // IMPORTANT - Hierarchy (1-9)
  maxConcurrentSessions Int @default(3)               // IMPORTANT - Anti-sharing

  // ===== SECURITY TRACKING (IMPORTANT) =====
  lastLoginAt      DateTime?                          // IMPORTANT - Security monitoring
  lastLoginIp      String?                            // IMPORTANT - Suspicious detection
  loginAttempts    Int       @default(0)              // IMPORTANT - Brute force protection
  lockedUntil      DateTime?                          // IMPORTANT - Account locking

  // ===== PROFILE INFORMATION (NICE-TO-HAVE) =====
  username    String?     @unique                     // OPTIONAL - Display name
  firstName   String?                                 // OPTIONAL - From Google/manual
  lastName    String?                                 // OPTIONAL - From Google/manual
  avatar      String?                                 // OPTIONAL - From Google/upload
  bio         String?                                 // OPTIONAL - User description
  phone       String?                                 // OPTIONAL - Contact info
  address     String?                                 // OPTIONAL - Simple address
  school      String?                                 // OPTIONAL - Educational background
  dateOfBirth DateTime?                               // OPTIONAL - Age verification
  gender      String?                                 // OPTIONAL - Analytics

  // ===== RELATIONS (SYSTEM MANAGED) =====
  sessions         UserSession[]                      // System managed
  oauthAccounts    OAuthAccount[]                     // System managed
  resourceAccess   ResourceAccess[]                   // System managed
  enrollments      CourseEnrollment[]                 // Business logic
  examResults      ExamResult[]                       // Business logic
  createdQuestions Question[]                         // Content creation
  createdCourses   Course[]                           // Content creation
  notifications    Notification[]                     // System notifications
  preferences      UserPreferences?                   // User settings
  auditLogs        AuditLog[]                         // Compliance tracking

  // ===== PERFORMANCE INDEXES =====
  @@index([email])                                    // CRITICAL - Login queries
  @@index([googleId])                                 // CRITICAL - OAuth queries
  @@index([role, level])                              // IMPORTANT - Permission queries
  @@index([status])                                   // IMPORTANT - Active user queries
  @@index([username])                                 // NICE-TO-HAVE - Search queries
  @@map("users")
}
```

#### **2. OAuth Account Support**
```prisma
model OAuthAccount {
  id           String  @id @default(cuid())
  userId       String
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Provider Information
  provider     String  // google, facebook, github, v.v.
  providerAccountId String // ID người dùng Google

  // OAuth Token Management
  type         String  @default("oauth") // oauth, oidc
  scope        String?
  accessToken  String? // Token truy cập Google
  refreshToken String? // Token làm mới Google
  idToken      String? // Token ID Google
  expiresAt    Int?    // Thời gian hết hạn token
  tokenType    String? // Bearer

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@index([provider])
  @@map("oauth_accounts")
}
```

#### **3. Session Management System - Anti-Sharing**
```prisma
model UserSession {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Session Identification
  sessionToken String   @unique
  ipAddress    String
  userAgent    String?

  // Device Fingerprinting (Browser + OS hash)
  deviceFingerprint String?
  location         String? // Thành phố, Quốc gia từ IP

  // Session Status & Control
  isActive     Boolean  @default(true)
  lastActivity DateTime @default(now())
  expiresAt    DateTime

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([sessionToken])
  @@index([isActive])
  @@index([expiresAt])
  @@map("user_sessions")
}
```

#### **4. Resource Access Tracking - Anti-Piracy**
```prisma
model ResourceAccess {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Resource Information
  resourceType String   // COURSE, LESSON, VIDEO, PDF, EXAM
  resourceId   String   // ID của tài nguyên được truy cập

  // Access Details
  action       String   // VIEW, DOWNLOAD, STREAM, START_EXAM
  ipAddress    String
  userAgent    String?
  sessionToken String?  // Liên kết đến phiên

  // Simple Security - Logic cơ bản, không cần AI
  isValidAccess Boolean @default(true) // Đánh dấu truy cập đáng nghi
  riskScore     Int     @default(0)    // Điểm rủi ro 0-100 (tính toán đơn giản)

  // Additional Data
  duration     Int?     // Thời gian truy cập (giây)
  metadata     Json?    // Dữ liệu bổ sung (tùy chọn)

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([resourceType, resourceId])
  @@index([createdAt])
  @@index([isValidAccess])
  @@index([riskScore])
  @@map("resource_access")
}
```

#### **5. Enhanced Course Enrollment - Access Control**
```prisma
model CourseEnrollment {
  id          String              @id @default(cuid())

  // Relations
  userId      String
  user        User                @relation(fields: [userId], references: [id])
  courseId    String
  course      Course              @relation(fields: [courseId], references: [id])

  // Access Control System
  status      EnrollmentStatus    @default(ACTIVE)
  accessLevel AccessLevel         @default(BASIC) // BASIC, PREMIUM, FULL

  // Resource Limits - Anti-Piracy Protection
  maxDownloads     Int?            // Giới hạn tải xuống mỗi đăng ký
  currentDownloads Int @default(0) // Theo dõi tải xuống hiện tại
  maxStreams       Int?            // Giới hạn stream đồng thời

  // Time-based Access Control
  expiresAt        DateTime?       // Hết hạn truy cập khóa học

  // Progress Tracking
  progress         Int @default(0) // Phần trăm 0-100
  completedAt      DateTime?
  lastAccessedAt   DateTime?       // Theo dõi truy cập cuối

  // Timestamps
  enrolledAt  DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([status])
  @@index([expiresAt])
  @@index([lastAccessedAt])
  @@map("course_enrollments")
}
```

#### **6. Notification System**
```prisma
model Notification {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Notification Content
  type        NotificationType                      // SECURITY, COURSE, SYSTEM
  title       String
  message     String
  data        Json?                                 // Additional payload

  // Status Tracking
  isRead      Boolean   @default(false)
  readAt      DateTime?

  // Lifecycle
  createdAt   DateTime  @default(now())
  expiresAt   DateTime?                             // Auto-delete after expiry

  @@index([userId, isRead])                         // Unread notifications query
  @@index([createdAt])                              // Recent notifications
  @@index([expiresAt])                              // Cleanup expired notifications
  @@map("notifications")
}
```

#### **7. User Preferences System**
```prisma
model UserPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // ===== NOTIFICATION PREFERENCES =====
  emailNotifications    Boolean @default(true)      // Email alerts
  pushNotifications     Boolean @default(true)      // Mobile push
  smsNotifications      Boolean @default(false)     // SMS alerts

  // ===== LEARNING PREFERENCES =====
  autoPlayVideos        Boolean @default(true)      // Auto-play next video
  defaultVideoQuality   String  @default("720p")    // 480p, 720p, 1080p
  playbackSpeed         Float   @default(1.0)       // Video playback speed

  // ===== PRIVACY SETTINGS =====
  profileVisibility     String  @default("PUBLIC")  // PUBLIC, FRIENDS, PRIVATE
  showOnlineStatus      Boolean @default(true)      // Show online indicator
  allowDirectMessages   Boolean @default(true)      // Allow DMs from others

  // ===== LOCALIZATION =====
  timezone              String  @default("Asia/Ho_Chi_Minh")  // User timezone
  language              String  @default("vi")                // UI language
  dateFormat            String  @default("DD/MM/YYYY")        // Date display format

  updatedAt            DateTime @updatedAt

  @@map("user_preferences")
}
```

#### **8. Audit Log System - Compliance**
```prisma
model AuditLog {
  id          String    @id @default(cuid())
  userId      String?                               // Nullable for system actions
  user        User?     @relation(fields: [userId], references: [id])

  // Action Information
  action      String                                // LOGIN, LOGOUT, UPDATE_PROFILE
  resource    String?                               // USER, COURSE, ENROLLMENT
  resourceId  String?                               // ID of affected resource

  // Change Tracking
  oldValues   Json?                                 // Before change (for updates)
  newValues   Json?                                 // After change (for updates)

  // Request Context
  ipAddress   String
  userAgent   String?
  sessionId   String?                               // Link to user session

  // Additional Context
  success     Boolean   @default(true)              // Action success/failure
  errorMessage String?                              // Error details if failed
  metadata    Json?                                 // Additional context data

  createdAt   DateTime  @default(now())

  @@index([userId])                                 // User activity queries
  @@index([action])                                 // Action type queries
  @@index([resource, resourceId])                   // Resource-specific queries
  @@index([createdAt])                              // Time-based queries
  @@index([success])                                // Error tracking
  @@map("audit_logs")
}
```

#### **9. Role Hierarchy & Enums**
```prisma
enum UserRole {
  GUEST     // Khách (không đăng ký) - Không có level
  STUDENT   // Học sinh - Level 1-9
  TUTOR     // Gia sư - Level 1-9
  TEACHER   // Giáo viên - Level 1-9
  ADMIN     // Quản trị viên - Không có level
}

enum UserStatus {
  ACTIVE      // Hoạt động
  INACTIVE    // Không hoạt động
  SUSPENDED   // Bị đình chỉ
}

enum EnrollmentStatus {
  ACTIVE      // Đang hoạt động
  COMPLETED   // Đã hoàn thành
  DROPPED     // Đã bỏ học
  SUSPENDED   // Bị đình chỉ
  EXPIRED     // Đã hết hạn
}

enum AccessLevel {
  BASIC     // Chỉ xem
  PREMIUM   // Xem + Tải xuống giới hạn
  FULL      // Truy cập đầy đủ + Tải xuống
}

enum NotificationType {
  SECURITY_ALERT    // Login from new device, suspicious activity
  COURSE_UPDATE     // New lesson available, course updated
  SYSTEM_MESSAGE    // Maintenance notice, platform updates
  ACHIEVEMENT       // Level up, certificate earned, milestone
  SOCIAL            // New follower, message, mention
  PAYMENT           // Payment success, failure, refund
}
```

### **🏆 Role Hierarchy System**

#### **Role Hierarchy (Thứ tự quyền hạn)**
```
GUEST < STUDENT < TUTOR < TEACHER < ADMIN
  ↓       ↓        ↓       ↓        ↓
 No     Level    Level   Level    No
Level   1-9      1-9     1-9     Level
```

#### **Level System (1-9 cho STUDENT/TUTOR/TEACHER)**
**Cấp bậc sẽ được đặt tên sau, ví dụ:**
- **STUDENT Levels**: Newbie → Beginner → Intermediate → Advanced → Expert → Master → Grandmaster → Legend → Ultimate
- **TUTOR Levels**: Assistant → Junior → Regular → Senior → Expert → Master → Chief → Principal → Supreme
- **TEACHER Levels**: Trainee → Junior → Regular → Senior → Lead → Principal → Master → Director → Dean

#### **Role Permissions & Capabilities**

**GUEST (No Level)**
- Xem preview courses
- Đăng ký tài khoản
- Không thể truy cập nội dung premium

**STUDENT (Level 1-9)**
- Tham gia courses
- Làm bài tập và exams
- Level cao hơn → Unlock advanced courses
- Level 9: Có thể apply làm TUTOR

**TUTOR (Level 1-9)**
- Tất cả quyền của STUDENT
- Hỗ trợ học sinh cùng level hoặc thấp hơn
- Tạo study groups
- Level cao hơn → Mentor nhiều students hơn
- Level 9: Có thể apply làm TEACHER

**TEACHER (Level 1-9)**
- Tất cả quyền của TUTOR
- Tạo và quản lý courses
- Tạo questions và exams
- Level cao hơn → Tạo advanced courses
- Level 9: Có thể mentor other teachers

**ADMIN (No Level)**
- Full system access
- User management
- Content moderation
- System configuration

### **Field Priority Classification**

#### **🔴 CORE REQUIRED (MVP) - Cannot function without these**
- **id, email**: Essential identifiers
- **role, status**: Authorization và account control
- **emailVerified**: Security requirement
- **createdAt, updatedAt**: Audit trail compliance

#### **🟡 IMPORTANT (Phase 1) - Core features depend on these**
- **googleId, password**: Authentication methods
- **level**: Role hierarchy system
- **maxConcurrentSessions**: Anti-sharing feature
- **Security fields**: lastLoginAt, lastLoginIp, loginAttempts, lockedUntil

#### **🟢 NICE-TO-HAVE (Phase 2+) - Enhance UX but not critical**
- **Profile fields**: username, firstName, lastName, avatar, bio
- **Contact fields**: phone, address, school
- **Can be added later without breaking existing functionality**

#### **⚪ SYSTEM MANAGED - Auto-generated, no user input**
- **Relations**: sessions, oauthAccounts, resourceAccess, etc.
- **Indexes**: Performance optimization

### **Schema Design Principles**

#### **🎯 Core Design Goals**
- **Gmail OAuth First**: Schema tối ưu cho Google authentication
- **3-Device Support**: Built-in session management cho multi-device
- **Role Hierarchy**: 5-tier role system với level progression
- **Resource Protection**: Every access được track và validate
- **Simple Security**: Logic đơn giản, không cần AI/ML
- **Scalable Relations**: Proper indexing và foreign keys
- **Progressive Enhancement**: Start with MVP, add features incrementally

#### **📍 Address & Education Fields**

**Address Field (Simple Text)**
- **Mục đích**: Lưu trữ địa chỉ đơn giản của user
- **Format**: Single text field - user tự nhập format thoải mái
- **Ví dụ**: "123 Nguyễn Văn Linh, Q7, TP.HCM" hoặc "Hà Nội"
- **Use Cases**:
  - Gửi certificate/diploma qua bưu điện (nếu cần)
  - Tổ chức offline events theo khu vực
  - Thống kê đơn giản về phân bố học viên
  - **Không dùng cho**: Complex geo-location, shipping, address validation

**School Field**
- **Mục đích**: Theo dõi background giáo dục của user
- **Format**: Free text field (tên trường học)
- **Use Cases**:
  - **STUDENT**: Trường đang học (để verify student status)
  - **TUTOR**: Trường đã tốt nghiệp (credential verification)
  - **TEACHER**: Trường công tác hoặc alma mater
  - Tạo alumni networks và study groups
  - Verify educational credentials
  - School-based course recommendations

**Privacy & Optional Fields**
- Cả hai fields đều **optional** (nullable)
- User có thể chọn không cung cấp thông tin
- Không required cho registration process
- Có thể update sau trong profile settings

#### **🏆 Hierarchy Business Rules**

**Role Progression Path:**
```
GUEST → STUDENT (Level 1) → ... → STUDENT (Level 9) → TUTOR (Level 1) → ... → TUTOR (Level 9) → TEACHER (Level 1) → ... → TEACHER (Level 9)
                                                                                                                                    ↓
                                                                                                                                  ADMIN
```

**Level Advancement Rules:**
- **STUDENT**: Level up through course completion, exam scores, participation
- **TUTOR**: Level up through student feedback, mentoring success rate
- **TEACHER**: Level up through course quality, student outcomes, peer reviews
- **Role Promotion**: Requires reaching Level 9 + application + admin approval

**Access Control Rules:**
- Higher roles can access lower role content
- Same role: higher level can access lower level content
- Cross-role restrictions: TUTOR Level 5 cannot access TEACHER Level 1 content
- ADMIN: Full access regardless of content level

#### **🔒 Security Features**
- **Session Limits**: maxConcurrentSessions field trong User
- **Device Tracking**: deviceFingerprint trong UserSession
- **Access Logging**: Comprehensive ResourceAccess tracking
- **Risk Scoring**: Simple algorithm-based risk calculation
- **Auto-Blocking**: Automatic user suspension based on risk score

#### **📊 Performance Optimizations**
- **Strategic Indexing**: Key fields có indexes cho fast queries
- **Cascade Deletes**: Proper cleanup khi delete users
- **Efficient Relations**: Optimized foreign key relationships
- **Query Patterns**: Schema designed cho common access patterns

### **🔔 Supporting Models - Mục Đích & Chức Năng**

#### **Notification Model - Hệ Thống Thông Báo**
**Mục đích chính:**
- **Real-time Communication**: Gửi thông báo tức thời cho users
- **User Engagement**: Giữ users active và informed
- **Security Alerts**: Thông báo về hoạt động bảo mật đáng nghi

**Use Cases cụ thể:**
```typescript
// Security Notifications
- "Đăng nhập từ thiết bị mới: iPhone 15 tại Hà Nội"
- "Phát hiện hoạt động đáng nghi từ IP 192.168.1.1"
- "Tài khoản bị khóa do đăng nhập sai 5 lần"

// Course Notifications
- "Bài học mới đã có sẵn trong khóa học React Advanced"
- "Bạn đã hoàn thành 80% khóa học JavaScript Fundamentals"
- "Giảng viên đã phản hồi bài tập của bạn"

// System Notifications
- "Hệ thống sẽ bảo trì từ 2:00-4:00 sáng ngày mai"
- "Chúc mừng! Bạn đã lên Level 5"
```

**Business Value:**
- ✅ **User Retention**: Giữ users engaged với platform
- ✅ **Security**: Phát hiện sớm các hoạt động bất thường
- ✅ **Learning Progress**: Motivate users tiếp tục học
- ✅ **Revenue**: Thông báo về courses mới, promotions

#### **UserPreferences Model - Cá Nhân Hóa Trải Nghiệm**
**Mục đích chính:**
- **Personalization**: Tùy chỉnh trải nghiệm theo sở thích user
- **Privacy Control**: User tự quyết định mức độ riêng tư
- **Learning Optimization**: Tối ưu hóa quá trình học tập

**Use Cases cụ thể:**
```typescript
// Notification Preferences
- emailNotifications: false → Không gửi email
- pushNotifications: true → Chỉ gửi push notifications
- smsNotifications: false → Không gửi SMS

// Learning Preferences
- autoPlayVideos: true → Tự động play video tiếp theo
- defaultVideoQuality: "1080p" → Luôn load video HD
- playbackSpeed: 1.25 → Tốc độ phát mặc định 1.25x

// Privacy Settings
- profileVisibility: "FRIENDS" → Chỉ bạn bè xem profile
- showOnlineStatus: false → Ẩn trạng thái online
- allowDirectMessages: true → Cho phép nhắn tin trực tiếp
```

**Business Value:**
- ✅ **User Satisfaction**: Trải nghiệm được cá nhân hóa
- ✅ **Engagement**: Users dành nhiều thời gian hơn trên platform
- ✅ **Privacy Compliance**: Tuân thủ GDPR, privacy laws
- ✅ **Learning Efficiency**: Tối ưu hóa cách học của từng user

#### **AuditLog Model - Tuân Thủ & Bảo Mật**
**Mục đích chính:**
- **Compliance**: Tuân thủ các quy định về audit trail
- **Security Forensics**: Điều tra các sự cố bảo mật
- **Change Tracking**: Theo dõi mọi thay đổi quan trọng
- **Legal Protection**: Bảo vệ pháp lý cho platform

**Use Cases cụ thể:**
```typescript
// Security Events
- action: "LOGIN_FAILED", ipAddress: "192.168.1.1"
- action: "PASSWORD_CHANGED", oldValues: null, newValues: "hashed"
- action: "ACCOUNT_LOCKED", reason: "Too many failed attempts"

// Business Events
- action: "COURSE_ENROLLED", resourceId: "course-123"
- action: "PAYMENT_COMPLETED", newValues: { amount: 500000, currency: "VND" }
- action: "CERTIFICATE_ISSUED", resourceId: "cert-456"

// Admin Actions
- action: "USER_SUSPENDED", adminId: "admin-789"
- action: "CONTENT_DELETED", oldValues: { title: "Old Course Name" }
```

**Business Value:**
- ✅ **Legal Compliance**: Đáp ứng yêu cầu audit của pháp luật
- ✅ **Security Investigation**: Nhanh chóng điều tra incidents
- ✅ **Business Intelligence**: Phân tích patterns và behaviors
- ✅ **Risk Management**: Phát hiện sớm các rủi ro tiềm ẩn

### **🎯 Tại Sao Cần Các Models Này?**

#### **🔔 Notification - Communication Hub**
- **Without**: Users không biết có updates, security issues
- **With**: Real-time communication, better engagement, proactive security

#### **⚙️ UserPreferences - Personalization Engine**
- **Without**: One-size-fits-all experience, poor UX
- **With**: Tailored experience, higher satisfaction, better learning outcomes

#### **📋 AuditLog - Compliance & Security Foundation**
- **Without**: Không thể investigate issues, legal risks
- **With**: Full traceability, compliance ready, security forensics

**📋 Chi tiết implementation**: Xem [Database Schema + Code.md](./Database%20Schema%20+%20Code.md)

---

## 🗂️ **Cấu Trúc Documentation**

### 📋 [Checklist Overview](./Checklist%20Overview.md)
- Tổng quan các phase implementation
- Task tracking và progress monitoring
- Timeline và dependencies

### 🗄️ [Database Schema + Code](./Database%20Schema%20+%20Code.md)
- Enhanced User model cho NyNus với Gmail OAuth
- Session management tables
- Resource access tracking
- Migration scripts và Prisma setup

### 🚀 [Backend Implementation + Code](./Backend%20Implementation%20+%20Code.md)
- Google OAuth Strategy
- Users Service với session management
- Auth Service với token handling
- Controllers và DTOs
- Guards và middleware

### 🎨 [Frontend Implementation + Code](./Frontend%20Implementation%20+%20Code.md)
- Zustand auth store
- Login/OAuth pages
- Protected routes và middleware
- Profile management components

### 🛡️ [Security & Testing + Code](./Security%20&%20Testing%20+%20Code.md)
- Resource protection logic
- Anti-piracy features
- Session limits enforcement
- Testing strategies

---

## 🎯 **Core Features & Business Rules**

### **🔐 Authentication System**

#### **Gmail OAuth Primary (Recommended)**
**User Flow:**
1. User clicks "Đăng nhập bằng Google"
2. Redirect to Google OAuth
3. Google returns profile + tokens
4. Auto-create user or link existing account
5. Generate JWT tokens
6. Redirect to dashboard

**Business Rules:**
- ✅ **Auto-verified email** cho Google users
- ✅ **Profile sync** từ Google (name, avatar)
- ✅ **No password required** cho OAuth users
- ✅ **Fallback support** cho email/password

#### **Fallback Authentication**
**Dành cho users không có Google account:**
- Email/password registration
- Manual email verification
- Password reset flow
- Same session management

### **📱 Multi-Device Support (3 Sessions)**

#### **Session Rules**
**Business Logic:**
- maxConcurrentSessions = 3 (Phone + Laptop + Tablet)
- **When 4th device logs in:**
  1. Find oldest session
  2. Terminate oldest session
  3. Create new session
  4. Notify user via email (optional)

**Use Cases:**
- 📱 **Phone**: Học trên đường, di chuyển
- 💻 **Laptop**: Học tại nhà, văn phòng
- 📟 **Tablet**: Học trên giường, ngoài trời

#### **Session Security**
**Device Fingerprinting:**
- deviceFingerprint = hash(browser + OS + screen_resolution)
- location = getLocationFromIP(ipAddress) // City, Country

**Session Validation:**
- Check expiry (24 hours default)
- Validate device fingerprint
- Monitor IP changes

### **🛡️ Resource Protection System**

#### **Access Control Logic**
**Before accessing any resource:**
1. Check enrollment
2. Check expiry
3. Check download limits
4. Log access

#### **Anti-Piracy Rules**
**Simple Risk Scoring (No AI needed):**
- Multiple IPs in 1 hour: +30 risk points
- Too many downloads: +30 risk points
- Rapid access pattern: +40 risk points

**Auto Actions:**
- Risk score >= 90: Suspend user for 24 hours
- Risk score >= 70: Flag for admin review

### **🏆 Role-Based Access Control System**

#### **Hierarchy Access Rules**
**Vertical Access (Role-based):**
- ADMIN: Access to all content regardless of level
- TEACHER: Access to TUTOR, STUDENT content + own level content
- TUTOR: Access to STUDENT content + own level content
- STUDENT: Access to own level content only
- GUEST: Preview access only

**Horizontal Access (Level-based within same role):**
- Higher level users can access lower level content
- Same level: full access
- Lower level: cannot access higher level content

#### **Content Access Matrix**
```
Role/Level    | GUEST | STUDENT 1-9 | TUTOR 1-9 | TEACHER 1-9 | ADMIN
------------- |-------|-------------|-----------|-------------|-------
GUEST Content |   ✅   |      ✅      |     ✅     |      ✅      |   ✅
STUDENT L1-9  |   ❌   |   Level≥X   |     ✅     |      ✅      |   ✅
TUTOR L1-9    |   ❌   |      ❌      |  Level≥X  |      ✅      |   ✅
TEACHER L1-9  |   ❌   |      ❌      |     ❌     |   Level≥X   |   ✅
ADMIN Content |   ❌   |      ❌      |     ❌     |      ❌      |   ✅
```

#### **Role Progression System**
**Advancement Requirements:**
- **STUDENT → TUTOR**: Reach Level 9 + Complete mentor training + Admin approval
- **TUTOR → TEACHER**: Reach Level 9 + Teaching certification + Peer review + Admin approval
- **TEACHER → ADMIN**: Special appointment only

**Level Progression Criteria:**
- **STUDENT**: Course completion rate, exam scores, participation points
- **TUTOR**: Student feedback ratings, mentoring hours, success rate
- **TEACHER**: Course quality metrics, student outcomes, peer evaluations

### **📊 Course Enrollment Rules**

#### **Access Levels**
- **BASIC**: Chỉ xem online
- **PREMIUM**: Xem + Tải xuống giới hạn (5 files/day)
- **FULL**: Truy cập đầy đủ + Unlimited downloads

#### **Enrollment Expiry**
**Time-based Access Control:**
- expiresAt: null = Permanent access
- expiresAt: Date = Expires at specific time
- Auto-block access after expiry
- Grace period: 7 days (read-only)

**📋 Chi tiết implementation**: Xem [Backend Implementation + Code.md](./Backend%20Implementation%20+%20Code.md)

---

## 🔧 **Technical Architecture**

### **Backend Architecture**

#### **Service Layer Structure**
**Core Services:**
- **AuthService**: Handle Google OAuth, fallback login, logout, token management
- **UsersService**: User CRUD, session management, profile updates
- **ResourceProtectionService**: Access validation, risk calculation, user blocking

#### **Guard System**
**Authentication Guards:**
- JwtAuthGuard: Protect routes
- GoogleAuthGuard: Google OAuth
- ResourceAccessGuard: Resource protection
- SessionLimitGuard: Session limits

**Usage Pattern:**
- Routes are protected by combining multiple guards
- Auto-validation of JWT, enrollment, and session validity

### **Frontend Architecture**

#### **State Management (Zustand)**
**Auth Store Components:**
- User state management
- Token handling (access/refresh)
- Authentication actions
- Auto token refresh logic

#### **Route Protection**
**Middleware System:**
- Public routes: /login, /register, /
- Protected routes: /dashboard, /courses, /profile
- Auto-redirect based on auth status

**Component-level Protection:**
- ProtectedRoute wrapper components
- Role-based access control
- Loading states during auth checks

**📋 Chi tiết implementation**: Xem [Frontend Implementation + Code.md](./Frontend%20Implementation%20+%20Code.md)

---

## 🚀 **Implementation Workflow**

### **Phase 1: Database Setup (1 giờ)**
1. **Schema Design**: Enhanced User, OAuth, Sessions, ResourceAccess models
2. **Migration**: Generate và run database migrations
3. **Seeding**: Create sample data for testing

### **Phase 2: Backend Implementation (2-3 giờ)**
1. **Google OAuth**: Setup OAuth strategy và endpoints
2. **Services**: Implement Auth, Users, ResourceProtection services
3. **Guards**: Create authentication và authorization guards
4. **Controllers**: Build API endpoints với proper validation

### **Phase 3: Frontend Implementation (1-2 giờ)**
1. **Auth Store**: Setup Zustand store với persistence
2. **Login Pages**: Google OAuth button + fallback form
3. **Route Protection**: Middleware và component guards
4. **Profile Management**: User profile và session management UI

### **Phase 4: Security & Testing (1 giờ)**
1. **Resource Protection**: Implement access control logic
2. **Security Features**: Risk scoring và auto-blocking
3. **Testing**: Unit tests, integration tests, manual testing
4. **Monitoring**: Setup basic security monitoring

**📋 Chi tiết từng phase**: Xem [Checklist Overview.md](./Checklist%20Overview.md)

---

## 🛡️ **Security Best Practices**

### **Password & Token Security**
**JWT Token Rules:**
- Access Token: 15 minutes (short-lived)
- Refresh Token: 7 days (longer-lived)
- Rotate refresh tokens on each use
- Store tokens securely (httpOnly cookies recommended)

**Password Rules (for fallback auth):**
- Minimum 8 characters
- Hash with bcrypt (cost factor 12+)
- No password reuse (last 5 passwords)
- Password reset expires in 1 hour

### **Session Security**
**Session Management Rules:**
- Max 3 concurrent sessions
- Session expires after 24 hours inactivity
- Device fingerprinting for session validation
- IP change detection and alerts
- Secure session token generation

### **Resource Protection Rules**
**Access Control:**
- Always check enrollment before resource access
- Log every resource access attempt
- Rate limiting: 100 requests per hour per user
- Download limits based on access level
- Automatic suspension for risk score > 90

### **Data Privacy & GDPR**
**User Data Handling:**
- Minimal data collection (only necessary fields)
- User consent for data processing
- Right to data deletion (soft delete with cleanup)
- Data export functionality
- Audit logs for compliance

**📋 Chi tiết implementation**: Xem [Security & Testing + Code.md](./Security%20&%20Testing%20+%20Code.md)

---

## 📈 **Monitoring & Analytics**

### **Key Metrics to Track**
**Security Metrics:**
- Failed login attempts per hour
- Suspended users per day
- High risk score users (>70)
- Multiple IP access patterns
- Download abuse patterns

**Performance Metrics:**
- Average login time
- Token refresh success rate
- Session creation/termination rate
- Resource access response time
- Database query performance

### **Alert Thresholds**
**Auto Alerts:**
- Risk score > 80: Email admin
- Risk score > 90: Auto-suspend user
- Failed logins > 10/hour: Rate limit IP
- Multiple IPs > 5/hour: Flag for review
- Download rate > 20/hour: Temporary block

---

## 🎓 **Learning Outcomes & Success Criteria**

### **Technical Achievements**
- ✅ **Gmail OAuth Integration** - 1-click login working
- ✅ **Multi-device Support** - 3 sessions managed properly
- ✅ **Resource Protection** - Courses protected from unauthorized access
- ✅ **Anti-piracy System** - Account sharing detected and blocked
- ✅ **Session Management** - Secure session handling
- ✅ **Risk Assessment** - Simple but effective risk scoring
- ✅ **Admin Dashboard** - Security monitoring interface

### **Business Outcomes**
- 🎯 **User Experience**: Seamless NyNus login, multi-device support
- 🛡️ **Content Protection**: 90%+ reduction in unauthorized sharing
- 💰 **Cost Efficiency**: $0 external API costs
- 📊 **Insights**: Clear visibility into NyNus user access patterns
- 🔒 **Security**: Proactive threat detection and response

### **Performance Benchmarks**
**Target Metrics:**
- Login success rate: >95%
- False positive rate: <5% (legitimate users blocked)
- Detection accuracy: >90% (suspicious activity caught)
- Response time: <500ms (auth operations)
- Uptime: >99.9% (system availability)

---

## 🚀 **Next Steps & Scaling**

### **Phase 2 Enhancements (Future)**
**Advanced Features (Optional):**
- Social login (Facebook, GitHub)
- Two-factor authentication (TOTP)
- Advanced analytics dashboard
- Machine learning risk scoring
- Real-time notifications
- Mobile app support

### **Production Deployment**
**Production Checklist:**
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring alerts setup
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Security headers configured

---

**📝 Ghi chú**: Guide này là high-level overview và business requirements specification cho NyNus platform. Chi tiết implementation code được tách riêng trong các file tương ứng để dễ maintain và reference. Mỗi section có link đến file implementation chi tiết.
