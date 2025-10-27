import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/exams/domain/repositories/exam_repository.dart';
import 'package:mobile/features/exams/data/datasources/exam_remote_datasource.dart';
import 'package:mobile/features/exams/data/datasources/exam_local_datasource.dart';
import 'package:mobile/features/exams/data/models/exam_model.dart';

class ExamRepositoryImpl implements ExamRepository {
  final ExamRemoteDataSource remoteDataSource;
  final ExamLocalDataSource localDataSource;

  ExamRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, ExamListResponse>> getExams({
    required int page,
    required int limit,
    String? search,
    ExamFilters? filters,
    String? sortBy,
  }) async {
    try {
      final response = await remoteDataSource.getExams(
        page: page,
        limit: limit,
        search: search,
        filters: filters?.toMap(),
        sortBy: sortBy,
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      // Try cache
      final cached = await localDataSource.getCachedExams();
      return Right(ExamListResponse(
        exams: cached,
        totalCount: cached.length,
        currentPage: 1,
        totalPages: 1,
      ));
    }
  }

  @override
  Future<Either<Failure, Exam>> getExam(String id) async {
    try {
      // Try cache first
      final cached = await localDataSource.getCachedExam(id);
      if (cached != null) {
        return Right(cached);
      }
      
      final response = await remoteDataSource.getExam(id);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, ExamSession>> startExam(String examId) async {
    try {
      final response = await remoteDataSource.startExam(examId);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> submitAnswer({
    required String sessionId,
    required String questionId,
    required QuestionAnswer answer,
  }) async {
    try {
      await remoteDataSource.submitAnswer({
        'sessionId': sessionId,
        'questionId': questionId,
        'answer': answer,
      });
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> saveProgress({
    required String sessionId,
    required Map<String, QuestionAnswer> answers,
    required int timeSpent,
    required int currentQuestionIndex,
  }) async {
    try {
      await remoteDataSource.saveProgress({
        'sessionId': sessionId,
        'answers': answers,
        'timeSpent': timeSpent,
        'currentQuestionIndex': currentQuestionIndex,
      });
      return const Right(null);
    } catch (e) {
      // Offline save is OK
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, ExamResult>> completeExam(String sessionId) async {
    try {
      final response = await remoteDataSource.completeExam(sessionId);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> pauseExam(String sessionId) async {
    try {
      await remoteDataSource.pauseExam(sessionId);
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, ExamSession>> resumeExam(String sessionId) async {
    try {
      final response = await remoteDataSource.resumeExam(sessionId);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<ExamResult>>> getExamHistory({
    required int page,
    required int limit,
    String? examId,
  }) async {
    try {
      final response = await remoteDataSource.getExamHistory(
        page: page,
        limit: limit,
        examId: examId,
      );
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, ExamResult>> getExamResult(String sessionId) async {
    try {
      final response = await remoteDataSource.getExamResult(sessionId);
      return const Left(ServerFailure('Proto files not generated'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, String>> exportResultPdf(String sessionId) async {
    // Will implement with PDF generation
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> cacheExam(Exam exam) async {
    try {
      final model = exam is ExamModel ? exam : ExamModel(
        id: exam.id,
        title: exam.title,
        description: exam.description,
        instructions: exam.instructions,
        type: exam.type,
        status: exam.status,
        mode: exam.mode,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalPoints: exam.totalPoints,
        passingScore: exam.passingScore,
        subject: exam.subject,
        grade: exam.grade,
        tags: exam.tags,
        questionTypeDistribution: exam.questionTypeDistribution,
        difficultyDistribution: exam.difficultyDistribution,
        availableFrom: exam.availableFrom,
        availableUntil: exam.availableUntil,
        attemptLimit: exam.attemptLimit,
        shuffleQuestions: exam.shuffleQuestions,
        shuffleAnswers: exam.shuffleAnswers,
        showResultsImmediately: exam.showResultsImmediately,
        allowReview: exam.allowReview,
        sourceInstitution: exam.sourceInstitution,
        examYear: exam.examYear,
        examCode: exam.examCode,
        fileUrl: exam.fileUrl,
        createdBy: exam.createdBy,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      );
      
      await localDataSource.cacheExam(model);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> cacheExamSession(ExamSession session) async {
    try {
      final model = session is ExamSessionModel ? session : ExamSessionModel(
        id: session.id,
        examId: session.examId,
        userId: session.userId,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        pausedAt: session.pausedAt,
        timeSpent: session.timeSpent,
        currentQuestionIndex: session.currentQuestionIndex,
        questions: session.questions,
        answers: session.answers,
        score: session.score,
        percentage: session.percentage,
        passed: session.passed,
      );
      
      await localDataSource.cacheExamSession(model);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, ExamSession?>> getCachedSession(String examId) async {
    try {
      final session = await localDataSource.getCachedSession(examId);
      return Right(session);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> clearCache() async {
    try {
      await localDataSource.clearCache();
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }
}

