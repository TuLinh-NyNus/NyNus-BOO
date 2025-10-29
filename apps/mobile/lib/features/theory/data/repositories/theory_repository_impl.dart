import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/theory/domain/entities/theory_content.dart';
import 'package:mobile/features/theory/domain/repositories/theory_repository.dart';
import 'package:mobile/features/theory/data/datasources/theory_remote_datasource.dart';
import 'package:mobile/features/theory/data/datasources/theory_local_datasource.dart';
import 'package:mobile/features/theory/data/models/theory_post_model.dart';

class TheoryRepositoryImpl implements TheoryRepository {
  final TheoryRemoteDataSource remoteDataSource;
  final TheoryLocalDataSource localDataSource;

  TheoryRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, TheoryPost>> getPost({
    String? id,
    String? slug,
  }) async {
    try {
      // Try cache first
      if (id != null) {
        final cached = await localDataSource.getCachedPost(id);
        if (cached != null) {
          return Right(cached);
        }
      }
      
      await remoteDataSource.getPost(id: id, slug: slug);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<TheoryPost>>> listPosts({
    required int page,
    required int limit,
    PostType? type,
    Subject? subject,
    int? grade,
    String? category,
    List<String>? tags,
    String? sortBy,
  }) async {
    try {
      await remoteDataSource.listPosts({
        'page': page,
        'limit': limit,
        'type': type?.name,
        'subject': subject?.name,
        'grade': grade,
        'category': category,
        'tags': tags,
        'sortBy': sortBy,
      });
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      // Try cache
      final cached = await localDataSource.getCachedPosts();
      return Right(cached);
    }
  }

  @override
  Future<Either<Failure, List<TheoryPost>>> getRecentPosts({int limit = 10}) async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, List<TheoryPost>>> getPopularPosts({int limit = 10}) async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, List<TheoryPost>>> getRelatedPosts({
    required String postId,
    int limit = 5,
  }) async {
    return const Right([]);
  }

  @override
  Future<Either<Failure, List<TheoryNavigationNode>>> getNavigationTree({
    Subject? subject,
    int? grade,
  }) async {
    try {
      await remoteDataSource.getNavigationTree(
        subject: subject,
        grade: grade,
      );
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, TheoryNavigationNode>> getNavigationNode({
    required String nodeId,
  }) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> bookmarkPost(String postId) async {
    try {
      await localDataSource.saveBookmark(postId);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> unbookmarkPost(String postId) async {
    try {
      await localDataSource.removeBookmark(postId);
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
  Future<Either<Failure, void>> downloadPost(String postId) async {
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> deleteDownloadedPost(String postId) async {
    try {
      await localDataSource.deleteDownloadedPost(postId);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<TheoryPost>>> getDownloadedPosts() async {
    try {
      final downloads = await localDataSource.getDownloadedPosts();
      return Right(downloads);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> cachePosts(List<TheoryPost> posts) async {
    try {
      // Filter and cast only TheoryPostModel items
      final models = posts.whereType<TheoryPostModel>().toList();
      await localDataSource.cachePosts(models);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<TheoryPost>>> getCachedPosts() async {
    try {
      final posts = await localDataSource.getCachedPosts();
      return Right(posts);
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

