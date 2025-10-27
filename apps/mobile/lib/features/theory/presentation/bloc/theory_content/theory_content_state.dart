part of 'theory_content_bloc.dart';

abstract class TheoryContentState extends Equatable {
  const TheoryContentState();

  @override
  List<Object?> get props => [];
}

class TheoryContentInitial extends TheoryContentState {}

class TheoryContentLoading extends TheoryContentState {}

class TheoryContentLoaded extends TheoryContentState {
  final TheoryPost post;
  final bool isBookmarked;
  final TheoryPost? previousPost;
  final TheoryPost? nextPost;

  const TheoryContentLoaded({
    required this.post,
    required this.isBookmarked,
    this.previousPost,
    this.nextPost,
  });

  TheoryContentLoaded copyWith({
    TheoryPost? post,
    bool? isBookmarked,
    TheoryPost? previousPost,
    TheoryPost? nextPost,
  }) {
    return TheoryContentLoaded(
      post: post ?? this.post,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      previousPost: previousPost ?? this.previousPost,
      nextPost: nextPost ?? this.nextPost,
    );
  }

  @override
  List<Object?> get props => [post, isBookmarked, previousPost, nextPost];
}

class TheoryContentError extends TheoryContentState {
  final String message;

  const TheoryContentError(this.message);

  @override
  List<Object> get props => [message];
}

