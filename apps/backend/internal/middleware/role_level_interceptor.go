package middleware

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// RoleLevelInterceptor handles role and level based authorization
type RoleLevelInterceptor struct {
	rolePermissions map[string]RoleRequirement
}

// RoleRequirement defines role and level requirements for an endpoint
type RoleRequirement struct {
	AllowedRoles []common.UserRole
	MinLevel     int // Minimum level required (0 means no level requirement)
	MaxLevel     int // Maximum level allowed (0 means no limit)
}

// NewRoleLevelInterceptor creates a new role-level interceptor
func NewRoleLevelInterceptor() *RoleLevelInterceptor {
	return &RoleLevelInterceptor{
		rolePermissions: initializeRolePermissions(),
	}
}

// Initialize role permissions for all endpoints
func initializeRolePermissions() map[string]RoleRequirement {
	return map[string]RoleRequirement{
		// Admin Service - chỉ ADMIN
		"/v1.AdminService/ListUsers": {
			AllowedRoles: []common.UserRole{common.UserRole_USER_ROLE_ADMIN},
		},
		"/v1.AdminService/UpdateUserRole": {
			AllowedRoles: []common.UserRole{common.UserRole_USER_ROLE_ADMIN},
		},
		"/v1.AdminService/UpdateUserLevel": {
			AllowedRoles: []common.UserRole{common.UserRole_USER_ROLE_ADMIN},
		},
		"/v1.AdminService/UpdateUserStatus": {
			AllowedRoles: []common.UserRole{common.UserRole_USER_ROLE_ADMIN},
		},
		"/v1.AdminService/GetAuditLogs": {
			AllowedRoles: []common.UserRole{common.UserRole_USER_ROLE_ADMIN},
		},
		"/v1.AdminService/GetResourceAccess": {
			AllowedRoles: []common.UserRole{common.UserRole_USER_ROLE_ADMIN},
		},

		// Question Management - TEACHER và ADMIN
		"/v1.QuestionService/CreateQuestion": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 1, // Teacher phải có level >= 1
		},
		"/v1.QuestionService/UpdateQuestion": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 1,
		},
		"/v1.QuestionService/DeleteQuestion": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 3, // Chỉ teacher level cao mới được xóa
		},

		// View Questions - Tất cả trừ GUEST
		"/v1.QuestionService/GetQuestion": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_STUDENT,
			},
		},
		"/v1.QuestionService/ListQuestions": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_STUDENT,
			},
		},

		// Exam Management - TEACHER level cao và ADMIN
		"/v1.ExamService/CreateExam": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 2, // Teacher phải có level >= 2 để tạo exam
		},
		"/v1.ExamService/UpdateExam": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 2,
		},
		"/v1.ExamService/DeleteExam": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 5, // Chỉ teacher level rất cao mới được xóa exam
		},

		// Exam Taking - STUDENT và TUTOR
		"/v1.ExamService/StartExam": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_STUDENT,
				common.UserRole_USER_ROLE_TUTOR,
			},
		},
		"/v1.ExamService/SubmitExam": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_STUDENT,
				common.UserRole_USER_ROLE_TUTOR,
			},
		},

		// Results - Phụ thuộc vào level
		"/v1.ExamService/GetResults": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_STUDENT,
			},
			// Student chỉ xem được kết quả của mình (check trong handler)
		},

		// Tutoring Features - TUTOR với level phù hợp
		"/v1.TutoringService/CreateStudyGroup": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 3, // Tutor phải có level >= 3
		},
		"/v1.TutoringService/ScheduleTutoring": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_TUTOR,
			},
			MinLevel: 2,
		},

		// Profile Service - Tất cả user đã đăng nhập
		"/v1.ProfileService/GetProfile": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_STUDENT,
				common.UserRole_USER_ROLE_GUEST,
			},
		},
		"/v1.ProfileService/UpdateProfile": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_STUDENT,
				// GUEST không được update profile
			},
		},
	}
}

