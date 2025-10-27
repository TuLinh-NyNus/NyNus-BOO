import 'dart:convert';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/features/library/data/models/library_item_model.dart';
import 'package:mobile/core/utils/logger.dart';

abstract class LibraryLocalDataSource {
  Future<void> cacheDocuments(List<LibraryItemModel> documents);
  Future<List<LibraryItemModel>> getCachedDocuments();
  Future<LibraryItemModel?> getCachedDocument(String id);
  
  Future<void> saveBookmark(String documentId);
  Future<void> removeBookmark(String documentId);
  Future<List<String>> getBookmarkedIds();
  
  Future<void> saveDownloadedDocument(LibraryItemModel document, String localPath);
  Future<List<LibraryItemModel>> getDownloadedDocuments();
  
  Future<void> clearCache();
}

class LibraryLocalDataSourceImpl implements LibraryLocalDataSource {
  static const String _documentsKey = 'cached_library_documents';
  static const String _bookmarksKey = 'bookmarked_documents';
  static const String _downloadsKey = 'downloaded_documents';

  @override
  Future<void> cacheDocuments(List<LibraryItemModel> documents) async {
    try {
      final documentsJson = documents.map((d) => d.toJson()).toList();
      await HiveStorage.userBox.put(_documentsKey, jsonEncode(documentsJson));
      
      // Cache individually
      for (final doc in documents) {
        await HiveStorage.userBox.put('library_${doc.id}', jsonEncode(doc.toJson()));
      }
      
      AppLogger.info('Cached ${documents.length} library documents');
    } catch (e) {
      AppLogger.error('Failed to cache documents', e);
    }
  }

  @override
  Future<List<LibraryItemModel>> getCachedDocuments() async {
    final cachedData = HiveStorage.userBox.get(_documentsKey);
    if (cachedData == null) return [];
    
    try {
      final List<dynamic> documentsJson = jsonDecode(cachedData as String);
      return documentsJson
          .map((json) => LibraryItemModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      AppLogger.error('Error loading cached documents', e);
      return [];
    }
  }

  @override
  Future<LibraryItemModel?> getCachedDocument(String id) async {
    final cachedData = HiveStorage.userBox.get('library_$id');
    if (cachedData == null) return null;
    
    try {
      final Map<String, dynamic> json = jsonDecode(cachedData as String);
      return LibraryItemModel.fromJson(json);
    } catch (e) {
      AppLogger.error('Error loading cached document: $id', e);
      return null;
    }
  }

  @override
  Future<void> saveBookmark(String documentId) async {
    final bookmarks = await getBookmarkedIds();
    if (!bookmarks.contains(documentId)) {
      bookmarks.add(documentId);
      await HiveStorage.userBox.put(_bookmarksKey, jsonEncode(bookmarks));
    }
  }

  @override
  Future<void> removeBookmark(String documentId) async {
    final bookmarks = await getBookmarkedIds();
    bookmarks.remove(documentId);
    await HiveStorage.userBox.put(_bookmarksKey, jsonEncode(bookmarks));
  }

  @override
  Future<List<String>> getBookmarkedIds() async {
    final bookmarksData = HiveStorage.userBox.get(_bookmarksKey);
    if (bookmarksData == null) return [];
    
    try {
      final List<dynamic> bookmarks = jsonDecode(bookmarksData as String);
      return List<String>.from(bookmarks);
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> saveDownloadedDocument(
    LibraryItemModel document,
    String localPath,
  ) async {
    final updatedDoc = LibraryItemModel(
      id: document.id,
      title: document.title,
      description: document.description,
      type: document.type,
      status: document.status,
      source: document.source,
      fileUrl: document.fileUrl,
      driveFileId: document.driveFileId,
      thumbnailUrl: document.thumbnailUrl,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      category: document.category,
      tags: document.tags,
      viewCount: document.viewCount,
      downloadCount: document.downloadCount,
      averageRating: document.averageRating,
      reviewCount: document.reviewCount,
      createdBy: document.createdBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      isDownloaded: true,
      localPath: localPath,
    );
    
    final downloads = await getDownloadedDocuments();
    downloads.add(updatedDoc);
    await HiveStorage.userBox.put(
      _downloadsKey,
      jsonEncode(downloads.map((d) => d.toJson()).toList()),
    );
  }

  @override
  Future<List<LibraryItemModel>> getDownloadedDocuments() async {
    final downloadsData = HiveStorage.userBox.get(_downloadsKey);
    if (downloadsData == null) return [];
    
    try {
      final List<dynamic> downloadsJson = jsonDecode(downloadsData as String);
      return downloadsJson
          .map((json) => LibraryItemModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> clearCache() async {
    await HiveStorage.userBox.delete(_documentsKey);
    AppLogger.info('Library cache cleared');
  }
}

