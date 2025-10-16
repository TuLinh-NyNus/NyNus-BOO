# Phase 10: MockQuestionsService Migration - Research Analysis

**Created**: 2025-01-19  
**Phase**: 10 - Subtask 10.1 RESEARCH  
**Augment Context Engine Usage**: 5/20 (continuing...)

---

## 📊 Research Objectives

1. Phân tích chi tiết MockQuestionsService implementation
2. Phân tích QuestionService gRPC backend implementation
3. Phân tích cách 5 pages sử dụng MockQuestionsService
4. Xác định data mapping requirements
5. Xác định error handling patterns

---

## 🔍 Analysis Results (5 Augment Context Engine Calls)

### Call 1: MockQuestionsService Implementation Analysis

**File**: `apps/frontend/src/services/mock/questions.ts`

**Methods Implemented**:
1. `listQuestions(params)` - List questions với pagination và filters
2. `getQuestion(id)` - Get single question by ID
3. `createQuestion(payload)` - Create new question
4. `updateQuestion(id, payload)` - Update existing question
5. `deleteQuestion()` - Delete question
6. `bulkUpdateStatus(ids)` - Bulk update status
7. `bulkDelete(ids)` - Bulk delete
8. `parseLatexContent(latex)` - Parse LaTeX to question
9. `uploadAutoFile(file)` - Upload file and parse questions
10. `getSavedQuestions()` - Get saved questions from localStorage
11. `saveQuestion(question)` - Save question to localStorage
12. `decodeMapId(code)` - Decode MapID to QuestionCode

**Key Characteristics**:
- Simulates realistic API latency (200ms-800ms)
- Returns mock data from `mockEnhancedQuestions`
- Supports both legacy params và QuestionFilters interface
- Error handling: Returns `{ error: string }` or `{ data: T }`
- No authentication required

---

### Call 2: QuestionService gRPC Implementation Analysis

**File**: `apps/frontend/src/services/grpc/question.service.ts`

**Methods Implemented**:
1. `createQuestion(dto)` - gRPC CreateQuestion
2. `getQuestion(dto)` - gRPC GetQuestion
3. `updateQuestion(dto)` - gRPC UpdateQuestion
4. `deleteQuestion(dto)` - gRPC DeleteQuestion
5. `listQuestions(dto)` - gRPC ListQuestions
6. `importQuestions(dto)` - gRPC ImportQuestions (CSV)

**Key Characteristics**:
- Uses gRPC-Web client (`QuestionServiceClient`)
- Requires JWT authentication (`getAuthMetadata()`)
- Returns standardized response: `{ success, message, errors, question/questions }`
- Error handling: Catches `RpcError`, returns error response
- Data mapping: Protobuf ↔ Frontend types

**Backend Status** (from `apps/backend/internal/grpc/question_service.go`):
- ✅ `GetQuestion()` - IMPLEMENTED (calls `questionService.GetQuestionByID()`)
- ❌ `CreateQuestion()` - NOT IMPLEMENTED (returns "CreateQuestion not yet implemented")
- ❌ `UpdateQuestion()` - NOT IMPLEMENTED
- ❌ `DeleteQuestion()` - NOT IMPLEMENTED
- ❌ `ListQuestions()` - NOT IMPLEMENTED

**Critical Finding**: Backend QuestionService is PARTIALLY implemented, NOT fully ready!

---

### Call 3: Question Create Page Usage Analysis

**File**: `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx`

**MockQuestionsService Usage**:
- **Method**: `MockQuestionsService.createQuestion(questionData)`
- **Line**: 77
- **Context**: `handleSubmit()` function

**Data Flow**:
```typescript
// Input from IntegratedQuestionForm
{
  content, type, answers, status, difficulty,
  questionCodeId, explanation, solution, source,
  timeLimit, points, tag
}

// Transformed to MockQuestionsService format
{
  content, rawContent, type, answers, tag,
  questionCodeId, status, difficulty,
  explanation, solution, source,
  timeLimit, points, usageCount, creator,
  createdAt, updatedAt
}

// MockQuestionsService.createQuestion() returns
{ data: Question }
```

**Error Handling**:
- Try-catch block
- Toast notification on success/error
- Router push to ADMIN_PATHS.QUESTIONS on success

---

### Call 4: Question Input Pages Usage Analysis

