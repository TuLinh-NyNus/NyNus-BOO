package user

import (
	"context"

	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// Service handles user business logic following payment system pattern
type UserService struct {
	userRepo interface {
		Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
		GetByEmail(email string, db database.QueryExecer) (*entity.User, error)
		GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
		GetByIDForUpdate(ctx context.Context, db database.QueryExecer, id string) (entity.User, error)
		GetAll(db database.QueryExecer) ([]entity.User, error)
		GetByRole(role string, db database.QueryExecer) ([]entity.User, error)
		Update(ctx context.Context, db database.QueryExecer, user *entity.User) error
		GetUsersByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error)
	}
}

// NewService creates a new user service with dependency injection
func NewUserService() *UserService {
	return &UserService{
		userRepo: &repository.UserRepository{},
	}
}

func (s *UserService) GetStudentByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error) {
	return s.userRepo.GetUsersByPaging(db, offset, limit)
}

func (s *UserService) GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error) {
	return s.userRepo.GetByID(ctx, db, id)
}

func (s *UserService) GetAll(db database.QueryExecer) ([]entity.User, error) {
	return s.userRepo.GetAll(db)
}

func (s *UserService) GetUsersByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error) {
	return s.userRepo.GetUsersByPaging(db, offset, limit)
}

