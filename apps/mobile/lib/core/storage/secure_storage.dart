import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/constants/storage_constants.dart';

class SecureStorage {
  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );
  
  // Tokens
  static Future<void> saveAccessToken(String token) async {
    await _storage.write(
      key: StorageConstants.accessTokenKey,
      value: token,
    );
  }
  
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: StorageConstants.accessTokenKey);
  }
  
  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(
      key: StorageConstants.refreshTokenKey,
      value: token,
    );
  }
  
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: StorageConstants.refreshTokenKey);
  }
  
  // User
  static Future<void> saveUserId(String userId) async {
    await _storage.write(
      key: StorageConstants.userIdKey,
      value: userId,
    );
  }
  
  static Future<String?> getUserId() async {
    return await _storage.read(key: StorageConstants.userIdKey);
  }
  
  static Future<void> saveSessionId(String sessionId) async {
    await _storage.write(
      key: StorageConstants.sessionIdKey,
      value: sessionId,
    );
  }
  
  static Future<String?> getSessionId() async {
    return await _storage.read(key: StorageConstants.sessionIdKey);
  }
  
  // Clear all
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
  
  static Future<void> clearAuthData() async {
    await _storage.delete(key: StorageConstants.accessTokenKey);
    await _storage.delete(key: StorageConstants.refreshTokenKey);
    await _storage.delete(key: StorageConstants.sessionIdKey);
  }
  
  // Generic methods
  static Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }
  
  static Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }
  
  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
  
  static Future<Map<String, String>> readAll() async {
    return await _storage.readAll();
  }
}

