import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/questions/domain/repositories/question_repository.dart';

class GetQuestionsUseCase implements UseCase<QuestionListResponse, GetQuestionsParams> {
  final QuestionRepository repository;

  GetQuestionsUseCase(this.repository);

  @override
  Future<Either<Failure, QuestionListResponse>> call(GetQuestionsParams params) {
    return repository.getQuestions(
      page: params.page,
      limit: params.limit,
      search: params.search,
      filters: params.filters,
      sortBy: params.sortBy,
    );
  }
}

class GetQuestionsParams {
  final int page;
  final int limit;
  final String? search;
  final QuestionFilters? filters;
  final String? sortBy;

  GetQuestionsParams({
    required this.page,
    this.limit = 20,
    this.search,
    this.filters,
    this.sortBy,
  });
}

