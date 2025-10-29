import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/features/questions/data/models/question_model.dart';
// TODO: Uncomment after proto generation
// import 'package:mobile/generated/proto/v1/question_filter.pbgrpc.dart';
// import 'package:mobile/generated/proto/v1/question.pb.dart' as pb;

abstract class QuestionRemoteDataSource {
  Future<Map<String, dynamic>> getQuestions({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  });
  
  Future<QuestionModel> getQuestion(String id);
  
  Future<Map<String, dynamic>> searchQuestions({
    required String query,
    required int page,
    required int limit,
    Map<String, dynamic>? filters,
  });
  
  Future<Map<String, dynamic>> getQuestionsByCode({
    required String code,
    required int page,
    required int limit,
  });
}

class QuestionRemoteDataSourceImpl implements QuestionRemoteDataSource {
  // TODO: Uncomment after proto generation
  // late final QuestionFilterServiceClient _filterClient;
  // late final QuestionServiceClient _questionClient;
  
  QuestionRemoteDataSourceImpl() {
    // _filterClient = QuestionFilterServiceClient(GrpcClientConfig.channel);
    // _questionClient = QuestionServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<Map<String, dynamic>> getQuestions({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 600));
    
    // Generate mock questions
    final questions = _generateMockQuestions(page, limit, search, filters);
    
    return {
      'questions': questions.map((q) => q.toJson()).toList(),
      'pagination': {
        'page': page,
        'limit': limit,
        'total_count': 150, // Mock total
        'total_pages': (150 / limit).ceil(),
      },
    };
  }
  
  @override
  Future<QuestionModel> getQuestion(String id) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Return mock question
    return _generateMockQuestions(1, 1).first;
  }
  
  @override
  Future<Map<String, dynamic>> searchQuestions({
    required String query,
    required int page,
    required int limit,
    Map<String, dynamic>? filters,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Generate mock search results
    final questions = _generateMockQuestions(page, limit, query, filters);
    
    return {
      'questions': questions.map((q) => q.toJson()).toList(),
      'pagination': {
        'page': page,
        'limit': limit,
        'total_count': 25, // Fewer results for search
        'total_pages': (25 / limit).ceil(),
      },
    };
  }
  
  @override
  Future<Map<String, dynamic>> getQuestionsByCode({
    required String code,
    required int page,
    required int limit,
  }) async {
    // TODO: Replace with real gRPC call after proto generation
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Generate mock questions for specific code
    final questions = _generateMockQuestions(page, limit);
    
    return {
      'questions': questions.map((q) => q.toJson()).toList(),
      'pagination': {
        'page': page,
        'limit': limit,
        'total_count': 30,
        'total_pages': (30 / limit).ceil(),
      },
    };
  }
  
  List<QuestionModel> _generateMockQuestions(
    int page, 
    int limit, 
    [String? search, Map<String, dynamic>? filters]
  ) {
    final questions = <QuestionModel>[];
    final startIndex = (page - 1) * limit;
    
    for (int i = 0; i < limit; i++) {
      final index = startIndex + i;
      questions.add(QuestionModel(
        id: 'question_$index',
        content: search != null 
          ? 'Câu hỏi có chứa từ khóa "$search" - Số $index'
          : 'Đây là nội dung câu hỏi số $index. Hãy chọn đáp án đúng nhất trong các phương án sau:',
        type: QuestionType.values[index % QuestionType.values.length],
        difficulty: DifficultyLevel.values[index % DifficultyLevel.values.length],
        status: QuestionStatus.approved,
        answers: _generateMockAnswers(index),
        questionCode: QuestionCodeModel(
          id: 'code_$index',
          code: '10L${(index % 9) + 1}01N',
          grade: 10,
          subject: 'Toán học',
          questionFormat: 'MC',
        ),
        tags: ['toán học', 'đại số', 'lớp 10'],
        usageCount: index * 5,
        averageRating: 3.5 + (index % 3) * 0.5,
        createdBy: 'teacher_001',
        createdAt: DateTime.now().subtract(Duration(days: index)),
        updatedAt: DateTime.now().subtract(Duration(hours: index)),
      ));
    }
    
    return questions;
  }
  
  List<AnswerModel> _generateMockAnswers(int questionIndex) {
    return [
      AnswerModel(
        id: 'answer_${questionIndex}_1',
        content: 'Đáp án A - Đây là đáp án đúng',
        isCorrect: true,
        order: 1,
      ),
      AnswerModel(
        id: 'answer_${questionIndex}_2',
        content: 'Đáp án B - Đây là đáp án sai',
        isCorrect: false,
        order: 2,
      ),
      AnswerModel(
        id: 'answer_${questionIndex}_3',
        content: 'Đáp án C - Đây cũng là đáp án sai',
        isCorrect: false,
        order: 3,
      ),
      AnswerModel(
        id: 'answer_${questionIndex}_4',
        content: 'Đáp án D - Đáp án sai cuối cùng',
        isCorrect: false,
        order: 4,
      ),
    ];
  }
}

