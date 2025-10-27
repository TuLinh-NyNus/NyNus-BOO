package user_mgmt

import (
	"context"

	"exam-bank-system/apps/backend/internal/entity"
)

func (u *UserMgmt) GetUser(ctx context.Context, userID string) (user entity.User, err error) {
	return u.UserService.GetByID(ctx, u.DB, userID)
}

