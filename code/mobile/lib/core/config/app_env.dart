import 'package:flutter_dotenv/flutter_dotenv.dart';

const _defaultApiUrl = 'http://localhost:8080';

String get apiUrl {
  final value = dotenv.env['API_URL']?.trim();
  if (value == null || value.isEmpty) {
    return _defaultApiUrl;
  }
  return value.replaceFirst(RegExp(r'/$'), '');
}
