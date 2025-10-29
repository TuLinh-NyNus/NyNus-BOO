import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/questions/presentation/bloc/question_bloc.dart';
import 'package:mobile/features/questions/presentation/widgets/question_list.dart';
import 'package:mobile/shared/widgets/shimmer_loading.dart';
import 'package:mobile/shared/widgets/empty_state.dart';

class QuestionsPage extends StatefulWidget {
  final Map<String, dynamic>? initialFilters;
  
  const QuestionsPage({
    super.key,
    this.initialFilters,
  });

  @override
  State<QuestionsPage> createState() => _QuestionsPageState();
}

class _QuestionsPageState extends State<QuestionsPage> {
  @override
  void initState() {
    super.initState();
    // Load questions on init
    context.read<QuestionBloc>().add(const QuestionsLoadRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Questions List
          Expanded(
            child: BlocBuilder<QuestionBloc, QuestionState>(
              builder: (context, state) {
                if (state is QuestionLoading) {
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: 5, // Show 5 shimmer cards
                    itemBuilder: (context, index) => const QuestionCardShimmer(),
                  );
                }
                
                if (state is QuestionsLoaded) {
                  if (state.questions.isEmpty) {
                    return QuestionsEmptyState(
                      hasFilters: false, // TODO: Check if filters are applied
                      onRefresh: () {
                        context.read<QuestionBloc>().add(
                          const QuestionsLoadRequested(),
                        );
                      },
                      onClearFilters: () {
                        // TODO: Clear filters
                        context.read<QuestionBloc>().add(
                          const QuestionsLoadRequested(),
                        );
                      },
                    );
                  }
                  
                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<QuestionBloc>().add(
                        QuestionsRefreshRequested(),
                      );
                      await Future.delayed(const Duration(seconds: 1));
                    },
                    child: QuestionList(
                      questions: state.questions,
                      hasMore: state.hasMore,
                      isLoadingMore: state.isLoadingMore,
                      bookmarkedIds: state.bookmarkedIds,
                      onLoadMore: () {
                        context.read<QuestionBloc>().add(
                          QuestionsLoadMoreRequested(),
                        );
                      },
                      onBookmarkToggle: (questionId) {
                        context.read<QuestionBloc>().add(
                          QuestionBookmarkToggled(questionId),
                        );
                      },
                    ),
                  );
                }
                
                if (state is QuestionError) {
                  return ErrorState(
                    title: 'Đã xảy ra lỗi',
                    description: state.message,
                    onRetry: () {
                      context.read<QuestionBloc>().add(
                        const QuestionsLoadRequested(),
                      );
                    },
                  );
                }
                
                return const SizedBox();
              },
            ),
          ),
        ],
      ),
    );
  }
}

