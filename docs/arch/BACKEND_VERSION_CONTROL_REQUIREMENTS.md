# Backend Requirements: Version Control System

> **Document tạo:** 26/01/2025  
> **Status:** Frontend hoàn thành, Backend cần implement  
> **Priority:** HIGH

---

## 📋 OVERVIEW

Hệ thống Version Control cho Questions cần backend implementation để:
1. Auto-save versions khi update questions
2. Retrieve version history
3. Compare versions
4. Revert to previous versions

Frontend UI đã sẵn sàng và đang dùng mock data.

---

## 🗄️ DATABASE SCHEMA

### Table: `question_versions`

```sql
CREATE TABLE question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  
  -- Question data snapshot
  content TEXT NOT NULL,
  raw_content TEXT,
  structured_answers JSONB,
  difficulty VARCHAR(20),
  status VARCHAR(20),
  tags TEXT[],
  
  -- Version metadata
  changed_by UUID NOT NULL REFERENCES users(id),
  change_reason TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Full snapshot for safety
  full_snapshot JSONB NOT NULL,
  
  -- Constraints
  UNIQUE(question_id, version_number),
  CHECK (version_number > 0)
);

-- Indexes
CREATE INDEX idx_question_versions_question_id ON question_versions(question_id);
CREATE INDEX idx_question_versions_changed_at ON question_versions(changed_at DESC);
CREATE INDEX idx_question_versions_changed_by ON question_versions(changed_by);
```

### Trigger: Auto-create version on UPDATE

```sql
CREATE OR REPLACE FUNCTION create_question_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
  user_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM question_versions
  WHERE question_id = OLD.id;
  
  -- Get current user from context (hoặc từ OLD.updated_by)
  user_id := current_setting('app.current_user_id', true)::UUID;
  IF user_id IS NULL THEN
    user_id := OLD.creator; -- Fallback
  END IF;
  
  -- Insert version record
  INSERT INTO question_versions (
    question_id,
    version_number,
    content,
    raw_content,
    structured_answers,
    difficulty,
    status,
    tags,
    changed_by,
    change_reason,
    changed_at,
    full_snapshot
  ) VALUES (
    OLD.id,
    next_version,
    OLD.content,
    OLD.raw_content,
    OLD.structured_answers,
    OLD.difficulty,
    OLD.status,
    OLD.tag,
    user_id,
    NEW.version_change_reason, -- Add this column to questions table
    OLD.updated_at,
    row_to_json(OLD.*)
  );
  
  -- Clear change reason after saving
  NEW.version_change_reason := NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER question_version_trigger
  BEFORE UPDATE ON questions
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_question_version();
```

### Migration Script

```sql
-- Migration: Add version control
-- Created: 2025-01-26

BEGIN;

-- Add version_change_reason to questions table
ALTER TABLE questions
ADD COLUMN version_change_reason TEXT;

-- Create question_versions table
-- (use schema above)

-- Create trigger
-- (use trigger above)

-- Backfill: Create v1 for existing questions
INSERT INTO question_versions (
  question_id,
  version_number,
  content,
  raw_content,
  structured_answers,
  difficulty,
  status,
  tags,
  changed_by,
  change_reason,
  changed_at,
  full_snapshot
)
SELECT
  id,
  1, -- version 1
  content,
  raw_content,
  structured_answers,
  difficulty,
  status,
  tag,
  creator,
  'Initial version',
  created_at,
  row_to_json(questions.*)
FROM questions;

COMMIT;
```

---

## 🔌 GRPC API ENDPOINTS

### 1. GetVersionHistory

**Request:**
```protobuf
message GetVersionHistoryRequest {
  string question_id = 1;
  int32 page = 2;
  int32 limit = 3; // Max 50
}
```

