# Repository Layer Agent Guide
*Hướng dẫn chi tiết cho AI agents implement repository pattern*

## 📋 Tổng quan Repository Layer

**NyNus Repository Layer** implement Clean Architecture pattern với PostgreSQL, cung cấp data access layer cho toàn bộ hệ thống.

### Repository Pattern Benefits
- **Separation of Concerns** - Tách biệt business logic và data access
- **Testability** - Dễ dàng mock cho unit testing
- **Database Independence** - Có thể thay đổi database mà không ảnh hưởng business logic
- **Consistency** - Standardized data access patterns

## 🏗️ Repository Structure

```
apps/backend/internal/repository/
├── interfaces/                  # Repository interfaces
│   ├── question_repository.go   # Question repository interface
│   └── question_image_repository.go # Question image interface
├── user.go                     # User repository implementation
├── question_repository.go      # Question repository implementation
├── question_filter.go          # Advanced question filtering
├── question_code_repository.go # Question code management
├── question_image_repository.go # Question image handling
├── question_tag.go             # Question tagging system
├── answer.go                   # Answer repository
├── refresh_token.go            # JWT refresh token management
├── session.go                  # User session management
├── oauth_account.go            # OAuth account management
├── contact_repository.go       # Contact form repository
├── newsletter_repository.go    # Newsletter subscription
├── notification.go             # Notification repository
├── audit_log.go               # Audit logging
├── exam_repository.go         # Exam management
├── enrollment.go              # Course enrollment
├── resource_access.go         # Resource access control
├── user_preference.go         # User preferences
├── user_wrapper.go           # User wrapper utilities
└── errors.go                 # Repository error definitions
```

## 🔧 Repository Interface Pattern

### Interface Definition
```go
// interfaces/question_repository.go
type QuestionRepository interface {
    // CRUD operations
    Create(ctx context.Context, question *entity.Question) error
    GetByID(ctx context.Context, id string) (*entity.Question, error)
    GetByIDs(ctx context.Context, ids []string) ([]*entity.Question, error)
    Update(ctx context.Context, question *entity.Question) error
    Delete(ctx context.Context, id string) error
    
    // Query operations
    List(ctx context.Context, pagination *Pagination) ([]*entity.Question, int64, error)
    GetByCreatedBy(ctx context.Context, userID string, pagination *Pagination) ([]*entity.Question, int64, error)
    GetBySubject(ctx context.Context, subject string, pagination *Pagination) ([]*entity.Question, int64, error)
    
    // Search operations
    Search(ctx context.Context, query string, pagination *Pagination) ([]*entity.Question, int64, error)
    GetByTags(ctx context.Context, tags []string, pagination *Pagination) ([]*entity.Question, int64, error)
    
    // Bulk operations
    BulkCreate(ctx context.Context, questions []*entity.Question) error
    BulkUpdate(ctx context.Context, questions []*entity.Question) error
    BulkDelete(ctx context.Context, ids []string) error
}
```

### Implementation Structure
```go
// question_repository.go
type questionRepository struct {
    db     *pgx.Conn
    logger *logrus.Logger
}

func NewQuestionRepository(db *pgx.Conn, logger *logrus.Logger) QuestionRepository {
    return &questionRepository{
        db:     db,
        logger: logger,
    }
}
```

## 📝 CRUD Operations Implementation

### Create Operation
```go
func (r *questionRepository) Create(ctx context.Context, question *entity.Question) error {
    query := `
        INSERT INTO questions (
            id, content, question_type, difficulty_level, 
            subject, topic, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

    _, err := r.db.Exec(ctx, query,
        question.ID,
        question.Content,
        question.QuestionType,
        question.Difficulty,
        question.Subject,
        question.Topic,
        question.CreatedBy,
        question.CreatedAt,
        question.UpdatedAt,
    )

    if err != nil {
        r.logger.WithError(err).Error("Failed to create question")
        
        // Handle specific database errors
        if isDuplicateKeyError(err) {
            return ErrDuplicate
        }
        if isForeignKeyError(err) {
            return ErrInvalidReference
        }
        
        return fmt.Errorf("failed to create question: %w", err)
    }

    r.logger.WithField("question_id", question.ID).Info("Question created successfully")
    return nil
}
```

### Read Operations
```go
func (r *questionRepository) GetByID(ctx context.Context, id string) (*entity.Question, error) {
    query := `
        SELECT id, content, question_type, difficulty_level, 
               subject, topic, created_by, created_at, updated_at
        FROM questions 
        WHERE id = $1 AND deleted_at IS NULL`

    var question entity.Question
    err := r.db.QueryRow(ctx, query, id).Scan(
        &question.ID,
        &question.Content,
        &question.QuestionType,
        &question.Difficulty,
        &question.Subject,
        &question.Topic,
        &question.CreatedBy,
        &question.CreatedAt,
        &question.UpdatedAt,
    )

    if err != nil {
        if err == pgx.ErrNoRows {
            return nil, ErrNotFound
        }
        r.logger.WithError(err).WithField("question_id", id).Error("Failed to get question")
        return nil, fmt.Errorf("failed to get question: %w", err)
    }

    return &question, nil
}

