package question_mgmt

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	questionService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/question"
	questionCodeService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/questioncode"
)

// IQuestionService defines the interface for question domain service
type IQuestionService interface {
	GetByID(ctx context.Context, db database.QueryExecer, id string) (entity.Question, error)
	GetByQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeID string) ([]entity.Question, error)
	Create(ctx context.Context, db database.QueryExecer, question *entity.Question) error
	Update(ctx context.Context, db database.QueryExecer, question *entity.Question) error
	Delete(ctx context.Context, db database.QueryExecer, id string) error
	GetQuestionsByPaging(db database.QueryExecer, offset int, limit int) (total int, questions []entity.Question, err error)
}

// IQuestionCodeService defines the interface for question code domain service
type IQuestionCodeService interface {
	ParseQuestionCodeFromImport(ctx context.Context, db database.QueryExecer, questionCodeStr string) (*questionCodeService.ImportQuestionCodeResult, error)
	GetOrCreateQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeStr string) (*entity.QuestionCode, error)
}

// QuestionMgmt handles question management operations following the payment system pattern
type QuestionMgmt struct {
	DB                  database.QueryExecer
	QuestionService     IQuestionService
	QuestionCodeService IQuestionCodeService
}

// NewQuestionMgmt creates a new question management service
func NewQuestionMgmt(db database.QueryExecer) *QuestionMgmt {
	return &QuestionMgmt{
		DB:                  db,
		QuestionService:     questionService.NewQuestionService(),
		QuestionCodeService: questionCodeService.NewQuestionCodeService(),
	}
}

// ImportQuestionsRequest represents the request for importing questions
type ImportQuestionsRequest struct {
	CsvDataBase64 string `json:"csv_data_base64"`
	UpsertMode    bool   `json:"upsert_mode"`
}

// ImportError represents an error that occurred during import
type ImportError struct {
	RowNumber    int32  `json:"row_number"`
	FieldName    string `json:"field_name,omitempty"`
	ErrorMessage string `json:"error_message"`
	RowData      string `json:"row_data,omitempty"`
}

// ImportQuestionsResponse represents the response from importing questions
type ImportQuestionsResponse struct {
	TotalProcessed int32          `json:"total_processed"`
	CreatedCount   int32          `json:"created_count"`
	UpdatedCount   int32          `json:"updated_count"`
	ErrorCount     int32          `json:"error_count"`
	Errors         []*ImportError `json:"errors"`
	Summary        string         `json:"summary"`
}

// QuestionData represents parsed question data from CSV
type QuestionData struct {
	Content        string   `json:"content"`
	RawContent     string   `json:"raw_content"`
	Type           string   `json:"type"`
	Source         string   `json:"source"`
	Answers        string   `json:"answers"`
	CorrectAnswer  string   `json:"correct_answer"`
	Solution       string   `json:"solution"`
	QuestionCodeID string   `json:"question_code_id"`
	Tags           []string `json:"tags"`
	Subcount       string   `json:"subcount"`
}

// GetQuestionsByPaging retrieves questions with pagination
func (q *QuestionMgmt) GetQuestionsByPaging(offset int, limit int) (total int, questions []entity.Question, err error) {
	return q.QuestionService.GetQuestionsByPaging(q.DB, offset, limit)
}

// GetQuestionByID retrieves a question by ID
func (q *QuestionMgmt) GetQuestionByID(ctx context.Context, id string) (entity.Question, error) {
	return q.QuestionService.GetByID(ctx, q.DB, id)
}

// CreateQuestion creates a new question
func (q *QuestionMgmt) CreateQuestion(ctx context.Context, question *entity.Question) error {
	return q.QuestionService.Create(ctx, q.DB, question)
}

// UpdateQuestion updates an existing question
func (q *QuestionMgmt) UpdateQuestion(ctx context.Context, question *entity.Question) error {
	return q.QuestionService.Update(ctx, q.DB, question)
}

// DeleteQuestion deletes a question by ID
func (q *QuestionMgmt) DeleteQuestion(ctx context.Context, id string) error {
	return q.QuestionService.Delete(ctx, q.DB, id)
}

// GetQuestionsByQuestionCode retrieves questions by question code
func (q *QuestionMgmt) GetQuestionsByQuestionCode(ctx context.Context, questionCodeID string) ([]entity.Question, error) {
	return q.QuestionService.GetByQuestionCode(ctx, q.DB, questionCodeID)
}
