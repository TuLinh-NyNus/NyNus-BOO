import 'package:flutter/material.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';

class ExamCard extends StatelessWidget {
  final Exam exam;
  final VoidCallback onTap;
  final VoidCallback onStart;

  const ExamCard({
    super.key,
    required this.exam,
    required this.onTap,
    required this.onStart,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                children: [
                  // Exam Type Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getTypeColor(exam.type).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getTypeLabel(exam.type),
                      style: TextStyle(
                        color: _getTypeColor(exam.type),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(exam.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getStatusLabel(exam.status),
                      style: TextStyle(
                        color: _getStatusColor(exam.status),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  
                  const Spacer(),
                  
                  // More options
                  IconButton(
                    icon: const Icon(Icons.more_vert),
                    onPressed: () => _showMoreOptions(context),
                    tooltip: 'Tùy chọn khác',
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Title
              Text(
                exam.title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 8),
              
              // Description
              if (exam.description != null)
                Text(
                  exam.description!,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              
              const SizedBox(height: 12),
              
              // Metadata Row
              Row(
                children: [
                  Icon(
                    Icons.timer,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${exam.duration} phút',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(width: 16),
                  
                  Icon(
                    Icons.quiz,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${exam.totalQuestions} câu',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(width: 16),
                  
                  Icon(
                    Icons.grade,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${exam.totalPoints.toInt()} điểm',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Subject and Grade Tags
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  if (exam.subject != null)
                    Chip(
                      label: Text(exam.subject!),
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
                      labelStyle: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 12,
                      ),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  if (exam.grade != null)
                    Chip(
                      label: Text('Lớp ${exam.grade}'),
                      backgroundColor: Theme.of(context).colorScheme.secondaryContainer.withOpacity(0.3),
                      labelStyle: TextStyle(
                        color: Theme.of(context).colorScheme.secondary,
                        fontSize: 12,
                      ),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  if (exam.isOfficial)
                    Chip(
                      label: const Text('Chính thức'),
                      backgroundColor: Colors.orange.withOpacity(0.1),
                      labelStyle: const TextStyle(
                        color: Colors.orange,
                        fontSize: 12,
                      ),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onTap,
                      child: const Text('Xem chi tiết'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: exam.isAvailable ? onStart : null,
                      child: Text(
                        exam.isAvailable ? 'Làm bài' : 'Chưa mở',
                      ),
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

  Color _getTypeColor(ExamType type) {
    switch (type) {
      case ExamType.generated:
        return Colors.blue;
      case ExamType.official:
        return Colors.orange;
    }
  }

  String _getTypeLabel(ExamType type) {
    switch (type) {
      case ExamType.generated:
        return 'Luyện tập';
      case ExamType.official:
        return 'Chính thức';
    }
  }

  Color _getStatusColor(ExamStatus status) {
    switch (status) {
      case ExamStatus.active:
        return Colors.green;
      case ExamStatus.pending:
        return Colors.orange;
      case ExamStatus.inactive:
        return Colors.grey;
      case ExamStatus.archived:
        return Colors.red;
    }
  }

  String _getStatusLabel(ExamStatus status) {
    switch (status) {
      case ExamStatus.active:
        return 'Đang mở';
      case ExamStatus.pending:
        return 'Chờ duyệt';
      case ExamStatus.inactive:
        return 'Tạm ngưng';
      case ExamStatus.archived:
        return 'Đã lưu trữ';
    }
  }

  void _showMoreOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.info_outline),
              title: const Text('Xem chi tiết'),
              onTap: () {
                Navigator.pop(context);
                onTap();
              },
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Lịch sử làm bài'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Navigate to exam history
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Tính năng lịch sử sẽ sớm có!'),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: const Text('Chia sẻ'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Share exam
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Tính năng chia sẻ sẽ sớm có!'),
                  ),
                );
              },
            ),
            if (exam.isOfficial && exam.fileUrl != null)
              ListTile(
                leading: const Icon(Icons.download),
                title: const Text('Tải file PDF'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Download PDF
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Tính năng tải file sẽ sớm có!'),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
