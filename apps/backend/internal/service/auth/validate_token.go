package auth

func (a *AuthMgmt) ValidateToken(tokenString string) (*Claims, error) {
	return a.AuthService.ValidateToken(tokenString)
}
