part of 'question_bloc.dart';

abstract class QuestionEvent extends Equatable {
  const QuestionEvent();

  @override
  List<Object?> get props => [];
}

// Load questions
class QuestionsLoadRequested extends QuestionEvent {
  final int page;
  final String? search;
  final QuestionFilters? filters;
  final String? sortBy;
  
  const QuestionsLoadRequested({
    this.page = 1,
    this.search,
    this.filters,
    this.sortBy,
  });
  
  @override
  List<Object?> get props => [page, search, filters, sortBy];
}

// Load more (pagination)
class QuestionsLoadMoreRequested extends QuestionEvent {}

// Refresh
class QuestionsRefreshRequested extends QuestionEvent {}

// Search
class QuestionsSearchRequested extends QuestionEvent {
  final String query;
  
  const QuestionsSearchRequested(this.query);
  
  @override
  List<Object> get props => [query];
}

// Filter
class QuestionsFilterChanged extends QuestionEvent {
  final QuestionFilters filters;
  
  const QuestionsFilterChanged(this.filters);
  
  @override
  List<Object> get props => [filters];
}

// Sort
class QuestionsSortChanged extends QuestionEvent {
  final String sortBy;
  
  const QuestionsSortChanged(this.sortBy);
  
  @override
  List<Object> get props => [sortBy];
}

// Bookmark
class QuestionBookmarkToggled extends QuestionEvent {
  final String questionId;
  
  const QuestionBookmarkToggled(this.questionId);
  
  @override
  List<Object> get props => [questionId];
}

// View detail
class QuestionDetailRequested extends QuestionEvent {
  final String questionId;
  
  const QuestionDetailRequested(this.questionId);
  
  @override
  List<Object> get props => [questionId];
}

// Rate
class QuestionRateRequested extends QuestionEvent {
  final String questionId;
  final int rating;
  final String? comment;
  
  const QuestionRateRequested({
    required this.questionId,
    required this.rating,
    this.comment,
  });
  
  @override
  List<Object?> get props => [questionId, rating, comment];
}

// Report
class QuestionReportRequested extends QuestionEvent {
  final String questionId;
  final String reason;
  final String? details;
  
  const QuestionReportRequested({
    required this.questionId,
    required this.reason,
    this.details,
  });
  
  @override
  List<Object?> get props => [questionId, reason, details];
}

