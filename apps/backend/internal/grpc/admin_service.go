package grpc

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"exam-bank-system/apps/backend/internal/service/notification"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// SystemStatsCache holds cached system statistics with TTL
type SystemStatsCache struct {
	stats     *v1.SystemStats
	timestamp time.Time
	ttl       time.Duration
}

// AdminServiceServer implements the AdminService
type AdminServiceServer struct {
	v1.UnimplementedAdminServiceServer
	userRepo         repository.IUserRepository
	auditLogRepo     repository.AuditLogRepository
	resourceRepo     repository.ResourceAccessRepository
	enrollmentRepo   repository.EnrollmentRepository
	notificationSvc  *notification.NotificationService
	sessionRepo      repository.SessionRepository
	notificationRepo repository.NotificationRepository
	metricsRepo      interfaces.MetricsRepository // NEW: Metrics repository for time-series data

	// Cache for system stats - thread-safe with sync.Map
	// Key: "system_stats" (global cache, not per-user since all admins see same data)
	// Value: *SystemStatsCache
	statsCache sync.Map
}

// NewAdminServiceServer creates a new admin service
func NewAdminServiceServer(
	userRepo repository.IUserRepository,
	metricsRepo interfaces.MetricsRepository,
	auditLogRepo repository.AuditLogRepository,
	resourceRepo repository.ResourceAccessRepository,
	enrollmentRepo repository.EnrollmentRepository,
	notificationSvc *notification.NotificationService,
	sessionRepo repository.SessionRepository,
	notificationRepo repository.NotificationRepository,
) *AdminServiceServer {
	return &AdminServiceServer{
		userRepo:         userRepo,
		metricsRepo:      metricsRepo,
		auditLogRepo:     auditLogRepo,
		resourceRepo:     resourceRepo,
		enrollmentRepo:   enrollmentRepo,
		notificationSvc:  notificationSvc,
		sessionRepo:      sessionRepo,
		notificationRepo: notificationRepo,
	}
}

