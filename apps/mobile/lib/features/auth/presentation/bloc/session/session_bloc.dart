import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/features/auth/domain/entities/user_session.dart';
import 'package:mobile/features/auth/domain/repositories/session_repository.dart';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/core/utils/logger.dart';

part 'session_event.dart';
part 'session_state.dart';

class SessionBloc extends Bloc<SessionEvent, SessionState> {
  final SessionRepository repository;

  SessionBloc({
    required this.repository,
  }) : super(SessionInitial()) {
    on<SessionsLoadRequested>(_onSessionsLoadRequested);
    on<SessionTerminateRequested>(_onSessionTerminateRequested);
    on<AllSessionsTerminateRequested>(_onAllSessionsTerminateRequested);
  }

  Future<void> _onSessionsLoadRequested(
    SessionsLoadRequested event,
    Emitter<SessionState> emit,
  ) async {
    emit(SessionLoading());

    final result = await repository.getActiveSessions();
    
    await result.fold(
      (failure) async {
        AppLogger.error('Failed to load sessions', failure.message);
        emit(SessionError(failure.message));
      },
      (sessions) async {
        // Get current session token
        final currentToken = await SecureStorage.getSessionId();
        
        AppLogger.info('Loaded ${sessions.length} active sessions');
        
        emit(SessionsLoaded(
          sessions: sessions,
          currentSessionToken: currentToken,
        ));
      },
    );
  }

  Future<void> _onSessionTerminateRequested(
    SessionTerminateRequested event,
    Emitter<SessionState> emit,
  ) async {
    if (state is SessionsLoaded) {
      emit(SessionTerminating());

      final result = await repository.terminateSession(event.sessionId);

      result.fold(
        (failure) {
          AppLogger.error('Failed to terminate session', failure.message);
          emit(SessionError(failure.message));
        },
        (_) {
          AppLogger.info('Session terminated: ${event.sessionId}');
          emit(SessionTerminated(sessionId: event.sessionId));
        },
      );
    }
  }

  Future<void> _onAllSessionsTerminateRequested(
    AllSessionsTerminateRequested event,
    Emitter<SessionState> emit,
  ) async {
    emit(SessionTerminating());

    final result = await repository.terminateAllSessions();

    result.fold(
      (failure) {
        AppLogger.error('Failed to terminate all sessions', failure.message);
        emit(SessionError(failure.message));
      },
      (_) {
        AppLogger.info('All sessions terminated');
        emit(AllSessionsTerminated());
      },
    );
  }
}