**File 1**: `apps/frontend/src/app/3141592654/admin/questions/inputques/page.tsx`

**MockQuestionsService Usage**:
- **Method 1**: `MockQuestionsService.parseLatexContent(latexContent)` - Line 86
- **Method 2**: `MockQuestionsService.createQuestion(questionData)` - Line 142

**Data Flow**:
```typescript
// Step 1: Parse LaTeX
parseLatexContent(latex) → { data?: Partial<Question>, error?: string }

// Step 2: Create Question
createQuestion({
  content, rawContent, type, tag, questionCodeId,
  status, usageCount, creator, answers, correctAnswer,
  solution, source, difficulty, subcount
}) → { data: Question }
```

**File 2**: `apps/frontend/src/app/3141592654/admin/questions/inputauto/page.tsx`

**MockQuestionsService Usage**:
- **Method 1**: `MockQuestionsService.uploadAutoFile(selectedFile)` - Line 118
- **Method 2**: `MockQuestionsService.createQuestion(question)` - Line 155 (in loop)

**Data Flow**:
```typescript
// Step 1: Upload and parse file
uploadAutoFile(file) → { data?: Question[], error?: string }

// Step 2: Save each question
for (question of parsedQuestions) {
  createQuestion({
    ...question,
    status: QuestionStatus.PENDING,
    usageCount: 0,
    creator: 'current-user'
  })
}
```

---

### Call 5: Question Edit Page Usage Analysis

**File**: `apps/frontend/src/app/3141592654/admin/questions/[id]/edit/page.tsx`

**MockQuestionsService Usage**:
- **Method 1**: `MockQuestionsService.getQuestion(questionId)` - Line 49
- **Method 2**: `MockQuestionsService.updateQuestion(questionId, updateData)` - Line 117

**Data Flow**:
```typescript
// Step 1: Load question
getQuestion(id) → { data?: Question, error?: string }

// Step 2: Update question
updateQuestion(id, {
  content, rawContent, type, answers, tag,
  questionCodeId, status, difficulty,
  explanation, solution, source,
  timeLimit, points
}) → { data: Question }
```

**Error Handling**:
- Try-catch blocks
- Loading states (setIsLoading)
- Error states (setLoadError)
- Toast notifications

---

## 🚨 Critical Findings

### 1. Backend QuestionService NOT Fully Implemented

**Evidence from `apps/backend/internal/grpc/question_service.go`**:
```go
// CreateQuestion - Line 37-52
return &v1.CreateQuestionResponse{
    Response: &common.Response{
        Success: false,
        Message: "CreateQuestion not yet implemented",
    },
}, status.Errorf(codes.Unimplemented, "CreateQuestion not yet implemented")
```

**Impact**: Cannot migrate `createQuestion()` calls until backend is implemented!

### 2. Missing Backend Methods

**Not Implemented**:
- ❌ `CreateQuestion()` - Used by 3 pages (create, inputques, inputauto)
- ❌ `UpdateQuestion()` - Used by 1 page (edit)
- ❌ `DeleteQuestion()` - Used by question list page
- ❌ `ListQuestions()` - Used by useQuestionFilters hook

**Implemented**:
- ✅ `GetQuestion()` - Can migrate edit page load

### 3. Special Methods Not in gRPC

**MockQuestionsService methods without gRPC equivalent**:
- `parseLatexContent()` - LaTeX parsing (inputques page)
- `uploadAutoFile()` - File upload parsing (inputauto page)
- `getSavedQuestions()` / `saveQuestion()` - localStorage operations
- `decodeMapId()` - MapID decoding

**Note**: These may have separate gRPC services (QuestionLatexService?)

---

## 📋 Next Steps

### Immediate Actions Required:

1. **Continue Augment Context Engine Analysis** (5-15 more calls):
   - Analyze useQuestionFilters hook usage
   - Analyze QuestionLatexService (if exists)
   - Analyze backend QuestionService implementation status
   - Analyze data mapping requirements (Protobuf ↔ Frontend)
   - Analyze error handling patterns

2. **Verify Backend Implementation Status**:
   - Check if CreateQuestion, UpdateQuestion, DeleteQuestion, ListQuestions are implemented
   - Check if QuestionLatexService exists for LaTeX parsing
   - Check if file upload service exists

