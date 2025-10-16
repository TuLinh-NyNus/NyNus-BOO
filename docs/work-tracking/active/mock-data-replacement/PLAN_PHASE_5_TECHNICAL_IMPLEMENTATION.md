# PLAN Phase 5: Technical Implementation Plan
**Date**: 2025-01-19  
**Status**: PLAN Phase 5 - Technical Specifications  
**Methodology**: RIPER-5 PLAN Mode

## Executive Summary

### Technical Approach
Document này cung cấp technical specifications chi tiết cho việc migration từ mock data sang real implementation, bao gồm:
- Backend gRPC service implementation
- Database schema changes và migrations
- Frontend service layer updates
- Component refactoring requirements
- Testing strategy (unit + integration + E2E)

### Modules Covered
1. **MockQuestionsService** (Sprint 1 - Critical)
2. **ExamService Protobuf** (Sprint 2 - High)
3. **Questions Search** (Sprint 2 - High)

---

## 1. Module 1: MockQuestionsService Migration

### 1.1 Backend Implementation

#### 1.1.1 gRPC Service Methods

**File**: `apps/backend/internal/grpc/question_service.go`

**Method 1: CreateQuestion**
```go
// CreateQuestion creates a new question
func (s *QuestionServiceServer) CreateQuestion(
    ctx context.Context,
    req *v1.CreateQuestionRequest,
) (*v1.CreateQuestionResponse, error) {
    // 1. Validate input
    if err := validateCreateQuestionRequest(req); err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "invalid request: %v", err)
    }

    // 2. Extract user from context
    userID, err := auth.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // 3. Convert protobuf to domain model
    question := &models.Question{
        Content:        req.Content,
        Type:           req.Type,
        Difficulty:     req.Difficulty,
        Subject:        req.Subject,
        Grade:          req.Grade,
        QuestionCodeID: req.QuestionCodeId,
        CreatedBy:      userID,
        Status:         "draft", // Default status
    }

    // 4. Handle answers
    for _, ans := range req.Answers {
        question.Answers = append(question.Answers, models.Answer{
            Content:   ans.Content,
            IsCorrect: ans.IsCorrect,
            Order:     ans.Order,
        })
    }

    // 5. Handle images (if any)
    for _, img := range req.Images {
        question.Images = append(question.Images, models.QuestionImage{
            URL:         img.Url,
            Caption:     img.Caption,
            Order:       img.Order,
        })
    }

    // 6. Handle tags
    question.Tags = req.Tags

    // 7. Create question in database
    createdQuestion, err := s.questionRepo.Create(ctx, question)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to create question: %v", err)
    }

    // 8. Audit log
    s.auditLog.Log(ctx, "question.create", userID, createdQuestion.ID)

    // 9. Convert to protobuf response
    return &v1.CreateQuestionResponse{
        Question: convertQuestionToProto(createdQuestion),
    }, nil
}
```

**Validation Function**:
```go
func validateCreateQuestionRequest(req *v1.CreateQuestionRequest) error {
    if req.Content == "" {
        return errors.New("content is required")
    }
    if req.Type == "" {
        return errors.New("type is required")
    }
    if req.Difficulty == "" {
        return errors.New("difficulty is required")
    }
    if len(req.Answers) == 0 {
        return errors.New("at least one answer is required")
    }
    
    // Validate at least one correct answer for multiple choice
    if req.Type == "multiple-choice" {
        hasCorrect := false
        for _, ans := range req.Answers {
            if ans.IsCorrect {
                hasCorrect = true
                break
            }
        }
        if !hasCorrect {
            return errors.New("multiple choice must have at least one correct answer")
        }
    }
    
    return nil
}
```

---

