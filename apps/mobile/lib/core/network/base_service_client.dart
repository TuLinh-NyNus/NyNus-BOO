import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/storage/secure_storage.dart';

abstract class BaseServiceClient<T extends Client> {
  late final T client;
  
  BaseServiceClient() {
    client = createClient(GrpcClientConfig.channel);
  }
  
  /// Override this to create the specific service client
  T createClient(ClientChannel channel);
  
  /// Get call options with authentication
  Future<CallOptions> getCallOptions({
    Duration? timeout,
    Map<String, String>? metadata,
  }) async {
    final token = await SecureStorage.getAccessToken();
    return GrpcClientConfig.getCallOptions(
      authToken: token,
      timeout: timeout,
      metadata: metadata,
    );
  }
  
  /// Handle gRPC errors consistently
  void handleError(GrpcError error) {
    GrpcClientConfig.handleError(error);
  }
  
  /// Execute a gRPC call with error handling
  Future<R> execute<R>(
    Future<R> Function() call, {
    String? operationName,
  }) async {
    try {
      return await call();
    } on GrpcError catch (e) {
      handleError(e);
      rethrow;
    }
  }
  
  /// Execute a gRPC call with authentication
  Future<R> executeAuthenticated<R>(
    Future<R> Function(CallOptions options) call, {
    String? operationName,
    Duration? timeout,
    Map<String, String>? metadata,
  }) async {
    try {
      final options = await getCallOptions(
        timeout: timeout,
        metadata: metadata,
      );
      return await call(options);
    } on GrpcError catch (e) {
      handleError(e);
      rethrow;
    }
  }
}

