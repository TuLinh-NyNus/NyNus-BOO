import 'package:mobile/core/storage/hive_storage.dart';

class UserPreferences {
  static String _getUserKey(String key) => 'pref_$key';

  // Recently viewed
  static Future<List<String>> getRecentlyViewedQuestions() async {
    final key = _getUserKey('recently_viewed_questions');
    final data = HiveStorage.userBox.get(key);
    if (data == null) return [];
    return List<String>.from(data as List);
  }

  static Future<void> addRecentlyViewedQuestion(String questionId) async {
    final key = _getUserKey('recently_viewed_questions');
    final recent = await getRecentlyViewedQuestions();
    
    // Remove if exists and add to front
    recent.remove(questionId);
    recent.insert(0, questionId);
    
    // Keep only last 50
    if (recent.length > 50) {
      recent.removeRange(50, recent.length);
    }
    
    await HiveStorage.userBox.put(key, recent);
  }

  // Study preferences
  static Future<Map<String, dynamic>> getStudyPreferences() async {
    final key = _getUserKey('study_preferences');
    final data = HiveStorage.userBox.get(key);
    
    if (data == null) {
      return {
        'preferredDifficulty': null,
        'preferredSubjects': <String>[],
        'preferredQuestionTypes': <String>[],
        'dailyGoal': 20,
        'reminderTime': null,
      };
    }
    
    return Map<String, dynamic>.from(data as Map);
  }

  static Future<void> updateStudyPreferences(Map<String, dynamic> prefs) async {
    final key = _getUserKey('study_preferences');
    await HiveStorage.userBox.put(key, prefs);
  }

  // Filter preferences
  static Future<Map<String, dynamic>> getSavedFilters() async {
    final key = _getUserKey('saved_filters');
    final data = HiveStorage.userBox.get(key);
    if (data == null) return {};
    return Map<String, dynamic>.from(data as Map);
  }

  static Future<void> saveFilters(String filterName, Map<String, dynamic> filters) async {
    final key = _getUserKey('saved_filters');
    final saved = await getSavedFilters();
    saved[filterName] = filters;
    await HiveStorage.userBox.put(key, saved);
  }

  // Exam preferences
  static Future<Map<String, dynamic>> getExamPreferences() async {
    final key = _getUserKey('exam_preferences');
    final data = HiveStorage.userBox.get(key);
    
    if (data == null) {
      return {
        'showTimer': true,
        'showProgress': true,
        'confirmSubmit': true,
        'autoSaveInterval': 30, // seconds
        'fullscreenMode': false,
      };
    }
    
    return Map<String, dynamic>.from(data as Map);
  }

  static Future<void> updateExamPreferences(Map<String, dynamic> prefs) async {
    final key = _getUserKey('exam_preferences');
    await HiveStorage.userBox.put(key, prefs);
  }

  // Search history
  static Future<List<String>> getSearchHistory() async {
    final key = _getUserKey('search_history');
    final data = HiveStorage.userBox.get(key);
    if (data == null) return [];
    return List<String>.from(data as List);
  }

  static Future<void> addSearchQuery(String query) async {
    if (query.trim().isEmpty) return;
    
    final key = _getUserKey('search_history');
    final history = await getSearchHistory();
    
    // Remove if exists and add to front
    history.remove(query);
    history.insert(0, query);
    
    // Keep only last 20
    if (history.length > 20) {
      history.removeRange(20, history.length);
    }
    
    await HiveStorage.userBox.put(key, history);
  }

  static Future<void> clearSearchHistory() async {
    final key = _getUserKey('search_history');
    await HiveStorage.userBox.delete(key);
  }

  // Clear all preferences
  static Future<void> clearAllPreferences() async {
    final keysToDelete = HiveStorage.userBox.keys
        .where((key) => key.toString().startsWith('pref_'))
        .toList();
    
    await HiveStorage.userBox.deleteAll(keysToDelete);
  }
}

