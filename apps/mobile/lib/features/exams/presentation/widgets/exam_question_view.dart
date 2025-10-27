import 'package:flutter/material.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';
import 'package:mobile/shared/widgets/latex_text.dart';

class ExamQuestionView extends StatelessWidget {
  final ExamQuestion examQuestion;
  final QuestionAnswer? currentAnswer;
  final ValueChanged<QuestionAnswer> onAnswerChanged;

  const ExamQuestionView({
    super.key,
    required this.examQuestion,
    this.currentAnswer,
    required this.onAnswerChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question Content Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Points
                  Row(
                    children: [
                      Icon(
                        Icons.star,
                        size: 16,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${examQuestion.points} điểm',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Question
                  if (examQuestion.question.hasLatex)
                    LaTeXText(
                      text: examQuestion.question.content,
                      textStyle: Theme.of(context).textTheme.bodyLarge,
                    )
                  else
                    Text(
                      examQuestion.question.content,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  
                  // Sub-content
                  if (examQuestion.question.subContent != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      examQuestion.question.subContent!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Answer Section
          _buildAnswerSection(context),
        ],
      ),
    );
  }

  Widget _buildAnswerSection(BuildContext context) {
    switch (examQuestion.question.type) {
      case QuestionType.multipleChoice:
      case QuestionType.trueFalse:
        return _buildMultipleChoiceAnswers(context);
      case QuestionType.shortAnswer:
        return _buildShortAnswer(context);
      case QuestionType.essay:
        return _buildEssayAnswer(context);
      default:
        return const Center(
          child: Text('Question type not supported yet'),
        );
    }
  }

  Widget _buildMultipleChoiceAnswers(BuildContext context) {
    final selectedIds = currentAnswer?.selectedAnswerIds ?? [];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Chọn câu trả lời:',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        ...examQuestion.question.answers.map((answer) {
          final isSelected = selectedIds.contains(answer.id);
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: InkWell(
              onTap: () {
                onAnswerChanged(QuestionAnswer(
                  questionId: examQuestion.question.id,
                  selectedAnswerIds: [answer.id],
                  isAnswered: true,
                  answeredAt: DateTime.now(),
                  timeSpent: 0,
                ));
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey[300]!,
                    width: isSelected ? 2 : 1,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  color: isSelected
                      ? Theme.of(context)
                          .colorScheme
                          .primary
                          .withOpacity(0.1)
                      : null,
                ),
                child: Row(
                  children: [
                    Radio<String>(
                      value: answer.id,
                      groupValue: selectedIds.isNotEmpty
                          ? selectedIds.first
                          : null,
                      onChanged: (value) {
                        if (value != null) {
                          onAnswerChanged(QuestionAnswer(
                            questionId: examQuestion.question.id,
                            selectedAnswerIds: [value],
                            isAnswered: true,
                            answeredAt: DateTime.now(),
                            timeSpent: 0,
                          ));
                        }
                      },
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        answer.content,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildShortAnswer(BuildContext context) {
    final controller = TextEditingController(
      text: currentAnswer?.textAnswer ?? '',
    );
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Nhập câu trả lời:',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Nhập câu trả lời của bạn...',
            border: OutlineInputBorder(),
          ),
          onChanged: (value) {
            onAnswerChanged(QuestionAnswer(
              questionId: examQuestion.question.id,
              textAnswer: value,
              isAnswered: value.isNotEmpty,
              answeredAt: DateTime.now(),
              timeSpent: 0,
            ));
          },
        ),
      ],
    );
  }

  Widget _buildEssayAnswer(BuildContext context) {
    final controller = TextEditingController(
      text: currentAnswer?.textAnswer ?? '',
    );
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Viết bài luận:',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: controller,
          maxLines: 10,
          decoration: const InputDecoration(
            hintText: 'Viết câu trả lời của bạn...',
            border: OutlineInputBorder(),
          ),
          onChanged: (value) {
            onAnswerChanged(QuestionAnswer(
              questionId: examQuestion.question.id,
              textAnswer: value,
              isAnswered: value.isNotEmpty,
              answeredAt: DateTime.now(),
              timeSpent: 0,
            ));
          },
        ),
      ],
    );
  }

  String _formatTime(int seconds) {
    final duration = Duration(seconds: seconds);
    final minutes = duration.inMinutes;
    final secs = duration.inSeconds.remainder(60);
    return '${minutes}:${secs.toString().padLeft(2, '0')}';
  }
}

