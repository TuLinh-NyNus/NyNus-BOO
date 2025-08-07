package user_mgmt

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	userService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/user"
)

type IUserService interface {
	GetStudentByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error)
	GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
	GetAll(db database.QueryExecer) ([]entity.User, error)
	GetUsersByPaging(db database.QueryExecer, offset int, limit int) (total int, users []entity.User, err error)
}

type UserMgmt struct {
	DB          database.QueryExecer
	UserService IUserService
}

func NewUserMgmt(db database.QueryExecer) *UserMgmt {
	return &UserMgmt{
		DB:          db,
		UserService: userService.NewUserService(),
	}
}
