# Phase 11 - Subtask 11.1: RESEARCH Analysis
## Backend QuestionService Implementation Analysis

**Date**: 2025-01-19  
**Status**: ✅ COMPLETE  
**Augment Context Engine Calls**: 10/10  

---

## 📋 Executive Summary

**Research Objective**: Phân tích chi tiết backend QuestionService implementation để chuẩn bị implement 4 missing gRPC methods.

**Key Findings**:
1. ✅ **Service Layer**: FULLY IMPLEMENTED - QuestionService có đầy đủ 4 methods (CreateQuestion, UpdateQuestion, DeleteQuestion, GetQuestionsByPaging)
2. ✅ **Repository Layer**: FULLY IMPLEMENTED - QuestionRepository có đầy đủ CRUD operations
3. ✅ **Entity Structure**: COMPLETE - entity.Question có 22 fields với pgtype types
4. ✅ **Protobuf Definitions**: COMPLETE - CreateQuestionRequest, UpdateQuestionRequest, DeleteQuestionRequest, ListQuestionsRequest đã defined
5. ⚠️ **gRPC Layer**: PARTIALLY IMPLEMENTED - Chỉ có GetQuestion() và ListQuestions() (pagination only)

**Conclusion**: Backend service layer và repository layer đã sẵn sàng 100%. Chỉ cần implement gRPC wrapper layer để expose existing service methods qua gRPC protocol.

---

## 1️⃣ Entity.Question Structure Analysis

### 1.1 Complete Field List (22 fields)

```go
// apps/backend/internal/entity/question.go (lines 38-66)
type Question struct {
    // Core fields
    ID            pgtype.Text      `json:"id"`              // UUID primary key
    RawContent    pgtype.Text      `json:"raw_content"`     // LaTeX gốc từ user
    Content       pgtype.Text      `json:"content"`         // Nội dung đã xử lý (cleaned)
    Subcount      pgtype.Text      `json:"subcount"`        // [XX.N] format
    Type          pgtype.Text      `json:"type"`            // QuestionType enum (MC, TF, SA, ES, MA)
    Source        pgtype.Text      `json:"source"`          // Nguồn câu hỏi
    
    // Answer data (JSONB)
    Answers       pgtype.JSONB     `json:"answers"`         // JSON array of answer options
    CorrectAnswer pgtype.JSONB     `json:"correct_answer"`  // JSON of correct answer(s)
    Solution      pgtype.Text      `json:"solution"`        // Lời giải chi tiết
    Tag           pgtype.TextArray `json:"tag"`             // Tags array
    
    // Optional classification (for filtering only)
    Grade         pgtype.Text      `json:"grade"`           // Lớp (0,1,2) - Optional
    Subject       pgtype.Text      `json:"subject"`         // Môn học (P,L,H) - Optional
    Chapter       pgtype.Text      `json:"chapter"`         // Chương (1-9) - Optional
    Level         pgtype.Text      `json:"level"`           // Mức độ (N,H,V,C,T,M) - Optional
    
    // Usage tracking
    UsageCount    pgtype.Int4      `json:"usage_count"`     // Số lần sử dụng
    Creator       pgtype.Text      `json:"creator"`         // Người tạo
    Status        pgtype.Text      `json:"status"`          // QuestionStatus enum
    Feedback      pgtype.Int4      `json:"feedback"`        // Điểm feedback
    Difficulty    pgtype.Text      `json:"difficulty"`      // QuestionDifficulty enum
    
    // Timestamps & relationships
    CreatedAt     pgtype.Timestamptz `json:"created_at"`
    UpdatedAt     pgtype.Timestamptz `json:"updated_at"`
    QuestionCodeID pgtype.Text       `json:"question_code_id"` // FK to QuestionCode
}
```

### 1.2 Enum Types

**QuestionType** (5 types):
- `MC` - Multiple Choice
- `TF` - True/False
- `SA` - Short Answer
- `ES` - Essay
- `MA` - Matching (⚠️ Not fully supported yet)

**QuestionStatus** (4 statuses):
- `ACTIVE` - Hoạt động
- `PENDING` - Đang chờ duyệt
- `INACTIVE` - Không hoạt động
- `ARCHIVED` - Đã lưu trữ

**QuestionDifficulty** (4 levels):
- `EASY` - Dễ
- `MEDIUM` - Trung bình
- `HARD` - Khó
- `EXPERT` - Chuyên gia

### 1.3 Validation Rules

