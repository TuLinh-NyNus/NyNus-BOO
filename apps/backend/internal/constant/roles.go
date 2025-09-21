package constant

// User roles in the exam bank system - 5 roles hierarchy theo AUTH_COMPLETE_GUIDE.md
// Format: UPPERCASE để match với database schema và protobuf enums
const (
	// 5-tier role system with hierarchy: GUEST < STUDENT < TUTOR < TEACHER < ADMIN
	RoleGuest   = "GUEST"   // Khách (không đăng ký) - Không có level
	RoleStudent = "STUDENT" // Học sinh - Level 1-9
	RoleTutor   = "TUTOR"   // Gia sư - Level 1-9
	RoleTeacher = "TEACHER" // Giáo viên - Level 1-9
	RoleAdmin   = "ADMIN"   // Quản trị viên - Không có level
)

// ValidRoles contains all valid user roles
var ValidRoles = []string{
	RoleGuest,
	RoleStudent,
	RoleTutor,
	RoleTeacher,
	RoleAdmin,
}

// Role validation functions
func IsValidRole(role string) bool {
	for _, validRole := range ValidRoles {
		if role == validRole {
			return true
		}
	}
	return false
}

// RequiresLevel checks if role requires level (1-9)
func RequiresLevel(role string) bool {
	return role == RoleStudent || role == RoleTutor || role == RoleTeacher
}

// GetRoleHierarchy returns the numeric hierarchy value (higher = more permissions)
func GetRoleHierarchy(role string) int {
	switch role {
	case RoleGuest:
		return 1
	case RoleStudent:
		return 2
	case RoleTutor:
		return 3
	case RoleTeacher:
		return 4
	case RoleAdmin:
		return 5
	default:
		return 0 // Invalid role
	}
}
