import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationRepository _repository;

  NotificationBloc(this._repository) : super(NotificationInitial()) {
    on<NotificationLoadRequested>(_onLoad);
    on<NotificationUnreadCountRequested>(_onUnreadCount);
    on<NotificationMarkAsReadRequested>(_onMarkAsRead);
    on<NotificationMarkAllAsReadRequested>(_onMarkAllAsRead);
  }

  Future<void> _onLoad(
    NotificationLoadRequested event,
    Emitter<NotificationState> emit,
  ) async {
    emit(NotificationLoading());
    try {
      final notifications = await _repository.listNotifications(
        page: event.page,
        size: event.size,
      );
      final unreadCount = await _repository.getUnreadCount();
      emit(
        NotificationLoaded(
          notifications: notifications,
          unreadCount: unreadCount,
        ),
      );
    } catch (e, st) {
      debugPrint('[NotificationBloc] ${event.runtimeType}: $e\n$st');
      emit(NotificationError('Failed to load notifications.'));
    }
  }

  Future<void> _onUnreadCount(
    NotificationUnreadCountRequested event,
    Emitter<NotificationState> emit,
  ) async {
    final current = state;
    if (current is! NotificationLoaded) return;

    try {
      final unreadCount = await _repository.getUnreadCount();
      emit(current.copyWith(unreadCount: unreadCount));
    } catch (e, st) {
      debugPrint('[NotificationBloc] ${event.runtimeType}: $e\n$st');
    }
  }

  Future<void> _onMarkAsRead(
    NotificationMarkAsReadRequested event,
    Emitter<NotificationState> emit,
  ) async {
    final current = state;
    if (current is! NotificationLoaded) return;

    final target = current.notifications.where((item) => item.id == event.id);
    if (target.isEmpty || target.first.read) return;

    try {
      await _repository.markAsRead(event.id);
      final updated = current.notifications
          .map((item) => item.id == event.id ? item.copyWith(read: true) : item)
          .toList();
      emit(
        current.copyWith(
          notifications: updated,
          unreadCount: (current.unreadCount - 1).clamp(0, 1 << 31),
        ),
      );
    } catch (e, st) {
      debugPrint('[NotificationBloc] ${event.runtimeType}: $e\n$st');
    }
  }

  Future<void> _onMarkAllAsRead(
    NotificationMarkAllAsReadRequested event,
    Emitter<NotificationState> emit,
  ) async {
    final current = state;
    if (current is! NotificationLoaded) return;

    try {
      await _repository.markAllAsRead();
      final updated = current.notifications
          .map((item) => item.read ? item : item.copyWith(read: true))
          .toList();
      emit(current.copyWith(notifications: updated, unreadCount: 0));
    } catch (e, st) {
      debugPrint('[NotificationBloc] ${event.runtimeType}: $e\n$st');
    }
  }
}
