# 🔄 Backend ↔ Flutter Enum Mapping Guide
**Critical Reference cho Development Team**

## ⚠️ QUAN TRỌNG

**Tại sao cần guide này?**
- Backend sử dụng Protocol Buffers (proto enums)
- Flutter sử dụng Dart enums
- **Mismatch = Runtime errors và data corruption**
- **PHẢI match 100% để app hoạt động**

## 📋 MAPPING RULES

### Rule 1: Proto Enum → Dart Enum
```
Proto:   EXAM_TYPE_GENERATED (1) 
         ↓
Dart:    ExamType.generated
```

### Rule 2: Value Numbers
```
Proto enum values BẮT ĐẦU từ 0 (UNSPECIFIED)
Dart enum index BẮT ĐẦU từ 0

⚠️ WARNING: Proto value 0 thường là UNSPECIFIED, không map sang Dart
```

### Rule 3: Naming Convention
```
Proto:  UPPER_SNAKE_CASE (EXAM_TYPE_GENERATED)
Dart:   camelCase (generated)
```

---

## 🎓 EXAM SYSTEM ENUMS

### ExamType
**Backend Proto**: `packages/proto/v1/exam.proto`
```proto
enum ExamType {
  EXAM_TYPE_UNSPECIFIED = 0;
  EXAM_TYPE_GENERATED = 1;    // Đề thi tạo từ ngân hàng câu hỏi
  EXAM_TYPE_OFFICIAL = 2;     // Đề thi thật từ trường/sở
}
```

**Flutter Dart**: `lib/features/exams/domain/entities/exam.dart`
```dart
enum ExamType { 
  generated,  // Maps to EXAM_TYPE_GENERATED (1)
  official    // Maps to EXAM_TYPE_OFFICIAL (2)
}
```

**Mapping Function**:
```dart
static ExamType mapProtoExamType(pb.ExamType protoType) {
  switch (protoType) {
    case pb.ExamType.EXAM_TYPE_GENERATED:
      return ExamType.generated;
    case pb.ExamType.EXAM_TYPE_OFFICIAL:
      return ExamType.official;
    case pb.ExamType.EXAM_TYPE_UNSPECIFIED:
    default:
      return ExamType.generated; // Default fallback
  }
}

static pb.ExamType mapDartExamType(ExamType dartType) {
  switch (dartType) {
    case ExamType.generated:
      return pb.ExamType.EXAM_TYPE_GENERATED;
    case ExamType.official:
      return pb.ExamType.EXAM_TYPE_OFFICIAL;
  }
}
```

---

### ExamStatus
**Backend Proto**: `packages/proto/v1/exam.proto`
```proto
enum ExamStatus {
  EXAM_STATUS_UNSPECIFIED = 0;
  EXAM_STATUS_ACTIVE = 1;     // Đã xuất bản, students có thể làm
  EXAM_STATUS_PENDING = 2;    // Đang soạn thảo, chờ review
  EXAM_STATUS_INACTIVE = 3;   // Tạm ngưng
  EXAM_STATUS_ARCHIVED = 4;   // Đã lưu trữ
}
```

**Flutter Dart**:
```dart
enum ExamStatus { 
  active,     // Maps to EXAM_STATUS_ACTIVE (1)
  pending,    // Maps to EXAM_STATUS_PENDING (2)
  inactive,   // Maps to EXAM_STATUS_INACTIVE (3)
  archived    // Maps to EXAM_STATUS_ARCHIVED (4)
}
```

**Mapping Function**:
```dart
static ExamStatus mapProtoExamStatus(pb.ExamStatus protoStatus) {
  switch (protoStatus) {
    case pb.ExamStatus.EXAM_STATUS_ACTIVE:
      return ExamStatus.active;
    case pb.ExamStatus.EXAM_STATUS_PENDING:
      return ExamStatus.pending;
    case pb.ExamStatus.EXAM_STATUS_INACTIVE:
      return ExamStatus.inactive;
    case pb.ExamStatus.EXAM_STATUS_ARCHIVED:
      return ExamStatus.archived;
    case pb.ExamStatus.EXAM_STATUS_UNSPECIFIED:
    default:
      return ExamStatus.pending; // Default fallback
  }
}
```

---

