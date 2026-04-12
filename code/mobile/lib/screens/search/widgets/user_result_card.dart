import 'package:biblioo/features/user/data/models/follow_page_model.dart';
import 'package:flutter/material.dart';

class UserResultCard extends StatelessWidget {
  final UserSummaryModel user;
  final VoidCallback? onTap;

  const UserResultCard({super.key, required this.user, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: theme.colorScheme.primaryContainer,
          backgroundImage: user.avatarUrl != null && user.avatarUrl!.isNotEmpty
              ? NetworkImage(user.avatarUrl!)
              : null,
          child: (user.avatarUrl == null || user.avatarUrl!.isEmpty)
              ? Text(
                  user.username
                      .substring(0, user.username.length.clamp(0, 2).toInt())
                      .toUpperCase(),
                )
              : null,
        ),
        title: Text(user.username),
        //subtitle: Text(user.isPrivate ? 'Perfil privado' : 'Perfil publico'),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}
