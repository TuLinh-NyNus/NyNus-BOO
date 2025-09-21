# NyNus AGENT.md System Documentation
*Hệ thống hướng dẫn cho AI agents làm việc với codebase*

## 📋 Tổng quan AGENT.md System

Hệ thống **AGENT.md** được thiết kế để cung cấp hướng dẫn chi tiết cho AI agents khi làm việc với codebase NyNus Exam Bank System. Mỗi file AGENT.md chứa thông tin cụ thể về:

- **High-level overview** - Tổng quan về module/package
- **Build instructions** - Hướng dẫn build và development
- **Project layout** - Cấu trúc file và thư mục
- **Common issues** - Các vấn đề thường gặp và cách giải quyết
- **Best practices** - Các thực hành tốt nhất

## 🗂️ Danh sách AGENT.md Files

### 1. Root AGENT.md
**Vị trí**: `/AGENT.md`
**Chức năng**: Hướng dẫn tổng quan toàn bộ monorepo

#### Nội dung chính:
- ✅ Tổng quan hệ thống NyNus (Go backend + Next.js frontend)
- ✅ Kiến trúc monorepo với pnpm workspaces
- ✅ Commands khởi động nhanh (`start-project.ps1`)
- ✅ Build commands cho backend (Makefile) và frontend (pnpm)
- ✅ Protocol Buffer generation workflow
- ✅ Docker development setup
- ✅ Environment variables và configuration
- ✅ Common issues và troubleshooting
- ✅ Service URLs và health checks

#### Khi nào sử dụng:
- AI agent mới bắt đầu làm việc với project
- Cần hiểu tổng quan architecture
- Khởi động development environment
- Troubleshoot issues ở level cao

### 2. Backend AGENT.md
**Vị trí**: `/apps/backend/AGENT.md`
**Chức năng**: Hướng dẫn chi tiết cho Go gRPC backend

#### Nội dung chính:
- ✅ Go 1.23.5 backend với 8 gRPC services
- ✅ Clean Architecture với Repository pattern
- ✅ Authentication system (JWT + Refresh Token + Session)
- ✅ gRPC service implementations chi tiết
- ✅ Database integration với pgx driver
- ✅ Middleware chain (6-layer interceptors)
- ✅ Testing strategy và commands
- ✅ Performance considerations
- ✅ Development workflow

#### Khi nào sử dụng:
- Implement hoặc modify gRPC services
- Làm việc với authentication system
- Database operations và repository layer
- Backend testing và debugging
- Performance optimization

### 3. gRPC Services AGENT.md
**Vị trí**: `/apps/backend/internal/grpc/AGENT.md`
**Chức năng**: Hướng dẫn chi tiết implement gRPC services

#### Nội dung chính:
- ✅ 8 gRPC services implementation patterns
- ✅ Authentication flow với UserService
- ✅ Question management với QuestionService
- ✅ Advanced filtering với QuestionFilterService
- ✅ Admin operations với AdminService
- ✅ Error handling patterns và context utilities
- ✅ Testing strategies cho gRPC services
- ✅ Performance optimization techniques

#### Khi nào sử dụng:
- Implement new gRPC service methods
- Modify existing service logic
- Add authentication và authorization
- Handle complex business logic
- Debug gRPC service issues

### 4. Repository Layer AGENT.md
**Vị trí**: `/apps/backend/internal/repository/AGENT.md`
**Chức năng**: Hướng dẫn implement repository pattern

#### Nội dung chính:
- ✅ Repository interface pattern
- ✅ CRUD operations implementation
- ✅ Advanced query operations với pagination
- ✅ Transaction management
- ✅ Authentication repositories (User, Session, RefreshToken)
- ✅ Error handling và database error mapping
- ✅ Repository testing strategies

#### Khi nào sử dụng:
- Create new repository interfaces
- Implement database operations
- Add complex queries với filtering
- Handle database transactions
- Debug database-related issues

### 5. Frontend AGENT.md
**Vị trí**: `/apps/frontend/AGENT.md`
**Chức năng**: Hướng dẫn chi tiết cho Next.js 15 frontend

