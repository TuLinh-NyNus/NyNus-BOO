import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';
import 'package:mobile/features/questions/domain/repositories/question_repository.dart';

class GetQuestionUseCase implements UseCase<Question, GetQuestionParams> {
  final QuestionRepository repository;

  GetQuestionUseCase(this.repository);

  @override
  Future<Either<Failure, Question>> call(GetQuestionParams params) {
    return repository.getQuestion(params.questionId);
  }
}

class GetQuestionParams extends Equatable {
  final String questionId;

  const GetQuestionParams({required this.questionId});

  @override
  List<Object> get props => [questionId];
}