**Response:**
```protobuf
message GetVersionHistoryResponse {
  repeated QuestionVersion versions = 1;
  int32 total_count = 2;
  common.Response response = 3;
}

message QuestionVersion {
  string id = 1;
  int32 version_number = 2;
  string question_id = 3;
  string content = 4;
  string raw_content = 5;
  google.protobuf.Struct structured_answers = 6;
  string difficulty = 7;
  string status = 8;
  repeated string tags = 9;
  string changed_by = 10;
  string changed_by_name = 11; // JOIN from users
  string change_reason = 12;
  string changed_at = 13;
  bool is_current = 14;
}
```

**Business Logic:**
- Fetch versions ordered by `version_number DESC`
- Include user name via JOIN
- Mark current version (latest)
- Apply pagination

---

### 2. GetVersion

**Request:**
```protobuf
message GetVersionRequest {
  string question_id = 1;
  int32 version_number = 2;
}
```

**Response:**
```protobuf
message GetVersionResponse {
  QuestionVersion version = 1;
  common.Response response = 2;
}
```

**Business Logic:**
- Fetch specific version
- Return full snapshot if needed

---

### 3. CompareVersions

**Request:**
```protobuf
message CompareVersionsRequest {
  string question_id = 1;
  int32 version1 = 2;
  int32 version2 = 3;
}
```

**Response:**
```protobuf
message CompareVersionsResponse {
  QuestionVersion version1 = 1;
  QuestionVersion version2 = 2;
  VersionDiff diff = 3;
  common.Response response = 4;
}

message VersionDiff {
  repeated DiffChange content_changes = 1;
  repeated DiffChange answer_changes = 2;
  map<string, string> metadata_changes = 3;
}

message DiffChange {
  string type = 1; // "added", "removed", "modified"
  string old_value = 2;
  string new_value = 3;
  string field_path = 4;
}
```

**Business Logic:**
- Fetch both versions
- Compute diff (optional: server-side or client-side)
- Return structured diff data

---

### 4. RevertToVersion

**Request:**
```protobuf
message RevertToVersionRequest {
  string question_id = 1;
  int32 target_version = 2;
  string reason = 3; // Required, min 10 chars
  string reverted_by = 4; // User ID
}
```

**Response:**
```protobuf
message RevertToVersionResponse {
  Question updated_question = 1;
  int32 new_version_number = 2;
  common.Response response = 3;
}
```

**Business Logic:**
1. Validate reason (not empty, min 10 chars)
2. Fetch target version data
3. Update questions table với target version data
4. Set `version_change_reason` = "Reverted to v{target_version}: {reason}"
5. Trigger auto-saves new version
6. Return updated question + new version number

---

## 🔍 GO SERVICE IMPLEMENTATION

### Repository Layer

```go
// internal/repository/question_version.go

type QuestionVersionRepository interface {
    GetVersionHistory(ctx context.Context, questionID string, pagination *models.Pagination) ([]*models.QuestionVersion, int, error)
    GetVersion(ctx context.Context, questionID string, versionNumber int) (*models.QuestionVersion, error)
    CompareVersions(ctx context.Context, questionID string, v1, v2 int) (*models.VersionComparison, error)
    RevertToVersion(ctx context.Context, questionID string, targetVersion int, reason string, userId string) (*models.Question, error)
}

// Implementation
func (r *postgresQuestionVersionRepo) GetVersionHistory(
    ctx context.Context, 
    questionID string, 
    pagination *models.Pagination,
) ([]*models.QuestionVersion, int, error) {
    // SQL query với JOIN users table
    query := `
        SELECT 
            qv.*,
            u.full_name as changed_by_name,
            CASE WHEN qv.version_number = (
                SELECT MAX(version_number) FROM question_versions WHERE question_id = qv.question_id
            ) THEN true ELSE false END as is_current
        FROM question_versions qv
        JOIN users u ON qv.changed_by = u.id
        WHERE qv.question_id = $1
        ORDER BY qv.version_number DESC
        LIMIT $2 OFFSET $3
    `
    
    // Execute query
    // Map results
    // Return versions + total count
}
```

