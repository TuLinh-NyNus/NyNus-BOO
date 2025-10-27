part of 'auth_bloc.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

// Initial
class AuthInitial extends AuthState {}

// Loading
class AuthLoading extends AuthState {}

// Authenticated
class AuthAuthenticated extends AuthState {
  final User user;
  final String accessToken;
  final bool isBiometricEnabled;

  const AuthAuthenticated({
    required this.user,
    required this.accessToken,
    this.isBiometricEnabled = false,
  });

  @override
  List<Object> get props => [user, accessToken, isBiometricEnabled];
  
  AuthAuthenticated copyWith({
    User? user,
    String? accessToken,
    bool? isBiometricEnabled,
  }) {
    return AuthAuthenticated(
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      isBiometricEnabled: isBiometricEnabled ?? this.isBiometricEnabled,
    );
  }
}

// Unauthenticated
class AuthUnauthenticated extends AuthState {}

// Error
class AuthError extends AuthState {
  final String message;
  final String? code;

  const AuthError({
    required this.message,
    this.code,
  });

  @override
  List<Object?> get props => [message, code];
}

// Registration Success
class AuthRegistrationSuccess extends AuthState {
  final String message;
  
  const AuthRegistrationSuccess({
    this.message = 'Registration successful! Please login.',
  });
  
  @override
  List<Object> get props => [message];
}

