# UI Testing Checklist - NyNus Exam Bank System
## Comprehensive Page Testing & Error Collection Plan

**Mục tiêu**: Test và tìm lỗi trên toàn bộ 40+ pages của hệ thống NyNus
**Công cụ**: Playwright MCP Browser Automation
**Phương pháp**: 5-Step Process cho mỗi page

---

## 📋 Quy trình 5 bước cho mỗi page

### **Bước 1: NAVIGATE** - Truy cập page
- Sử dụng `browser_navigate_Playwright` để truy cập URL
- Chờ page load hoàn toàn
- Capture screenshot ban đầu

### **Bước 2: SNAPSHOT** - Thu thập thông tin page
- Sử dụng `browser_snapshot_Playwright` để lấy accessibility tree
- Kiểm tra các elements chính có render không
- Ghi nhận cấu trúc page

### **Bước 3: CONSOLE** - Kiểm tra console errors
- Sử dụng `browser_console_messages_Playwright` để lấy console logs
- Phân loại errors: Critical, Warning, Info
- Ghi nhận tất cả JavaScript errors

### **Bước 4: NETWORK** - Kiểm tra network requests
- Sử dụng `browser_network_requests_Playwright` để lấy network activity
- Kiểm tra failed requests (4xx, 5xx)
- Kiểm tra gRPC calls thành công/thất bại

### **Bước 5: ANALYZE** - Phân tích và ghi nhận lỗi
- Tổng hợp tất cả lỗi từ 4 bước trên
- Phân tích root cause
- Ghi nhận vào error log

---

## 🗂️ Danh sách Pages cần test

### **A. Public Pages (Không cần authentication)** - 12 pages

#### A1. Landing & Marketing Pages
- [ ] **/** - Homepage
  - URL: `http://localhost:3000/`
  - Components: Hero, Features, AILearning, FeaturedCourses, Testimonials, FAQ
  - Expected: No errors, all sections load

- [ ] **/about** - About page
  - URL: `http://localhost:3000/about`
  - Expected: Company information displays

- [ ] **/careers** - Careers page
  - URL: `http://localhost:3000/careers`
  - Expected: Job listings display

- [ ] **/faq** - FAQ page
  - URL: `http://localhost:3000/faq`
  - Expected: FAQ accordion works

- [ ] **/help** - Help page
  - URL: `http://localhost:3000/help`
  - Expected: Help documentation displays

- [ ] **/huong-dan** - User guide (Vietnamese)
  - URL: `http://localhost:3000/huong-dan`
  - Expected: Vietnamese guide displays

#### A2. Contact & Legal Pages
- [ ] **/lien-he** - Contact page
  - URL: `http://localhost:3000/lien-he`
  - Expected: Contact form works, gRPC ContactService integration

- [ ] **/support** - Support page
  - URL: `http://localhost:3000/support`
  - Expected: Support form displays

- [ ] **/privacy** - Privacy policy
  - URL: `http://localhost:3000/privacy`
  - Expected: Privacy policy displays

- [ ] **/terms** - Terms of service
  - URL: `http://localhost:3000/terms`
  - Expected: Terms display

#### A3. Error Reporting
- [ ] **/bao-cao-loi** - Bug report page
  - URL: `http://localhost:3000/bao-cao-loi`
  - Expected: Bug report form works

- [ ] **/unauthorized** - Unauthorized page
  - URL: `http://localhost:3000/unauthorized`
  - Expected: Unauthorized message displays

---

### **B. Authentication Pages** - 5 pages

- [ ] **/login** - Login page
  - URL: `http://localhost:3000/login`
  - Features: Email/password login, Google OAuth
  - gRPC: UserService/Login, UserService/GoogleLogin
  - Expected: Login form works, redirects after login

- [ ] **/register** - Registration page
  - URL: `http://localhost:3000/register`
  - Features: User registration form
  - gRPC: UserService/Register
  - Expected: Registration form works

- [ ] **/forgot-password** - Forgot password
  - URL: `http://localhost:3000/forgot-password`
  - Features: Password reset request
  - gRPC: UserService/ForgotPassword
  - Expected: Reset email sent

