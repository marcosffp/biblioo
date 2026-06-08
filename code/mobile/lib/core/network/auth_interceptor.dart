import 'package:dio/dio.dart';
import '../../features/auth/data/auth_local_datasource.dart';
import '../../features/auth/data/auth_secure_datasource.dart';
import '../../features/auth/data/auth_remote_datasource.dart';

// intercepta todo request e injeta o Bearer token
// se receber 401, tenta refresh e reexecuta o request original
class AuthInterceptor extends Interceptor {
  final AuthLocalDatasource _local;
  final AuthSecureDatasource _secure;
  final AuthRemoteDatasource _remote;
  final Dio _dio;

  static const _retriedKey = '__auth_retried';
  Future<({String accessToken, String refreshToken})>? _refreshInFlight;

  AuthInterceptor(this._local, this._secure, this._remote, this._dio);

  bool _isAuthPath(String path) => path.startsWith('/auth/');

  bool _isConnectivityError(DioException e) {
    return e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.unknown;
  }

  Future<({String accessToken, String refreshToken})> _refreshTokens(
    String refreshToken,
  ) {
    final pending = _refreshInFlight;
    if (pending != null) return pending;

    final task = () async {
      final refreshResult = await _remote.refresh(refreshToken);
      final tokens = refreshResult.tokens;
      await _secure.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
      return (
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
    }();

    _refreshInFlight = task;
    task.whenComplete(() => _refreshInFlight = null);
    return task;
  }

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (_isAuthPath(options.path)) {
      handler.next(options);
      return;
    }

    final token = await _secure.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    // Never recurse when refresh itself fails.
    if (_isAuthPath(err.requestOptions.path)) {
      await _secure.clearTokens();
      await _local.clearSessionUser();
      handler.next(err);
      return;
    }

    // Retry only once per request.
    if (err.requestOptions.extra[_retriedKey] == true) {
      handler.next(err);
      return;
    }

    final secureRefreshToken = await _secure.getRefreshToken();
    if (secureRefreshToken == null) {
      handler.next(err);
      return;
    }

    try {
      final tokens = await _refreshTokens(secureRefreshToken);

      // reexecuta o request original com o novo token
      final opts = err.requestOptions;
      opts.extra[_retriedKey] = true;
      opts.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
      final response = await _dio.fetch(opts);
      handler.resolve(response);
    } on DioException catch (e) {
      final statusToClearSession = [401, 403];

      // Só força logout quando refresh foi realmente rejeitado por auth.
      if (statusToClearSession.contains(e.response?.statusCode)) {
        await _secure.clearTokens();
        await _local.clearSessionUser();
      }

      // Em rede ruim/offline, preserva token para nova tentativa futura.
      if (_isConnectivityError(e)) {
        handler.next(e);
        return;
      }

      handler.next(err);
    } catch (_) {
      handler.next(err);
    }
  }
}
