part of 'session_bloc.dart';

abstract class SessionState extends Equatable {
  const SessionState();

  @override
  List<Object?> get props => [];
}

class SessionInitial extends SessionState {}

class SessionLoading extends SessionState {}

class SessionsLoaded extends SessionState {
  final List<UserSession> sessions;
  final String? currentSessionToken;

  const SessionsLoaded({
    required this.sessions,
    this.currentSessionToken,
  });

  @override
  List<Object?> get props => [sessions, currentSessionToken];
}

class SessionTerminating extends SessionState {}

class SessionTerminated extends SessionState {
  final String sessionId;

  const SessionTerminated({required this.sessionId});

  @override
  List<Object> get props => [sessionId];
}

class AllSessionsTerminated extends SessionState {}

class SessionError extends SessionState {
  final String message;

  const SessionError(this.message);

  @override
  List<Object> get props => [message];
}

