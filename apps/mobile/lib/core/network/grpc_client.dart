import 'dart:async';
import 'dart:io';
import 'package:grpc/grpc.dart';
import 'package:mobile/core/constants/api_constants.dart';
import 'package:mobile/core/network/interceptors/auth_interceptor.dart';
import 'package:mobile/core/network/interceptors/logging_interceptor.dart';
import 'package:mobile/core/network/interceptors/retry_interceptor.dart';
import 'package:mobile/core/utils/logger.dart';

class GrpcClientConfig {
  static ClientChannel? _channel;
  
  static ClientChannel get channel {
    _channel ??= _createChannel();
    return _channel!;
  }
  
  static ClientChannel _createChannel() {
    final options = ChannelOptions(
      credentials: ApiConstants.isProduction || ApiConstants.flavor == 'prod'
          ? const ChannelCredentials.secure()
          : const ChannelCredentials.insecure(),
      connectionTimeout: ApiConstants.connectionTimeout,
      idleTimeout: const Duration(minutes: 5),
    );
    
    AppLogger.info('Creating gRPC channel to ${ApiConstants.grpcEndpoint}');
    
    return ClientChannel(
      ApiConstants.currentHost,
      port: ApiConstants.grpcPort,
      options: options,
    );
  }
  
  static Future<void> initialize() async {
    try {
      // Pre-initialize channel
      final ch = channel;
      
      // Test connection
      await ch.getConnection();
      AppLogger.info('✓ gRPC channel connected to ${ApiConstants.grpcEndpoint}');
      
      // Print config in debug mode
      ApiConstants.printConfig();
    } catch (e) {
      AppLogger.error('Failed to connect to gRPC server', e);
      rethrow;
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
  
  static Future<void> shutdown() async {
    if (_channel != null) {
      await _channel!.shutdown();
      _channel = null;
      AppLogger.info('gRPC channel shut down');
    }
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

