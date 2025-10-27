import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';

abstract class AuthRemoteDataSource {
  Future<dynamic> login({
    required String email,
    required String password,
  });
  
  Future<dynamic> googleLogin({
    required String idToken,
  });
  
  Future<dynamic> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  });
  
  Future<void> logout({
    required String token,
  });
  
  Future<dynamic> refreshToken({
    required String refreshToken,
  });
  
  Future<dynamic> getCurrentUser({
    required String token,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  // Uncomment after proto generation
  // late final UserServiceClient _client;
  
  AuthRemoteDataSourceImpl() {
    // _client = UserServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<dynamic> login({
    required String email,
    required String password,
  }) async {
    // Uncomment after proto generation
    // final request = LoginRequest()
    //   ..email = email
    //   ..password = password;
    //   
    // try {
    //   final response = await _client.login(request);
    //   return response;
    // } on GrpcError catch (e) {
    //   GrpcClientConfig.handleError(e);
    // }
    
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> googleLogin({
    required String idToken,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<void> logout({required String token}) async {
    // Will implement after proto generation
  }
  
  @override
  Future<dynamic> refreshToken({
    required String refreshToken,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> getCurrentUser({
    required String token,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
}

