import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/library/domain/repositories/library_repository.dart';

class GetDocumentsUseCase implements UseCase<LibraryListResponse, GetDocumentsParams> {
  final LibraryRepository repository;

  GetDocumentsUseCase(this.repository);

  @override
  Future<Either<Failure, LibraryListResponse>> call(GetDocumentsParams params) {
    return repository.getDocuments(
      page: params.page,
      limit: params.limit,
      categoryId: params.categoryId,
      search: params.search,
      tags: params.tags,
      sortBy: params.sortBy,
    );
  }
}

class GetDocumentsParams {
  final int page;
  final int limit;
  final String? categoryId;
  final String? search;
  final List<String>? tags;
  final LibrarySort? sortBy;

  GetDocumentsParams({
    required this.page,
    this.limit = 20,
    this.categoryId,
    this.search,
    this.tags,
    this.sortBy,
  });
}

