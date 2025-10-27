import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/auth/domain/entities/user.dart';

abstract class AuthRepository {
  // Authentication
  Future<Either<Failure, LoginResponse>> login({
    required String email,
    required String password,
  });
  
  Future<Either<Failure, LoginResponse>> googleLogin({
    required String idToken,
  });
  
  Future<Either<Failure, User>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  });
  
  Future<Either<Failure, void>> logout();
  
  // Token Management
  Future<Either<Failure, TokenResponse>> refreshToken({
    required String refreshToken,
  });
  
  // User Management
  Future<Either<Failure, User>> getCurrentUser({
    required String token,
  });
  
  Future<Either<Failure, void>> updateProfile({
    required String userId,
    required Map<String, dynamic> updates,
  });
  
  // Email Verification
  Future<Either<Failure, void>> sendVerificationEmail({
    required String userId,
  });
  
  Future<Either<Failure, void>> verifyEmail({
    required String token,
  });
  
  // Password Reset
  Future<Either<Failure, void>> forgotPassword({
    required String email,
  });
  
  Future<Either<Failure, void>> resetPassword({
    required String token,
    required String newPassword,
  });
}

// Response Models
class LoginResponse {
  final User user;
  final String accessToken;
  final String refreshToken;
  final String? sessionToken;
  
  LoginResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    this.sessionToken,
  });
}

class TokenResponse {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  
  TokenResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
  });
}

