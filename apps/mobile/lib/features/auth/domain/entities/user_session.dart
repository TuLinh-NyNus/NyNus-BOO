import 'package:equatable/equatable.dart';

class UserSession extends Equatable {
  final String id;
  final String userId;
  final String sessionToken;
  final String deviceFingerprint;
  final String ipAddress;
  final String? userAgent;
  final String? location;
  final bool isActive;
  final DateTime lastActivity;
  final DateTime expiresAt;
  final DateTime createdAt;

  const UserSession({
    required this.id,
    required this.userId,
    required this.sessionToken,
    required this.deviceFingerprint,
    required this.ipAddress,
    this.userAgent,
    this.location,
    required this.isActive,
    required this.lastActivity,
    required this.expiresAt,
    required this.createdAt,
  });

  String get deviceName {
    if (userAgent == null) return 'Unknown Device';
    
    if (userAgent!.contains('iPhone')) return 'iPhone';
    if (userAgent!.contains('iPad')) return 'iPad';
    if (userAgent!.contains('Android')) return 'Android Device';
    if (userAgent!.contains('Windows')) return 'Windows PC';
    if (userAgent!.contains('Mac')) return 'Mac';
    if (userAgent!.contains('Linux')) return 'Linux PC';
    
    return 'Unknown Device';
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  @override
  List<Object?> get props => [
    id,
    userId,
    sessionToken,
    deviceFingerprint,
    ipAddress,
    userAgent,
    location,
    isActive,
    lastActivity,
    expiresAt,
    createdAt,
  ];
}

