import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';

class ProfileDetailsSection extends StatelessWidget {
  final User user;
  final bool isOwner;

  const ProfileDetailsSection({
    super.key,
    required this.user,
    required this.isOwner,
  });

  String _formatCreatedAt(String value) {
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(parsed.day)}/${two(parsed.month)}/${parsed.year}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
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
              user.isPrivate ? Icons.lock_outline : Icons.public,
              size: 14,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            Text(
              user.isPrivate ? ' Perfil Privado' : ' Perfil Publico',
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
        if (user.email != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                Icons.mail_outline,
                size: 14,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  user.email!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ],
        if (user.createdAt != null) ...[
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                Icons.calendar_today_outlined,
                size: 14,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 6),
              Text(
                'Desde ${_formatCreatedAt(user.createdAt!)}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
