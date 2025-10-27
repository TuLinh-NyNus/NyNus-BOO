import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:mobile/core/analytics/firebase_config.dart';
import 'package:mobile/core/analytics/analytics_events.dart';
import 'package:mobile/core/utils/logger.dart';

class AnalyticsService {
  static final AnalyticsService _instance = AnalyticsService._internal();
  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

  FirebaseAnalytics get _analytics => FirebaseConfig.analytics;

  // Screen tracking
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics.logScreenView(
        screenName: screenName,
        screenClass: screenClass ?? screenName,
        parameters: parameters,
      );
      AppLogger.debug('Screen view: $screenName');
    } catch (e) {
      AppLogger.error('Failed to log screen view', e);
    }
  }

  // Auth events
  Future<void> logLogin(String method) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.login,
      parameters: {
        'method': method,
      },
    );
    AppLogger.info('Analytics: Login ($method)');
  }

  Future<void> logSignUp(String method) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.signUp,
      parameters: {
        'method': method,
      },
    );
    AppLogger.info('Analytics: Sign up ($method)');
  }

  Future<void> logLogout() async {
    await _analytics.logEvent(
      name: AnalyticsEvents.logout,
    );
    AppLogger.info('Analytics: Logout');
  }

  // Content events
  Future<void> logViewContent({
    required String contentType,
    required String contentId,
    String? contentName,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.viewContent,
      parameters: {
        'content_type': contentType,
        'content_id': contentId,
        if (contentName != null) 'content_name': contentName,
      },
    );
  }

  Future<void> logSearch({
    required String query,
    required String searchType,
    int? resultCount,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.search,
      parameters: {
        'search_term': query,
        'search_type': searchType,
        if (resultCount != null) 'result_count': resultCount,
      },
    );
  }

  Future<void> logShare({
    required String contentType,
    required String contentId,
    String? method,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.share,
      parameters: {
        'content_type': contentType,
        'content_id': contentId,
        if (method != null) 'method': method,
      },
    );
  }

  // Exam events
  Future<void> logExamStart({
    required String examId,
    required String examTitle,
    required int questionCount,
    required int duration,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.examStart,
      parameters: {
        'exam_id': examId,
        'exam_title': examTitle,
        'question_count': questionCount,
        'duration': duration,
      },
    );
  }

  Future<void> logExamComplete({
    required String examId,
    required String examTitle,
    required double score,
    required double percentage,
    required int timeSpent,
    required bool passed,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.examComplete,
      parameters: {
        'exam_id': examId,
        'exam_title': examTitle,
        'score': score,
        'percentage': percentage,
        'time_spent': timeSpent,
        'passed': passed,
      },
    );
  }

  Future<void> logExamAbandoned({
    required String examId,
    required int questionsAnswered,
    required int totalQuestions,
    required int timeSpent,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.examAbandoned,
      parameters: {
        'exam_id': examId,
        'questions_answered': questionsAnswered,
        'total_questions': totalQuestions,
        'time_spent': timeSpent,
        'completion_rate': (questionsAnswered / totalQuestions * 100).round(),
      },
    );
  }

  // Download events
  Future<void> logDownloadStart({
    required String contentType,
    required String contentId,
    required int fileSize,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.downloadStart,
      parameters: {
        'content_type': contentType,
        'content_id': contentId,
        'file_size': fileSize,
      },
    );
  }

  Future<void> logDownloadComplete({
    required String contentType,
    required String contentId,
    required int fileSize,
    required int duration,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.downloadComplete,
      parameters: {
        'content_type': contentType,
        'content_id': contentId,
        'file_size': fileSize,
        'duration': duration,
        'speed_kbps': (fileSize / duration * 8 / 1024).round(),
      },
    );
  }

  // Engagement events
  Future<void> logBookmark({
    required String contentType,
    required String contentId,
    required bool isBookmarked,
  }) async {
    await _analytics.logEvent(
      name: isBookmarked 
          ? AnalyticsEvents.bookmarkAdd 
          : AnalyticsEvents.bookmarkRemove,
      parameters: {
        'content_type': contentType,
        'content_id': contentId,
      },
    );
  }

  Future<void> logRating({
    required String contentType,
    required String contentId,
    required int rating,
    String? comment,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.rate,
      parameters: {
        'content_type': contentType,
        'content_id': contentId,
        'rating': rating,
        if (comment != null) 'has_comment': true,
      },
    );
  }

  // Settings events
  Future<void> logSettingsChange({
    required String settingName,
    required String newValue,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.settingsChange,
      parameters: {
        'setting_name': settingName,
        'new_value': newValue,
      },
    );
  }

  // Error tracking
  Future<void> logError({
    required String errorType,
    required String errorMessage,
    String? stackTrace,
    Map<String, dynamic>? additionalData,
  }) async {
    await _analytics.logEvent(
      name: AnalyticsEvents.error,
      parameters: {
        'error_type': errorType,
        'error_message': errorMessage,
        if (stackTrace != null) 'has_stack_trace': true,
        ...?additionalData,
      },
    );
    
    // Also log to Crashlytics
    await FirebaseConfig.crashlytics.recordError(
      Exception(errorMessage),
      stackTrace != null ? StackTrace.fromString(stackTrace) : null,
      reason: errorType,
      information: additionalData?.entries.map((e) => '${e.key}: ${e.value}').toList() ?? [],
    );
  }

  // Custom events
  Future<void> logCustomEvent({
    required String eventName,
    Map<String, dynamic>? parameters,
  }) async {
    await _analytics.logEvent(
      name: eventName,
      parameters: parameters,
    );
  }
}

