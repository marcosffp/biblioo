// ignore_for_file: use_null_aware_elements

import 'package:dio/dio.dart';
import 'models/user_model.dart';
import 'models/follow_page_model.dart';

class UserRemoteDatasource {
  final Dio _dio;
  const UserRemoteDatasource(this._dio);

  // GET /users/me
  Future<UserModel> getMe() async {
    final response = await _dio.get('/users/me');
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  // GET /users/{username}
  Future<UserModel> getByUsername(String username) async {
    final response = await _dio.get('/users/$username');
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  // PUT /users/me — body opcional: bio, avatarUrl, bannerUrl
  Future<UserModel> updateProfile({
    String? bio,
    String? avatarUrl,
    String? bannerUrl,
  }) async {
    final response = await _dio.put('/users/me', data: {
      if (bio != null)       'bio': bio,
      if (avatarUrl != null) 'avatarUrl': avatarUrl,
      if (bannerUrl != null) 'bannerUrl': bannerUrl,
    });
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  // PUT /users/me/visibility
  Future<UserModel> updateVisibility({required bool isPrivate}) async {
    final response = await _dio.put(
      '/users/me/visibility',
      data: {'isPrivate': isPrivate},
    );
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  // POST /users/me/avatar — multipart/form-data, JPEG/PNG/WebP, até 5MB
  Future<UserModel> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post('/users/me/avatar', data: formData);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  // POST /users/me/banner — multipart/form-data, JPEG/PNG/WebP, até 5MB
  Future<UserModel> uploadBanner(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post('/users/me/banner', data: formData);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  // POST /users/{username}/follow → 204
  Future<void> follow(String username) async {
    await _dio.post('/users/$username/follow');
  }

  // DELETE /users/{username}/follow → 204
  Future<void> unfollow(String username) async {
    await _dio.delete('/users/$username/follow');
  }

  // DELETE /users/me → 204
  Future<void> deleteAccount() async {
    await _dio.delete('/users/me');
  }

  // GET /users?q=...&page=0&size=20
  Future<FollowPageModel> searchUsers({
    required String query,
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get('/users', queryParameters: {
      'q': query,
      'page': page,
      'size': size,
    });
    return FollowPageModel.fromJson(response.data as Map<String, dynamic>);
  }

  // GET /users/{username}/followers?page=0&size=20
  Future<FollowPageModel> getFollowers(
    String username, {
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/users/$username/followers',
      queryParameters: {'page': page, 'size': size},
    );
    return FollowPageModel.fromJson(response.data as Map<String, dynamic>);
  }

  // GET /users/{username}/following?page=0&size=20
  Future<FollowPageModel> getFollowing(
    String username, {
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/users/$username/following',
      queryParameters: {'page': page, 'size': size},
    );
    return FollowPageModel.fromJson(response.data as Map<String, dynamic>);
  }
}