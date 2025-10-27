import 'package:flutter/material.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';
import 'package:mobile/features/questions/presentation/widgets/question_card.dart';

class QuestionList extends StatefulWidget {
  final List<Question> questions;
  final bool hasMore;
  final bool isLoadingMore;
  final Set<String> bookmarkedIds;
  final VoidCallback onLoadMore;
  final Function(String) onBookmarkToggle;

  const QuestionList({
    super.key,
    required this.questions,
    required this.hasMore,
    required this.isLoadingMore,
    required this.bookmarkedIds,
    required this.onLoadMore,
    required this.onBookmarkToggle,
  });

  @override
  State<QuestionList> createState() => _QuestionListState();
}

class _QuestionListState extends State<QuestionList> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom && widget.hasMore && !widget.isLoadingMore) {
      widget.onLoadMore();
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: widget.questions.length + (widget.isLoadingMore ? 1 : 0),
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemBuilder: (context, index) {
        if (index >= widget.questions.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        final question = widget.questions[index];
        final isBookmarked = widget.bookmarkedIds.contains(question.id);
        
        return QuestionCard(
          question: question,
          isBookmarked: isBookmarked,
          onTap: () {
            // Navigate to detail
            // context.push('/questions/${question.id}');
          },
          onBookmarkToggle: () {
            widget.onBookmarkToggle(question.id);
          },
        );
      },
    );
  }
}

