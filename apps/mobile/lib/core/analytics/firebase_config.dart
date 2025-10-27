import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_performance/firebase_performance.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/core/utils/logger.dart';

class FirebaseConfig {
  static FirebaseAnalytics? _analytics;
  static FirebaseCrashlytics? _crashlytics;
  static FirebasePerformance? _performance;

  static FirebaseAnalytics get analytics => _analytics!;
  static FirebaseCrashlytics get crashlytics => _crashlytics!;
  static FirebasePerformance get performance => _performance!;

  static Future<void> initialize() async {
    try {
      // Initialize Firebase
      await Firebase.initializeApp();
      AppLogger.info('Firebase initialized');

      // Initialize Analytics
      _analytics = FirebaseAnalytics.instance;
      await _analytics!.setAnalyticsCollectionEnabled(true);
      AppLogger.info('✓ Firebase Analytics enabled');

      // Initialize Crashlytics
      _crashlytics = FirebaseCrashlytics.instance;
      
      // Enable Crashlytics collection
      await _crashlytics!.setCrashlyticsCollectionEnabled(true);
      
      // Pass all uncaught errors to Crashlytics
      FlutterError.onError = _crashlytics!.recordFlutterFatalError;
      
      // Pass all uncaught asynchronous errors
      PlatformDispatcher.instance.onError = (error, stack) {
        _crashlytics!.recordError(error, stack, fatal: true);
        return true;
      };
      
      AppLogger.info('✓ Firebase Crashlytics enabled');

      // Initialize Performance
      _performance = FirebasePerformance.instance;
      await _performance!.setPerformanceCollectionEnabled(true);
      AppLogger.info('✓ Firebase Performance enabled');

      AppLogger.info('✅ Firebase initialized successfully');
    } catch (e, stack) {
      AppLogger.error('Firebase initialization failed', e);
      debugPrint(stack.toString());
    }
  }

  static Future<void> setUserId(String userId) async {
    await _analytics?.setUserId(id: userId);
    await _crashlytics?.setUserIdentifier(userId);
    AppLogger.debug('Set user ID: $userId');
  }

  static Future<void> setUserProperty({
    required String name,
    required String value,
  }) async {
    await _analytics?.setUserProperty(name: name, value: value);
    AppLogger.debug('Set user property: $name = $value');
  }

  static Future<void> clearUserId() async {
    await _analytics?.setUserId(id: null);
    await _crashlytics?.setUserIdentifier('');
    AppLogger.debug('Cleared user ID');
  }
}

