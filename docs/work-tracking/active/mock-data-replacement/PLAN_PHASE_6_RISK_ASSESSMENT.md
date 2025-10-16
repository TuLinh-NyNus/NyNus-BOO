# PLAN Phase 6: Risk Assessment & Mitigation
**Date**: 2025-01-19  
**Status**: PLAN Phase 6 - Risk Management  
**Methodology**: RIPER-5 PLAN Mode

## Executive Summary

### Risk Overview
Document này xác định các risks liên quan đến migration từ mock data sang real implementation và định nghĩa mitigation strategies chi tiết.

### Risk Categories
1. **Technical Risks** - Breaking changes, performance, data integrity
2. **Operational Risks** - Timeline, resource availability, testing coverage
3. **Business Risks** - User impact, feature availability, rollback scenarios

### Overall Risk Level
- **Sprint 1 (MockQuestionsService)**: 🟡 **MEDIUM** (Mitigated with feature flags)
- **Sprint 2 (ExamService + Search)**: 🟢 **LOW** (Low impact changes)
- **Sprint 3 (Admin Notifications)**: 🟢 **LOW** (Optional feature)

---

## 1. Technical Risks

### Risk 1.1: Breaking Changes in Question CRUD
**Severity**: 🔴 **HIGH**  
**Probability**: 🟡 **MEDIUM**  
**Impact**: Admin không thể quản lý questions

**Description**:
- Backend API changes có thể break existing frontend code
- Protobuf type mismatches
- Validation rules khác với mock
- Error handling khác

**Mitigation Strategies**:

**1. Feature Flags**
```typescript
// Environment variable control
NEXT_PUBLIC_USE_MOCK_QUESTIONS=false // Production
NEXT_PUBLIC_USE_MOCK_QUESTIONS=true  // Fallback

// Service wrapper
export const getQuestionService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_QUESTIONS === 'true') {
    return MockQuestionsService;
  }
  return questionService;
};
```

**2. Gradual Rollout**
- **Phase 1** (Day 1-2): Deploy backend, frontend still using mock
- **Phase 2** (Day 3-5): Enable for admin users only (role-based)
- **Phase 3** (Day 6-7): Enable for all users after testing
- **Phase 4** (Day 8+): Remove mock code

**3. Comprehensive Testing**
- Unit tests coverage ≥ 90%
- Integration tests for all CRUD operations
- E2E tests for complete workflows
- Manual testing checklist

**4. API Versioning**
```protobuf
// Use versioned API
service QuestionService {
  rpc CreateQuestion(v1.CreateQuestionRequest) returns (v1.CreateQuestionResponse);
}
```

**5. Backward Compatibility**
- Keep mock service available for 2 weeks
- Monitor error rates in production
- Quick rollback procedure ready

**Rollback Procedure**:
1. Set `NEXT_PUBLIC_USE_MOCK_QUESTIONS=true`
2. Redeploy frontend (< 5 minutes)
3. Investigate issues
4. Fix and redeploy

**Monitoring**:
- Error rate alerts (> 5% errors)
- Response time alerts (> 1s)
- User feedback monitoring

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

### Risk 1.2: LaTeX Parsing Complexity
**Severity**: 🟡 **MEDIUM**  
**Probability**: 🔴 **HIGH**  
**Impact**: Import questions feature không hoạt động đúng

**Description**:
- LaTeX syntax rất phức tạp và đa dạng
- Nhiều edge cases khó handle
- Performance issues với large files
- Parsing errors khó debug

**Mitigation Strategies**:

**1. Use Proven LaTeX Parser Library**
```go
// Use existing library instead of custom parser
import "github.com/latex-parser/go-latex"

parser := latex.NewParser()
questions, errors := parser.ParseQuestions(latexContent)
```

**2. Comprehensive Error Handling**
```go
type ParseError struct {
    Line    int
    Column  int
    Message string
    Context string
}

func (p *Parser) Parse(content string) ([]Question, []ParseError) {
    questions := []Question{}
    errors := []ParseError{}
    
    // Parse with detailed error reporting
    for lineNum, line := range strings.Split(content, "\n") {
        q, err := p.parseLine(line)
        if err != nil {
            errors = append(errors, ParseError{
                Line:    lineNum + 1,
                Message: err.Error(),
                Context: line,
            })
            continue
        }
        questions = append(questions, q)
    }
    
    return questions, errors
}
```

