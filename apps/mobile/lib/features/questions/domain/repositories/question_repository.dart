import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';

abstract class QuestionRepository {
  // Get questions
  Future<Either<Failure, QuestionListResponse>> getQuestions({
    required int page,
    required int limit,
    String? search,
    QuestionFilters? filters,
    String? sortBy,
  });
  
  // Get single question
  Future<Either<Failure, Question>> getQuestion(String id);
  
  // Search questions
  Future<Either<Failure, QuestionListResponse>> searchQuestions({
    required String query,
    required int page,
    required int limit,
    QuestionFilters? filters,
  });
  
  // Get questions by code
  Future<Either<Failure, QuestionListResponse>> getQuestionsByCode({
    required String code,
    required int page,
    required int limit,
  });
  
  // Bookmark operations
  Future<Either<Failure, void>> bookmarkQuestion(String questionId);
  Future<Either<Failure, void>> unbookmarkQuestion(String questionId);
  Future<Either<Failure, List<String>>> getBookmarkedIds();
  
  // Rate question
  Future<Either<Failure, void>> rateQuestion({
    required String questionId,
    required int rating,
    String? comment,
  });
  
  // Report question
  Future<Either<Failure, void>> reportQuestion({
    required String questionId,
    required String reason,
    String? details,
  });
  
  // Cache operations
  Future<Either<Failure, void>> cacheQuestions(List<Question> questions);
  Future<Either<Failure, List<Question>>> getCachedQuestions();
  Future<Either<Failure, void>> clearCache();
}

class QuestionListResponse {
  final List<Question> questions;
  final int totalCount;
  final int currentPage;
  final int totalPages;
  final bool hasMore;

  QuestionListResponse({
    required this.questions,
    required this.totalCount,
    required this.currentPage,
    required this.totalPages,
  }) : hasMore = currentPage < totalPages;
}

class QuestionFilters {
  final List<QuestionType>? types;
  final List<DifficultyLevel>? difficulties;
  final List<String>? subjects;
  final List<int>? grades;
  final List<String>? tags;
  final QuestionStatus? status;
  final bool? hasImages;
  final bool? hasSolution;
  final DateTime? createdAfter;
  final DateTime? createdBefore;

  QuestionFilters({
    this.types,
    this.difficulties,
    this.subjects,
    this.grades,
    this.tags,
    this.status,
    this.hasImages,
    this.hasSolution,
    this.createdAfter,
    this.createdBefore,
  });

  Map<String, dynamic> toMap() {
    return {
      if (types != null) 'types': types!.map((t) => t.name).toList(),
      if (difficulties != null) 'difficulties': difficulties!.map((d) => d.name).toList(),
      if (subjects != null) 'subjects': subjects,
      if (grades != null) 'grades': grades,
      if (tags != null) 'tags': tags,
      if (status != null) 'status': status!.name,
      if (hasImages != null) 'has_images': hasImages,
      if (hasSolution != null) 'has_solution': hasSolution,
      if (createdAfter != null) 'created_after': createdAfter!.toIso8601String(),
      if (createdBefore != null) 'created_before': createdBefore!.toIso8601String(),
    };
  }
}

