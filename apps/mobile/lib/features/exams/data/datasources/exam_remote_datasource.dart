import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/features/exams/data/models/exam_model.dart';
// TODO: Uncomment after proto generation
// import 'package:mobile/generated/proto/v1/exam.pbgrpc.dart';

abstract class ExamRemoteDataSource {
  Future<Map<String, dynamic>> getExams({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  });
  
  Future<ExamModel> getExam(String id);
  Future<Map<String, dynamic>> startExam(String examId);
  Future<void> submitAnswer(Map<String, dynamic> answerData);
  Future<void> saveProgress(Map<String, dynamic> progressData);
  Future<Map<String, dynamic>> completeExam(String sessionId);
  Future<void> pauseExam(String sessionId);
  Future<Map<String, dynamic>> resumeExam(String sessionId);
  Future<Map<String, dynamic>> getExamHistory({
    required int page,
    required int limit,
    String? examId,
  });
  Future<Map<String, dynamic>> getExamResult(String sessionId);
}

class ExamRemoteDataSourceImpl implements ExamRemoteDataSource {
  // TODO: Uncomment after proto generation
  // late final ExamServiceClient _client;
  // late final ExamSessionServiceClient _sessionClient;
  
  ExamRemoteDataSourceImpl() {
    // _client = ExamServiceClient(GrpcClientConfig.channel);
    // _sessionClient = ExamSessionServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<Map<String, dynamic>> getExams({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 700));
    
    // Generate mock exams
    final exams = _generateMockExams(page, limit, search, filters);
    
    return {
      'exams': exams.map((e) => e.toJson()).toList(),
      'pagination': {
        'page': page,
        'limit': limit,
        'total_count': 45, // Mock total
        'total_pages': (45 / limit).ceil(),
      },
    };
  }
  
