class ServerException implements Exception {
  final String message;
  
  ServerException([this.message = 'Server error occurred']);
  
  @override
  String toString() => 'ServerException: $message';
}

class CacheException implements Exception {
  final String message;
  
  CacheException([this.message = 'Cache error occurred']);
  
  @override
  String toString() => 'CacheException: $message';
}

class NetworkException implements Exception {
  final String message;
  
  NetworkException([this.message = 'Network error occurred']);
  
  @override
  String toString() => 'NetworkException: $message';
}

class AuthenticationException implements Exception {
  final String message;
  
  AuthenticationException([this.message = 'Authentication failed']);
  
  @override
  String toString() => 'AuthenticationException: $message';
}

class ValidationException implements Exception {
  final String message;
  
  ValidationException([this.message = 'Validation error']);
  
  @override
  String toString() => 'ValidationException: $message';
}

