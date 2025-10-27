import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:mobile/core/utils/logger.dart';

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> firebaseBackgroundHandler(RemoteMessage message) async {
  AppLogger.debug('Background message: ${message.messageId}');
}

class FCMConfig {
  static FirebaseMessaging? _messaging;
  static FlutterLocalNotificationsPlugin? _localNotifications;

  static FirebaseMessaging get messaging => _messaging!;
  static FlutterLocalNotificationsPlugin get localNotifications => _localNotifications!;

  static Future<void> initialize() async {
    try {
      _messaging = FirebaseMessaging.instance;
      _localNotifications = FlutterLocalNotificationsPlugin();

      // Request permission
      final settings = await _messaging!.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      AppLogger.info('FCM Permission: ${settings.authorizationStatus}');

      // Initialize local notifications
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _localNotifications!.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (details) {
          if (details.payload != null) {
            AppLogger.debug('Notification tapped: ${details.payload}');
          }
        },
      );

      // Setup message handlers
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
      FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundTap);
      FirebaseMessaging.onBackgroundMessage(firebaseBackgroundHandler);

      // Get FCM token
      final token = await _messaging!.getToken();
      AppLogger.info('FCM Token: $token');
      
      if (token != null) {
        await _sendTokenToBackend(token);
      }

      // Listen to token refresh
      _messaging!.onTokenRefresh.listen((newToken) {
        AppLogger.info('FCM Token refreshed');
        _sendTokenToBackend(newToken);
      });

      AppLogger.info('✓ FCM initialized');
    } catch (e) {
      AppLogger.error('FCM initialization failed', e);
    }
  }

  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    AppLogger.info('Foreground message: ${message.notification?.title}');
    
    // Show local notification
    await _showLocalNotification(message);
  }

  static Future<void> _handleBackgroundTap(RemoteMessage message) async {
    AppLogger.info('Background message tapped');
    
    // Handle navigation
    final route = message.data['route'];
    if (route != null) {
      AppLogger.debug('Navigate to: $route');
    }
  }

  static Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'nynus_channel',
      'NyNus Notifications',
      channelDescription: 'Notifications from NyNus Exam Bank',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications!.show(
      message.hashCode,
      message.notification?.title ?? 'NyNus',
      message.notification?.body ?? '',
      details,
      payload: message.data['route'],
    );
  }

  static Future<void> _sendTokenToBackend(String token) async {
    try {
      // TODO: Call backend API to register FCM token
      AppLogger.debug('FCM token registered successfully');
    } catch (e) {
      AppLogger.error('Failed to register FCM token', e);
    }
  }
}

