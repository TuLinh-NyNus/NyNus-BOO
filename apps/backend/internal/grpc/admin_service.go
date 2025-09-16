package grpc

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AdminServiceServer implements the AdminService
type AdminServiceServer struct {
	v1.UnimplementedAdminServiceServer
	userRepo         repository.IUserRepository
	auditLogRepo     repository.AuditLogRepository
	resourceRepo     repository.ResourceAccessRepository
	enrollmentRepo   repository.EnrollmentRepository
	notificationSvc  *notification.NotificationService
}

// NewAdminServiceServer creates a new admin service
func NewAdminServiceServer(
	userRepo repository.IUserRepository,
	auditLogRepo repository.AuditLogRepository,
	resourceRepo repository.ResourceAccessRepository,
	enrollmentRepo repository.EnrollmentRepository,
	notificationSvc *notification.NotificationService,
) *AdminServiceServer {
	return &AdminServiceServer{
		userRepo:        userRepo,
		auditLogRepo:    auditLogRepo,
		resourceRepo:    resourceRepo,
		enrollmentRepo:  enrollmentRepo,
		notificationSvc: notificationSvc,
	}
}

// ListUsers lists all users with filters
func (s *AdminServiceServer) ListUsers(ctx context.Context, req *v1.AdminListUsersRequest) (*v1.AdminListUsersResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// TODO: Implement user listing with filters
	// This requires adding a ListUsers method to user repository
	
	// Placeholder response
	return &v1.AdminListUsersResponse{
		Response: &common.Response{
			Success: true,
			Message: "User list retrieved successfully",
		},
		Users: []*v1.User{},
		Pagination: &common.PaginationResponse{
			Page:        req.Pagination.GetPage(),
			TotalPages:  0,
		},
	}, nil
}

// UpdateUserRole updates a user's role
func (s *AdminServiceServer) UpdateUserRole(ctx context.Context, req *v1.UpdateUserRoleRequest) (*v1.UpdateUserRoleResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Get admin user ID for audit
	adminID, _ := middleware.GetUserIDFromContext(ctx)

	// Get target user
	user, err := s.userRepo.GetByID(ctx, req.UserId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Store old role for audit
	oldRole := user.Role

	// Validate role-level combination
	if err := s.validateRoleLevel(req.NewRole, req.Level); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, err.Error())
	}

	// Update user role and level
	user.Role = req.NewRole
	if req.Level > 0 {
		user.Level = int(req.Level)
	} else {
		user.Level = 0 // GUEST and ADMIN don't have levels
	}

	// Save changes
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update user role: %v", err)
	}

	// Create audit log
	if s.auditLogRepo != nil {
		s.createAuditLog(ctx, adminID, "UPDATE_ROLE", "USER", user.ID,
			map[string]interface{}{"old_role": oldRole, "old_level": user.Level},
			map[string]interface{}{"new_role": req.NewRole, "new_level": req.Level},
			true, "")
	}

	// Send notification to user
	if s.notificationSvc != nil {
		title := "Vai trò tài khoản đã thay đổi"
		message := fmt.Sprintf("Vai trò của bạn đã được cập nhật từ %s thành %s", oldRole, req.NewRole)
		s.notificationSvc.CreateSecurityAlert(ctx, user.ID, title, message, "", "")
	}

	return &v1.UpdateUserRoleResponse{
		Response: &common.Response{
			Success: true,
			Message: "User role updated successfully",
		},
		UpdatedUser: &v1.User{
			Id:    user.ID,
			Email: user.Email,
			Role:  user.Role,
			Level: int32(user.Level),
		},
	}, nil
}

// UpdateUserLevel updates a user's level within their role
func (s *AdminServiceServer) UpdateUserLevel(ctx context.Context, req *v1.UpdateUserLevelRequest) (*v1.UpdateUserLevelResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Get admin user ID for audit
	adminID, _ := middleware.GetUserIDFromContext(ctx)

	// Get target user
	user, err := s.userRepo.GetByID(ctx, req.UserId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Validate level for current role
	if err := s.validateRoleLevel(user.Role, req.NewLevel); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, err.Error())
	}

	oldLevel := user.Level
	user.Level = int(req.NewLevel)

	// Save changes
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update user level: %v", err)
	}

	// Create audit log
	if s.auditLogRepo != nil {
		s.createAuditLog(ctx, adminID, "UPDATE_LEVEL", "USER", user.ID,
			map[string]interface{}{"old_level": oldLevel},
			map[string]interface{}{"new_level": req.NewLevel},
			true, "")
	}

	// Send notification
	if s.notificationSvc != nil && oldLevel != int(req.NewLevel) {
		title := "Cấp độ tài khoản đã thay đổi"
		message := fmt.Sprintf("Cấp độ của bạn đã được cập nhật từ %d thành %d", oldLevel, req.NewLevel)
		s.notificationSvc.CreateNotification(ctx, user.ID, notification.TypeAccountActivity, 
			title, message, nil, nil)
	}

	return &v1.UpdateUserLevelResponse{
		Response: &common.Response{
			Success: true,
			Message: "User level updated successfully",
		},
		UpdatedUser: &v1.User{
			Id:    user.ID,
			Email: user.Email,
			Role:  user.Role,
			Level: int32(user.Level),
		},
	}, nil
}

