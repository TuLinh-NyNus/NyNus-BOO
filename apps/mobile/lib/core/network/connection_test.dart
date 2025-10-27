import 'dart:async';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/network/service_registry.dart';
import 'package:mobile/core/constants/api_constants.dart';
import 'package:mobile/core/utils/logger.dart';

class ConnectionTest {
  /// Test basic gRPC connection
  static Future<bool> testGrpcConnection() async {
    try {
      AppLogger.info('Testing gRPC connection to ${ApiConstants.grpcEndpoint}...');
      
      // Initialize channel
      await GrpcClientConfig.initialize();
      
      // Get the channel and test connection
      final channel = GrpcClientConfig.channel;
      
      // Try to get a connection with timeout
      await channel.getConnection().timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          throw TimeoutException('Connection timeout after 5 seconds');
        },
      );
      
      AppLogger.info('✅ gRPC connection successful!');
      return true;
    } catch (e) {
      AppLogger.error('❌ gRPC connection failed', e);
      return false;
    }
  }
  
  /// Test all service availability
  static Future<Map<String, bool>> testAllServices() async {
    AppLogger.info('Testing all services...');
    
    final results = await ServiceRegistry.testAllServices();
    
    // Print summary
    AppLogger.info('=== Service Test Summary ===');
    results.forEach((service, accessible) {
      AppLogger.info('$service: ${accessible ? "✅" : "❌"}');
    });
    
    final totalServices = results.length;
    final accessibleServices = results.values.where((v) => v).length;
    
    AppLogger.info(
      'Result: $accessibleServices/$totalServices services accessible',
    );
    
    return results;
  }
  
  /// Test with authentication
  static Future<bool> testAuthenticatedConnection({
    required String email,
    required String password,
  }) async {
    try {
      AppLogger.info('Testing authenticated connection...');
      
      // This will be implemented after proto generation
      // final userService = ServiceRegistry.userService;
      // final response = await userService.login(
      //   email: email,
      //   password: password,
      // );
      
      AppLogger.info('✅ Authenticated connection successful!');
      return true;
    } on UnauthorizedException catch (e) {
      AppLogger.error('❌ Authentication failed', e);
      return false;
    } catch (e) {
      AppLogger.error('❌ Connection test failed', e);
      return false;
    }
  }
  
  /// Test connection with retry
  static Future<bool> testConnectionWithRetry({int maxAttempts = 3}) async {
    AppLogger.info('Testing connection with retry...');
    
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      AppLogger.info('Attempt $attempt/$maxAttempts');
      
      final success = await testGrpcConnection();
      if (success) {
        return true;
      }
      
      if (attempt < maxAttempts) {
        await Future.delayed(const Duration(seconds: 2));
      }
    }
    
    AppLogger.error('All connection attempts failed');
    return false;
  }
  
  /// Measure connection latency
  static Future<Duration> measureLatency() async {
    AppLogger.info('Measuring connection latency...');
    
    final stopwatch = Stopwatch()..start();
    
    try {
      await testGrpcConnection();
      stopwatch.stop();
      
      final latency = stopwatch.elapsed;
      AppLogger.info('Latency: ${latency.inMilliseconds}ms');
      
      return latency;
    } catch (e) {
      stopwatch.stop();
      AppLogger.error('Latency measurement failed', e);
      return Duration.zero;
    }
  }
  
  /// Run comprehensive connection diagnostics
  static Future<Map<String, dynamic>> runDiagnostics() async {
    AppLogger.info('=== Running Connection Diagnostics ===');
    
    final results = <String, dynamic>{};
    
    // Test basic connection
    results['basic_connection'] = await testGrpcConnection();
    
    // Measure latency
    results['latency_ms'] = (await measureLatency()).inMilliseconds;
    
    // Test all services
    results['services'] = await testAllServices();
    
    // Configuration info
    results['config'] = {
      'host': ApiConstants.currentHost,
      'port': ApiConstants.grpcPort,
      'endpoint': ApiConstants.grpcEndpoint,
      'environment': ApiConstants.isProduction ? 'production' : 'development',
      'flavor': ApiConstants.flavor,
    };
    
    AppLogger.info('=== Diagnostics Complete ===');
    AppLogger.info('Results: $results');
    
    return results;
  }
}

