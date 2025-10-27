import 'dart:convert';
import 'package:mobile/core/storage/secure_storage.dart';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    String? sessionToken,
  });
  
  Future<String?> getAccessToken();
  Future<String?> getRefreshToken();
  Future<String?> getSessionToken();
  
  Future<void> saveUser(UserModel user);
  Future<UserModel?> getCachedUser();
  
  Future<void> clearAuthData();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    String? sessionToken,
  }) async {
    await SecureStorage.saveAccessToken(accessToken);
    await SecureStorage.saveRefreshToken(refreshToken);
    if (sessionToken != null) {
      await SecureStorage.saveSessionId(sessionToken);
    }
  }
  
  @override
  Future<String?> getAccessToken() async {
    return await SecureStorage.getAccessToken();
  }
  
  @override
  Future<String?> getRefreshToken() async {
    return await SecureStorage.getRefreshToken();
  }
  
  @override
  Future<String?> getSessionToken() async {
    return await SecureStorage.getSessionId();
  }
  
  @override
  Future<void> saveUser(UserModel user) async {
    final userJson = jsonEncode(user.toJson());
    await HiveStorage.userBox.put('current_user', userJson);
  }
  
  @override
  Future<UserModel?> getCachedUser() async {
    final userJson = HiveStorage.userBox.get('current_user');
    if (userJson != null) {
      final Map<String, dynamic> userMap = jsonDecode(userJson as String);
      return UserModel.fromJson(userMap);
    }
    return null;
  }
  
  @override
  Future<void> clearAuthData() async {
    await SecureStorage.clearAuthData();
    await HiveStorage.userBox.delete('current_user');
  }
}