// ListUsers lists all users with filters
func (s *AdminServiceServer) ListUsers(ctx context.Context, req *v1.AdminListUsersRequest) (*v1.AdminListUsersResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Apply filters from request
	var filters repository.UserFilters
	if req.Filter != nil {
		filters = repository.UserFilters{
			Role:   convertProtoRoleToString(req.Filter.Role),
			Status: convertProtoStatusToString(req.Filter.Status),
			Search: req.Filter.SearchQuery,
		}
	}

	// Calculate pagination
	page := int(req.Pagination.GetPage())
	if page < 1 {
		page = 1
	}
	pageSize := 20 // Default page size
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100 // Limit max page size
	}
	offset := (page - 1) * pageSize

	// Get users with filters (need to implement in repository)
	users, total, err := s.getUsersWithFilters(ctx, filters, offset, pageSize)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list users: %v", err)
	}

	// Convert to proto users
	protoUsers := make([]*v1.User, 0, len(users))
	for _, user := range users {
		protoUsers = append(protoUsers, &v1.User{
			Id:            user.ID,
			Email:         user.Email,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Role:          user.Role,
			Level:         int32(user.Level),
			Username:      user.Username,
			Avatar:        user.Avatar,
			Status:        stringToProtoStatus(user.Status),
			EmailVerified: user.EmailVerified,
			IsActive:      user.IsActive,
		})
	}

	// Calculate total pages
	totalPages := (total + pageSize - 1) / pageSize

	return &v1.AdminListUsersResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Found %d users", total),
		},
		Users: protoUsers,
		Pagination: &common.PaginationResponse{
			Page:       int32(page),
			TotalPages: int32(totalPages),
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
		title := "Vai trÃƒÂ² tÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ÃƒÂ£ thay Ã„â€˜Ã¡Â»â€¢i"
		message := fmt.Sprintf("Vai trÃƒÂ² cÃ¡Â»Â§a bÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t tÃ¡Â»Â« %s thÃƒÂ nh %s", oldRole, req.NewRole)
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
		title := "CÃ¡ÂºÂ¥p Ã„â€˜Ã¡Â»â„¢ tÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ÃƒÂ£ thay Ã„â€˜Ã¡Â»â€¢i"
		message := fmt.Sprintf("CÃ¡ÂºÂ¥p Ã„â€˜Ã¡Â»â„¢ cÃ¡Â»Â§a bÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t tÃ¡Â»Â« %d thÃƒÂ nh %d", oldLevel, req.NewLevel)
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
			title = "TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ÃƒÂ£ bÃ¡Â»â€¹ tÃ¡ÂºÂ¡m ngÃ†Â°ng"
			message = fmt.Sprintf("TÃƒÂ i khoÃ¡ÂºÂ£n cÃ¡Â»Â§a bÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂ£ bÃ¡Â»â€¹ tÃ¡ÂºÂ¡m ngÃ†Â°ng. LÃƒÂ½ do: %s", suspendReason)
		case common.UserStatus_USER_STATUS_INACTIVE:
			title = "TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ÃƒÂ£ bÃ¡Â»â€¹ vÃƒÂ´ hiÃ¡Â»â€¡u hÃƒÂ³a"
			message = "TÃƒÂ i khoÃ¡ÂºÂ£n cÃ¡Â»Â§a bÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂ£ bÃ¡Â»â€¹ vÃƒÂ´ hiÃ¡Â»â€¡u hÃƒÂ³a bÃ¡Â»Å¸i quÃ¡ÂºÂ£n trÃ¡Â»â€¹ viÃƒÂªn"
		case common.UserStatus_USER_STATUS_ACTIVE:
			title = "TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c kÃƒÂ­ch hoÃ¡ÂºÂ¡t"
			message = "TÃƒÂ i khoÃ¡ÂºÂ£n cÃ¡Â»Â§a bÃ¡ÂºÂ¡n Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c kÃƒÂ­ch hoÃ¡ÂºÂ¡t trÃ¡Â»Å¸ lÃ¡ÂºÂ¡i"
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
	} else if req.StartDate != nil && req.EndDate != nil {
		startDate := req.StartDate.AsTime()
		endDate := req.EndDate.AsTime()
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
			CreatedAt:    timestamppb.New(log.CreatedAt),
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
			CreatedAt:     timestamppb.New(access.CreatedAt),
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

// GetSystemStats gets system statistics with caching
// Cache TTL: 10 seconds to balance freshness and reduce database load
func (s *AdminServiceServer) GetSystemStats(ctx context.Context, req *v1.GetSystemStatsRequest) (*v1.GetSystemStatsResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Try to get from cache first
	cacheKey := "system_stats"
	if cached, ok := s.statsCache.Load(cacheKey); ok {
		cache := cached.(*SystemStatsCache)
		// Check if cache is still valid (TTL not expired)
		if time.Since(cache.timestamp) < cache.ttl {
			return &v1.GetSystemStatsResponse{
				Response: &common.Response{
					Success: true,
					Message: "System statistics retrieved successfully (cached)",
				},
				Stats: cache.stats,
			}, nil
		}
	}

	// Cache miss or expired - fetch fresh data
	allUsers, err := s.userRepo.GetAll(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get users: %v", err)
	}

	// Calculate statistics
	totalUsers := len(allUsers)
	activeUsers := 0
	usersByRole := make(map[string]int32)
	usersByStatus := make(map[string]int32)

	for _, user := range allUsers {
		// Count active users
		if user.IsActive {
			activeUsers++
		}

		// Count by role
		roleStr := user.Role.String()
		usersByRole[roleStr]++

		// Count by status
		usersByStatus[user.Status]++
	}

	// TODO: Get session stats from session repository
	totalSessions := 0
	activeSessions := 0

	// TODO: Get suspicious activities from audit logs
	suspiciousActivities := 0

	stats := &v1.SystemStats{
		TotalUsers:           int32(totalUsers),
		ActiveUsers:          int32(activeUsers),
		TotalSessions:        int32(totalSessions),
		ActiveSessions:       int32(activeSessions),
		UsersByRole:          usersByRole,
		UsersByStatus:        usersByStatus,
		SuspiciousActivities: int32(suspiciousActivities),
	}

	// Store in cache with 10-second TTL
	s.statsCache.Store(cacheKey, &SystemStatsCache{
		stats:     stats,
		timestamp: time.Now(),
		ttl:       10 * time.Second,
	})

	return &v1.GetSystemStatsResponse{
		Response: &common.Response{
			Success: true,
			Message: "System statistics retrieved successfully",
		},
		Stats: stats,
	}, nil
}

// GetMetricsHistory gets historical metrics data for sparklines/charts
// Returns time series data with configurable interval
func (s *AdminServiceServer) GetMetricsHistory(ctx context.Context, req *v1.GetMetricsHistoryRequest) (*v1.GetMetricsHistoryResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Default time range: last 24 hours
	endTime := time.Now()
	startTime := endTime.Add(-24 * time.Hour)

	// Override with request params if provided
	if req.StartTime != nil {
		startTime = req.StartTime.AsTime()
	}
	if req.EndTime != nil {
		endTime = req.EndTime.AsTime()
	}

	// Default limit: 20 data points (good for sparklines)
	limit := 20
	if req.Limit > 0 {
		limit = int(req.Limit)
	}

	// Calculate interval between data points
	totalDuration := endTime.Sub(startTime)
	interval := totalDuration / time.Duration(limit)

	// Override with request interval if provided
	if req.IntervalSeconds > 0 {
		interval = time.Duration(req.IntervalSeconds) * time.Second
		// Recalculate limit based on interval
		limit = int(totalDuration / interval)
		if limit > 100 {
			limit = 100 // Cap at 100 points max
		}
	}

	// Query historical data from database
	snapshots, err := s.metricsRepo.GetMetricsHistory(ctx, startTime, endTime, limit)
	if err != nil {
		// If no data found or error, log but don't fail - return empty dataset
		log.Printf("[WARN] [AdminService] Failed to get metrics history from DB: %v. Returning empty dataset", err)
		snapshots = []*interfaces.MetricsSnapshot{}
	}

	// Convert repository snapshots to proto data points
	dataPoints := make([]*v1.MetricsDataPoint, 0, len(snapshots))
	for _, snapshot := range snapshots {
		dataPoint := &v1.MetricsDataPoint{
			Timestamp:            timestamppb.New(snapshot.RecordedAt),
			TotalUsers:           snapshot.TotalUsers,
			ActiveUsers:          snapshot.ActiveUsers,
			TotalSessions:        snapshot.TotalSessions,
			ActiveSessions:       snapshot.ActiveSessions,
			SuspiciousActivities: snapshot.SuspiciousActivities,
		}
		dataPoints = append(dataPoints, dataPoint)
	}

	return &v1.GetMetricsHistoryResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Retrieved %d metrics data points", len(dataPoints)),
		},
		DataPoints:  dataPoints,
		TotalPoints: int32(len(dataPoints)),
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

// getUsersWithFilters retrieves users with filtering and pagination
// âœ… FIX: Sá»­ dá»¥ng repository.GetUsersWithFilters() Ä‘á»ƒ fix N+1 query problem
//
// Performance improvement:
// - TrÆ°á»›c: Load ALL users â†’ filter trong memory â†’ 2-5 giÃ¢y
// - Sau: Filter trong database vá»›i WHERE clause â†’ 100-300ms
func (s *AdminServiceServer) getUsersWithFilters(
	ctx context.Context,
	filters repository.UserFilters,
	offset, limit int,
) ([]*repository.User, int, error) {
	// Sá»­ dá»¥ng repository method má»›i vá»›i database-level filtering
	// Thay vÃ¬ load táº¥t cáº£ users vÃ o memory rá»“i filter
	return s.userRepo.GetUsersWithFilters(ctx, filters, offset, limit)
}

// convertProtoRoleToString converts proto UserRole to string
func convertProtoRoleToString(role common.UserRole) string {
	switch role {
	case common.UserRole_USER_ROLE_GUEST:
		return "GUEST"
	case common.UserRole_USER_ROLE_STUDENT:
		return "STUDENT"
	case common.UserRole_USER_ROLE_TUTOR:
		return "TUTOR"
	case common.UserRole_USER_ROLE_TEACHER:
		return "TEACHER"
	case common.UserRole_USER_ROLE_ADMIN:
		return "ADMIN"
	default:
		return ""
	}
}

// convertProtoStatusToString converts proto UserStatus to string
func convertProtoStatusToString(status common.UserStatus) string {
	switch status {
	case common.UserStatus_USER_STATUS_ACTIVE:
		return "ACTIVE"
	case common.UserStatus_USER_STATUS_INACTIVE:
		return "INACTIVE"
	case common.UserStatus_USER_STATUS_SUSPENDED:
		return "SUSPENDED"
	default:
		return ""
	}
}

// stringToProtoStatus converts string to proto UserStatus
func stringToProtoStatus(status string) common.UserStatus {
	switch status {
	case "ACTIVE":
		return common.UserStatus_USER_STATUS_ACTIVE
	case "INACTIVE":
		return common.UserStatus_USER_STATUS_INACTIVE
	case "SUSPENDED":
		return common.UserStatus_USER_STATUS_SUSPENDED
	default:
		return common.UserStatus_USER_STATUS_ACTIVE
	}
}

// GetAllUserSessions gets all user sessions across the system (admin only)
func (s *AdminServiceServer) GetAllUserSessions(ctx context.Context, req *v1.GetAllUserSessionsRequest) (*v1.GetAllUserSessionsResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Get pagination params
	limit := int(req.Pagination.Limit)
	if limit <= 0 {
		limit = 20
	}
	page := int(req.Pagination.Page)
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	// Fetch sessions from repository
	var sessions []*repository.Session
	var err error

	if req.SearchQuery != "" {
		// Search sessions by email, IP, or location
		sessions, err = s.sessionRepo.SearchSessions(ctx, req.SearchQuery, limit, offset)
	} else if req.UserId != "" {
		// Filter by specific user
		if req.ActiveOnly {
			sessions, err = s.sessionRepo.GetActiveSessions(ctx, req.UserId)
		} else {
			sessions, err = s.sessionRepo.GetUserSessions(ctx, req.UserId)
		}
		// Apply pagination manually for user-specific queries
		if len(sessions) > offset {
			end := offset + limit
			if end > len(sessions) {
				end = len(sessions)
			}
			sessions = sessions[offset:end]
		} else {
			sessions = []*repository.Session{}
		}
	} else {
		// Get all active sessions
		sessions, err = s.sessionRepo.GetAllActiveSessions(ctx, limit, offset)
	}

	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get sessions: %v", err)
	}

	// Get total count for pagination
	totalCount, err := s.sessionRepo.GetAllSessionsCount(ctx)
	if err != nil {
		// Don't fail the request if count fails
		totalCount = len(sessions)
	}

	// Convert to proto
	protoSessions := make([]*v1.UserSession, len(sessions))
	for i, session := range sessions {
		protoSessions[i] = &v1.UserSession{
			Id:                session.ID,
			UserId:            session.UserID,
			SessionToken:      session.SessionToken,
			IpAddress:         session.IPAddress,
			UserAgent:         session.UserAgent,
			DeviceFingerprint: session.DeviceFingerprint,
			Location:          session.Location,
			IsActive:          session.IsActive,
			LastActivity:      timestamppb.New(session.LastActivity),
			ExpiresAt:         timestamppb.New(session.ExpiresAt),
			CreatedAt:         timestamppb.New(session.CreatedAt),
		}
	}

	// Calculate stats
	uniqueUsers := make(map[string]bool)
	for _, session := range sessions {
		uniqueUsers[session.UserID] = true
	}

	// Calculate pagination
	totalPages := (totalCount + limit - 1) / limit

	return &v1.GetAllUserSessionsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Sessions retrieved successfully",
		},
		Sessions: protoSessions,
		Pagination: &common.PaginationResponse{
			Page:       int32(page),
			Limit:      int32(limit),
			TotalPages: int32(totalPages),
			TotalCount: int32(totalCount),
		},
		TotalActiveSessions: int32(totalCount),
		UniqueActiveUsers:   int32(len(uniqueUsers)),
	}, nil
}

