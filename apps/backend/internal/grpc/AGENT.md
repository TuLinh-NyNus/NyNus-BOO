# gRPC Services Implementation Agent Guide
*Hướng dẫn chi tiết cho AI agents implement gRPC services*

## 📋 Tổng quan gRPC Services

**NyNus gRPC Services** bao gồm 8 services chính được implement trong Go, cung cấp API cho toàn bộ hệ thống.

### Services Overview
- **UserService** - Authentication & user management
- **QuestionService** - Question CRUD operations
- **QuestionFilterService** - Advanced question filtering
- **AdminService** - Admin operations & system management
- **ProfileService** - User profile management
- **ContactService** - Contact form handling
- **NewsletterService** - Newsletter subscription
- **NotificationService** - Notification system

## 🏗️ Service Implementation Structure

```
apps/backend/internal/grpc/
├── user_service.go              # Authentication & user management
├── user_service_enhanced.go     # Enhanced user features
├── question_service.go          # Question CRUD operations
├── question_filter_service.go   # Advanced filtering
├── admin_service.go             # Admin operations
├── profile_service.go           # User profiles
├── contact_service.go           # Contact forms
├── newsletter_service.go        # Newsletter management
├── notification_service.go      # Notifications
└── preference_service.go.bak    # Deprecated preferences
```

## 🔐 UserService Implementation

### Core Methods
```go
// Authentication methods
func (s *UserService) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error)
func (s *UserService) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.RegisterResponse, error)
func (s *UserService) GoogleLogin(ctx context.Context, req *pb.GoogleLoginRequest) (*pb.LoginResponse, error)
func (s *UserService) RefreshToken(ctx context.Context, req *pb.RefreshTokenRequest) (*pb.RefreshTokenResponse, error)
func (s *UserService) Logout(ctx context.Context, req *pb.LogoutRequest) (*pb.LogoutResponse, error)

// Profile management
func (s *UserService) GetUserProfile(ctx context.Context, req *pb.GetUserProfileRequest) (*pb.GetUserProfileResponse, error)
func (s *UserService) UpdateUserProfile(ctx context.Context, req *pb.UpdateUserProfileRequest) (*pb.UpdateUserProfileResponse, error)
func (s *UserService) ChangePassword(ctx context.Context, req *pb.ChangePasswordRequest) (*pb.ChangePasswordResponse, error)
```

### Authentication Flow Implementation
```go
func (s *UserService) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
    // 1. Validate input
    if err := s.validateLoginRequest(req); err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "Invalid request: %v", err)
    }

    // 2. Get user from database
    user, err := s.userRepo.GetByEmail(ctx, req.GetEmail())
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "User not found")
    }

    // 3. Verify password
    if !s.verifyPassword(req.GetPassword(), user.PasswordHash) {
        return nil, status.Errorf(codes.Unauthenticated, "Invalid credentials")
    }

    // 4. Generate tokens
    accessToken, err := s.generateAccessToken(user)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to generate access token")
    }

    refreshToken, err := s.generateRefreshToken(user)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to generate refresh token")
    }

    // 5. Create session
    session, err := s.createSession(ctx, user, req)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to create session")
    }

    return &pb.LoginResponse{
        Success:      true,
        AccessToken:  accessToken,
        RefreshToken: refreshToken,
        SessionToken: session.Token,
        User:         s.convertUserToProto(user),
        ExpiresAt:    timestamppb.New(time.Now().Add(15 * time.Minute)),
    }, nil
}
```

## 📝 QuestionService Implementation

### Core Methods
```go
func (s *QuestionService) CreateQuestion(ctx context.Context, req *pb.CreateQuestionRequest) (*pb.CreateQuestionResponse, error)
func (s *QuestionService) GetQuestion(ctx context.Context, req *pb.GetQuestionRequest) (*pb.GetQuestionResponse, error)
func (s *QuestionService) UpdateQuestion(ctx context.Context, req *pb.UpdateQuestionRequest) (*pb.UpdateQuestionResponse, error)
func (s *QuestionService) DeleteQuestion(ctx context.Context, req *pb.DeleteQuestionRequest) (*pb.DeleteQuestionResponse, error)
func (s *QuestionService) ListQuestions(ctx context.Context, req *pb.ListQuestionsRequest) (*pb.ListQuestionsResponse, error)
func (s *QuestionService) BulkCreateQuestions(ctx context.Context, req *pb.BulkCreateQuestionsRequest) (*pb.BulkCreateQuestionsResponse, error)
```

