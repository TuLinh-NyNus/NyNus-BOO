import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/errors/exceptions.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';
import 'package:mobile/features/questions/domain/repositories/question_repository.dart';
import 'package:mobile/features/questions/data/datasources/question_remote_datasource.dart';
import 'package:mobile/features/questions/data/datasources/question_local_datasource.dart';
import 'package:mobile/features/questions/data/models/question_model.dart';
import 'package:mobile/core/storage/models/sync_action.dart';
import 'package:mobile/core/storage/sync_manager.dart';

class QuestionRepositoryImpl implements QuestionRepository {
  final QuestionRemoteDataSource remoteDataSource;
  final QuestionLocalDataSource localDataSource;
  final SyncManager syncManager;

  QuestionRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.syncManager,
  });

  @override
  Future<Either<Failure, QuestionListResponse>> getQuestions({
    required int page,
    required int limit,
    String? search,
    QuestionFilters? filters,
    String? sortBy,
  }) async {
    try {
      final response = await remoteDataSource.getQuestions(
        page: page,
        limit: limit,
        search: search,
        filters: filters?.toMap(),
        sortBy: sortBy,
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      // Try cache
      return getCachedQuestions();
    } on NetworkException {
      return getCachedQuestions();
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Question>> getQuestion(String id) async {
    try {
      // Try cache first
      final cached = await localDataSource.getCachedQuestion(id);
      if (cached != null) {
        return Right(cached);
      }
      
      final response = await remoteDataSource.getQuestion(id);
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, QuestionListResponse>> searchQuestions({
    required String query,
    required int page,
    required int limit,
    QuestionFilters? filters,
  }) async {
    try {
      final response = await remoteDataSource.searchQuestions(
        query: query,
        page: page,
        limit: limit,
        filters: filters?.toMap(),
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, QuestionListResponse>> getQuestionsByCode({
    required String code,
    required int page,
    required int limit,
  }) async {
    try {
      final response = await remoteDataSource.getQuestionsByCode(
        code: code,
        page: page,
        limit: limit,
      );
      
      // Will implement after proto generation
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> bookmarkQuestion(String questionId) async {
    try {
      // Save locally first (offline-first)
      await localDataSource.saveBookmark(questionId);
      
      // Queue for sync
      await syncManager.queueAction(
        type: SyncActionType.bookmarkQuestion,
        data: {'questionId': questionId},
      );
      
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> unbookmarkQuestion(String questionId) async {
    try {
      await localDataSource.removeBookmark(questionId);
      
      // Queue for sync
      await syncManager.queueAction(
        type: SyncActionType.unbookmarkQuestion,
        data: {'questionId': questionId},
      );
      
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getBookmarkedIds() async {
    try {
      final bookmarks = await localDataSource.getBookmarkedIds();
      return Right(bookmarks);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> rateQuestion({
    required String questionId,
    required int rating,
    String? comment,
  }) async {
    try {
      // Queue for sync
      await syncManager.queueAction(
        type: SyncActionType.rateQuestion,
        data: {
          'questionId': questionId,
          'rating': rating,
          'comment': comment,
        },
      );
      
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> reportQuestion({
    required String questionId,
    required String reason,
    String? details,
  }) async {
    // Will implement with backend endpoint
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> cacheQuestions(List<Question> questions) async {
    try {
      final models = questions
          .map((q) => q is QuestionModel ? q : QuestionModel(
                id: q.id,
                content: q.content,
                rawContent: q.rawContent,
                subContent: q.subContent,
                type: q.type,
                difficulty: q.difficulty,
                status: q.status,
                source: q.source,
                solution: q.solution,
                solutionDetail: q.solutionDetail,
                answers: q.answers,
                questionCode: q.questionCode,
                tags: q.tags,
                images: q.images,
                usageCount: q.usageCount,
                averageRating: q.averageRating,
                createdBy: q.createdBy,
                createdAt: q.createdAt,
                updatedAt: q.updatedAt,
              ))
          .toList();
      
      await localDataSource.cacheQuestions(models);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Question>>> getCachedQuestions() async {
    try {
      final questions = await localDataSource.getCachedQuestions();
      return Right(questions);
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