### AttemptStatus
**Backend Proto**: `packages/proto/v1/exam.proto`
```proto
enum AttemptStatus {
  ATTEMPT_STATUS_UNSPECIFIED = 0;
  ATTEMPT_STATUS_IN_PROGRESS = 1;  // Đang làm bài
  ATTEMPT_STATUS_SUBMITTED = 2;    // Đã nộp bài
  ATTEMPT_STATUS_GRADED = 3;       // Đã chấm điểm
  ATTEMPT_STATUS_CANCELLED = 4;    // Đã hủy
}
```

**Flutter Dart**:
```dart
enum SessionStatus { 
  inProgress,  // Maps to ATTEMPT_STATUS_IN_PROGRESS (1)
  submitted,   // Maps to ATTEMPT_STATUS_SUBMITTED (2) - Not used in mobile
  completed,   // Similar to GRADED (3)
  abandoned,   // Similar to CANCELLED (4)
  timedOut     // Mobile-specific
}
```

**Note**: Mobile có extra `timedOut` status cho timed exams

---

## 📚 QUESTION SYSTEM ENUMS

### QuestionType
**Backend Proto**: `packages/proto/v1/question.proto`
```proto
enum QuestionType {
  QUESTION_TYPE_UNSPECIFIED = 0;
  QUESTION_TYPE_MULTIPLE_CHOICE = 1;  // MC
  QUESTION_TYPE_TRUE_FALSE = 2;       // TF
  QUESTION_TYPE_SHORT_ANSWER = 3;     // SA
  QUESTION_TYPE_ESSAY = 4;            // ES
  QUESTION_TYPE_MATCHING = 5;         // MA
}
```

**Flutter Dart**:
```dart
enum QuestionType { 
  multipleChoice,  // Maps to QUESTION_TYPE_MULTIPLE_CHOICE (1)
  trueFalse,       // Maps to QUESTION_TYPE_TRUE_FALSE (2)
  shortAnswer,     // Maps to QUESTION_TYPE_SHORT_ANSWER (3)
  essay,           // Maps to QUESTION_TYPE_ESSAY (4)
  matching,        // Maps to QUESTION_TYPE_MATCHING (5)
  fillInBlank      // Mobile-specific extra type
}
```

---

### QuestionStatus
**Backend Proto**: `packages/proto/v1/question.proto`
```proto
enum QuestionStatus {
  QUESTION_STATUS_UNSPECIFIED = 0;
  QUESTION_STATUS_ACTIVE = 1;
  QUESTION_STATUS_PENDING = 2;
  QUESTION_STATUS_INACTIVE = 3;
  QUESTION_STATUS_ARCHIVED = 4;
}
```

**Flutter Dart**:
```dart
enum QuestionStatus { 
  approved,  // Maps to ACTIVE (1) - Note: different naming!
  pending,   // Maps to PENDING (2)
  rejected,  // Maps to INACTIVE (3) - Note: different naming!
  archived   // Maps to ARCHIVED (4)
}
```

**⚠️ WARNING**: `approved` vs `active`, `rejected` vs `inactive`

---

### Difficulty
**Backend Proto**: `packages/proto/v1/exam.proto` và `question.proto`
```proto
enum Difficulty {
  DIFFICULTY_UNSPECIFIED = 0;
  DIFFICULTY_EASY = 1;        // Dễ
  DIFFICULTY_MEDIUM = 2;      // Trung bình
  DIFFICULTY_HARD = 3;        // Khó
  DIFFICULTY_EXPERT = 4;      // Rất khó
}
```

**Flutter Dart**:
```dart
enum DifficultyLevel { 
  easy,    // Maps to DIFFICULTY_EASY (1)
  medium,  // Maps to DIFFICULTY_MEDIUM (2)
  hard,    // Maps to DIFFICULTY_HARD (3)
  expert   // Maps to DIFFICULTY_EXPERT (4)
}
```

---

## 📖 LIBRARY SYSTEM ENUMS

### LibraryItemType
**Backend Proto**: `packages/proto/v1/library.proto`
```proto
enum LibraryItemType {
  LIBRARY_ITEM_TYPE_UNSPECIFIED = 0;
  LIBRARY_ITEM_TYPE_EXAM = 1;
  LIBRARY_ITEM_TYPE_BOOK = 2;
  LIBRARY_ITEM_TYPE_VIDEO = 3;
}
```

**Flutter Dart**:
```dart
enum LibraryItemType {
  exam,   // Maps to LIBRARY_ITEM_TYPE_EXAM (1)
  book,   // Maps to LIBRARY_ITEM_TYPE_BOOK (2)
  video   // Maps to LIBRARY_ITEM_TYPE_VIDEO (3)
}
```