**Method 2: UpdateQuestion**
```go
// UpdateQuestion updates an existing question
func (s *QuestionServiceServer) UpdateQuestion(
    ctx context.Context,
    req *v1.UpdateQuestionRequest,
) (*v1.UpdateQuestionResponse, error) {
    // 1. Validate input
    if req.QuestionId == "" {
        return nil, status.Errorf(codes.InvalidArgument, "question_id is required")
    }

    // 2. Get user from context
    userID, err := auth.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // 3. Get existing question
    existingQuestion, err := s.questionRepo.GetByID(ctx, req.QuestionId)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "question not found")
    }

    // 4. Check permissions (only creator or admin can update)
    if !canUpdateQuestion(userID, existingQuestion) {
        return nil, status.Errorf(codes.PermissionDenied, "no permission to update")
    }

    // 5. Update fields (only update provided fields)
    if req.Content != "" {
        existingQuestion.Content = req.Content
    }
    if req.Type != "" {
        existingQuestion.Type = req.Type
    }
    if req.Difficulty != "" {
        existingQuestion.Difficulty = req.Difficulty
    }
    // ... update other fields

    // 6. Update answers (replace all)
    if len(req.Answers) > 0 {
        existingQuestion.Answers = []models.Answer{}
        for _, ans := range req.Answers {
            existingQuestion.Answers = append(existingQuestion.Answers, models.Answer{
                Content:   ans.Content,
                IsCorrect: ans.IsCorrect,
                Order:     ans.Order,
            })
        }
    }

    // 7. Update in database
    updatedQuestion, err := s.questionRepo.Update(ctx, existingQuestion)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to update question: %v", err)
    }

    // 8. Audit log
    s.auditLog.Log(ctx, "question.update", userID, updatedQuestion.ID)

    // 9. Return response
    return &v1.UpdateQuestionResponse{
        Question: convertQuestionToProto(updatedQuestion),
    }, nil
}
```

---

**Method 3: DeleteQuestion**
```go
// DeleteQuestion soft deletes a question
func (s *QuestionServiceServer) DeleteQuestion(
    ctx context.Context,
    req *v1.DeleteQuestionRequest,
) (*v1.DeleteQuestionResponse, error) {
    // 1. Validate input
    if req.QuestionId == "" {
        return nil, status.Errorf(codes.InvalidArgument, "question_id is required")
    }

    // 2. Get user from context
    userID, err := auth.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // 3. Get existing question
    question, err := s.questionRepo.GetByID(ctx, req.QuestionId)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "question not found")
    }

    // 4. Check permissions
    if !canDeleteQuestion(userID, question) {
        return nil, status.Errorf(codes.PermissionDenied, "no permission to delete")
    }

    // 5. Check if question is used in exams
    isUsed, err := s.examRepo.IsQuestionUsedInExams(ctx, req.QuestionId)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to check question usage")
    }
    if isUsed && !req.Force {
        return nil, status.Errorf(codes.FailedPrecondition, 
            "question is used in exams, use force=true to delete")
    }

    // 6. Soft delete (set deleted_at timestamp)
    err = s.questionRepo.SoftDelete(ctx, req.QuestionId)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to delete question: %v", err)
    }

    // 7. Audit log
    s.auditLog.Log(ctx, "question.delete", userID, req.QuestionId)

    // 8. Return success
    return &v1.DeleteQuestionResponse{
        Success: true,
        Message: "Question deleted successfully",
    }, nil
}
```

---

**Method 4: ImportQuestions**
```go
// ImportQuestions imports questions from LaTeX file
func (s *QuestionServiceServer) ImportQuestions(
    ctx context.Context,
    req *v1.ImportQuestionsRequest,
) (*v1.ImportQuestionsResponse, error) {
    // 1. Validate input
    if req.LatexContent == "" {
        return nil, status.Errorf(codes.InvalidArgument, "latex_content is required")
    }

    // 2. Get user from context
    userID, err := auth.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // 3. Parse LaTeX content
    parser := latex.NewQuestionParser()
    parsedQuestions, parseErrors := parser.Parse(req.LatexContent)

    // 4. Validate parsed questions
    validQuestions := []models.Question{}
    importErrors := []string{}
    
    for i, q := range parsedQuestions {
        if err := validateQuestion(&q); err != nil {
            importErrors = append(importErrors, 
                fmt.Sprintf("Question %d: %v", i+1, err))
            continue
        }
        
        // Set metadata
        q.CreatedBy = userID
        q.Status = "draft"
        q.Source = "latex_import"
        
        validQuestions = append(validQuestions, q)
    }

    // 5. Bulk insert valid questions
    var createdQuestions []models.Question
    if len(validQuestions) > 0 {
        createdQuestions, err = s.questionRepo.BulkCreate(ctx, validQuestions)
        if err != nil {
            return nil, status.Errorf(codes.Internal, 
                "failed to import questions: %v", err)
        }
    }

    // 6. Audit log
    s.auditLog.Log(ctx, "question.import", userID, 
        fmt.Sprintf("imported %d questions", len(createdQuestions)))

    // 7. Return response with results
    return &v1.ImportQuestionsResponse{
        TotalParsed:   int32(len(parsedQuestions)),
        TotalImported: int32(len(createdQuestions)),
        TotalErrors:   int32(len(importErrors) + len(parseErrors)),
        Questions:     convertQuestionsToProto(createdQuestions),
        Errors:        append(importErrors, parseErrors...),
    }, nil
}
```

