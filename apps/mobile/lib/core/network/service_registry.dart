import 'package:mobile/core/network/clients/user_service_client.dart';
import 'package:mobile/core/network/clients/question_service_client.dart';
import 'package:mobile/core/network/clients/exam_service_client.dart';
import 'package:mobile/core/network/clients/library_service_client.dart';
import 'package:mobile/core/network/clients/analytics_service_client.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/utils/logger.dart';

/// Central registry for all gRPC service clients
/// 
/// Provides singleton access to all service wrappers
class ServiceRegistry {
  // User Service
  static UserServiceClientWrapper get userService => 
      UserServiceClientWrapper();
  
  // Question Services
  static QuestionServiceClientWrapper get questionService => 
      QuestionServiceClientWrapper();
  
  static QuestionFilterServiceClientWrapper get questionFilterService => 
      QuestionFilterServiceClientWrapper();
  
  // Exam Services
  static ExamServiceClientWrapper get examService => 
      ExamServiceClientWrapper();
  
  static ExamSessionServiceClientWrapper get examSessionService => 
      ExamSessionServiceClientWrapper();
  
  // Library Service
  static LibraryServiceClientWrapper get libraryService => 
      LibraryServiceClientWrapper();
  
  // Analytics Service
  static AnalyticsServiceClientWrapper get analyticsService => 
      AnalyticsServiceClientWrapper();
  
  /// Initialize all service clients and gRPC channel
  static Future<void> initializeAll() async {
    AppLogger.info('Initializing Service Registry...');
    
    try {
      // Initialize gRPC channel
      await GrpcClientConfig.initialize();
      
      // Pre-initialize all service clients (singletons)
      userService;
      questionService;
      questionFilterService;
      examService;
      examSessionService;
      libraryService;
      analyticsService;
      
      AppLogger.info('✓ All services initialized');
    } catch (e) {
      AppLogger.error('Failed to initialize services', e);
      rethrow;
    }
  }
  
  /// Shutdown all services and close gRPC channel
  static Future<void> shutdown() async {
    AppLogger.info('Shutting down Service Registry...');
    
    try {
      await GrpcClientConfig.shutdown();
      AppLogger.info('✓ Service Registry shut down');
    } catch (e) {
      AppLogger.error('Error during shutdown', e);
    }
  }
  
  /// Test connection to all services
  static Future<Map<String, bool>> testAllServices() async {
    final results = <String, bool>{};
    
    AppLogger.info('Testing all service connections...');
    
    results['UserService'] = await _testService('UserService', () async {
      // Will be implemented after proto generation
      return true;
    });
    
    results['QuestionService'] = await _testService('QuestionService', () async {
      // Will be implemented after proto generation
      return true;
    });
    
    results['ExamService'] = await _testService('ExamService', () async {
      // Will be implemented after proto generation
      return true;
    });
    
    results['LibraryService'] = await _testService('LibraryService', () async {
      // Will be implemented after proto generation
      return true;
    });
    
    results['AnalyticsService'] = await _testService('AnalyticsService', () async {
      // Will be implemented after proto generation
      return true;
    });
    
    return results;
  }
  
  static Future<bool> _testService(
    String serviceName,
    Future<bool> Function() test,
  ) async {
    try {
      final result = await test();
      AppLogger.info('$serviceName: ${result ? "✓" : "✗"}');
      return result;
    } catch (e) {
      AppLogger.error('$serviceName test failed', e);
      return false;
    }
  }
}

