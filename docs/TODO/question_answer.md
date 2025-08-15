# 🚨 Vấn đề Cấu trúc Dữ liệu Answers & CorrectAnswer

**Ngày tạo**: 2025-01-15  
**Trạng thái**: 🔴 Critical - Cần giải quyết ngay  
**Ưu tiên**: High Priority  

## 📋 Tóm tắt vấn đề

Hiện tại hệ thống có **inconsistency nghiêm trọng** trong cấu trúc dữ liệu `answers` và `correctAnswer` giữa các layers (Frontend, Backend, Database, Proto), gây ra:

- ❌ **Type mismatch** khi convert data giữa FE ↔ BE
- ❌ **Hardcoded values** trong conversion functions
- ❌ **Multiple Question interfaces** trong Frontend
- ❌ **Missing fields** trong Proto definitions
- ❌ **Lack of validation** cho data integrity

## 🔍 Chi tiết vấn đề

### 1. **Frontend Type Chaos**

**Vấn đề**: Có **3 định nghĩa Question khác nhau** trong Frontend:

```typescript
// File 1: apps/frontend/src/lib/types/question.ts
interface Question {
  answers?: AnswerOption[] | MatchingOption[];
  correctAnswer?: CorrectAnswer;
}

// File 2: apps/frontend/src/lib/mockdata/core-types.ts  
interface Question {
  answers?: string[] | Record<string, unknown> | null;
  correctAnswer?: string | string[] | Record<string, unknown> | null;
}

// File 3: apps/frontend/src/lib/mockdata/shared/core-types.ts
interface Question {
  answers?: string[] | Record<string, unknown> | null;
  correctAnswer?: string | string[] | Record<string, unknown> | null;
}
```

**Hậu quả**: 
- Developer không biết dùng interface nào
- Type conflicts khi import
- Inconsistent data structure

### 2. **Backend Entity Generic JSONB**

**Vấn đề**: Backend sử dụng generic JSONB không type-safe:

```go
// apps/backend/internal/entity/question.go
type Question struct {
    Answers        pgtype.JSONB  `json:"answers"`        // ❌ Too generic
    CorrectAnswer  pgtype.JSONB  `json:"correct_answer"` // ❌ No validation
}
```

**Hậu quả**:
- Không có compile-time type checking
- Có thể lưu invalid data structure
- Khó debug khi có lỗi data

### 3. **Proto Definitions Incomplete**

**Vấn đề**: Proto thiếu nhiều fields quan trọng:

```proto
// packages/proto/v1/question.proto
message Question {
  repeated Answer answers = 5;
  // ❌ MISSING: correctAnswer field
  // ❌ MISSING: rawContent field  
  // ❌ MISSING: subcount field
  // ❌ MISSING: questionCodeId field
}
```

**Hậu quả**:
- API không thể truyền đầy đủ data
- Frontend không nhận được complete question object
- Phải hardcode hoặc skip fields

### 4. **Conversion Functions Broken**

**Vấn đề**: Backend conversion functions có hardcoded values:

```go
// apps/backend/internal/grpc/question_service.go
func convertQuestionToProto(question *entity.Question) *v1.Question {
    return &v1.Question{
        Type:        common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE, // ❌ HARDCODED!
        Difficulty:  common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM,    // ❌ HARDCODED!
        // ❌ Missing proper field mapping
    }
}
```

**Hậu quả**:
- Tất cả questions đều trả về type = "MULTIPLE_CHOICE"
- Tất cả questions đều trả về difficulty = "MEDIUM"
- Data bị corrupt khi convert

### 5. **Proto vs Database Enum Mismatch**

**Vấn đề**: Proto enums khác với Database enums:

| Layer | QuestionType Values |
|-------|-------------------|
| **Database** | `MC, TF, SA, ES, MA` |
| **Frontend** | `MC, TF, SA, ES, MA` |
| **Proto** | `QUESTION_TYPE_MULTIPLE_CHOICE, QUESTION_TYPE_TRUE_FALSE, ...` |

**Hậu quả**:
- Không thể map trực tiếp giữa Proto ↔ Database
- Cần conversion logic phức tạp
- Dễ bị lỗi khi thêm enum values mới

## 📊 Impact Assessment

### **Severity**: 🔴 Critical
- **Development**: Blocking new question features
- **Data Integrity**: Risk of corrupted question data
- **User Experience**: Inconsistent question display
- **Maintenance**: High complexity to fix bugs

### **Affected Components**:
- ✅ **Frontend**: Question forms, displays, API calls
- ✅ **Backend**: Question CRUD operations, API responses
- ✅ **Database**: Question data storage and retrieval
- ✅ **Proto**: API contracts and type definitions

## 🎯 Proposed Solution

### **Phase 1: Standardize Structure**
1. **Create unified TypeScript interfaces** cho answers/correctAnswer
2. **Define standard JSON schema** cho database JSONB fields
3. **Update Proto definitions** với complete field set

### **Phase 2: Implementation**
1. **Consolidate Frontend types** - chỉ giữ 1 Question interface
2. **Update Backend entities** với proper typing
3. **Fix conversion functions** với proper field mapping
4. **Add validation rules** cho data integrity

### **Phase 3: Testing & Migration**
1. **Create comprehensive test suite**
2. **Migrate existing data** to new structure
3. **Verify cross-platform compatibility**

## 📅 Timeline

**Estimated effort**: 10-12 ngày làm việc

- **Phase 1**: 3-4 ngày (Foundation)
- **Phase 2**: 5-6 ngày (Implementation) 
- **Phase 3**: 2-3 ngày (Testing & Migration)

## 🚨 Risks if not fixed

1. **Data Corruption**: Invalid question structures in database
2. **Development Blocker**: Cannot implement new question features
3. **User Experience**: Broken question display/editing
4. **Technical Debt**: Increasing complexity over time
5. **Scalability**: Cannot support new question types

## 📝 Next Steps

1. ✅ **Approve solution approach** với team
2. ⏳ **Start Phase 1**: Create unified types và validation
3. ⏳ **Implement Phase 2**: Update all layers
4. ⏳ **Execute Phase 3**: Testing và migration

---

**📞 Contact**: Development Team  
**📁 Related Files**: 
- `apps/frontend/src/lib/types/question.ts`
- `apps/backend/internal/entity/question.go`
- `packages/proto/v1/question.proto`
- `packages/database/migrations/000002_question_bank_system.up.sql`

**🔗 References**:
- [Kế hoạch chi tiết chuẩn hóa](../migration-guide.md)
- [Database schema documentation](../IMPLEMENT_QUESTION.md)
