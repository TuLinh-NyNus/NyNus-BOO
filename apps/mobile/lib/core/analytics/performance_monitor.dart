import 'package:firebase_performance/firebase_performance.dart';
import 'package:mobile/core/analytics/firebase_config.dart';
import 'package:mobile/core/utils/logger.dart';

class PerformanceMonitor {
  static final PerformanceMonitor _instance = PerformanceMonitor._internal();
  factory PerformanceMonitor() => _instance;
  PerformanceMonitor._internal();

  FirebasePerformance get _performance => FirebaseConfig.performance;

  // Custom traces
  Future<Trace> startTrace(String traceName) async {
    final trace = _performance.newTrace(traceName);
    trace.putAttribute('name', traceName);
    await trace.start();
    AppLogger.debug('Performance trace started: $traceName');
    return trace;
  }

  Future<void> stopTrace(Trace trace) async {
    await trace.stop();
    AppLogger.debug('Performance trace stopped');
  }

  // Network monitoring
  HttpMetric startHttpMetric({
    required String url,
    required HttpMethod httpMethod,
  }) {
    return _performance.newHttpMetric(url, httpMethod);
  }

  // Common traces
  Future<T> traceOperation<T>({
    required String traceName,
    required Future<T> Function() operation,
    Map<String, String>? attributes,
    Map<String, int>? metrics,
  }) async {
    final trace = await startTrace(traceName);
    
    try {
      // Add custom attributes
      if (attributes != null) {
        for (final entry in attributes.entries) {
          trace.putAttribute(entry.key, entry.value);
        }
      }
      
      // Execute operation
      final result = await operation();
      
      // Add custom metrics
      if (metrics != null) {
        for (final entry in metrics.entries) {
          trace.setMetric(entry.key, entry.value);
        }
      }
      
      return result;
    } catch (e) {
      trace.putAttribute('error', e.toString());
      rethrow;
    } finally {
      await stopTrace(trace);
    }
  }

  // Exam performance tracking
  Future<T> traceExamOperation<T>({
    required String examId,
    required String operation,
    required Future<T> Function() task,
  }) async {
    return traceOperation(
      traceName: 'exam_$operation',
      operation: task,
      attributes: {
        'exam_id': examId,
      },
    );
  }

  // Download performance tracking
  Future<void> traceDownload({
    required String contentId,
    required int fileSize,
    required Future<void> Function() download,
  }) async {
    await traceOperation(
      traceName: 'download_content',
      operation: download,
      attributes: {
        'content_id': contentId,
      },
      metrics: {
        'file_size_bytes': fileSize,
      },
    );
  }

  // Network request tracking
  Future<T> traceNetworkRequest<T>({
    required String url,
    required HttpMethod method,
    required Future<T> Function() request,
  }) async {
    final metric = startHttpMetric(url: url, httpMethod: method);
    
    try {
      await metric.start();
      
      final result = await request();
      
      // Use putAttribute instead of deprecated methods
      metric.putAttribute('http_response_code', '200');
      metric.putAttribute('response_payload_size', '1024');
      
      return result;
    } catch (e) {
      metric.putAttribute('http_response_code', '500');
      rethrow;
    } finally {
      await metric.stop();
    }
  }
}

// Trace names
class PerformanceTraces {
  static const String appStart = 'app_start';
  static const String login = 'login';
  static const String examLoad = 'exam_load';
  static const String examSubmit = 'exam_submit';
  static const String questionLoad = 'question_load';
  static const String pdfRender = 'pdf_render';
  static const String katexRender = 'katex_render';
  static const String downloadContent = 'download_content';
  static const String syncData = 'sync_data';
}

