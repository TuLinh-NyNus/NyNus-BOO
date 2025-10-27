part of 'session_bloc.dart';

abstract class SessionEvent extends Equatable {
  const SessionEvent();

  @override
  List<Object?> get props => [];
}

class SessionsLoadRequested extends SessionEvent {}

class SessionTerminateRequested extends SessionEvent {
  final String sessionId;

  const SessionTerminateRequested({required this.sessionId});

  @override
  List<Object> get props => [sessionId];
}

class AllSessionsTerminateRequested extends SessionEvent {}