---

#### 1.1.2 Database Schema Changes

**No schema changes required** - All tables already exist:
- ✅ `question` table
- ✅ `question_code` table
- ✅ `question_image` table
- ✅ `question_tag` table
- ✅ `question_feedback` table

**Indexes to add** (for performance):
```sql
-- Add index for question search
CREATE INDEX idx_question_content_search ON question USING gin(to_tsvector('english', content));

-- Add index for filtering
CREATE INDEX idx_question_type_difficulty ON question(type, difficulty);
CREATE INDEX idx_question_subject_grade ON question(subject, grade);
CREATE INDEX idx_question_created_by ON question(created_by);
CREATE INDEX idx_question_status ON question(status);

-- Add index for soft delete
CREATE INDEX idx_question_deleted_at ON question(deleted_at) WHERE deleted_at IS NULL;
```

---

#### 1.1.3 Repository Layer Updates

**File**: `apps/backend/internal/repository/question_repository.go`

**Add methods**:
```go
// BulkCreate creates multiple questions in one transaction
func (r *QuestionRepository) BulkCreate(ctx context.Context, questions []models.Question) ([]models.Question, error) {
    tx := r.db.WithContext(ctx).Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    createdQuestions := []models.Question{}
    for _, q := range questions {
        if err := tx.Create(&q).Error; err != nil {
            tx.Rollback()
            return nil, err
        }
        createdQuestions = append(createdQuestions, q)
    }

    if err := tx.Commit().Error; err != nil {
        return nil, err
    }

    return createdQuestions, nil
}

// SoftDelete marks question as deleted
func (r *QuestionRepository) SoftDelete(ctx context.Context, id string) error {
    return r.db.WithContext(ctx).
        Model(&models.Question{}).
        Where("id = ?", id).
        Update("deleted_at", time.Now()).
        Error
}

// IsQuestionUsedInExams checks if question is used in any exam
func (r *ExamRepository) IsQuestionUsedInExams(ctx context.Context, questionID string) (bool, error) {
    var count int64
    err := r.db.WithContext(ctx).
        Model(&models.ExamQuestion{}).
        Where("question_id = ?", questionID).
        Count(&count).
        Error
    return count > 0, err
}
```

---

### 1.2 Frontend Implementation

#### 1.2.1 Service Layer Updates

**File**: `apps/frontend/src/services/grpc/question.service.ts`

