import 'package:biblioo/features/notification/bloc/notification_bloc.dart';
import 'package:biblioo/features/notification/bloc/notification_event.dart';
import 'package:biblioo/features/notification/bloc/notification_state.dart';
import 'package:biblioo/features/notification/domain/notification_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<NotificationBloc>().add(NotificationLoadRequested());
    });
  }

  Future<void> _refresh() async {
    context.read<NotificationBloc>().add(NotificationLoadRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificacoes'),
        actions: [
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is! NotificationLoaded || state.unreadCount == 0) {
                return const SizedBox.shrink();
              }

              return TextButton(
                onPressed: () {
                  context.read<NotificationBloc>().add(
                    NotificationMarkAllAsReadRequested(),
                  );
                },
                child: const Text('Marcar todas'),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          if (state is NotificationLoading || state is NotificationInitial) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is NotificationError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(state.message),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: _refresh,
                      child: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is! NotificationLoaded) {
            return const SizedBox.shrink();
          }

          if (state.notifications.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                children: const [
                  SizedBox(height: 160),
                  Center(child: Text('Voce nao tem notificacoes.')),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              itemCount: state.notifications.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final item = state.notifications[index];

                return ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      item.actorUsername.isNotEmpty
                          ? item.actorUsername[0].toUpperCase()
                          : '?',
                    ),
                  ),
                  title: Text(_notificationTitle(item)),
                  subtitle: Text(_notificationSubtitle(item)),
                  trailing: item.read
                      ? null
                      : const Icon(Icons.brightness_1, size: 10),
                  onTap: () => _handleNotificationTap(item),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _handleNotificationTap(NotificationItem item) {
    if (!item.read) {
      context.read<NotificationBloc>().add(
        NotificationMarkAsReadRequested(item.id),
      );
    }

    switch (item.type) {
      case NotificationType.userFollowRequested:
      case NotificationType.userFollowed:
        context.push('/user/${Uri.encodeComponent(item.actorUsername)}');
        return;
      case NotificationType.communityInvite:
      case NotificationType.communityJoinRequest:
      case NotificationType.communityJoinApproved:
        if (item.entityId != null) {
          context.push('/community/${item.entityId}');
          return;
        }
        context.go('/community');
        return;
      case NotificationType.commentReplied:
      case NotificationType.reviewLiked:
        context.go('/feed');
        return;
    }
  }

  String _notificationTitle(NotificationItem item) {
    switch (item.type) {
      case NotificationType.userFollowRequested:
        return '${item.actorUsername} quer te seguir';
      case NotificationType.userFollowed:
        return '${item.actorUsername} comecou a te seguir';
      case NotificationType.commentReplied:
        return '${item.actorUsername} respondeu seu comentario';
      case NotificationType.reviewLiked:
        return '${item.actorUsername} curtiu sua review';
      case NotificationType.communityInvite:
        return '${item.actorUsername} te convidou para uma comunidade';
      case NotificationType.communityJoinRequest:
        return '${item.actorUsername} pediu para entrar na comunidade';
      case NotificationType.communityJoinApproved:
        return 'Seu pedido de entrada foi aprovado';
    }
  }

  String _notificationSubtitle(NotificationItem item) {
    final now = DateTime.now();
    final diff = now.difference(item.createdAt);

    if (diff.inMinutes < 1) return 'Agora';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min';
    if (diff.inHours < 24) return '${diff.inHours} h';
    return '${diff.inDays} d';
  }
}