#### Nội dung chính:
- ✅ Next.js 15 với App Router và TypeScript
- ✅ gRPC-Web integration với @improbable-eng/grpc-web
- ✅ Tailwind CSS + Shadcn UI components
- ✅ Authentication context và protected routes
- ✅ Custom hooks và state management
- ✅ Performance optimization techniques
- ✅ Build và development commands
- ✅ Testing setup (planned)

#### Khi nào sử dụng:
- Develop React components và pages
- Implement gRPC-Web clients
- Work với authentication flow
- UI/UX development với Tailwind
- Frontend performance optimization
- TypeScript type checking

### 6. Frontend Components AGENT.md
**Vị trí**: `/apps/frontend/src/components/AGENT.md`
**Chức năng**: Hướng dẫn develop React components

#### Nội dung chính:
- ✅ Component architecture với Shadcn UI
- ✅ UI components (Button, Input, Modal, etc.)
- ✅ Authentication components (RoleBadge, SecurityAlertBanner)
- ✅ Question components (QuestionForm, QuestionList)
- ✅ Layout components (MainLayout, Navbar, Footer)
- ✅ Common components (ErrorBoundary, HydrationSafe)
- ✅ Component testing strategies

#### Khi nào sử dụng:
- Create new React components
- Implement form handling
- Add authentication UI elements
- Build responsive layouts
- Handle component state management
- Debug component rendering issues

### 7. Protocol Buffers AGENT.md
**Vị trí**: `/packages/proto/AGENT.md`
**Chức năng**: Hướng dẫn làm việc với Protocol Buffer definitions

#### Nội dung chính:
- ✅ 8 gRPC services definitions chi tiết
- ✅ Code generation cho Go và TypeScript
- ✅ Common types và enums (UserRole, QuestionType, etc.)
- ✅ Message design best practices
- ✅ API versioning strategy
- ✅ Breaking changes detection với buf
- ✅ Development workflow cho API changes

#### Khi nào sử dụng:
- Add hoặc modify gRPC services
- Generate protobuf code
- API design và versioning
- Cross-language type definitions
- Breaking changes management

### 8. Database AGENT.md
**Vị trí**: `/packages/database/AGENT.md`
**Chức năng**: Hướng dẫn database schema và migrations

#### Nội dung chính:
- ✅ PostgreSQL 15 schema với 16+ tables
- ✅ golang-migrate workflow
- ✅ 6 migration files chi tiết
- ✅ Entity relationships và indexes
- ✅ Database performance optimization
- ✅ Backup và restore procedures
- ✅ Common database issues
- ✅ Schema design best practices

#### Khi nào sử dụng:
- Database schema changes
- Create hoặc modify migrations
- Database performance tuning
- Data integrity issues
- Backup và recovery operations

### 9. Scripts & Tools AGENT.md
**Vị trí**: `/scripts/AGENT.md`
**Chức năng**: Hướng dẫn sử dụng automation scripts và tools

#### Nội dung chính:
- ✅ Development scripts (Protocol buffer generation)
- ✅ Database scripts (Setup và management)
- ✅ Setup scripts (Environment installation)
- ✅ Testing scripts (API testing automation)
- ✅ Utility scripts (Status checking, cleanup)
- ✅ Build tools và deployment utilities

#### Khi nào sử dụng:
- Setup development environment
- Generate protobuf code
- Database management tasks
- Automated testing workflows
- System status monitoring
- Build và deployment processes

## 🔄 AGENT.md Usage Workflow

### Cho AI Agents mới
```
1. Đọc Root AGENT.md → Hiểu tổng quan system
2. Đọc specific AGENT.md → Hiểu module cần làm việc
3. Follow build instructions → Setup development environment
4. Reference common issues → Troubleshoot problems
```

### Cho Development Tasks
```
Backend Service Implementation:
Root AGENT.md → Backend AGENT.md → gRPC Services AGENT.md → Repository AGENT.md → Database AGENT.md

Frontend Component Development:
Root AGENT.md → Frontend AGENT.md → Components AGENT.md → Proto AGENT.md

Full-Stack Feature Development:
Root AGENT.md → Proto AGENT.md → gRPC Services AGENT.md → Repository AGENT.md → Components AGENT.md

API Changes:
Proto AGENT.md → gRPC Services AGENT.md → Frontend AGENT.md → Components AGENT.md

Database Changes:
Database AGENT.md → Repository AGENT.md → gRPC Services AGENT.md

Development Environment Setup:
Root AGENT.md → Scripts AGENT.md → Backend AGENT.md → Frontend AGENT.md
```

