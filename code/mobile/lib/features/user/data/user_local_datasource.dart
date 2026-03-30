import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'models/user_model.dart';

class UserLocalDatasource {
  static const _keyProfile = 'cached_user_profile';

  final SharedPreferences _prefs;
  const UserLocalDatasource(this._prefs);

  Future<void> saveProfile(UserModel user) async {
    await _prefs.setString(_keyProfile, jsonEncode({
      'id': user.id,
      'username': user.username,
      'email': user.email,
      'bio': user.bio,
      'avatarUrl': user.avatarUrl,
      'bannerUrl': user.bannerUrl,
      'isPrivate': user.isPrivate,
      'restricted': user.restricted,
      'createdAt': user.createdAt,
    }));
  }

  UserModel? getProfile() {
    final raw = _prefs.getString(_keyProfile);
    if (raw == null) return null;
    return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<void> clearProfile() async {
    await _prefs.remove(_keyProfile);
  }
}