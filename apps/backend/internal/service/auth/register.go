package auth

import (
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

func (a *AuthMgmt) Register(email, password, firstName, lastName string) (*entity.User, error) {
	return a.AuthService.Register(a.DB, email, password, firstName, lastName)
}
