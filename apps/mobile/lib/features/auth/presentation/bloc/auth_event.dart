part of 'auth_bloc.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

// App Started
class AuthCheckRequested extends AuthEvent {}

// Login
class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object> get props => [email, password];
}

// Google Login
class AuthGoogleLoginRequested extends AuthEvent {
  final String idToken;

  const AuthGoogleLoginRequested(this.idToken);

  @override
  List<Object> get props => [idToken];
}

// Register
class AuthRegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String firstName;
  final String lastName;

  const AuthRegisterRequested({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
  });

  @override
  List<Object> get props => [email, password, firstName, lastName];
}

// Logout
class AuthLogoutRequested extends AuthEvent {}

// Token Refresh
class AuthTokenRefreshRequested extends AuthEvent {}

// Biometric Login
class AuthBiometricLoginRequested extends AuthEvent {}

// Update Profile
class AuthProfileUpdateRequested extends AuthEvent {
  final Map<String, dynamic> updates;
  
  const AuthProfileUpdateRequested(this.updates);
  
  @override
  List<Object> get props => [updates];
}