```go
// apps/backend/internal/entity/parse_error.go (lines 72-86)
QuestionValidationRules = []ValidationRule{
    {
        Field:     "content",
        Required:  true,
        Type:      "text",
        MinLength: 10,
        MaxLength: 5000,
        Suggestions: []string{
            "Nội dung câu hỏi phải có ít nhất 10 ký tự",
            "Kiểm tra lại định dạng LaTeX",
            "Đảm bảo có đầy đủ thông tin câu hỏi",
        },
        ErrorType: ParseErrorTypeMissingField,
        Severity:  ParseErrorSeverityError,
    },
}
```

---

## 2️⃣ Repository Layer Analysis

### 2.1 QuestionRepository Interface

```go
// apps/backend/internal/repository/interfaces/question_repository.go (lines 10-36)
type QuestionRepository interface {
    // Basic CRUD operations
    Create(ctx context.Context, question *entity.Question) error
    GetByID(ctx context.Context, id string) (*entity.Question, error)
    Update(ctx context.Context, question *entity.Question) error
    Delete(ctx context.Context, id string) error

    // Batch operations
    CreateBatch(ctx context.Context, questions []*entity.Question) error
    GetByIDs(ctx context.Context, ids []string) ([]*entity.Question, error)

    // Listing and pagination
    GetAll(ctx context.Context, offset, limit int) ([]*entity.Question, error)
    Count(ctx context.Context) (int, error)

    // Filtering
    FindWithFilters(ctx context.Context, criteria *FilterCriteria, offset, limit int, sortColumn, sortOrder string) ([]*entity.Question, int, error)

    // Search
    Search(ctx context.Context, searchCriteria SearchCriteria, filterCriteria *FilterCriteria, offset, limit int) ([]*SearchResult, int, error)

    // By QuestionCode
    FindByQuestionCodeID(ctx context.Context, questionCodeID string) ([]*entity.Question, error)
    CountByQuestionCodeID(ctx context.Context, questionCodeID string) (int, error)

    // Statistics
    GetStatistics(ctx context.Context, criteria *FilterCriteria) (*Statistics, error)
}
```

### 2.2 Repository Implementation Details

**Create Operation** (apps/backend/internal/repository/question_repository.go lines 28-84):
- Generates UUID if not provided
- Validates all fields
- Converts pgtype to SQL types
- Handles JSONB fields (answers, correct_answer)
- Handles TextArray (tags)
- Sets timestamps (created_at, updated_at)

**GetByID Operation** (lines 86-172):
- Retrieves single question by ID
- Handles nullable fields (subcount, source, solution)
- Converts SQL types back to pgtype
- Returns error if not found

**Update Operation** (lines 174-225):
- Updates all fields except ID
- Sets updated_at timestamp
- Validates question exists before update
- Handles nullable fields

**Delete Operation** (lines 227-232):
- Hard delete (not soft delete)
- Simple DELETE FROM questions WHERE id = $1

**GetAll with Pagination** (lines 334-354):
- ORDER BY created_at DESC
- LIMIT and OFFSET support
- Returns []*entity.Question

**Count Operation** (lines 356-360):
- Simple COUNT(*) query
- Returns total number of questions

---

## 3️⃣ Service Layer Analysis

### 3.1 QuestionService Structure

```go
// apps/backend/internal/service/question/question_service.go (lines 20-54)
type QuestionService struct {
    questionRepo      interfaces.QuestionRepository
    questionCodeRepo  interfaces.QuestionCodeRepository
    questionImageRepo interfaces.QuestionImageRepository
    imageProcessor    *image_processing.ImageProcessingService
    imageWorkerPool   *image_processing.WorkerPool
    logger            *logrus.Logger
}
```

### 3.2 CreateQuestion Implementation

```go
// apps/backend/internal/service/question/question_service.go (lines 56-92)
func (m *QuestionService) CreateQuestion(ctx context.Context, question *entity.Question) error {
    // 1. Validate question code exists
    if question.QuestionCodeID.Status == pgtype.Present {
        exists, err := m.questionCodeRepo.Exists(ctx, question.QuestionCodeID.String)
        if err != nil {
            return fmt.Errorf("failed to validate question code: %v", err)
        }
        if !exists {
            return fmt.Errorf("question code '%s' does not exist", question.QuestionCodeID.String)
        }
    }

    // 2. Generate ID if not provided
    if question.ID.Status != pgtype.Present || question.ID.String == "" {
        question.ID.Set(uuid.New().String())
    }

    // 3. Set defaults
    if question.Status.Status != pgtype.Present {
        question.Status.Set("PENDING")
    }
    if question.Creator.Status != pgtype.Present {
        question.Creator.Set("ADMIN")
    }
    if question.Difficulty.Status != pgtype.Present {
        question.Difficulty.Set("MEDIUM")
    }
    if question.UsageCount.Status != pgtype.Present {
        question.UsageCount.Set(0)
    }
    if question.Feedback.Status != pgtype.Present {
        question.Feedback.Set(0)
    }

    // 4. Call repository
    return m.questionRepo.Create(ctx, question)
}
```

