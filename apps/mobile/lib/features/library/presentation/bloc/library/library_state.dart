part of 'library_bloc.dart';

abstract class LibraryState extends Equatable {
  const LibraryState();

  @override
  List<Object?> get props => [];
}

class LibraryInitial extends LibraryState {}

class LibraryLoading extends LibraryState {}

class LibraryLoaded extends LibraryState {
  final List<LibraryItem> documents;
  final List<LibraryCategory> categories;
  final int currentPage;
  final int totalPages;
  final int totalCount;
  final bool hasMore;
  final bool isLoadingMore;
  final String? selectedCategoryId;
  final String? search;
  final List<String> tags;
  final LibrarySort sortBy;
  final Set<String> bookmarkedIds;
  final List<LibraryItem> recentDocuments;
  final List<LibraryItem> popularDocuments;

  const LibraryLoaded({
    required this.documents,
    required this.categories,
    required this.currentPage,
    required this.totalPages,
    required this.totalCount,
    required this.hasMore,
    this.isLoadingMore = false,
    this.selectedCategoryId,
    this.search,
    this.tags = const [],
    this.sortBy = LibrarySort.newest,
    this.bookmarkedIds = const {},
    this.recentDocuments = const [],
    this.popularDocuments = const [],
  });

  LibraryLoaded copyWith({
    List<LibraryItem>? documents,
    List<LibraryCategory>? categories,
    int? currentPage,
    int? totalPages,
    int? totalCount,
    bool? hasMore,
    bool? isLoadingMore,
    String? selectedCategoryId,
    String? search,
    List<String>? tags,
    LibrarySort? sortBy,
    Set<String>? bookmarkedIds,
    List<LibraryItem>? recentDocuments,
    List<LibraryItem>? popularDocuments,
  }) {
    return LibraryLoaded(
      documents: documents ?? this.documents,
      categories: categories ?? this.categories,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      totalCount: totalCount ?? this.totalCount,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      search: search ?? this.search,
      tags: tags ?? this.tags,
      sortBy: sortBy ?? this.sortBy,
      bookmarkedIds: bookmarkedIds ?? this.bookmarkedIds,
      recentDocuments: recentDocuments ?? this.recentDocuments,
      popularDocuments: popularDocuments ?? this.popularDocuments,
    );
  }

  @override
  List<Object?> get props => [
    documents,
    categories,
    currentPage,
    totalPages,
    totalCount,
    hasMore,
    isLoadingMore,
    selectedCategoryId,
    search,
    tags,
    sortBy,
    bookmarkedIds,
    recentDocuments,
    popularDocuments,
  ];
}

class LibraryError extends LibraryState {
  final String message;

  const LibraryError(this.message);

  @override
  List<Object> get props => [message];
}