---

### LibraryUploadStatus
**Backend Proto**: `packages/proto/v1/library.proto`
```proto
enum LibraryUploadStatus {
  LIBRARY_UPLOAD_STATUS_UNSPECIFIED = 0;
  LIBRARY_UPLOAD_STATUS_PENDING = 1;
  LIBRARY_UPLOAD_STATUS_APPROVED = 2;
  LIBRARY_UPLOAD_STATUS_REJECTED = 3;
  LIBRARY_UPLOAD_STATUS_ARCHIVED = 4;
}
```

**Flutter Dart**:
```dart
enum LibraryUploadStatus {
  pending,    // Maps to LIBRARY_UPLOAD_STATUS_PENDING (1)
  approved,   // Maps to LIBRARY_UPLOAD_STATUS_APPROVED (2)
  rejected,   // Maps to LIBRARY_UPLOAD_STATUS_REJECTED (3)
  archived    // Maps to LIBRARY_UPLOAD_STATUS_ARCHIVED (4)
}
```

---

## 👤 USER SYSTEM ENUMS

### UserRole
**Backend Database**: CHECK constraint in users table
```sql
CHECK (role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'))
```

**Flutter Dart**:
```dart
enum UserRole { 
  guest,    // Maps to 'GUEST'
  student,  // Maps to 'STUDENT'
  tutor,    // Maps to 'TUTOR'
  teacher,  // Maps to 'TEACHER'
  admin     // Maps to 'ADMIN'
}
```

**String Mapping**:
```dart
String getUserRoleString(UserRole role) {
  return role.name.toUpperCase(); // guest → GUEST
}

UserRole parseUserRole(String roleStr) {
  return UserRole.values.firstWhere(
    (r) => r.name.toUpperCase() == roleStr.toUpperCase(),
    orElse: () => UserRole.guest,
  );
}
```

---

### UserStatus
**Backend Database**:
```sql
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
```

**Flutter Dart**:
```dart
enum UserStatus { 
  active,     // Maps to 'ACTIVE'
  inactive,   // Maps to 'INACTIVE'
  suspended,  // Maps to 'SUSPENDED'
  deleted     // Mobile-specific for soft delete
}
```

---

## 🔬 THEORY/BLOG SYSTEM ENUMS

### PostType
**Backend Proto**: `packages/proto/v1/blog.proto`
```proto
enum PostType { 
  POST_TYPE_UNSPECIFIED = 0;
  POST_TYPE_ARTICLE = 1;
  POST_TYPE_THEORY = 2;
  POST_TYPE_MATH_NOTE = 3;
}
```

**Flutter Dart**:
```dart
enum PostType { 
  unspecified,  // Maps to POST_TYPE_UNSPECIFIED (0) - rare
  article,      // Maps to POST_TYPE_ARTICLE (1)
  theory,       // Maps to POST_TYPE_THEORY (2)
  mathNote,     // Maps to POST_TYPE_MATH_NOTE (3)
  blog          // Mobile-specific extra type
}
```

---

## 📊 NOTIFICATION ENUMS

### NotificationType
**Backend Database**: CHECK constraint in notifications table
```sql
CHECK (type IN ('SECURITY_ALERT', 'COURSE_UPDATE', 'SYSTEM_MESSAGE', 
                'ACHIEVEMENT', 'SOCIAL', 'PAYMENT'))
```

**Flutter Dart**:
```dart
enum NotificationType {
  securityAlert,   // Maps to 'SECURITY_ALERT'
  courseUpdate,    // Maps to 'COURSE_UPDATE'
  systemMessage,   // Maps to 'SYSTEM_MESSAGE'
  achievement,     // Maps to 'ACHIEVEMENT'
  social,          // Maps to 'SOCIAL'
  payment,         // Maps to 'PAYMENT'
  examReminder,    // Mobile-specific
  resultAvailable  // Mobile-specific
}
```

---

## 🛠️ HELPER FUNCTIONS

### Generic Enum Mapper

