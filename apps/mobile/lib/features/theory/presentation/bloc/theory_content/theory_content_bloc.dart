import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/features/theory/domain/entities/theory_content.dart';
import 'package:mobile/features/theory/domain/repositories/theory_repository.dart';
import 'package:mobile/features/theory/domain/usecases/get_theory_content_usecase.dart';
import 'package:mobile/features/theory/data/models/theory_post_model.dart';
import 'package:mobile/core/utils/logger.dart';

part 'theory_content_event.dart';
part 'theory_content_state.dart';

class TheoryContentBloc extends Bloc<TheoryContentEvent, TheoryContentState> {
  final GetTheoryContentUseCase getTheoryContentUseCase;
  final TheoryRepository repository;

  TheoryContentBloc({
    required this.getTheoryContentUseCase,
    required this.repository,
  }) : super(TheoryContentInitial()) {
    on<TheoryContentLoadRequested>(_onContentLoadRequested);
    on<TheoryContentBookmarkToggled>(_onBookmarkToggled);
    on<TheoryContentDownloadRequested>(_onDownloadRequested);
    on<TheoryContentNavigateRequested>(_onNavigateRequested);
  }

  Future<void> _onContentLoadRequested(
    TheoryContentLoadRequested event,
    Emitter<TheoryContentState> emit,
  ) async {
    emit(TheoryContentLoading());

    final result = await getTheoryContentUseCase(
      GetTheoryContentParams(
        id: event.id,
        slug: event.slug,
        preferOffline: event.preferOffline,
      ),
    );

    await result.fold(
      (failure) async {
        AppLogger.error('Failed to load theory content', failure.message);
        emit(TheoryContentError(failure.message));
      },
      (post) async {
        // Check if bookmarked
        final bookmarksResult = await repository.getBookmarkedIds();
        final isBookmarked = bookmarksResult.fold(
          (failure) => false,
          (ids) => ids.contains(post.id),
        );

        AppLogger.info('Loaded theory post: ${post.title}');

        emit(TheoryContentLoaded(
          post: post,
          isBookmarked: isBookmarked,
          previousPost: null,
          nextPost: null,
        ));
      },
    );
  }

  Future<void> _onBookmarkToggled(
    TheoryContentBookmarkToggled event,
    Emitter<TheoryContentState> emit,
  ) async {
    if (state is TheoryContentLoaded) {
      final currentState = state as TheoryContentLoaded;

      // Optimistic update
      emit(currentState.copyWith(
        isBookmarked: !currentState.isBookmarked,
      ));

      // Actual API call
      final result = currentState.isBookmarked
          ? await repository.bookmarkPost(event.postId)
          : await repository.unbookmarkPost(event.postId);

      result.fold(
        (failure) => emit(currentState),
        (_) {},
      );
    }
  }

  Future<void> _onDownloadRequested(
    TheoryContentDownloadRequested event,
    Emitter<TheoryContentState> emit,
  ) async {
    if (state is TheoryContentLoaded) {
      final currentState = state as TheoryContentLoaded;

      final result = await repository.downloadPost(event.postId);

      result.fold(
        (failure) {
          AppLogger.error('Download failed', failure.message);
        },
        (_) {
          AppLogger.info('Theory post downloaded');
          // Update post as downloaded using copyWith
          final updatedPost = currentState.post.copyWith(
            isDownloaded: true,
          ) as TheoryPost;

          emit(currentState.copyWith(post: updatedPost));
        },
      );
    }
  }

  Future<void> _onNavigateRequested(
    TheoryContentNavigateRequested event,
    Emitter<TheoryContentState> emit,
  ) async {
    if (state is TheoryContentLoaded) {
      final targetPost = event.isNext
          ? (state as TheoryContentLoaded).nextPost
          : (state as TheoryContentLoaded).previousPost;

      if (targetPost != null) {
        add(TheoryContentLoadRequested(id: targetPost.id));
      }
    }
  }
}

