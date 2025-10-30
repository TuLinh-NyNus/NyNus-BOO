import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/exams/presentation/bloc/exam_bloc.dart';
import 'package:mobile/features/exams/presentation/widgets/exam_card.dart';
import 'package:mobile/features/exams/presentation/widgets/exam_filters.dart';
import 'package:mobile/shared/widgets/shimmer_loading.dart';
import 'package:mobile/shared/widgets/empty_state.dart';

class ExamsPage extends StatefulWidget {
  final Map<String, dynamic>? initialFilters;
  
  const ExamsPage({
    super.key,
    this.initialFilters,
  });

  @override
  State<ExamsPage> createState() => _ExamsPageState();
}

class _ExamsPageState extends State<ExamsPage> {
  @override
  void initState() {
    super.initState();
    // Load exams on init
    context.read<ExamBloc>().add(const ExamsLoadRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Filter Section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const ExamFilters(),
          ),
          
          // Exams List
          Expanded(
            child: BlocBuilder<ExamBloc, ExamState>(
              builder: (context, state) {
                if (state is ExamLoading) {
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: 4, // Show 4 shimmer cards
                    itemBuilder: (context, index) => const ExamCardShimmer(),
                  );
                }
                
                if (state is ExamsLoaded) {
                  if (state.exams.isEmpty) {
                    return ExamsEmptyState(
                      hasFilters: false, // TODO: Check if filters are applied
                      onRefresh: () {
                        context.read<ExamBloc>().add(
                          const ExamsLoadRequested(),
                        );
                      },
                      onClearFilters: () {
                        // TODO: Clear filters
                        context.read<ExamBloc>().add(
                          const ExamsLoadRequested(),
                        );
                      },
                    );
                  }
                  
                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<ExamBloc>().add(
                        ExamsRefreshRequested(),
                      );
                      await Future.delayed(const Duration(seconds: 1));
                    },
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: state.exams.length + (state.isLoadingMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index >= state.exams.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        
                        final exam = state.exams[index];
                        
                        return ExamCard(
                          exam: exam,
                          onTap: () {
                            // Navigate to exam detail
                            // context.push('/exams/${exam.id}');
                            _showExamDetail(context, exam);
                          },
                          onStart: () {
                            _startExam(context, exam);
                          },
                        );
                      },
                    ),
                  );
                }
                
                if (state is ExamError) {
                  return ErrorState(
                    title: 'Đã xảy ra lỗi',
                    description: state.message,
                    onRetry: () {
                      context.read<ExamBloc>().add(
                        const ExamsLoadRequested(),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showFilterBottomSheet(context);
        },
        child: const Icon(Icons.filter_list),
      ),
    );
  }

  void _showExamDetail(BuildContext context, dynamic exam) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              
              // Title
              Text(
                exam.title,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              
              // Info cards
              Row(
                children: [
                  Expanded(
                    child: _buildInfoCard(
                      context,
                      Icons.timer,
                      '${exam.duration} phút',
                      'Thời gian',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildInfoCard(
                      context,
                      Icons.quiz,
                      '${exam.totalQuestions} câu',
                      'Số câu hỏi',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildInfoCard(
                      context,
                      Icons.grade,
                      '${exam.totalPoints.toInt()} điểm',
                      'Tổng điểm',
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 20),
              
              // Description
              if (exam.description != null) ...[
                Text(
                  'Mô tả',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  exam.description!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
              ],
              
              // Instructions
              if (exam.instructions != null) ...[
                Text(
                  'Hướng dẫn',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  exam.instructions!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
              ],
              
              const Spacer(),
              
              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: FilledButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _startExam(context, exam);
                      },
                      child: const Text('Bắt đầu làm bài'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context,
    IconData icon,
    String value,
    String label,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: Theme.of(context).colorScheme.primary,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  void _startExam(BuildContext context, dynamic exam) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bắt đầu làm bài'),
        content: Text(
          'Bạn có chắc muốn bắt đầu làm đề thi "${exam.title}"?\n\n'
          'Thời gian: ${exam.duration} phút\n'
          'Số câu hỏi: ${exam.totalQuestions} câu',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Navigate to exam taking page
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Tính năng làm bài sẽ sớm có!'),
                ),
              );
            },
            child: const Text('Bắt đầu'),
          ),
        ],
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bộ lọc',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            const Text('Tính năng lọc sẽ sớm có!'),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Đóng'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