3. **Create Migration Plan**:
   - If backend ready: Plan migration
   - If backend NOT ready: Document as blocker, recommend backend implementation first

---

---

## 🔍 Additional Analysis Results (Calls 6-10)

### Call 6: useQuestionFilters Hook Analysis

**File**: `apps/frontend/src/hooks/question/useQuestionFilters.ts`

**MockQuestionsService Usage**:
- **Method**: `MockQuestionsService.listQuestions(currentFilters)` - Line 167
- **Context**: `fetchQuestions()` callback function

**Key Features**:
- Debounced search (300ms) and filter (100ms) delays
- Abort controller for request cancellation
- Loading timeout protection (10 seconds)
- Performance tracking (lastFetchTime, fetchCount)
- Auto-fetch on filter changes

**Data Flow**:
```typescript
// Input: QuestionFilters from store
{
  page, pageSize, type, status, difficulty,
  codePrefix, keyword, sortBy, sortDir
}

// Call: MockQuestionsService.listQuestions()
const response = await MockQuestionsService.listQuestions(currentFilters);

// Output: QuestionListResponse
{
  data: Question[],
  pagination: { page, pageSize, total, totalPages }
}
```

**Error Handling**:
- Try-catch with abort error filtering
- onError callback for custom error handling
- onSuccess callback for success handling

---

### Call 7: QuestionLatexService Discovery

**File**: `apps/frontend/src/services/grpc/question-latex.service.ts`

**✅ FOUND**: QuestionLatexService EXISTS!

**Methods Implemented**:
1. `parseLatex(latexContent)` - Parse LaTeX to question data
2. `createFromLatex(latexContent, autoCreateCode, creator)` - Create question from LaTeX
3. `importLatex(content, options)` - Import multiple questions from LaTeX

**Backend gRPC Methods**:
- `ParseLatexQuestion()` - Parse LaTeX content
- `CreateQuestionFromLatex()` - Create question from LaTeX
- `ImportLatex()` - Import multiple questions

**Fallback Behavior**:
- Falls back to mock implementation on gRPC error
- Mock returns simple parsed question structure

**Mapping to MockQuestionsService**:
- `MockQuestionsService.parseLatexContent()` → `QuestionLatexService.parseLatex()`
- `MockQuestionsService.uploadAutoFile()` → `QuestionLatexService.importLatex()` (for LaTeX files)

---

### Call 8: Backend QuestionService Implementation Status

**File**: `apps/backend/internal/service/question/question_service.go`

**✅ FULLY IMPLEMENTED Methods**:
1. `CreateQuestion(ctx, question)` - Line 57-92
   - Validates question code exists
   - Generates ID if not provided
   - Sets defaults (status, creator, difficulty, usageCount, feedback)
   - Calls `questionRepo.Create()`

2. `GetQuestionByID(ctx, id)` - Line 95-101
   - Calls `questionRepo.GetByID()`
   - Returns entity.Question

3. `UpdateQuestion(ctx, question)` - Line 104-123
   - Validates question exists
   - Validates question code if changed
   - Calls `questionRepo.Update()`

4. `DeleteQuestion(ctx, id)` - Line 126-128
   - Calls `questionRepo.Delete()`

5. `GetQuestionsByPaging(offset, limit)` - Line 131-153
   - Gets total count
   - Gets questions with pagination
   - Returns (total, questions, error)

6. `CreateFromLatex(ctx, rawLatex, autoCreateCode, creator)` - Line 246-324
   - Parses LaTeX using LaTeXQuestionParser
   - Creates question code if needed
   - Creates question
   - Processes images (TikZ, includegraphics)

**Additional Methods**:
- `GetQuestionsByFilter()` - Advanced filtering
- `SearchQuestions()` - Text search
- `ImportQuestions()` - CSV import
- `GetFilterStatistics()` - Statistics

**Conclusion**: Backend QuestionService is FULLY IMPLEMENTED! ✅

---

### Call 9: Backend gRPC QuestionServiceServer Status

**File**: `apps/backend/internal/grpc/question_service.go`

**Implementation Status**:

1. **CreateQuestion()** - Line 37-52
   - ❌ **NOT IMPLEMENTED**
   - Returns: `"CreateQuestion not yet implemented"`
   - Status: `codes.Unimplemented`