**File:** `lib/core/utils/enum_mapper.dart`
```dart
class EnumMapper {
  // Safe enum mapping với fallback
  static T mapEnum<T>(
    int protoValue,
    List<T> dartEnumValues,
    T defaultValue,
  ) {
    try {
      // Proto value 1 → Dart index 0
      // Proto value 2 → Dart index 1
      // etc.
      if (protoValue <= 0 || protoValue > dartEnumValues.length) {
        return defaultValue;
      }
      return dartEnumValues[protoValue - 1];
    } catch (e) {
      debugPrint('Enum mapping error: $e');
      return defaultValue;
    }
  }

  // Reverse mapping
  static int mapEnumToProto<T>(
    T dartEnum,
    List<T> dartEnumValues,
  ) {
    final index = dartEnumValues.indexOf(dartEnum);
    // Dart index 0 → Proto value 1
    // Dart index 1 → Proto value 2
    // etc.
    return index + 1;
  }
}
```

### Usage Example
```dart
// Map from proto to dart
final examType = EnumMapper.mapEnum(
  protoExam.examType.value,  // 1 or 2
  ExamType.values,            // [generated, official]
  ExamType.generated,         // default fallback
);

// Map from dart to proto
final protoValue = EnumMapper.mapEnumToProto(
  ExamType.official,          // Dart enum
  ExamType.values,            // List of values
);  // Returns 2
```

---

## ⚠️ COMMON PITFALLS

### Pitfall 1: Index vs Value Confusion
```dart
// ❌ WRONG - Using proto value as dart index
final status = ExamStatus.values[protoExam.status]; // ERROR!

// ✅ CORRECT - Use mapping function
final status = mapProtoExamStatus(protoExam.status);
```

### Pitfall 2: Case Sensitivity
```dart
// ❌ WRONG - Case mismatch
if (role == 'student') { ... }  // Backend sends 'STUDENT'

// ✅ CORRECT - Handle case
if (role.toUpperCase() == 'STUDENT') { ... }
```

### Pitfall 3: UNSPECIFIED Value
```dart
// ❌ WRONG - Không handle UNSPECIFIED
final type = ExamType.values[protoType - 1];  // Crash nếu protoType = 0

// ✅ CORRECT - Check for UNSPECIFIED
if (protoType == pb.ExamType.EXAM_TYPE_UNSPECIFIED) {
  return ExamType.generated; // Default
}
```

---

## 🧪 VALIDATION TESTS

### Enum Mapping Test Template

```dart
// test/core/utils/enum_mapper_test.dart
void main() {
  group('ExamType Enum Mapping', () {
    test('maps GENERATED correctly', () {
      final protoType = pb.ExamType.EXAM_TYPE_GENERATED;
      final dartType = mapProtoExamType(protoType);
      
      expect(dartType, ExamType.generated);
      expect(mapDartExamType(dartType), protoType);
    });

    test('maps OFFICIAL correctly', () {
      final protoType = pb.ExamType.EXAM_TYPE_OFFICIAL;
      final dartType = mapProtoExamType(protoType);
      
      expect(dartType, ExamType.official);
      expect(mapDartExamType(dartType), protoType);
    });

    test('handles UNSPECIFIED safely', () {
      final protoType = pb.ExamType.EXAM_TYPE_UNSPECIFIED;
      final dartType = mapProtoExamType(protoType);
      
      expect(dartType, ExamType.generated); // Should use default
    });
  });
}
```

---

## 📋 QUICK REFERENCE TABLE

### All Enum Mappings

| System | Backend Enum | Flutter Enum | Values Match | Notes |
|--------|--------------|--------------|--------------|-------|
| **Exam** | ExamType | ExamType | ✅ Yes | generated, official |
| **Exam** | ExamStatus | ExamStatus | ✅ Yes | active, pending, inactive, archived |
| **Exam** | AttemptStatus | SessionStatus | ⚠️ Partial | Different naming |
| **Exam** | Difficulty | DifficultyLevel | ✅ Yes | easy, medium, hard, expert |
| **Question** | QuestionType | QuestionType | ✅ Yes | MC, TF, SA, ES, MA (+fillInBlank mobile) |
| **Question** | QuestionStatus | QuestionStatus | ⚠️ Different | active→approved, inactive→rejected |
| **Library** | LibraryItemType | LibraryItemType | ✅ Yes | exam, book, video |
| **Library** | LibraryUploadStatus | LibraryUploadStatus | ✅ Yes | pending, approved, rejected, archived |
| **User** | role (string) | UserRole | ✅ Yes | guest, student, tutor, teacher, admin |
| **User** | status (string) | UserStatus | ✅ Yes | active, inactive, suspended (+deleted mobile) |
| **Theory** | PostType | PostType | ✅ Yes | article, theory, mathNote (+blog mobile) |
| **Notification** | type (string) | NotificationType | ✅ Yes | securityAlert, courseUpdate, etc. |

