import 'package:grpc/grpc.dart';
import 'package:mobile/core/network/grpc_client.dart';
import 'package:mobile/core/storage/secure_storage.dart';
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/library.pbgrpc.dart';

abstract class LibraryRemoteDataSource {
  Future<dynamic> getDocuments({
    required int page,
    required int limit,
    String? categoryId,
    String? search,
    List<String>? tags,
    String? sortBy,
  });
  
  Future<dynamic> getDocument(String id);
  Future<dynamic> getCategories();
  Future<void> recordView(String documentId);
  Future<void> rateDocument(String documentId, int rating, String? comment);
}

class LibraryRemoteDataSourceImpl implements LibraryRemoteDataSource {
  // Uncomment after proto generation
  // late final LibraryServiceClient _client;
  
  LibraryRemoteDataSourceImpl() {
    // _client = LibraryServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<dynamic> getDocuments({
    required int page,
    required int limit,
    String? categoryId,
    String? search,
    List<String>? tags,
    String? sortBy,
  }) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> getDocument(String id) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<dynamic> getCategories() async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<void> recordView(String documentId) async {
    throw UnimplementedError('Proto files not generated yet');
  }
  
  @override
  Future<void> rateDocument(
    String documentId,
    int rating,
    String? comment,
  ) async {
    throw UnimplementedError('Proto files not generated yet');
  }
}

