import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/storage/secure_storage.dart';
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/profile.pbgrpc.dart';

abstract class SessionRemoteDataSource {
  Future<dynamic> getSessions();
  Future<void> terminateSession(String sessionId);
  Future<void> terminateAllSessions();
}

class SessionRemoteDataSourceImpl implements SessionRemoteDataSource {
  // Uncomment after proto generation
  // late final ProfileServiceClient _client;
  
  SessionRemoteDataSourceImpl() {
    // _client = ProfileServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<dynamic> getSessions() async {
    // Uncomment after proto generation
    // final request = GetSessionsRequest();
    // 
    // try {
    //   final token = await SecureStorage.getAccessToken();
    //   final response = await _client.getSessions(
    //     request,
    //     options: GrpcClientConfig.getCallOptions(authToken: token),
    //   );
    //   return response;
    // } on GrpcError catch (e) {
    //   GrpcClientConfig.handleError(e);
    // }
    
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<void> terminateSession(String sessionId) async {
    // Uncomment after proto generation
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<void> terminateAllSessions() async {
    // Uncomment after proto generation
    throw UnimplementedError('Proto files not generated yet');
  }
}

