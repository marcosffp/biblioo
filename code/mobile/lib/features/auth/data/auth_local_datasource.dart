import 'package:shared_preferences/shared_preferences.dart';

class AuthLocalDatasource {
  static const _keyAccess  = 'auth_access_token';
  static const _keyRefresh = 'auth_refresh_token';

  final SharedPreferences _prefs;
  const AuthLocalDatasource(this._prefs);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _prefs.setString(_keyAccess, accessToken);
    await _prefs.setString(_keyRefresh, refreshToken);
  }

  String? getAccessToken()  => _prefs.getString(_keyAccess);
  String? getRefreshToken() => _prefs.getString(_keyRefresh);

  Future<void> clearTokens() async {
    await _prefs.remove(_keyAccess);
    await _prefs.remove(_keyRefresh);
  }
}