# Interface Consolidation Plan
## Phase 0 - Task 0.2: Interface Consolidation Planning

### **Current Interface Analysis**

Based on the codebase analysis, here are the identified interface overlaps and consolidation requirements:

#### **1. Auth Service Interfaces**

**Current State:**
- `internal/interfaces/services.go` - Contains `AuthServiceInterface`
- `service_mgmt/auth/auth_mgmt.go` - Contains `IAuthService` interface
- `domain_service/auth/` - Contains actual `AuthService` struct

**Interface Overlap:**
```go
// interfaces/services.go - AuthServiceInterface
type AuthServiceInterface interface {
    Login(email, password string) (*entity.User, string, error)
    Register(email, password, firstName, lastName string) (*entity.User, error)
    ValidateToken(tokenString string) (*auth.Claims, error)
    IsAdmin(userID string) (bool, error)
    IsTeacherOrAdmin(userID string) (bool, error)
    IsStudent(userID string) (bool, error)
    GetUserRole(userID string) (string, error)
}

// service_mgmt/auth - IAuthService (with database parameter)
type IAuthService interface {
    Login(db database.QueryExecer, email, password string) (*entity.User, string, error)
    Register(db database.QueryExecer, email, password, firstName, lastName string) (*entity.User, error)
    ValidateToken(tokenString string) (*authService.Claims, error)
    IsAdmin(db database.QueryExecer, userID string) (bool, error)
    IsTeacherOrAdmin(db database.QueryExecer, userID string) (bool, error)
    IsStudent(db database.QueryExecer, userID string) (bool, error)
    GetUserRole(db database.QueryExecer, userID string) (string, error)
}
```

**Consolidation Strategy:**
- Merge into single `AuthService` interface
- Combine JWT operations with user authentication
- Location: `internal/service/auth/`

#### **2. User Service Interfaces**

**Current State:**
- `internal/interfaces/services.go` - Contains `UserServiceInterface`
- `service_mgmt/user/user_mgmt.go` - Contains `IUserService` interface
- `domain_service/user/` - Contains actual `UserService` struct

**Interface Overlap:**
```go
// interfaces/services.go - UserServiceInterface
type UserServiceInterface interface {
    GetUser(ctx context.Context, userID string) (user entity.User, err error)
    ListUsers(offset int, limit int) (total int, users []entity.User, err error)
    GetStudentByPaging(offset int, limit int) (total int, users []entity.User, err error)
}

// service_mgmt/user - IUserService (with database parameter)
type IUserService interface {
    GetStudentByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error)
    GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
    GetAll(db database.QueryExecer) ([]entity.User, error)
    GetUsersByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error)
}
```

**Consolidation Strategy:**
- Merge into comprehensive `UserService` interface
- Include both CRUD operations and domain logic
- Location: `internal/service/user/`

#### **3. Question Management Interfaces**

**Current State:**
- `internal/interfaces/services.go` - Contains `QuestionServiceInterface`
- `service_mgmt/question_mgmt/` - Contains `QuestionMgmt` struct (no explicit interface)
- `service_mgmt/question_filter/` - Question filtering logic

**Interface Overlap:**
```go
// interfaces/services.go - QuestionServiceInterface
type QuestionServiceInterface interface {
    GetQuestion(ctx context.Context, questionID string) (question entity.Question, err error)
    ListQuestions(offset int, limit int) (total int, questions []entity.Question, err error)
    CreateQuestion(ctx context.Context, question *entity.Question) error
    UpdateQuestion(ctx context.Context, question *entity.Question) error
    DeleteQuestion(ctx context.Context, questionID string) error
}

// service_mgmt/question_mgmt - QuestionMgmt methods (no interface defined)
// Methods: CreateQuestion, GetQuestionByID, UpdateQuestion, DeleteQuestion,
//          GetQuestionsByPaging, SearchQuestions, BulkImportQuestions, etc.
```

**Consolidation Strategy:**
- Merge into single `QuestionService` interface
- Combine CRUD with filtering and search capabilities
- Location: `internal/service/question/`

#### **4. Exam Management Interfaces**

**Current State:**
- `internal/interfaces/services.go` - Contains `ExamServiceInterface`
- `service_mgmt/exam_mgmt/` - Contains `ExamMgmt` struct (no explicit interface)
- `domain_service/exam/interfaces.go` - Contains `ServiceInterface`

**Interface Overlap:**
```go
// interfaces/services.go - ExamServiceInterface
type ExamServiceInterface interface {
    GetExam(ctx context.Context, examID string) (exam entity.Exam, err error)
    ListExams(offset int, limit int) (total int, exams []entity.Exam, err error)
    CreateExam(ctx context.Context, exam *entity.Exam) error
    UpdateExam(ctx context.Context, exam *entity.Exam) error
    DeleteExam(ctx context.Context, examID string) error
}

// domain_service/exam - ServiceInterface
type ServiceInterface interface {
    GetAll(requestorUserID string) ([]entity.Exam, error)
    GetByID(examID string, requestorUserID string) (*entity.Exam, error)
    Create(exam *entity.Exam, requestorUserID string) (*entity.Exam, error)
    Update(examID string, exam *entity.Exam, requestorUserID string) (*entity.Exam, error)
    Delete(examID string, requestorUserID string) error
    StartExam(examID string, userID string) (*entity.ExamAttempt, error)
    SubmitExam(attemptID string, answers map[string]string, userID string) (*entity.ExamAttempt, error)
}
```

