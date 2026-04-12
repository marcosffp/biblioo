import 'dart:math';

import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  final Dio _dio;
  final int maxRetries;
  final Duration baseDelay;
  final Duration maxDelay;

  static const _retryCountKey = '__retry_count';

  RetryInterceptor(
    this._dio, {
    this.maxRetries = 3,
    this.baseDelay = const Duration(milliseconds: 300),
    this.maxDelay = const Duration(seconds: 2),
  });

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final req = err.requestOptions;
    final retryCount = (req.extra[_retryCountKey] as int?) ?? 0;

    if (!_shouldRetry(err, req) || retryCount >= maxRetries) {
      handler.next(err);
      return;
    }

    final nextCount = retryCount + 1;
    req.extra[_retryCountKey] = nextCount;

    await Future<void>.delayed(_computeDelay(nextCount));

    try {
      final response = await _dio.fetch(req);
      handler.resolve(response);
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  bool _shouldRetry(DioException err, RequestOptions req) {
    // Auth failures should be handled by AuthInterceptor/session flow.
    if (err.response?.statusCode == 401) return false;

    // Avoid retries for refresh endpoint to prevent token loops.
    if (req.path.startsWith('/auth/refresh')) return false;

    // Retry only idempotent requests by default.
    final method = req.method.toUpperCase();
    final isIdempotent =
        method == 'GET' || method == 'HEAD' || method == 'OPTIONS';
    if (!isIdempotent) return false;

    // Retry transient network and server errors.
    final type = err.type;
    if (type == DioExceptionType.connectionTimeout ||
        type == DioExceptionType.sendTimeout ||
        type == DioExceptionType.receiveTimeout ||
        type == DioExceptionType.connectionError ||
        type == DioExceptionType.unknown) {
      return true;
    }

    final status = err.response?.statusCode;
    if (status == null) return false;
    if (status == 429) return true;
    return status >= 500 && status <= 599;
  }

  Duration _computeDelay(int attempt) {
    final expMs = baseDelay.inMilliseconds * (1 << (attempt - 1));
    final cappedMs = min(expMs, maxDelay.inMilliseconds);
    final jitter = Random().nextInt(250);
    return Duration(milliseconds: cappedMs + jitter);
  }
}
