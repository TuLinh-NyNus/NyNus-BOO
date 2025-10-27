# 📱 Flutter Mobile App - Overview & Roadmap
**NyNus Exam Bank System - Mobile Edition**

## 📊 Project Overview

### Vision
Xây dựng ứng dụng mobile **native performance** với **100% feature parity** so với web, tận dụng tối đa sức mạnh của Flutter và gRPC native protocol.

### Key Requirements
- ✅ **Cross-platform**: iOS 12+ và Android 6.0+ từ single codebase
- ✅ **Native gRPC**: Kết nối trực tiếp port 50051, không qua HTTP gateway
- ✅ **Offline-first**: Hoạt động mượt mà khi không có mạng
- ✅ **Performance**: 60fps UI, fast startup time < 2s
- ✅ **Security**: Biometric auth, secure storage, certificate pinning

### Tech Stack Summary
```yaml
Core:
  - Flutter 3.19+
  - Dart 3.3+
  - gRPC Native (Binary Protocol)
  - BLoC Pattern (State Management)
  
Storage:
  - Hive (NoSQL local database)
  - Flutter Secure Storage (credentials)
  - Shared Preferences (settings)
  
UI/UX:
  - Material Design 3
  - Custom animations
  - LaTeX rendering (flutter_math_fork)
  - PDF generation
```

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (2 tuần)
**Mục tiêu**: Setup project cơ bản và infrastructure

| Task | Duration | Files |
|------|----------|-------|
| Project setup & structure | 2-3 ngày | [01-project-setup.md](01-project-setup.md) |
| Protocol Buffers & gRPC | 1-2 ngày | [02-grpc-setup.md](02-grpc-setup.md) |
| Local storage & offline | 1-2 ngày | [03-storage-offline.md](03-storage-offline.md) |
| Authentication & BLoC | 2-3 ngày | [04-authentication.md](04-authentication.md) |
| Navigation & routing | 1 ngày | [05-navigation.md](05-navigation.md) |

**Deliverables:**
- ✅ Flutter project với clean architecture
- ✅ gRPC connection hoạt động
- ✅ Login/Register flow complete
- ✅ Offline storage ready

---

### Phase 2: Core Features (4 tuần)
**Mục tiêu**: Implement các tính năng chính

| Feature | Duration | Files |
|---------|----------|-------|
| Questions Module | 1 tuần | [06-questions-module.md](06-questions-module.md) |
| Exams Module | 1 tuần | [07-exams-module.md](07-exams-module.md) |
| Library Module | 1 tuần | [08-library-module.md](08-library-module.md) |
| Theory Module | 3-4 ngày | [09-theory-module.md](09-theory-module.md) |
| Profile & Settings | 2-3 ngày | [10-profile-settings.md](10-profile-settings.md) |

**Deliverables:**
- ✅ Question browsing, search, filter
- ✅ Exam taking với timer, auto-submit
- ✅ Library với download offline
- ✅ Theory content với LaTeX
- ✅ User profile management

---

### Phase 3: Advanced Features (2 tuần)
**Mục tiêu**: Polish và advanced features

| Feature | Duration | Files |
|---------|----------|-------|
| Analytics & Charts | 2-3 ngày | [11-analytics.md](11-analytics.md) |
| Notifications | 2 ngày | [12-notifications.md](12-notifications.md) |
| Admin Features | 3-4 ngày | [13-admin-features.md](13-admin-features.md) |
| Performance Optimization | 2-3 ngày | [14-performance.md](14-performance.md) |

**Deliverables:**
- ✅ Analytics dashboard với charts
- ✅ Push notifications
- ✅ Admin management features
- ✅ Performance optimized

---

### Phase 4: Testing & Deployment (1 tuần)
**Mục tiêu**: Testing và prepare for production

| Task | Duration | Files |
|------|----------|-------|
| Unit & Widget Testing | 2-3 ngày | [15-testing.md](15-testing.md) |
| Integration Testing | 2 ngày | [16-integration-tests.md](16-integration-tests.md) |
| Build & Deploy | 2 ngày | [17-deployment.md](17-deployment.md) |

