import 'package:flutter/material.dart';
import 'package:mobile/core/storage/hive_storage.dart';

class AppSettings {
  static const String _themeKey = 'theme_mode';
  static const String _languageKey = 'language';
  static const String _fontSizeKey = 'font_size';
  static const String _offlineModeKey = 'offline_mode';
  static const String _autoSyncKey = 'auto_sync';
  static const String _notificationsKey = 'notifications_enabled';
  static const String _soundsKey = 'sounds_enabled';
  static const String _vibrateKey = 'vibrate_enabled';
  static const String _downloadOverWifiKey = 'download_wifi_only';
  static const String _cacheImagesKey = 'cache_images';
  static const String _examTimerWarningKey = 'exam_timer_warning';

  // Theme
  static Future<ThemeMode> getThemeMode() async {
    final value = HiveStorage.settingsBox.get(_themeKey);
    if (value == null) return ThemeMode.system;
    
    switch (value) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  static Future<void> setThemeMode(ThemeMode mode) async {
    String value;
    switch (mode) {
      case ThemeMode.light:
        value = 'light';
        break;
      case ThemeMode.dark:
        value = 'dark';
        break;
      case ThemeMode.system:
        value = 'system';
        break;
    }
    await HiveStorage.settingsBox.put(_themeKey, value);
  }

  // Language
  static Future<String> getLanguage() async {
    return HiveStorage.settingsBox.get(_languageKey, defaultValue: 'vi') as String;
  }

  static Future<void> setLanguage(String languageCode) async {
    await HiveStorage.settingsBox.put(_languageKey, languageCode);
  }

  // Font Size
  static Future<double> getFontSize() async {
    return (HiveStorage.settingsBox.get(_fontSizeKey, defaultValue: 1.0) as num).toDouble();
  }

  static Future<void> setFontSize(double scale) async {
    await HiveStorage.settingsBox.put(_fontSizeKey, scale);
  }

  // Offline Mode
  static Future<bool> isOfflineMode() async {
    return HiveStorage.settingsBox.get(_offlineModeKey, defaultValue: false) as bool;
  }

  static Future<void> setOfflineMode(bool enabled) async {
    await HiveStorage.settingsBox.put(_offlineModeKey, enabled);
  }

  // Auto Sync
  static Future<bool> isAutoSyncEnabled() async {
    return HiveStorage.settingsBox.get(_autoSyncKey, defaultValue: true) as bool;
  }

  static Future<void> setAutoSync(bool enabled) async {
    await HiveStorage.settingsBox.put(_autoSyncKey, enabled);
  }

  // Notifications
  static Future<bool> areNotificationsEnabled() async {
    return HiveStorage.settingsBox.get(_notificationsKey, defaultValue: true) as bool;
  }

  static Future<void> setNotifications(bool enabled) async {
    await HiveStorage.settingsBox.put(_notificationsKey, enabled);
  }

  // Sounds
  static Future<bool> areSoundsEnabled() async {
    return HiveStorage.settingsBox.get(_soundsKey, defaultValue: true) as bool;
  }

  static Future<void> setSounds(bool enabled) async {
    await HiveStorage.settingsBox.put(_soundsKey, enabled);
  }

  // Vibrate
  static Future<bool> isVibrateEnabled() async {
    return HiveStorage.settingsBox.get(_vibrateKey, defaultValue: true) as bool;
  }

  static Future<void> setVibrate(bool enabled) async {
    await HiveStorage.settingsBox.put(_vibrateKey, enabled);
  }

  // Download Settings
  static Future<bool> isDownloadWifiOnly() async {
    return HiveStorage.settingsBox.get(_downloadOverWifiKey, defaultValue: true) as bool;
  }

  static Future<void> setDownloadWifiOnly(bool wifiOnly) async {
    await HiveStorage.settingsBox.put(_downloadOverWifiKey, wifiOnly);
  }

  // Cache Images
  static Future<bool> shouldCacheImages() async {
    return HiveStorage.settingsBox.get(_cacheImagesKey, defaultValue: true) as bool;
  }

  static Future<void> setCacheImages(bool cache) async {
    await HiveStorage.settingsBox.put(_cacheImagesKey, cache);
  }

  // Exam Timer Warning (minutes before end)
  static Future<int> getExamTimerWarning() async {
    return HiveStorage.settingsBox.get(_examTimerWarningKey, defaultValue: 5) as int;
  }

  static Future<void> setExamTimerWarning(int minutes) async {
    await HiveStorage.settingsBox.put(_examTimerWarningKey, minutes);
  }

  // Reset all settings
  static Future<void> resetToDefaults() async {
    await HiveStorage.settingsBox.clear();
  }

  // Export settings
  static Future<Map<String, dynamic>> exportSettings() async {
    final settings = <String, dynamic>{};
    
    for (final key in HiveStorage.settingsBox.keys) {
      settings[key.toString()] = HiveStorage.settingsBox.get(key);
    }
    
    return settings;
  }

  // Import settings
  static Future<void> importSettings(Map<String, dynamic> settings) async {
    for (final entry in settings.entries) {
      await HiveStorage.settingsBox.put(entry.key, entry.value);
    }
  }
}

