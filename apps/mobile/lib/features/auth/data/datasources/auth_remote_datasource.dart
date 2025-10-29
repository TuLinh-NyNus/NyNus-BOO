import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/utils/logger.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';
import 'package:mobile/features/auth/domain/entities/user.dart';
import 'package:mobile/generated/proto/v1/user.pbgrpc.dart' as pb;
import 'package:mobile/generated/proto/common/common.pb.dart' as common;

abstract class AuthRemoteDataSource {
  Future<UserModel> login({
    required String email,
    required String password,
  });
  
  Future<UserModel> googleLogin({
    required String idToken,
  });
  
  Future<UserModel> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  });
  
  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  });
  
  Future<UserModel> getCurrentUser({
    required String token,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  late final pb.UserServiceClient _client;
  
  AuthRemoteDataSourceImpl() {
    _client = pb.UserServiceClient(GrpcClientConfig.channel);
    AppLogger.info('AuthRemoteDataSource initialized with gRPC client');
  }
  
  @override
  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    try {
      AppLogger.info('Attempting login for email: $email');
      
      final request = pb.LoginRequest()
        ..email = email
        ..password = password;
      
      final response = await _client.login(request);
      
      AppLogger.info('Login successful for user: ${response.user.id}');
      
      return _userFromProto(response.user);
    } on GrpcError catch (e) {
      AppLogger.error('Login failed: ${e.message}');
      rethrow;
    } catch (e) {
      AppLogger.error('Unexpected error during login: $e');
      throw GrpcError.unknown('Failed to login: $e');
    }
  }
  
  @override
  Future<UserModel> googleLogin({
    required String idToken,
  }) async {
    try {
      AppLogger.info('Attempting Google login');
      
      final request = pb.GoogleLoginRequest()
        ..idToken = idToken;
      
      final response = await _client.googleLogin(request);
      
      AppLogger.info('Google login successful for user: ${response.user.id}');
      
      return _userFromProto(response.user);
    } on GrpcError catch (e) {
      AppLogger.error('Google login failed: ${e.message}');
      rethrow;
    } catch (e) {
      AppLogger.error('Unexpected error during Google login: $e');
      throw GrpcError.unknown('Failed to login with Google: $e');
    }
  }
  
  @override
  Future<UserModel> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    try {
      AppLogger.info('Attempting registration for email: $email');
      
      final request = pb.RegisterRequest()
        ..email = email
        ..password = password
        ..firstName = firstName
        ..lastName = lastName;
      
      final response = await _client.register(request);
      
      AppLogger.info('Registration successful for user: ${response.user.id}');
      
      return _userFromProto(response.user);
    } on GrpcError catch (e) {
      AppLogger.error('Registration failed: ${e.message}');
      rethrow;
    } catch (e) {
      AppLogger.error('Unexpected error during registration: $e');
      throw GrpcError.unknown('Failed to register: $e');
    }
  }
  
  @override
  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  }) async {
    try {
      AppLogger.info('Attempting token refresh');
      
      final request = pb.RefreshTokenRequest()
        ..refreshToken = refreshToken;
      
      final response = await _client.refreshToken(request);
      
      AppLogger.info('Token refresh successful');
      
      return {
        'access_token': response.accessToken,
        'refresh_token': response.refreshToken,
        'expires_in': response.expiresIn,
      };
    } on GrpcError catch (e) {
      AppLogger.error('Token refresh failed: ${e.message}');
      rethrow;
    } catch (e) {
      AppLogger.error('Unexpected error during token refresh: $e');
      throw GrpcError.unknown('Failed to refresh token: $e');
    }
  }
  
  @override
  Future<UserModel> getCurrentUser({
    required String token,
  }) async {
    try {
      AppLogger.info('Fetching current user');
      
      final request = pb.GetUserRequest()
        ..id = ''; // Empty ID means get current user from token
      
      final response = await _client.getUser(
        request,
        options: CallOptions(metadata: {'authorization': 'Bearer $token'}),
      );
      
      AppLogger.info('Current user fetched: ${response.user.id}');
      
      return _userFromProto(response.user);
    } on GrpcError catch (e) {
      AppLogger.error('Get current user failed: ${e.message}');
      rethrow;
    } catch (e) {
      AppLogger.error('Unexpected error during get current user: $e');
      throw GrpcError.unknown('Failed to get current user: $e');
    }
  }
  
  /// Convert proto User to UserModel
  UserModel _userFromProto(pb.User protoUser) {
    return UserModel(
      id: protoUser.id,
      email: protoUser.email,
      firstName: protoUser.firstName,
      lastName: protoUser.lastName,
      username: protoUser.hasUsername() ? protoUser.username : null,
      role: _userRoleFromProto(protoUser.role),
      status: _userStatusFromProto(protoUser.status),
      level: protoUser.hasLevel() ? protoUser.level : null,
      avatar: protoUser.hasAvatar() ? protoUser.avatar : null,
      emailVerified: protoUser.emailVerified,
      googleId: protoUser.hasGoogleId() ? protoUser.googleId : null,
      createdAt: DateTime.now(), // TODO: Parse from proto timestamp
      lastLogin: null, // TODO: Parse from proto timestamp if available
    );
  }
  
  /// Convert proto UserRole to enum
  UserRole _userRoleFromProto(common.UserRole role) {
    switch (role) {
      case common.UserRole.USER_ROLE_ADMIN:
        return UserRole.admin;
      case common.UserRole.USER_ROLE_TEACHER:
        return UserRole.teacher;
      case common.UserRole.USER_ROLE_TUTOR:
        return UserRole.tutor;
      case common.UserRole.USER_ROLE_STUDENT:
        return UserRole.student;
      case common.UserRole.USER_ROLE_GUEST:
        return UserRole.guest;
      default:
        return UserRole.student;
    }
  }
  
  /// Convert proto UserStatus to enum
  UserStatus _userStatusFromProto(common.UserStatus status) {
    switch (status) {
      case common.UserStatus.USER_STATUS_ACTIVE:
        return UserStatus.active;
      case common.UserStatus.USER_STATUS_INACTIVE:
        return UserStatus.inactive;
      case common.UserStatus.USER_STATUS_SUSPENDED:
        return UserStatus.suspended;
      default:
        return UserStatus.inactive;
    }
  }
}
