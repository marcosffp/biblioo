import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:flutter/material.dart';

class CommunityMembersCard extends StatelessWidget {
  final List<CommunityMember> members;

  const CommunityMembersCard({super.key, required this.members});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Membros',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            if (members.isEmpty)
              Text(
                'Nenhum membro encontrado no cache/local.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            else
              ...members.map(
                (member) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundImage:
                        member.avatarUrl != null && member.avatarUrl!.isNotEmpty
                        ? NetworkImage(member.avatarUrl!)
                        : null,
                    child: member.avatarUrl == null || member.avatarUrl!.isEmpty
                        ? Text('${member.userId}')
                        : null,
                  ),
                  title: Text(member.username ?? 'Usuario #${member.userId}'),
                  subtitle: Text(member.role),
                  dense: true,
                  visualDensity: VisualDensity.compact,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
