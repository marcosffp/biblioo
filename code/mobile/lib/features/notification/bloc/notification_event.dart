abstract class NotificationEvent {}

class NotificationLoadRequested extends NotificationEvent {
  final int page;
  final int size;

  NotificationLoadRequested({this.page = 0, this.size = 20});
}

class NotificationUnreadCountRequested extends NotificationEvent {}

class NotificationMarkAsReadRequested extends NotificationEvent {
  final String id;

  NotificationMarkAsReadRequested(this.id);
}

class NotificationMarkAllAsReadRequested extends NotificationEvent {}
