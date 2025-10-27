import 'dart:io';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:mobile/core/utils/logger.dart';

class HiveStorage {
  static late Box<dynamic> _userBox;
  static late Box<dynamic> _questionsBox;
  static late Box<dynamic> _examsBox;
  static late Box<dynamic> _cacheBox;
  static late Box<dynamic> _settingsBox;
  static late Box<dynamic> _syncQueueBox;

  // Box getters
  static Box<dynamic> get userBox => _userBox;
  static Box<dynamic> get questionsBox => _questionsBox;
  static Box<dynamic> get examsBox => _examsBox;
  static Box<dynamic> get cacheBox => _cacheBox;
  static Box<dynamic> get settingsBox => _settingsBox;
  static Box<dynamic> get syncQueueBox => _syncQueueBox;

  static Future<void> initialize() async {
    try {
      // Initialize Hive
      await Hive.initFlutter();
      
      // Get application documents directory
      final appDocDir = await getApplicationDocumentsDirectory();
      final hiveDir = Directory('${appDocDir.path}/hive');
      
      if (!await hiveDir.exists()) {
        await hiveDir.create(recursive: true);
      }
      
      AppLogger.info('Initializing Hive storage at: ${hiveDir.path}');
      
      // Open boxes
      _userBox = await Hive.openBox('user_box');
      _questionsBox = await Hive.openBox('questions_box');
      _examsBox = await Hive.openBox('exams_box');
      _cacheBox = await Hive.openBox('cache_box');
      _settingsBox = await Hive.openBox('settings_box');
      _syncQueueBox = await Hive.openBox('sync_queue_box');
      
      AppLogger.info('✓ Hive storage initialized with ${_getAllBoxes().length} boxes');
      
      // Clean up old cache on startup
      await _cleanupOldCache();
    } catch (e) {
      AppLogger.error('Failed to initialize Hive storage', e);
      rethrow;
    }
  }

  static Future<void> clearAll() async {
    for (final box in _getAllBoxes()) {
      await box.clear();
    }
    AppLogger.info('All Hive boxes cleared');
  }

  static Future<void> clearCache() async {
    await _cacheBox.clear();
    AppLogger.info('Cache box cleared');
  }

  static Future<void> close() async {
    for (final box in _getAllBoxes()) {
      await box.close();
    }
    AppLogger.info('All Hive boxes closed');
  }

  static List<Box> _getAllBoxes() {
    return [
      _userBox,
      _questionsBox,
      _examsBox,
      _cacheBox,
      _settingsBox,
      _syncQueueBox,
    ];
  }

  static Future<void> _cleanupOldCache() async {
    final now = DateTime.now();
    final keysToDelete = <dynamic>[];
    
    // Check all cache entries
    for (final key in _cacheBox.keys) {
      final entry = _cacheBox.get(key);
      if (entry is Map && entry['expiry'] != null) {
        try {
          final expiry = DateTime.parse(entry['expiry'].toString());
          if (now.isAfter(expiry)) {
            keysToDelete.add(key);
          }
        } catch (e) {
          // Invalid expiry format, delete it
          keysToDelete.add(key);
        }
      }
    }
    
    // Delete expired entries
    if (keysToDelete.isNotEmpty) {
      await _cacheBox.deleteAll(keysToDelete);
      AppLogger.info('Cleaned up ${keysToDelete.length} expired cache entries');
    }
  }

  // Storage size utilities
  static Future<Map<String, int>> getStorageSize() async {
    final sizes = <String, int>{};
    
    sizes['user'] = await _getBoxSize(_userBox);
    sizes['questions'] = await _getBoxSize(_questionsBox);
    sizes['exams'] = await _getBoxSize(_examsBox);
    sizes['cache'] = await _getBoxSize(_cacheBox);
    sizes['settings'] = await _getBoxSize(_settingsBox);
    sizes['syncQueue'] = await _getBoxSize(_syncQueueBox);
    sizes['total'] = sizes.values.reduce((a, b) => a + b);
    
    return sizes;
  }

  static Future<int> _getBoxSize(Box box) async {
    int size = 0;
    for (final key in box.keys) {
      final value = box.get(key);
      size += _estimateSize(value);
    }
    return size;
  }

  static int _estimateSize(dynamic value) {
    if (value == null) return 0;
    if (value is String) return value.length * 2; // UTF-16
    if (value is int) return 8;
    if (value is double) return 8;
    if (value is bool) return 1;
    if (value is List) {
      return value.fold<int>(0, (sum, item) => sum + _estimateSize(item));
    }
    if (value is Map) {
      return value.entries.fold<int>(
        0,
        (sum, entry) => sum + _estimateSize(entry.key) + _estimateSize(entry.value),
      );
    }
    return 100; // Default estimate
  }

  // Get formatted storage info
  static Future<String> getFormattedStorageInfo() async {
    final sizes = await getStorageSize();
    final totalMB = (sizes['total']! / (1024 * 1024)).toStringAsFixed(2);
    return 'Total: ${totalMB}MB | '
        'User: ${_formatBytes(sizes['user']!)} | '
        'Cache: ${_formatBytes(sizes['cache']!)} | '
        'Questions: ${_formatBytes(sizes['questions']!)}';
  }

  static String _formatBytes(int bytes) {
    if (bytes < 1024) return '${bytes}B';
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)}KB';
    }
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)}MB';
  }
}

