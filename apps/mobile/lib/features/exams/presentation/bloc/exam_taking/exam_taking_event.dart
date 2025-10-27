part of 'exam_taking_bloc.dart';

abstract class ExamTakingEvent extends Equatable {
  const ExamTakingEvent();

  @override
  List<Object?> get props => [];
}

class StartExamRequested extends ExamTakingEvent {
  final String examId;

  const StartExamRequested({required this.examId});

  @override
  List<Object> get props => [examId];
}

class AnswerSubmitted extends ExamTakingEvent {
  final String questionId;
  final QuestionAnswer answer;

  const AnswerSubmitted({
    required this.questionId,
    required this.answer,
  });

  @override
  List<Object> get props => [questionId, answer];
}

class NavigateToQuestion extends ExamTakingEvent {
  final int questionIndex;

  const NavigateToQuestion({required this.questionIndex});

  @override
  List<Object> get props => [questionIndex];
}

class CompleteExamRequested extends ExamTakingEvent {}

class PauseExamRequested extends ExamTakingEvent {}

class ResumeExamRequested extends ExamTakingEvent {
  final String sessionId;

  const ResumeExamRequested({required this.sessionId});

  @override
  List<Object> get props => [sessionId];
}

class TimerTick extends ExamTakingEvent {}

class AutoSaveTriggered extends ExamTakingEvent {}