### Question Creation with LaTeX Processing
```go
func (s *QuestionService) CreateQuestion(ctx context.Context, req *pb.CreateQuestionRequest) (*pb.CreateQuestionResponse, error) {
    // 1. Validate request
    if err := s.validateCreateQuestionRequest(req); err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "Invalid request: %v", err)
    }

    // 2. Process LaTeX content
    processedContent, err := s.latexProcessor.ProcessContent(req.GetContent())
    if err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "LaTeX processing failed: %v", err)
    }

    // 3. Generate question code
    questionCode, err := s.generateQuestionCode(req.GetSubject(), req.GetTopic())
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to generate question code")
    }

    // 4. Create question entity
    question := &entity.Question{
        ID:            uuid.New().String(),
        Content:       processedContent,
        QuestionType:  req.GetQuestionType().String(),
        Difficulty:    req.GetDifficulty().String(),
        Subject:       req.GetSubject(),
        Topic:         req.GetTopic(),
        CreatedBy:     s.getUserIDFromContext(ctx),
        CreatedAt:     time.Now(),
    }

    // 5. Save to database
    if err := s.questionRepo.Create(ctx, question); err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to create question: %v", err)
    }

    // 6. Process answers
    for _, answerReq := range req.GetAnswers() {
        answer := &entity.Answer{
            ID:          uuid.New().String(),
            QuestionID:  question.ID,
            Content:     answerReq.GetContent(),
            IsCorrect:   answerReq.GetIsCorrect(),
            Explanation: answerReq.GetExplanation(),
            OrderIndex:  answerReq.GetOrderIndex(),
        }
        
        if err := s.answerRepo.Create(ctx, answer); err != nil {
            return nil, status.Errorf(codes.Internal, "Failed to create answer: %v", err)
        }
    }

    return &pb.CreateQuestionResponse{
        Success:  true,
        Question: s.convertQuestionToProto(question),
        Code:     questionCode,
    }, nil
}
```

## 🔍 QuestionFilterService Implementation

### Advanced Filtering Methods
```go
func (s *QuestionFilterService) FilterQuestions(ctx context.Context, req *pb.FilterQuestionsRequest) (*pb.FilterQuestionsResponse, error)
func (s *QuestionFilterService) GetFilterOptions(ctx context.Context, req *pb.GetFilterOptionsRequest) (*pb.GetFilterOptionsResponse, error)
func (s *QuestionFilterService) SearchQuestions(ctx context.Context, req *pb.SearchQuestionsRequest) (*pb.SearchQuestionsResponse, error)
func (s *QuestionFilterService) GetQuestionsByCode(ctx context.Context, req *pb.GetQuestionsByCodeRequest) (*pb.GetQuestionsByCodeResponse, error)
```

### Complex Filtering Implementation
```go
func (s *QuestionFilterService) FilterQuestions(ctx context.Context, req *pb.FilterQuestionsRequest) (*pb.FilterQuestionsResponse, error) {
    // 1. Build filter criteria
    filter := &repository.QuestionFilter{
        QuestionTypes:   req.GetQuestionTypes(),
        Difficulties:    req.GetDifficulties(),
        Subjects:        req.GetSubjects(),
        Topics:          req.GetTopics(),
        CreatedBy:       req.GetCreatedBy(),
        Tags:            req.GetTags(),
        DateRange:       s.convertDateRange(req.GetDateRange()),
        QuestionCodes:   req.GetQuestionCodes(),
        SearchText:      req.GetSearchText(),
        Pagination: &repository.Pagination{
            Page:     int(req.GetPagination().GetPage()),
            PageSize: int(req.GetPagination().GetPageSize()),
            SortBy:   req.GetPagination().GetSortBy(),
            SortOrder: req.GetPagination().GetSortOrder(),
        },
    }

    // 2. Apply filters
    questions, total, err := s.questionFilterRepo.FilterQuestions(ctx, filter)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to filter questions: %v", err)
    }

    // 3. Convert to proto
    protoQuestions := make([]*pb.Question, len(questions))
    for i, q := range questions {
        protoQuestions[i] = s.convertQuestionToProto(q)
    }

    return &pb.FilterQuestionsResponse{
        Success:   true,
        Questions: protoQuestions,
        Pagination: &pb.PaginationResponse{
            CurrentPage:  int32(filter.Pagination.Page),
            PageSize:     int32(filter.Pagination.PageSize),
            TotalPages:   int32((total + int64(filter.Pagination.PageSize) - 1) / int64(filter.Pagination.PageSize)),
            TotalItems:   total,
            HasNext:      filter.Pagination.Page < int((total+int64(filter.Pagination.PageSize)-1)/int64(filter.Pagination.PageSize)),
            HasPrevious:  filter.Pagination.Page > 1,
        },
    }, nil
}
```

