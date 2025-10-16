# Phase 10: MockQuestionsService Migration Plan

**Created**: 2025-01-19  
**Status**: ⚠️ BLOCKED - Pending Backend Implementation  
**Estimated Effort**: 12-16 hours (4-8h backend + 4h frontend + 2h testing + 2h review)

---

## 🚨 BLOCKER STATUS

**Critical Blocker**: Backend gRPC layer missing 4 methods

**Missing Methods**:
1. `CreateQuestion()` - Used by 3 pages (create, inputques, inputauto)
2. `UpdateQuestion()` - Used by 1 page (edit)
3. `DeleteQuestion()` - Used by question list actions
4. `ListQuestions()` - Partially implemented (needs complete filtering)

**Backend Work Required**: 4-8 hours  
**Assignee**: Backend team  
**Priority**: HIGH

**Once Backend is Ready**: This plan can be executed immediately

---

## 📋 Migration Overview

### Scope

**Total Methods to Migrate**: 12  
**Total Pages Affected**: 5  
**Total Hooks Affected**: 1

**Migration Strategy**:
- Phase A: Migrate LaTeX operations (CAN DO NOW - QuestionLatexService ready)
- Phase B: Migrate CRUD operations (BLOCKED - needs backend)
- Phase C: Testing and validation (BLOCKED - depends on Phase B)

---

## 🎯 Phase A: Migrate LaTeX Operations (READY)

### A.1 Replace parseLatexContent()

**Current**: `MockQuestionsService.parseLatexContent(latex)`  
**New**: `QuestionLatexService.parseLatex(latex)`

**Affected Files**:
- `apps/frontend/src/app/3141592654/admin/questions/inputques/page.tsx` (line 86)

**Changes**:
```typescript
// OLD
import { MockQuestionsService } from '@/services/mock/questions';
const result = await MockQuestionsService.parseLatexContent(latexContent);

// NEW
import { QuestionLatexService } from '@/services/grpc/question-latex.service';
const result = await QuestionLatexService.parseLatex(latexContent);
```

**Data Mapping**:
- Input: `string` (LaTeX content) - SAME
- Output: `LaTeXParseResult` - SAME structure

**Estimated Effort**: 30 minutes

---

### A.2 Replace uploadAutoFile()

**Current**: `MockQuestionsService.uploadAutoFile(file)`  
**New**: `QuestionLatexService.importLatex(content, options)`

**Affected Files**:
- `apps/frontend/src/app/3141592654/admin/questions/inputauto/page.tsx` (line 118)

**Changes**:
```typescript
// OLD
import { MockQuestionsService } from '@/services/mock/questions';
const result = await MockQuestionsService.uploadAutoFile(selectedFile);

// NEW
import { QuestionLatexService } from '@/services/grpc/question-latex.service';

// Read file content
const fileContent = await selectedFile.text();

// Import LaTeX
const result = await QuestionLatexService.importLatex(
  { latex: fileContent },
  {
    autoCreateCode: true,
    validateOnly: false,
    creator: currentUser?.id
  }
);
```

**Data Mapping**:
- Input: `File` → Convert to `{ latex: string }`
- Output: `FileUploadResult` → Map from `ImportLatexResponse`

**Estimated Effort**: 1 hour

---

## 🚧 Phase B: Migrate CRUD Operations (BLOCKED)

### B.1 Replace createQuestion()

**Status**: ⚠️ BLOCKED - Backend CreateQuestion() not implemented

**Current**: `MockQuestionsService.createQuestion(payload)`  
**New**: `QuestionService.createQuestion(dto)`

**Affected Files**:
- `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx` (line 77)
- `apps/frontend/src/app/3141592654/admin/questions/inputques/page.tsx` (line 142)
- `apps/frontend/src/app/3141592654/admin/questions/inputauto/page.tsx` (line 155)

