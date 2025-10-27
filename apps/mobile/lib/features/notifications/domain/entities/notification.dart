import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

enum NotificationType {
  securityAlert,
  courseUpdate,
  systemMessage,
  achievement,
  social,
  payment,
  examReminder,
  resultAvailable,
}

class AppNotification extends Equatable {
  final String id;
  final String userId;
  final NotificationType type;
  final String title;
  final String message;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;
  final DateTime? expiresAt;

  const AppNotification({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.message,
    this.data,
    required this.isRead,
    this.readAt,
    required this.createdAt,
    this.expiresAt,
  });

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
  
  String? get actionRoute => data?['route'] as String?;
  
  IconData get typeIcon {
    switch (type) {
      case NotificationType.securityAlert:
        return Icons.security;
      case NotificationType.courseUpdate:
        return Icons.school;
      case NotificationType.systemMessage:
        return Icons.info;
      case NotificationType.achievement:
        return Icons.emoji_events;
      case NotificationType.social:
        return Icons.people;
      case NotificationType.payment:
        return Icons.payment;
      case NotificationType.examReminder:
        return Icons.alarm;
      case NotificationType.resultAvailable:
        return Icons.grading;
    }
  }

  Color get typeColor {
    switch (type) {
      case NotificationType.securityAlert:
        return Colors.red;
      case NotificationType.courseUpdate:
        return Colors.blue;
      case NotificationType.systemMessage:
        return Colors.orange;
      case NotificationType.achievement:
        return Colors.purple;
      case NotificationType.social:
        return Colors.green;
      case NotificationType.payment:
        return Colors.teal;
      case NotificationType.examReminder:
        return Colors.orange;
      case NotificationType.resultAvailable:
        return Colors.green;
    }
  }

  @override
  List<Object?> get props => [
    id,
    userId,
    type,
    title,
    message,
    isRead,
    readAt,
    createdAt,
  ];
}

