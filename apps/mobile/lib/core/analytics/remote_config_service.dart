import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:mobile/core/utils/logger.dart';

class RemoteConfigService {
  static final RemoteConfigService _instance = RemoteConfigService._internal();
  factory RemoteConfigService() => _instance;
  RemoteConfigService._internal();

  late final FirebaseRemoteConfig _remoteConfig;

  Future<void> initialize() async {
    try {
      _remoteConfig = FirebaseRemoteConfig.instance;
      
      // Set defaults
      await _remoteConfig.setDefaults(const {
        'feature_offline_exams_enabled': true,
        'feature_ai_recommendations_enabled': false,
        'max_download_size_mb': 100,
        'exam_timer_warning_minutes': 5,
        'cache_ttl_hours': 24,
        'show_ads': false,
        'min_app_version': '1.0.0',
      });

      // Configure fetch settings
      await _remoteConfig.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(seconds: 10),
          minimumFetchInterval: const Duration(hours: 1),
        ),
      );

      // Fetch and activate
      await _remoteConfig.fetchAndActivate();
      
      AppLogger.info('✓ Remote Config initialized');
    } catch (e) {
      AppLogger.error('Failed to fetch remote config', e);
    }
  }

  // Feature flags
  bool isFeatureEnabled(String featureName) {
    return _remoteConfig.getBool('feature_${featureName}_enabled');
  }

  // Config values
  int getInt(String key) {
    return _remoteConfig.getInt(key);
  }

  double getDouble(String key) {
    return _remoteConfig.getDouble(key);
  }

  String getString(String key) {
    return _remoteConfig.getString(key);
  }

  bool getBool(String key) {
    return _remoteConfig.getBool(key);
  }

  // Specific config getters
  int get maxDownloadSizeMB => getInt('max_download_size_mb');
  int get examTimerWarningMinutes => getInt('exam_timer_warning_minutes');
  int get cacheTTLHours => getInt('cache_ttl_hours');
  bool get showAds => getBool('show_ads');
  String get minAppVersion => getString('min_app_version');
  
  // Feature flags
  bool get offlineExamsEnabled => isFeatureEnabled('offline_exams');
  bool get aiRecommendationsEnabled => isFeatureEnabled('ai_recommendations');
}

