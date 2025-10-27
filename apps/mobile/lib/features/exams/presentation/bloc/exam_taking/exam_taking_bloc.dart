import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/features/exams/domain/entities/exam.dart';
import 'package:mobile/features/exams/domain/repositories/exam_repository.dart';
import 'package:mobile/features/exams/data/models/exam_model.dart';
import 'package:mobile/core/utils/logger.dart';

part 'exam_taking_event.dart';
part 'exam_taking_state.dart';

class ExamTakingBloc extends Bloc<ExamTakingEvent, ExamTakingState> {
  final ExamRepository repository;
  Timer? _timer;
  Timer? _autoSaveTimer;
  
  ExamTakingBloc({
    required this.repository,
  }) : super(ExamTakingInitial()) {
    on<StartExamRequested>(_onStartExamRequested);
    on<AnswerSubmitted>(_onAnswerSubmitted);
    on<NavigateToQuestion>(_onNavigateToQuestion);
    on<CompleteExamRequested>(_onCompleteExamRequested);
    on<PauseExamRequested>(_onPauseExamRequested);
    on<ResumeExamRequested>(_onResumeExamRequested);
    on<TimerTick>(_onTimerTick);
    on<AutoSaveTriggered>(_onAutoSaveTriggered);
  }

  Future<void> _onStartExamRequested(
    StartExamRequested event,
    Emitter<ExamTakingState> emit,
  ) async {
    emit(ExamTakingLoading());
    
    final result = await repository.startExam(event.examId);
    
    await result.fold(
      (failure) async {
        AppLogger.error('Failed to start exam', failure.message);
        emit(ExamTakingError(failure.message));
      },
      (session) async {
        AppLogger.info('Exam started: ${session.id}');
        
        emit(ExamTakingInProgress(
          session: session,
          currentQuestionIndex: session.currentQuestionIndex,
          timeRemaining: session.remainingTime,
        ));
        
        // Cache session for offline
        await repository.cacheExamSession(session);
        
        // Start timer if timed exam
        if (session.questions.isNotEmpty && 
            session.questions.first.exam?.isTimed == true) {
          _startTimer();
        }
        
        // Start auto-save timer
        _startAutoSave();
      },
    );
  }

  Future<void> _onAnswerSubmitted(
    AnswerSubmitted event,
    Emitter<ExamTakingState> emit,
  ) async {
    if (state is ExamTakingInProgress) {
      final currentState = state as ExamTakingInProgress;
      
      // Update answer locally first (optimistic update)
      final updatedAnswers = Map<String, QuestionAnswer>.from(
        currentState.session.answers,
      );
      updatedAnswers[event.questionId] = event.answer;
      
      final updatedSession = ExamSessionModel(
        id: currentState.session.id,
        examId: currentState.session.examId,
        userId: currentState.session.userId,
        status: currentState.session.status,
        startedAt: currentState.session.startedAt,
        timeSpent: currentState.session.timeSpent,
        currentQuestionIndex: currentState.currentQuestionIndex,
        questions: currentState.session.questions,
        answers: updatedAnswers,
      );
      
      emit(currentState.copyWith(session: updatedSession));
      
      // Save to cache immediately
      await repository.cacheExamSession(updatedSession);
      
      AppLogger.debug('Answer submitted for question: ${event.questionId}');
      
      // Submit to server (can fail without affecting UI)
      repository.submitAnswer(
        sessionId: currentState.session.id,
        questionId: event.questionId,
        answer: event.answer,
      );
    }
  }

  Future<void> _onNavigateToQuestion(
    NavigateToQuestion event,
    Emitter<ExamTakingState> emit,
  ) async {
    if (state is ExamTakingInProgress) {
      final currentState = state as ExamTakingInProgress;
      emit(currentState.copyWith(
        currentQuestionIndex: event.questionIndex,
      ));
    }
  }

