import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';
import 'package:mobile/features/questions/domain/repositories/question_repository.dart';
import 'package:mobile/features/questions/domain/usecases/get_questions_usecase.dart';
import 'package:mobile/features/questions/domain/usecases/search_questions_usecase.dart';
import 'package:mobile/features/questions/domain/usecases/bookmark_question_usecase.dart';
import 'package:mobile/features/questions/domain/usecases/get_question_usecase.dart';
import 'package:mobile/core/utils/logger.dart';

part 'question_event.dart';
part 'question_state.dart';

class QuestionBloc extends Bloc<QuestionEvent, QuestionState> {
  final GetQuestionsUseCase getQuestionsUseCase;
  final SearchQuestionsUseCase searchQuestionsUseCase;
  final BookmarkQuestionUseCase bookmarkQuestionUseCase;
  final GetQuestionUseCase getQuestionUseCase;
  final QuestionRepository repository;

  QuestionBloc({
    required this.getQuestionsUseCase,
    required this.searchQuestionsUseCase,
    required this.bookmarkQuestionUseCase,
    required this.getQuestionUseCase,
    required this.repository,
  }) : super(QuestionInitial()) {
    on<QuestionsLoadRequested>(_onQuestionsLoadRequested);
    on<QuestionsLoadMoreRequested>(_onQuestionsLoadMoreRequested);
    on<QuestionsRefreshRequested>(_onQuestionsRefreshRequested);
    on<QuestionsSearchRequested>(_onQuestionsSearchRequested);
    on<QuestionsFilterChanged>(_onQuestionsFilterChanged);
    on<QuestionsSortChanged>(_onQuestionsSortChanged);
    on<QuestionBookmarkToggled>(_onQuestionBookmarkToggled);
    on<QuestionDetailRequested>(_onQuestionDetailRequested);
    on<QuestionRateRequested>(_onQuestionRateRequested);
    on<QuestionReportRequested>(_onQuestionReportRequested);
  }

  Future<void> _onQuestionsLoadRequested(
    QuestionsLoadRequested event,
    Emitter<QuestionState> emit,
  ) async {
    emit(QuestionLoading());

    try {
      // Get bookmarked IDs
      final bookmarksResult = await repository.getBookmarkedIds();
      final bookmarkedIds = bookmarksResult.fold(
        (failure) => <String>{},
        (ids) => ids.toSet(),
      );

      // Get questions
      final result = await getQuestionsUseCase(GetQuestionsParams(
        page: event.page,
        search: event.search,
        filters: event.filters,
        sortBy: event.sortBy,
      ));

      result.fold(
        (failure) {
          AppLogger.error('Failed to load questions', failure.message);
          emit(QuestionError(failure.message));
        },
        (response) {
          AppLogger.info('Loaded ${response.questions.length} questions');
          emit(QuestionsLoaded(
            questions: response.questions,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalCount: response.totalCount,
            hasMore: response.hasMore,
            search: event.search,
            filters: event.filters,
            sortBy: event.sortBy,
            bookmarkedIds: bookmarkedIds,
          ));
        },
      );

      // Cache questions for offline
      if (result.isRight()) {
        result.fold(
          (failure) => null,
          (response) => repository.cacheQuestions(response.questions),
        );
      }
    } catch (e) {
      AppLogger.error('Error loading questions', e);
      // Try to load from cache
      final cachedResult = await repository.getCachedQuestions();
      cachedResult.fold(
        (failure) => emit(QuestionError(e.toString())),
        (questions) => emit(QuestionsLoaded(
          questions: questions,
          currentPage: 1,
          totalPages: 1,
          totalCount: questions.length,
          hasMore: false,
          bookmarkedIds: {},
        )),
      );
    }
  }

  Future<void> _onQuestionsLoadMoreRequested(
    QuestionsLoadMoreRequested event,
    Emitter<QuestionState> emit,
  ) async {
    if (state is QuestionsLoaded) {
      final currentState = state as QuestionsLoaded;
      
      if (!currentState.hasMore || currentState.isLoadingMore) return;

      emit(currentState.copyWith(isLoadingMore: true));

      final result = await getQuestionsUseCase(GetQuestionsParams(
        page: currentState.currentPage + 1,
        search: currentState.search,
        filters: currentState.filters,
        sortBy: currentState.sortBy,
      ));

      result.fold(
        (failure) => emit(currentState.copyWith(isLoadingMore: false)),
        (response) => emit(currentState.copyWith(
          questions: [...currentState.questions, ...response.questions],
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalCount: response.totalCount,
          hasMore: response.hasMore,
          isLoadingMore: false,
        )),
      );
    }
  }

