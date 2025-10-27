import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/exams/domain/repositories/exam_repository.dart';

class GetExamUseCase implements UseCase<Exam, GetExamParams> {
  final ExamRepository repository;

  GetExamUseCase(this.repository);

  @override
  Future<Either<Failure, Exam>> call(GetExamParams params) {
    return repository.getExam(params.examId);
  }
}

class GetExamParams extends Equatable {
  final String examId;

  const GetExamParams({required this.examId});

  @override
  List<Object> get props => [examId];
}