**3. Validation Before Import**
```typescript
// Frontend validation
const validateLatexFile = (content: string): ValidationResult => {
  const errors: string[] = [];
  
  // Check file size (max 5MB)
  if (content.length > 5 * 1024 * 1024) {
    errors.push('File quá lớn (max 5MB)');
  }
  
  // Check basic LaTeX syntax
  if (!content.includes('\\begin{question}')) {
    errors.push('Không tìm thấy câu hỏi hợp lệ');
  }
  
  return { valid: errors.length === 0, errors };
};
```

**4. Preview Before Import**
```typescript
// Show preview of parsed questions
const handlePreview = async (latexContent: string) => {
  const preview = await questionService.previewImport(latexContent);
  setPreviewQuestions(preview.questions);
  setPreviewErrors(preview.errors);
  
  // User confirms before actual import
  if (confirm(`Import ${preview.questions.length} câu hỏi?`)) {
    await questionService.importQuestions(latexContent);
  }
};
```

**5. Fallback to Manual Entry**
```typescript
// If LaTeX parsing fails, allow manual entry
if (importResult.totalErrors > 0) {
  toast.warning(
    `Có ${importResult.totalErrors} lỗi. Bạn có thể nhập thủ công các câu hỏi bị lỗi.`
  );
  router.push('/admin/questions/create');
}
```

**6. Performance Optimization**
```go
// Process large files in chunks
const CHUNK_SIZE = 100 // questions per chunk

func (s *QuestionService) ImportQuestions(content string) (*ImportResult, error) {
    questions := parseQuestions(content)
    
    // Import in chunks
    for i := 0; i < len(questions); i += CHUNK_SIZE {
        end := min(i+CHUNK_SIZE, len(questions))
        chunk := questions[i:end]
        
        if err := s.repo.BulkCreate(chunk); err != nil {
            return nil, err
        }
    }
    
    return &ImportResult{...}, nil
}
```

**Testing Strategy**:
- Test với 100+ LaTeX samples
- Test edge cases (special characters, nested structures)
- Performance test với large files (1000+ questions)
- Error handling tests

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

### Risk 1.3: Performance Degradation
**Severity**: 🟡 **MEDIUM**  
**Probability**: 🟡 **MEDIUM**  
**Impact**: Slow response times, poor UX

**Description**:
- Database queries chậm hơn mock data
- N+1 query problems
- Large result sets
- No caching

**Mitigation Strategies**:

**1. Database Indexing**
```sql
-- Add performance indexes
CREATE INDEX idx_question_content_search ON question USING gin(to_tsvector('english', content));
CREATE INDEX idx_question_type_difficulty ON question(type, difficulty);
CREATE INDEX idx_question_subject_grade ON question(subject, grade);
CREATE INDEX idx_question_created_by ON question(created_by);
```

**2. Query Optimization**
```go
// Use eager loading to avoid N+1
func (r *QuestionRepository) GetByID(ctx context.Context, id string) (*Question, error) {
    var question Question
    err := r.db.WithContext(ctx).
        Preload("Answers").        // Eager load answers
        Preload("Images").         // Eager load images
        Preload("Tags").           // Eager load tags
        Preload("QuestionCode").   // Eager load question code
        First(&question, "id = ?", id).
        Error
    return &question, err
}
```

**3. Pagination**
```go
// Always use pagination
func (r *QuestionRepository) List(ctx context.Context, filters Filters) (*PaginatedResult, error) {
    var questions []Question
    var total int64
    
    query := r.db.WithContext(ctx).Model(&Question{})
    
    // Apply filters
    if filters.Type != "" {
        query = query.Where("type = ?", filters.Type)
    }
    
    // Count total
    query.Count(&total)
    
    // Paginate
    query = query.
        Limit(filters.PageSize).
        Offset((filters.Page - 1) * filters.PageSize)
    
    query.Find(&questions)
    
    return &PaginatedResult{
        Items: questions,
        Total: total,
        Page:  filters.Page,
    }, nil
}
```

**4. Caching Strategy**
```go
// Redis caching for frequently accessed data
func (s *QuestionService) GetQuestion(ctx context.Context, id string) (*Question, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("question:%s", id)
    if cached, err := s.cache.Get(ctx, cacheKey); err == nil {
        return cached, nil
    }
    
    // Cache miss - get from database
    question, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }
    
    // Cache for 5 minutes
    s.cache.Set(ctx, cacheKey, question, 5*time.Minute)
    
    return question, nil
}
```

