import 'package:dio/dio.dart';
import '../../features/auth/data/auth_local_datasource.dart';
import '../../features/auth/data/auth_remote_datasource.dart';

// intercepta todo request e injeta o Bearer token
// se receber 401, tenta refresh e reexecuta o request original
class AuthInterceptor extends Interceptor {
  final AuthLocalDatasource _local;
  final AuthRemoteDatasource _remote;
  final Dio _dio;

  AuthInterceptor(this._local, this._remote, this._dio);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _local.getAccessToken();
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

    final refreshToken = _local.getRefreshToken();
    if (refreshToken == null) {
      handler.next(err);
      return;
    }

    try {
      // tenta renovar o token
      final refreshResult = await _remote.refresh(refreshToken);
      final tokens = refreshResult.tokens;
      await _local.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );

      // reexecuta o request original com o novo token
      final opts = err.requestOptions;
      opts.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
      final response = await _dio.fetch(opts);
      handler.resolve(response);
    } catch (_) {
      // refresh falhou — sessão expirada, força logout
      await _local.clearTokens();
      handler.next(err);
    }
  }
}