// UpdateUserStatus updates a user's status
func (s *AdminServiceServer) UpdateUserStatus(ctx context.Context, req *v1.UpdateUserStatusRequest) (*v1.UpdateUserStatusResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Get admin user ID for audit
	adminID, _ := middleware.GetUserIDFromContext(ctx)

	// Get target user
	user, err := s.userRepo.GetByID(ctx, req.UserId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	oldStatus := user.Status
	
	// Convert proto status to string
	statusStr := s.protoStatusToString(req.NewStatus)
	user.Status = statusStr

	// If suspending, add reason
	var suspendReason string
	if req.NewStatus == common.UserStatus_USER_STATUS_SUSPENDED && req.Reason != "" {
		suspendReason = req.Reason
	}

	// Save changes
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update user status: %v", err)
	}

	// Create audit log
	if s.auditLogRepo != nil {
		metadata := map[string]interface{}{
			"old_status": oldStatus,
			"new_status": statusStr,
		}
		if suspendReason != "" {
			metadata["reason"] = suspendReason
		}
		
		s.createAuditLog(ctx, adminID, "UPDATE_STATUS", "USER", user.ID,
			map[string]interface{}{"status": oldStatus},
			map[string]interface{}{"status": statusStr},
			true, "")
	}

	// Send notification
	if s.notificationSvc != nil {
		var title, message string
		switch req.NewStatus {
		case common.UserStatus_USER_STATUS_SUSPENDED:
			title = "Tài khoản đã bị tạm ngưng"
			message = fmt.Sprintf("Tài khoản của bạn đã bị tạm ngưng. Lý do: %s", suspendReason)
		case common.UserStatus_USER_STATUS_INACTIVE:
			title = "Tài khoản đã bị vô hiệu hóa"
			message = "Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên"
		case common.UserStatus_USER_STATUS_ACTIVE:
			title = "Tài khoản đã được kích hoạt"
			message = "Tài khoản của bạn đã được kích hoạt trở lại"
		}
		
		if title != "" {
			s.notificationSvc.CreateSecurityAlert(ctx, user.ID, title, message, "", "")
		}
	}

	return &v1.UpdateUserStatusResponse{
		Response: &common.Response{
			Success: true,
			Message: "User status updated successfully",
		},
		UpdatedUser: &v1.User{
			Id:     user.ID,
			Email:  user.Email,
			Status: convertStatusToProto(user.Status),
		},
	}, nil
}

// GetAuditLogs retrieves audit logs
func (s *AdminServiceServer) GetAuditLogs(ctx context.Context, req *v1.GetAuditLogsRequest) (*v1.GetAuditLogsResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	if s.auditLogRepo == nil {
		return nil, status.Errorf(codes.Unimplemented, "audit logging not configured")
	}

	// Parse pagination
	limit := 50
	offset := 0
	if req.Pagination != nil {
		if req.Pagination.Limit > 0 {
			limit = int(req.Pagination.Limit)
		}
		if req.Pagination.Page > 0 {
			offset = (int(req.Pagination.Page) - 1) * limit
		}
	}

	var logs []*repository.AuditLog
	var err error

	// Apply filters - use resource_id from proto (lowercase)
	if req.UserId != "" {
		logs, err = s.auditLogRepo.GetByUserID(ctx, req.UserId, limit, offset)
	} else if req.Resource != "" {
		// No resource_id field in GetAuditLogsRequest, just use resource
		logs, err = s.auditLogRepo.GetByResource(ctx, req.Resource, "", limit, offset)
	} else if req.StartDate != "" && req.EndDate != "" {
		startDate, _ := time.Parse(time.RFC3339, req.StartDate)
		endDate, _ := time.Parse(time.RFC3339, req.EndDate)
		logs, err = s.auditLogRepo.GetByDateRange(ctx, startDate, endDate, limit, offset)
	} else if req.Action == "SECURITY" {
		logs, err = s.auditLogRepo.GetSecurityEvents(ctx, limit, offset)
	} else {
		// Get recent logs
		endDate := time.Now()
		startDate := endDate.Add(-24 * time.Hour)
		logs, err = s.auditLogRepo.GetByDateRange(ctx, startDate, endDate, limit, offset)
	}

	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get audit logs: %v", err)
	}

	// Convert to proto
	var protoLogs []*v1.AuditLog
	for _, log := range logs {
		protoLog := &v1.AuditLog{
			Id:           log.ID,
			Action:       log.Action,
			Resource:     log.Resource,
			ResourceId:   log.ResourceID,
			IpAddress:    log.IPAddress,
			UserAgent:    log.UserAgent,
			Success:      log.Success,
			ErrorMessage: log.ErrorMessage,
			CreatedAt:    log.CreatedAt.Format(time.RFC3339),
		}
		
		if log.UserID != nil {
			protoLog.UserId = *log.UserID
		}
		
		protoLogs = append(protoLogs, protoLog)
	}

	return &v1.GetAuditLogsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Audit logs retrieved successfully",
		},
		Logs:       protoLogs,
		Pagination: &common.PaginationResponse{},
	}, nil
}

