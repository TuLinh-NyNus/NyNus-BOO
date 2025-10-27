import 'dart:convert';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/features/questions/data/models/question_model.dart';
import 'package:mobile/core/utils/logger.dart';

abstract class QuestionLocalDataSource {
  Future<void> cacheQuestions(List<QuestionModel> questions);
  Future<List<QuestionModel>> getCachedQuestions();
  Future<QuestionModel?> getCachedQuestion(String id);
  Future<void> clearCache();
  
  Future<void> saveBookmark(String questionId);
  Future<void> removeBookmark(String questionId);
  Future<List<String>> getBookmarkedIds();
  Future<bool> isBookmarked(String questionId);
}

class QuestionLocalDataSourceImpl implements QuestionLocalDataSource {
  static const String _questionsKey = 'cached_questions';
  static const String _bookmarksKey = 'bookmarked_questions';
  
  @override
  Future<void> cacheQuestions(List<QuestionModel> questions) async {
    try {
      final questionsJson = questions.map((q) => q.toJson()).toList();
      await HiveStorage.questionsBox.put(_questionsKey, jsonEncode(questionsJson));
      
      // Also cache individually for quick access
      for (final question in questions) {
        await HiveStorage.questionsBox.put(question.id, jsonEncode(question.toJson()));
      }
      
      AppLogger.info('Cached ${questions.length} questions');
    } catch (e) {
      AppLogger.error('Failed to cache questions', e);
    }
  }
  
  @override
  Future<List<QuestionModel>> getCachedQuestions() async {
    final cachedData = HiveStorage.questionsBox.get(_questionsKey);
    if (cachedData == null) return [];
    
    try {
      final List<dynamic> questionsJson = jsonDecode(cachedData as String);
      return questionsJson
          .map((json) => QuestionModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      AppLogger.error('Error loading cached questions', e);
      return [];
    }
  }
  
  @override
  Future<QuestionModel?> getCachedQuestion(String id) async {
    final cachedData = HiveStorage.questionsBox.get(id);
    if (cachedData == null) return null;
    
    try {
      final Map<String, dynamic> json = jsonDecode(cachedData as String);
      return QuestionModel.fromJson(json);
    } catch (e) {
      AppLogger.error('Error loading cached question: $id', e);
      return null;
    }
  }
  
  @override
  Future<void> clearCache() async {
    await HiveStorage.questionsBox.clear();
    AppLogger.info('Questions cache cleared');
  }
  
  @override
  Future<void> saveBookmark(String questionId) async {
    final List<String> bookmarks = await getBookmarkedIds();
    if (!bookmarks.contains(questionId)) {
      bookmarks.add(questionId);
      await HiveStorage.userBox.put(_bookmarksKey, jsonEncode(bookmarks));
      AppLogger.info('Bookmarked question: $questionId');
    }
  }
  
  @override
  Future<void> removeBookmark(String questionId) async {
    final List<String> bookmarks = await getBookmarkedIds();
    bookmarks.remove(questionId);
    await HiveStorage.userBox.put(_bookmarksKey, jsonEncode(bookmarks));
    AppLogger.info('Removed bookmark: $questionId');
  }
  
  @override
  Future<List<String>> getBookmarkedIds() async {
    final bookmarksData = HiveStorage.userBox.get(_bookmarksKey);
    if (bookmarksData == null) return [];
    
    try {
      final List<dynamic> bookmarks = jsonDecode(bookmarksData as String);
      return List<String>.from(bookmarks);
    } catch (e) {
      AppLogger.error('Error loading bookmarks', e);
      return [];
    }
  }
  
  @override
  Future<bool> isBookmarked(String questionId) async {
    final bookmarks = await getBookmarkedIds();
    return bookmarks.contains(questionId);
  }
}