2. **GetQuestion()** - Line 56-84
   - ✅ **IMPLEMENTED**
   - Calls: `questionService.GetQuestionByID()`
   - Returns: Question data

3. **UpdateQuestion()** - NOT FOUND in file
   - ❌ **NOT IMPLEMENTED**

4. **DeleteQuestion()** - NOT FOUND in file
   - ❌ **NOT IMPLEMENTED**

5. **ListQuestions()** - Line 87-157
   - ✅ **PARTIALLY IMPLEMENTED**
   - Extracts pagination parameters
   - TODO: Implement actual listing logic

6. **ImportQuestions()** - Line 159-180
   - ✅ **IMPLEMENTED**
   - Calls: `questionService.ImportQuestions()`

7. **ParseLatexQuestion()** - Line 298-397
   - ✅ **IMPLEMENTED**
   - Parses LaTeX content
   - Returns parsed questions and codes

8. **CreateQuestionFromLatex()** - Line 400-493
   - ✅ **IMPLEMENTED**
   - Creates questions from LaTeX
   - Auto-creates question codes if needed

9. **ImportLatex()** - Line 597-738
   - ✅ **IMPLEMENTED**
   - Imports multiple questions from LaTeX

**Critical Finding**:
- Backend service layer (QuestionService) is FULLY implemented ✅
- gRPC layer (QuestionServiceServer) is PARTIALLY implemented ⚠️
- **Blocker**: CreateQuestion, UpdateQuestion, DeleteQuestion gRPC methods NOT implemented

---

### Call 10: Data Mapping Analysis (Protobuf ↔ Frontend)

**Protobuf Question** (`packages/proto/v1/question.proto`):
```protobuf
message Question {
  string id = 1;
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
  string solution = 10;
  repeated string tag = 11;
  string grade = 12;
  string subject = 13;
  string chapter = 14;
  string level = 15;
  string question_code_id = 16;
  common.QuestionStatus status = 17;
  common.DifficultyLevel difficulty = 18;
  string creator = 19;
}
```

**Frontend Question** (`apps/frontend/src/types/question.ts`):
```typescript
interface Question {
  id: string;
  rawContent: string;
  content: string;
  subcount?: string;
  type: QuestionType;
  source?: string;
  answers?: AnswerOption[] | MatchingOption[];
  correctAnswer?: CorrectAnswer;
  solution?: string;
  explanation?: string; // NOT in protobuf
  points?: number; // NOT in protobuf
  timeLimit?: number; // NOT in protobuf
  tag: string[];
  usageCount?: number; // NOT in protobuf
  creator?: string;
  status?: QuestionStatus;
  feedback?: number; // NOT in protobuf
  difficulty?: QuestionDifficulty;
  questionCodeId: string;
  createdAt: string; // NOT in protobuf
  updatedAt: string; // NOT in protobuf
}
```

**Mapping Differences**:
1. **Frontend-only fields** (NOT in protobuf):
   - `explanation` - Can use `solution` field
   - `points` - Not stored in backend
   - `timeLimit` - Not stored in backend
   - `usageCount` - Stored in DB but not in protobuf Question
   - `feedback` - Stored in DB but not in protobuf Question
   - `createdAt` / `updatedAt` - Stored in DB but not in protobuf Question

2. **Protobuf-only fields** (NOT in frontend):
   - `grade`, `subject`, `chapter`, `level` - Classification fields

3. **Field name differences**:
   - Protobuf: `raw_content` → Frontend: `rawContent` (snake_case vs camelCase)
   - Protobuf: `question_code_id` → Frontend: `questionCodeId`

**Mapping Strategy**:
- Use existing mappers in `apps/frontend/src/services/grpc/question.service.ts`
- `mapQuestionFromPb()` - Protobuf → Frontend
- `mapAnswerToPb()` - Frontend → Protobuf
- `mapCorrectToPb()` - Frontend → Protobuf

---

## 🚨 Updated Critical Findings

### 1. Backend Service Layer: FULLY IMPLEMENTED ✅

**Evidence**: `apps/backend/internal/service/question/question_service.go`
- ✅ CreateQuestion() - Fully implemented
- ✅ GetQuestionByID() - Fully implemented
- ✅ UpdateQuestion() - Fully implemented
- ✅ DeleteQuestion() - Fully implemented
- ✅ GetQuestionsByPaging() - Fully implemented
- ✅ CreateFromLatex() - Fully implemented

