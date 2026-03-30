import 'package:biblioo/features/auth/domain/auth_session.dart';
import 'auth_local_datasource.dart';
import 'auth_remote_datasource.dart';

class AuthRepository {
  final AuthRemoteDatasource _remote;
  final AuthLocalDatasource  _local;

  const AuthRepository(this._remote, this._local);

  Future<AuthSession?> restoreSession() async {
    final access  = _local.getAccessToken();
    final refresh = _local.getRefreshToken();
    if (access == null || refresh == null) return null;

    try {
      final result = await _remote.refresh(refresh);
      await _local.saveTokens(
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      );
      return AuthSession(
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user.toEntity(),
      );
    } catch (_) {
      await _local.clearTokens();
      return null;
    }
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final result = await _remote.login(email: email, password: password);
    await _local.saveTokens(
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    );
    return AuthSession(
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user.toEntity(),
    );
  }

  Future<AuthSession> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final result = await _remote.register(
      username: username,
      email: email,
      password: password,
    );
    await _local.saveTokens(
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    );
    return AuthSession(
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user.toEntity(),
    );
  }

  Future<void> logout() async {
    final refresh = _local.getRefreshToken();
    if (refresh != null) await _remote.logout(refresh);
    await _local.clearTokens();
  }
}