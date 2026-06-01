import 'package:flutter/material.dart';

String communityRelativeTimeLabel(DateTime value, {DateTime? now}) {
  final reference = now ?? DateTime.now();
  final delta = reference.difference(value);

  if (delta.inSeconds < 60) return 'agora';
  if (delta.inMinutes < 60) return '${delta.inMinutes}m';
  if (delta.inHours < 24) return '${delta.inHours}h';
  return '${delta.inDays}d';
}

String communityInitials(String? value) {
  final text = (value ?? '').trim();
  if (text.isEmpty) return '?';
  final parts = text.split(RegExp(r'\s+')).where((part) => part.isNotEmpty);
  final initials = parts.take(2).map((part) => part[0]).join();
  return initials.isEmpty ? text[0].toUpperCase() : initials.toUpperCase();
}

class CommunityDetailBookCover extends StatelessWidget {
  final String? coverUrl;
  final bool small;

  const CommunityDetailBookCover({
    super.key,
    required this.coverUrl,
    this.small = false,
  });

  @override
  Widget build(BuildContext context) {
    final size = small ? 64.0 : 88.0;
    final radius = small ? 12.0 : 20.0;

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: Container(
        width: size,
        height: small ? 96 : 128,
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: coverUrl != null && coverUrl!.isNotEmpty
            ? Image.network(
                coverUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => const CommunityDetailCoverFallback(),
              )
            : const CommunityDetailCoverFallback(),
      ),
    );
  }
}

class CommunityDetailCoverFallback extends StatelessWidget {
  const CommunityDetailCoverFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: Icon(
        Icons.menu_book_rounded,
        size: 34,
        color: Theme.of(context).colorScheme.onSurfaceVariant,
      ),
    );
  }
}

class CommunityDetailPill extends StatelessWidget {
  final String label;
  final IconData icon;

  const CommunityDetailPill({
    super.key,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(label),
      visualDensity: VisualDensity.compact,
    );
  }
}

class CommunityDetailMiniStat extends StatelessWidget {
  final String label;
  final IconData icon;

  const CommunityDetailMiniStat({
    super.key,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(label),
      labelStyle: theme.textTheme.labelMedium,
      visualDensity: VisualDensity.compact,
    );
  }
}

class CommunityDetailEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const CommunityDetailEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 56, color: color),
          const SizedBox(height: 12),
          Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class CommunityDetailErrorState extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;

  const CommunityDetailErrorState({
    super.key,
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.wifi_off_rounded,
              size: 48,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: onRetry,
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }
}