**Consolidation Strategy:**
- Merge into comprehensive `ExamService` interface
- Include exam management, domain logic, and scoring
- Location: `internal/service/exam/`

### **Interface Consolidation Steps**

#### **Step 1: Create Consolidated Interface Definitions**

Create new interface files in target locations:

```bash
# Create new service directories
mkdir -p internal/service/auth
mkdir -p internal/service/user  
mkdir -p internal/service/question
mkdir -p internal/service/exam
mkdir -p internal/service/notification
mkdir -p internal/service/validation
```

#### **Step 2: Define Consolidated Interfaces**

**Auth Service Interface:**
```go
// internal/service/auth/interface.go
type AuthService interface {
    // JWT Operations
    GenerateJWT(userID string) (string, error)
    ValidateJWT(token string) (*Claims, error)
    RefreshToken(token string) (string, error)
    
    // Authentication Operations
    AuthenticateUser(email, password string) (*User, error)
    RegisterUser(userData UserData) error
    ResetPassword(email string) error
    
    // OAuth Operations
    HandleOAuthCallback(provider, code string) (*User, error)
    GetOAuthURL(provider string) string
}
```

**User Service Interface:**
```go
// internal/service/user/interface.go
type UserService interface {
    // CRUD Operations
    CreateUser(userData UserData) (*User, error)
    GetUser(userID string) (*User, error)
    UpdateUser(userID string, updates UserUpdates) error
    DeleteUser(userID string) error
    
    // Domain Logic
    ValidateUserData(user *User) error
    CalculateUserStats(userID string) (*UserStats, error)
    GetUsersByRole(role UserRole) ([]User, error)
}
```

**Question Service Interface:**
```go
// internal/service/question/interface.go
type QuestionService interface {
    // CRUD Operations
    CreateQuestion(q *Question) error
    GetQuestion(id string) (*Question, error)
    UpdateQuestion(id string, q *Question) error
    DeleteQuestion(id string) error
    
    // Filtering & Search
    FilterByDifficulty(questions []Question, level Difficulty) []Question
    FilterByCategory(questions []Question, category string) []Question
    SearchQuestions(query string) ([]Question, error)
    
    // Bulk Operations
    BulkImportQuestions(questions []Question) error
    ExportQuestions(filter QuestionFilter) ([]Question, error)
}
```

**Exam Service Interface:**
```go
// internal/service/exam/interface.go
type ExamService interface {
    // Exam Management
    CreateExam(exam *Exam) error
    GetExam(id string) (*Exam, error)
    UpdateExam(id string, exam *Exam) error
    DeleteExam(id string) error
    
    // Exam Execution
    StartExam(examID, userID string) (*ExamSession, error)
    SubmitAnswer(sessionID string, answer *Answer) error
    FinishExam(sessionID string) (*ExamResult, error)
    
    // Scoring & Grading
    AutoGradeExam(sessionID string) (*ExamResult, error)
    CalculateScore(answers []Answer) float64
    GenerateExamReport(examID string) (*ExamReport, error)
}
```

#### **Step 3: Implementation Migration Strategy**

1. **Create Implementation Files:**
   - Move and merge implementation code from both layers
   - Ensure all interface methods are implemented
   - Maintain backward compatibility during transition

2. **Update Container Registration:**
   - Modify `internal/container/container.go`
   - Register new consolidated services
   - Remove old service registrations

3. **Update Import Statements:**
   - Update all files importing old services
   - Use new consolidated service interfaces
   - Remove references to old service paths

### **Validation Checklist**

- [ ] All interface methods from both layers are included
- [ ] No duplicate method signatures
- [ ] Implementation covers all existing functionality
- [ ] Container properly registers new services
- [ ] All import statements updated
- [ ] Tests updated to use new interfaces
- [ ] No circular dependencies introduced
- [ ] Backward compatibility maintained during transition

### **Risk Mitigation**

1. **Gradual Migration:**
   - Implement one service at a time
   - Test each service before moving to next
   - Keep old services until migration complete

2. **Rollback Strategy:**
   - Maintain backup of original structure
   - Document all changes for easy reversal
   - Test rollback procedure before starting

3. **Testing Strategy:**
   - Unit tests for each consolidated service
   - Integration tests for service interactions
   - End-to-end tests for complete workflows

### **Success Criteria**

- [ ] All services consolidated into feature-based structure
- [ ] No interface duplication
- [ ] All tests passing
- [ ] Performance maintained or improved
- [ ] Code coverage maintained
- [ ] Documentation updated
