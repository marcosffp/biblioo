import 'dart:convert';

import 'package:biblioo/features/user/domain/user.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthLocalDatasource {
  static const _keyAccess = 'auth_access_token';
  static const _keyRefresh = 'auth_refresh_token';
  static const _keyUser = 'auth_session_user';

  final SharedPreferences _prefs;
  const AuthLocalDatasource(this._prefs);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _prefs.setString(_keyAccess, accessToken);
    await _prefs.setString(_keyRefresh, refreshToken);
  }

  String? getAccessToken() => _prefs.getString(_keyAccess);
  String? getRefreshToken() => _prefs.getString(_keyRefresh);

  Future<void> saveSessionUser(User user) async {
    await _prefs.setString(
      _keyUser,
      jsonEncode({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'bio': user.bio,
        'avatarUrl': user.avatarUrl,
        'bannerUrl': user.bannerUrl,
        'isPrivate': user.isPrivate,
        'restricted': user.restricted,
        'followStatus': user.followStatus.name,
        'createdAt': user.createdAt,
      }),
    );
  }

  User? getSessionUser() {
    final raw = _prefs.getString(_keyUser);
    if (raw == null) return null;
    final json = jsonDecode(raw) as Map<String, dynamic>;
    return User(
      id: (json['id'] as num).toInt(),
      username: json['username'] as String,
      email: json['email'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      bannerUrl: json['bannerUrl'] as String?,
      isPrivate: json['isPrivate'] as bool? ?? false,
      restricted: json['restricted'] as bool? ?? false,
      followStatus: _parseFollowStatus(json['followStatus'] as String?),
      createdAt: json['createdAt'] as String?,
    );
  }

  UserFollowStatus _parseFollowStatus(String? raw) {
    switch ((raw ?? '').toUpperCase()) {
      case 'FOLLOWING':
        return UserFollowStatus.following;
      case 'REQUESTED':
        return UserFollowStatus.requested;
      default:
        return UserFollowStatus.none;
    }
  }

  Future<void> clearTokens() async {
    await _prefs.remove(_keyAccess);
    await _prefs.remove(_keyRefresh);
    await _prefs.remove(_keyUser);
  }
}
