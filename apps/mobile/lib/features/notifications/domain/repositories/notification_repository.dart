import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/notifications/domain/entities/notification.dart';

abstract class NotificationRepository {
  // Get notifications
  Future<Either<Failure, NotificationListResponse>> getNotifications({
    int limit = 20,
    int offset = 0,
    bool unreadOnly = false,
  });
  
  // Get single notification
  Future<Either<Failure, AppNotification>> getNotification(String id);
  
  // Mark as read
  Future<Either<Failure, void>> markAsRead(String id);
  
  // Mark all as read
  Future<Either<Failure, int>> markAllAsRead();
  
  // Delete notification
  Future<Either<Failure, void>> deleteNotification(String id);
  
  // Delete all
  Future<Either<Failure, int>> deleteAll();
  
  // Get unread count
  Future<Either<Failure, int>> getUnreadCount();
  
  // Register FCM token
  Future<Either<Failure, void>> registerDevice(String fcmToken);
}

class NotificationListResponse {
  final List<AppNotification> notifications;
  final int total;
  final int unreadCount;

  NotificationListResponse({
    required this.notifications,
    required this.total,
    required this.unreadCount,
  });
}