- [ ] **/reset-password/[token]** - Reset password
  - URL: `http://localhost:3000/reset-password/test-token`
  - Features: Password reset with token
  - Expected: Password reset form works

---

### **C. Authenticated User Pages** - 8 pages

**Note**: Cần login trước khi test các pages này

- [ ] **/profile** - User profile
  - URL: `http://localhost:3000/profile`
  - Auth: Required
  - gRPC: ProfileService/GetProfile
  - Expected: User profile displays and editable

- [ ] **/sessions** - Active sessions
  - URL: `http://localhost:3000/sessions`
  - Auth: Required
  - gRPC: ProfileService/GetSessions
  - Expected: Session list displays, can terminate sessions

- [ ] **/notifications** - Notifications
  - URL: `http://localhost:3000/notifications`
  - Auth: Required
  - gRPC: NotificationService
  - Expected: Notification list displays

- [ ] **/resource-protection** - Resource protection
  - URL: `http://localhost:3000/resource-protection`
  - Auth: Required
  - Expected: Protected resources display

---

### **D. Questions Pages** - 5 pages

- [ ] **/questions** - Questions landing
  - URL: `http://localhost:3000/questions`
  - Auth: Optional (public preview available)
  - gRPC: QuestionService/GetPublicQuestions
  - Expected: Question list displays

- [ ] **/questions/browse** - Browse questions
  - URL: `http://localhost:3000/questions/browse`
  - Auth: Required for full access
  - gRPC: QuestionService/FilterQuestions
  - Expected: Question browser with filters works

- [ ] **/questions/search** - Search questions
  - URL: `http://localhost:3000/questions/search`
  - Auth: Required
  - gRPC: QuestionService/SearchQuestions
  - Expected: Search functionality works

- [ ] **/questions/[id]** - Question detail
  - URL: `http://localhost:3000/questions/test-id`
  - Auth: Required
  - gRPC: QuestionService/GetQuestion
  - Expected: Question detail displays

- [ ] **/practice** - Practice mode
  - URL: `http://localhost:3000/practice`
  - Auth: Required
  - Expected: Practice interface works

---

### **E. Exams Pages** - 6 pages

- [ ] **/exams** - Exams landing
  - URL: `http://localhost:3000/exams`
  - Auth: Required (STUDENT+)
  - gRPC: ExamService/ListExams
  - Expected: Exam list displays

- [ ] **/exams/create** - Create exam
  - URL: `http://localhost:3000/exams/create`
  - Auth: Required (TEACHER+)
  - gRPC: ExamService/CreateExam
  - Expected: Exam creation form works

- [ ] **/exams/[id]** - Exam detail
  - URL: `http://localhost:3000/exams/test-id`
  - Auth: Required
  - gRPC: ExamService/GetExam
  - Expected: Exam details display

- [ ] **/exams/[id]/edit** - Edit exam
  - URL: `http://localhost:3000/exams/test-id/edit`
  - Auth: Required (TEACHER+)
  - gRPC: ExamService/UpdateExam
  - Expected: Exam edit form works

- [ ] **/exams/[id]/take** - Take exam
  - URL: `http://localhost:3000/exams/test-id/take`
  - Auth: Required (STUDENT+)
  - gRPC: ExamService/StartExamAttempt
  - Expected: Exam taking interface works

- [ ] **/exams/[id]/results** - Exam results
  - URL: `http://localhost:3000/exams/test-id/results`
  - Auth: Required
  - gRPC: ExamService/GetExamResults
  - Expected: Results display correctly

---

### **F. Courses Pages** - 2 pages

- [ ] **/courses** - Courses listing
  - URL: `http://localhost:3000/courses`
  - Auth: Required (STUDENT+)
  - Expected: Course list displays with search/filter

- [ ] **/courses/[slug]** - Course detail
  - URL: `http://localhost:3000/courses/test-course`
  - Auth: Required
  - Expected: Course content displays

---

### **G. Admin Pages (3141592654/admin)** - 15+ pages

**Note**: Cần ADMIN role để access

#### G1. Main Admin Pages
- [ ] **/3141592654/admin** - Admin dashboard
  - URL: `http://localhost:3000/3141592654/admin`
  - Auth: ADMIN only
  - gRPC: AdminService/GetSystemStats
  - Expected: Dashboard with statistics

