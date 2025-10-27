import 'dart:async';
import 'dart:math';
import 'package:grpc/grpc.dart';
import 'package:mobile/core/constants/api_constants.dart';
import 'package:mobile/core/utils/logger.dart';

class RetryInterceptor extends ClientInterceptor {
  @override
  ResponseFuture<R> interceptUnary<Q, R>(
    ClientMethod<Q, R> method,
    Q request,
    CallOptions options,
    ClientUnaryInvoker<Q, R> invoker,
  ) {
    return _retryRequest(
      () => invoker(method, request, options),
      method.path,
    );
  }
  
  Future<R> _retryRequest<R>(
    Future<R> Function() request,
    String methodPath,
  ) async {
    var attempt = 0;
    GrpcError? lastError;
    
    while (attempt < ApiConstants.maxRetryAttempts) {
      try {
        return await request();
      } on GrpcError catch (e) {
        lastError = e;
        
        // Don't retry certain errors
        if (!_shouldRetry(e)) {
          AppLogger.debug('Not retrying error for $methodPath: ${e.code}');
          rethrow;
        }
        
        attempt++;
        
        if (attempt < ApiConstants.maxRetryAttempts) {
          // Exponential backoff with jitter
          final baseDelay = ApiConstants.retryDelay.inMilliseconds;
          final exponentialDelay = baseDelay * pow(2, attempt - 1);
          final jitter = Random().nextInt(1000); // 0-1000ms jitter
          final delayMs = min(
            exponentialDelay.toInt() + jitter,
            ApiConstants.maxRetryDelay.inMilliseconds,
          );
          
          final delay = Duration(milliseconds: delayMs);
          
          AppLogger.warning(
            'Retrying $methodPath after ${delay.inSeconds}s (attempt $attempt/${ApiConstants.maxRetryAttempts})',
          );
          
          await Future.delayed(delay);
        }
      }
    }
    
    // All retries failed
    AppLogger.error('All retry attempts failed for $methodPath', lastError);
    throw lastError!;
  }
  
  bool _shouldRetry(GrpcError error) {
    // Retry on network errors and transient issues
    const retryableCodes = [
      StatusCode.unavailable,      // Server unavailable
      StatusCode.deadlineExceeded, // Timeout
      StatusCode.resourceExhausted, // Rate limit
      StatusCode.aborted,          // Transaction aborted
      StatusCode.internal,         // Internal error
      StatusCode.unknown,          // Unknown error
    ];
    
    final shouldRetry = retryableCodes.contains(error.code);
    
    if (shouldRetry) {
      AppLogger.debug('Error is retryable: ${error.code}');
    }
    
    return shouldRetry;
  }
}