**5. Response Time Monitoring**
```go
// Add metrics
func (s *QuestionService) CreateQuestion(ctx context.Context, req *Request) (*Response, error) {
    start := time.Now()
    defer func() {
        duration := time.Since(start)
        metrics.RecordLatency("question.create", duration)
        
        if duration > 500*time.Millisecond {
            log.Warn("Slow question creation", "duration", duration)
        }
    }()
    
    // ... implementation
}
```

**Performance Targets**:
- CreateQuestion: < 500ms
- UpdateQuestion: < 500ms
- DeleteQuestion: < 300ms
- GetQuestion: < 200ms (with cache)
- ListQuestions: < 500ms (paginated)
- ImportQuestions: < 2s per 10 questions

**Load Testing**:
- Test with 10,000+ questions in database
- Concurrent user testing (100+ users)
- Stress testing (1000+ requests/second)

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

### Risk 1.4: Data Integrity Issues
**Severity**: 🔴 **HIGH**  
**Probability**: 🟢 **LOW**  
**Impact**: Data corruption, inconsistent state

**Description**:
- Concurrent updates conflicts
- Cascade delete issues
- Transaction failures
- Data validation gaps

**Mitigation Strategies**:

**1. Database Transactions**
```go
// Use transactions for multi-step operations
func (s *QuestionService) CreateQuestionWithImages(ctx context.Context, q *Question) error {
    return s.db.Transaction(func(tx *gorm.DB) error {
        // 1. Create question
        if err := tx.Create(q).Error; err != nil {
            return err
        }
        
        // 2. Create images
        for _, img := range q.Images {
            img.QuestionID = q.ID
            if err := tx.Create(&img).Error; err != nil {
                return err // Rollback
            }
        }
        
        // 3. Create tags
        for _, tag := range q.Tags {
            if err := tx.Create(&tag).Error; err != nil {
                return err // Rollback
            }
        }
        
        return nil // Commit
    })
}
```

**2. Optimistic Locking**
```go
// Add version field for optimistic locking
type Question struct {
    ID        string
    Content   string
    Version   int    `gorm:"default:1"` // Version for optimistic locking
    UpdatedAt time.Time
}

func (r *QuestionRepository) Update(ctx context.Context, q *Question) error {
    result := r.db.WithContext(ctx).
        Model(&Question{}).
        Where("id = ? AND version = ?", q.ID, q.Version).
        Updates(map[string]interface{}{
            "content": q.Content,
            "version": gorm.Expr("version + 1"),
        })
    
    if result.RowsAffected == 0 {
        return errors.New("concurrent update detected")
    }
    
    return result.Error
}
```

**3. Cascade Delete Protection**
```go
// Check before delete
func (s *QuestionService) DeleteQuestion(ctx context.Context, id string) error {
    // Check if used in exams
    isUsed, err := s.examRepo.IsQuestionUsedInExams(ctx, id)
    if err != nil {
        return err
    }
    
    if isUsed {
        return errors.New("cannot delete question used in exams")
    }
    
    // Safe to delete
    return s.repo.SoftDelete(ctx, id)
}
```

**4. Input Validation**
```go
// Comprehensive validation
func validateQuestion(q *Question) error {
    if q.Content == "" {
        return errors.New("content is required")
    }
    
    if len(q.Content) > 10000 {
        return errors.New("content too long (max 10000 characters)")
    }
    
    if q.Type == "multiple-choice" && len(q.Answers) < 2 {
        return errors.New("multiple choice must have at least 2 answers")
    }
    
    // Validate at least one correct answer
    hasCorrect := false
    for _, ans := range q.Answers {
        if ans.IsCorrect {
            hasCorrect = true
            break
        }
    }
    if !hasCorrect {
        return errors.New("must have at least one correct answer")
    }
    
    return nil
}
```

**5. Database Constraints**
```sql
-- Add database constraints
ALTER TABLE question ADD CONSTRAINT check_content_not_empty CHECK (content != '');
ALTER TABLE question ADD CONSTRAINT check_type_valid CHECK (type IN ('multiple-choice', 'essay', 'short-answer', 'true-false'));
ALTER TABLE question_answer ADD CONSTRAINT check_at_least_one_correct CHECK (
    EXISTS (SELECT 1 FROM question_answer WHERE question_id = question.id AND is_correct = true)
);
```

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

## 2. Operational Risks

### Risk 2.1: Timeline Delays
**Severity**: 🟡 **MEDIUM**  
**Probability**: 🟡 **MEDIUM**  
**Impact**: Project delays, missed deadlines

**Description**:
- Underestimated effort
- Unexpected technical challenges
- Resource unavailability
- Scope creep

**Mitigation Strategies**:

