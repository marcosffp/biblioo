import 'package:flutter/material.dart';

class ProfileDnaEntry {
  final String label;
  final double value;

  const ProfileDnaEntry({required this.label, required this.value});
}

class ProfileDnaSection extends StatelessWidget {
  final List<ProfileDnaEntry> entries;
  final int? remainingToUnlock;
  final String? profileLabel;
  final String? readingLevel;
  final String? progressMessage;
  final VoidCallback onSeeMore;

  const ProfileDnaSection({
    super.key,
    required this.entries,
    this.remainingToUnlock,
    this.profileLabel,
    this.readingLevel,
    this.progressMessage,
    required this.onSeeMore,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final resolvedLabel = profileLabel ?? '';
    final resolvedReadingLevel = readingLevel ?? '';
    final hasProfileInfo =
        resolvedLabel.isNotEmpty || resolvedReadingLevel.isNotEmpty;
    String percentFormat(double value) {
      final clamped = value.clamp(0, 100);
      return '${clamped.toStringAsFixed(0)}%';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
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
        if (entries.isEmpty && !hasProfileInfo)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: theme.colorScheme.outlineVariant),
            ),
            child: Text(
              progressMessage ??
                  (remainingToUnlock == null
                      ? 'DNA em formacao. Leia mais livros para liberar seu perfil literario.'
                      : 'DNA em formacao. Leia mais $remainingToUnlock livro(s) para liberar.'),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          )
        else ...[
          // substitua o bloco Align por:
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Perfil literario',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                resolvedLabel.isEmpty ? 'Perfil literario' : resolvedLabel,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (resolvedReadingLevel.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  resolvedReadingLevel,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
          if (entries.isEmpty)
            Text(
              'Ainda nao ha temas suficientes para mostrar.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            )
          else
            ...entries.map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(entry.label, style: theme.textTheme.bodyMedium),
                        Text(
                          percentFormat(entry.value),
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: (entry.value / 100).clamp(0, 1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ],
    );
  }
}