func (r *questionRepository) GetByIDs(ctx context.Context, ids []string) ([]*entity.Question, error) {
    if len(ids) == 0 {
        return []*entity.Question{}, nil
    }

    query := `
        SELECT id, content, question_type, difficulty_level, 
               subject, topic, created_by, created_at, updated_at
        FROM questions 
        WHERE id = ANY($1) AND deleted_at IS NULL
        ORDER BY created_at DESC`

    rows, err := r.db.Query(ctx, query, pq.Array(ids))
    if err != nil {
        r.logger.WithError(err).Error("Failed to get questions by IDs")
        return nil, fmt.Errorf("failed to get questions: %w", err)
    }
    defer rows.Close()

    var questions []*entity.Question
    for rows.Next() {
        var question entity.Question
        err := rows.Scan(
            &question.ID,
            &question.Content,
            &question.QuestionType,
            &question.Difficulty,
            &question.Subject,
            &question.Topic,
            &question.CreatedBy,
            &question.CreatedAt,
            &question.UpdatedAt,
        )
        if err != nil {
            r.logger.WithError(err).Error("Failed to scan question")
            return nil, fmt.Errorf("failed to scan question: %w", err)
        }
        questions = append(questions, &question)
    }

    return questions, nil
}
```

### Update Operation
```go
func (r *questionRepository) Update(ctx context.Context, question *entity.Question) error {
    query := `
        UPDATE questions 
        SET content = $2, question_type = $3, difficulty_level = $4,
            subject = $5, topic = $6, updated_at = $7
        WHERE id = $1 AND deleted_at IS NULL`

    result, err := r.db.Exec(ctx, query,
        question.ID,
        question.Content,
        question.QuestionType,
        question.Difficulty,
        question.Subject,
        question.Topic,
        time.Now(),
    )

    if err != nil {
        r.logger.WithError(err).WithField("question_id", question.ID).Error("Failed to update question")
        return fmt.Errorf("failed to update question: %w", err)
    }

    rowsAffected := result.RowsAffected()
    if rowsAffected == 0 {
        return ErrNotFound
    }

    r.logger.WithField("question_id", question.ID).Info("Question updated successfully")
    return nil
}
```

### Delete Operation (Soft Delete)
```go
func (r *questionRepository) Delete(ctx context.Context, id string) error {
    query := `
        UPDATE questions 
        SET deleted_at = $2, updated_at = $2
        WHERE id = $1 AND deleted_at IS NULL`

    result, err := r.db.Exec(ctx, query, id, time.Now())
    if err != nil {
        r.logger.WithError(err).WithField("question_id", id).Error("Failed to delete question")
        return fmt.Errorf("failed to delete question: %w", err)
    }

    rowsAffected := result.RowsAffected()
    if rowsAffected == 0 {
        return ErrNotFound
    }

    r.logger.WithField("question_id", id).Info("Question deleted successfully")
    return nil
}
```

## 🔍 Advanced Query Operations

### Pagination Implementation
```go
type Pagination struct {
    Page      int    `json:"page"`
    PageSize  int    `json:"page_size"`
    SortBy    string `json:"sort_by"`
    SortOrder string `json:"sort_order"`
}

