import 'package:flutter/material.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/shared/widgets/circular_progress_chart.dart';

class ExamResultPage extends StatelessWidget {
  static const String routeName = '/exam-result';
  
  final String sessionId;
  final bool showReview;
  
  const ExamResultPage({
    super.key,
    required this.sessionId,
    this.showReview = false,
  });

  @override
  Widget build(BuildContext context) {
    // For now, show placeholder
    // Will populate with actual result after proto generation
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kết quả bài thi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => _shareResult(context),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle,
              size: 80,
              color: Colors.green,
            ),
            const SizedBox(height: 24),
            Text(
              'Kết quả sẽ được hiển thị sau khi tích hợp backend',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            FilledButton(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              child: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }

  void _shareResult(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Share functionality will be implemented'),
      ),
    );
  }
}

