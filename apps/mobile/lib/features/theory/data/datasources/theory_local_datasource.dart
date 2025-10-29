import 'dart:convert';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/features/theory/data/models/theory_post_model.dart';
import 'package:mobile/core/utils/logger.dart';

abstract class TheoryLocalDataSource {
  Future<void> cachePosts(List<TheoryPostModel> posts);
  Future<List<TheoryPostModel>> getCachedPosts();
  Future<TheoryPostModel?> getCachedPost(String id);
  
  Future<void> saveBookmark(String postId);
  Future<void> removeBookmark(String postId);
  Future<List<String>> getBookmarkedIds();
  
  Future<void> saveDownloadedPost(TheoryPostModel post);
  Future<List<TheoryPostModel>> getDownloadedPosts();
  Future<void> deleteDownloadedPost(String postId);
  
  Future<void> clearCache();
}

class TheoryLocalDataSourceImpl implements TheoryLocalDataSource {
  static const String _postsKey = 'cached_theory_posts';
  static const String _bookmarksKey = 'bookmarked_theory_posts';
  static const String _downloadsKey = 'downloaded_theory_posts';

  @override
  Future<void> cachePosts(List<TheoryPostModel> posts) async {
    try {
      final postsJson = posts.map((p) => p.toJson()).toList();
      await HiveStorage.userBox.put(_postsKey, jsonEncode(postsJson));
      
      for (final post in posts) {
        await HiveStorage.userBox.put('theory_${post.id}', jsonEncode(post.toJson()));
      }
      
      AppLogger.info('Cached ${posts.length} theory posts');
    } catch (e) {
      AppLogger.error('Failed to cache theory posts', e);
    }
  }

  @override
  Future<List<TheoryPostModel>> getCachedPosts() async {
    final cachedData = HiveStorage.userBox.get(_postsKey);
    if (cachedData == null) return [];
    
    try {
      final List<dynamic> postsJson = jsonDecode(cachedData as String);
      return postsJson
          .map((json) => TheoryPostModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      AppLogger.error('Error loading cached theory posts', e);
      return [];
    }
  }

  @override
  Future<TheoryPostModel?> getCachedPost(String id) async {
    final cachedData = HiveStorage.userBox.get('theory_$id');
    if (cachedData == null) return null;
    
    try {
      final Map<String, dynamic> json = jsonDecode(cachedData as String);
      return TheoryPostModel.fromJson(json);
    } catch (e) {
      AppLogger.error('Error loading cached theory post: $id', e);
      return null;
    }
  }

  @override
  Future<void> saveBookmark(String postId) async {
    final bookmarks = await getBookmarkedIds();
    if (!bookmarks.contains(postId)) {
      bookmarks.add(postId);
      await HiveStorage.userBox.put(_bookmarksKey, jsonEncode(bookmarks));
    }
  }

  @override
  Future<void> removeBookmark(String postId) async {
    final bookmarks = await getBookmarkedIds();
    bookmarks.remove(postId);
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
  Future<void> saveDownloadedPost(TheoryPostModel post) async {
    final downloads = await getDownloadedPosts();
    downloads.add(post);
    await HiveStorage.userBox.put(
      _downloadsKey,
      jsonEncode(downloads.map((p) => p.toJson()).toList()),
    );
  }

  @override
  Future<List<TheoryPostModel>> getDownloadedPosts() async {
    final downloadsData = HiveStorage.userBox.get(_downloadsKey);
    if (downloadsData == null) return [];
    
    try {
      final List<dynamic> downloadsJson = jsonDecode(downloadsData as String);
      return downloadsJson
          .map((json) => TheoryPostModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> deleteDownloadedPost(String postId) async {
    final downloads = await getDownloadedPosts();
    downloads.removeWhere((p) => p.id == postId);
    final models = downloads.whereType<TheoryPostModel>().toList();
    await HiveStorage.userBox.put(
      _downloadsKey,
      jsonEncode(models.map((p) {
        final json = p.toJson();
        return json;
      }).toList()),
    );
  }

  @override
  Future<void> clearCache() async {
    await HiveStorage.userBox.delete(_postsKey);
    AppLogger.info('Theory cache cleared');
  }
}

