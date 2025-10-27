import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/library/domain/entities/library_item.dart';
import 'package:mobile/features/library/domain/repositories/library_repository.dart';
import 'package:mobile/features/library/data/datasources/library_remote_datasource.dart';
import 'package:mobile/features/library/data/datasources/library_local_datasource.dart';

class LibraryRepositoryImpl implements LibraryRepository {
  final LibraryRemoteDataSource remoteDataSource;
  final LibraryLocalDataSource localDataSource;

  LibraryRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, LibraryListResponse>> getDocuments({
    required int page,
    required int limit,
    String? categoryId,
    String? search,
    List<String>? tags,
    LibrarySort? sortBy,
  }) async {
    try {
      final response = await remoteDataSource.getDocuments(
        page: page,
        limit: limit,
        categoryId: categoryId,
        search: search,
        tags: tags,
        sortBy: sortBy?.name,
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      // Try cache
      final cached = await localDataSource.getCachedDocuments();
      return Right(LibraryListResponse(
        documents: cached,
        totalCount: cached.length,
        currentPage: 1,
        totalPages: 1,
      ));
    }
  }

  @override
  Future<Either<Failure, LibraryItem>> getDocument(String id) async {
    try {
      // Try cache first
      final cached = await localDataSource.getCachedDocument(id);
      if (cached != null) {
        return Right(cached);
      }
      
      final response = await remoteDataSource.getDocument(id);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<LibraryItem>>> getRecentDocuments({
    int limit = 10,
  }) async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, List<LibraryItem>>> getPopularDocuments({
    int limit = 10,
  }) async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, List<LibraryItem>>> getRelatedDocuments({
    required String documentId,
    int limit = 5,
  }) async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, List<LibraryCategory>>> getCategories() async {
    try {
      final response = await remoteDataSource.getCategories();
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, LibraryCategory>> getCategory(String id) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, DownloadTask>> downloadDocument({
    required String documentId,
    required String savePath,
    void Function(double progress)? onProgress,
  }) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> pauseDownload(String taskId) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> resumeDownload(String taskId) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> cancelDownload(String taskId) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, List<DownloadTask>>> getDownloadTasks() async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, void>> deleteDownloadedFile(String documentId) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> recordView(String documentId) async {
    try {
      await remoteDataSource.recordView(documentId);
      return const Right(null);
    } catch (e) {
      return const Right(null); // Silently fail
    }
  }

  @override
  Future<Either<Failure, void>> rateDocument({
    required String documentId,
    required int rating,
    String? comment,
  }) async {
    try {
      await remoteDataSource.rateDocument(documentId, rating, comment);
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> bookmarkDocument(String documentId) async {
    try {
      await localDataSource.saveBookmark(documentId);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> unbookmarkDocument(String documentId) async {
    try {
      await localDataSource.removeBookmark(documentId);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getBookmarkedIds() async {
    try {
      final bookmarks = await localDataSource.getBookmarkedIds();
      return Right(bookmarks);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> cacheDocuments(List<LibraryItem> documents) async {
    try {
      final models = documents.cast<LibraryItemModel>();
      await localDataSource.cacheDocuments(models);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<LibraryItem>>> getCachedDocuments() async {
    try {
      final documents = await localDataSource.getCachedDocuments();
      return Right(documents);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> clearCache() async {
    try {
      await localDataSource.clearCache();
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }
}

