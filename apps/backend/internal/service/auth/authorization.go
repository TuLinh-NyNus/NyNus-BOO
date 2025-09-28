package auth

func (a *AuthMgmt) IsAdmin(userID string) (bool, error) {
	return a.AuthService.IsAdmin(a.DB, userID)
}

func (a *AuthMgmt) IsTeacherOrAdmin(userID string) (bool, error) {
	return a.AuthService.IsTeacherOrAdmin(a.DB, userID)
}

func (a *AuthMgmt) IsStudent(userID string) (bool, error) {
	return a.AuthService.IsStudent(a.DB, userID)
}

func (a *AuthMgmt) GetUserRole(userID string) (string, error) {
	return a.AuthService.GetUserRole(a.DB, userID)
}