**Backend Requirements**:
```go
// apps/backend/internal/grpc/question_service.go
func (s *QuestionServiceServer) CreateQuestion(ctx context.Context, req *v1.CreateQuestionRequest) (*v1.CreateQuestionResponse, error) {
    // Get user from context
    userID, err := middleware.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // Validate request
    if req.GetContent() == "" {
        return nil, status.Errorf(codes.InvalidArgument, "question content is required")
    }

    // Create question entity
    question := &entity.Question{
        ID:         repository.GenerateID(),
        Content:    req.GetContent(),
        Type:       req.GetType(),
        Difficulty: req.GetDifficulty(),
        Subject:    req.GetSubject(),
        Grade:      int(req.GetGrade()),
        Tags:       req.GetTags(),
        CreatedBy:  userID,
        CreatedAt:  time.Now(),
        UpdatedAt:  time.Now(),
    }

    // Save to database
    err = s.questionService.CreateQuestion(ctx, question)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to create question: %v", err)
    }

    // Convert to protobuf
    protoQuestion := &v1.Question{
        Id:         question.ID,
        Content:    question.Content,
        Type:       question.Type,
        Difficulty: question.Difficulty,
        Subject:    question.Subject,
        Grade:      int32(question.Grade),
        Tags:       question.Tags,
        CreatedBy:  question.CreatedBy,
    }
    protoQuestion.CreatedAt = timestamppb.New(question.CreatedAt)
    protoQuestion.UpdatedAt = timestamppb.New(question.UpdatedAt)

    return &v1.CreateQuestionResponse{
        Response: &common.Response{
            Success: true,
            Message: "Question created successfully",
        },
        Question: protoQuestion,
    }, nil
}
```

**Frontend Changes**:
```typescript
// OLD
import { MockQuestionsService } from '@/services/mock/questions';
const result = await MockQuestionsService.createQuestion(questionData);

// NEW
import { QuestionService } from '@/services/grpc/question.service';
const result = await QuestionService.createQuestion({
  content: questionData.content,
  type: questionData.type,
  difficulty: questionData.difficulty,
  subject: questionData.subject,
  grade: questionData.grade,
  tags: questionData.tags
});
```

**Data Mapping**:
- Frontend-only fields (will be lost): `explanation`, `points`, `timeLimit`, `usageCount`, `feedback`
- Need to add these fields to protobuf if required

**Estimated Effort**: 2 hours (1h backend + 1h frontend)

---

### B.2 Replace updateQuestion()

**Status**: ⚠️ BLOCKED - Backend UpdateQuestion() not implemented

**Current**: `MockQuestionsService.updateQuestion(id, payload)`  
**New**: `QuestionService.updateQuestion(dto)`

**Affected Files**:
- `apps/frontend/src/app/3141592654/admin/questions/[id]/edit/page.tsx` (line 117)

**Backend Requirements**:
```go
// apps/backend/internal/grpc/question_service.go
func (s *QuestionServiceServer) UpdateQuestion(ctx context.Context, req *v1.UpdateQuestionRequest) (*v1.UpdateQuestionResponse, error) {
    // Get user from context
    userID, err := middleware.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // Validate request
    if req.GetId() == "" {
        return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
    }

    // Get existing question
    existingQuestion, err := s.questionService.GetQuestionByID(ctx, req.GetId())
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "question not found: %v", err)
    }

    // Update fields
    if req.GetContent() != "" {
        existingQuestion.Content = req.GetContent()
    }
    if req.GetType() != "" {
        existingQuestion.Type = req.GetType()
    }
    if req.GetDifficulty() != "" {
        existingQuestion.Difficulty = req.GetDifficulty()
    }
    existingQuestion.UpdatedAt = time.Now()

    // Save to database
    err = s.questionService.UpdateQuestion(ctx, &existingQuestion)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to update question: %v", err)
    }

    // Convert to protobuf
    protoQuestion := &v1.Question{
        Id:         existingQuestion.ID,
        Content:    existingQuestion.Content,
        Type:       existingQuestion.Type,
        Difficulty: existingQuestion.Difficulty,
        Subject:    existingQuestion.Subject,
        Grade:      int32(existingQuestion.Grade),
        Tags:       existingQuestion.Tags,
        CreatedBy:  existingQuestion.CreatedBy,
    }
    protoQuestion.CreatedAt = timestamppb.New(existingQuestion.CreatedAt)
    protoQuestion.UpdatedAt = timestamppb.New(existingQuestion.UpdatedAt)

    return &v1.UpdateQuestionResponse{
        Response: &common.Response{
            Success: true,
            Message: "Question updated successfully",
        },
        Question: protoQuestion,
    }, nil
}
```