**1. Phased Approach**
- **Sprint 1**: Focus only on MockQuestionsService (12-18 giờ)
- **Sprint 2**: ExamService + Search (5-8 giờ)
- **Sprint 3**: Optional (Admin Notifications)

**2. Buffer Time**
- Add 20% buffer to estimates
- Sprint 1: 12-18 giờ → 15-22 giờ (with buffer)
- Sprint 2: 5-8 giờ → 6-10 giờ (with buffer)

**3. Daily Standups**
- Track progress daily
- Identify blockers early
- Adjust timeline if needed

**4. Scope Control**
- No feature additions during migration
- Defer non-critical features to Sprint 3
- Focus on core functionality first

**5. Parallel Work**
- Backend and frontend can work in parallel
- Testing can start early with mocks

**Contingency Plan**:
- If Sprint 1 delayed > 1 week, split into smaller phases
- If critical blocker, escalate immediately
- If resource unavailable, adjust timeline

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

### Risk 2.2: Testing Coverage Gaps
**Severity**: 🟡 **MEDIUM**  
**Probability**: 🟡 **MEDIUM**  
**Impact**: Bugs in production, poor quality

**Description**:
- Insufficient unit tests
- Missing integration tests
- No E2E tests
- Edge cases not covered

**Mitigation Strategies**:

**1. Test Coverage Requirements**
- Backend unit tests: ≥ 90%
- Frontend unit tests: ≥ 80%
- Integration tests: All CRUD operations
- E2E tests: Critical user flows

**2. Test-Driven Development**
```go
// Write tests first
func TestCreateQuestion(t *testing.T) {
    // Arrange
    service := NewQuestionService(mockRepo)
    request := &CreateQuestionRequest{...}
    
    // Act
    response, err := service.CreateQuestion(ctx, request)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, response)
}

// Then implement
func (s *QuestionService) CreateQuestion(...) {...}
```

**3. Automated Testing Pipeline**
```yaml
# CI/CD pipeline
test:
  stage: test
  script:
    - go test ./... -cover -coverprofile=coverage.out
    - go tool cover -func=coverage.out
    - npm run test:unit
    - npm run test:integration
    - npm run test:e2e
  coverage: '/total:.*?(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

**4. Manual Testing Checklist**
- [ ] Create question (all types)
- [ ] Edit question
- [ ] Delete question (with/without force)
- [ ] Import questions (valid/invalid LaTeX)
- [ ] Bulk operations
- [ ] Error scenarios
- [ ] Permission checks
- [ ] Performance testing

**5. Code Review Requirements**
- All PRs must have tests
- Code coverage must not decrease
- At least 2 reviewers

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

### Risk 2.3: Resource Availability
**Severity**: 🟡 **MEDIUM**  
**Probability**: 🟢 **LOW**  
**Impact**: Project delays

**Description**:
- Team members unavailable
- Competing priorities
- Knowledge gaps

**Mitigation Strategies**:

**1. Cross-Training**
- Document all technical decisions
- Pair programming sessions
- Knowledge sharing meetings

**2. Documentation**
- Comprehensive technical specs (this document)
- Code comments
- API documentation
- Runbooks

**3. Resource Planning**
- Identify key personnel
- Have backup resources
- Plan for vacations/sick days

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

## 3. Business Risks

### Risk 3.1: User Impact
**Severity**: 🔴 **HIGH**  
**Probability**: 🟢 **LOW**  
**Impact**: User complaints, lost productivity

**Description**:
- UI/UX changes confuse users
- Features temporarily unavailable
- Performance issues
- Data loss

**Mitigation Strategies**:

**1. Zero UI Changes**
- Keep exact same UI/UX
- No visual changes
- Same workflows
- Same error messages (Vietnamese)

**2. Feature Flags**
- Gradual rollout
- Quick rollback if issues
- A/B testing capability

**3. User Communication**
- Announce changes in advance
- Provide migration guide
- Support channel ready

**4. Monitoring**
- User feedback collection
- Error rate monitoring
- Support ticket tracking

**5. Rollback Plan**
- Can rollback in < 5 minutes
- No data loss
- Seamless transition

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

### Risk 3.2: Feature Availability
**Severity**: 🟡 **MEDIUM**  
**Probability**: 🟢 **LOW**  
**Impact**: Features temporarily unavailable

**Description**:
- Deployment downtime
- Migration issues
- Rollback scenarios

**Mitigation Strategies**:

**1. Zero-Downtime Deployment**
```bash
# Blue-green deployment
# 1. Deploy new version (green)
# 2. Test green environment
# 3. Switch traffic to green
# 4. Keep blue as backup
```

**2. Database Migrations**
```sql
-- Backward compatible migrations
-- Add new columns with defaults
ALTER TABLE question ADD COLUMN new_field VARCHAR(255) DEFAULT '';

