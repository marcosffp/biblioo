import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'models/user_model.dart';

class UserLocalDatasource {
  static const _keyProfile = 'cached_user_profile';
  static const _keyPendingFollowRequests = 'cached_pending_follow_requests';

  final SharedPreferences _prefs;
  const UserLocalDatasource(this._prefs);

  Future<void> saveProfile(UserModel user) async {
    await _prefs.setString(
      _keyProfile,
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

  UserModel? getProfile() {
    final raw = _prefs.getString(_keyProfile);
    if (raw == null) return null;
    return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  List<String> getPendingFollowRequests() {
    return _prefs.getStringList(_keyPendingFollowRequests) ?? const [];
  }

  Future<void> markFollowRequested(String username) async {
    final current = getPendingFollowRequests().toSet();
    current.add(username.toLowerCase());
    await _prefs.setStringList(_keyPendingFollowRequests, current.toList());
  }

  Future<void> clearFollowRequested(String username) async {
    final current = getPendingFollowRequests().toSet();
    current.remove(username.toLowerCase());
    await _prefs.setStringList(_keyPendingFollowRequests, current.toList());
  }

  bool isFollowRequested(String username) {
    return getPendingFollowRequests().contains(username.toLowerCase());
  }

  Future<void> clearProfile() async {
    await _prefs.remove(_keyProfile);
    await _prefs.remove(_keyPendingFollowRequests);
  }
}
