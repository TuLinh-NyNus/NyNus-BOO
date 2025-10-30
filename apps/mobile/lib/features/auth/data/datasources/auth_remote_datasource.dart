import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';
// TODO: Uncomment after proto generation
// import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';

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
  
  Future<void> logout({
    required String token,
  });
  
  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  });
  
  Future<UserModel> getCurrentUser({
    required String token,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  // TODO: Uncomment after proto generation
  // late final UserServiceClient _client;
  
  AuthRemoteDataSourceImpl() {
    // _client = UserServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Mock successful login
    if (email == 'admin10@nynus.edu.vn' && password == 'Abd8stbcs!') {
      return UserModel(
        id: 'user_001',
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        createdAt: DateTime.now(),
      );
    } else if (email == 'student33@nynus.edu.vn' && password == 'Abd8stbcs!') {
      return UserModel(
        id: 'user_002',
        email: email,
        firstName: 'Student',
        lastName: 'User',
        role: 'student',
        status: 'active',
        level: 10,
        emailVerified: true,
        createdAt: DateTime.now(),
      );
    } else {
      throw GrpcError.unauthenticated('Invalid email or password');
    }
  }
  
  @override
  Future<UserModel> googleLogin({
    required String idToken,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Mock Google login success
    return UserModel(
      id: 'user_google_001',
      email: 'user@gmail.com',
      firstName: 'Google',
      lastName: 'User',
      role: UserRole.student,
      status: UserStatus.active,
      level: 10,
      emailVerified: true,
      googleId: 'google_123456789',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      createdAt: DateTime.now(),
    );
  }
  
  @override
  Future<UserModel> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 1000));
    
    // Mock registration success
    return UserModel(
      id: 'user_new_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: UserRole.student,
      status: UserStatus.active,
      level: 1, // New student starts at level 1
      emailVerified: false, // Needs verification
      createdAt: DateTime.now(),
    );
  }
  
  @override
  Future<void> logout({required String token}) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 200));
    // Mock logout - just delay to simulate server call
  }
  
  @override
  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Mock token refresh
    return {
      'access_token': 'new_access_token_${DateTime.now().millisecondsSinceEpoch}',
      'refresh_token': 'new_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
      'expires_in': 3600, // 1 hour
    };
  }
  
  @override
  Future<UserModel> getCurrentUser({
    required String token,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 400));
    
    // Mock current user (admin)
    return UserModel(
      id: 'user_001',
      email: 'admin10@nynus.edu.vn',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.admin,
      status: UserStatus.active,
      emailVerified: true,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      lastLogin: DateTime.now().subtract(const Duration(minutes: 5)),
    );
  }
}

