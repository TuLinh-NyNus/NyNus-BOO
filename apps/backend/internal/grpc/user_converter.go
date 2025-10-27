package grpc

import (
	"strings"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
)

// ConvertUserToProto converts repository.User to protobuf v1.User
// HÃ m nÃ y chuyá»ƒn Ä‘á»•i User entity tá»« database sang protobuf format Ä‘á»ƒ tráº£ vá» cho client
//
// Parameters:
//   - user: User entity tá»« repository
//
// Returns:
//   - *v1.User: Protobuf user object vá»›i Ä‘áº§y Ä‘á»§ thÃ´ng tin
func ConvertUserToProto(user *repository.User) *v1.User {
	if user == nil {
		return nil
	}

	return &v1.User{
		Id:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Role:          user.Role,
		IsActive:      user.IsActive,
		Level:         int32(user.Level),
		Username:      user.Username,
		Avatar:        user.Avatar,
		Status:        ConvertStatusToProto(user.Status),
		EmailVerified: user.EmailVerified,
		GoogleId:      user.GoogleID,
	}
}

// ConvertStatusToProto converts string status to protobuf UserStatus enum
// Chuyá»ƒn Ä‘á»•i status tá»« string sang protobuf enum
//
// Parameters:
//   - status: User status string (ACTIVE, INACTIVE, SUSPENDED)
//
// Returns:
//   - common.UserStatus: Protobuf status enum
func ConvertStatusToProto(status string) common.UserStatus {
	switch status {
	case StatusActive:
		return common.UserStatus_USER_STATUS_ACTIVE
	case StatusInactive:
		return common.UserStatus_USER_STATUS_INACTIVE
	case StatusSuspended:
		return common.UserStatus_USER_STATUS_SUSPENDED
	default:
		return common.UserStatus_USER_STATUS_UNSPECIFIED
	}
}

// ConvertRoleToProto converts string role to protobuf UserRole enum
// Chuyá»ƒn Ä‘á»•i role tá»« string sang protobuf enum vá»›i 5 roles
//
// Parameters:
//   - role: User role string (ADMIN, TEACHER, TUTOR, STUDENT, GUEST)
//
// Returns:
//   - common.UserRole: Protobuf role enum
func ConvertRoleToProto(role string) common.UserRole {
	switch strings.ToUpper(role) {
	case RoleAdmin:
		return common.UserRole_USER_ROLE_ADMIN
	case RoleTeacher:
		return common.UserRole_USER_ROLE_TEACHER
	case RoleTutor:
		return common.UserRole_USER_ROLE_TUTOR
	case RoleStudent:
		return common.UserRole_USER_ROLE_STUDENT
	case RoleGuest:
		return common.UserRole_USER_ROLE_GUEST
	default:
		return common.UserRole_USER_ROLE_UNSPECIFIED
	}
}

// ConvertProtoToStatus converts protobuf UserStatus enum to string
// Chuyá»ƒn Ä‘á»•i status tá»« protobuf enum sang string
//
// Parameters:
//   - status: Protobuf status enum
//
// Returns:
//   - string: Status string (ACTIVE, INACTIVE, SUSPENDED)
func ConvertProtoToStatus(status common.UserStatus) string {
	switch status {
	case common.UserStatus_USER_STATUS_ACTIVE:
		return StatusActive
	case common.UserStatus_USER_STATUS_INACTIVE:
		return StatusInactive
	case common.UserStatus_USER_STATUS_SUSPENDED:
		return StatusSuspended
	default:
		return StatusInactive // Default to inactive for safety
	}
}

// ConvertProtoToRole converts protobuf UserRole enum to string
// Chuyá»ƒn Ä‘á»•i role tá»« protobuf enum sang string
//
// Parameters:
//   - role: Protobuf role enum
//
// Returns:
//   - string: Role string (ADMIN, TEACHER, TUTOR, STUDENT, GUEST)
func ConvertProtoToRole(role common.UserRole) string {
	switch role {
	case common.UserRole_USER_ROLE_ADMIN:
		return RoleAdmin
	case common.UserRole_USER_ROLE_TEACHER:
		return RoleTeacher
	case common.UserRole_USER_ROLE_TUTOR:
		return RoleTutor
	case common.UserRole_USER_ROLE_STUDENT:
		return RoleStudent
	case common.UserRole_USER_ROLE_GUEST:
		return RoleGuest
	default:
		return RoleGuest // Default to guest for safety
	}
}

