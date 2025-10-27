import 'package:grpc/grpc.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/core/utils/logger.dart';

class LoggingInterceptor extends ClientInterceptor {
  @override
  ResponseFuture<R> interceptUnary<Q, R>(
    ClientMethod<Q, R> method,
    Q request,
    CallOptions options,
    ClientUnaryInvoker<Q, R> invoker,
  ) {
    final stopwatch = Stopwatch()..start();
    
    if (kDebugMode) {
      AppLogger.debug('→ gRPC Request: ${method.path}');
      AppLogger.debug('  Request: $request');
    }
    
    final response = invoker(method, request, options);
    
    response.then(
      (value) {
        stopwatch.stop();
        if (kDebugMode) {
          AppLogger.debug(
            '← gRPC Response: ${method.path} (${stopwatch.elapsedMilliseconds}ms)',
          );
          AppLogger.debug('  Response: $value');
        }
      },
      onError: (error) {
        stopwatch.stop();
        if (kDebugMode) {
          AppLogger.error(
            '✗ gRPC Error: ${method.path} (${stopwatch.elapsedMilliseconds}ms)',
            error,
          );
        }
      },
    );
    
    return response;
  }
  
  @override
  ResponseStream<R> interceptStreaming<Q, R>(
    ClientMethod<Q, R> method,
    Stream<Q> requests,
    CallOptions options,
    ClientStreamingInvoker<Q, R> invoker,
  ) {
    if (kDebugMode) {
      AppLogger.debug('→ gRPC Stream Request: ${method.path}');
    }
    
    final response = invoker(method, requests, options);
    
    if (kDebugMode) {
      return response.map((value) {
        AppLogger.debug('← gRPC Stream Response: ${method.path}');
        AppLogger.debug('  Data: $value');
        return value;
      }).handleError((error) {
        AppLogger.error('✗ gRPC Stream Error: ${method.path}', error);
        throw error;
      });
    }
    
    return response;
  }
}

