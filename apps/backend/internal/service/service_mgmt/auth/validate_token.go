package auth_mgmt

import (
	authService "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
)

func (a *AuthMgmt) ValidateToken(tokenString string) (*authService.Claims, error) {
	return a.AuthService.ValidateToken(tokenString)
}