**Business Logic**:
1. Validate QuestionCode exists (if provided)
2. Generate UUID for new question
3. Set default values (status=PENDING, creator=ADMIN, difficulty=MEDIUM, usage_count=0, feedback=0)
4. Delegate to repository

### 3.3 UpdateQuestion Implementation

```go
// apps/backend/internal/service/question/question_service.go (lines 103-123)
func (m *QuestionService) UpdateQuestion(ctx context.Context, question *entity.Question) error {
    // 1. Validate question exists
    existing, err := m.questionRepo.GetByID(ctx, question.ID.String)
    if err != nil {
        return fmt.Errorf("question not found: %v", err)
    }

    // 2. Validate question code if changed
    if question.QuestionCodeID.String != existing.QuestionCodeID.String {
        exists, err := m.questionCodeRepo.Exists(ctx, question.QuestionCodeID.String)
        if err != nil {
            return fmt.Errorf("failed to validate question code: %v", err)
        }
        if !exists {
            return fmt.Errorf("question code '%s' does not exist", question.QuestionCodeID.String)
        }
    }

    // 3. Call repository
    return m.questionRepo.Update(ctx, question)
}
```

**Business Logic**:
1. Validate question exists
2. Validate new QuestionCode exists (if changed)
3. Delegate to repository

### 3.4 DeleteQuestion Implementation

```go
// apps/backend/internal/service/question/question_service.go (lines 125-128)
func (m *QuestionService) DeleteQuestion(ctx context.Context, id string) error {
    return m.questionRepo.Delete(ctx, id)
}
```

**Business Logic**: Simple delegation to repository (no additional validation)

### 3.5 GetQuestionsByPaging Implementation

```go
// apps/backend/internal/service/question/question_service.go (lines 130-153)
func (m *QuestionService) GetQuestionsByPaging(offset, limit int) (int, []entity.Question, error) {
    ctx := context.Background()

    // Get total count
    total, err := m.questionRepo.Count(ctx)
    if err != nil {
        return 0, nil, err
    }

    // Get questions
    questions, err := m.questionRepo.GetAll(ctx, offset, limit)
    if err != nil {
        return 0, nil, err
    }

    // Convert to entity slice
    result := make([]entity.Question, len(questions))
    for i, q := range questions {
        result[i] = *q
    }

    return total, result, nil
}
```

**Business Logic**:
1. Get total count
2. Get paginated questions
3. Convert []*entity.Question to []entity.Question
4. Return (total, questions, error)

---

## 4️⃣ Protobuf Definitions Analysis

### 4.1 CreateQuestionRequest

```protobuf
// packages/proto/v1/question.proto (lines 84-115)
message CreateQuestionRequest {
  string raw_content = 1;      // LaTeX gốc từ user
  string content = 2;           // Nội dung đã xử lý
  string subcount = 3;          // [XX.N] format
  common.QuestionType type = 4; // MC, TF, SA, ES, MA
  string source = 5;            // Nguồn câu hỏi
  
  // Flexible answer format
  oneof answer_data {
    AnswerList structured_answers = 6;  // For MC/TF questions
    string json_answers = 7;            // For complex answer formats
  }
  
  oneof correct_answer_data {
    CorrectAnswer structured_correct = 8;  // For MC/TF/SA
    string json_correct_answer = 9;        // For complex formats
  }
  
  string solution = 10;           // Lời giải chi tiết
  repeated string tag = 11;       // Tags cho câu hỏi
  
  // Optional classification fields
  string grade = 12;              // Lớp (0,1,2) - Optional
  string subject = 13;            // Môn học (P,L,H) - Optional
  string chapter = 14;            // Chương (1-9) - Optional
  string level = 15;              // Mức độ (N,H,V,C,T,M) - Optional
  
  string question_code_id = 16;   // QuestionCode ID
  common.QuestionStatus status = 17;    // ACTIVE, PENDING, INACTIVE, ARCHIVED
  common.DifficultyLevel difficulty = 18; // EASY, MEDIUM, HARD, EXPERT
  string creator = 19;            // Creator username
}
```