**Add methods**:
```typescript
import { QuestionServiceClient } from '@/proto/question_grpc_web_pb';
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  DeleteQuestionRequest,
  ImportQuestionsRequest,
} from '@/proto/question_pb';

export class QuestionService {
  private client: QuestionServiceClient;

  constructor() {
    this.client = new QuestionServiceClient(process.env.NEXT_PUBLIC_GRPC_URL!);
  }

  /**
   * Create new question
   */
  async createQuestion(data: CreateQuestionInput): Promise<Question> {
    const request = new CreateQuestionRequest();
    request.setContent(data.content);
    request.setType(data.type);
    request.setDifficulty(data.difficulty);
    request.setSubject(data.subject);
    request.setGrade(data.grade);
    request.setQuestionCodeId(data.questionCodeId);

    // Add answers
    data.answers.forEach((answer) => {
      const ans = new Answer();
      ans.setContent(answer.content);
      ans.setIsCorrect(answer.isCorrect);
      ans.setOrder(answer.order);
      request.addAnswers(ans);
    });

    // Add images
    data.images?.forEach((image) => {
      const img = new QuestionImage();
      img.setUrl(image.url);
      img.setCaption(image.caption);
      img.setOrder(image.order);
      request.addImages(img);
    });

    // Add tags
    request.setTagsList(data.tags || []);

    const response = await this.client.createQuestion(request, this.getMetadata());
    return convertProtoToQuestion(response.getQuestion()!);
  }

  /**
   * Update existing question
   */
  async updateQuestion(id: string, data: UpdateQuestionInput): Promise<Question> {
    const request = new UpdateQuestionRequest();
    request.setQuestionId(id);
    
    if (data.content) request.setContent(data.content);
    if (data.type) request.setType(data.type);
    if (data.difficulty) request.setDifficulty(data.difficulty);
    // ... set other fields

    // Update answers
    if (data.answers) {
      data.answers.forEach((answer) => {
        const ans = new Answer();
        ans.setContent(answer.content);
        ans.setIsCorrect(answer.isCorrect);
        ans.setOrder(answer.order);
        request.addAnswers(ans);
      });
    }

    const response = await this.client.updateQuestion(request, this.getMetadata());
    return convertProtoToQuestion(response.getQuestion()!);
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string, force: boolean = false): Promise<void> {
    const request = new DeleteQuestionRequest();
    request.setQuestionId(id);
    request.setForce(force);

    await this.client.deleteQuestion(request, this.getMetadata());
  }

  /**
   * Import questions from LaTeX
   */
  async importQuestions(latexContent: string): Promise<ImportResult> {
    const request = new ImportQuestionsRequest();
    request.setLatexContent(latexContent);

    const response = await this.client.importQuestions(request, this.getMetadata());
    
    return {
      totalParsed: response.getTotalParsed(),
      totalImported: response.getTotalImported(),
      totalErrors: response.getTotalErrors(),
      questions: response.getQuestionsList().map(convertProtoToQuestion),
      errors: response.getErrorsList(),
    };
  }

  private getMetadata() {
    // Add auth token to metadata
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
  }
}

export const questionService = new QuestionService();
```

---

#### 1.2.2 Component Updates

**File 1**: `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx`

**Changes**:
```typescript
// ❌ REMOVE
import { MockQuestionsService } from '@/services/mock/questions';

// ✅ ADD
import { questionService } from '@/services/grpc/question.service';

// Update handleSubmit function
const handleSubmit = async (data: QuestionFormData) => {
  try {
    setLoading(true);
    
    // ❌ REMOVE
    // const result = await MockQuestionsService.createQuestion(data);
    
    // ✅ ADD
    const result = await questionService.createQuestion(data);
    
    toast.success('Tạo câu hỏi thành công');
    router.push('/3141592654/admin/questions');
  } catch (error) {
    toast.error('Lỗi khi tạo câu hỏi');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

---

**File 2**: `apps/frontend/src/app/3141592654/admin/questions/edit/[id]/page.tsx`

**Changes**:
```typescript
// Update imports
import { questionService } from '@/services/grpc/question.service';

// Update data fetching
useEffect(() => {
  const fetchQuestion = async () => {
    try {
      // ✅ Use real service (already implemented)
      const question = await questionService.getQuestion(params.id);
      setQuestion(question);
    } catch (error) {
      toast.error('Không tìm thấy câu hỏi');
    }
  };
  fetchQuestion();
}, [params.id]);

// Update handleSubmit
const handleSubmit = async (data: QuestionFormData) => {
  try {
    setLoading(true);
    
    // ✅ ADD
    await questionService.updateQuestion(params.id, data);
    
    toast.success('Cập nhật câu hỏi thành công');
    router.push('/3141592654/admin/questions');
  } catch (error) {
    toast.error('Lỗi khi cập nhật câu hỏi');
  } finally {
    setLoading(false);
  }
};
```

---

**File 3**: `apps/frontend/src/app/3141592654/admin/questions/import/page.tsx`

**Changes**:
```typescript
import { questionService } from '@/services/grpc/question.service';

