import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/exams/domain/repositories/exam_repository.dart';

class StartExamUseCase implements UseCase<ExamSession, StartExamParams> {
  final ExamRepository repository;

  StartExamUseCase(this.repository);

  @override
  Future<Either<Failure, ExamSession>> call(StartExamParams params) async {
    // Check if there's a cached session
    final cachedSession = await repository.getCachedSession(params.examId);
    
    final session = cachedSession.fold(
      (failure) => null,
      (session) => session,
    );
    
    if (session != null && 
        (session.status == SessionStatus.inProgress ||
         session.status == SessionStatus.paused)) {
      // Resume existing session
      return repository.resumeExam(session.id);
    }
    
    // Start new session
    return repository.startExam(params.examId);
  }
}

class StartExamParams extends Equatable {
  final String examId;

  const StartExamParams({required this.examId});

  @override
  List<Object> get props => [examId];
}