### 4.2 UpdateQuestionRequest

```protobuf
// packages/proto/v1/question.proto (lines 142-172)
message UpdateQuestionRequest {
  string id = 1;                  // Required: Question ID to update
  string raw_content = 2;
  string content = 3;
  string subcount = 4;
  common.QuestionType type = 5;
  string source = 6;
  
  oneof answer_data {
    AnswerList structured_answers = 7;
    string json_answers = 8;
  }
  
  oneof correct_answer_data {
    CorrectAnswer structured_correct = 9;
    string json_correct_answer = 10;
  }
  
  string solution = 11;
  repeated string tag = 12;
  
  // Optional classification fields
  string grade = 13;
  string subject = 14;
  string chapter = 15;
  string level = 16;
  
  string question_code_id = 17;
  common.QuestionStatus status = 18;
  common.DifficultyLevel difficulty = 19;
}
```

### 4.3 DeleteQuestionRequest

```protobuf
// packages/proto/v1/question.proto (lines 180-182)
message DeleteQuestionRequest {
  string id = 1;  // Required: Question ID to delete
}
```

### 4.4 ListQuestionsRequest

```protobuf
// packages/proto/v1/question.proto (lines 131-133)
message ListQuestionsRequest {
  common.PaginationRequest pagination = 1;
}
```

---

## 5️⃣ Existing gRPC Implementations Analysis

### 5.1 GetQuestion() Pattern

```go
// apps/backend/internal/grpc/question_service.go (lines 55-82)
func (s *QuestionServiceServer) GetQuestion(ctx context.Context, req *v1.GetQuestionRequest) (*v1.GetQuestionResponse, error) {
    // 1. Get user from context for authorization
    _, err := middleware.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
    }

    // 2. Validate request
    if req.GetId() == "" {
        return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
    }

    // 3. Get question from service management layer
    question, err := s.questionService.GetQuestionByID(ctx, req.GetId())
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get question: %v", err)
    }

    // 4. Convert entity to proto
    protoQuestion := convertQuestionToProto(&question)

    // 5. Build response
    return &v1.GetQuestionResponse{
        Response: &common.Response{
            Success: true,
            Message: "Question retrieved successfully",
        },
        Question: protoQuestion,
    }, nil
}
```

**Pattern**:
1. Extract userID from context (authentication check)
2. Validate request parameters
3. Call service layer method
4. Convert entity to protobuf
5. Build and return response

### 5.2 ListQuestions() Current Implementation

```go
// apps/backend/internal/grpc/question_service.go (lines 87-157)
func (s *QuestionServiceServer) ListQuestions(ctx context.Context, req *v1.ListQuestionsRequest) (*v1.ListQuestionsResponse, error) {
    // 1. Get user from context for authorization
    _, err := middleware.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
    }

    // 2. Extract pagination parameters
    page := req.GetPagination().GetPage()
    limit := req.GetPagination().GetLimit()

    // 3. Set default values if not provided
    if page <= 0 {
        page = 1
    }
    if limit <= 0 {
        limit = 10
    }

    // 4. Calculate offset from page and limit
    offset := int(page-1) * int(limit)

    // 5. Call QuestionService to get questions list with paging
    total, questions, err := s.questionService.GetQuestionsByPaging(offset, int(limit))
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get questions list: %v", err)
    }

    // 6. Convert entities to proto
    var protoQuestions []*v1.Question
    for _, question := range questions {
        protoQuestion := convertQuestionToProto(&question)
        protoQuestions = append(protoQuestions, protoQuestion)
    }

    // 7. Calculate total pages
    totalPages := int32((total + int(limit) - 1) / int(limit))

    // 8. Build pagination response
    pagination := &common.PaginationResponse{
        Page:       page,
        Limit:      limit,
        TotalCount: int32(total),
        TotalPages: totalPages,
    }

    // 9. Build and return response
    return &v1.ListQuestionsResponse{
        Response: &common.Response{
            Success: true,
            Message: fmt.Sprintf("Successfully retrieved %d questions", len(protoQuestions)),
        },
        Questions:  protoQuestions,
        Pagination: pagination,
    }, nil
}
```

**Pattern**:
1. Extract userID from context
2. Extract and validate pagination parameters
3. Set defaults (page=1, limit=10)
4. Calculate offset
5. Call service layer method
6. Convert entities to protobuf
7. Calculate total pages
8. Build pagination response
9. Build and return response

---