**Deliverables:**
- ✅ Test coverage > 80%
- ✅ CI/CD pipeline
- ✅ App store ready builds

---

## 📂 Project Structure

```
apps/mobile/
├── lib/
│   ├── core/                    # Core functionality
│   │   ├── constants/          # API endpoints, configs
│   │   ├── errors/             # Error handling
│   │   ├── network/            # gRPC client
│   │   ├── storage/            # Local storage
│   │   ├── theme/              # App theme
│   │   └── utils/              # Utilities
│   │
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── questions/         # Questions
│   │   ├── exams/             # Exams  
│   │   ├── library/           # Library
│   │   ├── theory/            # Theory
│   │   ├── profile/           # Profile
│   │   ├── analytics/         # Analytics
│   │   └── settings/          # Settings
│   │
│   ├── shared/                # Shared components
│   │   ├── widgets/           # Reusable widgets
│   │   └── models/            # Common models
│   │
│   └── generated/             # Generated code
│       └── proto/             # Proto generated files
│
├── assets/                    # Images, fonts, etc.
├── test/                      # Tests
└── scripts/                   # Build scripts
```

---

## 📋 Feature Parity Checklist

### Authentication ✅
- [ ] Email/Password login
- [ ] Google OAuth
- [ ] Register with email verification
- [ ] Forgot password
- [ ] Biometric authentication
- [ ] Session management (max 3 devices)
- [ ] Auto refresh token

### Questions Module ✅
- [ ] List questions với pagination
- [ ] Advanced search
- [ ] Filters (subject, grade, type, difficulty)
- [ ] Question detail với LaTeX
- [ ] Save/bookmark questions
- [ ] Offline cache
- [ ] Share question

### Exams Module ✅
- [ ] List exams
- [ ] Create exam (Teacher+)
- [ ] Take exam với timer
- [ ] Auto-save answers
- [ ] Submit exam
- [ ] View results
- [ ] Exam statistics
- [ ] Download PDF

### Library Module ✅
- [ ] Browse resources
- [ ] Filter by type (PDF, video, book)
- [ ] Download for offline
- [ ] Rating system
- [ ] Upload (Teacher+)
- [ ] Approval workflow

### Theory Module ✅
- [ ] Browse by subject/grade
- [ ] LaTeX rendering
- [ ] Offline reading
- [ ] Bookmarks
- [ ] Search in content
- [ ] Progress tracking

### Admin Features ✅
- [ ] User management
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] System settings
- [ ] Audit logs

---

## 🎯 Success Metrics

### Technical Metrics
- **App Size**: < 50MB (Android), < 100MB (iOS)
- **Startup Time**: < 2 seconds
- **FPS**: 60fps on mid-range devices
- **Offline Coverage**: 80% features work offline
- **Crash Rate**: < 0.1%
- **Memory Usage**: < 150MB average

### Business Metrics
- **User Adoption**: 50% web users use mobile
- **Retention**: 70% monthly active users
- **Engagement**: 3+ sessions per week
- **Ratings**: 4.5+ stars average

---

## 🔗 Quick Links

### Documentation
- [Project Setup](01-project-setup.md)
- [Architecture Guide](architecture.md)
- [API Reference](api-reference.md)
- [Style Guide](style-guide.md)

### Resources
- [Flutter Documentation](https://docs.flutter.dev)
- [gRPC Dart Guide](https://grpc.io/docs/languages/dart/)
- [BLoC Library](https://bloclibrary.dev)
- [Material Design 3](https://m3.material.io)

### Team Contacts
- **Tech Lead**: [Name]
- **Flutter Team**: [Team Chat]
- **Backend Team**: [Contact]
- **QA Team**: [Contact]

---

## 🚀 Getting Started

1. **Clone repository**
   ```bash
   git clone [repo-url]
   cd apps/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate proto files**
   ```bash
   ./scripts/generate_proto.sh
   ```

4. **Run app**
   ```bash
   flutter run
   ```

5. **Read documentation**
   - Start with [01-project-setup.md](01-project-setup.md)
   - Follow phases sequentially
   - Check progress in each phase doc

---

**Last Updated**: [Date]  
**Version**: 1.0.0  
**Status**: Planning Phase
