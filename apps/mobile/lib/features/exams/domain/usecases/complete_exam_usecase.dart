import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/exams/domain/repositories/exam_repository.dart';

class CompleteExamUseCase implements UseCase<ExamResult, CompleteExamParams> {
  final ExamRepository repository;

  CompleteExamUseCase(this.repository);

  @override
  Future<Either<Failure, ExamResult>> call(CompleteExamParams params) {
    return repository.completeExam(params.sessionId);
  }
}

class CompleteExamParams extends Equatable {
  final String sessionId;

  const CompleteExamParams({required this.sessionId});

  @override
  List<Object> get props => [sessionId];
}

