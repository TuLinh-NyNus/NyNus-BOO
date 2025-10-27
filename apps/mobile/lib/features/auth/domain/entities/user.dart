import 'package:equatable/equatable.dart';

enum UserRole { guest, student, tutor, teacher, admin }
enum UserStatus { active, inactive, suspended, deleted }

class User extends Equatable {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final UserRole role;
  final UserStatus status;
  final int? level; // Level 1-9 for STUDENT/TUTOR/TEACHER, null for GUEST/ADMIN
  final String? username;
  final String? avatar;
  final bool emailVerified;
  final String? googleId;
  final int maxConcurrentSessions; // Max 3 devices default (anti-sharing)
  final DateTime createdAt;
  final DateTime? lastLogin;

  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.status,
    this.level,
    this.username,
    this.avatar,
    required this.emailVerified,
    this.googleId,
    this.maxConcurrentSessions = 3, // Default 3 devices
    required this.createdAt,
    this.lastLogin,
  });

  String get fullName => '$firstName $lastName';
  
  String get displayName => username ?? fullName;

  bool get isAdmin => role == UserRole.admin;
  bool get isTeacher => role == UserRole.teacher || isAdmin;
  bool get canCreateContent => isTeacher;
  bool get hasLevel => level != null;

  @override
  List<Object?> get props => [
        id,
        email,
        firstName,
        lastName,
        role,
        status,
        level,
        username,
        avatar,
        emailVerified,
        googleId,
        maxConcurrentSessions,
        createdAt,
        lastLogin,
      ];
}

