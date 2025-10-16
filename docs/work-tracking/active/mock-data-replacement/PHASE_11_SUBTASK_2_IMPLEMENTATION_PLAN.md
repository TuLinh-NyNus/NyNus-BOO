# Phase 11 - Subtask 11.2: PLAN - gRPC Implementation Plan
## Detailed Implementation Plan for 4 Missing gRPC Methods

**Date**: 2025-01-19  
**Status**: ✅ COMPLETE  
**Augment Context Engine Calls**: 10/10  

---

## 📋 Executive Summary

**Planning Objective**: Tạo detailed implementation plan cho 4 missing gRPC methods trong QuestionServiceServer.

**Methods to Implement**:
1. ✅ **CreateQuestion()** - Create new question with validation
2. ✅ **UpdateQuestion()** - Update existing question
3. ✅ **DeleteQuestion()** - Delete question by ID
4. ✅ **Complete ListQuestions()** - Add filtering, sorting support

**Implementation Strategy**: Follow existing gRPC patterns, reuse service layer methods, add proper validation and error handling.

---

## 1️⃣ CreateQuestion() Implementation Plan

### 1.1 Method Signature
```go
func (s *QuestionServiceServer) CreateQuestion(ctx context.Context, req *v1.CreateQuestionRequest) (*v1.CreateQuestionResponse, error)
```

### 1.2 Implementation Steps

**Step 1: Extract User ID from Context**
```go
userID, err := middleware.GetUserIDFromContext(ctx)
if err != nil {
    return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
}
```

**Step 2: Validate Request**
```go
// Required fields validation
if req.GetContent() == "" {
    return nil, status.Errorf(codes.InvalidArgument, "content is required")
}

if req.GetType() == common.QuestionType_QUESTION_TYPE_UNSPECIFIED {
    return nil, status.Errorf(codes.InvalidArgument, "question type is required")
}

if req.GetDifficulty() == common.DifficultyLevel_DIFFICULTY_LEVEL_UNSPECIFIED {
    return nil, status.Errorf(codes.InvalidArgument, "difficulty level is required")
}
```

**Step 3: Convert Protobuf Request to Entity**
```go
// Convert enum values to entity strings
questionType := convertQuestionTypeToString(req.GetType())
difficulty := convertDifficultyLevelToString(req.GetDifficulty())
status := convertQuestionStatusToString(req.GetStatus())

// Create entity.Question
question := &entity.Question{
    RawContent: util.StringToPgText(req.GetRawContent()),
    Content:    util.StringToPgText(req.GetContent()),
    Subcount:   util.StringToPgText(req.GetSubcount()),
    Type:       util.StringToPgText(questionType),
    Source:     util.StringToPgText(req.GetSource()),
    Solution:   util.StringToPgText(req.GetSolution()),
    
    // Handle JSONB fields (oneof answer_data)
    Answers:       convertAnswersToJSONB(req),
    CorrectAnswer: convertCorrectAnswerToJSONB(req),
    
    // Handle array fields
    Tag: util.StringSliceToPgTextArray(req.GetTag()),
    
    // Optional classification fields
    Grade:   util.StringToPgText(req.GetGrade()),
    Subject: util.StringToPgText(req.GetSubject()),
    Chapter: util.StringToPgText(req.GetChapter()),
    Level:   util.StringToPgText(req.GetLevel()),
    
    // Metadata
    QuestionCodeID: util.StringToPgText(req.GetQuestionCodeId()),
    Status:         util.StringToPgText(status),
    Difficulty:     util.StringToPgText(difficulty),
    Creator:        util.StringToPgText(userID), // Set from context
}
```

**Step 4: Call Service Layer**
```go
err = s.questionService.CreateQuestion(ctx, question)
if err != nil {
    // Check for specific errors
    if strings.Contains(err.Error(), "does not exist") {
        return nil, status.Errorf(codes.NotFound, "question code not found: %v", err)
    }
    return nil, status.Errorf(codes.Internal, "failed to create question: %v", err)
}
```

**Step 5: Convert Entity to Protobuf**
```go
protoQuestion := convertQuestionToProto(question)
```

**Step 6: Build and Return Response**
```go
return &v1.CreateQuestionResponse{
    Response: &common.Response{
        Success: true,
        Message: "Question created successfully",
    },
    Question: protoQuestion,
}, nil
```

### 1.3 Helper Functions Needed

**convertAnswersToJSONB()**
```go
func convertAnswersToJSONB(req *v1.CreateQuestionRequest) pgtype.JSONB {
    switch answerData := req.GetAnswerData().(type) {
    case *v1.CreateQuestionRequest_StructuredAnswers:
        // Convert AnswerList to JSON bytes
        answers := answerData.StructuredAnswers.GetAnswers()
        jsonData, _ := json.Marshal(answers)
        return util.BytesToPgJSONB(jsonData)
    
    case *v1.CreateQuestionRequest_JsonAnswers:
        // Use JSON string directly
        return util.BytesToPgJSONB([]byte(answerData.JsonAnswers))
    
    default:
        return pgtype.JSONB{Status: pgtype.Null}
    }
}
```

