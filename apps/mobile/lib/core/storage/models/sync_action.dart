import 'package:equatable/equatable.dart';

enum SyncActionType {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submitAnswer,
  completeExam,
  updateProfile,
  bookmarkQuestion,
  unbookmarkQuestion,
  rateQuestion,
}

enum SyncStatus {
  pending,
  syncing,
  completed,
  failed,
}

class SyncAction extends Equatable {
  final String id;
  final SyncActionType type;
  final Map<String, dynamic> data;
  final DateTime createdAt;
  final SyncStatus status;
  final int retryCount;
  final String? error;
  final DateTime? lastAttempt;

  const SyncAction({
    required this.id,
    required this.type,
    required this.data,
    required this.createdAt,
    this.status = SyncStatus.pending,
    this.retryCount = 0,
    this.error,
    this.lastAttempt,
  });

  SyncAction copyWith({
    String? id,
    SyncActionType? type,
    Map<String, dynamic>? data,
    DateTime? createdAt,
    SyncStatus? status,
    int? retryCount,
    String? error,
    DateTime? lastAttempt,
  }) {
    return SyncAction(
      id: id ?? this.id,
      type: type ?? this.type,
      data: data ?? this.data,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      error: error ?? this.error,
      lastAttempt: lastAttempt ?? this.lastAttempt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'data': data,
      'createdAt': createdAt.toIso8601String(),
      'status': status.name,
      'retryCount': retryCount,
      'error': error,
      'lastAttempt': lastAttempt?.toIso8601String(),
    };
  }

  factory SyncAction.fromJson(Map<String, dynamic> json) {
    return SyncAction(
      id: json['id'] as String,
      type: SyncActionType.values.byName(json['type'] as String),
      data: Map<String, dynamic>.from(json['data'] as Map),
      createdAt: DateTime.parse(json['createdAt'] as String),
      status: SyncStatus.values.byName(json['status'] as String),
      retryCount: json['retryCount'] as int? ?? 0,
      error: json['error'] as String?,
      lastAttempt: json['lastAttempt'] != null 
          ? DateTime.parse(json['lastAttempt'] as String) 
          : null,
    );
  }

  @override
  List<Object?> get props => [
    id,
    type,
    data,
    createdAt,
    status,
    retryCount,
    error,
    lastAttempt,
  ];
  
  @override
  String toString() {
    return 'SyncAction(id: $id, type: $type, status: $status, retry: $retryCount)';
  }
}

