package middleware

import (
	"context"
	"strconv"
	"strings"

	"exam-bank-system/apps/backend/pkg/proto/common"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Resource type constants for access control
const (
	// Content types
	ResourceTypeCourse   = "COURSE"
	ResourceTypeVideo    = "VIDEO"
	ResourceTypePDF      = "PDF"
	ResourceTypeExam     = "EXAM"
	ResourceTypeQuiz     = "QUIZ"
	ResourceTypeExercise = "EXERCISE"
	ResourceTypeLesson   = "LESSON"
	ResourceTypeModule   = "MODULE"

	// Administrative resources
	ResourceTypeAnswer = "ANSWER"
	ResourceTypeGrade  = "GRADE"
	ResourceTypeReport = "REPORT"
	ResourceTypeAdmin  = "ADMIN"
	ResourceTypeSystem = "SYSTEM"

	// Public resources
	ResourceTypePublic  = "PUBLIC"
	ResourceTypePreview = "PREVIEW"
	ResourceTypeFree    = "FREE"
)

// Resource access levels
const (
	AccessLevelPublic  = "PUBLIC"  // Anyone can access
	AccessLevelBasic   = "BASIC"   // View only
	AccessLevelPremium = "PREMIUM" // View + limited download
	AccessLevelFull    = "FULL"    // Full access + download
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
		// Admin Service - chá»‰ ADMIN
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

		// Question Management - TEACHER vÃ  ADMIN
		"/v1.QuestionService/CreateQuestion": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 1, // Teacher pháº£i cÃ³ level >= 1
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
			MinLevel: 3, // Chá»‰ teacher level cao má»›i Ä‘Æ°á»£c xÃ³a
		},

		// View Questions - Táº¥t cáº£ trá»« GUEST
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

		// Exam Management - TEACHER level cao vÃ  ADMIN
		"/v1.ExamService/CreateExam": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 2, // Teacher pháº£i cÃ³ level >= 2 Ä‘á»ƒ táº¡o exam
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
			MinLevel: 5, // Chá»‰ teacher level ráº¥t cao má»›i Ä‘Æ°á»£c xÃ³a exam
		},

		// Exam Taking - STUDENT vÃ  TUTOR
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

		// Results - Phá»¥ thuá»™c vÃ o level
		"/v1.ExamService/GetResults": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_ADMIN,
				common.UserRole_USER_ROLE_TEACHER,
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_STUDENT,
			},
			// Student chá»‰ xem Ä‘Æ°á»£c káº¿t quáº£ cá»§a mÃ¬nh (check trong handler)
		},

		// Tutoring Features - TUTOR vá»›i level phÃ¹ há»£p
		"/v1.TutoringService/CreateStudyGroup": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_TUTOR,
				common.UserRole_USER_ROLE_TEACHER,
			},
			MinLevel: 3, // Tutor pháº£i cÃ³ level >= 3
		},
		"/v1.TutoringService/ScheduleTutoring": {
			AllowedRoles: []common.UserRole{
				common.UserRole_USER_ROLE_TUTOR,
			},
			MinLevel: 2,
		},

		// Profile Service - Táº¥t cáº£ user Ä‘Ã£ Ä‘Äƒng nháº­p
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
				// GUEST khÃ´ng Ä‘Æ°á»£c update profile
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

			// ADMIN vÃ  GUEST khÃ´ng cÃ³ level
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
// Implements the vertical/horizontal access matrix from AUTH_COMPLETE_GUIDE.md
func CheckResourceAccess(ctx context.Context, resourceType string, requiredLevel int) error {
	userRole, err := GetUserRoleFromContext(ctx)
	if err != nil {
		return status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	roleEnum := stringToUserRole(userRole)
	userLevel := getUserLevelFromContext(ctx)

	// ADMIN has full access to all content regardless of level
	if roleEnum == common.UserRole_USER_ROLE_ADMIN {
		return nil
	}

	// Parse resource type to determine content role and level
	contentRole, contentLevel := parseResourceType(resourceType)

	// If requiredLevel is explicitly provided, use it instead of parsed level
	if requiredLevel > 0 {
		contentLevel = requiredLevel
	}

	// Apply vertical access rules (role-based hierarchy)
	if !canAccessVertically(roleEnum, contentRole) {
		return status.Errorf(codes.PermissionDenied,
			"role %s cannot access %s content", userRole, contentRole)
	}

	// Apply horizontal access rules (level-based within role hierarchy)
	if !canAccessHorizontally(userRole, userLevel, contentRole, contentLevel) {
		return status.Errorf(codes.PermissionDenied,
			"insufficient level for %s content: required level %d, user level %d",
			contentRole, contentLevel, userLevel)
	}

	return nil
}

// canAccessHorizontally checks if user has sufficient level to access content
// Level-based access control within the role hierarchy
func canAccessHorizontally(userRole string, userLevel int, contentRole string, contentLevel int) bool {
	// If content has no level requirement, allow access
	if contentLevel <= 0 {
		return true
	}

	// Convert user role string to enum for comparison
	userRoleEnum := stringToUserRole(userRole)

	// Special handling for different roles
	switch userRoleEnum {
	case common.UserRole_USER_ROLE_ADMIN:
		// ADMIN bypasses all level checks
		return true

	case common.UserRole_USER_ROLE_TEACHER:
		// TEACHER accessing lower role content
		if contentRole == "STUDENT" || contentRole == "TUTOR" {
			// Teacher can access any level of lower role content
			return true
		}
		// TEACHER accessing same role content
		if contentRole == "TEACHER" {
			// Must have equal or higher level
			return userLevel >= contentLevel
		}

	case common.UserRole_USER_ROLE_TUTOR:
		// TUTOR accessing STUDENT content
		if contentRole == "STUDENT" {
			// Tutor can access student content up to their level + 1
			// (Can help students slightly above their level)
			return contentLevel <= userLevel+1
		}
		// TUTOR accessing same role content
		if contentRole == "TUTOR" {
			// Must have equal or higher level
			return userLevel >= contentLevel
		}

	case common.UserRole_USER_ROLE_STUDENT:
		// STUDENT can only access content at or below their level
		return userLevel >= contentLevel

	case common.UserRole_USER_ROLE_GUEST:
		// GUEST has no level, can only access level 0 (public) content
		return contentLevel == 0
	}

	// Default: require user level >= content level
	return userLevel >= contentLevel
}

// canAccessVertically checks vertical (role-based) access according to hierarchy
// Hierarchy: ADMIN > TEACHER > TUTOR > STUDENT > GUEST
// Higher roles can access content of lower roles
func canAccessVertically(userRole common.UserRole, contentRole string) bool {
	// Special case: PUBLIC content is accessible by all
	if contentRole == "PUBLIC" || contentRole == "PREVIEW" || contentRole == "FREE" {
		return true
	}

	// Define role hierarchy levels for comparison
	roleHierarchy := map[string]int{
		"ADMIN":   5,
		"TEACHER": 4,
		"TUTOR":   3,
		"STUDENT": 2,
		"GUEST":   1,
	}

	// Get content hierarchy level
	contentHierarchyLevel, hasContent := roleHierarchy[contentRole]
	if !hasContent {
		// Unknown content role, default to denying access
		return false
	}

	// Apply vertical access rules based on user role
	switch userRole {
	case common.UserRole_USER_ROLE_ADMIN:
		// ADMIN: Full access to all content
		return true

	case common.UserRole_USER_ROLE_TEACHER:
		// TEACHER: Can access TEACHER, TUTOR, and STUDENT content
		// Cannot access ADMIN content
		return contentHierarchyLevel <= 4

	case common.UserRole_USER_ROLE_TUTOR:
		// TUTOR: Can access TUTOR and STUDENT content
		// Cannot access TEACHER or ADMIN content
		return contentHierarchyLevel <= 3

	case common.UserRole_USER_ROLE_STUDENT:
		// STUDENT: Can only access STUDENT and GUEST content
		// Cannot access TUTOR, TEACHER, or ADMIN content
		return contentHierarchyLevel <= 2

	case common.UserRole_USER_ROLE_GUEST:
		// GUEST: Can only access GUEST content and public previews
		// Cannot access any authenticated content
		return contentHierarchyLevel <= 1

	default:
		// Unknown user role, deny access by default
		return false
	}
}

// parseResourceType extracts role and level from resource type string
// Formats supported:
// - "COURSE_TEACHER_L5" -> ("TEACHER", 5)
// - "VIDEO_STUDENT_L3" -> ("STUDENT", 3)
// - "EXAM_TUTOR" -> ("TUTOR", 0)
// - "PUBLIC" -> ("PUBLIC", 0)
func parseResourceType(resourceType string) (string, int) {
	// Handle special types
	if resourceType == "PUBLIC" || resourceType == "PREVIEW" || resourceType == "FREE" {
		return "PUBLIC", 0
	}

	if resourceType == "" {
		return "PUBLIC", 0
	}

	// Split by underscore to parse format
	parts := strings.Split(resourceType, "_")

	// Look for role keywords in parts
	var role string
	var level int

	for _, part := range parts {
		// Check if this part is a role
		if isValidRole(part) {
			role = part
		} else if strings.HasPrefix(part, "L") {
			// Check if this part is a level (e.g., "L5")
			if levelNum := strings.TrimPrefix(part, "L"); levelNum != "" {
				if parsedLevel, err := strconv.Atoi(levelNum); err == nil {
					level = parsedLevel
				}
			}
		} else if strings.HasPrefix(part, "LEVEL") {
			// Alternative format: "LEVEL5"
			if levelNum := strings.TrimPrefix(part, "LEVEL"); levelNum != "" {
				if parsedLevel, err := strconv.Atoi(levelNum); err == nil {
					level = parsedLevel
				}
			}
		}
	}

	// If no role found, try to determine from resource type
	if role == "" {
		role = inferRoleFromResourceType(parts)
	}

	return role, level
}

// isValidRole checks if a string is a valid role
func isValidRole(role string) bool {
	validRoles := []string{"ADMIN", "TEACHER", "TUTOR", "STUDENT", "GUEST"}
	for _, valid := range validRoles {
		if role == valid {
			return true
		}
	}
	return false
}

// inferRoleFromResourceType tries to determine role from resource type keywords
func inferRoleFromResourceType(parts []string) string {
	// Map common resource types to default access levels
	resourceDefaults := map[string]string{
		"COURSE":   "STUDENT",
		"VIDEO":    "STUDENT",
		"PDF":      "STUDENT",
		"EXAM":     "STUDENT",
		"QUIZ":     "STUDENT",
		"EXERCISE": "STUDENT",
		"LESSON":   "STUDENT",
		"MODULE":   "STUDENT",
		"ANSWER":   "TEACHER",
		"GRADE":    "TEACHER",
		"ADMIN":    "ADMIN",
		"SYSTEM":   "ADMIN",
	}

	for _, part := range parts {
		if defaultRole, ok := resourceDefaults[part]; ok {
			return defaultRole
		}
	}

	// Default to STUDENT if cannot determine
	return "STUDENT"
}

// CheckResourceOwnership verifies if user owns or has special access to a resource
func CheckResourceOwnership(ctx context.Context, resourceOwnerID string) bool {
	userID, err := GetUserIDFromContext(ctx)
	if err != nil {
		return false
	}

	// Check if user owns the resource
	return userID == resourceOwnerID
}

// HasSpecialPermission checks for special permissions like course enrollment
func HasSpecialPermission(ctx context.Context, permissionType string, resourceID string) bool {
	// This would typically check against database for:
	// - Course enrollments
	// - Special access grants
	// - Temporary permissions
	// For now, return false as placeholder
	return false
}

// GetResourceAccessLevel determines the access level for a resource
func GetResourceAccessLevel(userRole common.UserRole, resourceType string) string {
	// ADMIN gets full access to everything
	if userRole == common.UserRole_USER_ROLE_ADMIN {
		return AccessLevelFull
	}

	// Map resource types to default access levels per role
	switch resourceType {
	case ResourceTypeSystem, ResourceTypeAdmin:
		// Only admins get any access
		if userRole == common.UserRole_USER_ROLE_ADMIN {
			return AccessLevelFull
		}
		return ""

	case ResourceTypeGrade, ResourceTypeAnswer:
		// Teachers get full access, students get basic view
		if userRole == common.UserRole_USER_ROLE_TEACHER {
			return AccessLevelFull
		}
		if userRole == common.UserRole_USER_ROLE_STUDENT {
			return AccessLevelBasic
		}
		return ""

	case ResourceTypeCourse, ResourceTypeVideo, ResourceTypePDF:
		// Progressive access based on role
		switch userRole {
		case common.UserRole_USER_ROLE_TEACHER:
			return AccessLevelFull
		case common.UserRole_USER_ROLE_TUTOR:
			return AccessLevelPremium
		case common.UserRole_USER_ROLE_STUDENT:
			return AccessLevelBasic
		case common.UserRole_USER_ROLE_GUEST:
			return AccessLevelPublic
		}

	case ResourceTypePublic, ResourceTypePreview, ResourceTypeFree:
		// Public resources accessible by all
		return AccessLevelPublic
	}

	return AccessLevelBasic
}

// IsResourceRestricted checks if a resource has special restrictions
func IsResourceRestricted(resourceType string, resourceMetadata map[string]interface{}) bool {
	// Check for premium/paid content
	if isPremium, ok := resourceMetadata["premium"].(bool); ok && isPremium {
		return true
	}

	// Check for time-based restrictions
	if expiresAt, ok := resourceMetadata["expires_at"].(string); ok && expiresAt != "" {
		// Would need to parse and compare with current time
		return true
	}

	// Check for download limits
	if maxDownloads, ok := resourceMetadata["max_downloads"].(int); ok && maxDownloads > 0 {
		if currentDownloads, ok := resourceMetadata["current_downloads"].(int); ok {
			return currentDownloads >= maxDownloads
		}
	}

	return false
}

