import 'dart:async';
import 'dart:io';
import 'package:grpc/grpc.dart';
import 'package:mobile/core/constants/api_constants.dart';
import 'package:mobile/core/network/interceptors/auth_interceptor.dart';
import 'package:mobile/core/network/interceptors/logging_interceptor.dart';
import 'package:mobile/core/network/interceptors/retry_interceptor.dart';
import 'package:mobile/core/utils/logger.dart';

class GrpcClientConfig {
  // Backend configuration
  static const String defaultHost = 'localhost';
  static const int defaultPort = 50051;
  
  // Production configuration
  static const String productionHost = 'api.exambank.vn';
  static const int productionPort = 443;

  static late ClientChannel _channel;
  static bool _isInitialized = false;

  /// Initialize gRPC client with backend configuration
  static void initialize({
    String host = defaultHost,
    int port = defaultPort,
    bool useTLS = false,
  }) {
    if (_isInitialized) {
      return;
    }

    _channel = ClientChannel(
      host,
      port: port,
      options: ChannelOptions(
        credentials: useTLS
            ? const ChannelCredentials.secure()
            : const ChannelCredentials.insecure(),
        idleTimeout: const Duration(minutes: 5),
        connectionTimeout: const Duration(seconds: 30),
      ),
    );

    _isInitialized = true;
    AppLogger.info('gRPC Client initialized: $host:$port (TLS: $useTLS)');
  }

  /// Initialize for production
  static void initializeProduction() {
    initialize(
      host: productionHost,
      port: productionPort,
      useTLS: true,
    );
  }

  /// Get the gRPC channel
  static ClientChannel get channel {
    if (!_isInitialized) {
      initialize();
    }
    return _channel;
  }

  /// Check if channel is ready
  static Future<bool> isChannelReady() async {
    try {
      await _channel.getConnection();
      return true;
    } catch (e) {
      AppLogger.error('Channel not ready: $e');
      return false;
    }
  }

  /// Shutdown the channel
  static Future<void> shutdown() async {
    if (_isInitialized) {
      await _channel.shutdown();
      _isInitialized = false;
      AppLogger.info('gRPC Client shutdown');
    }
  }
  
  static CallOptions getCallOptions({
    String? authToken,
    Duration? timeout,
    Map<String, String>? metadata,
  }) {
    final options = CallOptions(
      timeout: timeout ?? ApiConstants.requestTimeout,
      metadata: {
        if (authToken != null) 'authorization': 'Bearer $authToken',
        if (metadata != null) ...metadata,
      },
      providers: [
        AuthInterceptor(),
        LoggingInterceptor(),
        RetryInterceptor(),
      ],
    );
    
    return options;
  }
  
  static void handleError(GrpcError error) {
    AppLogger.error('gRPC Error [${error.code}]', error.message);
    
    switch (error.code) {
      case StatusCode.unauthenticated:
        throw UnauthorizedException(error.message ?? 'Unauthorized');
        
      case StatusCode.unavailable:
        throw ServerUnavailableException(error.message ?? 'Server unavailable');
        
      case StatusCode.deadlineExceeded:
        throw TimeoutException(error.message ?? 'Request timeout');
        
      case StatusCode.permissionDenied:
        throw PermissionDeniedException(error.message ?? 'Permission denied');
        
      case StatusCode.notFound:
        throw NotFoundException(error.message ?? 'Resource not found');
        
      case StatusCode.alreadyExists:
        throw AlreadyExistsException(error.message ?? 'Resource already exists');
        
      case StatusCode.invalidArgument:
        throw InvalidArgumentException(error.message ?? 'Invalid argument');
        
      default:
        throw ServerException(
          error.message ?? 'Server error',
          code: error.code,
        );
    }
  }
}

// Custom Exceptions
class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException(this.message);
  
  @override
  String toString() => 'UnauthorizedException: $message';
}

class ServerUnavailableException implements Exception {
  final String message;
  ServerUnavailableException(this.message);
  
  @override
  String toString() => 'ServerUnavailableException: $message';
}

class TimeoutException implements Exception {
  final String message;
  TimeoutException(this.message);
  
  @override
  String toString() => 'TimeoutException: $message';
}

class PermissionDeniedException implements Exception {
  final String message;
  PermissionDeniedException(this.message);
  
  @override
  String toString() => 'PermissionDeniedException: $message';
}

class NotFoundException implements Exception {
  final String message;
  NotFoundException(this.message);
  
  @override
  String toString() => 'NotFoundException: $message';
}

class AlreadyExistsException implements Exception {
  final String message;
  AlreadyExistsException(this.message);
  
  @override
  String toString() => 'AlreadyExistsException: $message';
}

class InvalidArgumentException implements Exception {
  final String message;
  InvalidArgumentException(this.message);
  
  @override
  String toString() => 'InvalidArgumentException: $message';
}

class ServerException implements Exception {
  final String message;
  final int? code;
  
  ServerException(this.message, {this.code});
  
  @override
  String toString() => 'ServerException[$code]: $message';
}

