import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/features/auth/domain/entities/user.dart';
import 'package:mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:mobile/features/auth/domain/usecases/google_login_usecase.dart';
import 'package:mobile/features/auth/domain/usecases/logout_usecase.dart';
import 'package:mobile/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:mobile/features/auth/domain/usecases/refresh_token_usecase.dart';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/core/utils/logger.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final GoogleLoginUseCase googleLoginUseCase;
  final LogoutUseCase logoutUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;
  final RefreshTokenUseCase refreshTokenUseCase;
  
  Timer? _tokenRefreshTimer;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.googleLoginUseCase,
    required this.logoutUseCase,
    required this.getCurrentUserUseCase,
    required this.refreshTokenUseCase,
  }) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthGoogleLoginRequested>(_onGoogleLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<AuthTokenRefreshRequested>(_onTokenRefreshRequested);
    on<AuthBiometricLoginRequested>(_onBiometricLoginRequested);
    on<AuthProfileUpdateRequested>(_onProfileUpdateRequested);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final token = await SecureStorage.getAccessToken();
      
      if (token == null) {
        emit(AuthUnauthenticated());
        return;
      }

      final result = await getCurrentUserUseCase(
        GetCurrentUserParams(token: token),
      );
      
      await result.fold(
        (failure) async {
          AppLogger.warning('Token invalid, trying refresh');
          // Try refresh token
          final refreshToken = await SecureStorage.getRefreshToken();
          if (refreshToken != null) {
            add(AuthTokenRefreshRequested());
          } else {
            emit(AuthUnauthenticated());
          }
        },
        (user) async {
          final isBiometricEnabled = await SecureStorage.read('biometric_enabled') == 'true';
          emit(AuthAuthenticated(
            user: user,
            accessToken: token,
            isBiometricEnabled: isBiometricEnabled,
          ));
          _startTokenRefreshTimer();
        },
      );
    } catch (e) {
      AppLogger.error('Auth check failed', e);
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await loginUseCase(LoginParams(
      email: event.email,
      password: event.password,
    ));

    await result.fold(
      (failure) async {
        AppLogger.error('Login failed', failure.message);
        emit(AuthError(message: failure.message));
      },
      (loginResponse) async {
        AppLogger.info('Login successful');
        
        // Save user ID
        await SecureStorage.saveUserId(loginResponse.user.id);
        
        emit(AuthAuthenticated(
          user: loginResponse.user,
          accessToken: loginResponse.accessToken,
        ));
        
        _startTokenRefreshTimer();
      },
    );
  }

  Future<void> _onGoogleLoginRequested(
    AuthGoogleLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await googleLoginUseCase(GoogleLoginParams(
      idToken: event.idToken,
    ));

    await result.fold(
      (failure) async {
        AppLogger.error('Google login failed', failure.message);
        emit(AuthError(message: failure.message));
      },
      (loginResponse) async {
        AppLogger.info('Google login successful');
        
        await SecureStorage.saveUserId(loginResponse.user.id);
        
        emit(AuthAuthenticated(
          user: loginResponse.user,
          accessToken: loginResponse.accessToken,
        ));
        
        _startTokenRefreshTimer();
      },
    );
  }

  Future<void> _onRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await registerUseCase(RegisterParams(
      email: event.email,
      password: event.password,
      firstName: event.firstName,
      lastName: event.lastName,
    ));

    result.fold(
      (failure) {
        AppLogger.error('Registration failed', failure.message);
        emit(AuthError(message: failure.message));
      },
      (user) {
        AppLogger.info('Registration successful');
        emit(const AuthRegistrationSuccess());
      },
    );
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    _tokenRefreshTimer?.cancel();
    
    await logoutUseCase(NoParams());
    
    AppLogger.info('User logged out');
    emit(AuthUnauthenticated());
  }

  Future<void> _onTokenRefreshRequested(
    AuthTokenRefreshRequested event,
    Emitter<AuthState> emit,
  ) async {
    final refreshToken = await SecureStorage.getRefreshToken();
    
    if (refreshToken == null) {
      AppLogger.warning('No refresh token available');
      emit(AuthUnauthenticated());
      return;
    }

    final result = await refreshTokenUseCase(RefreshTokenParams(
      refreshToken: refreshToken,
    ));

    await result.fold(
      (failure) async {
        AppLogger.error('Token refresh failed', failure.message);
        emit(AuthUnauthenticated());
      },
      (tokenResponse) async {
        AppLogger.info('Token refreshed successfully');
        
        // Get current user with new token
        final userResult = await getCurrentUserUseCase(
          GetCurrentUserParams(token: tokenResponse.accessToken),
        );
        
        userResult.fold(
          (failure) {
            AppLogger.error('Failed to get user after refresh', failure.message);
            emit(AuthUnauthenticated());
          },
          (user) {
            emit(AuthAuthenticated(
              user: user,
              accessToken: tokenResponse.accessToken,
            ));
          },
        );
      },
    );
  }

  Future<void> _onBiometricLoginRequested(
    AuthBiometricLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    // Will implement after biometric auth utility is created
    emit(const AuthError(message: 'Biometric auth not implemented yet'));
  }

  Future<void> _onProfileUpdateRequested(
    AuthProfileUpdateRequested event,
    Emitter<AuthState> emit,
  ) async {
    // Will implement later
    AppLogger.info('Profile update requested');
  }

  void _startTokenRefreshTimer() {
    _tokenRefreshTimer?.cancel();
    
    // Refresh token every 10 minutes
    _tokenRefreshTimer = Timer.periodic(
      const Duration(minutes: 10),
      (timer) {
        AppLogger.debug('Auto-refreshing token');
        add(AuthTokenRefreshRequested());
      },
    );
  }

  @override
  Future<void> close() {
    _tokenRefreshTimer?.cancel();
    return super.close();
  }
}

