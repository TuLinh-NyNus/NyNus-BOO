part of 'question_bloc.dart';

abstract class QuestionState extends Equatable {
  const QuestionState();

  @override
  List<Object?> get props => [];
}

// Initial
class QuestionInitial extends QuestionState {}

// Loading
class QuestionLoading extends QuestionState {}

// Loaded
class QuestionsLoaded extends QuestionState {
  final List<Question> questions;
  final int currentPage;
  final int totalPages;
  final int totalCount;
  final bool hasMore;
  final bool isLoadingMore;
  final String? search;
  final QuestionFilters? filters;
  final String? sortBy;
  final Set<String> bookmarkedIds;

  const QuestionsLoaded({
    required this.questions,
    required this.currentPage,
    required this.totalPages,
    required this.totalCount,
    required this.hasMore,
    this.isLoadingMore = false,
    this.search,
    this.filters,
    this.sortBy,
    this.bookmarkedIds = const {},
  });

  QuestionsLoaded copyWith({
    List<Question>? questions,
    int? currentPage,
    int? totalPages,
    int? totalCount,
    bool? hasMore,
    bool? isLoadingMore,
    String? search,
    QuestionFilters? filters,
    String? sortBy,
    Set<String>? bookmarkedIds,
  }) {
    return QuestionsLoaded(
      questions: questions ?? this.questions,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      totalCount: totalCount ?? this.totalCount,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      search: search ?? this.search,
      filters: filters ?? this.filters,
      sortBy: sortBy ?? this.sortBy,
      bookmarkedIds: bookmarkedIds ?? this.bookmarkedIds,
    );
  }

  @override
  List<Object?> get props => [
    questions,
    currentPage,
    totalPages,
    totalCount,
    hasMore,
    isLoadingMore,
    search,
    filters,
    sortBy,
    bookmarkedIds,
  ];
}

// Error
class QuestionError extends QuestionState {
  final String message;
  
  const QuestionError(this.message);
  
  @override
  List<Object> get props => [message];
}

// Detail Loading
class QuestionDetailLoading extends QuestionState {
  final String questionId;
  
  const QuestionDetailLoading(this.questionId);
  
  @override
  List<Object> get props => [questionId];
}

// Detail Loaded
class QuestionDetailLoaded extends QuestionState {
  final Question question;
  final bool isBookmarked;
  
  const QuestionDetailLoaded({
    required this.question,
    required this.isBookmarked,
  });
  
  QuestionDetailLoaded copyWith({
    Question? question,
    bool? isBookmarked,
  }) {
    return QuestionDetailLoaded(
      question: question ?? this.question,
      isBookmarked: isBookmarked ?? this.isBookmarked,
    );
  }
  
  @override
  List<Object> get props => [question, isBookmarked];
}