### Service Layer

```go
// internal/service/question_version_service.go

type QuestionVersionService struct {
    repo repository.QuestionVersionRepository
    questionRepo repository.QuestionRepository
}

func (s *QuestionVersionService) RevertToVersion(
    ctx context.Context,
    questionID string,
    targetVersion int,
    reason string,
    userId string,
) (*models.Question, int, error) {
    // 1. Validate reason
    if len(strings.TrimSpace(reason)) < 10 {
        return nil, 0, errors.New("reason must be at least 10 characters")
    }
    
    // 2. Get target version
    version, err := s.repo.GetVersion(ctx, questionID, targetVersion)
    if err != nil {
        return nil, 0, err
    }
    
    // 3. Update question with version data
    question, err := s.questionRepo.GetByID(ctx, questionID)
    if err != nil {
        return nil, 0, err
    }
    
    // Apply version data
    question.Content = version.Content
    question.RawContent = version.RawContent
    question.StructuredAnswers = version.StructuredAnswers
    question.Difficulty = version.Difficulty
    question.Status = version.Status
    question.Tags = version.Tags
    question.VersionChangeReason = fmt.Sprintf("Reverted to v%d: %s", targetVersion, reason)
    question.UpdatedAt = time.Now()
    
    // 4. Save (trigger will create new version)
    updatedQuestion, err := s.questionRepo.Update(ctx, question)
    if err != nil {
        return nil, 0, err
    }
    
    // 5. Get new version number
    newVersionNumber, err := s.repo.GetLatestVersionNumber(ctx, questionID)
    if err != nil {
        return nil, 0, err
    }
    
    return updatedQuestion, newVersionNumber, nil
}
```

---

## ✅ ACCEPTANCE CRITERIA

Backend implementation hoàn thành khi:
- [ ] Migration executed successfully
- [ ] Trigger auto-creates versions on UPDATE
- [ ] All 4 gRPC endpoints implemented
- [ ] Repository + Service layers complete
- [ ] Unit tests (coverage > 80%)
- [ ] Integration tests với database
- [ ] Load test với 100+ versions per question
- [ ] Frontend integration successful (replace mock data)
- [ ] API documentation updated

---

## 📊 TESTING CHECKLIST

### Unit Tests
- [ ] Version creation trigger
- [ ] GetVersionHistory pagination
- [ ] GetVersion by number
- [ ] CompareVersions diff logic
- [ ] RevertToVersion validation
- [ ] Reason validation (min 10 chars)

### Integration Tests
- [ ] Create question → v1 auto-created
- [ ] Update question → new version saved
- [ ] Revert → restores data correctly
- [ ] Revert → creates new version (not overwrites)
- [ ] Multiple reverts work correctly
- [ ] Version history ordered correctly

### Performance Tests
- [ ] Get history với 100 versions < 500ms
- [ ] Get history với 1000 versions < 1s
- [ ] Compare versions < 200ms
- [ ] Revert operation < 500ms

---

## 🚀 DEPLOYMENT STEPS

1. **Pre-deployment:**
   - Review schema changes
   - Test migration on staging
   - Backup production database

2. **Migration:**
   - Run migration script
   - Verify trigger installed
   - Check backfill data

3. **Deploy Backend:**
   - Deploy new gRPC endpoints
   - Update API documentation
   - Monitor error rates

4. **Frontend Integration:**
   - Remove mock data
   - Connect to real API
   - Test all workflows

5. **Post-deployment:**
   - Monitor performance
   - Check version creation
   - Verify revert works

---

## 📞 CONTACT

**Backend Developer:** [Cần assign]  
**Estimated Effort:** 4-5 days  
**Dependencies:** Database access, gRPC tooling

---

**Frontend sẵn sàng! Backend có thể bắt đầu implement ngay! 🚀**

