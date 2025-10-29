import 'package:grpc/grpc.dart';
import 'package:mobile/core/errors/exceptions.dart';

/// Maps gRPC errors to application exceptions
/// 
/// This utility provides a centralized way to convert gRPC errors
/// into user-friendly application exceptions.
class GrpcErrorMapper {
  /// Convert GrpcError to application exception
  static Exception mapGrpcError(GrpcError error) {
    switch (error.code) {
      case StatusCode.unauthenticated:
        return UnauthorizedException(
          message: error.message ?? 'Phiên đăng nhập đã hết hạn',
        );

      case StatusCode.permissionDenied:
        return ForbiddenException(
          message: error.message ?? 'Bạn không có quyền thực hiện thao tác này',
        );

      case StatusCode.invalidArgument:
        return ValidationException(
          message: error.message ?? 'Dữ liệu không hợp lệ',
        );

      case StatusCode.notFound:
        return NotFoundException(
          message: error.message ?? 'Không tìm thấy dữ liệu',
        );

      case StatusCode.alreadyExists:
        return ConflictException(
          message: error.message ?? 'Dữ liệu đã tồn tại',
        );

      case StatusCode.resourceExhausted:
        return RateLimitException(
          message: error.message ?? 'Quá nhiều yêu cầu, vui lòng thử lại sau',
        );

      case StatusCode.unavailable:
        return NetworkException(
          message: error.message ?? 'Không thể kết nối đến máy chủ',
        );

      case StatusCode.deadlineExceeded:
        return TimeoutException(
          message: error.message ?? 'Yêu cầu đã hết thời gian chờ',
        );

      case StatusCode.internal:
        return ServerException(
          message: error.message ?? 'Lỗi máy chủ, vui lòng thử lại sau',
        );

      case StatusCode.unimplemented:
        return ServerException(
          message: 'Chức năng chưa được triển khai',
        );

      case StatusCode.dataLoss:
      case StatusCode.unknown:
      default:
        return ServerException(
          message: error.message ?? 'Đã xảy ra lỗi, vui lòng thử lại',
        );
    }
  }

  /// Execute gRPC call with error mapping
  static Future<T> execute<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on GrpcError catch (e) {
      throw mapGrpcError(e);
    } catch (e) {
      throw ServerException(
        message: 'Đã xảy ra lỗi không xác định: $e',
      );
    }
  }

  /// Check if error is authentication related
  static bool isAuthError(Exception error) {
    return error is UnauthorizedException || error is ForbiddenException;
  }

  /// Check if error is network related
  static bool isNetworkError(Exception error) {
    return error is NetworkException || error is TimeoutException;
  }

  /// Check if error is validation related
  static bool isValidationError(Exception error) {
    return error is ValidationException;
  }

  /// Get user-friendly error message
  static String getUserMessage(Exception error) {
    if (error is AppException) {
      return error.message;
    }
    return 'Đã xảy ra lỗi, vui lòng thử lại';
  }
}

/// Base application exception
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  AppException({
    required this.message,
    this.code,
    this.details,
  });

  @override
  String toString() => message;
}

/// Authentication exceptions
class UnauthorizedException extends AppException {
  UnauthorizedException({required super.message, super.code, super.details});
}

class ForbiddenException extends AppException {
  ForbiddenException({required super.message, super.code, super.details});
}

/// Validation exceptions
class ValidationException extends AppException {
  ValidationException({required super.message, super.code, super.details});
}

/// Resource exceptions
class NotFoundException extends AppException {
  NotFoundException({required super.message, super.code, super.details});
}

class ConflictException extends AppException {
  ConflictException({required super.message, super.code, super.details});
}

/// Rate limiting
class RateLimitException extends AppException {
  RateLimitException({required super.message, super.code, super.details});
}

/// Network exceptions (already exist in core/errors/exceptions.dart)
/// These are just type aliases for compatibility
class NetworkException extends AppException {
  NetworkException({required super.message, super.code, super.details});
}

class TimeoutException extends AppException {
  TimeoutException({required super.message, super.code, super.details});
}

class ServerException extends AppException {
  ServerException({required super.message, super.code, super.details});
}




