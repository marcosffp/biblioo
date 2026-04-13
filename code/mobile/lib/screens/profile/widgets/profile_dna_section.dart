import 'package:flutter/material.dart';

class ProfileDnaSection extends StatelessWidget {
  final VoidCallback onSeeMore;

  const ProfileDnaSection({super.key, required this.onSeeMore});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
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
                      'DNA Literario',
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            TextButton(onPressed: onSeeMore, child: const Text('Ver mais')),
          ],
        ),
        const SizedBox(height: 8),
        ...[
          ('Ficcao Cientifica', 0.35),
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
      ],
    );
  }
}
