import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/features/library/domain/entities/library_item.dart';
import 'package:mobile/features/library/domain/repositories/library_repository.dart';
import 'package:mobile/features/library/domain/usecases/get_documents_usecase.dart';
import 'package:mobile/features/library/domain/usecases/download_document_usecase.dart';
import 'package:mobile/core/utils/logger.dart';

part 'library_event.dart';
part 'library_state.dart';

class LibraryBloc extends Bloc<LibraryEvent, LibraryState> {
  final GetDocumentsUseCase getDocumentsUseCase;
  final DownloadDocumentUseCase downloadDocumentUseCase;
  final LibraryRepository repository;

  LibraryBloc({
    required this.getDocumentsUseCase,
    required this.downloadDocumentUseCase,
    required this.repository,
  }) : super(LibraryInitial()) {
    on<LibraryLoadRequested>(_onLibraryLoadRequested);
    on<LibraryLoadMoreRequested>(_onLibraryLoadMoreRequested);
    on<LibraryRefreshRequested>(_onLibraryRefreshRequested);
    on<LibrarySearchRequested>(_onLibrarySearchRequested);
    on<LibraryCategoryChanged>(_onLibraryCategoryChanged);
    on<LibrarySortChanged>(_onLibrarySortChanged);
    on<LibraryDocumentDownloadRequested>(_onDocumentDownloadRequested);
    on<LibraryDocumentBookmarkToggled>(_onDocumentBookmarkToggled);
  }

  Future<void> _onLibraryLoadRequested(
    LibraryLoadRequested event,
    Emitter<LibraryState> emit,
  ) async {
    emit(LibraryLoading());

    try {
      // Load categories
      final categoriesResult = await repository.getCategories();
      final categories = categoriesResult.fold(
        (failure) => <LibraryCategory>[],
        (categories) => categories,
      );

      // Load bookmarked IDs
      final bookmarksResult = await repository.getBookmarkedIds();
      final bookmarkedIds = bookmarksResult.fold(
        (failure) => <String>{},
        (ids) => ids.toSet(),
      );

      // Load documents
      final result = await getDocumentsUseCase(GetDocumentsParams(
        page: event.page,
        categoryId: event.categoryId,
        search: event.search,
        tags: event.tags,
        sortBy: event.sortBy,
      ));

      result.fold(
        (failure) {
          AppLogger.error('Failed to load library documents', failure.message);
          emit(LibraryError(failure.message));
        },
        (response) {
          AppLogger.info('Loaded ${response.documents.length} library documents');
          emit(LibraryLoaded(
            documents: response.documents,
            categories: categories,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalCount: response.totalCount,
            hasMore: response.hasMore,
            selectedCategoryId: event.categoryId,
            search: event.search,
            tags: event.tags ?? [],
            sortBy: event.sortBy ?? LibrarySort.newest,
            bookmarkedIds: bookmarkedIds,
          ));
        },
      );

      // Load recent and popular documents
      if (event.page == 1 && event.categoryId == null && event.search == null) {
        _loadAdditionalData();
      }
    } catch (e) {
      AppLogger.error('Error loading library', e);
      emit(LibraryError(e.toString()));
    }
  }

  Future<void> _loadAdditionalData() async {
    if (state is LibraryLoaded) {
      final currentState = state as LibraryLoaded;

      // Load recent documents
      final recentResult = await repository.getRecentDocuments();
      final recentDocs = recentResult.fold(
        (failure) => <LibraryItem>[],
        (docs) => docs,
      );

      // Load popular documents
      final popularResult = await repository.getPopularDocuments();
      final popularDocs = popularResult.fold(
        (failure) => <LibraryItem>[],
        (docs) => docs,
      );

      emit(currentState.copyWith(
        recentDocuments: recentDocs,
        popularDocuments: popularDocs,
      ));
    }
  }

