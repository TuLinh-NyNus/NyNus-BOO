import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:mobile/core/analytics/firebase_config.dart';
import 'package:mobile/core/utils/logger.dart';
import 'package:flutter/foundation.dart';

class CrashReporter {
  static final CrashReporter _instance = CrashReporter._internal();
  factory CrashReporter() => _instance;
  CrashReporter._internal();

  FirebaseCrashlytics get _crashlytics => FirebaseConfig.crashlytics;

  // Record error
  Future<void> recordError({
    required dynamic exception,
    StackTrace? stackTrace,
    String? reason,
    bool fatal = false,
    Map<String, dynamic>? customKeys,
  }) async {
    try {
      // Add custom keys
      if (customKeys != null) {
        for (final entry in customKeys.entries) {
          await _crashlytics.setCustomKey(entry.key, entry.value);
        }
      }

      // Record error
      await _crashlytics.recordError(
        exception,
        stackTrace,
        reason: reason,
        fatal: fatal,
      );
      
      AppLogger.error('Crash reported: $reason', exception);
    } catch (e) {
      AppLogger.error('Failed to record crash', e);
    }
  }

  // Record Flutter error
  Future<void> recordFlutterError(FlutterErrorDetails details) async {
    await _crashlytics.recordFlutterFatalError(details);
  }

  // Log message
  Future<void> log(String message) async {
    await _crashlytics.log(message);
  }

  // Set user context
  Future<void> setUserContext({
    required String userId,
    String? email,
    Map<String, String>? customAttributes,
  }) async {
    await _crashlytics.setUserIdentifier(userId);
    
    if (email != null) {
      await _crashlytics.setCustomKey('user_email', email);
    }
    
    if (customAttributes != null) {
      for (final entry in customAttributes.entries) {
        await _crashlytics.setCustomKey(entry.key, entry.value);
      }
    }
    
    AppLogger.debug('Crash reporter user context set: $userId');
  }

  // Clear user context
  Future<void> clearUserContext() async {
    await _crashlytics.setUserIdentifier('');
    AppLogger.debug('Crash reporter user context cleared');
  }

  // Test crash (debug only)
  void forceCrash() {
    if (kDebugMode) {
      _crashlytics.crash();
    }
  }

  // Check if crash reporting is enabled
  Future<bool> isCrashlyticsCollectionEnabled() async {
    return await _crashlytics.isCrashlyticsCollectionEnabled();
  }

  // Enable/disable crash reporting
  Future<void> setCrashlyticsCollectionEnabled(bool enabled) async {
    await _crashlytics.setCrashlyticsCollectionEnabled(enabled);
  }
}

