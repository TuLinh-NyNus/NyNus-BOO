import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/library/domain/entities/library_item.dart';

abstract class LibraryRepository {
  // Document operations
  Future<Either<Failure, LibraryListResponse>> getDocuments({
    required int page,
    required int limit,
    String? categoryId,
    String? search,
    List<String>? tags,
    LibrarySort? sortBy,
  });
  
  Future<Either<Failure, LibraryItem>> getDocument(String id);
  
  Future<Either<Failure, List<LibraryItem>>> getRecentDocuments({
    int limit = 10,
  });
  
  Future<Either<Failure, List<LibraryItem>>> getPopularDocuments({
    int limit = 10,
  });
  
  Future<Either<Failure, List<LibraryItem>>> getRelatedDocuments({
    required String documentId,
    int limit = 5,
  });
  
  // Category operations
  Future<Either<Failure, List<LibraryCategory>>> getCategories();
  Future<Either<Failure, LibraryCategory>> getCategory(String id);
  
  // Download operations
  Future<Either<Failure, DownloadTask>> downloadDocument({
    required String documentId,
    required String savePath,
    void Function(double progress)? onProgress,
  });
  
  Future<Either<Failure, void>> pauseDownload(String taskId);
  Future<Either<Failure, void>> resumeDownload(String taskId);
  Future<Either<Failure, void>> cancelDownload(String taskId);
  Future<Either<Failure, List<DownloadTask>>> getDownloadTasks();
  Future<Either<Failure, void>> deleteDownloadedFile(String documentId);
  
  // View operations
  Future<Either<Failure, void>> recordView(String documentId);
  
  Future<Either<Failure, void>> rateDocument({
    required String documentId,
    required int rating,
    String? comment,
  });
  
  // Bookmark operations
  Future<Either<Failure, void>> bookmarkDocument(String documentId);
  Future<Either<Failure, void>> unbookmarkDocument(String documentId);
  Future<Either<Failure, List<String>>> getBookmarkedIds();
  
  // Cache operations
  Future<Either<Failure, void>> cacheDocuments(List<LibraryItem> documents);
  Future<Either<Failure, List<LibraryItem>>> getCachedDocuments();
  Future<Either<Failure, void>> clearCache();
}

class LibraryListResponse {
  final List<LibraryItem> documents;
  final int totalCount;
  final int currentPage;
  final int totalPages;
  final bool hasMore;

  LibraryListResponse({
    required this.documents,
    required this.totalCount,
    required this.currentPage,
    required this.totalPages,
  }) : hasMore = currentPage < totalPages;
}

enum LibrarySort {
  newest,
  oldest,
  titleAsc,
  titleDesc,
  popular,
  recentlyViewed,
  highestRated,
  mostDownloaded,
}