// GetResourceAccess monitors resource access
func (s *AdminServiceServer) GetResourceAccess(ctx context.Context, req *v1.GetResourceAccessRequest) (*v1.GetResourceAccessResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	if s.resourceRepo == nil {
		return nil, status.Errorf(codes.Unimplemented, "resource access tracking not configured")
	}

	// Parse pagination
	limit := 50
	offset := 0
	if req.Pagination != nil {
		if req.Pagination.Limit > 0 {
			limit = int(req.Pagination.Limit)
		}
		if req.Pagination.Page > 0 {
			offset = (int(req.Pagination.Page) - 1) * limit
		}
	}

	var accesses []*repository.ResourceAccess
	var err error

	// Apply filters
	if req.UserId != "" {
		accesses, err = s.resourceRepo.GetByUserID(ctx, req.UserId, limit, offset)
	} else if req.ResourceId != "" {
		accesses, err = s.resourceRepo.GetByResourceID(ctx, req.ResourceId, limit, offset)
	} else if req.MinRiskScore > 0 {
		// Get suspicious access based on min risk score
		accesses, err = s.resourceRepo.GetSuspiciousAccess(ctx, int(req.MinRiskScore), limit, offset)
	} else {
		// Get recent access
		accesses, err = s.resourceRepo.GetRecentAccess(ctx, limit, offset)
	}

	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get resource access: %v", err)
	}

	// Convert to proto
	var protoAccesses []*v1.ResourceAccess
	for _, access := range accesses {
		protoAccess := &v1.ResourceAccess{
			Id:            access.ID,
			UserId:        access.UserID,
			ResourceType:  access.ResourceType,
			ResourceId:    access.ResourceID,
			Action:        access.Action,
			IpAddress:     access.IPAddress,
			IsValidAccess: access.IsValidAccess,
			RiskScore:     int32(access.RiskScore),
			CreatedAt:     access.CreatedAt.Format(time.RFC3339),
		}
		protoAccesses = append(protoAccesses, protoAccess)
	}

	return &v1.GetResourceAccessResponse{
		Response: &common.Response{
			Success: true,
			Message: "Resource access logs retrieved successfully",
		},
		Accesses:   protoAccesses,
		Pagination: &common.PaginationResponse{},
	}, nil
}

// Helper methods

func (s *AdminServiceServer) checkAdminPermission(ctx context.Context) error {
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to get user")
	}

	if string(user.Role) != "ADMIN" && user.Role != common.UserRole_USER_ROLE_ADMIN {
		return status.Errorf(codes.PermissionDenied, "admin permission required")
	}

	return nil
}

func (s *AdminServiceServer) validateRoleLevel(role common.UserRole, level int32) error {
	switch role {
	case common.UserRole_USER_ROLE_GUEST, common.UserRole_USER_ROLE_ADMIN:
		if level != 0 {
			return fmt.Errorf("%s role should not have a level", role)
		}
	case common.UserRole_USER_ROLE_STUDENT, common.UserRole_USER_ROLE_TUTOR, common.UserRole_USER_ROLE_TEACHER:
		if level < 1 || level > 9 {
			return fmt.Errorf("%s role requires level between 1-9", role)
		}
	default:
		return fmt.Errorf("invalid role: %s", role)
	}
	return nil
}

func (s *AdminServiceServer) protoStatusToString(status common.UserStatus) string {
	switch status {
	case common.UserStatus_USER_STATUS_ACTIVE:
		return "ACTIVE"
	case common.UserStatus_USER_STATUS_INACTIVE:
		return "INACTIVE"
	case common.UserStatus_USER_STATUS_SUSPENDED:
		return "SUSPENDED"
	default:
		return "ACTIVE"
	}
}

func (s *AdminServiceServer) createAuditLog(
	ctx context.Context,
	userID string,
	action string,
	resource string,
	resourceID string,
	oldValues interface{},
	newValues interface{},
	success bool,
	errorMsg string,
) {
	// TODO: Implement audit log creation
	// This would marshal old/new values to JSON and create audit log entry
}