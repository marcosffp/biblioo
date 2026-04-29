import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/community/bloc/community_bloc.dart';
import 'package:biblioo/features/community/bloc/community_event.dart';
import 'package:biblioo/features/community/bloc/community_state.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/community/domain/community_invite.dart';
import 'package:dio/dio.dart';
import 'package:biblioo/screens/community/widgets/create_community_sheet.dart';
import 'package:biblioo/screens/community/widgets/invite_code_sheet.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class CommunityListScreen extends StatelessWidget {
  final bool focusInvites;

  const CommunityListScreen({super.key, this.focusInvites = false});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          CommunityBloc(Injector.instance.communityRepo)
            ..add(CommunityLoadRequested()),
      child: _CommunityListView(focusInvites: focusInvites),
    );
  }
}

class _CommunityListView extends StatefulWidget {
  final bool focusInvites;

  const _CommunityListView({required this.focusInvites});

  @override
  State<_CommunityListView> createState() => _CommunityListViewState();
}

class _CommunityListViewState extends State<_CommunityListView> {
  final _repo = Injector.instance.communityRepo;

  List<CommunityInvite> _pendingInvites = const [];
  bool _pendingInvitesLoading = false;
  bool _pendingInvitesLoaded = false;
  final Set<int> _inviteActionBusy = <int>{};

  @override
  void initState() {
    super.initState();
    _loadPendingInvites();
  }