**convertCorrectAnswerToJSONB()**
```go
func convertCorrectAnswerToJSONB(req *v1.CreateQuestionRequest) pgtype.JSONB {
    switch correctData := req.GetCorrectAnswerData().(type) {
    case *v1.CreateQuestionRequest_StructuredCorrect:
        // Convert CorrectAnswer to JSON bytes
        jsonData, _ := json.Marshal(correctData.StructuredCorrect)
        return util.BytesToPgJSONB(jsonData)
    
    case *v1.CreateQuestionRequest_JsonCorrectAnswer:
        // Use JSON string directly
        return util.BytesToPgJSONB([]byte(correctData.JsonCorrectAnswer))
    
    default:
        return pgtype.JSONB{Status: pgtype.Null}
    }
}
```

**convertQuestionTypeToString()** (already exists in question_filter_service.go)
```go
func convertQuestionTypeToString(t common.QuestionType) string {
    switch t {
    case common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE:
        return "MC"
    case common.QuestionType_QUESTION_TYPE_TRUE_FALSE:
        return "TF"
    case common.QuestionType_QUESTION_TYPE_SHORT_ANSWER:
        return "SA"
    case common.QuestionType_QUESTION_TYPE_ESSAY:
        return "ES"
    case common.QuestionType_QUESTION_TYPE_MATCHING:
        return "MA"
    default:
        return ""
    }
}
```

**convertDifficultyLevelToString()** (already exists)
```go
func convertDifficultyLevelToString(d common.DifficultyLevel) string {
    switch d {
    case common.DifficultyLevel_DIFFICULTY_LEVEL_EASY:
        return "EASY"
    case common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM:
        return "MEDIUM"
    case common.DifficultyLevel_DIFFICULTY_LEVEL_HARD:
        return "HARD"
    case common.DifficultyLevel_DIFFICULTY_LEVEL_EXPERT:
        return "EXPERT"
    default:
        return ""
    }
}
```

**convertQuestionStatusToString()** (already exists)
```go
func convertQuestionStatusToString(s common.QuestionStatus) string {
    switch s {
    case common.QuestionStatus_QUESTION_STATUS_ACTIVE:
        return "ACTIVE"
    case common.QuestionStatus_QUESTION_STATUS_PENDING:
        return "PENDING"
    case common.QuestionStatus_QUESTION_STATUS_INACTIVE:
        return "INACTIVE"
    case common.QuestionStatus_QUESTION_STATUS_ARCHIVED:
        return "ARCHIVED"
    default:
        return ""
    }
}
```

### 1.4 Error Handling

| Error Scenario | gRPC Code | Error Message |
|----------------|-----------|---------------|
| Missing content | `codes.InvalidArgument` | "content is required" |
| Missing type | `codes.InvalidArgument` | "question type is required" |
| Missing difficulty | `codes.InvalidArgument` | "difficulty level is required" |
| QuestionCode not found | `codes.NotFound` | "question code not found: {code}" |
| Database error | `codes.Internal` | "failed to create question: {error}" |

### 1.5 Estimated Effort
- **Implementation**: 1-2 hours
- **Testing**: 30 minutes
- **Total**: 1.5-2.5 hours

---

## 2️⃣ UpdateQuestion() Implementation Plan

### 2.1 Method Signature
```go
func (s *QuestionServiceServer) UpdateQuestion(ctx context.Context, req *v1.UpdateQuestionRequest) (*v1.UpdateQuestionResponse, error)
```

### 2.2 Implementation Steps

**Step 1: Extract User ID from Context**
```go
userID, err := middleware.GetUserIDFromContext(ctx)
if err != nil {
    return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
}
_ = userID // May be used for authorization check later
```

**Step 2: Validate Request**
```go
// Required: Question ID
if req.GetId() == "" {
    return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
}
```

**Step 3: Get Existing Question**
```go
existing, err := s.questionService.GetQuestionByID(ctx, req.GetId())
if err != nil {
    if strings.Contains(err.Error(), "not found") {
        return nil, status.Errorf(codes.NotFound, "question not found: %s", req.GetId())
    }
    return nil, status.Errorf(codes.Internal, "failed to get question: %v", err)
}
```

