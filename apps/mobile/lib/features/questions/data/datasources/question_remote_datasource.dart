import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/storage/secure_storage.dart';
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/question_filter.pbgrpc.dart';
// import 'package:mobile/generated/proto/v1/question.pb.dart' as pb;

abstract class QuestionRemoteDataSource {
  Future<dynamic> getQuestions({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  });
  
  Future<dynamic> getQuestion(String id);
  
  Future<dynamic> searchQuestions({
    required String query,
    required int page,
    required int limit,
    Map<String, dynamic>? filters,
  });
  
  Future<dynamic> getQuestionsByCode({
    required String code,
    required int page,
    required int limit,
  });
}

class QuestionRemoteDataSourceImpl implements QuestionRemoteDataSource {
  // Uncomment after proto generation
  // late final QuestionFilterServiceClient _filterClient;
  // late final QuestionServiceClient _questionClient;
  
  QuestionRemoteDataSourceImpl() {
    // _filterClient = QuestionFilterServiceClient(GrpcClientConfig.channel);
    // _questionClient = QuestionServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<dynamic> getQuestions({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  }) async {
    // Uncomment after proto generation
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> getQuestion(String id) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> searchQuestions({
    required String query,
    required int page,
    required int limit,
    Map<String, dynamic>? filters,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> getQuestionsByCode({
    required String code,
    required int page,
    required int limit,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
}

