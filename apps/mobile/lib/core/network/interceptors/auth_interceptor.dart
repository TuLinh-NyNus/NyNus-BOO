import 'dart:async';
import 'package:grpc/grpc.dart';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/core/utils/logger.dart';

class AuthInterceptor extends ClientInterceptor {
  @override
  ResponseFuture<R> interceptUnary<Q, R>(
    ClientMethod<Q, R> method,
    Q request,
    CallOptions options,
    ClientUnaryInvoker<Q, R> invoker,
  ) {
    return invoker(
      method,
      request,
      options.mergedWith(
        CallOptions(
          providers: [_authProvider],
        ),
      ),
    );
  }
  
  @override
  ResponseStream<R> interceptStreaming<Q, R>(
    ClientMethod<Q, R> method,
    Stream<Q> requests,
    CallOptions options,
    ClientStreamingInvoker<Q, R> invoker,
  ) {
    return invoker(
      method,
      requests,
      options.mergedWith(
        CallOptions(
          providers: [_authProvider],
        ),
      ),
    );
  }

  FutureOr<void> _authProvider(
    Map<String, String> metadata,
    String uri,
  ) async {
    // Skip auth for certain public endpoints
    if (_isPublicEndpoint(uri)) {
      AppLogger.debug('Skipping auth for public endpoint: $uri');
      return;
    }
    
    // Get token from secure storage
    final token = await SecureStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      metadata['authorization'] = 'Bearer $token';
      AppLogger.debug('Added auth token to request: $uri');
    } else {
      AppLogger.warning('No auth token available for: $uri');
    }
  }
  
  bool _isPublicEndpoint(String uri) {
    const publicEndpoints = [
      '/v1.UserService/Login',
      '/v1.UserService/Register',
      '/v1.UserService/GoogleLogin',
      '/v1.UserService/RefreshToken',
      '/v1.UserService/ForgotPassword',
      '/v1.UserService/ResetPassword',
      '/v1.HealthService/Check',
    ];
    
    return publicEndpoints.any((endpoint) => uri.contains(endpoint));
  }
}