**Step 4: Update Fields from Request**
```go
// Update only provided fields
if req.GetRawContent() != "" {
    existing.RawContent = util.StringToPgText(req.GetRawContent())
}
if req.GetContent() != "" {
    existing.Content = util.StringToPgText(req.GetContent())
}
if req.GetSubcount() != "" {
    existing.Subcount = util.StringToPgText(req.GetSubcount())
}
if req.GetType() != common.QuestionType_QUESTION_TYPE_UNSPECIFIED {
    existing.Type = util.StringToPgText(convertQuestionTypeToString(req.GetType()))
}
if req.GetSource() != "" {
    existing.Source = util.StringToPgText(req.GetSource())
}
if req.GetSolution() != "" {
    existing.Solution = util.StringToPgText(req.GetSolution())
}

// Update JSONB fields if provided
if req.GetAnswerData() != nil {
    existing.Answers = convertAnswersToJSONB(req)
}
if req.GetCorrectAnswerData() != nil {
    existing.CorrectAnswer = convertCorrectAnswerToJSONB(req)
}

// Update array fields
if len(req.GetTag()) > 0 {
    existing.Tag = util.StringSliceToPgTextArray(req.GetTag())
}

// Update optional classification fields
if req.GetGrade() != "" {
    existing.Grade = util.StringToPgText(req.GetGrade())
}
if req.GetSubject() != "" {
    existing.Subject = util.StringToPgText(req.GetSubject())
}
if req.GetChapter() != "" {
    existing.Chapter = util.StringToPgText(req.GetChapter())
}
if req.GetLevel() != "" {
    existing.Level = util.StringToPgText(req.GetLevel())
}

// Update metadata
if req.GetQuestionCodeId() != "" {
    existing.QuestionCodeID = util.StringToPgText(req.GetQuestionCodeId())
}
if req.GetStatus() != common.QuestionStatus_QUESTION_STATUS_UNSPECIFIED {
    existing.Status = util.StringToPgText(convertQuestionStatusToString(req.GetStatus()))
}
if req.GetDifficulty() != common.DifficultyLevel_DIFFICULTY_LEVEL_UNSPECIFIED {
    existing.Difficulty = util.StringToPgText(convertDifficultyLevelToString(req.GetDifficulty()))
}
```

**Step 5: Call Service Layer**
```go
err = s.questionService.UpdateQuestion(ctx, &existing)
if err != nil {
    if strings.Contains(err.Error(), "not found") {
        return nil, status.Errorf(codes.NotFound, "question or question code not found: %v", err)
    }
    return nil, status.Errorf(codes.Internal, "failed to update question: %v", err)
}
```

**Step 6: Convert Entity to Protobuf**
```go
protoQuestion := convertQuestionToProto(&existing)
```

**Step 7: Build and Return Response**
```go
return &v1.UpdateQuestionResponse{
    Response: &common.Response{
        Success: true,
        Message: "Question updated successfully",
    },
    Question: protoQuestion,
}, nil
```

### 2.3 Error Handling

| Error Scenario | gRPC Code | Error Message |
|----------------|-----------|---------------|
| Missing ID | `codes.InvalidArgument` | "question ID is required" |
| Question not found | `codes.NotFound` | "question not found: {id}" |
| QuestionCode not found | `codes.NotFound` | "question code not found: {code}" |
| Database error | `codes.Internal` | "failed to update question: {error}" |

### 2.4 Estimated Effort
- **Implementation**: 1-1.5 hours
- **Testing**: 30 minutes
- **Total**: 1.5-2 hours

---

## 3️⃣ DeleteQuestion() Implementation Plan

### 3.1 Method Signature
```go
func (s *QuestionServiceServer) DeleteQuestion(ctx context.Context, req *v1.DeleteQuestionRequest) (*v1.DeleteQuestionResponse, error)
```

### 3.2 Implementation Steps

**Step 1: Extract User ID from Context**
```go
userID, err := middleware.GetUserIDFromContext(ctx)
if err != nil {
    return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
}
_ = userID // May be used for authorization check later
```

**Step 2: Validate Request**
```go
if req.GetId() == "" {
    return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
}
```

**Step 3: Call Service Layer**
```go
err = s.questionService.DeleteQuestion(ctx, req.GetId())
if err != nil {
    if strings.Contains(err.Error(), "not found") {
        return nil, status.Errorf(codes.NotFound, "question not found: %s", req.GetId())
    }
    return nil, status.Errorf(codes.Internal, "failed to delete question: %v", err)
}
```

**Step 4: Build and Return Response**
```go
return &v1.DeleteQuestionResponse{
    Response: &common.Response{
        Success: true,
        Message: "Question deleted successfully",
    },
}, nil
```

### 3.3 Error Handling

| Error Scenario | gRPC Code | Error Message |
|----------------|-----------|---------------|
| Missing ID | `codes.InvalidArgument` | "question ID is required" |
| Question not found | `codes.NotFound` | "question not found: {id}" |
| Database error | `codes.Internal` | "failed to delete question: {error}" |

### 3.4 Estimated Effort
- **Implementation**: 30 minutes
- **Testing**: 15 minutes
- **Total**: 45 minutes

