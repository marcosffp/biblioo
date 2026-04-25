import 'package:dio/dio.dart';

import 'models/notification_model.dart';

class NotificationRemoteDatasource {
  final Dio _dio;

  const NotificationRemoteDatasource(this._dio);

  Future<List<NotificationModel>> listNotifications({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/notifications',
      queryParameters: {'page': page, 'size': size},
    );

    final data = response.data;
    if (data is! List) return const [];

    return data
        .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<int> getUnreadCount() async {
    final response = await _dio.get('/notifications/unread-count');
    final data = response.data as Map<String, dynamic>;
    return ((data['count'] as num?) ?? 0).toInt();
  }

  Future<void> markAsRead(String id) async {
    await _dio.put('/notifications/$id/read');
  }

  Future<void> markAllAsRead() async {
    await _dio.put('/notifications/read-all');
  }
}