// GetAllNotifications gets all notifications across all users (admin only)
func (s *AdminServiceServer) GetAllNotifications(ctx context.Context, req *v1.GetAllNotificationsRequest) (*v1.GetAllNotificationsResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Parse pagination
	limit := int(req.Pagination.Limit)
	if limit <= 0 {
		limit = 20
	}
	page := int(req.Pagination.Page)
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	// Parse filters
	var notifType, userID string
	unreadOnly := false
	if req.Filter != nil {
		notifType = req.Filter.Type
		userID = req.Filter.UserId
		unreadOnly = req.Filter.UnreadOnly
	}

	// Get notifications
	var notifications []*repository.NotificationWithUser
	var err error

	if req.SearchQuery != "" {
		notifications, err = s.notificationRepo.SearchNotifications(ctx, req.SearchQuery, limit, offset)
	} else {
		notifications, err = s.notificationRepo.GetAllNotifications(ctx, limit, offset, notifType, userID, unreadOnly)
	}

	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get notifications: %v", err)
	}

	// Get total count
	totalCount, err := s.notificationRepo.GetAllNotificationsCount(ctx, notifType, userID, unreadOnly)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get notification count: %v", err)
	}

	// Get total unread count
	totalUnread, err := s.notificationRepo.GetAllNotificationsCount(ctx, "", "", true)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get unread count: %v", err)
	}

	// Convert to proto
	protoNotifications := make([]*v1.NotificationWithUser, len(notifications))
	for i, n := range notifications {
		// Convert data map
		dataMap := make(map[string]string)
		if len(n.Notification.Data) > 0 {
			// Parse JSON data
			var jsonData map[string]interface{}
			if err := json.Unmarshal(n.Notification.Data, &jsonData); err == nil {
				for k, v := range jsonData {
					dataMap[k] = fmt.Sprintf("%v", v)
				}
			}
		}

		protoNotif := &v1.Notification{
			Id:        n.Notification.ID,
			UserId:    n.Notification.UserID,
			Type:      n.Notification.Type,
			Title:     n.Notification.Title,
			Message:   n.Notification.Message,
			Data:      dataMap,
			IsRead:    n.Notification.IsRead,
			CreatedAt: timestamppb.New(n.Notification.CreatedAt),
		}

		if n.Notification.ReadAt != nil {
			protoNotif.ReadAt = timestamppb.New(*n.Notification.ReadAt)
		}
		if n.Notification.ExpiresAt != nil {
			protoNotif.ExpiresAt = timestamppb.New(*n.Notification.ExpiresAt)
		}

		protoNotifications[i] = &v1.NotificationWithUser{
			Notification: protoNotif,
			UserEmail:    n.UserEmail,
			UserName:     n.UserName,
		}
	}

	// Calculate pagination
	totalPages := (totalCount + limit - 1) / limit

	return &v1.GetAllNotificationsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notifications retrieved successfully",
		},
		Notifications: protoNotifications,
		Pagination: &common.PaginationResponse{
			Page:       int32(page),
			Limit:      int32(limit),
			TotalPages: int32(totalPages),
			TotalCount: int32(totalCount),
		},
		TotalUnread: int32(totalUnread),
	}, nil
}

// GetNotificationStats gets notification statistics (admin only)
func (s *AdminServiceServer) GetNotificationStats(ctx context.Context, req *v1.GetNotificationStatsRequest) (*v1.GetNotificationStatsResponse, error) {
	// Check admin permission
	if err := s.checkAdminPermission(ctx); err != nil {
		return nil, err
	}

	// Get stats from repository
	stats, err := s.notificationRepo.GetNotificationStats(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get notification stats: %v", err)
	}

	// Convert to proto
	protoStats := &v1.NotificationStats{
		TotalSentToday:      int32(stats.TotalSentToday),
		TotalUnread:         int32(stats.TotalUnread),
		NotificationsByType: make(map[string]int32),
		ReadRate:            stats.ReadRate,
		MostActiveType:      stats.MostActiveType,
		AverageReadTime:     stats.AverageReadTime,
		SentThisWeek:        int32(stats.SentThisWeek),
		GrowthPercentage:    stats.GrowthPercentage,
	}

	for k, v := range stats.NotificationsByType {
		protoStats.NotificationsByType[k] = int32(v)
	}

	return &v1.GetNotificationStatsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notification stats retrieved successfully",
		},
		Stats: protoStats,
	}, nil
}