## 6️⃣ Helper Functions Analysis

### 6.1 Util Functions (pgtype converters)

```go
// apps/backend/internal/util/pgtype_converter.go

// String conversions
func PgTextToString(t pgtype.Text) string
func StringToPgText(s string) pgtype.Text

// Integer conversions
func PgInt4ToInt32(i pgtype.Int4) int32
func Int32ToPgInt4(i int32) pgtype.Int4

// Timestamp conversions
func PgTimestamptzToString(t pgtype.Timestamptz) string
func TimeToPgTimestamptz(t time.Time) pgtype.Timestamptz

// JSONB conversions
func PgJSONBToString(j pgtype.JSONB) string
func BytesToPgJSONB(b []byte) pgtype.JSONB

// Array conversions
func PgTextArrayToStringSlice(ta pgtype.TextArray) []string
func StringSliceToPgTextArray(ss []string) pgtype.TextArray

// Nullable conversions
func PgTextToNullString(t pgtype.Text) interface{}
func PgJSONBToNullString(j pgtype.JSONB) interface{}
```

### 6.2 Enum Conversion Functions

```go
// apps/backend/internal/grpc/question_service.go (lines 239-284)

func convertQuestionType(t string) common.QuestionType {
    switch strings.ToUpper(t) {
    case "MC":
        return common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE
    case "TF":
        return common.QuestionType_QUESTION_TYPE_TRUE_FALSE
    case "SA":
        return common.QuestionType_QUESTION_TYPE_SHORT_ANSWER
    case "ES":
        return common.QuestionType_QUESTION_TYPE_ESSAY
    case "MA":
        return common.QuestionType_QUESTION_TYPE_UNSPECIFIED // MA not supported
    default:
        return common.QuestionType_QUESTION_TYPE_UNSPECIFIED
    }
}

func convertDifficulty(d string) common.DifficultyLevel {
    switch strings.ToUpper(d) {
    case "EASY":
        return common.DifficultyLevel_DIFFICULTY_LEVEL_EASY
    case "MEDIUM":
        return common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM
    case "HARD":
        return common.DifficultyLevel_DIFFICULTY_LEVEL_HARD
    case "EXPERT":
        return common.DifficultyLevel_DIFFICULTY_LEVEL_HARD // EXPERT maps to HARD
    default:
        return common.DifficultyLevel_DIFFICULTY_LEVEL_UNSPECIFIED
    }
}

func convertQuestionStatus(s string) common.QuestionStatus {
    switch strings.ToUpper(s) {
    case "ACTIVE":
        return common.QuestionStatus_QUESTION_STATUS_ACTIVE
    case "PENDING":
        return common.QuestionStatus_QUESTION_STATUS_PENDING
    case "INACTIVE":
        return common.QuestionStatus_QUESTION_STATUS_INACTIVE
    case "ARCHIVED":
        return common.QuestionStatus_QUESTION_STATUS_ARCHIVED
    default:
        return common.QuestionStatus_QUESTION_STATUS_UNSPECIFIED
    }
}
```

### 6.3 Entity to Proto Conversion

```go
// apps/backend/internal/grpc/question_service.go (lines 214-237)
func convertQuestionToProto(question *entity.Question) *v1.Question {
    return &v1.Question{
        Id:         util.PgTextToString(question.ID),
        RawContent: util.PgTextToString(question.RawContent),
        Content:    util.PgTextToString(question.Content),
        Subcount:   util.PgTextToString(question.Subcount),
        Type:       convertQuestionType(util.PgTextToString(question.Type)),
        Source:     util.PgTextToString(question.Source),
        Solution:   util.PgTextToString(question.Solution),
        
        // Handle JSONB fields
        JsonAnswers:        util.PgJSONBToString(question.Answers),
        JsonCorrectAnswer:  util.PgJSONBToString(question.CorrectAnswer),
        
        // Handle array fields
        Tag: util.PgTextArrayToStringSlice(question.Tag),
        
        // Handle enum fields
        Status:     convertQuestionStatus(util.PgTextToString(question.Status)),
        Difficulty: convertDifficulty(util.PgTextToString(question.Difficulty)),
        
        // Handle integer fields
        UsageCount: util.PgInt4ToInt32(question.UsageCount),
        Feedback:   util.PgInt4ToInt32(question.Feedback),
        
        // Handle timestamps
        CreatedAt: util.PgTimestamptzToString(question.CreatedAt),
        UpdatedAt: util.PgTimestamptzToString(question.UpdatedAt),
        
        // Handle foreign key
        QuestionCodeId: util.PgTextToString(question.QuestionCodeID),
        Creator:        util.PgTextToString(question.Creator),
    }
}
```

