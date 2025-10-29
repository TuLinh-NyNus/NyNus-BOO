// Note: Uncomment when proto generation is complete
// import 'package:grpc/grpc.dart';
// import 'package:mobile/core/network/grpc_client.dart';
// import 'package:mobile/core/storage/secure_storage.dart';
// import 'package:mobile/generated/proto/v1/blog.pbgrpc.dart';

abstract class TheoryRemoteDataSource {
  Future<dynamic> getPost({String? id, String? slug});
  Future<dynamic> listPosts(Map<String, dynamic> request);
  Future<dynamic> getNavigationTree({dynamic subject, int? grade});
}

class TheoryRemoteDataSourceImpl implements TheoryRemoteDataSource {
  // Uncomment after proto generation
  // late final BlogServiceClient _blogClient;
  
  TheoryRemoteDataSourceImpl() {
    // _blogClient = BlogServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<dynamic> getPost({String? id, String? slug}) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> listPosts(Map<String, dynamic> request) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> getNavigationTree({dynamic subject, int? grade}) async {
    throw UnimplementedError('Proto files not generated yet');
  }
}

