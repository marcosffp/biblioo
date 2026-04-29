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

  bool _isConnectivityError(Object error) {
    return error is DioException &&
        (error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout ||
            error.type == DioExceptionType.sendTimeout ||
            error.type == DioExceptionType.connectionError ||
            error.type == DioExceptionType.unknown);
  }

  AuthFailure _mapDioError(DioException e) {
    final status = e.response?.statusCode;
    final apiMessage = _extractApiMessage(e.response?.data);

    if (status == 401) {
      if (apiMessage != null && apiMessage.trim().isNotEmpty) {
        return AuthFailure(apiMessage);
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

  String? _extractApiMessage(dynamic data) {
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is String) return message;

      final detail = data['detail'];
      if (detail is String) return detail;
    }

    if (data is String && data.trim().isNotEmpty) {
      return data;
    }

    return null;
  }

  Future<AuthSession?> restoreSession() async {
    final access = _local.getAccessToken();
    final refresh = _local.getRefreshToken();
    if (access == null || refresh == null) return null;

    final cachedUser = _local.getSessionUser();

    try {
      final result = await _remote.refresh(refresh);
      await _local.saveTokens(
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      );
      await _local.saveSessionUser(result.user.toEntity());
      return AuthSession(
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user.toEntity(),
      );
    } on DioException catch (e) {
      // Token realmente invalido/expirado: encerra sessao.
      if (e.response?.statusCode == 401 || e.response?.statusCode == 403) {
        await _local.clearTokens();
        return null;
      }

      // Rede indisponivel/instavel: entra com sessao local se existir.
      if (cachedUser != null && _isConnectivityError(e)) {
        return AuthSession(
          accessToken: access,
          refreshToken: refresh,
          user: cachedUser,
        );
      }

      // Para erros nao-autenticacao, preserva sessao local quando possivel.
      if (cachedUser != null) {
        return AuthSession(
          accessToken: access,
          refreshToken: refresh,
          user: cachedUser,
        );
      }

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
      await _local.saveSessionUser(result.user.toEntity());
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
      await _local.saveSessionUser(result.user.toEntity());
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
