# Container Restructuring Plan
## Phase 0 - Task 0.3: Container Restructuring Analysis

### **Current Container Analysis**

Based on the analysis of `internal/container/container.go`, here's the current dependency injection structure and required changes:

#### **Current Container Structure Issues**

1. **Massive Container Struct (121 fields):**
   - 38 fields in Container struct
   - Multiple auth services: `AuthMgmt`, `JWTService`, `EnhancedJWTService`, `OAuthService`
   - Duplicate service patterns: `QuestionMgmt` + `QuestionFilterMgmt`
   - Mixed abstraction levels: repositories, services, gRPC services, middleware

2. **Complex Import Statement (35+ imports):**
   ```go
   // Current problematic imports
   import (
       "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
       "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/oauth"
       "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/scoring"
       auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
       question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"
       question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"
       exam_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/exam_mgmt"
       // ... 30+ more imports
   )
   ```

3. **Service Registration Conflicts:**
   - Multiple auth services: `AuthMgmt`, `JWTService`, `EnhancedJWTService`
   - Fragmented question services: `QuestionMgmt` + `QuestionFilterMgmt`
   - Complex initialization order dependencies
   - 348 lines of initialization code

### **Target Container Structure**

#### **New Import Structure:**
```go
// Simplified feature-based imports
import (
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/notification"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/validation"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/analytics"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/security"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/performance"
)
```

#### **New Service Registration Pattern:**
```go
// Feature-based service registration
func (c *Container) RegisterServices() {
    // Core Services
    c.RegisterAuthService()
    c.RegisterUserService()
    c.RegisterQuestionService()
    c.RegisterExamService()
    
    // Supporting Services
    c.RegisterNotificationService()
    c.RegisterValidationService()
    c.RegisterAnalyticsService()
    c.RegisterSecurityService()
    c.RegisterPerformanceService()
}
```

### **Container Restructuring Steps**

#### **Step 1: Backup Current Container**
```bash
# Create backup of current container
cp internal/container/container.go internal/container/container.go.backup
```

#### **Step 2: Update Import Statements**

**Before (Current):**
```go
import (
    // Multiple conflicting imports
    domainAuth "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
    mgmtAuth "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
    domainUser "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/user"
    mgmtUser "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/user"
    // ... many more
)
```

**After (Target):**
```go
import (
    // Clean feature-based imports
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/notification"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/validation"
)
```

#### **Step 3: Update Service Registration Methods**

**Auth Service Registration:**
```go
func (c *Container) RegisterAuthService() {
    authService := auth.NewAuthService(
        c.GetRepository(),
        c.GetLogger(),
        c.GetConfig(),
    )
    c.services["auth"] = authService
}
```

**User Service Registration:**
```go
func (c *Container) RegisterUserService() {
    userService := user.NewUserService(
        c.GetRepository(),
        c.GetLogger(),
        c.GetValidationService(),
    )
    c.services["user"] = userService
}
```

**Question Service Registration:**
```go
func (c *Container) RegisterQuestionService() {
    questionService := question.NewQuestionService(
        c.GetRepository(),
        c.GetLogger(),
        c.GetValidationService(),
        c.GetSearchEngine(),
    )
    c.services["question"] = questionService
}
```

**Exam Service Registration:**
```go
func (c *Container) RegisterExamService() {
    examService := exam.NewExamService(
        c.GetRepository(),
        c.GetLogger(),
        c.GetQuestionService(),
        c.GetScoringEngine(),
    )
    c.services["exam"] = examService
}
```

#### **Step 4: Update Service Getter Methods**

**Before (Current):**
```go
func (c *Container) GetDomainAuthService() domainAuth.AuthService {
    return c.services["domain_auth"].(domainAuth.AuthService)
}

func (c *Container) GetMgmtAuthService() mgmtAuth.AuthManager {
    return c.services["mgmt_auth"].(mgmtAuth.AuthManager)
}
```

**After (Target):**
```go
func (c *Container) GetAuthService() auth.AuthService {
    return c.services["auth"].(auth.AuthService)
}

func (c *Container) GetUserService() user.UserService {
    return c.services["user"].(user.UserService)
}

func (c *Container) GetQuestionService() question.QuestionService {
    return c.services["question"].(question.QuestionService)
}

func (c *Container) GetExamService() exam.ExamService {
    return c.services["exam"].(exam.ExamService)
}
```

#### **Step 5: Update Dependency Injection**

**Service Dependencies:**
```go
// Clear dependency hierarchy
func (c *Container) initializeDependencies() {
    // Base services (no dependencies)
    c.RegisterValidationService()
    c.RegisterNotificationService()
    
    // Core services (depend on base services)
    c.RegisterAuthService()
    c.RegisterUserService()
    
    // Business services (depend on core services)
    c.RegisterQuestionService()
    c.RegisterExamService()
    
    // Analytics services (depend on business services)
    c.RegisterAnalyticsService()
    c.RegisterPerformanceService()
}
```

### **Container Interface Updates**

#### **New Container Interface:**
```go
type Container interface {
    // Core Services
    GetAuthService() auth.AuthService
    GetUserService() user.UserService
    GetQuestionService() question.QuestionService
    GetExamService() exam.ExamService
    
    // Supporting Services
    GetNotificationService() notification.NotificationService
    GetValidationService() validation.ValidationService
    GetAnalyticsService() analytics.AnalyticsService
    GetSecurityService() security.SecurityService
    GetPerformanceService() performance.PerformanceService
    
    // Infrastructure
    GetRepository() repository.Repository
    GetLogger() *logrus.Logger
    GetConfig() *config.Config
}
```

### **Migration Strategy**

#### **Phase 1: Preparation**
1. Create backup of current container
2. Analyze all current service dependencies
3. Create dependency mapping document
4. Plan migration order based on dependencies

#### **Phase 2: Implementation**
1. Update import statements
2. Create new service registration methods
3. Update service getter methods
4. Test each service individually

#### **Phase 3: Integration**
1. Update all files using container services
2. Run integration tests
3. Verify all services work correctly
4. Performance testing

#### **Phase 4: Cleanup**
1. Remove old service registration code
2. Clean up unused imports
3. Update documentation
4. Remove backup files

### **Validation Steps**

1. **Dependency Check:**
   ```bash
   go mod tidy
   go build ./...
   ```

2. **Service Resolution Test:**
   ```go
   func TestServiceResolution(t *testing.T) {
       container := NewContainer()
       
       authService := container.GetAuthService()
       assert.NotNil(t, authService)
       
       userService := container.GetUserService()
       assert.NotNil(t, userService)
       
       // Test all services...
   }
   ```

3. **Integration Test:**
   ```bash
   go test ./internal/container/...
   go test ./internal/service/...
   ```

### **Rollback Plan**

If issues occur during migration:

1. **Immediate Rollback:**
   ```bash
   cp internal/container/container.go.backup internal/container/container.go
   git checkout -- internal/container/
   ```

2. **Service-by-Service Rollback:**
   - Revert specific service registrations
   - Restore old import statements
   - Test after each rollback step

### **Success Criteria**

- [ ] All services registered without conflicts
- [ ] Clean import statements (no duplicates)
- [ ] Clear dependency hierarchy
- [ ] All tests passing
- [ ] Performance maintained
- [ ] No circular dependencies
- [ ] Easy service resolution
- [ ] Maintainable code structure
