import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';

class ProfileHeader extends StatelessWidget {
  final User user;
  final bool isOwner;
  final VoidCallback onPrimaryAction;
  final VoidCallback onShare;

  const ProfileHeader({
    super.key,
    required this.user,
    required this.isOwner,
    required this.onPrimaryAction,
    required this.onShare,
  });

  String _initials(String username) {
    final parts = username.split('_');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return username
        .substring(0, username.length.clamp(0, 2).toInt())
        .toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryLabel = isOwner
        ? 'Editar'
        : user.isFollowing
        ? 'Seguindo'
        : user.isFollowRequested
        ? 'Solicitado'
        : (user.isPrivate ? 'Pedir para seguir' : 'Seguir');
    final primaryIcon = isOwner
        ? Icons.edit_outlined
        : user.isFollowing
        ? Icons.check
        : user.isFollowRequested
        ? Icons.hourglass_top_rounded
        : Icons.person_add_alt_1_outlined;

    return SizedBox(
      height: 188,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            bottom: 44,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: user.bannerUrl != null
                  ? Image.network(user.bannerUrl!, fit: BoxFit.cover)
                  : Container(color: theme.colorScheme.primaryContainer),
            ),
          ),
          Positioned(
            left: 16,
            bottom: 0,
            child: CircleAvatar(
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
          ),
          Positioned(
            left: 104,
            right: 0,
            bottom: 8,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final compact = constraints.maxWidth < 220;
                final actions = <Widget>[
                  compact
                      ? Tooltip(
                          message: primaryLabel,
                          child: OutlinedButton(
                            onPressed: onPrimaryAction,
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(36, 36),
                              padding: EdgeInsets.zero,
                              visualDensity: VisualDensity.compact,
                            ),
                            child: Icon(primaryIcon, size: 18),
                          ),
                        )
                      : isOwner
                      ? OutlinedButton(
                          onPressed: onPrimaryAction,
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 36),
                            visualDensity: VisualDensity.compact,
                          ),
                          child: Text(primaryLabel),
                        )
                      : FilledButton(
                          onPressed: onPrimaryAction,
                          style: FilledButton.styleFrom(
                            minimumSize: const Size(0, 36),
                            visualDensity: VisualDensity.compact,
                          ),
                          child: Text(primaryLabel),
                        ),
                ];

                if (isOwner) {
                  actions.add(
                    compact
                        ? Tooltip(
                            message: 'Compartilhar capsula',
                            child: FilledButton(
                              onPressed: onShare,
                              style: FilledButton.styleFrom(
                                minimumSize: const Size(36, 36),
                                padding: EdgeInsets.zero,
                                visualDensity: VisualDensity.compact,
                              ),
                              child: const Icon(Icons.share_outlined, size: 18),
                            ),
                          )
                        : FilledButton(
                            onPressed: onShare,
                            style: FilledButton.styleFrom(
                              minimumSize: const Size(0, 36),
                              visualDensity: VisualDensity.compact,
                            ),
                            child: const Text('Capsula de leitura'),
                          ),
                  );
                }

                return OverflowBar(
                  alignment: MainAxisAlignment.end,
                  spacing: 8,
                  overflowAlignment: OverflowBarAlignment.end,
                  overflowSpacing: 8,
                  children: actions,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