**Estimated Effort**: 2 hours (1h backend + 1h frontend)

---

### B.3 Replace deleteQuestion()

**Status**: ⚠️ BLOCKED - Backend DeleteQuestion() not implemented

**Backend Requirements**: Similar to UpdateQuestion, implement soft delete

**Estimated Effort**: 1.5 hours (1h backend + 0.5h frontend)

---

### B.4 Replace listQuestions()

**Status**: ⚠️ BLOCKED - Backend ListQuestions() partially implemented

**Current Implementation**: Only pagination, no filtering

**Required Enhancements**:
- Add filtering by: type, difficulty, subject, grade, tags, status
- Add search by content
- Add sorting options

**Estimated Effort**: 2.5 hours (2h backend + 0.5h frontend)

---

## 🧪 Phase C: Testing (BLOCKED)

### C.1 Unit Tests

**Test Files to Create**:
- `apps/frontend/src/services/grpc/question.service.test.ts`
- `apps/frontend/src/services/grpc/question-latex.service.test.ts`

**Test Coverage**:
- ✅ parseLatex() - success, error handling
- ✅ importLatex() - success, error handling
- ⚠️ createQuestion() - BLOCKED
- ⚠️ updateQuestion() - BLOCKED
- ⚠️ deleteQuestion() - BLOCKED
- ⚠️ listQuestions() - BLOCKED

**Estimated Effort**: 2 hours

---

### C.2 Integration Tests

**Test Scenarios**:
1. Create question flow (create page)
2. Edit question flow (edit page)
3. LaTeX import flow (inputques page)
4. Auto import flow (inputauto page)
5. Question list filtering (useQuestionFilters hook)

**Estimated Effort**: 2 hours

---

## 📊 Migration Checklist

### Phase A: LaTeX Operations (READY)
- [ ] A.1: Replace parseLatexContent() in inputques page
- [ ] A.2: Replace uploadAutoFile() in inputauto page
- [ ] A.3: Test LaTeX parsing functionality
- [ ] A.4: Test auto import functionality

### Phase B: CRUD Operations (BLOCKED)
- [ ] B.1: Backend - Implement CreateQuestion()
- [ ] B.2: Backend - Implement UpdateQuestion()
- [ ] B.3: Backend - Implement DeleteQuestion()
- [ ] B.4: Backend - Complete ListQuestions()
- [ ] B.5: Frontend - Replace createQuestion() in 3 pages
- [ ] B.6: Frontend - Replace updateQuestion() in edit page
- [ ] B.7: Frontend - Replace deleteQuestion() in question list
- [ ] B.8: Frontend - Replace listQuestions() in useQuestionFilters

### Phase C: Testing (BLOCKED)
- [ ] C.1: Write unit tests for QuestionService
- [ ] C.2: Write unit tests for QuestionLatexService
- [ ] C.3: Run integration tests
- [ ] C.4: Manual testing all affected pages

---

## 🎯 Execution Timeline

**Phase A** (READY - Can start immediately):
- Day 1: Migrate LaTeX operations (2 hours)
- Day 1: Test LaTeX functionality (1 hour)

**Phase B** (BLOCKED - Needs backend):
- Day 2-3: Backend implements 4 gRPC methods (4-8 hours)
- Day 4: Frontend migration (4 hours)

**Phase C** (BLOCKED - Depends on Phase B):
- Day 5: Testing (4 hours)

**Total Timeline**: 5 days (assuming backend work starts immediately)

---

## ✅ Success Criteria

1. ✅ All LaTeX operations use QuestionLatexService
2. ⚠️ All CRUD operations use QuestionService (BLOCKED)
3. ⚠️ All 5 admin pages work with real backend (BLOCKED)
4. ⚠️ useQuestionFilters hook uses real backend (BLOCKED)
5. ⚠️ All tests pass (BLOCKED)
6. ⚠️ No MockQuestionsService imports in production code (BLOCKED)

---

**Plan Status**: ✅ COMPLETE  
**Execution Status**: ⚠️ BLOCKED - Waiting for backend implementation  
**Next Action**: Escalate to backend team to implement missing gRPC methods

