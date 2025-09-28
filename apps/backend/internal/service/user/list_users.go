package user_mgmt

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

func (u *UserMgmt) ListUsers(offset int, limit int) (total int, users []entity.User, err error) {
	return u.UserService.GetUsersByPaging(u.DB, offset, limit)
}
