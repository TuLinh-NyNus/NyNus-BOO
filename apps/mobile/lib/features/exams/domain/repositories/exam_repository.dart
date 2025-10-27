import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';

abstract class ExamRepository {
  // Get exams
  Future<Either<Failure, ExamListResponse>> getExams({
    required int page,
    required int limit,
    String? search,
    ExamFilters? filters,
    String? sortBy,
  });
  
  // Get single exam
  Future<Either<Failure, Exam>> getExam(String id);
  
  // Start exam
  Future<Either<Failure, ExamSession>> startExam(String examId);
  
  // Submit answer
  Future<Either<Failure, void>> submitAnswer({
    required String sessionId,
    required String questionId,
    required QuestionAnswer answer,
  });
  
  // Save progress (auto-save)
  Future<Either<Failure, void>> saveProgress({
    required String sessionId,
    required Map<String, QuestionAnswer> answers,
    required int timeSpent,
    required int currentQuestionIndex,
  });
  
  // Complete exam
  Future<Either<Failure, ExamResult>> completeExam(String sessionId);
  
  // Pause exam
  Future<Either<Failure, void>> pauseExam(String sessionId);
  
  // Resume exam
  Future<Either<Failure, ExamSession>> resumeExam(String sessionId);
  
  // Get exam history
  Future<Either<Failure, List<ExamResult>>> getExamHistory({
    required int page,
    required int limit,
    String? examId,
  });
  
  // Get exam result
  Future<Either<Failure, ExamResult>> getExamResult(String sessionId);
  
  // Export result as PDF
  Future<Either<Failure, String>> exportResultPdf(String sessionId);
  
  // Cache operations
  Future<Either<Failure, void>> cacheExam(Exam exam);
  Future<Either<Failure, void>> cacheExamSession(ExamSession session);
  Future<Either<Failure, ExamSession?>> getCachedSession(String examId);
  Future<Either<Failure, void>> clearCache();
}

class ExamListResponse {
  final List<Exam> exams;
  final int totalCount;
  final int currentPage;
  final int totalPages;
  final bool hasMore;

  ExamListResponse({
    required this.exams,
    required this.totalCount,
    required this.currentPage,
    required this.totalPages,
  }) : hasMore = currentPage < totalPages;
}

class ExamFilters {
  final List<ExamType>? types;
  final List<String>? subjects;
  final List<int>? grades;
  final List<String>? tags;
  final ExamStatus? status;
  final bool? isAvailable;
  final DateTime? availableFrom;
  final DateTime? availableUntil;

  ExamFilters({
    this.types,
    this.subjects,
    this.grades,
    this.tags,
    this.status,
    this.isAvailable,
    this.availableFrom,
    this.availableUntil,
  });

  Map<String, dynamic> toMap() {
    return {
      if (types != null) 'types': types!.map((t) => t.name).toList(),
      if (subjects != null) 'subjects': subjects,
      if (grades != null) 'grades': grades,
      if (tags != null) 'tags': tags,
      if (status != null) 'status': status!.name,
      if (isAvailable != null) 'is_available': isAvailable,
      if (availableFrom != null) 'available_from': availableFrom!.toIso8601String(),
      if (availableUntil != null) 'available_until': availableUntil!.toIso8601String(),
    };
  }
}

