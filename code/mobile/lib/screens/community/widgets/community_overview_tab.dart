import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:flutter/material.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';

import 'community_detail_shared.dart';
import 'community_members_card.dart';

class CommunityOverviewTab extends StatelessWidget {
  final Community community;
  final Book? book;
  final List<CommunityMember> members;
  final bool joinRequestPending;
  final Future<void> Function() onJoinOrLeave;
  final Future<void> Function()? onRefresh;

  const CommunityOverviewTab({
    super.key,
    required this.community,
    required this.book,
    required this.members,
    required this.joinRequestPending,
    required this.onJoinOrLeave,
    this.onRefresh,
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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CommunityDetailBookCover(coverUrl: coverUrl),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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
                    const SizedBox(height: 14),
                    Text(
                      community.name,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      community.description ?? 'Sem descrição disponível.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
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
                                'Descrição do livro indisponível. Pode ser que o livro tenha sido removido ou que a comunidade esteja desatualizada.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
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
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: community.isMember || !community.isPublic
                ? (joinRequestPending && !community.isMember
                      ? null
                      : onJoinOrLeave)
                : onJoinOrLeave,
            icon: Icon(
              community.isMember
                  ? Icons.logout_rounded
                  : joinRequestPending && !community.isPublic
                  ? Icons.hourglass_bottom_rounded
                  : community.isPublic
                  ? Icons.login_rounded
                  : Icons.lock_person_rounded,
            ),
            label: Text(
              community.isMember
                  ? 'Sair'
                  : joinRequestPending && !community.isPublic
                  ? 'Solicitação enviada'
                  : community.isPublic
                  ? 'Entrar'
                  : 'Pedir para entrar',
            ),
          ),
        ),
        const SizedBox(height: 16),
        CommunityMembersCard(members: members),
        const SizedBox(height: 16),
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
