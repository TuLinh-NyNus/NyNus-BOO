package auth_mgmt

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

func (a *AuthMgmt) Login(email, password string) (*entity.User, string, error) {
	return a.AuthService.Login(a.DB, email, password)
}
