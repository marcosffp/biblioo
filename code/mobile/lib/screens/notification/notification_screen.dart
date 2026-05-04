import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/notification/bloc/notification_bloc.dart';
import 'package:biblioo/features/notification/bloc/notification_event.dart';
import 'package:biblioo/features/notification/bloc/notification_state.dart';
import 'package:biblioo/features/notification/domain/notification_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final _userRepo = Injector.instance.userRepo;
  final _communityRepo = Injector.instance.communityRepo;
  final Set<String> _busyNotificationIds = <String>{};
  final Map<String, String> _actionResults = <String, String>{};

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

  bool _isBusy(String id) => _busyNotificationIds.contains(id);

  String? _actionResultFor(String id) => _actionResults[id];

  void _setBusy(String id, bool busy) {
    if (!mounted) return;
    setState(() {
      if (busy) {
        _busyNotificationIds.add(id);
      } else {
        _busyNotificationIds.remove(id);
      }
    });
  }

  void _setActionResult(String id, String? result) {
    if (!mounted) return;
    setState(() {
      if (result == null) {
        _actionResults.remove(id);
      } else {
        _actionResults[id] = result;
      }
    });
  }

  Future<void> _markAsRead(NotificationItem item) async {
    if (item.read) return;
    context.read<NotificationBloc>().add(
      NotificationMarkAsReadRequested(item.id),
    );
  }

  Future<void> _markAsReadAndRefresh(NotificationItem item) async {
    await _markAsRead(item);
    await _refresh();
  }

  Future<void> _handleNotificationAction(
    NotificationItem item,
    Future<void> Function() action,
    String resultLabel,
  ) async {
    if (_isBusy(item.id)) return;

    _setBusy(item.id, true);
    try {
      await action();
      await _markAsReadAndRefresh(item);
      _setActionResult(item.id, resultLabel);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ação concluída com sucesso.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível concluir a ação.')),
      );
    } finally {
      _setBusy(item.id, false);
    }
  }

  Future<void> _acceptFollowRequest(NotificationItem item) {
    return _handleNotificationAction(
      item,
      () => _userRepo.acceptFollowRequest(item.actorUsername),
      'Aprovado',
    );
  }

  Future<void> _rejectFollowRequest(NotificationItem item) {
    return _handleNotificationAction(
      item,
      () => _userRepo.rejectFollowRequest(item.actorUsername),
      'Recusado',
    );
  }

  Future<void> _acceptCommunityJoinRequest(NotificationItem item) async {
    final communityId = item.communityId ?? item.entityId;
    if (communityId == null) return;

    await _handleNotificationAction(item, () async {
      final requests = await _communityRepo.getPendingJoinRequests(communityId);
      final request = requests.where(
        (req) => req.username.toLowerCase() == item.actorUsername.toLowerCase(),
      );

      if (request.isEmpty) {
        throw StateError('pending_join_request_not_found');
      }

      await _communityRepo.approveJoinRequest(request.first.id);
    }, 'Aprovado');
  }

  Future<void> _rejectCommunityJoinRequest(NotificationItem item) async {
    final communityId = item.communityId ?? item.entityId;
    if (communityId == null) return;

    await _handleNotificationAction(item, () async {
      final requests = await _communityRepo.getPendingJoinRequests(communityId);
      final request = requests.where(
        (req) => req.username.toLowerCase() == item.actorUsername.toLowerCase(),
      );

      if (request.isEmpty) {
        throw StateError('pending_join_request_not_found');
      }

      await _communityRepo.rejectJoinRequest(request.first.id);
    }, 'Recusado');
  }

  Future<void> _acceptCommunityInvite(NotificationItem item) {
    final inviteId = item.entityId;
    if (inviteId == null) return Future.value();

    return _handleNotificationAction(
      item,
      () => Injector.instance.communityRepo.acceptInvite(inviteId),
      'Aprovado',
    );
  }

  Future<void> _rejectCommunityInvite(NotificationItem item) {
    final inviteId = item.entityId;
    if (inviteId == null) return Future.value();

    return _handleNotificationAction(
      item,
      () => Injector.instance.communityRepo.declineInvite(inviteId),
      'Recusado',
    );
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
            return CooldownRefreshIndicator(
              keyId: 'notifications',
              onRefresh: _refresh,
              child: ListView(
                children: const [
                  SizedBox(height: 160),
                  Center(child: Text('Voce nao tem notificacoes.')),
                ],
              ),
            );
          }

          return CooldownRefreshIndicator(
            keyId: 'notifications',
            onRefresh: _refresh,
            child: ListView.separated(
              itemCount: state.notifications.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final item = state.notifications[index];
                final busy = _isBusy(item.id);
                final actionResult = _actionResultFor(item.id);

                return InkWell(
                  onTap: busy ? null : () => _handleNotificationTap(item),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 22,
                          child: Text(
                            item.actorUsername.isNotEmpty
                                ? item.actorUsername[0].toUpperCase()
                                : '?',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      _notificationTitle(item),
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ),
                                  if (!item.read)
                                    const Padding(
                                      padding: EdgeInsets.only(left: 8),
                                      child: Icon(Icons.brightness_1, size: 10),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _notificationSubtitle(item),
                                style: Theme.of(context).textTheme.bodySmall
                                    ?.copyWith(
                                      color: Theme.of(
                                        context,
                                      ).colorScheme.onSurfaceVariant,
                                    ),
                              ),
                              if (actionResult != null) ...[
                                const SizedBox(height: 12),
                                Text(
                                  actionResult,
                                  style: Theme.of(context).textTheme.labelLarge
                                      ?.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: actionResult == 'Aprovado'
                                            ? Colors.green
                                            : Colors.red,
                                      ),
                                ),
                              ] else if (_hasActions(item)) ...[
                                const SizedBox(height: 12),
                                _NotificationActionRow(
                                  busy: busy,
                                  item: item,
                                  onApprove: () {
                                    switch (item.type) {
                                      case NotificationType.userFollowRequested:
                                        return _acceptFollowRequest(item);
                                      case NotificationType
                                          .communityJoinRequest:
                                        return _acceptCommunityJoinRequest(
                                          item,
                                        );
                                      case NotificationType.communityInvite:
                                        return _acceptCommunityInvite(item);
                                      case NotificationType.userFollowed:
                                      case NotificationType.commentReplied:
                                      case NotificationType.reviewLiked:
                                      case NotificationType
                                          .communityJoinApproved:
                                        return Future.value();
                                    }
                                  },
                                  onReject: () {
                                    switch (item.type) {
                                      case NotificationType.userFollowRequested:
                                        return _rejectFollowRequest(item);
                                      case NotificationType
                                          .communityJoinRequest:
                                        return _rejectCommunityJoinRequest(
                                          item,
                                        );
                                      case NotificationType.communityInvite:
                                        return _rejectCommunityInvite(item);
                                      case NotificationType.userFollowed:
                                      case NotificationType.commentReplied:
                                      case NotificationType.reviewLiked:
                                      case NotificationType
                                          .communityJoinApproved:
                                        return Future.value();
                                    }
                                  },
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
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
        context.go('/community?focus=invites');
        return;
      case NotificationType.communityJoinRequest:
      case NotificationType.communityJoinApproved:
        final communityId = item.communityId ?? item.entityId;
        if (communityId != null) {
          context.push('/community/$communityId');
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

  bool _hasActions(NotificationItem item) {
    switch (item.type) {
      case NotificationType.userFollowRequested:
      case NotificationType.communityJoinRequest:
      case NotificationType.communityInvite:
        return true;
      case NotificationType.userFollowed:
      case NotificationType.commentReplied:
      case NotificationType.reviewLiked:
      case NotificationType.communityJoinApproved:
        return false;
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

    if (diff.inMinutes < 1) return 'agora';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min';
    if (diff.inHours < 24) return '${diff.inHours} h';
    return '${diff.inDays} d';
  }
}

class _NotificationActionRow extends StatelessWidget {
  final bool busy;
  final NotificationItem item;
  final Future<void> Function() onApprove;
  final Future<void> Function() onReject;

  const _NotificationActionRow({
    required this.busy,
    required this.item,
    required this.onApprove,
    required this.onReject,
  });

  String get _approveLabel {
    switch (item.type) {
      case NotificationType.communityInvite:
        return 'Aceitar';
      case NotificationType.userFollowRequested:
      case NotificationType.communityJoinRequest:
        return 'Aprovar';
      case NotificationType.userFollowed:
      case NotificationType.commentReplied:
      case NotificationType.reviewLiked:
      case NotificationType.communityJoinApproved:
        return 'Aprovar';
    }
  }

  String get _rejectLabel {
    switch (item.type) {
      case NotificationType.communityInvite:
        return 'Recusar';
      case NotificationType.userFollowRequested:
      case NotificationType.communityJoinRequest:
        return 'Recusar';
      case NotificationType.userFollowed:
      case NotificationType.commentReplied:
      case NotificationType.reviewLiked:
      case NotificationType.communityJoinApproved:
        return 'Recusar';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: busy ? null : onReject,
            child: Text(_rejectLabel),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: FilledButton(
            onPressed: busy ? null : onApprove,
            child: busy
                ? const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(_approveLabel),
          ),
        ),
      ],
    );
  }
}
