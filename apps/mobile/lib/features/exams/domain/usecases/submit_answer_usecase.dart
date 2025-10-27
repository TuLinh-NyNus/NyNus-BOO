import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/exams/domain/repositories/exam_repository.dart';

class SubmitAnswerUseCase implements UseCase<void, SubmitAnswerParams> {
  final ExamRepository repository;

  SubmitAnswerUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(SubmitAnswerParams params) {
    return repository.submitAnswer(
      sessionId: params.sessionId,
      questionId: params.questionId,
      answer: params.answer,
    );
  }
}

class SubmitAnswerParams extends Equatable {
  final String sessionId;
  final String questionId;
  final QuestionAnswer answer;

  const SubmitAnswerParams({
    required this.sessionId,
    required this.questionId,
    required this.answer,
  });

  @override
  List<Object> get props => [sessionId, questionId, answer];
}

