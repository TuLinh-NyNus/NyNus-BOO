import 'package:equatable/equatable.dart';

enum LibraryItemType { 
  exam,   // Đề thi
  book,   // Sách, tài liệu
  video   // Video bài giảng
}

enum LibraryUploadStatus { 
  pending,    // Chờ duyệt
  approved,   // Đã duyệt
  rejected,   // Bị từ chối
  archived    // Đã lưu trữ
}

enum DocumentSource { local, googleDrive, server }
enum DownloadStatus {
  pending,
  downloading,
  paused,
  completed,
  failed,
  cancelled,
}

class LibraryItem extends Equatable {
  final String id;
  final String title;
  final String? description;
  final LibraryItemType type;
  final LibraryUploadStatus status;
  final DocumentSource source;
  final String? fileUrl;
  final String? driveFileId;
  final String? thumbnailUrl;
  final int fileSize;
  final String? mimeType;
  final String category;
  final List<String> tags;
  final int viewCount;
  final int downloadCount;
  final double? averageRating;
  final int reviewCount;
  final String? requiredRole;
  final int? requiredLevel;
  final List<String> targetRoles;
  final String createdBy;
  final String? approvedBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastViewedAt;
  final bool isDownloaded;
  final String? localPath;

  const LibraryItem({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    required this.status,
    required this.source,
    this.fileUrl,
    this.driveFileId,
    this.thumbnailUrl,
    required this.fileSize,
    this.mimeType,
    required this.category,
    this.tags = const [],
    this.viewCount = 0,
    this.downloadCount = 0,
    this.averageRating,
    this.reviewCount = 0,
    this.requiredRole,
    this.requiredLevel,
    this.targetRoles = const [],
    required this.createdBy,
    this.approvedBy,
    required this.createdAt,
    required this.updatedAt,
    this.lastViewedAt,
    this.isDownloaded = false,
    this.localPath,
  });

  String get formattedFileSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    }
    if (fileSize < 1024 * 1024 * 1024) {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(fileSize / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  bool get isGoogleDriveFile => source == DocumentSource.googleDrive;
  bool get canDownload => fileUrl != null || driveFileId != null;
  bool get isPDF => mimeType == 'application/pdf';
  bool get isVideo => type == LibraryItemType.video;

  @override
  List<Object?> get props => [
    id,
    title,
    type,
    status,
    source,
    fileSize,
    category,
    isDownloaded,
    localPath,
  ];
}

class LibraryCategory extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? icon;
  final String? parentId;
  final int order;
  final int documentCount;

  const LibraryCategory({
    required this.id,
    required this.name,
    this.description,
    this.icon,
    this.parentId,
    this.order = 0,
    this.documentCount = 0,
  });

  bool get isRoot => parentId == null;

  @override
  List<Object?> get props => [id, name, parentId, order];
}

class DownloadTask extends Equatable {
  final String id;
  final String documentId;
  final LibraryItem document;
  final DownloadStatus status;
  final double progress;
  final String? localPath;
  final DateTime startedAt;
  final DateTime? completedAt;
  final String? error;
  final int bytesDownloaded;
  final int totalBytes;

  const DownloadTask({
    required this.id,
    required this.documentId,
    required this.document,
    required this.status,
    required this.progress,
    this.localPath,
    required this.startedAt,
    this.completedAt,
    this.error,
    required this.bytesDownloaded,
    required this.totalBytes,
  });

  String get progressPercentage => '${(progress * 100).toInt()}%';
  
  DownloadTask copyWith({
    DownloadStatus? status,
    double? progress,
    String? localPath,
    DateTime? completedAt,
    String? error,
    int? bytesDownloaded,
  }) {
    return DownloadTask(
      id: id,
      documentId: documentId,
      document: document,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      localPath: localPath ?? this.localPath,
      startedAt: startedAt,
      completedAt: completedAt ?? this.completedAt,
      error: error ?? this.error,
      bytesDownloaded: bytesDownloaded ?? this.bytesDownloaded,
      totalBytes: totalBytes,
    );
  }

  @override
  List<Object?> get props => [
    id,
    documentId,
    status,
    progress,
    localPath,
    error,
    bytesDownloaded,
  ];
}