- [ ] **/3141592654/admin/users** - User management
  - URL: `http://localhost:3000/3141592654/admin/users`
  - Auth: ADMIN only
  - gRPC: AdminService/ListUsers
  - Expected: User list with management actions

- [ ] **/3141592654/admin/questions** - Question management
  - URL: `http://localhost:3000/3141592654/admin/questions`
  - Auth: ADMIN only
  - Expected: Question management interface

- [ ] **/3141592654/admin/questions/create** - Create question
  - URL: `http://localhost:3000/3141592654/admin/questions/create`
  - Auth: ADMIN only
  - Expected: Question creation form

#### G2. System Management
- [ ] **/3141592654/admin/analytics** - Analytics
  - URL: `http://localhost:3000/3141592654/admin/analytics`
  - Auth: ADMIN only
  - Expected: Analytics dashboard

- [ ] **/3141592654/admin/settings** - System settings
  - URL: `http://localhost:3000/3141592654/admin/settings`
  - Auth: ADMIN only
  - Expected: Settings interface

- [ ] **/3141592654/admin/security** - Security settings
  - URL: `http://localhost:3000/3141592654/admin/security`
  - Auth: ADMIN only
  - Expected: Security configuration

- [ ] **/3141592654/admin/sessions** - Session management
  - URL: `http://localhost:3000/3141592654/admin/sessions`
  - Auth: ADMIN only
  - gRPC: AdminService/GetActiveSessions
  - Expected: Active sessions list

- [ ] **/3141592654/admin/notifications** - Notification management
  - URL: `http://localhost:3000/3141592654/admin/notifications`
  - Auth: ADMIN only
  - Expected: Notification management interface

#### G3. Advanced Admin Features
- [ ] **/3141592654/admin/roles** - Role management
  - URL: `http://localhost:3000/3141592654/admin/roles`
  - Auth: ADMIN only
  - Expected: Role configuration

- [ ] **/3141592654/admin/permissions** - Permission management
  - URL: `http://localhost:3000/3141592654/admin/permissions`
  - Auth: ADMIN only
  - Expected: Permission matrix

- [ ] **/3141592654/admin/audit** - Audit logs
  - URL: `http://localhost:3000/3141592654/admin/audit`
  - Auth: ADMIN only
  - gRPC: AdminService/GetAuditLogs
  - Expected: Audit log viewer

---

## 📊 Error Tracking Template

Cho mỗi page, ghi nhận lỗi theo format sau:

```markdown
### Page: [Page Name]
**URL**: [URL]
**Test Date**: [Date]
**Status**: ✅ Pass / ❌ Fail / ⚠️ Warning

#### Console Errors:
- [Error 1]: [Description]
- [Error 2]: [Description]

#### Network Errors:
- [Failed Request 1]: [URL] - [Status Code] - [Error Message]
- [Failed Request 2]: [URL] - [Status Code] - [Error Message]

#### UI Issues:
- [Issue 1]: [Description]
- [Issue 2]: [Description]

#### Root Cause Analysis:
- **Primary Cause**: [Analysis]
- **Secondary Causes**: [Analysis]

#### Recommended Fixes:
1. [Fix 1]
2. [Fix 2]
```

---

## 🎯 Testing Priority

### **Priority 1 - Critical Pages** (Test first)
1. Login/Register pages
2. Homepage
3. Questions pages
4. Admin dashboard

### **Priority 2 - Important Pages**
1. Exams pages
2. Profile/Sessions
3. Admin user management

### **Priority 3 - Supporting Pages**
1. Contact/Support
2. FAQ/Help
3. Legal pages

---

## 📝 Next Steps

1. **Setup Authentication**: Tạo test accounts cho các roles (GUEST, STUDENT, TEACHER, ADMIN)
2. **Start Testing**: Bắt đầu với Priority 1 pages
3. **Document Errors**: Ghi nhận tất cả lỗi vào file riêng cho mỗi page
4. **Analyze & Fix**: Phân tích root cause và implement fixes
5. **Re-test**: Verify fixes hoạt động đúng

---

**Total Pages to Test**: 40+ pages
**Estimated Time**: 2-3 hours for complete testing
**Tools**: Playwright MCP, Browser Automation

