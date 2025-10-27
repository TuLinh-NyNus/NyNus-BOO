import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/exams/presentation/bloc/exam_taking/exam_taking_bloc.dart';
import 'package:mobile/features/exams/presentation/widgets/exam_question_view.dart';
import 'package:mobile/shared/widgets/confirm_dialog.dart';

class ExamTakingPage extends StatelessWidget {
  static const String routeName = '/exam-taking';
  
  final String examId;
  final String? sessionId;
  final bool resume;
  
  const ExamTakingPage({
    super.key,
    required this.examId,
    this.sessionId,
    this.resume = false,
  });

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) {
          final bloc = context.read<ExamTakingBloc>();
          final state = bloc.state;
          
          if (state is ExamTakingInProgress) {
            final shouldExit = await showDialog<bool>(
              context: context,
              barrierDismissible: false,
              builder: (context) => const ConfirmDialog(
                title: 'Thoát bài thi?',
                content: 'Bạn có muốn tạm dừng và lưu tiến độ bài thi?',
                confirmText: 'Tạm dừng',
                cancelText: 'Tiếp tục',
                isDestructive: true,
              ),
            );
            
            if (shouldExit == true && context.mounted) {
              bloc.add(PauseExamRequested());
              Navigator.of(context).pop();
            }
          }
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Làm bài thi'),
          actions: [
            BlocBuilder<ExamTakingBloc, ExamTakingState>(
              builder: (context, state) {
                if (state is ExamTakingInProgress) {
                  final isTimed = state.session.questions.isNotEmpty &&
                      state.session.questions.first.exam?.isTimed == true;
                  
                  if (isTimed) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Center(
                        child: Text(
                          _formatTime(state.timeRemaining),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: state.timeRemaining < 300
                                    ? Colors.red
                                    : null,
                              ),
                        ),
                      ),
                    );
                  }
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
        body: BlocConsumer<ExamTakingBloc, ExamTakingState>(
          listener: (context, state) {
            if (state is ExamTakingCompleted) {
              // Navigate to result page
              Navigator.pushReplacementNamed(
                context,
                '/exam-result',
                arguments: state.result,
              );
            } else if (state is ExamTakingError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: Colors.red,
                ),
              );
            }
          },
          builder: (context, state) {
            if (state is ExamTakingLoading || state is ExamTakingSubmitting) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }
            
            if (state is ExamTakingInProgress) {
              if (state.session.questions.isEmpty) {
                return const Center(
                  child: Text('Không có câu hỏi'),
                );
              }
              
              final currentQuestion = state.session.questions[
                state.currentQuestionIndex
              ];
              
              return Column(
                children: [
                  // Progress Bar
                  LinearProgressIndicator(
                    value: (state.currentQuestionIndex + 1) /
                        state.session.questions.length,
                  ),
                  
                  // Question Counter
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Câu ${state.currentQuestionIndex + 1}/${state.session.questions.length}',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          'Đã trả lời: ${state.session.answeredCount}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  
                  // Question View
                  Expanded(
                    child: ExamQuestionView(
                      examQuestion: currentQuestion,
                      currentAnswer: state.session.answers[currentQuestion.question.id],
                      onAnswerChanged: (answer) {
                        context.read<ExamTakingBloc>().add(
                          AnswerSubmitted(
                            questionId: currentQuestion.question.id,
                            answer: answer,
                          ),
                        );
                      },
                    ),
                  ),
                  
                  // Navigation Buttons
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, -2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Previous Button
                        if (state.currentQuestionIndex > 0)
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                context.read<ExamTakingBloc>().add(
                                  NavigateToQuestion(
                                    questionIndex: state.currentQuestionIndex - 1,
                                  ),
                                );
                              },
                              icon: const Icon(Icons.arrow_back),
                              label: const Text('Câu trước'),
                            ),
                          ),
                        
                        if (state.currentQuestionIndex > 0)
                          const SizedBox(width: 12),
                        
                        // Next or Submit Button
                        Expanded(
                          flex: 2,
                          child: state.currentQuestionIndex <
                                  state.session.questions.length - 1
                              ? FilledButton.icon(
                                  onPressed: () {
                                    context.read<ExamTakingBloc>().add(
                                      NavigateToQuestion(
                                        questionIndex:
                                            state.currentQuestionIndex + 1,
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.arrow_forward),
                                  label: const Text('Câu tiếp theo'),
                                )
                              : FilledButton.icon(
                                  onPressed: () async {
                                    final shouldSubmit = await showDialog<bool>(
                                      context: context,
                                      builder: (context) => ConfirmDialog(
                                        title: 'Nộp bài?',
                                        content: state.session.answeredCount <
                                                state.session.questions.length
                                            ? 'Bạn còn ${state.session.questions.length - state.session.answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?'
                                            : 'Bạn có chắc muốn nộp bài?',
                                        confirmText: 'Nộp bài',
                                        cancelText: 'Kiểm tra lại',
                                      ),
                                    );
                                    
                                    if (shouldSubmit == true && context.mounted) {
                                      context.read<ExamTakingBloc>().add(
                                        CompleteExamRequested(),
                                      );
                                    }
                                  },
                                  icon: const Icon(Icons.check),
                                  label: const Text('Nộp bài'),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: Colors.green,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }
            
            if (state is ExamTakingPaused) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.pause_circle_filled,
                      size: 64,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Bài thi đã tạm dừng',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tiến độ của bạn đã được lưu',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: () {
                        context.read<ExamTakingBloc>().add(
                          ResumeExamRequested(sessionId: state.session.id),
                        );
                      },
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('Tiếp tục'),
                    ),
                  ],
                ),
              );
            }
            
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  String _formatTime(int seconds) {
    final duration = Duration(seconds: seconds);
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final secs = duration.inSeconds.remainder(60);
    
    if (hours > 0) {
      return '${hours}:${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
    } else {
      return '${minutes}:${secs.toString().padLeft(2, '0')}';
    }
  }
}

