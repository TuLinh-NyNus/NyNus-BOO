import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/theory/domain/entities/theory_content.dart';
import 'package:mobile/features/theory/domain/repositories/theory_repository.dart';

class GetTheoryContentUseCase implements UseCase<TheoryPost, GetTheoryContentParams> {
  final TheoryRepository repository;

  GetTheoryContentUseCase(this.repository);

  @override
  Future<Either<Failure, TheoryPost>> call(GetTheoryContentParams params) async {
    // Try to get from cache first if offline
    if (params.preferOffline) {
      final cachedPosts = await repository.getCachedPosts();
      final cached = cachedPosts.fold<TheoryPost?>(
        (failure) => null,
        (posts) {
          try {
            return posts.firstWhere(
              (p) => p.id == params.id || p.slug == params.slug,
            );
          } catch (e) {
            return null;
          }
        },
      );
      
      if (cached != null) {
        return Right(cached);
      }
    }
    
    // Get from server
    return repository.getPost(
      id: params.id,
      slug: params.slug,
    );
  }
}

class GetTheoryContentParams {
  final String? id;
  final String? slug;
  final bool preferOffline;

  GetTheoryContentParams({
    this.id,
    this.slug,
    this.preferOffline = false,
  }) : assert(id != null || slug != null, 'Either id or slug must be provided');
}

