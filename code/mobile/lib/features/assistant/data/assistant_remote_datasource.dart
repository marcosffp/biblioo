import 'package:dio/dio.dart';

class AssistantRemoteDatasource {
  final Dio _dio;

  const AssistantRemoteDatasource(this._dio);

  Future<({String reply, String conversationId})> sendMessage(
    String message,
    String? conversationId,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/assistant/chat',
      options: Options(receiveTimeout: const Duration(seconds: 90)),
      data: {
        'message': message,
        if (conversationId != null) 'conversationId': conversationId,
      },
    );

    final data = response.data;
    if (data == null) {
      throw Exception('Empty response body from /assistant/chat');
    }
    return (
      reply: data['reply'] as String,
      conversationId: data['conversationId'] as String,
    );
  }
}