// Unary returns a unary server interceptor for role-level authorization
func (r *RoleLevelInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Skip for public endpoints
		if isPublicEndpoint(info.FullMethod) {
			return handler(ctx, req)
		}

		// Get role requirement for this endpoint
		requirement, hasRequirement := r.rolePermissions[info.FullMethod]
		if !hasRequirement {
			// No specific requirement, allow all authenticated users
			return handler(ctx, req)
		}

		// Get user role from context
		userRole, err := GetUserRoleFromContext(ctx)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "user role not found")
		}

		// Convert string role to enum
		roleEnum := stringToUserRole(userRole)
		
		// Check if user's role is allowed
		roleAllowed := false
		for _, allowedRole := range requirement.AllowedRoles {
			if roleEnum == allowedRole {
				roleAllowed = true
				break
			}
		}

		if !roleAllowed {
			return nil, status.Errorf(codes.PermissionDenied,
				"role %s is not allowed to access %s", userRole, info.FullMethod)
		}

		// Check level requirements if applicable
		if requirement.MinLevel > 0 || requirement.MaxLevel > 0 {
			// Get user level from context (need to add this to auth interceptor)
			userLevel := getUserLevelFromContext(ctx)
			
			// ADMIN và GUEST không có level
			if roleEnum == common.UserRole_USER_ROLE_ADMIN || 
			   roleEnum == common.UserRole_USER_ROLE_GUEST {
				// These roles don't have levels, skip level check
				return handler(ctx, req)
			}

			// Check minimum level
			if requirement.MinLevel > 0 && userLevel < requirement.MinLevel {
				return nil, status.Errorf(codes.PermissionDenied,
					"insufficient level: required %d, got %d", requirement.MinLevel, userLevel)
			}

			// Check maximum level
			if requirement.MaxLevel > 0 && userLevel > requirement.MaxLevel {
				return nil, status.Errorf(codes.PermissionDenied,
					"level too high: maximum %d, got %d", requirement.MaxLevel, userLevel)
			}
		}

		return handler(ctx, req)
	}
}

// Helper function to convert string role to enum
func stringToUserRole(role string) common.UserRole {
	switch role {
	case "ADMIN":
		return common.UserRole_USER_ROLE_ADMIN
	case "TEACHER":
		return common.UserRole_USER_ROLE_TEACHER
	case "TUTOR":
		return common.UserRole_USER_ROLE_TUTOR
	case "STUDENT":
		return common.UserRole_USER_ROLE_STUDENT
	case "GUEST":
		return common.UserRole_USER_ROLE_GUEST
	default:
		return common.UserRole_USER_ROLE_UNSPECIFIED
	}
}

// Get user level from context using auth interceptor function
func getUserLevelFromContext(ctx context.Context) int {
	level, err := GetUserLevelFromContext(ctx)
	if err != nil {
		return 0
	}
	return level
}

// CheckResourceAccess checks if a user can access a specific resource based on role and level
func CheckResourceAccess(ctx context.Context, resourceType string, requiredLevel int) error {
	userRole, err := GetUserRoleFromContext(ctx)
	if err != nil {
		return status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	roleEnum := stringToUserRole(userRole)
	
	// ADMIN has full access
	if roleEnum == common.UserRole_USER_ROLE_ADMIN {
		return nil
	}

	// GUEST has very limited access
	if roleEnum == common.UserRole_USER_ROLE_GUEST {
		// Only allow viewing public resources
		if resourceType != "PUBLIC" && resourceType != "PREVIEW" {
			return status.Errorf(codes.PermissionDenied, "guest users cannot access %s resources", resourceType)
		}
		return nil
	}

	// Check level requirements for other roles
	userLevel := getUserLevelFromContext(ctx)
	if userLevel < requiredLevel {
		return status.Errorf(codes.PermissionDenied,
			fmt.Sprintf("insufficient level to access resource: required %d, got %d", requiredLevel, userLevel))
	}

	return nil
}