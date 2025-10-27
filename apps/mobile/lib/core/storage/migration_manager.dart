import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/core/utils/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MigrationManager {
  static const String _versionKey = 'storage_version';
  static const int currentVersion = 1;

  static Future<void> runMigrations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedVersion = prefs.getInt(_versionKey) ?? 0;
      
      if (storedVersion < currentVersion) {
        AppLogger.info('Running migrations from v$storedVersion to v$currentVersion');
        
        // Run migrations in order
        for (int version = storedVersion + 1; version <= currentVersion; version++) {
          await _runMigration(version);
        }
        
        // Update version
        await prefs.setInt(_versionKey, currentVersion);
        AppLogger.info('✓ Migrations complete');
      } else {
        AppLogger.debug('Storage is up to date (v$currentVersion)');
      }
    } catch (e) {
      AppLogger.error('Migration failed', e);
      rethrow;
    }
  }

  static Future<void> _runMigration(int version) async {
    switch (version) {
      case 1:
        await _migrateV1();
        break;
      // Add future migrations here
      // case 2:
      //   await _migrateV2();
      //   break;
    }
  }

  static Future<void> _migrateV1() async {
    // Example: Migrate from SharedPreferences to Hive
    AppLogger.info('Running migration v1: Initial setup');
    
    final prefs = await SharedPreferences.getInstance();
    
    // Migrate settings if they exist
    final oldTheme = prefs.getString('theme');
    if (oldTheme != null) {
      await HiveStorage.settingsBox.put('theme_mode', oldTheme);
      await prefs.remove('theme');
      AppLogger.debug('Migrated theme setting');
    }
    
    // Add other migration logic as needed
    AppLogger.info('✓ Migration v1 complete');
  }

  // Backup current data before migration
  static Future<Map<String, dynamic>> backupData() async {
    try {
      final backup = <String, dynamic>{};
      
      // Backup all boxes
      backup['user'] = Map.fromEntries(
        HiveStorage.userBox.keys.map((key) => 
          MapEntry(key.toString(), HiveStorage.userBox.get(key))),
      );
      
      backup['settings'] = Map.fromEntries(
        HiveStorage.settingsBox.keys.map((key) => 
          MapEntry(key.toString(), HiveStorage.settingsBox.get(key))),
      );
      
      backup['questions'] = Map.fromEntries(
        HiveStorage.questionsBox.keys.map((key) => 
          MapEntry(key.toString(), HiveStorage.questionsBox.get(key))),
      );
      
      backup['exams'] = Map.fromEntries(
        HiveStorage.examsBox.keys.map((key) => 
          MapEntry(key.toString(), HiveStorage.examsBox.get(key))),
      );
      
      backup['timestamp'] = DateTime.now().toIso8601String();
      backup['version'] = currentVersion;
      
      AppLogger.info('Created data backup');
      
      return backup;
    } catch (e) {
      AppLogger.error('Failed to create backup', e);
      rethrow;
    }
  }

  // Restore from backup
  static Future<void> restoreData(Map<String, dynamic> backup) async {
    try {
      AppLogger.info('Restoring data from backup...');
      
      // Clear current data
      await HiveStorage.clearAll();
      
      // Restore each box
      final userData = backup['user'] as Map<String, dynamic>?;
      if (userData != null) {
        for (final entry in userData.entries) {
          await HiveStorage.userBox.put(entry.key, entry.value);
        }
        AppLogger.debug('Restored user data');
      }
      
      final settingsData = backup['settings'] as Map<String, dynamic>?;
      if (settingsData != null) {
        for (final entry in settingsData.entries) {
          await HiveStorage.settingsBox.put(entry.key, entry.value);
        }
        AppLogger.debug('Restored settings data');
      }
      
      final questionsData = backup['questions'] as Map<String, dynamic>?;
      if (questionsData != null) {
        for (final entry in questionsData.entries) {
          await HiveStorage.questionsBox.put(entry.key, entry.value);
        }
        AppLogger.debug('Restored questions data');
      }
      
      final examsData = backup['exams'] as Map<String, dynamic>?;
      if (examsData != null) {
        for (final entry in examsData.entries) {
          await HiveStorage.examsBox.put(entry.key, entry.value);
        }
        AppLogger.debug('Restored exams data');
      }
      
      AppLogger.info('✓ Data restore complete');
    } catch (e) {
      AppLogger.error('Failed to restore data', e);
      rethrow;
    }
  }
}

