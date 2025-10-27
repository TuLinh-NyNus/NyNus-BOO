import 'dart:convert';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/core/utils/logger.dart';

class CacheManager {
  static const Duration _defaultTTL = Duration(hours: 24);

  // Generic cache operations
  static Future<void> cacheData({
    required String key,
    required dynamic data,
    Duration? ttl,
  }) async {
    try {
      final expiry = DateTime.now().add(ttl ?? _defaultTTL);
      
      final cacheEntry = {
        'data': data,
        'expiry': expiry.toIso8601String(),
        'timestamp': DateTime.now().toIso8601String(),
      };
      
      await HiveStorage.cacheBox.put(key, jsonEncode(cacheEntry));
      AppLogger.debug('Cached data for key: $key (TTL: ${ttl ?? _defaultTTL})');
    } catch (e) {
      AppLogger.error('Failed to cache data for key: $key', e);
    }
  }

  static Future<T?> getCachedData<T>({
    required String key,
    T Function(Map<String, dynamic>)? fromJson,
  }) async {
    try {
      final cachedString = HiveStorage.cacheBox.get(key);
      if (cachedString == null) return null;
      
      final cacheEntry = jsonDecode(cachedString);
      final expiry = DateTime.parse(cacheEntry['expiry']);
      
      // Check if expired
      if (DateTime.now().isAfter(expiry)) {
        await HiveStorage.cacheBox.delete(key);
        AppLogger.debug('Cache expired for key: $key');
        return null;
      }
      
      final data = cacheEntry['data'];
      
      if (fromJson != null && data is Map<String, dynamic>) {
        return fromJson(data);
      }
      
      return data as T?;
    } catch (e) {
      AppLogger.error('Error reading cache for key $key', e);
      // Delete corrupted cache entry
      await HiveStorage.cacheBox.delete(key);
      return null;
    }
  }

  static Future<void> invalidateCache(String key) async {
    await HiveStorage.cacheBox.delete(key);
    AppLogger.debug('Invalidated cache for key: $key');
  }

  static Future<void> invalidateCacheByPrefix(String prefix) async {
    final keysToDelete = HiveStorage.cacheBox.keys
        .where((key) => key.toString().startsWith(prefix))
        .toList();
    
    if (keysToDelete.isNotEmpty) {
      await HiveStorage.cacheBox.deleteAll(keysToDelete);
      AppLogger.info('Invalidated ${keysToDelete.length} cache entries with prefix: $prefix');
    }
  }

  static Future<void> clearAllCache() async {
    await HiveStorage.clearCache();
  }

  // Specific cache key generators
  static String getQuestionCacheKey(String questionId) => 'question_$questionId';
  
  static String getExamCacheKey(String examId) => 'exam_$examId';
  
  static String getQuestionListCacheKey(int page, String? filters) => 
      'questions_page_${page}_${filters ?? 'all'}';
  
  static String getExamListCacheKey(int page, String? filters) => 
      'exams_page_${page}_${filters ?? 'all'}';
  
  static String getUserProfileCacheKey(String userId) => 'user_$userId';

  // Cache statistics
  static Future<CacheStats> getCacheStats() async {
    final box = HiveStorage.cacheBox;
    int totalEntries = box.length;
    int expiredEntries = 0;
    int validEntries = 0;
    int totalSize = 0;
    
    final now = DateTime.now();
    
    for (final key in box.keys) {
      final value = box.get(key);
      if (value != null) {
        totalSize += value.toString().length;
        
        try {
          final entry = jsonDecode(value);
          final expiry = DateTime.parse(entry['expiry']);
          
          if (now.isAfter(expiry)) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        } catch (e) {
          // Count as expired if can't parse
          expiredEntries++;
        }
      }
    }
    
    return CacheStats(
      totalEntries: totalEntries,
      validEntries: validEntries,
      expiredEntries: expiredEntries,
      totalSizeBytes: totalSize,
    );
  }
}

class CacheStats {
  final int totalEntries;
  final int validEntries;
  final int expiredEntries;
  final int totalSizeBytes;

  CacheStats({
    required this.totalEntries,
    required this.validEntries,
    required this.expiredEntries,
    required this.totalSizeBytes,
  });

  String get formattedSize {
    if (totalSizeBytes < 1024) return '$totalSizeBytes B';
    if (totalSizeBytes < 1024 * 1024) {
      return '${(totalSizeBytes / 1024).toStringAsFixed(1)} KB';
    }
    return '${(totalSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  String toString() {
    return 'CacheStats(total: $totalEntries, valid: $validEntries, '
        'expired: $expiredEntries, size: $formattedSize)';
  }
}

