import 'dart:io';

class ApiConstants {
  // Base URLs
  static const String productionHost = 'api.nynus-exambank.com';
  static const String developmentHost = '10.0.2.2'; // Android emulator
  static const String iosSimulatorHost = 'localhost';
  static const String stagingHost = 'staging-api.nynus-exambank.com';
  
  // Ports
  static const int grpcPort = 50051;
  static const int httpPort = 8080;
  
  // Environment
  static const bool isProduction = bool.fromEnvironment(
    'dart.vm.product',
    defaultValue: false,
  );
  
  static const String flavor = String.fromEnvironment(
    'FLAVOR',
    defaultValue: 'dev',
  );
  
  // Get current host based on platform and environment
  static String get currentHost {
    if (isProduction || flavor == 'prod') {
      return productionHost;
    }
    
    if (flavor == 'staging') {
      return stagingHost;
    }
    
    // In development, check platform
    if (Platform.isAndroid) {
      return developmentHost;
    } else if (Platform.isIOS) {
      return iosSimulatorHost;
    }
    return developmentHost;
  }
  
  // gRPC endpoint
  static String get grpcEndpoint => '$currentHost:$grpcPort';
  
  // HTTP endpoint (for file uploads, etc)
  static String get httpEndpoint {
    final protocol = (isProduction || flavor == 'prod') ? 'https' : 'http';
    return '$protocol://$currentHost:$httpPort';
  }
  
  // WebSocket endpoint
  static String get wsEndpoint {
    final protocol = (isProduction || flavor == 'prod') ? 'wss' : 'ws';
    return '$protocol://$currentHost:$httpPort/ws';
  }
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration requestTimeout = Duration(seconds: 60);
  static const Duration longRequestTimeout = Duration(minutes: 5);
  
  // Retry
  static const int maxRetryAttempts = 3;
  static const Duration retryDelay = Duration(seconds: 1);
  static const Duration maxRetryDelay = Duration(seconds: 10);
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Cache
  static const Duration cacheExpiration = Duration(hours: 1);
  static const Duration shortCacheExpiration = Duration(minutes: 15);
  static const Duration longCacheExpiration = Duration(days: 1);
  
  // File Upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  
  // Development helpers
  static void printConfig() {
    print('=== API Configuration ===');
    print('Environment: ${isProduction ? "Production" : "Development"}');
    print('Flavor: $flavor');
    print('Host: $currentHost');
    print('gRPC Endpoint: $grpcEndpoint');
    print('HTTP Endpoint: $httpEndpoint');
    print('Platform: ${Platform.operatingSystem}');
    print('========================');
  }
}

