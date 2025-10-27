import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/questions/domain/repositories/question_repository.dart';

class BookmarkQuestionUseCase implements UseCase<void, BookmarkQuestionParams> {
  final QuestionRepository repository;

  BookmarkQuestionUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(BookmarkQuestionParams params) {
    if (params.bookmark) {
      return repository.bookmarkQuestion(params.questionId);
    } else {
      return repository.unbookmarkQuestion(params.questionId);
    }
  }
}

class BookmarkQuestionParams extends Equatable {
  final String questionId;
  final bool bookmark;

  const BookmarkQuestionParams({
    required this.questionId,
    required this.bookmark,
  });

  @override
  List<Object> get props => [questionId, bookmark];
}

class GetBookmarkedQuestionsUseCase implements UseCase<List<String>, NoParams> {
  final QuestionRepository repository;

  GetBookmarkedQuestionsUseCase(this.repository);

  @override
  Future<Either<Failure, List<String>>> call(NoParams params) {
    return repository.getBookmarkedIds();
  }
}

