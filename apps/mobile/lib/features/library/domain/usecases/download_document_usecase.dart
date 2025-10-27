import 'dart:io';
import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/library/domain/entities/library_item.dart';
import 'package:mobile/features/library/domain/repositories/library_repository.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;

class DownloadDocumentUseCase implements UseCase<DownloadTask, DownloadDocumentParams> {
  final LibraryRepository repository;

  DownloadDocumentUseCase(this.repository);

  @override
  Future<Either<Failure, DownloadTask>> call(DownloadDocumentParams params) async {
    try {
      // Get download directory
      final directory = await getApplicationDocumentsDirectory();
      final downloadsPath = path.join(directory.path, 'downloads');
      
      // Create downloads directory if not exists
      final downloadsDir = Directory(downloadsPath);
      if (!await downloadsDir.exists()) {
        await downloadsDir.create(recursive: true);
      }
      
      // Generate file path
      final fileName = '${params.document.id}_${params.document.title}'
          .replaceAll(RegExp(r'[^\w\s-.]'), '');
      final filePath = path.join(downloadsPath, fileName);
      
      return repository.downloadDocument(
        documentId: params.document.id,
        savePath: filePath,
        onProgress: params.onProgress,
      );
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }
}

class DownloadDocumentParams {
  final LibraryItem document;
  final void Function(double progress)? onProgress;

  DownloadDocumentParams({
    required this.document,
    this.onProgress,
  });
}

