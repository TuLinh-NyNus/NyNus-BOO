package grpc

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// NotificationServiceServer implements the NotificationService
type NotificationServiceServer struct {
	v1.UnimplementedNotificationServiceServer
	notificationRepo repository.NotificationRepository
	preferenceRepo   repository.UserPreferenceRepository
}

// NewNotificationServiceServer creates a new notification service
func NewNotificationServiceServer(
	notificationRepo repository.NotificationRepository,
	preferenceRepo repository.UserPreferenceRepository,
) *NotificationServiceServer {
	return &NotificationServiceServer{
		notificationRepo: notificationRepo,
		preferenceRepo:   preferenceRepo,
	}
}

// GetNotifications gets notifications for the current user
func (s *NotificationServiceServer) GetNotifications(ctx context.Context, req *v1.GetNotificationsRequest) (*v1.GetNotificationsResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Set defaults
	limit := int(req.Limit)
	if limit <= 0 {
		limit = 20
	}
	offset := int(req.Offset)

	var notifications []*repository.Notification
	var total int

	// Get notifications based on filter
	if req.UnreadOnly {
		notifications, err = s.notificationRepo.GetUnreadByUserID(ctx, userID)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get unread notifications: %v", err)
		}
		total = len(notifications)

		// Apply pagination manually for unread
		if offset < len(notifications) {
			end := offset + limit
			if end > len(notifications) {
				end = len(notifications)
			}
			notifications = notifications[offset:end]
		} else {
			notifications = []*repository.Notification{}
		}
	} else {
		notifications, err = s.notificationRepo.GetByUserID(ctx, userID, limit, offset)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get notifications: %v", err)
		}
		// For paginated results, we'd need a separate count query
		// For now, just use the returned count
		total = len(notifications) // This is not accurate for pagination
	}

	// Get unread count
	unreadCount, err := s.notificationRepo.GetUnreadCount(ctx, userID)
	if err != nil {
		// Don't fail the whole request if unread count fails
		unreadCount = 0
	}

	// Convert to proto
	protoNotifications := make([]*v1.Notification, len(notifications))
	for i, n := range notifications {
		protoNotifications[i] = s.toProtoNotification(n)
	}

	return &v1.GetNotificationsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notifications retrieved successfully",
		},
		Notifications: protoNotifications,
		Total:         int32(total),
		UnreadCount:   int32(unreadCount),
	}, nil
}

// GetNotification gets a specific notification
func (s *NotificationServiceServer) GetNotification(ctx context.Context, req *v1.GetNotificationRequest) (*v1.GetNotificationResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get notification
	notification, err := s.notificationRepo.GetByID(ctx, req.Id)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Errorf(codes.NotFound, "notification not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to get notification: %v", err)
	}

	// Verify notification belongs to user
	if notification.UserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "notification does not belong to user")
	}

	return &v1.GetNotificationResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notification retrieved successfully",
		},
		Notification: s.toProtoNotification(notification),
	}, nil
}

// MarkAsRead marks a notification as read
func (s *NotificationServiceServer) MarkAsRead(ctx context.Context, req *v1.MarkAsReadRequest) (*v1.MarkAsReadResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get notification to verify ownership
	notification, err := s.notificationRepo.GetByID(ctx, req.Id)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Errorf(codes.NotFound, "notification not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to get notification: %v", err)
	}

	// Verify notification belongs to user
	if notification.UserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "notification does not belong to user")
	}

	// Mark as read
	err = s.notificationRepo.MarkAsRead(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to mark notification as read: %v", err)
	}

	return &v1.MarkAsReadResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notification marked as read",
		},
		Success: true,
	}, nil
}

// MarkAllAsRead marks all notifications as read for the current user
func (s *NotificationServiceServer) MarkAllAsRead(ctx context.Context, req *v1.MarkAllAsReadRequest) (*v1.MarkAllAsReadResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get unread count before marking
	unreadCount, err := s.notificationRepo.GetUnreadCount(ctx, userID)
	if err != nil {
		unreadCount = 0
	}

	// Mark all as read
	err = s.notificationRepo.MarkAllAsRead(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to mark all notifications as read: %v", err)
	}

	return &v1.MarkAllAsReadResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Marked %d notifications as read", unreadCount),
		},
		MarkedCount: int32(unreadCount),
	}, nil
}

