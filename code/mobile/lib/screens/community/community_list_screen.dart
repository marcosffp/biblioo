import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/community/bloc/community_bloc.dart';
import 'package:biblioo/features/community/bloc/community_event.dart';
import 'package:biblioo/features/community/bloc/community_state.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/screens/community/widgets/create_community_sheet.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CommunityListScreen extends StatelessWidget {
  const CommunityListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          CommunityBloc(Injector.instance.communityRepo)
            ..add(CommunityLoadRequested()),
      child: const _CommunityListView(),
    );
  }
}

class _CommunityListView extends StatelessWidget {
  const _CommunityListView();

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
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary,
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.add, color: Colors.white),
                          tooltip: 'Nova comunidade',
                          onPressed: () =>
                              CreateCommunitySheet.show(context),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: TextField(
                    readOnly: true,
                    decoration: const InputDecoration(
                      hintText: 'Buscar comunidades',
                      prefixIcon: Icon(Icons.search_rounded),
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                Expanded(
                  child: _buildBody(context, state),
                ),
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
      return _CommunityList(mine: state.mine, suggestions: state.suggestions);
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

  const _CommunityList({required this.mine, required this.suggestions});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
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

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
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
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                '${community.bookTitle} - ${community.bookAuthor}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.group_rounded,
                      size: 14,
                      color: theme.colorScheme.onSurfaceVariant),
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
          trailing: const Icon(Icons.chevron_right_rounded),
          onTap: () {},
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
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading: const _CommunityAvatar(),
          title: Text(
            community.name,
            style: theme.textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          subtitle: Text(
            '${community.memberCount} membros',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          trailing: FilledButton(
            onPressed: () {
              context
                  .read<CommunityBloc>()
                  .add(CommunityJoinRequested(community.id));
            },
            style: FilledButton.styleFrom(
              minimumSize: const Size(72, 36),
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            child: const Text('Entrar'),
          ),
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
      backgroundColor:
          Theme.of(context).colorScheme.primaryContainer,
      child: Icon(
        Icons.group_rounded,
        color: Theme.of(context).colorScheme.primary,
      ),
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