  Future<void> _onLibraryLoadMoreRequested(
    LibraryLoadMoreRequested event,
    Emitter<LibraryState> emit,
  ) async {
    if (state is LibraryLoaded) {
      final currentState = state as LibraryLoaded;
      
      if (!currentState.hasMore || currentState.isLoadingMore) return;

      emit(currentState.copyWith(isLoadingMore: true));

      final result = await getDocumentsUseCase(GetDocumentsParams(
        page: currentState.currentPage + 1,
        categoryId: currentState.selectedCategoryId,
        search: currentState.search,
        tags: currentState.tags.isEmpty ? null : currentState.tags,
        sortBy: currentState.sortBy,
      ));

      result.fold(
        (failure) => emit(currentState.copyWith(isLoadingMore: false)),
        (response) => emit(currentState.copyWith(
          documents: [...currentState.documents, ...response.documents],
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalCount: response.totalCount,
          hasMore: response.hasMore,
          isLoadingMore: false,
        )),
      );
    }
  }

  Future<void> _onLibraryRefreshRequested(
    LibraryRefreshRequested event,
    Emitter<LibraryState> emit,
  ) async {
    if (state is LibraryLoaded) {
      final currentState = state as LibraryLoaded;
      add(LibraryLoadRequested(
        page: 1,
        categoryId: currentState.selectedCategoryId,
        search: currentState.search,
        tags: currentState.tags.isEmpty ? null : currentState.tags,
        sortBy: currentState.sortBy,
      ));
    } else {
      add(const LibraryLoadRequested());
    }
  }

  Future<void> _onLibrarySearchRequested(
    LibrarySearchRequested event,
    Emitter<LibraryState> emit,
  ) async {
    emit(LibraryLoading());
    add(LibraryLoadRequested(
      page: 1,
      search: event.query,
    ));
  }

  Future<void> _onLibraryCategoryChanged(
    LibraryCategoryChanged event,
    Emitter<LibraryState> emit,
  ) async {
    add(LibraryLoadRequested(
      page: 1,
      categoryId: event.categoryId,
    ));
  }

  Future<void> _onLibrarySortChanged(
    LibrarySortChanged event,
    Emitter<LibraryState> emit,
  ) async {
    if (state is LibraryLoaded) {
      final currentState = state as LibraryLoaded;
      add(LibraryLoadRequested(
        page: 1,
        categoryId: currentState.selectedCategoryId,
        search: currentState.search,
        tags: currentState.tags.isEmpty ? null : currentState.tags,
        sortBy: event.sortBy,
      ));
    }
  }

  Future<void> _onDocumentDownloadRequested(
    LibraryDocumentDownloadRequested event,
    Emitter<LibraryState> emit,
  ) async {
    final result = await downloadDocumentUseCase(
      DownloadDocumentParams(document: event.document),
    );

    result.fold(
      (failure) {
        AppLogger.error('Download failed', failure.message);
      },
      (downloadTask) {
        AppLogger.info('Download started: ${event.document.title}');
      },
    );
  }

  Future<void> _onDocumentBookmarkToggled(
    LibraryDocumentBookmarkToggled event,
    Emitter<LibraryState> emit,
  ) async {
    if (state is LibraryLoaded) {
      final currentState = state as LibraryLoaded;
      final isBookmarked = currentState.bookmarkedIds.contains(event.documentId);

      // Optimistic update
      final newBookmarks = Set<String>.from(currentState.bookmarkedIds);
      if (isBookmarked) {
        newBookmarks.remove(event.documentId);
      } else {
        newBookmarks.add(event.documentId);
      }
      emit(currentState.copyWith(bookmarkedIds: newBookmarks));

      // Actual API call
      final result = isBookmarked
          ? await repository.unbookmarkDocument(event.documentId)
          : await repository.bookmarkDocument(event.documentId);

      result.fold(
        (failure) => emit(currentState),
        (_) {},
      );
    }
  }
}

