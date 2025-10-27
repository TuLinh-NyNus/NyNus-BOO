import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/questions/presentation/bloc/question_bloc.dart';
import 'package:mobile/features/questions/presentation/widgets/question_list.dart';

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
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                }
                
                if (state is QuestionsLoaded) {
                  if (state.questions.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.quiz_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Không tìm thấy câu hỏi',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Thử thay đổi bộ lọc hoặc tìm kiếm',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                          ),
                        ],
                      ),
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
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Theme.of(context).colorScheme.error,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Đã xảy ra lỗi',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          state.message,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: () {
                            context.read<QuestionBloc>().add(
                              const QuestionsLoadRequested(),
                            );
                          },
                          child: const Text('Thử lại'),
                        ),
                      ],
                    ),
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

