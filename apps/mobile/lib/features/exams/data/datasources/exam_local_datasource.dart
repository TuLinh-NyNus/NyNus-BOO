import 'dart:convert';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/features/exams/data/models/exam_model.dart';
import 'package:mobile/core/utils/logger.dart';

abstract class ExamLocalDataSource {
  Future<void> cacheExam(ExamModel exam);
  Future<ExamModel?> getCachedExam(String id);
  Future<List<ExamModel>> getCachedExams();
  
  Future<void> cacheExamSession(ExamSessionModel session);
  Future<ExamSessionModel?> getCachedSession(String examId);
  Future<List<ExamSessionModel>> getAllCachedSessions();
  Future<void> deleteCachedSession(String sessionId);
  
  Future<void> clearCache();
}

class ExamLocalDataSourceImpl implements ExamLocalDataSource {
  static const String _examsKey = 'cached_exams';
  static const String _sessionsKey = 'cached_sessions';
  
  @override
  Future<void> cacheExam(ExamModel exam) async {
    try {
      await HiveStorage.examsBox.put(exam.id, jsonEncode(exam.toJson()));
      
      // Also update the list
      final exams = await getCachedExams();
      final index = exams.indexWhere((e) => e.id == exam.id);
      if (index >= 0) {
        exams[index] = exam;
      } else {
        exams.add(exam);
      }
      await HiveStorage.examsBox.put(
        _examsKey,
        jsonEncode(exams.map((e) => e.toJson()).toList()),
      );
      
      AppLogger.info('Cached exam: ${exam.id}');
    } catch (e) {
      AppLogger.error('Failed to cache exam', e);
    }
  }
  
  @override
  Future<ExamModel?> getCachedExam(String id) async {
    final cachedData = HiveStorage.examsBox.get(id);
    if (cachedData == null) return null;
    
    try {
      final Map<String, dynamic> json = jsonDecode(cachedData as String);
      return ExamModel.fromJson(json);
    } catch (e) {
      AppLogger.error('Error loading cached exam: $id', e);
      return null;
    }
  }
  
  @override
  Future<List<ExamModel>> getCachedExams() async {
    final cachedData = HiveStorage.examsBox.get(_examsKey);
    if (cachedData == null) return [];
    
    try {
      final List<dynamic> examsJson = jsonDecode(cachedData as String);
      return examsJson
          .map((json) => ExamModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      AppLogger.error('Error loading cached exams', e);
      return [];
    }
  }
  
  @override
  Future<void> cacheExamSession(ExamSessionModel session) async {
    try {
      await HiveStorage.examsBox.put(
        'session_${session.id}',
        jsonEncode(session.toJson()),
      );
      
      // Map examId -> sessionId for quick lookup
      await HiveStorage.examsBox.put(
        'exam_session_${session.examId}',
        session.id,
      );
      
      AppLogger.info('Cached exam session: ${session.id}');
    } catch (e) {
      AppLogger.error('Failed to cache session', e);
    }
  }
  
  @override
  Future<ExamSessionModel?> getCachedSession(String examId) async {
    // Get session ID for this exam
    final sessionId = HiveStorage.examsBox.get('exam_session_$examId');
    if (sessionId == null) return null;
    
    final cachedData = HiveStorage.examsBox.get('session_$sessionId');
    if (cachedData == null) return null;
    
    try {
      final Map<String, dynamic> json = jsonDecode(cachedData as String);
      return ExamSessionModel.fromJson(json);
    } catch (e) {
      AppLogger.error('Error loading cached session', e);
      return null;
    }
  }
  
  @override
  Future<List<ExamSessionModel>> getAllCachedSessions() async {
    final List<ExamSessionModel> sessions = [];
    
    final keys = HiveStorage.examsBox.keys
        .where((key) => key.toString().startsWith('session_'))
        .toList();
    
    for (final key in keys) {
      final cachedData = HiveStorage.examsBox.get(key);
      if (cachedData != null) {
        try {
          final Map<String, dynamic> json = jsonDecode(cachedData as String);
          sessions.add(ExamSessionModel.fromJson(json));
        } catch (e) {
          AppLogger.error('Error loading session $key', e);
        }
      }
    }
    
    return sessions;
  }
  
  @override
  Future<void> deleteCachedSession(String sessionId) async {
    final session = await _getSessionById(sessionId);
    if (session != null) {
      await HiveStorage.examsBox.delete('session_$sessionId');
      await HiveStorage.examsBox.delete('exam_session_${session.examId}');
      AppLogger.info('Deleted cached session: $sessionId');
    }
  }
  
  Future<ExamSessionModel?> _getSessionById(String sessionId) async {
    final cachedData = HiveStorage.examsBox.get('session_$sessionId');
    if (cachedData == null) return null;
    
    try {
      final Map<String, dynamic> json = jsonDecode(cachedData as String);
      return ExamSessionModel.fromJson(json);
    } catch (e) {
      return null;
    }
  }
  
  @override
  Future<void> clearCache() async {
    await HiveStorage.examsBox.clear();
    AppLogger.info('Exams cache cleared');
  }
}

