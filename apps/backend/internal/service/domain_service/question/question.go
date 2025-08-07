package question

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
)

// QuestionService handles question business logic following the new clean pattern
type QuestionService struct {
	questionRepo interface {
		Create(ctx context.Context, db database.QueryExecer, question *entity.Question) error
		GetByID(ctx context.Context, db database.QueryExecer, id string) (entity.Question, error)
		GetByQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeID string) ([]entity.Question, error)
		Update(ctx context.Context, db database.QueryExecer, question *entity.Question) error
		Delete(ctx context.Context, db database.QueryExecer, id string) error
		GetByIDForUpdate(ctx context.Context, db database.QueryExecer, id string) (entity.Question, error)
		GetQuestionsByPaging(db database.QueryExecer, offset int, limit int) (total int, questions []entity.Question, err error)
	}
}

// NewQuestionService creates a new question service with dependency injection
func NewQuestionService() *QuestionService {
	return &QuestionService{
		questionRepo: &repository.QuestionRepository{},
	}
}

func (s *QuestionService) GetByID(ctx context.Context, db database.QueryExecer, id string) (entity.Question, error) {
	return s.questionRepo.GetByID(ctx, db, id)
}

func (s *QuestionService) GetByQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeID string) ([]entity.Question, error) {
	return s.questionRepo.GetByQuestionCode(ctx, db, questionCodeID)
}

func (s *QuestionService) Create(ctx context.Context, db database.QueryExecer, question *entity.Question) error {
	return s.questionRepo.Create(ctx, db, question)
}

func (s *QuestionService) Update(ctx context.Context, db database.QueryExecer, question *entity.Question) error {
	return s.questionRepo.Update(ctx, db, question)
}

func (s *QuestionService) Delete(ctx context.Context, db database.QueryExecer, id string) error {
	return s.questionRepo.Delete(ctx, db, id)
}

func (s *QuestionService) GetQuestionsByPaging(db database.QueryExecer, offset int, limit int) (total int, questions []entity.Question, err error) {
	return s.questionRepo.GetQuestionsByPaging(db, offset, limit)
}
