import 'package:biblioo/features/auth/domain/auth_session.dart';
import 'package:dio/dio.dart';
import 'auth_local_datasource.dart';
import 'auth_remote_datasource.dart';

class AuthFailure implements Exception {
  final String message;
  const AuthFailure(this.message);

  @override
  String toString() => message;
}

class AuthRepository {
  final AuthRemoteDatasource _remote;
  final AuthLocalDatasource _local;

  const AuthRepository(this._remote, this._local);

  AuthFailure _mapDioError(DioException e) {
    final status = e.response?.statusCode;
    final data = e.response?.data;
    final apiMessage = data is Map<String, dynamic>
        ? (data['message'] as String?)
        : null;

    if (status == 401) {
      if (apiMessage == 'Invalid email or password') {
        return const AuthFailure('E-mail ou senha invalidos.');
      }
      if (apiMessage == 'Refresh token is invalid or expired') {
        return const AuthFailure('Sua sessao expirou. Faca login novamente.');
      }
      return const AuthFailure('Voce nao tem permissao para esta acao.');
    }

    if (status == 409) {
      return const AuthFailure('E-mail ou nome de usuario ja cadastrado.');
    }

    if (status == 400 || status == 422) {
      return AuthFailure(apiMessage ?? 'Dados invalidos. Confira os campos.');
    }

    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.connectionError) {
      return const AuthFailure(
        'Sem conexao com o servidor. Tente novamente em instantes.',
      );
    }

    if (status != null && status >= 500) {
      return const AuthFailure('Servidor indisponivel no momento.');
    }

    return const AuthFailure('Nao foi possivel concluir a autenticacao.');
  }

  Future<AuthSession?> restoreSession() async {
    final access = _local.getAccessToken();
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
    try {
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
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<AuthSession> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
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
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<void> logout() async {
    final refresh = _local.getRefreshToken();
    try {
      if (refresh != null) {
        await _remote.logout(refresh);
      }
    } catch (_) {
      // Logout remoto em best effort; limpeza local e obrigatoria.
    } finally {
      await _local.clearTokens();
    }
  }
}