-- Don't drop columns immediately
-- Mark as deprecated first
```

**3. Feature Toggles**
```typescript
// Can disable features if issues
if (featureFlags.useRealQuestionService) {
  return questionService.createQuestion(data);
} else {
  return MockQuestionsService.createQuestion(data);
}
```

**Residual Risk**: 🟢 **LOW** (after mitigation)

---

## 4. Rollback Procedures

### 4.1 Emergency Rollback (< 5 minutes)

**Trigger Conditions**:
- Error rate > 10%
- Response time > 2s
- Critical bug discovered
- Data integrity issues

**Rollback Steps**:

**Step 1: Enable Mock Service** (1 minute)
```bash
# Set environment variable
export NEXT_PUBLIC_USE_MOCK_QUESTIONS=true

# Redeploy frontend
npm run build
pm2 restart frontend
```

**Step 2: Verify** (2 minutes)
```bash
# Check health
curl https://api.nynus.com/health

# Check error rate
curl https://api.nynus.com/metrics | grep error_rate

# Manual test
# - Create question
# - Edit question
# - Delete question
```

**Step 3: Communicate** (2 minutes)
- Notify team
- Update status page
- Inform users if needed

---

### 4.2 Planned Rollback (Testing Phase)

**If issues found during testing**:

**Step 1: Document Issues**
- List all bugs found
- Severity assessment
- Root cause analysis

**Step 2: Decide**
- Fix immediately (if minor)
- Rollback and fix (if major)
- Defer to next sprint (if non-critical)

**Step 3: Execute**
- Follow emergency rollback if needed
- Or fix and redeploy

---

## 5. Risk Matrix Summary

| Risk | Severity | Probability | Impact | Mitigation | Residual |
|------|----------|-------------|--------|------------|----------|
| Breaking Changes | 🔴 HIGH | 🟡 MEDIUM | HIGH | Feature flags, gradual rollout | 🟢 LOW |
| LaTeX Parsing | 🟡 MEDIUM | 🔴 HIGH | MEDIUM | Library, validation, fallback | 🟢 LOW |
| Performance | 🟡 MEDIUM | 🟡 MEDIUM | MEDIUM | Indexing, caching, pagination | 🟢 LOW |
| Data Integrity | 🔴 HIGH | 🟢 LOW | HIGH | Transactions, validation | 🟢 LOW |
| Timeline Delays | 🟡 MEDIUM | 🟡 MEDIUM | MEDIUM | Phased approach, buffer | 🟢 LOW |
| Testing Gaps | 🟡 MEDIUM | 🟡 MEDIUM | MEDIUM | Coverage requirements, TDD | 🟢 LOW |
| Resource Availability | 🟡 MEDIUM | 🟢 LOW | MEDIUM | Cross-training, documentation | 🟢 LOW |
| User Impact | 🔴 HIGH | 🟢 LOW | HIGH | Zero UI changes, rollback | 🟢 LOW |
| Feature Availability | 🟡 MEDIUM | 🟢 LOW | MEDIUM | Zero-downtime deployment | 🟢 LOW |

**Overall Risk Level**: 🟢 **LOW** (after all mitigations)

---

## 6. Monitoring & Alerts

### 6.1 Key Metrics

**Performance Metrics**:
- API response time (p50, p95, p99)
- Database query time
- Cache hit rate
- Throughput (requests/second)

**Error Metrics**:
- Error rate (%)
- Error types distribution
- Failed requests count

**Business Metrics**:
- Questions created/day
- Questions imported/day
- Active users
- Feature usage

### 6.2 Alert Thresholds

**Critical Alerts** (immediate action):
- Error rate > 10%
- Response time p95 > 2s
- Database connection failures
- Service unavailable

**Warning Alerts** (investigate):
- Error rate > 5%
- Response time p95 > 1s
- Cache hit rate < 80%
- Slow queries > 500ms

### 6.3 Monitoring Tools

- **Application**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger
- **Alerts**: PagerDuty / Slack

---

**Report Generated**: 2025-01-19  
**Methodology**: RIPER-5 PLAN Mode  
**Status**: ✅ PLAN Phase 6 Complete  
**Next**: EXECUTE Phase 7 - Create Comprehensive Analysis Report