### Legend
- ✅ **Perfect Match**: Enum values map 1:1
- ⚠️ **Partial Match**: Some values khác hoặc naming khác
- ❌ **Mismatch**: Cần sửa

---

## 🔧 DEVELOPMENT WORKFLOW

### Step 1: Proto Changes
Khi backend update proto file:
```bash
# Backend team runs
buf generate

# Notify mobile team
```

### Step 2: Flutter Update
Mobile team update mapping:
```bash
# Regenerate dart proto files
./scripts/generate_proto.sh

# Update enum mappings if needed
# Update model classes
# Update tests
```

### Step 3: Validation
```bash
# Run enum mapping tests
flutter test test/core/utils/enum_mapper_test.dart

# Run integration tests
flutter test integration_test/

# Verify with backend
# Manual testing với real backend
```

---

## 📝 BEST PRACTICES

### 1. Always Use Mapping Functions
```dart
// ❌ DON'T: Direct assignment
final status = ExamStatus.values[proto.status];

// ✅ DO: Use mapping function
final status = mapProtoExamStatus(proto.status);
```

### 2. Provide Fallback Values
```dart
// ✅ Always have default fallback
static ExamType mapProtoExamType(pb.ExamType type) {
  switch (type) {
    case pb.ExamType.EXAM_TYPE_GENERATED:
      return ExamType.generated;
    case pb.ExamType.EXAM_TYPE_OFFICIAL:
      return ExamType.official;
    default:  // ← IMPORTANT!
      return ExamType.generated;
  }
}
```

### 3. Handle UNSPECIFIED
```dart
// ✅ Check for UNSPECIFIED before mapping
if (protoType == pb.ExamType.EXAM_TYPE_UNSPECIFIED) {
  return ExamType.generated; // Default
}
```

### 4. Test Bidirectional Mapping
```dart
test('enum mapping is bidirectional', () {
  for (final dartEnum in ExamType.values) {
    final protoEnum = mapDartExamType(dartEnum);
    final backToDart = mapProtoExamType(protoEnum);
    
    expect(backToDart, dartEnum); // Should be same
  }
});
```

### 5. Log Mapping Errors
```dart
try {
  final mapped = mapProtoExamType(protoType);
  return mapped;
} catch (e) {
  logger.error('Enum mapping failed', error: e);
  return ExamType.generated; // Fallback
}
```

---

## 🚨 CRITICAL WARNINGS

### Warning 1: Proto Changes
**Khi backend thay đổi proto enum:**
1. ⚠️ **MUST update Flutter mappings**
2. ⚠️ **MUST update tests**
3. ⚠️ **MUST verify existing data**
4. ⚠️ **MUST communicate with team**

### Warning 2: Data Migration
**Khi đổi enum values:**
1. ⚠️ **Existing cached data có thể invalid**
2. ⚠️ **MUST clear cache hoặc migrate**
3. ⚠️ **MUST test offline scenarios**

### Warning 3: Default Values
**Always có default cho mọi enum:**
```dart
// ✅ GOOD - Has sensible default
final status = mapStatus(proto.status) ?? ExamStatus.pending;

// ❌ BAD - Can be null
final status = mapStatus(proto.status);  // Crash if unknown value!
```

---

## 📚 RESOURCES

### Proto Files Location
```
packages/proto/v1/
├── exam.proto          # Exam enums
├── question.proto      # Question enums
├── library.proto       # Library enums
├── blog.proto          # Theory/Blog enums
└── user.proto          # User enums (if any)
```

### Flutter Enum Locations
```
lib/features/
├── exams/domain/entities/exam.dart
├── questions/domain/entities/question.dart
├── library/domain/entities/document.dart
├── theory/domain/entities/theory_content.dart
└── auth/domain/entities/user.dart
```

### Mapping Functions Location
```
lib/features/
├── exams/data/models/exam_model.dart          # Exam mappings
├── questions/data/models/question_model.dart  # Question mappings
├── library/data/models/document_model.dart    # Library mappings
└── theory/data/models/theory_post_model.dart  # Theory mappings
```

---

**Last Updated**: 2025-10-26  
**Version**: 1.0  
**Status**: ✅ Complete Reference Guide

**🎯 USE THIS GUIDE** khi:
- Implement model classes
- Write proto mapping functions
- Debug enum-related errors
- Review code changes
- Update after proto changes
