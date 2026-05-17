import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:biblioo/features/community/bloc/community_voting_bloc.dart';
import 'package:biblioo/features/community/bloc/community_voting_event.dart';
import 'package:biblioo/features/community/bloc/community_voting_state.dart';
import 'package:biblioo/features/community/domain/book_voting.dart';
import 'package:biblioo/features/community/domain/book_voting_option.dart';
import 'package:biblioo/screens/community/widgets/create_voting_sheet.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';

class CommunityVotingTab extends StatelessWidget {
  final int communityId;
  final bool isOwner;
  final Future<void> Function()? onRefresh;

  const CommunityVotingTab({
    super.key,
    required this.communityId,
    required this.isOwner,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CommunityVotingBloc, CommunityVotingState>(
      builder: (context, state) {
        Widget content;

        if (state is CommunityVotingLoading) {
          content = const Center(child: CircularProgressIndicator());
        } else if (state is CommunityVotingEmpty) {
          content = _buildEmptyState(context);
        } else if (state is CommunityVotingLoadedWithActive) {
          content = _buildVotingContent(context, state.activeVoting, isOwner);
        } else if (state is CommunityVotingLoadedNoActive) {
          if (state.votings.isEmpty) {
            content = _buildEmptyState(context);
          } else {
            content = Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPastVotingsContent(context, state.votings, isOwner),
                if (isOwner) ...[
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () =>
                        CreateVotingSheet.show(context, communityId),
                    icon: const Icon(Icons.add_chart_rounded),
                    label: const Text('Criar nova votação'),
                  ),
                ],
              ],
            );
          }
        } else if (state is CommunityVotingError) {
          content = _buildErrorState(context, state.message);
        } else {
          content = const Center(child: Text('Estado desconhecido'));
        }

        final list = ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              switchInCurve: Curves.easeOut,
              switchOutCurve: Curves.easeIn,
              child: KeyedSubtree(
                key: ValueKey(state.runtimeType),
                child: content,
              ),
            ),
          ],
        );

        if (onRefresh != null) {
          return CooldownRefreshIndicator(
            keyId: 'community_voting_$communityId',
            onRefresh: onRefresh!,
            child: list,
          );
        }

        return list;
      },
    );
  }

  Widget _buildVotingContent(
    BuildContext context,
    BookVoting voting,
    bool isOwner,
  ) {
    final theme = Theme.of(context);

    return Card(
      elevation: 1.5,
      shadowColor: theme.colorScheme.primary.withOpacity(0.10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        voting.title,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        voting.description,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                _buildStatusBadge(voting, theme),
              ],
            ),
            const SizedBox(height: 18),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildInfoChip(
                  context,
                  icon: Icons.how_to_vote_rounded,
                  label:
                      '${voting.totalVotes} ${voting.totalVotes == 1 ? 'voto' : 'votos'}',
                ),
                _buildInfoChip(
                  context,
                  icon: Icons.rule_rounded,
                  label: voting.tieBreakRule == TieBreakRule.adminChoice
                      ? 'Desempate: proprietário'
                      : 'Desempate: sorteio',
                ),
                if (voting.isClosed && voting.winningOption != null)
                  _buildInfoChip(
                    context,
                    icon: Icons.emoji_events_rounded,
                    label: 'Vencedor: ${voting.winningOption!.bookTitle}',
                  ),
              ],
            ),

            const SizedBox(height: 20),

            Text(
              'Opções',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),

            ...voting.options.map((option) {
              final isSelected = voting.userVoteOptionId == option.id;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildVotingOption(context, option, voting, isSelected),
              );
            }),

            const SizedBox(height: 12),

            if (isOwner && voting.isDraft) ...[
              _buildDraftActions(context, voting),
            ] else if (isOwner && voting.isActive) ...[
              _buildActiveOwnerActions(context, voting),
            ] else if (isOwner && voting.isClosed) ...[
              _buildClosedOwnerActions(context, voting),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDraftActions(BuildContext context, BookVoting voting) {
    final theme = Theme.of(context);

    return _buildActionCard(
      context,
      title: 'Rascunho salvo',
      subtitle:
          'A votação ainda não está visível para os membros. Publique quando estiver pronta.',
      accentColor: theme.colorScheme.tertiary,
      child: SizedBox(
        width: double.infinity,
        child: FilledButton.icon(
          onPressed: () {
            context.read<CommunityVotingBloc>().add(
              CommunityVotingPublishRequested(
                communityId: communityId,
                votingId: voting.id,
              ),
            );
          },
          icon: const Icon(Icons.publish_rounded),
          label: const Text('Publicar votação'),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BookVoting voting, ThemeData theme) {
    String statusText;
    Color bgColor;

    switch (voting.status) {
      case VotingStatus.draft:
        statusText = 'Rascunho';
        bgColor = Colors.grey.shade300;
        break;
      case VotingStatus.active:
      case VotingStatus.published:
        statusText = 'Ativa';
        bgColor = theme.colorScheme.primary;
        break;
      case VotingStatus.closed:
        statusText = 'Encerrada';
        bgColor = Colors.orange.shade300;
        break;
      case VotingStatus.approved:
        statusText = 'Aprovada';
        bgColor = Colors.green.shade300;
        break;
      case VotingStatus.rejected:
        statusText = 'Rejeitada';
        bgColor = Colors.red.shade300;
        break;
    }

    return Chip(
      label: Text(statusText),
      labelStyle: theme.textTheme.labelSmall?.copyWith(
        fontWeight: FontWeight.w700,
        color: theme.colorScheme.onPrimary,
      ),
      backgroundColor: bgColor,
      side: BorderSide.none,
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  Widget _buildVotingOption(
    BuildContext context,
    BookVotingOption option,
    BookVoting voting,
    bool isSelected,
  ) {
    final theme = Theme.of(context);
    final progressValue = voting.totalVotes > 0
        ? option.voteCount / voting.totalVotes
        : 0.0;

    return Card(
      elevation: isSelected ? 4 : 1,
      shadowColor: isSelected
          ? theme.colorScheme.primary.withOpacity(0.24)
          : theme.colorScheme.shadow.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isSelected
              ? theme.colorScheme.primary
              : theme.colorScheme.outlineVariant,
          width: isSelected ? 2 : 1,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: voting.isActive
            ? () {
                context.read<CommunityVotingBloc>().add(
                  CommunityVotingCastVoteRequested(
                    communityId: communityId,
                    votingId: voting.id,
                    optionId: option.id,
                  ),
                );
              }
            : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected
                ? theme.colorScheme.primaryContainer.withOpacity(0.18)
                : theme.colorScheme.surface,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child:
                        option.bookCoverUrl != null &&
                            option.bookCoverUrl!.isNotEmpty
                        ? Image.network(
                            option.bookCoverUrl!,
                            width: 60,
                            height: 88,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildOptionCoverPlaceholder(theme);
                            },
                          )
                        : _buildOptionCoverPlaceholder(theme),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                option.bookTitle,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: isSelected
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.onSurface,
                                  height: 1.15,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (isSelected) ...[
                              const SizedBox(width: 8),
                              Icon(
                                Icons.check_circle_rounded,
                                color: theme.colorScheme.primary,
                                size: 22,
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Livro #${option.bookId}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 10),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: _buildInfoChip(
                            context,
                            icon: Icons.how_to_vote_outlined,
                            label:
                                '${option.voteCount} ${option.voteCount == 1 ? 'voto' : 'votos'}',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: progressValue,
                  minHeight: 10,
                  backgroundColor: theme.colorScheme.primary.withOpacity(0.12),
                  color: isSelected
                      ? theme.colorScheme.primary
                      : theme.colorScheme.secondary,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${(progressValue * 100).toStringAsFixed(1)}%',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (isSelected)
                    Text(
                      'Sua escolha',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w700,
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

  Widget _buildActiveOwnerActions(BuildContext context, BookVoting voting) {
    final theme = Theme.of(context);

    return _buildActionCard(
      context,
      title: 'Ações da votação ativa',
      subtitle:
          'Encerrar a votação quando a comunidade já tiver participado e for hora de consolidar o resultado.',
      accentColor: theme.colorScheme.primary,
      child: SizedBox(
        width: double.infinity,
        child: OutlinedButton.icon(
          onPressed: () {
            context.read<CommunityVotingBloc>().add(
              CommunityVotingCloseRequested(
                communityId: communityId,
                votingId: voting.id,
              ),
            );
          },
          icon: const Icon(Icons.lock_clock_rounded),
          label: const Text('Encerrar votação'),
        ),
      ),
    );
  }

  Widget _buildClosedOwnerActions(BuildContext context, BookVoting voting) {
    final theme = Theme.of(context);
    final hasTie = _hasTie(voting);
    final needsAdminChoice =
        hasTie && voting.tieBreakRule == TieBreakRule.adminChoice;

    return _buildActionCard(
      context,
      title: 'Resultado pendente',
      subtitle: needsAdminChoice
          ? 'Há um empate. Escolha a opção vencedora antes de aprovar.'
          : 'A votação foi encerrada. Agora você pode aprovar o resultado ou rejeitá-lo.',
      accentColor: theme.colorScheme.tertiary,
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {
                context.read<CommunityVotingBloc>().add(
                  CommunityVotingRejectRequested(
                    communityId: communityId,
                    votingId: voting.id,
                    reason: 'Resultado rejeitado pelo proprietário',
                  ),
                );
              },
              icon: const Icon(Icons.cancel_rounded),
              label: const Text('Rejeitar'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: FilledButton.icon(
              onPressed: () {
                if (needsAdminChoice) {
                  _showChooseWinnerDialog(context, voting);
                } else {
                  context.read<CommunityVotingBloc>().add(
                    CommunityVotingApproveRequested(
                      communityId: communityId,
                      votingId: voting.id,
                    ),
                  );
                }
              },
              icon: const Icon(Icons.emoji_events_rounded),
              label: const Text('Aprovar'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPastVotingsContent(
    BuildContext context,
    List<BookVoting> votings,
    bool isOwner,
  ) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Votações Passadas',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        ...votings.map((voting) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            voting.title,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildStatusBadge(voting, theme),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      voting.winningOption != null
                          ? 'Vencedor: ${voting.winningOption!.bookTitle}'
                          : 'Sem vencedor definido',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (isOwner && voting.isDraft) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: () {
                            context.read<CommunityVotingBloc>().add(
                              CommunityVotingPublishRequested(
                                communityId: communityId,
                                votingId: voting.id,
                              ),
                            );
                          },
                          icon: const Icon(Icons.publish_rounded),
                          label: const Text('Publicar'),
                        ),
                      ),
                    ] else if (isOwner && voting.isClosed) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                context.read<CommunityVotingBloc>().add(
                                  CommunityVotingRejectRequested(
                                    communityId: communityId,
                                    votingId: voting.id,
                                    reason: 'Votação encerrada sem aprovação',
                                  ),
                                );
                              },
                              icon: const Icon(Icons.cancel_rounded),
                              label: const Text('Rejeitar'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton.icon(
                              onPressed: () {
                                final hasTie = _hasTie(voting);
                                final needsAdminChoice =
                                    hasTie &&
                                    voting.tieBreakRule ==
                                        TieBreakRule.adminChoice;

                                if (needsAdminChoice) {
                                  _showChooseWinnerDialog(context, voting);
                                } else {
                                  context.read<CommunityVotingBloc>().add(
                                    CommunityVotingApproveRequested(
                                      communityId: communityId,
                                      votingId: voting.id,
                                    ),
                                  );
                                }
                              },
                              icon: const Icon(Icons.check_circle_rounded),
                              label: Text(
                                _hasTie(voting) &&
                                        voting.tieBreakRule ==
                                            TieBreakRule.adminChoice
                                    ? 'Escolher vencedor'
                                    : 'Aprovar',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildOptionCoverPlaceholder(ThemeData theme) {
    return Container(
      width: 48,
      height: 72,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(
        Icons.book_rounded,
        color: theme.colorScheme.onSurfaceVariant,
      ),
    );
  }

  Widget _buildInfoChip(
    BuildContext context, {
    required IconData icon,
    required String label,
  }) {
    final theme = Theme.of(context);

    return Chip(
      avatar: Icon(
        icon,
        size: 16,
        color: theme.colorScheme.onSecondaryContainer,
      ),
      label: Text(label),
      labelStyle: theme.textTheme.labelMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: theme.colorScheme.onSecondaryContainer,
      ),
      backgroundColor: theme.colorScheme.secondaryContainer.withOpacity(0.65),
      side: BorderSide.none,
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required Color accentColor,
    required Widget child,
  }) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(top: 12),
      elevation: 0,
      color: theme.colorScheme.surfaceVariant.withOpacity(0.35),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: accentColor.withOpacity(0.18)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 10,
                  height: 10,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: BoxDecoration(
                    color: accentColor,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: theme.colorScheme.primaryContainer.withOpacity(0.45),
              ),
              child: Icon(
                Icons.how_to_vote_rounded,
                size: 42,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              isOwner
                  ? 'Nenhuma votação foi criada ainda'
                  : 'Nenhuma votação disponível',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              isOwner
                  ? 'Crie um rascunho e publique quando quiser abrir a votação para os membros.'
                  : 'Quando a comunidade publicar uma votação, ela vai aparecer aqui para você participar.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.35,
              ),
            ),
            if (isOwner) ...[
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () => CreateVotingSheet.show(context, communityId),
                  icon: const Icon(Icons.add_chart_rounded),
                  label: const Text('Criar votação'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    final theme = Theme.of(context);

    return Card(
      elevation: 1,
      color: theme.colorScheme.errorContainer.withOpacity(0.35),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              Icons.cloud_off_rounded,
              size: 52,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Não foi possível carregar as votações',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () {
                  context.read<CommunityVotingBloc>().add(
                    CommunityVotingLoadRequested(communityId),
                  );
                },
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Tentar novamente'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _hasTie(BookVoting voting) {
    if (voting.options.isEmpty) {
      return false;
    }

    final maxVotes = voting.options.fold<int>(
      0,
      (max, opt) => opt.voteCount > max ? opt.voteCount : max,
    );
    final optionsWithMaxVotes = voting.options
        .where((opt) => opt.voteCount == maxVotes)
        .length;

    return optionsWithMaxVotes > 1;
  }

  void _showChooseWinnerDialog(BuildContext context, BookVoting voting) {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      isDismissible: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 32,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Há um empate',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Como a regra de desempate é "decisão do proprietário", você deve escolher qual livro será o vencedor:',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),
                ...voting.options.map((option) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () {
                          Navigator.pop(sheetContext);
                          context.read<CommunityVotingBloc>().add(
                            CommunityVotingApproveRequested(
                              communityId: communityId,
                              votingId: voting.id,
                              winnerOptionId: option.id,
                            ),
                          );
                        },
                        icon: const Icon(Icons.emoji_events_rounded),
                        label: Text(option.bookTitle),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(sheetContext),
                    child: const Text('Cancelar'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