  Future<void> _onCompleteExamRequested(
    CompleteExamRequested event,
    Emitter<ExamTakingState> emit,
  ) async {
    if (state is ExamTakingInProgress) {
      final currentState = state as ExamTakingInProgress;
      
      emit(ExamTakingSubmitting());
      
      AppLogger.info('Completing exam: ${currentState.session.id}');
      
      final result = await repository.completeExam(currentState.session.id);
      
      result.fold(
        (failure) {
          AppLogger.error('Failed to complete exam', failure.message);
          emit(ExamTakingError(failure.message));
        },
        (examResult) {
          AppLogger.info('Exam completed successfully');
          _cancelTimers();
          emit(ExamTakingCompleted(result: examResult));
          
          // Clear cached session
          repository.clearCache();
        },
      );
    }
  }

  Future<void> _onPauseExamRequested(
    PauseExamRequested event,
    Emitter<ExamTakingState> emit,
  ) async {
    if (state is ExamTakingInProgress) {
      final currentState = state as ExamTakingInProgress;
      
      AppLogger.info('Pausing exam: ${currentState.session.id}');
      
      // Pause timers
      _timer?.cancel();
      _autoSaveTimer?.cancel();
      
      // Save current state
      await _saveProgress(currentState);
      
      // Update UI
      emit(ExamTakingPaused(
        session: currentState.session,
        currentQuestionIndex: currentState.currentQuestionIndex,
      ));
      
      // Notify server
      await repository.pauseExam(currentState.session.id);
    }
  }

  Future<void> _onResumeExamRequested(
    ResumeExamRequested event,
    Emitter<ExamTakingState> emit,
  ) async {
    emit(ExamTakingLoading());
    
    AppLogger.info('Resuming exam: ${event.sessionId}');
    
    final result = await repository.resumeExam(event.sessionId);
    
    result.fold(
      (failure) => emit(ExamTakingError(failure.message)),
      (session) {
        emit(ExamTakingInProgress(
          session: session,
          currentQuestionIndex: session.currentQuestionIndex,
          timeRemaining: session.remainingTime,
        ));
        
        // Restart timers
        if (session.questions.isNotEmpty &&
            session.questions.first.exam?.isTimed == true) {
          _startTimer();
        }
        _startAutoSave();
      },
    );
  }

  void _onTimerTick(
    TimerTick event,
    Emitter<ExamTakingState> emit,
  ) {
    if (state is ExamTakingInProgress) {
      final currentState = state as ExamTakingInProgress;
      final newTimeRemaining = currentState.timeRemaining - 1;
      
      if (newTimeRemaining <= 0) {
        // Time's up - auto submit
        AppLogger.warning('Time expired, auto-submitting exam');
        add(CompleteExamRequested());
      } else {
        emit(currentState.copyWith(
          timeRemaining: newTimeRemaining,
        ));
      }
    }
  }

  Future<void> _onAutoSaveTriggered(
    AutoSaveTriggered event,
    Emitter<ExamTakingState> emit,
  ) async {
    if (state is ExamTakingInProgress) {
      final currentState = state as ExamTakingInProgress;
      await _saveProgress(currentState);
      AppLogger.debug('Auto-saved exam progress');
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(
      const Duration(seconds: 1),
      (timer) => add(TimerTick()),
    );
    AppLogger.debug('Timer started');
  }

  void _startAutoSave() {
    _autoSaveTimer?.cancel();
    _autoSaveTimer = Timer.periodic(
      const Duration(seconds: 30), // Auto-save every 30 seconds
      (timer) => add(AutoSaveTriggered()),
    );
    AppLogger.debug('Auto-save started (30s interval)');
  }

  Future<void> _saveProgress(ExamTakingInProgress state) async {
    await repository.saveProgress(
      sessionId: state.session.id,
      answers: state.session.answers,
      timeSpent: DateTime.now().difference(state.session.startedAt).inSeconds,
      currentQuestionIndex: state.currentQuestionIndex,
    );
  }

  void _cancelTimers() {
    _timer?.cancel();
    _autoSaveTimer?.cancel();
    AppLogger.debug('Timers cancelled');
  }

  @override
  Future<void> close() {
    _cancelTimers();
    return super.close();
  }
}

