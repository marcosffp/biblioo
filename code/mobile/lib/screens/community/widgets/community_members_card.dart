import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:flutter/material.dart';

class CommunityMembersCard extends StatelessWidget {
  final List<CommunityMember> members;
  final int? currentUserId;
  final int? communityOwnerId;
  final Future<void> Function(CommunityMember member)? onRemoveMember;
  final Future<void> Function(CommunityMember member, String newRole)?
  onChangeMemberRole;

  const CommunityMembersCard({
    super.key,
    required this.members,
    this.currentUserId,
    this.communityOwnerId,
    this.onRemoveMember,
    this.onChangeMemberRole,
  });

  bool get _isOwner => currentUserId != null && currentUserId == communityOwnerId;

  String _roleLabel(String role) {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'Dono';
      case 'ADMIN':
      case 'MODERATOR':
        return 'Admin';
      default:
        return '';
    }
  }

  String _initials(String? username, int userId) {
    final name = username?.trim() ?? '';
    if (name.isEmpty) return '#';
    final parts = name.split(RegExp(r'[\s_\-]+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name[0].toUpperCase();
  }

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
                'Nenhum membro encontrado.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            else
              ...members.map((member) {
                final isOwnerMember =
                    member.userId == communityOwnerId;
                final isSelf = member.userId == currentUserId;
                final roleLabel = _roleLabel(member.role);
                final canManage = _isOwner && !isOwnerMember;

                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundImage: member.avatarUrl != null &&
                        member.avatarUrl!.isNotEmpty
                        ? NetworkImage(member.avatarUrl!)
                        : null,
                    child: member.avatarUrl == null ||
                        member.avatarUrl!.isEmpty
                        ? Text(_initials(member.username, member.userId))
                        : null,
                  ),
                  title: Text(
                    member.username ?? 'Usuario #${member.userId}',
                  ),
                  subtitle: roleLabel.isNotEmpty
                      ? Text(
                    roleLabel,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isOwnerMember
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurfaceVariant,
                      fontWeight: isOwnerMember
                          ? FontWeight.w700
                          : FontWeight.normal,
                    ),
                  )
                      : null,
                  trailing: canManage && !isSelf
                      ? _MemberActions(
                    member: member,
                    onRemove: onRemoveMember,
                    onChangeRole: onChangeMemberRole,
                  )
                      : null,
                );
              }),
          ],
        ),
      ),
    );
  }
}

class _MemberActions extends StatelessWidget {
  final CommunityMember member;
  final Future<void> Function(CommunityMember)? onRemove;
  final Future<void> Function(CommunityMember, String)? onChangeRole;

  const _MemberActions({
    required this.member,
    required this.onRemove,
    required this.onChangeRole,
  });

  bool get _isAdmin {
    final r = member.role.toUpperCase();
    return r == 'ADMIN' || r == 'MODERATOR';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (onChangeRole != null)
          TextButton(
            onPressed: () => onChangeRole!(
              member,
              _isAdmin ? 'MEMBER' : 'MODERATOR',
            ),
            style: TextButton.styleFrom(
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 8),
            ),
            child: Text(
              _isAdmin ? 'Remover admin' : 'Tornar admin',
              style: const TextStyle(fontSize: 12),
            ),
          ),
        if (onRemove != null)
          IconButton(
            onPressed: () => onRemove!(member),
            icon: const Icon(Icons.delete_outline_rounded, size: 20),
            color: Theme.of(context).colorScheme.error,
            visualDensity: VisualDensity.compact,
            tooltip: 'Remover membro',
          ),
      ],
    );
  }
}
