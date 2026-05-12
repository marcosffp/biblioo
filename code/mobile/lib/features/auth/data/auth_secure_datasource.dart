import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthSecureDatasource {
  static const _keyAccessToken = 'auth_access_token_v2';
  static const _keyRefreshToken = 'auth_refresh_token_v2';
  static const _keyDeviceId = 'auth_device_id';

  final FlutterSecureStorage _storage;

  const AuthSecureDatasource(this._storage);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _keyAccessToken, value: accessToken),
      _storage.write(key: _keyRefreshToken, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: _keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: _keyRefreshToken);
  }

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _keyAccessToken),
      _storage.delete(key: _keyRefreshToken),
    ]);
  }

  Future<void> saveDeviceId(String deviceId) async {
    await _storage.write(key: _keyDeviceId, value: deviceId);
  }

  Future<String?> getDeviceId() async {
    return _storage.read(key: _keyDeviceId);
  }
}
