part of 'library_bloc.dart';

abstract class LibraryEvent extends Equatable {
  const LibraryEvent();

  @override
  List<Object?> get props => [];
}

class LibraryLoadRequested extends LibraryEvent {
  final int page;
  final String? categoryId;
  final String? search;
  final List<String>? tags;
  final LibrarySort? sortBy;

  const LibraryLoadRequested({
    this.page = 1,
    this.categoryId,
    this.search,
    this.tags,
    this.sortBy,
  });

  @override
  List<Object?> get props => [page, categoryId, search, tags, sortBy];
}

class LibraryLoadMoreRequested extends LibraryEvent {}

class LibraryRefreshRequested extends LibraryEvent {}

class LibrarySearchRequested extends LibraryEvent {
  final String query;

  const LibrarySearchRequested(this.query);

  @override
  List<Object> get props => [query];
}

class LibraryCategoryChanged extends LibraryEvent {
  final String? categoryId;

  const LibraryCategoryChanged({this.categoryId});

  @override
  List<Object?> get props => [categoryId];
}

class LibrarySortChanged extends LibraryEvent {
  final LibrarySort sortBy;

  const LibrarySortChanged({required this.sortBy});

  @override
  List<Object> get props => [sortBy];
}

class LibraryDocumentDownloadRequested extends LibraryEvent {
  final LibraryItem document;

  const LibraryDocumentDownloadRequested(this.document);

  @override
  List<Object> get props => [document];
}

class LibraryDocumentBookmarkToggled extends LibraryEvent {
  final String documentId;

  const LibraryDocumentBookmarkToggled(this.documentId);

  @override
  List<Object> get props => [documentId];
}