// DeleteNotification deletes a notification
func (s *NotificationServiceServer) DeleteNotification(ctx context.Context, req *v1.DeleteNotificationRequest) (*v1.DeleteNotificationResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get notification to verify ownership
	notification, err := s.notificationRepo.GetByID(ctx, req.Id)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Errorf(codes.NotFound, "notification not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to get notification: %v", err)
	}

	// Verify notification belongs to user
	if notification.UserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "notification does not belong to user")
	}

	// Delete notification
	err = s.notificationRepo.Delete(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete notification: %v", err)
	}

	return &v1.DeleteNotificationResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notification deleted successfully",
		},
		Success: true,
	}, nil
}

// DeleteAllNotifications deletes all notifications for the current user
func (s *NotificationServiceServer) DeleteAllNotifications(ctx context.Context, req *v1.DeleteAllNotificationsRequest) (*v1.DeleteAllNotificationsResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get count before deleting (for response)
	notifications, err := s.notificationRepo.GetByUserID(ctx, userID, 1000, 0)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to count notifications: %v", err)
	}
	count := len(notifications)

	// Delete all notifications
	err = s.notificationRepo.DeleteAllByUserID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete all notifications: %v", err)
	}

	return &v1.DeleteAllNotificationsResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Deleted %d notifications", count),
		},
		DeletedCount: int32(count),
	}, nil
}

// CreateNotification creates a new notification (admin only)
func (s *NotificationServiceServer) CreateNotification(ctx context.Context, req *v1.CreateNotificationRequest) (*v1.CreateNotificationResponse, error) {
	// Check if user is admin
	role, err := middleware.GetUserRoleFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	if role != "ADMIN" {
		return nil, status.Errorf(codes.PermissionDenied, "only admins can create notifications")
	}

	// Convert map to JSON for data field
	var dataJSON json.RawMessage
	if len(req.Data) > 0 {
		data, err := json.Marshal(req.Data)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid data format: %v", err)
		}
		dataJSON = data
	}

	// Parse expires_at if provided
	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t := req.ExpiresAt.AsTime()
		expiresAt = &t
	}

	// Create notification
	notification := &repository.Notification{
		ID:        repository.GenerateID(),
		UserID:    req.UserId,
		Type:      req.Type,
		Title:     req.Title,
		Message:   req.Message,
		Data:      dataJSON,
		IsRead:    false,
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
	}

	// Check user preferences before creating notification
	preferences, err := s.preferenceRepo.GetByUserID(ctx, req.UserId)
	if err == nil {
		// Check if user wants this type of notification
		switch req.Type {
		case "SECURITY_ALERT":
			if !preferences.SecurityAlerts {
				return &v1.CreateNotificationResponse{
					Response: &common.Response{
						Success: false,
						Message: "User has disabled security alerts",
					},
				}, nil
			}
		case "SYSTEM_MESSAGE":
			if !preferences.ProductUpdates {
				return &v1.CreateNotificationResponse{
					Response: &common.Response{
						Success: false,
						Message: "User has disabled product updates",
					},
				}, nil
			}
		}
	}

	// Save notification
	err = s.notificationRepo.Create(ctx, notification)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create notification: %v", err)
	}

	return &v1.CreateNotificationResponse{
		Response: &common.Response{
			Success: true,
			Message: "Notification created successfully",
		},
		Notification: s.toProtoNotification(notification),
	}, nil
}

// toProtoNotification converts repository notification to proto notification
func (s *NotificationServiceServer) toProtoNotification(n *repository.Notification) *v1.Notification {
	proto := &v1.Notification{
		Id:        n.ID,
		UserId:    n.UserID,
		Type:      n.Type,
		Title:     n.Title,
		Message:   n.Message,
		IsRead:    n.IsRead,
		CreatedAt: timestamppb.New(n.CreatedAt),
	}

	// Convert JSON data to map
	if len(n.Data) > 0 {
		var data map[string]string
		if err := json.Unmarshal(n.Data, &data); err == nil {
			proto.Data = data
		}
	}

	// Add read_at if available
	if n.ReadAt != nil {
		proto.ReadAt = timestamppb.New(*n.ReadAt)
	}

	// Add expires_at if available
	if n.ExpiresAt != nil {
		proto.ExpiresAt = timestamppb.New(*n.ExpiresAt)
	}

	return proto
}
