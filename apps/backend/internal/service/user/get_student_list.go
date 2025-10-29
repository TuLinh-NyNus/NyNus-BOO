package user_mgmt

import (
	"exam-bank-system/apps/backend/internal/entity"
)

func (u *UserMgmt) GetStudentByPaging(offset int, limit int) (total int, users []entity.User, err error) {
	return u.UserService.GetStudentByPaging(u.DB, offset, limit)
}

