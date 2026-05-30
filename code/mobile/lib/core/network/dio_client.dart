import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:biblioo/core/config/app_env.dart';

Dio createDio() {
  final dio = Dio(
    BaseOptions(
      baseUrl: apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  if (kDebugMode) {
    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: false,
        error: true,
        logPrint: (o) => debugPrint(o.toString()),
      ),
    );
  }

  return dio;
}