---

## 7️⃣ Error Handling Patterns

### 7.1 gRPC Error Codes

```go
// From apps/backend/internal/grpc/AGENT.md and existing implementations

// Validation errors
codes.InvalidArgument  // Invalid input parameters
codes.NotFound         // Resource not found
codes.AlreadyExists    // Duplicate resource

// Authentication/Authorization errors
codes.Unauthenticated  // User not authenticated
codes.PermissionDenied // Insufficient permissions

// Server errors
codes.Internal         // Internal server error
codes.Unimplemented    // Method not implemented
codes.Unavailable      // Service unavailable
```

### 7.2 Error Handling Pattern

```go
// Pattern from existing implementations

// 1. Validation errors
if req.GetId() == "" {
    return nil, status.Errorf(codes.InvalidArgument, "id is required")
}

// 2. Not found errors
question, err := s.questionService.GetQuestionByID(ctx, req.GetId())
if err != nil {
    if strings.Contains(err.Error(), "not found") {
        return nil, status.Errorf(codes.NotFound, "question not found: %s", req.GetId())
    }
    return nil, status.Errorf(codes.Internal, "failed to get question: %v", err)
}

// 3. Internal errors (log details, return generic message)
if err != nil {
    s.logger.WithError(err).Error("Failed to create question")
    return nil, status.Errorf(codes.Internal, "failed to create question")
}
```

---

## 8️⃣ Middleware & Context

### 8.1 GetUserIDFromContext

```go
// apps/backend/internal/middleware/auth_interceptor.go (lines 221-229)
func GetUserIDFromContext(ctx context.Context) (string, error) {
    userID, ok := ctx.Value(userIDKey).(string)
    if !ok {
        return "", status.Errorf(codes.Internal, ErrUserIDNotFoundInContext)
    }
    return userID, nil
}
```

**Usage**: Extract authenticated user ID from gRPC context (injected by auth interceptor)

---

## 9️⃣ Implementation Recommendations

### 9.1 CreateQuestion() gRPC Method

**Steps**:
1. Extract userID from context (for creator field)
2. Validate request (required fields: content, type, difficulty)
3. Convert protobuf request to entity.Question
4. Set creator from userID
5. Call s.questionService.CreateQuestion(ctx, question)
6. Convert entity to protobuf
7. Return success response

**Error Handling**:
- `codes.InvalidArgument`: Missing required fields
- `codes.NotFound`: QuestionCode not found
- `codes.Internal`: Database errors

### 9.2 UpdateQuestion() gRPC Method

**Steps**:
1. Extract userID from context
2. Validate request (required: id)
3. Convert protobuf request to entity.Question
4. Call s.questionService.UpdateQuestion(ctx, question)
5. Convert updated entity to protobuf
6. Return success response

**Error Handling**:
- `codes.InvalidArgument`: Missing ID
- `codes.NotFound`: Question not found
- `codes.Internal`: Database errors

### 9.3 DeleteQuestion() gRPC Method

**Steps**:
1. Extract userID from context
2. Validate request (required: id)
3. Call s.questionService.DeleteQuestion(ctx, id)
4. Return success response

**Error Handling**:
- `codes.InvalidArgument`: Missing ID
- `codes.NotFound`: Question not found
- `codes.Internal`: Database errors

### 9.4 Complete ListQuestions() gRPC Method

**Current**: Only pagination support  
**Needed**: Add filtering, sorting, search support

**Steps**:
1. Extract userID from context
2. Extract pagination, filters, sorting from request
3. Build FilterCriteria from request
4. Call s.questionService.GetQuestionsByFilter(ctx, criteria, offset, limit, sortColumn, sortOrder)
5. Convert entities to protobuf
6. Build pagination response
7. Return success response

---

## 🎯 Next Steps

**Subtask 11.2 - PLAN**: Create detailed implementation plan with exact code for each gRPC method

**Ready to Implement**:
- ✅ Service layer methods available
- ✅ Repository methods available
- ✅ Entity structure complete
- ✅ Protobuf definitions complete
- ✅ Helper functions available
- ✅ Error handling patterns established
- ✅ Existing implementations as reference

**Estimated Implementation Time**: 2-3 hours for all 4 methods

---

**Research Completed**: 2025-01-19  
**Augment Context Engine Calls**: 10/10 ✅  
**Status**: READY FOR PLANNING PHASE