## 📊 AGENT.md Content Matrix

| File | Overview | Build | Layout | Issues | Testing | Performance | Examples |
|------|----------|-------|--------|--------|---------|-------------|----------|
| Root | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Backend | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| gRPC Services | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Repository | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Frontend | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Components | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Proto | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Database | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Scripts | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |

**Legend**: ✅ Complete, ⚠️ Partial/Planned

## 🔧 Maintenance Guidelines

### Updating AGENT.md Files
1. **When to update**:
   - Major architecture changes
   - New dependencies or tools
   - Build process changes
   - Common issues discovered
   - Performance optimizations

2. **What to update**:
   - Commands và scripts
   - File paths và structure
   - Dependencies versions
   - Environment variables
   - Troubleshooting steps

3. **How to update**:
   - Test all commands before documenting
   - Include actual error messages
   - Provide working solutions
   - Keep examples current

### Quality Checklist
- [ ] All commands are tested và working
- [ ] File paths are accurate
- [ ] Dependencies versions are current
- [ ] Examples are functional
- [ ] Common issues have solutions
- [ ] Performance tips are validated

## 🎯 Benefits for AI Agents

### Reduced Context Switching
- Agents don't need to explore codebase extensively
- Quick access to verified commands và procedures
- Clear understanding of project structure

### Faster Problem Resolution
- Common issues với proven solutions
- Troubleshooting steps for typical problems
- Performance optimization guidelines

### Consistent Development Practices
- Standardized workflows
- Best practices enforcement
- Quality guidelines

### Improved Code Quality
- Proper testing procedures
- Performance considerations
- Security best practices

## 📈 Usage Analytics (Planned)

### Metrics to Track
- Which AGENT.md files are accessed most
- Common issues that need better documentation
- Commands that fail frequently
- Performance bottlenecks in workflows

### Improvement Areas
- Add more detailed examples
- Include video tutorials for complex procedures
- Create interactive troubleshooting guides
- Expand testing documentation

## 🔮 Future Enhancements

### Planned Additions
1. **Interactive Examples**: Code snippets that can be executed
2. **Video Tutorials**: Screen recordings for complex procedures
3. **Automated Testing**: Validate AGENT.md instructions automatically
4. **Version Tracking**: Track changes và compatibility
5. **Integration Testing**: End-to-end workflow validation

### Advanced Features
1. **AI-Powered Updates**: Automatically update based on code changes
2. **Context-Aware Help**: Show relevant sections based on current task
3. **Performance Monitoring**: Track command execution times
4. **Error Analytics**: Analyze common failure patterns

---

## 🚀 Quick Reference

### Essential Commands
```bash
# Start entire system
./start-project.ps1

# Backend development
make dev                    # Backend
cd apps/frontend && pnpm dev  # Frontend

# Generate code
make proto                  # Go code
./scripts/development/gen-proto-web.ps1  # TypeScript

# Database
make db-up && make migrate  # Setup database
```

### File Locations
- **Root Guide**: `/AGENT.md`
- **Backend Guide**: `/apps/backend/AGENT.md`
- **gRPC Services Guide**: `/apps/backend/internal/grpc/AGENT.md`
- **Repository Guide**: `/apps/backend/internal/repository/AGENT.md`
- **Frontend Guide**: `/apps/frontend/AGENT.md`
- **Components Guide**: `/apps/frontend/src/components/AGENT.md`
- **Proto Guide**: `/packages/proto/AGENT.md`
- **Database Guide**: `/packages/database/AGENT.md`
- **Scripts Guide**: `/scripts/AGENT.md`

### When in Doubt
1. Check relevant AGENT.md file
2. Look for similar issues in other AGENT.md files
3. Refer to Root AGENT.md for general guidance
4. Test commands in development environment first