  @override
  Future<ExamModel> getExam(String id) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 400));
    
    // Return mock exam
    return _generateMockExams(1, 1).first;
  }
  
  @override
  Future<Map<String, dynamic>> startExam(String examId) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Mock exam session start
    return {
      'session_id': 'session_${DateTime.now().millisecondsSinceEpoch}',
      'exam_id': examId,
      'started_at': DateTime.now().toIso8601String(),
      'questions': List.generate(20, (i) => 'question_$i'),
      'time_limit': 3600, // 1 hour in seconds
    };
  }
  
  @override
  Future<void> submitAnswer(Map<String, dynamic> answerData) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 200));
    // Mock answer submission - just delay
  }
  
  @override
  Future<void> saveProgress(Map<String, dynamic> progressData) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 150));
    // Mock progress save - just delay
  }
  
  @override
  Future<Map<String, dynamic>> completeExam(String sessionId) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 1000));
    
    // Mock exam completion result
    return {
      'session_id': sessionId,
      'score': 85.5,
      'total_points': 100.0,
      'percentage': 85.5,
      'passed': true,
      'completed_at': DateTime.now().toIso8601String(),
      'time_spent': 2400, // 40 minutes in seconds
      'correct_answers': 17,
      'total_questions': 20,
    };
  }
  
  @override
  Future<void> pauseExam(String sessionId) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 100));
    // Mock pause - just delay
  }
  
  @override
  Future<Map<String, dynamic>> resumeExam(String sessionId) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Mock resume exam
    return {
      'session_id': sessionId,
      'current_question': 5,
      'time_remaining': 2100, // 35 minutes left
      'answers_submitted': 4,
    };
  }
  
  @override
  Future<Map<String, dynamic>> getExamHistory({
    required int page,
    required int limit,
    String? examId,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Generate mock exam history
    final history = _generateMockExamHistory(page, limit);
    
    return {
      'history': history,
      'pagination': {
        'page': page,
        'limit': limit,
        'total_count': 15,
        'total_pages': (15 / limit).ceil(),
      },
    };
  }
  
  @override
  Future<Map<String, dynamic>> getExamResult(String sessionId) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 400));
    
    // Mock exam result
    return {
      'session_id': sessionId,
      'exam_title': 'Đề thi Toán học - Lớp 10',
      'score': 85.5,
      'total_points': 100.0,
      'percentage': 85.5,
      'passed': true,
      'completed_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
      'time_spent': 2400,
      'correct_answers': 17,
      'total_questions': 20,
      'question_results': List.generate(20, (i) => {
        'question_id': 'question_$i',
        'is_correct': i < 17, // First 17 are correct
        'points_earned': i < 17 ? 5.0 : 0.0,
        'time_spent': 120 + (i * 10), // Varying time per question
      }),
    };
  }
  
  List<ExamModel> _generateMockExams(
    int page, 
    int limit, 
    [String? search, Map<String, dynamic>? filters]
  ) {
    final exams = <ExamModel>[];
    final startIndex = (page - 1) * limit;
    
    final subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Văn học'];
    final institutions = ['THPT Nguyễn Huệ', 'THPT Lê Quý Đôn', 'THPT Trần Phú'];
    
    for (int i = 0; i < limit; i++) {
      final index = startIndex + i;
      final isOfficial = index % 3 == 0; // Every 3rd exam is official
      final subject = subjects[index % subjects.length];
      
      exams.add(ExamModel(
        id: 'exam_$index',
        title: search != null 
          ? 'Đề thi có chứa "$search" - Số $index'
          : isOfficial
            ? 'Đề thi chính thức $subject - Đề ${index + 1}'
            : 'Đề luyện tập $subject - Số ${index + 1}',
        description: 'Mô tả chi tiết cho đề thi số $index. '
            'Đề thi này bao gồm các câu hỏi từ cơ bản đến nâng cao.',
        instructions: 'Hướng dẫn làm bài:\n'
            '1. Đọc kỹ đề bài trước khi trả lời\n'
            '2. Chọn đáp án đúng nhất\n'
            '3. Có thể xem lại và sửa đáp án\n'
            '4. Nộp bài trước khi hết thời gian',
        type: isOfficial ? ExamType.official : ExamType.generated,
        status: ExamStatus.active,
        mode: ExamMode.timed,
        duration: 60 + (index % 3) * 30, // 60, 90, or 120 minutes
        totalQuestions: 20 + (index % 4) * 5, // 20, 25, 30, or 35 questions
        totalPoints: (20 + (index % 4) * 5) * 5.0, // 5 points per question
        passingScore: 60.0 + (index % 3) * 10, // 60%, 70%, or 80%
        subject: subject,
        grade: 10 + (index % 3), // Grade 10, 11, or 12
        tags: [subject.toLowerCase(), 'luyện tập', if (isOfficial) 'chính thức'],
        questionTypeDistribution: {
          'multiple_choice': 15 + (index % 3) * 2,
          'true_false': 3 + (index % 2),
          'short_answer': 2 + (index % 2),
        },
        difficultyDistribution: {
          'easy': 8 + (index % 3),
          'medium': 10 + (index % 2),
          'hard': 4 + (index % 2),
          'expert': 1 + (index % 2),
        },
        availableFrom: DateTime.now().subtract(Duration(days: index)),
        availableUntil: DateTime.now().add(Duration(days: 30 + index)),
        attemptLimit: index % 4 == 0 ? 0 : (index % 3) + 1, // 0 = unlimited
        shuffleQuestions: index % 2 == 0,
        shuffleAnswers: index % 3 == 0,
        showResultsImmediately: index % 4 != 0,
        allowReview: true,
        sourceInstitution: isOfficial ? institutions[index % institutions.length] : null,
        examYear: isOfficial ? '${2024 - (index % 3)}' : null,
        examCode: isOfficial ? '${(index % 9) + 1}'.padLeft(3, '0') : null,
        fileUrl: isOfficial ? 'https://example.com/exam_$index.pdf' : null,
        createdBy: 'teacher_${(index % 5) + 1}',
        createdAt: DateTime.now().subtract(Duration(days: index * 2)),
        updatedAt: DateTime.now().subtract(Duration(hours: index)),
      ));
    }
    
    return exams;
  }
  
  List<Map<String, dynamic>> _generateMockExamHistory(int page, int limit) {
    final history = <Map<String, dynamic>>[];
    final startIndex = (page - 1) * limit;
    
    for (int i = 0; i < limit; i++) {
      final index = startIndex + i;
      final score = 60.0 + (index % 4) * 10; // 60, 70, 80, 90
      
      history.add({
        'session_id': 'session_history_$index',
        'exam_id': 'exam_${index % 10}',
        'exam_title': 'Đề thi Toán học - Lớp ${10 + (index % 3)}',
        'score': score,
        'total_points': 100.0,
        'percentage': score,
        'passed': score >= 70,
        'completed_at': DateTime.now().subtract(Duration(days: index + 1)).toIso8601String(),
        'time_spent': 1800 + (index * 300), // 30-75 minutes
        'attempt_number': (index % 3) + 1,
      });
    }
    
    return history;
  }
}