  Future<void> _onQuestionsRefreshRequested(
    QuestionsRefreshRequested event,
    Emitter<QuestionState> emit,
  ) async {
    if (state is QuestionsLoaded) {
      final currentState = state as QuestionsLoaded;
      add(QuestionsLoadRequested(
        page: 1,
        search: currentState.search,
        filters: currentState.filters,
        sortBy: currentState.sortBy,
      ));
    } else {
      add(const QuestionsLoadRequested());
    }
  }

  Future<void> _onQuestionsSearchRequested(
    QuestionsSearchRequested event,
    Emitter<QuestionState> emit,
  ) async {
    emit(QuestionLoading());

    final result = await searchQuestionsUseCase(SearchQuestionsParams(
      query: event.query,
      page: 1,
    ));

    result.fold(
      (failure) => emit(QuestionError(failure.message)),
      (response) => emit(QuestionsLoaded(
        questions: response.questions,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        hasMore: response.hasMore,
        search: event.query,
        bookmarkedIds: {},
      )),
    );
  }

  Future<void> _onQuestionsFilterChanged(
    QuestionsFilterChanged event,
    Emitter<QuestionState> emit,
  ) async {
    add(QuestionsLoadRequested(
      page: 1,
      filters: event.filters,
      search: state is QuestionsLoaded ? (state as QuestionsLoaded).search : null,
      sortBy: state is QuestionsLoaded ? (state as QuestionsLoaded).sortBy : null,
    ));
  }

  Future<void> _onQuestionsSortChanged(
    QuestionsSortChanged event,
    Emitter<QuestionState> emit,
  ) async {
    add(QuestionsLoadRequested(
      page: 1,
      sortBy: event.sortBy,
      search: state is QuestionsLoaded ? (state as QuestionsLoaded).search : null,
      filters: state is QuestionsLoaded ? (state as QuestionsLoaded).filters : null,
    ));
  }

  Future<void> _onQuestionBookmarkToggled(
    QuestionBookmarkToggled event,
    Emitter<QuestionState> emit,
  ) async {
    if (state is QuestionsLoaded) {
      final currentState = state as QuestionsLoaded;
      final isBookmarked = currentState.bookmarkedIds.contains(event.questionId);

      // Optimistic update
      final newBookmarks = Set<String>.from(currentState.bookmarkedIds);
      if (isBookmarked) {
        newBookmarks.remove(event.questionId);
      } else {
        newBookmarks.add(event.questionId);
      }
      emit(currentState.copyWith(bookmarkedIds: newBookmarks));

      // Actual API call
      final result = await bookmarkQuestionUseCase(BookmarkQuestionParams(
        questionId: event.questionId,
        bookmark: !isBookmarked,
      ));

      result.fold(
        (failure) {
          AppLogger.error('Bookmark toggle failed', failure.message);
          // Revert on failure
          emit(currentState);
        },
        (_) {
          AppLogger.info('Bookmark toggled: $event.questionId');
        },
      );
    } else if (state is QuestionDetailLoaded) {
      final currentState = state as QuestionDetailLoaded;
      final isBookmarked = currentState.isBookmarked;

      // Optimistic update
      emit(currentState.copyWith(isBookmarked: !isBookmarked));

      // Actual API call
      final result = await bookmarkQuestionUseCase(BookmarkQuestionParams(
        questionId: event.questionId,
        bookmark: !isBookmarked,
      ));

      result.fold(
        (failure) => emit(currentState),
        (_) {},
      );
    }
  }

  Future<void> _onQuestionDetailRequested(
    QuestionDetailRequested event,
    Emitter<QuestionState> emit,
  ) async {
    emit(QuestionDetailLoading(event.questionId));

    final result = await getQuestionUseCase(
      GetQuestionParams(questionId: event.questionId),
    );
    final isBookmarkedResult = await repository.getBookmarkedIds();

    result.fold(
      (failure) => emit(QuestionError(failure.message)),
      (question) {
        final isBookmarked = isBookmarkedResult.fold(
          (failure) => false,
          (ids) => ids.contains(event.questionId),
        );
        
        emit(QuestionDetailLoaded(
          question: question,
          isBookmarked: isBookmarked,
        ));
      },
    );
  }

  Future<void> _onQuestionRateRequested(
    QuestionRateRequested event,
    Emitter<QuestionState> emit,
  ) async {
    final result = await repository.rateQuestion(
      questionId: event.questionId,
      rating: event.rating,
      comment: event.comment,
    );

    result.fold(
      (failure) {
        AppLogger.error('Rating failed', failure.message);
      },
      (_) {
        AppLogger.info('Question rated: ${event.rating} stars');
      },
    );
  }

  Future<void> _onQuestionReportRequested(
    QuestionReportRequested event,
    Emitter<QuestionState> emit,
  ) async {
    final result = await repository.reportQuestion(
      questionId: event.questionId,
      reason: event.reason,
      details: event.details,
    );

    result.fold(
      (failure) {
        AppLogger.error('Report failed', failure.message);
      },
      (_) {
        AppLogger.info('Question reported');
      },
    );
  }
}