  Future<void> _loadPendingInvites() async {
    setState(() {
      _pendingInvitesLoading = true;
    });

    try {
      final invites = await _repo.getPendingInvites();
      if (!mounted) return;

      setState(() {
        _pendingInvites = invites.where((invite) => invite.isPending).toList();
        _pendingInvitesLoading = false;
        _pendingInvitesLoaded = true;
      });

      if (widget.focusInvites && _pendingInvites.isNotEmpty) {
        _showSnack('Você tem convites pendentes para responder.');
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _pendingInvitesLoading = false;
        _pendingInvitesLoaded = true;
      });

      _showSnack(
        _extractBackendMessage(e) ?? 'Não foi possível carregar convites.',
      );
    }
  }

  Future<void> _acceptInvite(CommunityInvite invite) async {
    if (_inviteActionBusy.contains(invite.id)) return;

    setState(() {
      _inviteActionBusy.add(invite.id);
    });

    try {
      await _repo.acceptInvite(invite.id);

      if (!mounted) return;
      setState(() {
        _pendingInvites = _pendingInvites
            .where((item) => item.id != invite.id)
            .toList();
      });

      context.read<CommunityBloc>().add(CommunityLoadRequested());
      _showSnack('Convite aceito. Você entrou em ${invite.communityName}.');
      context.push('/community/${invite.communityId}');
    } catch (e) {
      _showSnack(
        _extractBackendMessage(e) ?? 'Não foi possível aceitar o convite.',
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _inviteActionBusy.remove(invite.id);
      });
    }
  }

  Future<void> _declineInvite(CommunityInvite invite) async {
    if (_inviteActionBusy.contains(invite.id)) return;

    setState(() {
      _inviteActionBusy.add(invite.id);
    });

    try {
      await _repo.declineInvite(invite.id);
      if (!mounted) return;

      setState(() {
        _pendingInvites = _pendingInvites
            .where((item) => item.id != invite.id)
            .toList();
      });

      _showSnack('Convite recusado.');
    } catch (e) {
      _showSnack(
        _extractBackendMessage(e) ?? 'Não foi possível recusar o convite.',
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _inviteActionBusy.remove(invite.id);
      });
    }
  }

  String? _extractBackendMessage(Object error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        final message = data['message'];
        if (message is String && message.trim().isNotEmpty) {
          return message;
        }
      }
    }
    return null;
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocConsumer<CommunityBloc, CommunityState>(
      listener: (context, state) {
        if (state is CommunityMutationSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        if (state is CommunityError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              behavior: SnackBarBehavior.floating,
              backgroundColor: theme.colorScheme.error,
            ),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: theme.colorScheme.surface,
          body: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 16, 0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Comunidades',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Conecte-se com outros leitores',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      _CircularActionButton(
                        backgroundColor: theme.colorScheme.secondaryContainer,
                        icon: Icon(
                          Icons.link_rounded,
                          color: theme.colorScheme.onSecondaryContainer,
                        ),
                        tooltip: 'Entrar com código de convite',
                        onPressed: () => InviteCodeSheet.show(context),
                      ),
                      const SizedBox(width: 8),
                      _CircularActionButton(
                        backgroundColor: theme.colorScheme.primary,
                        icon: const Icon(Icons.add, color: Colors.white),
                        tooltip: 'Nova comunidade',
                        onPressed: () => CreateCommunitySheet.show(context),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: TextField(
                    onChanged: (value) {
                      context.read<CommunityBloc>().add(
                        CommunityLoadRequested(
                          query: value.trim().isEmpty ? null : value.trim(),
                        ),
                      );
                    },
                    decoration: const InputDecoration(
                      hintText: 'Buscar comunidades',
                      prefixIcon: Icon(Icons.search_rounded),
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                Expanded(child: _buildBody(context, state)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, CommunityState state) {
    if (state is CommunityLoading || state is CommunityInitial) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state is CommunityLoaded) {
      return _CommunityList(
        mine: state.mine,
        suggestions: state.suggestions,
        fromCache: state.isFromCache,
        lastSyncedAt: state.lastSyncedAt,
        pendingInvites: _pendingInvites,
        pendingInvitesLoading: _pendingInvitesLoading && !_pendingInvitesLoaded,
        inviteActionBusy: _inviteActionBusy,
        onAcceptInvite: _acceptInvite,
        onDeclineInvite: _declineInvite,
      );
    }

    if (state is CommunityMutating) {
      return const Center(child: CircularProgressIndicator());
    }

    return const SizedBox.shrink();
  }
}

class _CommunityList extends StatelessWidget {
  final List<Community> mine;
  final List<Community> suggestions;
  final bool fromCache;
  final DateTime? lastSyncedAt;
  final List<CommunityInvite> pendingInvites;
  final bool pendingInvitesLoading;
  final Set<int> inviteActionBusy;
  final Future<void> Function(CommunityInvite invite) onAcceptInvite;
  final Future<void> Function(CommunityInvite invite) onDeclineInvite;

  const _CommunityList({
    required this.mine,
    required this.suggestions,
    required this.fromCache,
    this.lastSyncedAt,
    required this.pendingInvites,
    required this.pendingInvitesLoading,
    required this.inviteActionBusy,
    required this.onAcceptInvite,
    required this.onDeclineInvite,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        if (pendingInvitesLoading)
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Card(
              elevation: 0,
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
          ),
        if (pendingInvites.isNotEmpty) ...[
          const _SectionHeader(title: 'Convites pendentes'),
          ...pendingInvites.map(
            (invite) => _PendingInviteCard(
              invite: invite,
              busy: inviteActionBusy.contains(invite.id),
              onAccept: () => onAcceptInvite(invite),
              onDecline: () => onDeclineInvite(invite),
            ),
          ),
        ],
        if (fromCache)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Card(
              elevation: 0,
              color: theme.colorScheme.secondaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(
                      Icons.wifi_off_rounded,
                      size: 18,
                      color: theme.colorScheme.onSecondaryContainer,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        lastSyncedAt != null
                            ? 'Exibindo cache local. Última sincronização: ${lastSyncedAt!.hour.toString().padLeft(2, '0')}:${lastSyncedAt!.minute.toString().padLeft(2, '0')}'
                            : 'Exibindo cache local até a conexão voltar.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSecondaryContainer,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        if (mine.isNotEmpty) ...[
          _SectionHeader(title: 'Minhas Comunidades'),
          ...mine.map((c) => _MyCommunityCard(community: c)),
        ],
        if (suggestions.isNotEmpty) ...[
          _SectionHeader(title: 'Sugestões para você'),
          ...suggestions.map((c) => _SuggestionCard(community: c)),
        ],
        if (mine.isEmpty && suggestions.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32),
            child: Center(
              child: Text(
                'Nenhuma comunidade encontrada.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _PendingInviteCard extends StatelessWidget {
  final CommunityInvite invite;
  final bool busy;
  final Future<void> Function() onAccept;
  final Future<void> Function() onDecline;

  const _PendingInviteCard({
    required this.invite,
    required this.busy,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 0,
        color: theme.colorScheme.tertiaryContainer.withValues(alpha: 0.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.mail_rounded,
                    size: 18,
                    color: theme.colorScheme.onTertiaryContainer,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      invite.communityName,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${invite.inviterUsername} convidou você para esta comunidade.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: busy ? null : onDecline,
                      child: const Text('Recusar'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      onPressed: busy ? null : onAccept,
                      child: busy
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Aceitar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Text(
        title,
        style: Theme.of(
          context,
        ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _MyCommunityCard extends StatelessWidget {
  final Community community;
  const _MyCommunityCard({required this.community});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          leading: const _CommunityAvatar(),
          title: Row(
            children: [
              Expanded(
                child: Text(
                  community.name,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                community.isPublic
                    ? Icons.language_rounded
                    : Icons.lock_rounded,
                size: 14,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ],
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 2),
              Text(
                community.bookAuthor.isEmpty
                    ? community.bookTitle
                    : '${community.bookTitle} - ${community.bookAuthor}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(
                    Icons.group_rounded,
                    size: 14,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${community.memberCount}  •  ${_timeAgo(community.createdAt)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
          trailing: PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'leave') {
                context.read<CommunityBloc>().add(
                  CommunityLeaveRequested(community.id),
                );
              }
            },
            itemBuilder: (context) => const [
              PopupMenuItem<String>(
                value: 'leave',
                child: Text('Sair da comunidade'),
              ),
            ],
            icon: const Icon(Icons.more_horiz_rounded),
          ),
          onTap: () => context.push('/community/${community.id}'),
        ),
      ),
    );
  }
}

class _SuggestionCard extends StatelessWidget {
  final Community community;
  const _SuggestionCard({required this.community});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          leading: const _CommunityAvatar(),
          title: Row(
            children: [
              Expanded(
                child: Text(
                  community.name,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                community.isPublic
                    ? Icons.language_rounded
                    : Icons.lock_rounded,
                size: 14,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ],
          ),
          subtitle: Text(
            '${community.memberCount} membros',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          trailing: community.isPublic
              ? FilledButton(
                  onPressed: () {
                    context.read<CommunityBloc>().add(
                      CommunityJoinRequested(community.id),
                    );
                  },
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(72, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: const Text('Entrar'),
                )
              : Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.lock_rounded,
                        size: 12,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Via convite',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
          onTap: () => context.push('/community/${community.id}'),
        ),
      ),
    );
  }
}

class _CommunityAvatar extends StatelessWidget {
  const _CommunityAvatar();

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      child: Icon(
        Icons.group_rounded,
        color: Theme.of(context).colorScheme.primary,
      ),
    );
  }
}

class _CircularActionButton extends StatelessWidget {
  final Color backgroundColor;
  final Widget icon;
  final String tooltip;
  final VoidCallback onPressed;

  const _CircularActionButton({
    required this.backgroundColor,
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(color: backgroundColor, shape: BoxShape.circle),
      child: IconButton(icon: icon, tooltip: tooltip, onPressed: onPressed),
    );
  }
}

String _timeAgo(DateTime dt) {
  final diff = DateTime.now().difference(dt);
  if (diff.inSeconds < 60) return 'agora';
  if (diff.inMinutes < 60) return 'Há ${diff.inMinutes} min';
  if (diff.inHours < 24) return 'Há ${diff.inHours}h';
  if (diff.inDays == 1) return 'Há 1 dia';
  return 'Há ${diff.inDays} dias';
}