const handleImport = async (latexContent: string) => {
  try {
    setLoading(true);
    
    // ✅ ADD
    const result = await questionService.importQuestions(latexContent);
    
    setImportResult(result);
    toast.success(`Đã import ${result.totalImported}/${result.totalParsed} câu hỏi`);
    
    if (result.totalErrors > 0) {
      toast.warning(`Có ${result.totalErrors} lỗi khi import`);
    }
  } catch (error) {
    toast.error('Lỗi khi import câu hỏi');
  } finally {
    setLoading(false);
  }
};
```

---

**File 4**: `apps/frontend/src/app/3141592654/admin/questions/bulk-edit/page.tsx`

**Changes**:
```typescript
import { questionService } from '@/services/grpc/question.service';

const handleBulkDelete = async (questionIds: string[]) => {
  try {
    setLoading(true);
    
    // ✅ ADD - Delete in parallel
    await Promise.all(
      questionIds.map(id => questionService.deleteQuestion(id, false))
    );
    
    toast.success(`Đã xóa ${questionIds.length} câu hỏi`);
    refreshQuestions();
  } catch (error) {
    toast.error('Lỗi khi xóa câu hỏi');
  } finally {
    setLoading(false);
  }
};
```

---

**File 5**: Remove `apps/frontend/src/services/mock/questions.ts`

---

### 1.3 Testing Strategy

#### 1.3.1 Backend Unit Tests

**File**: `apps/backend/internal/grpc/question_service_test.go`

```go
func TestCreateQuestion(t *testing.T) {
    // Test cases
    tests := []struct {
        name    string
        request *v1.CreateQuestionRequest
        wantErr bool
    }{
        {
            name: "valid question",
            request: &v1.CreateQuestionRequest{
                Content:    "What is 2+2?",
                Type:       "multiple-choice",
                Difficulty: "easy",
                Answers: []*v1.Answer{
                    {Content: "3", IsCorrect: false},
                    {Content: "4", IsCorrect: true},
                },
            },
            wantErr: false,
        },
        {
            name: "missing content",
            request: &v1.CreateQuestionRequest{
                Type: "multiple-choice",
            },
            wantErr: true,
        },
        // ... more test cases
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

**Coverage Target**: ≥ 90%

---

#### 1.3.2 Frontend Unit Tests

**File**: `apps/frontend/src/services/grpc/question.service.test.ts`

```typescript
describe('QuestionService', () => {
  describe('createQuestion', () => {
    it('should create question successfully', async () => {
      const mockData = {
        content: 'Test question',
        type: 'multiple-choice',
        difficulty: 'easy',
        answers: [
          { content: 'Answer 1', isCorrect: true, order: 1 },
        ],
      };

      const result = await questionService.createQuestion(mockData);
      
      expect(result).toBeDefined();
      expect(result.content).toBe(mockData.content);
    });

    it('should handle errors', async () => {
      await expect(
        questionService.createQuestion({} as any)
      ).rejects.toThrow();
    });
  });
});
```

**Coverage Target**: ≥ 80%

---

#### 1.3.3 Integration Tests

**File**: `apps/backend/tests/integration/question_test.go`

```go
func TestQuestionCRUDFlow(t *testing.T) {
    // 1. Create question
    createReq := &v1.CreateQuestionRequest{...}
    createResp, err := client.CreateQuestion(ctx, createReq)
    assert.NoError(t, err)
    questionID := createResp.Question.Id

    // 2. Get question
    getResp, err := client.GetQuestion(ctx, &v1.GetQuestionRequest{
        QuestionId: questionID,
    })
    assert.NoError(t, err)
    assert.Equal(t, createReq.Content, getResp.Question.Content)

    // 3. Update question
    updateReq := &v1.UpdateQuestionRequest{
        QuestionId: questionID,
        Content:    "Updated content",
    }
    updateResp, err := client.UpdateQuestion(ctx, updateReq)
    assert.NoError(t, err)
    assert.Equal(t, "Updated content", updateResp.Question.Content)

    // 4. Delete question
    deleteReq := &v1.DeleteQuestionRequest{QuestionId: questionID}
    _, err = client.DeleteQuestion(ctx, deleteReq)
    assert.NoError(t, err)

    // 5. Verify deleted
    _, err = client.GetQuestion(ctx, &v1.GetQuestionRequest{
        QuestionId: questionID,
    })
    assert.Error(t, err) // Should return NotFound
}
```

---

#### 1.3.4 E2E Tests

**File**: `apps/frontend/tests/e2e/question-management.spec.ts`

```typescript
test('admin can create, edit, and delete question', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to create question page
  await page.goto('/3141592654/admin/questions/create');

  // Fill form
  await page.fill('[name="content"]', 'Test question');
  await page.selectOption('[name="type"]', 'multiple-choice');
  await page.selectOption('[name="difficulty"]', 'easy');
  
  // Add answer
  await page.click('button:has-text("Thêm câu trả lời")');
  await page.fill('[name="answers[0].content"]', 'Answer 1');
  await page.check('[name="answers[0].isCorrect"]');

  // Submit
  await page.click('button:has-text("Tạo câu hỏi")');

  // Verify success
  await expect(page.locator('text=Tạo câu hỏi thành công')).toBeVisible();
  
  // ... test edit and delete
});
```

---

## 2. Module 2: ExamService Protobuf Conversion

### 2.1 Frontend Implementation

#### 2.1.1 Protobuf Type Conversion

**File**: `apps/frontend/src/services/grpc/exam.service.ts`

**Remove mock functions**:
```typescript
// ❌ REMOVE these functions
function createMockExam(data: any) { ... }
function createMockExamAttempt(data: any) { ... }
function createMockExamResult(data: any) { ... }
```

**Update service methods**:
```typescript
export class ExamService {
  async createExam(data: CreateExamInput): Promise<Exam> {
    const request = new CreateExamRequest();
    request.setTitle(data.title);
    request.setDescription(data.description);
    request.setDuration(data.duration);
    request.setTotalPoints(data.totalPoints);
    
    // Add questions
    data.questionIds.forEach(id => {
      request.addQuestionIds(id);
    });

    const response = await this.client.createExam(request, this.getMetadata());
    
    // ✅ Use real protobuf response
    return convertProtoToExam(response.getExam()!);
  }

  async startExamAttempt(examId: string): Promise<ExamAttempt> {
    const request = new StartExamAttemptRequest();
    request.setExamId(examId);

    const response = await this.client.startExamAttempt(request, this.getMetadata());
    
    // ✅ Use real protobuf response
    return convertProtoToExamAttempt(response.getAttempt()!);
  }
}
```

---

### 2.2 Testing Strategy

**Unit Tests**: Test protobuf conversion functions  
**Integration Tests**: Test exam flow with real backend  
**E2E Tests**: Test complete exam taking flow

---

## 3. Module 3: Questions Search Page

### 3.1 Frontend Implementation

**File**: `apps/frontend/src/app/questions/search/page.tsx`

**Changes**:
```typescript
// ❌ REMOVE
import { mockSearchResults } from '@/lib/mockdata/questions';

// ✅ ADD
import { questionFilterService } from '@/services/grpc/question-filter.service';

const SearchPage = () => {
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string, filters: SearchFilters) => {
    try {
      setLoading(true);
      
      // ✅ Use real service
      const response = await questionFilterService.searchQuestions({
        query,
        ...filters,
        page: 1,
        pageSize: 20,
      });
      
      setResults(response.questions);
    } catch (error) {
      toast.error('Lỗi khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... UI
  );
};
```

---

## 4. Backward Compatibility

### 4.1 Feature Flags

**Environment Variable**: `NEXT_PUBLIC_USE_MOCK_QUESTIONS`

```typescript
// Feature flag wrapper
export const getQuestionService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_QUESTIONS === 'true') {
    return MockQuestionsService; // Fallback to mock
  }
  return questionService; // Use real service
};
```

### 4.2 Gradual Rollout

**Phase 1**: Deploy backend, keep frontend using mock (1 day)  
**Phase 2**: Enable for admin users only (2 days)  
**Phase 3**: Enable for all users (after testing)

---

**Report Generated**: 2025-01-19  
**Methodology**: RIPER-5 PLAN Mode  
**Status**: ✅ PLAN Phase 5 Complete  
**Next**: PLAN Phase 6 - Risk Assessment & Mitigation

