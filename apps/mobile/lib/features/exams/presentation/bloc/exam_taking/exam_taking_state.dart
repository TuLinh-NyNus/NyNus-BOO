part of 'exam_taking_bloc.dart';

abstract class ExamTakingState extends Equatable {
  const ExamTakingState();

  @override
  List<Object?> get props => [];
}

class ExamTakingInitial extends ExamTakingState {}

class ExamTakingLoading extends ExamTakingState {}

class ExamTakingInProgress extends ExamTakingState {
  final ExamSession session;
  final int currentQuestionIndex;
  final int timeRemaining; // in seconds

  const ExamTakingInProgress({
    required this.session,
    required this.currentQuestionIndex,
    required this.timeRemaining,
  });

  ExamTakingInProgress copyWith({
    ExamSession? session,
    int? currentQuestionIndex,
    int? timeRemaining,
  }) {
    return ExamTakingInProgress(
      session: session ?? this.session,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      timeRemaining: timeRemaining ?? this.timeRemaining,
    );
  }

  @override
  List<Object> get props => [session, currentQuestionIndex, timeRemaining];
}

class ExamTakingPaused extends ExamTakingState {
  final ExamSession session;
  final int currentQuestionIndex;

  const ExamTakingPaused({
    required this.session,
    required this.currentQuestionIndex,
  });

  @override
  List<Object> get props => [session, currentQuestionIndex];
}

class ExamTakingSubmitting extends ExamTakingState {}

class ExamTakingCompleted extends ExamTakingState {
  final ExamResult result;

  const ExamTakingCompleted({required this.result});

  @override
  List<Object> get props => [result];
}

class ExamTakingError extends ExamTakingState {
  final String message;

  const ExamTakingError(this.message);

  @override
  List<Object> get props => [message];
}