### 2. Backend gRPC Layer: PARTIALLY IMPLEMENTED ⚠️

**Evidence**: `apps/backend/internal/grpc/question_service.go`
- ❌ CreateQuestion() - NOT IMPLEMENTED (returns "not yet implemented")
- ✅ GetQuestion() - IMPLEMENTED
- ❌ UpdateQuestion() - NOT FOUND
- ❌ DeleteQuestion() - NOT FOUND
- ⚠️ ListQuestions() - PARTIALLY IMPLEMENTED (pagination only)
- ✅ ImportQuestions() - IMPLEMENTED
- ✅ ParseLatexQuestion() - IMPLEMENTED
- ✅ CreateQuestionFromLatex() - IMPLEMENTED
- ✅ ImportLatex() - IMPLEMENTED

### 3. QuestionLatexService: FULLY AVAILABLE ✅

**Evidence**: `apps/frontend/src/services/grpc/question-latex.service.ts`
- ✅ parseLatex() - Available with gRPC + mock fallback
- ✅ createFromLatex() - Available with gRPC + mock fallback
- ✅ importLatex() - Available with gRPC + mock fallback

**Can Replace**:
- `MockQuestionsService.parseLatexContent()` → `QuestionLatexService.parseLatex()`
- `MockQuestionsService.uploadAutoFile()` → `QuestionLatexService.importLatex()`

### 4. Migration Blockers

**HIGH PRIORITY BLOCKERS**:
1. ❌ gRPC `CreateQuestion()` - NOT IMPLEMENTED
   - Blocks: create page, inputques page, inputauto page
   - Impact: 3 pages cannot be migrated

2. ❌ gRPC `UpdateQuestion()` - NOT IMPLEMENTED
   - Blocks: edit page
   - Impact: 1 page cannot be migrated

3. ❌ gRPC `DeleteQuestion()` - NOT IMPLEMENTED
   - Blocks: question list page delete action
   - Impact: Delete functionality cannot be migrated

4. ⚠️ gRPC `ListQuestions()` - PARTIALLY IMPLEMENTED
   - Blocks: useQuestionFilters hook
   - Impact: Question listing with filters cannot be migrated

**MEDIUM PRIORITY**:
- File upload parsing (non-LaTeX files) - No gRPC equivalent
- localStorage operations (getSavedQuestions, saveQuestion) - Client-side only
- MapID decoding (decodeMapId) - May need separate service

---

## 📋 Updated Next Steps

### Immediate Actions Required:

1. **STOP Migration** ⛔
   - Cannot proceed with migration until gRPC methods are implemented
   - Backend service layer is ready, but gRPC layer is blocking

2. **Recommend Backend Implementation** 📝
   - Need to implement gRPC methods in `apps/backend/internal/grpc/question_service.go`:
     - `CreateQuestion()` - Call `questionService.CreateQuestion()`
     - `UpdateQuestion()` - Call `questionService.UpdateQuestion()`
     - `DeleteQuestion()` - Call `questionService.DeleteQuestion()`
     - `ListQuestions()` - Complete implementation with filters

3. **Alternative: Partial Migration** 🔄
   - Can migrate ONLY pages that use implemented methods:
     - ✅ Edit page (load only) - Uses `GetQuestion()`
     - ✅ LaTeX parsing - Uses `QuestionLatexService`
   - Cannot migrate:
     - ❌ Create page - Needs `CreateQuestion()`
     - ❌ Edit page (save) - Needs `UpdateQuestion()`
     - ❌ Input pages - Need `CreateQuestion()`
     - ❌ Question list - Needs `ListQuestions()`

4. **Document as Phase 10 Blocker** 📄
   - Create blocker report
   - Recommend backend team implement missing gRPC methods
   - Estimate: 4-8 hours backend work

---

**Status**: ⚠️ **RESEARCH COMPLETE - MIGRATION BLOCKED**
**Blocker**: gRPC CreateQuestion, UpdateQuestion, DeleteQuestion, ListQuestions NOT implemented
**Recommendation**: Implement missing gRPC methods before proceeding with migration
**Augment Context Engine Usage**: 10/20 (sufficient for analysis)