func (r *questionRepository) List(ctx context.Context, pagination *Pagination) ([]*entity.Question, int64, error) {
    // Validate and set defaults
    if pagination.Page < 1 {
        pagination.Page = 1
    }
    if pagination.PageSize < 1 || pagination.PageSize > 100 {
        pagination.PageSize = 20
    }
    if pagination.SortBy == "" {
        pagination.SortBy = "created_at"
    }
    if pagination.SortOrder != "asc" && pagination.SortOrder != "desc" {
        pagination.SortOrder = "desc"
    }

    // Count total records
    countQuery := `SELECT COUNT(*) FROM questions WHERE deleted_at IS NULL`
    var total int64
    err := r.db.QueryRow(ctx, countQuery).Scan(&total)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to count questions: %w", err)
    }

    // Get paginated results
    offset := (pagination.Page - 1) * pagination.PageSize
    query := fmt.Sprintf(`
        SELECT id, content, question_type, difficulty_level, 
               subject, topic, created_by, created_at, updated_at
        FROM questions 
        WHERE deleted_at IS NULL
        ORDER BY %s %s
        LIMIT $1 OFFSET $2`,
        pagination.SortBy, pagination.SortOrder)

    rows, err := r.db.Query(ctx, query, pagination.PageSize, offset)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to list questions: %w", err)
    }
    defer rows.Close()

    var questions []*entity.Question
    for rows.Next() {
        var question entity.Question
        err := rows.Scan(
            &question.ID,
            &question.Content,
            &question.QuestionType,
            &question.Difficulty,
            &question.Subject,
            &question.Topic,
            &question.CreatedBy,
            &question.CreatedAt,
            &question.UpdatedAt,
        )
        if err != nil {
            return nil, 0, fmt.Errorf("failed to scan question: %w", err)
        }
        questions = append(questions, &question)
    }

    return questions, total, nil
}
```

### Search Implementation
```go
func (r *questionRepository) Search(ctx context.Context, query string, pagination *Pagination) ([]*entity.Question, int64, error) {
    searchQuery := `
        SELECT id, content, question_type, difficulty_level, 
               subject, topic, created_by, created_at, updated_at
        FROM questions 
        WHERE deleted_at IS NULL 
        AND (
            content ILIKE $1 OR 
            subject ILIKE $1 OR 
            topic ILIKE $1 OR
            id IN (
                SELECT question_id FROM question_tags 
                WHERE tag ILIKE $1
            )
        )
        ORDER BY 
            CASE WHEN content ILIKE $1 THEN 1 ELSE 2 END,
            created_at DESC
        LIMIT $2 OFFSET $3`

    searchTerm := "%" + query + "%"
    offset := (pagination.Page - 1) * pagination.PageSize

    rows, err := r.db.Query(ctx, searchQuery, searchTerm, pagination.PageSize, offset)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to search questions: %w", err)
    }
    defer rows.Close()

    var questions []*entity.Question
    for rows.Next() {
        var question entity.Question
        err := rows.Scan(
            &question.ID,
            &question.Content,
            &question.QuestionType,
            &question.Difficulty,
            &question.Subject,
            &question.Topic,
            &question.CreatedBy,
            &question.CreatedAt,
            &question.UpdatedAt,
        )
        if err != nil {
            return nil, 0, fmt.Errorf("failed to scan question: %w", err)
        }
        questions = append(questions, &question)
    }

    // Count search results
    countQuery := `
        SELECT COUNT(*) FROM questions 
        WHERE deleted_at IS NULL 
        AND (
            content ILIKE $1 OR 
            subject ILIKE $1 OR 
            topic ILIKE $1 OR
            id IN (
                SELECT question_id FROM question_tags 
                WHERE tag ILIKE $1
            )
        )`

    var total int64
    err = r.db.QueryRow(ctx, countQuery, searchTerm).Scan(&total)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to count search results: %w", err)
    }

    return questions, total, nil
}
```

## 🔄 Transaction Management

### Transaction Wrapper
```go
func (r *questionRepository) CreateWithAnswers(ctx context.Context, question *entity.Question, answers []*entity.Answer) error {
    // Begin transaction
    tx, err := r.db.Begin(ctx)
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback(ctx) // Rollback if not committed

    // Create question
    questionQuery := `
        INSERT INTO questions (
            id, content, question_type, difficulty_level, 
            subject, topic, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

    _, err = tx.Exec(ctx, questionQuery,
        question.ID, question.Content, question.QuestionType,
        question.Difficulty, question.Subject, question.Topic,
        question.CreatedBy, question.CreatedAt, question.UpdatedAt,
    )
    if err != nil {
        return fmt.Errorf("failed to create question: %w", err)
    }

    // Create answers
    for _, answer := range answers {
        answerQuery := `
            INSERT INTO answers (
                id, question_id, content, is_correct, 
                explanation, order_index, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`

        _, err = tx.Exec(ctx, answerQuery,
            answer.ID, answer.QuestionID, answer.Content,
            answer.IsCorrect, answer.Explanation,
            answer.OrderIndex, answer.CreatedAt,
        )
        if err != nil {
            return fmt.Errorf("failed to create answer: %w", err)
        }
    }

    // Commit transaction
    if err = tx.Commit(ctx); err != nil {
        return fmt.Errorf("failed to commit transaction: %w", err)
    }

    return nil
}
```

## 🔐 Authentication Repositories

### User Repository
```go
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
    query := `
        SELECT id, email, password_hash, full_name, role, status, 
               created_at, updated_at
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL`

    var user entity.User
    err := r.db.QueryRow(ctx, query, email).Scan(
        &user.ID,
        &user.Email,
        &user.PasswordHash,
        &user.FullName,
        &user.Role,
        &user.Status,
        &user.CreatedAt,
        &user.UpdatedAt,
    )

    if err != nil {
        if err == pgx.ErrNoRows {
            return nil, ErrNotFound
        }
        return nil, fmt.Errorf("failed to get user by email: %w", err)
    }

    return &user, nil
}
```

### Session Repository
```go
func (r *sessionRepository) Create(ctx context.Context, session *entity.Session) error {
    query := `
        INSERT INTO sessions (
            id, user_id, session_token, device_fingerprint,
            ip_address, user_agent, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

    _, err := r.db.Exec(ctx, query,
        session.ID,
        session.UserID,
        session.SessionToken,
        session.DeviceFingerprint,
        session.IPAddress,
        session.UserAgent,
        session.ExpiresAt,
        session.CreatedAt,
    )

    if err != nil {
        return fmt.Errorf("failed to create session: %w", err)
    }

    return nil
}

func (r *sessionRepository) GetByToken(ctx context.Context, token string) (*entity.Session, error) {
    query := `
        SELECT id, user_id, session_token, device_fingerprint,
               ip_address, user_agent, expires_at, created_at
        FROM sessions 
        WHERE session_token = $1 AND expires_at > NOW()`

    var session entity.Session
    err := r.db.QueryRow(ctx, query, token).Scan(
        &session.ID,
        &session.UserID,
        &session.SessionToken,
        &session.DeviceFingerprint,
        &session.IPAddress,
        &session.UserAgent,
        &session.ExpiresAt,
        &session.CreatedAt,
    )

    if err != nil {
        if err == pgx.ErrNoRows {
            return nil, ErrNotFound
        }
        return nil, fmt.Errorf("failed to get session: %w", err)
    }

    return &session, nil
}
```

## ⚠️ Error Handling

### Repository Errors
```go
// errors.go
var (
    ErrNotFound         = errors.New("resource not found")
    ErrDuplicate        = errors.New("resource already exists")
    ErrInvalidInput     = errors.New("invalid input")
    ErrInvalidReference = errors.New("invalid reference")
    ErrConstraintViolation = errors.New("constraint violation")
)

// Error checking utilities
func isDuplicateKeyError(err error) bool {
    var pgErr *pgconn.PgError
    return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func isForeignKeyError(err error) bool {
    var pgErr *pgconn.PgError
    return errors.As(err, &pgErr) && pgErr.Code == "23503"
}

func isConstraintViolationError(err error) bool {
    var pgErr *pgconn.PgError
    return errors.As(err, &pgErr) && strings.HasPrefix(pgErr.Code, "23")
}
```

## 🧪 Repository Testing

### Test Structure
```go
func TestQuestionRepository_Create(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    repo := NewQuestionRepository(db, logrus.New())

    // Test data
    question := &entity.Question{
        ID:           uuid.New().String(),
        Content:      "Test question content",
        QuestionType: "multiple_choice",
        Difficulty:   "medium",
        Subject:      "Math",
        Topic:        "Algebra",
        CreatedBy:    "user-123",
        CreatedAt:    time.Now(),
        UpdatedAt:    time.Now(),
    }

    // Test create
    err := repo.Create(context.Background(), question)
    assert.NoError(t, err)

    // Verify creation
    retrieved, err := repo.GetByID(context.Background(), question.ID)
    assert.NoError(t, err)
    assert.Equal(t, question.Content, retrieved.Content)
    assert.Equal(t, question.QuestionType, retrieved.QuestionType)
}
```

---

**🚀 Quick Repository Development:**
1. Define repository interface
2. Implement CRUD operations
3. Add query methods with pagination
4. Implement proper error handling
5. Add transaction support
6. Write comprehensive tests

**🔧 Best Practices:**
1. Use interfaces for testability
2. Implement proper error handling
3. Use transactions for multi-table operations
4. Add proper logging
5. Validate input parameters
6. Use prepared statements for performance