---

## 4️⃣ Complete ListQuestions() Implementation Plan

### 4.1 Current Implementation Issues
- ✅ Pagination works
- ❌ No filtering support
- ❌ No sorting support
- ❌ No search support

### 4.2 Implementation Steps

**Step 1: Keep Existing Pagination Logic**
```go
// Extract pagination parameters (KEEP THIS)
page := req.GetPagination().GetPage()
limit := req.GetPagination().GetLimit()

// Set default values if not provided (KEEP THIS)
if page <= 0 {
    page = 1
}
if limit <= 0 {
    limit = 10
}

// Calculate offset from page and limit (KEEP THIS)
offset := int(page-1) * int(limit)
```

**Step 2: Add Filtering Support (NEW)**
```go
// TODO: Add filtering when protobuf is updated with filter fields
// For now, use simple pagination only
```

**Note**: ListQuestionsRequest currently only has pagination field. Filtering will be added in future protobuf update.

**Step 3: Keep Existing Service Call**
```go
// Call QuestionService to get questions list with paging (KEEP THIS)
total, questions, err := s.questionService.GetQuestionsByPaging(offset, int(limit))
if err != nil {
    return nil, status.Errorf(codes.Internal, "failed to get questions list: %v", err)
}
```

**Step 4: Keep Existing Entity to Proto Conversion**
```go
// Convert entities to proto (KEEP THIS)
var protoQuestions []*v1.Question
for _, question := range questions {
    protoQuestion := convertQuestionToProto(&question)
    protoQuestions = append(protoQuestions, protoQuestion)
}
```

**Step 5: Keep Existing Pagination Response**
```go
// Calculate total pages (KEEP THIS)
totalPages := int32((total + int(limit) - 1) / int(limit))

pagination := &common.PaginationResponse{
    Page:       page,
    Limit:      limit,
    TotalCount: int32(total),
    TotalPages: totalPages,
}
```

**Step 6: Keep Existing Response**
```go
return &v1.ListQuestionsResponse{
    Response: &common.Response{
        Success: true,
        Message: fmt.Sprintf("Successfully retrieved %d questions", len(protoQuestions)),
    },
    Questions:  protoQuestions,
    Pagination: pagination,
}, nil
```

### 4.3 Future Enhancement Plan

When protobuf is updated with filter fields:
```protobuf
message ListQuestionsRequest {
  common.PaginationRequest pagination = 1;
  
  // Future filter fields
  repeated common.QuestionType types = 2;
  repeated common.DifficultyLevel difficulties = 3;
  repeated common.QuestionStatus statuses = 4;
  string keyword = 5;
  string question_code_id = 6;
}
```

Then implement:
```go
// Build filter criteria
criteria := &interfaces.FilterCriteria{
    Types:       convertQuestionTypesToStrings(req.GetTypes()),
    Difficulties: convertDifficultyLevelsToStrings(req.GetDifficulties()),
    Statuses:    convertQuestionStatusesToStrings(req.GetStatuses()),
    Keyword:     req.GetKeyword(),
}

// Call service with filters
questions, total, err := s.questionService.GetQuestionsWithFilters(ctx, criteria, offset, limit)
```

### 4.4 Estimated Effort
- **Current (No Changes)**: 0 hours (already working)
- **Future Enhancement**: 2-3 hours (when protobuf updated)

---

## 🎯 Summary

### Total Estimated Effort
| Method | Implementation | Testing | Total |
|--------|----------------|---------|-------|
| CreateQuestion() | 1-2h | 30min | 1.5-2.5h |
| UpdateQuestion() | 1-1.5h | 30min | 1.5-2h |
| DeleteQuestion() | 30min | 15min | 45min |
| ListQuestions() | 0h | 0h | 0h (no changes) |
| **TOTAL** | **2.5-4h** | **1.25h** | **3.75-5.25h** |

### Implementation Order
1. ✅ **DeleteQuestion()** - Simplest, good warm-up
2. ✅ **CreateQuestion()** - Core functionality, most complex
3. ✅ **UpdateQuestion()** - Similar to Create, reuse patterns
4. ✅ **ListQuestions()** - Already working, no changes needed

### Files to Modify
- `apps/backend/internal/grpc/question_service.go` - Add 3 method implementations
- No new files needed (reuse existing helper functions)

### Dependencies
- ✅ Service layer methods available (CreateQuestion, UpdateQuestion, DeleteQuestion)
- ✅ Helper functions available (convertQuestionToProto, util converters)
- ✅ Enum converters available (convertQuestionTypeToString, etc.)
- ✅ Error handling patterns established

---

**Planning Completed**: 2025-01-19  
**Augment Context Engine Calls**: 10/10 ✅  
**Status**: READY FOR EXECUTION PHASE

