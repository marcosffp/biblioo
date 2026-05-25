import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/features/feed/bloc/feed_bloc.dart';
import 'package:biblioo/features/feed/bloc/feed_event.dart';
import 'package:biblioo/features/feed/bloc/feed_state.dart';
import 'package:biblioo/features/notification/bloc/notification_bloc.dart';
import 'package:biblioo/features/notification/bloc/notification_event.dart';
import 'package:biblioo/features/notification/bloc/notification_state.dart';
import 'package:biblioo/screens/feed/widgets/feed_item_card.dart';
import 'package:biblioo/shared/widgets/bibi_fab.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final _scrollController = ScrollController();
  int? _loadedForUserId;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadFeed());
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _loadFeed({bool refresh = false}) {
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthAuthenticated) return;
    _loadedForUserId = authState.session.user.id;
    context.read<FeedBloc>().add(
      FeedLoadRequested(userId: authState.session.user.id, refresh: refresh),
    );
  }

  Future<void> _refresh() async {
    _loadFeed(refresh: true);
  }

  void _onScroll() {
    if (!_scrollController.hasClients || _loadedForUserId == null) return;
    final position = _scrollController.position;
    if (position.pixels < position.maxScrollExtent - 400) return;
    context.read<FeedBloc>().add(
      FeedLoadMoreRequested(userId: _loadedForUserId!),
    );
  }

  Future<void> _openCreatePost() async {
    final result = await context.push<bool>('/post/create');
    if (result == true && mounted) {
      _loadFeed(refresh: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    if (authState is! AuthAuthenticated) {
      return const Scaffold(
        body: Center(child: Text('Faca login para ver o feed.')),
      );
    }

    if (_loadedForUserId != authState.session.user.id) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadFeed());
    }

    final currentUserId = authState.session.user.id;

    return BlocListener<FeedBloc, FeedState>(
      listener: (context, state) {
        if (state is FeedLoaded && state.actionError != null) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.actionError!)));
        }
      },
      child: Scaffold(
        body: CooldownRefreshIndicator(
          keyId: 'feed',
          onRefresh: _refresh,
          child: RefreshIndicator(
            onRefresh: _refresh,
            child: CustomScrollView(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverAppBar(
                  floating: true,
                  snap: true,
                  title: const Text('Feed'),
                  actions: const [_NotificationBellButton()],
                  bottom: PreferredSize(
                    preferredSize: const Size.fromHeight(56),
                    child: _SearchBar(onTap: () => context.push('/search')),
                  ),
                ),
                BlocBuilder<FeedBloc, FeedState>(
                  builder: (context, state) {
                    if (state is FeedInitial || state is FeedLoading) {
                      return const SliverFillRemaining(
                        child: Center(child: CircularProgressIndicator()),
                      );
                    }

                    if (state is FeedError) {
                      return SliverFillRemaining(
                        hasScrollBody: false,
                        child: _FeedError(
                          message: state.message,
                          onRetry: _loadFeed,
                        ),
                      );
                    }

                    final loaded = state as FeedLoaded;
                    if (loaded.items.isEmpty) {
                      return const SliverFillRemaining(
                        hasScrollBody: false,
                        child: _EmptyFeed(),
                      );
                    }

                    return SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            if (index == loaded.items.length) {
                              return const Padding(
                                padding: EdgeInsets.symmetric(vertical: 16),
                                child: Center(
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            }
                            return FeedItemCard(
                              item: loaded.items[index],
                              currentUserId: currentUserId,
                            );
                          },
                          childCount:
                              loaded.items.length +
                              (loaded.isLoadingMore ? 1 : 0),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
        floatingActionButton: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            const BibiFab(mini: true),
            const SizedBox(height: 8),
            _FeedFab(
              onCreatePost: _openCreatePost,
              onRateBook: () => context.push('/search'),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeedFab extends StatefulWidget {
  final VoidCallback onCreatePost;
  final VoidCallback onRateBook;

  const _FeedFab({required this.onCreatePost, required this.onRateBook});

  @override
  State<_FeedFab> createState() => _FeedFabState();
}

class _FeedFabState extends State<_FeedFab>
    with SingleTickerProviderStateMixin {
  bool _open = false;
  late final AnimationController _controller;
  late final Animation<double> _expandAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _expandAnim = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() => _open = !_open);
    if (_open) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  void _close() {
    setState(() => _open = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        FadeTransition(
          opacity: _expandAnim,
          child: ScaleTransition(
            scale: _expandAnim,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _MiniFabItem(
                  icon: Icons.edit_note_outlined,
                  label: 'Criar post',
                  onTap: () {
                    _close();
                    widget.onCreatePost();
                  },
                ),
                const SizedBox(height: 8),
                _MiniFabItem(
                  icon: Icons.rate_review_outlined,
                  label: 'Avaliar livro',
                  onTap: () {
                    _close();
                    widget.onRateBook();
                  },
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
        FloatingActionButton(
          heroTag: 'feed_main_fab',
          onPressed: _toggle,
          child: AnimatedRotation(
            turns: _open ? 0.125 : 0,
            duration: const Duration(milliseconds: 200),
            child: Icon(
              _open ? Icons.close : Icons.add,
              color: theme.colorScheme.onPrimary,
            ),
          ),
        ),
      ],
    );
  }
}

class _MiniFabItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MiniFabItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Material(
          elevation: 2,
          borderRadius: BorderRadius.circular(8),
          color: theme.colorScheme.surfaceContainerHigh,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Text(label, style: theme.textTheme.labelMedium),
          ),
        ),
        const SizedBox(width: 8),
        FloatingActionButton.small(
          heroTag: 'feed_fab_$label',
          onPressed: onTap,
          child: Icon(icon),
        ),
      ],
    );
  }
}

class _NotificationBellButton extends StatefulWidget {
  const _NotificationBellButton();

  @override
  State<_NotificationBellButton> createState() =>
      _NotificationBellButtonState();
}

class _NotificationBellButtonState extends State<_NotificationBellButton> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<NotificationBloc>().add(NotificationLoadRequested(size: 1));
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NotificationBloc, NotificationState>(
      builder: (context, state) {
        final unreadCount = state is NotificationLoaded ? state.unreadCount : 0;

        return IconButton(
          tooltip: 'Notificacoes',
          onPressed: () async {
            final notificationBloc = context.read<NotificationBloc>();
            await context.push('/notifications');
            if (!mounted) return;
            notificationBloc.add(NotificationUnreadCountRequested());
          },
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.notifications_none),
              if (unreadCount > 0)
                Positioned(
                  right: -2,
                  top: -2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 5,
                      vertical: 1,
                    ),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.error,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      unreadCount > 99 ? '99+' : '$unreadCount',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onError,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _SearchBar extends StatelessWidget {
  final VoidCallback onTap;

  const _SearchBar({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 44,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest.withValues(
              alpha: 0.5,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(
                Icons.search,
                color: theme.colorScheme.onSurfaceVariant,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Buscar livros, usuarios, comunidades...',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeedError extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _FeedError({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.wifi_off_rounded,
            size: 56,
            color: theme.colorScheme.error.withValues(alpha: 0.7),
          ),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onRetry,
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }
}

class _EmptyFeed extends StatelessWidget {
  const _EmptyFeed();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.dynamic_feed_outlined,
            size: 56,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(height: 12),
          Text(
            'Ainda nao ha publicacoes no seu feed.',
            style: theme.textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Siga outros leitores ou crie seu primeiro post.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
