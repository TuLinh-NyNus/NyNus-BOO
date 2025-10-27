import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/questions/domain/repositories/question_repository.dart';

class SearchQuestionsUseCase implements UseCase<QuestionListResponse, SearchQuestionsParams> {
  final QuestionRepository repository;

  SearchQuestionsUseCase(this.repository);

  @override
  Future<Either<Failure, QuestionListResponse>> call(SearchQuestionsParams params) {
    return repository.searchQuestions(
      query: params.query,
      page: params.page,
      limit: params.limit,
      filters: params.filters,
    );
  }
}

class SearchQuestionsParams {
  final String query;
  final int page;
  final int limit;
  final QuestionFilters? filters;

  SearchQuestionsParams({
    required this.query,
    required this.page,
    this.limit = 20,
    this.filters,
  });
}

