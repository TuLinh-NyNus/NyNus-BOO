import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/theory/domain/entities/theory_content.dart';

abstract class TheoryRepository {
  // Content operations
  Future<Either<Failure, TheoryPost>> getPost({
    String? id,
    String? slug,
  });
  
  Future<Either<Failure, List<TheoryPost>>> listPosts({
    required int page,
    required int limit,
    PostType? type,
    Subject? subject,
    int? grade,
    String? category,
    List<String>? tags,
    String? sortBy,
  });
  
  Future<Either<Failure, List<TheoryPost>>> getRecentPosts({
    int limit = 10,
  });
  
  Future<Either<Failure, List<TheoryPost>>> getPopularPosts({
    int limit = 10,
  });
  
  Future<Either<Failure, List<TheoryPost>>> getRelatedPosts({
    required String postId,
    int limit = 5,
  });
  
  // Navigation
  Future<Either<Failure, List<TheoryNavigationNode>>> getNavigationTree({
    Subject? subject,
    int? grade,
  });
  
  Future<Either<Failure, TheoryNavigationNode>> getNavigationNode({
    required String nodeId,
  });
  
  // Bookmark operations
  Future<Either<Failure, void>> bookmarkPost(String postId);
  Future<Either<Failure, void>> unbookmarkPost(String postId);
  Future<Either<Failure, List<String>>> getBookmarkedIds();
  
  // Offline operations
  Future<Either<Failure, void>> downloadPost(String postId);
  Future<Either<Failure, void>> deleteDownloadedPost(String postId);
  Future<Either<Failure, List<TheoryPost>>> getDownloadedPosts();
  
  // Cache operations
  Future<Either<Failure, void>> cachePosts(List<TheoryPost> posts);
  Future<Either<Failure, List<TheoryPost>>> getCachedPosts();
  Future<Either<Failure, void>> clearCache();
}