## 👨‍💼 AdminService Implementation

### Admin Operations
```go
func (s *AdminService) GetUsers(ctx context.Context, req *pb.GetUsersRequest) (*pb.GetUsersResponse, error)
func (s *AdminService) UpdateUserRole(ctx context.Context, req *pb.UpdateUserRoleRequest) (*pb.UpdateUserRoleResponse, error)
func (s *AdminService) GetSystemStats(ctx context.Context, req *pb.GetSystemStatsRequest) (*pb.GetSystemStatsResponse, error)
func (s *AdminService) GetAuditLogs(ctx context.Context, req *pb.GetAuditLogsRequest) (*pb.GetAuditLogsResponse, error)
func (s *AdminService) ManageContent(ctx context.Context, req *pb.ManageContentRequest) (*pb.ManageContentResponse, error)
```

### Role-Based Access Control
```go
func (s *AdminService) UpdateUserRole(ctx context.Context, req *pb.UpdateUserRoleRequest) (*pb.UpdateUserRoleResponse, error) {
    // 1. Check admin permissions
    currentUser := s.getUserFromContext(ctx)
    if !s.hasAdminPermission(currentUser, "user_management") {
        return nil, status.Errorf(codes.PermissionDenied, "Insufficient permissions")
    }

    // 2. Validate role hierarchy
    if !s.canAssignRole(currentUser.Role, req.GetNewRole()) {
        return nil, status.Errorf(codes.PermissionDenied, "Cannot assign higher role")
    }

    // 3. Update user role
    user, err := s.userRepo.GetByID(ctx, req.GetUserId())
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "User not found")
    }

    user.Role = req.GetNewRole().String()
    user.UpdatedAt = time.Now()

    if err := s.userRepo.Update(ctx, user); err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to update user role")
    }

    // 4. Log audit event
    s.auditLogger.LogRoleChange(ctx, currentUser.ID, user.ID, user.Role, req.GetNewRole().String())

    return &pb.UpdateUserRoleResponse{
        Success: true,
        User:    s.convertUserToProto(user),
    }, nil
}
```

## 🔧 Service Implementation Patterns

### Error Handling Pattern
```go
func (s *Service) Method(ctx context.Context, req *pb.Request) (*pb.Response, error) {
    // 1. Input validation
    if err := s.validateRequest(req); err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "Invalid request: %v", err)
    }

    // 2. Authorization check
    if !s.isAuthorized(ctx, "required_permission") {
        return nil, status.Errorf(codes.PermissionDenied, "Insufficient permissions")
    }

    // 3. Business logic
    result, err := s.performBusinessLogic(ctx, req)
    if err != nil {
        // Log error for debugging
        s.logger.WithError(err).Error("Business logic failed")
        
        // Return appropriate gRPC error
        switch err {
        case repository.ErrNotFound:
            return nil, status.Errorf(codes.NotFound, "Resource not found")
        case repository.ErrDuplicate:
            return nil, status.Errorf(codes.AlreadyExists, "Resource already exists")
        default:
            return nil, status.Errorf(codes.Internal, "Internal server error")
        }
    }

    // 4. Success response
    return &pb.Response{
        Success: true,
        Data:    result,
    }, nil
}
```

### Context Utilities
```go
// Extract user ID from context
func (s *Service) getUserIDFromContext(ctx context.Context) string {
    if userID, ok := ctx.Value("user_id").(string); ok {
        return userID
    }
    return ""
}

// Extract user from context
func (s *Service) getUserFromContext(ctx context.Context) *entity.User {
    if user, ok := ctx.Value("user").(*entity.User); ok {
        return user
    }
    return nil
}

// Check permissions
func (s *Service) hasPermission(ctx context.Context, permission string) bool {
    user := s.getUserFromContext(ctx)
    if user == nil {
        return false
    }
    return s.permissionChecker.HasPermission(user.Role, permission)
}
```

## 🧪 Testing gRPC Services

