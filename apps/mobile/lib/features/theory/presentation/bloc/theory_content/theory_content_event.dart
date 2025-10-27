part of 'theory_content_bloc.dart';

abstract class TheoryContentEvent extends Equatable {
  const TheoryContentEvent();

  @override
  List<Object?> get props => [];
}

class TheoryContentLoadRequested extends TheoryContentEvent {
  final String? id;
  final String? slug;
  final bool preferOffline;

  const TheoryContentLoadRequested({
    this.id,
    this.slug,
    this.preferOffline = false,
  });

  @override
  List<Object?> get props => [id, slug, preferOffline];
}

class TheoryContentBookmarkToggled extends TheoryContentEvent {
  final String postId;

  const TheoryContentBookmarkToggled(this.postId);

  @override
  List<Object> get props => [postId];
}

class TheoryContentDownloadRequested extends TheoryContentEvent {
  final String postId;

  const TheoryContentDownloadRequested(this.postId);

  @override
  List<Object> get props => [postId];
}

class TheoryContentNavigateRequested extends TheoryContentEvent {
  final bool isNext;

  const TheoryContentNavigateRequested({required this.isNext});

  @override
  List<Object> get props => [isNext];
}

