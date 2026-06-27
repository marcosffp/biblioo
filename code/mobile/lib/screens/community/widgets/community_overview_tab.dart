import 'package:flutter/material.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';

import 'community_detail_shared.dart';
import 'community_members_card.dart';

class CommunityOverviewTab extends StatelessWidget {
  final Community community;
  final Book? book;
  final List<CommunityMember> members;
  final bool joinRequestPending;
  final int? currentUserId;
  final Future<void> Function() onJoinOrLeave;
  final Future<void> Function()? onRefresh;
  final Future<void> Function()? onShare;
  final Future<void> Function()? onDeleteCommunity;
  final Future<void> Function(CommunityMember member)? onRemoveMember;
  final Future<void> Function(CommunityMember member, String newRole)?
  onChangeMemberRole;
  final String? accessNoticeTitle;
  final String? accessNoticeDescription;

  const CommunityOverviewTab({
    super.key,
    required this.community,
    required this.book,
    required this.members,
    required this.joinRequestPending,
    this.currentUserId,
    required this.onJoinOrLeave,
    this.onRefresh,
    this.onShare,
    this.onDeleteCommunity,
    this.onRemoveMember,
    this.onChangeMemberRole,
    this.accessNoticeTitle,
    this.accessNoticeDescription,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bookTitle = book?.title ?? community.bookTitle;
    final bookAuthor = book?.authorsText ?? community.bookAuthor;
    final coverUrl = book?.coverUrl ?? community.bookCoverUrl;

    final list = ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      children: [
        // Card principal da comunidade
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primaryContainer,
                theme.colorScheme.secondaryContainer,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
          ),
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Título e descrição no topo esquerdo
              Text(
                community.name,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                (community.description?.trim().isNotEmpty ?? false)
                    ? community.description!.trim()
                    : 'Sem descrição disponível.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 12),
              // Badges
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  CommunityDetailPill(
                    label: community.isPublic ? 'Pública' : 'Privada',
                    icon: community.isPublic
                        ? Icons.language_rounded
                        : Icons.lock_rounded,
                  ),
                  CommunityDetailPill(
                    label: '${community.memberCount} membros',
                    icon: Icons.group_rounded,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Botões numa linha separada, ocupam largura total
              Row(
                children: [
                  if (community.isMember) ...[
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onJoinOrLeave,
                        icon: const Icon(Icons.logout_rounded, size: 16),
                        label: const Text('Sair'),
                        style: OutlinedButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    flex: 2,
                    child: FilledButton.icon(
                      onPressed: community.isMember ? onShare : null,
                      icon: const Icon(Icons.share_rounded, size: 16),
                      label: const Text('Compartilhar'),
                      style: FilledButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Card do livro
        Card(
          elevation: 1,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Livro da comunidade',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CommunityDetailBookCover(coverUrl: coverUrl, small: true),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            bookTitle,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            bookAuthor.isEmpty
                                ? 'Autores indisponíveis'
                                : bookAuthor,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            book?.description ??
                                'Descrição do livro indisponível.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Aviso de acesso restrito
        if (accessNoticeTitle != null && accessNoticeDescription != null) ...[
          Card(
            elevation: 0,
            color: theme.colorScheme.secondaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.lock_outline_rounded,
                    color: theme.colorScheme.onSecondaryContainer,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          accessNoticeTitle!,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSecondaryContainer,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          accessNoticeDescription!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSecondaryContainer,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],

        // Botão entrar (apenas para não membros)
        if (!community.isMember)
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: joinRequestPending && !community.isPublic
                  ? null
                  : onJoinOrLeave,
              icon: Icon(
                joinRequestPending && !community.isPublic
                    ? Icons.hourglass_bottom_rounded
                    : community.isPublic
                    ? Icons.login_rounded
                    : Icons.lock_person_rounded,
              ),
              label: Text(
                joinRequestPending && !community.isPublic
                    ? 'Solicitação enviada'
                    : community.isPublic
                    ? 'Entrar'
                    : 'Pedir para entrar',
              ),
            ),
          ),

        if (!community.isMember) const SizedBox(height: 16),

        CommunityMembersCard(
          members: members,
          currentUserId: currentUserId,
          communityOwnerId: community.ownerId,
          onRemoveMember: onRemoveMember,
          onChangeMemberRole: onChangeMemberRole,
        ),
        const SizedBox(height: 16),

        if (currentUserId != null &&
            currentUserId == community.ownerId &&
            onDeleteCommunity != null) ...[
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: onDeleteCommunity,
              style: OutlinedButton.styleFrom(
                foregroundColor: theme.colorScheme.error,
                side: BorderSide(color: theme.colorScheme.error),
              ),
              child: const Text('Excluir comunidade'),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ],
    );

    if (onRefresh != null) {
      return CooldownRefreshIndicator(
        keyId: 'community_overview_${community.id}',
        onRefresh: onRefresh!,
        child: list,
      );
    }

    return list;
  }
}
