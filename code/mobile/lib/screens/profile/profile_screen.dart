import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/bloc/user_event.dart';
import 'package:biblioo/features/user/bloc/user_state.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: context.read<UserBloc>()..add(LoadMyProfile()),
      child: const _ProfileView(),
    );
  }
}

class _ProfileView extends StatelessWidget {
  const _ProfileView();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        if (state is UserLoading || state is UserInitial) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (state is UserError) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(state.message),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: () =>
                        context.read<UserBloc>().add(LoadMyProfile()),
                    child: const Text('Tentar novamente'),
                  ),
                ],
              ),
            ),
          );
        }

        final user = (state as UserLoaded).user;
        return _ProfileContent(user: user);
      },
    );
  }
}

class _ProfileContent extends StatelessWidget {
  final User user;
  const _ProfileContent({required this.user});

  String _initials(String username) {
    final parts = username.split('_');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return username.substring(0, username.length.clamp(0, 2)).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 160,
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: user.bannerUrl != null
                  ? Image.network(user.bannerUrl!, fit: BoxFit.cover)
                  : Container(color: theme.colorScheme.primaryContainer),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar + botões
                  Transform.translate(
                    offset: const Offset(0, -36),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        CircleAvatar(
                          radius: 36,
                          backgroundColor: theme.colorScheme.primary,
                          backgroundImage: user.avatarUrl != null
                              ? NetworkImage(user.avatarUrl!)
                              : null,
                          child: user.avatarUrl == null
                              ? Text(
                                  _initials(user.username),
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    color: theme.colorScheme.onPrimary,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Wrap(
                            alignment: WrapAlignment.end,
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              OutlinedButton(
                                onPressed: () => context.push('/profile/edit'),
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size(0, 36),
                                ),
                                child: const Text('Editar'),
                              ),
                              FilledButton(
                                onPressed: () {},
                                style: FilledButton.styleFrom(
                                  minimumSize: const Size(0, 36),
                                ),
                                child: const Text('Compartilhar'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Info
                  Transform.translate(
                    offset: const Offset(0, -24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.username,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(
                              user.isPrivate
                                  ? Icons.lock_outline
                                  : Icons.public,
                              size: 14,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            Text(
                              user.isPrivate
                                  ? ' Perfil Privado'
                                  : ' Perfil Público',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                        if (user.bio != null) ...[
                          const SizedBox(height: 8),
                          Text(user.bio!, style: theme.textTheme.bodyMedium),
                        ],
                      ],
                    ),
                  ),

                  // Stats — mockados até ter endpoints de shelf/social
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: const Wrap(
                        alignment: WrapAlignment.spaceAround,
                        spacing: 20,
                        runSpacing: 12,
                        children: [
                          _StatItem(value: '—', label: 'Livros Lidos'),
                          _StatItem(value: '—', label: 'Avaliações'),
                          _StatItem(value: '—', label: 'Seguidores'),
                          _StatItem(value: '—', label: 'Páginas Lidas'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // DNA Literário preview — mockado até ter endpoint
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Icon(
                              Icons.auto_awesome,
                              size: 18,
                              color: theme.colorScheme.primary,
                            ),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                'DNA Literário',
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.push('/profile/dna'),
                        child: const Text('Ver mais'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...[
                    ('Ficção Científica', 0.35),
                    ('Romance', 0.28),
                    ('Distopia', 0.20),
                  ].map(
                    (g) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(g.$1, style: theme.textTheme.bodyMedium),
                              Text(
                                '${(g.$2 * 100).toInt()}%',
                                style: theme.textTheme.bodySmall,
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          LinearProgressIndicator(
                            value: g.$2,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value, label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
