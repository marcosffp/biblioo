import 'package:biblioo/features/notification/domain/notification_item.dart';

import 'notification_remote_datasource.dart';

class NotificationRepository {
  final NotificationRemoteDatasource _remote;

  const NotificationRepository(this._remote);

  Future<List<NotificationItem>> listNotifications({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _remote.listNotifications(page: page, size: size);
    return response.map((item) => item.toEntity()).toList();
  }

  Future<int> getUnreadCount() => _remote.getUnreadCount();

  Future<void> markAsRead(String id) => _remote.markAsRead(id);

  Future<void> markAllAsRead() => _remote.markAllAsRead();
}