### Unit Test Structure
```go
func TestUserService_Login(t *testing.T) {
    // Setup
    mockUserRepo := &mocks.UserRepository{}
    mockTokenService := &mocks.TokenService{}
    service := NewUserService(mockUserRepo, mockTokenService)

    // Test cases
    tests := []struct {
        name           string
        request        *pb.LoginRequest
        setupMocks     func()
        expectedError  error
        expectedResult *pb.LoginResponse
    }{
        {
            name: "successful login",
            request: &pb.LoginRequest{
                Email:    "test@example.com",
                Password: "password123",
            },
            setupMocks: func() {
                mockUserRepo.On("GetByEmail", mock.Anything, "test@example.com").
                    Return(&entity.User{
                        ID:           "user-123",
                        Email:        "test@example.com",
                        PasswordHash: "$2a$10$hashedpassword",
                    }, nil)
            },
            expectedError: nil,
            expectedResult: &pb.LoginResponse{
                Success: true,
                User: &pb.User{
                    Id:    "user-123",
                    Email: "test@example.com",
                },
            },
        },
    }

    // Run tests
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            tt.setupMocks()
            
            result, err := service.Login(context.Background(), tt.request)
            
            if tt.expectedError != nil {
                assert.Error(t, err)
                assert.Contains(t, err.Error(), tt.expectedError.Error())
            } else {
                assert.NoError(t, err)
                assert.Equal(t, tt.expectedResult.Success, result.Success)
            }
        })
    }
}
```

## ⚠️ Common Implementation Issues

### 1. Context Timeout Handling
```go
func (s *Service) LongRunningOperation(ctx context.Context, req *pb.Request) (*pb.Response, error) {
    // Set timeout for database operations
    dbCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()

    // Check context cancellation
    select {
    case <-ctx.Done():
        return nil, status.Errorf(codes.Canceled, "Request canceled")
    default:
        // Continue with operation
    }

    result, err := s.repo.LongOperation(dbCtx, req)
    if err != nil {
        if errors.Is(err, context.DeadlineExceeded) {
            return nil, status.Errorf(codes.DeadlineExceeded, "Operation timeout")
        }
        return nil, status.Errorf(codes.Internal, "Operation failed: %v", err)
    }

    return &pb.Response{Success: true, Data: result}, nil
}
```

### 2. Proper Error Mapping
```go
func mapRepositoryError(err error) error {
    switch {
    case errors.Is(err, repository.ErrNotFound):
        return status.Errorf(codes.NotFound, "Resource not found")
    case errors.Is(err, repository.ErrDuplicate):
        return status.Errorf(codes.AlreadyExists, "Resource already exists")
    case errors.Is(err, repository.ErrInvalidInput):
        return status.Errorf(codes.InvalidArgument, "Invalid input: %v", err)
    case errors.Is(err, context.DeadlineExceeded):
        return status.Errorf(codes.DeadlineExceeded, "Request timeout")
    default:
        return status.Errorf(codes.Internal, "Internal server error")
    }
}
```

## 📊 Performance Considerations

### 1. Database Query Optimization
```go
// Use prepared statements for repeated queries
func (s *Service) GetQuestionsByIDs(ctx context.Context, ids []string) ([]*entity.Question, error) {
    // Batch query instead of N+1 queries
    return s.questionRepo.GetByIDs(ctx, ids)
}

// Implement pagination for large result sets
func (s *Service) ListQuestions(ctx context.Context, req *pb.ListQuestionsRequest) (*pb.ListQuestionsResponse, error) {
    pagination := &repository.Pagination{
        Page:     int(req.GetPagination().GetPage()),
        PageSize: min(int(req.GetPagination().GetPageSize()), 100), // Limit page size
    }
    
    questions, total, err := s.questionRepo.List(ctx, pagination)
    // ... rest of implementation
}
```

### 2. Caching Strategy
```go
func (s *Service) GetQuestion(ctx context.Context, req *pb.GetQuestionRequest) (*pb.GetQuestionResponse, error) {
    // Check cache first
    if cached, found := s.cache.Get(req.GetId()); found {
        return cached.(*pb.GetQuestionResponse), nil
    }

    // Fetch from database
    question, err := s.questionRepo.GetByID(ctx, req.GetId())
    if err != nil {
        return nil, mapRepositoryError(err)
    }

    response := &pb.GetQuestionResponse{
        Success:  true,
        Question: s.convertQuestionToProto(question),
    }

    // Cache the result
    s.cache.Set(req.GetId(), response, 5*time.Minute)

    return response, nil
}
```

---

**🚀 Quick Service Development:**
1. Define proto service and messages
2. Generate Go code with `make proto`
3. Implement service methods with proper error handling
4. Add input validation and authorization
5. Write unit tests
6. Test with gRPC client

**🔧 Best Practices:**
1. Always validate input parameters
2. Use proper gRPC status codes
3. Implement proper error handling
4. Add comprehensive logging
5. Use context for cancellation and timeouts
6. Implement proper authorization checks
