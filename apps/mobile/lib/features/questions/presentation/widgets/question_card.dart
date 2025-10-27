import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';
import 'package:mobile/shared/widgets/latex_text.dart';

class QuestionCard extends StatelessWidget {
  final Question question;
  final bool isBookmarked;
  final VoidCallback onTap;
  final VoidCallback onBookmarkToggle;

  const QuestionCard({
    super.key,
    required this.question,
    required this.isBookmarked,
    required this.onTap,
    required this.onBookmarkToggle,
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
              // Header
              Row(
                children: [
                  // Question Type
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getTypeColor(question.type).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getTypeLabel(question.type),
                      style: TextStyle(
                        color: _getTypeColor(question.type),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Difficulty
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getDifficultyColor(question.difficulty)
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getDifficultyLabel(question.difficulty),
                      style: TextStyle(
                        color: _getDifficultyColor(question.difficulty),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  
                  const Spacer(),
                  
                  // Bookmark Button
                  IconButton(
                    icon: Icon(
                      isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                      color: isBookmarked
                          ? Theme.of(context).colorScheme.primary
                          : null,
                    ),
                    onPressed: onBookmarkToggle,
                    tooltip: isBookmarked ? 'Bỏ lưu' : 'Lưu câu hỏi',
                  ),
                  
                  // Share Button
                  IconButton(
                    icon: const Icon(Icons.share),
                    onPressed: () => _shareQuestion(context),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Question Content
              if (question.hasLatex)
                LaTeXText(
                  text: question.content,
                  textStyle: Theme.of(context).textTheme.bodyLarge,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                )
              else
                Text(
                  question.content,
                  style: Theme.of(context).textTheme.bodyLarge,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              
              const SizedBox(height: 12),
              
              // Answers Preview (for MC)
              if (question.type == QuestionType.multipleChoice &&
                  question.answers.isNotEmpty) ...[
                const Divider(),
                const SizedBox(height: 8),
                ...question.answers.take(2).map((answer) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Icon(
                            Icons.radio_button_unchecked,
                            size: 16,
                            color: Colors.grey[600],
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              answer.content,
                              style: Theme.of(context).textTheme.bodySmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    )),
                if (question.answers.length > 2)
                  Text(
                    '... và ${question.answers.length - 2} đáp án khác',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey,
                        ),
                  ),
              ],
              
              const SizedBox(height: 12),
              
              // Footer
              Row(
                children: [
                  // Question Code
                  if (question.questionCode != null) ...[
                    Icon(
                      Icons.label_outline,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      question.questionCode!.displayName,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  
                  // Tags
                  if (question.tags.isNotEmpty) ...[
                    Icon(
                      Icons.tag,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        question.tags.take(2).join(', '),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (question.tags.length > 2)
                      Text(
                        ' +${question.tags.length - 2}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getTypeColor(QuestionType type) {
    switch (type) {
      case QuestionType.multipleChoice:
        return Colors.blue;
      case QuestionType.trueFalse:
        return Colors.orange;
      case QuestionType.shortAnswer:
        return Colors.green;
      case QuestionType.essay:
        return Colors.purple;
      case QuestionType.matching:
        return Colors.teal;
      case QuestionType.fillInBlank:
        return Colors.indigo;
    }
  }

  String _getTypeLabel(QuestionType type) {
    switch (type) {
      case QuestionType.multipleChoice:
        return 'Trắc nghiệm';
      case QuestionType.trueFalse:
        return 'Đúng/Sai';
      case QuestionType.shortAnswer:
        return 'Trả lời ngắn';
      case QuestionType.essay:
        return 'Tự luận';
      case QuestionType.matching:
        return 'Ghép đôi';
      case QuestionType.fillInBlank:
        return 'Điền khuyết';
    }
  }

  Color _getDifficultyColor(DifficultyLevel difficulty) {
    switch (difficulty) {
      case DifficultyLevel.easy:
        return Colors.green;
      case DifficultyLevel.medium:
        return Colors.orange;
      case DifficultyLevel.hard:
        return Colors.red;
      case DifficultyLevel.expert:
        return Colors.purple;
    }
  }

  String _getDifficultyLabel(DifficultyLevel difficulty) {
    switch (difficulty) {
      case DifficultyLevel.easy:
        return 'Dễ';
      case DifficultyLevel.medium:
        return 'Trung bình';
      case DifficultyLevel.hard:
        return 'Khó';
      case DifficultyLevel.expert:
        return 'Chuyên gia';
    }
  }

  void _shareQuestion(BuildContext context) {
    final text = '''
Câu hỏi từ NyNus Exam Bank:

${question.content}

Loại: ${_getTypeLabel(question.type)}
Độ khó: ${_getDifficultyLabel(question.difficulty)}

Tải app để xem đầy đủ!
''';

    // Copy to clipboard
    Clipboard.setData(ClipboardData(text: text));
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã sao chép câu hỏi'),
        duration: Duration(seconds: 2),
      ),
    );
  }
}

