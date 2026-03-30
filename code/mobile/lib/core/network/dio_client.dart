import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

// em dev: flutter run --dart-define=API_URL=http://localhost:8080
// em prod: flutter build apk --dart-define=API_URL=https://api.biblioo.com.br
const _apiUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://localhost:8080',
);

Dio createDio() {
  final dio = Dio(
    BaseOptions(
      baseUrl: _apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
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