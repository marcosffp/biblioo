import 'package:biblioo/features/collection/domain/collection_statistics.dart';
import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:biblioo/shared/widgets/stat_item.dart';
import 'package:flutter/material.dart';

class CollectionStatisticsSection extends StatelessWidget {
  final CollectionStatistics statistics;

  const CollectionStatisticsSection({super.key, required this.statistics});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(
                Icons.bar_chart_rounded,
                size: 18,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(width: 6),
              Text(
                'Estatísticas',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _SummaryCard(statistics: statistics),
          if (statistics.totalBooks > 0) ...[
            const SizedBox(height: 12),
            _StatusBreakdownCard(statistics: statistics),
          ],
          if (statistics.totalPages > 0) ...[
            const SizedBox(height: 12),
            _PagesProgressCard(statistics: statistics),
          ],
        ],
      ),
    );
  }
}

// ── Sumário numérico ──────────────────────────────────────────────────────────

class _SummaryCard extends StatelessWidget {
  final CollectionStatistics statistics;
  const _SummaryCard({required this.statistics});

  @override
  Widget build(BuildContext context) {
    final s = statistics;
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Wrap(
          alignment: WrapAlignment.spaceAround,
          spacing: 20,
          runSpacing: 12,
          children: [
            StatItem(value: '${s.totalBooks}', label: 'Livros'),
            StatItem(value: '${s.booksCompleted}', label: 'Concluídos'),
            StatItem(value: '${s.booksActiveReading}', label: 'Lendo'),
            StatItem(value: _formatPages(s.pagesRead), label: 'Pág. lidas'),
          ],
        ),
      ),
    );
  }

  String _formatPages(int pages) {
    if (pages >= 1000) return '${(pages / 1000).toStringAsFixed(1)}k';
    return '$pages';
  }
}

// ── Breakdown por status ──────────────────────────────────────────────────────

class _StatusBreakdownCard extends StatelessWidget {
  final CollectionStatistics statistics;
  const _StatusBreakdownCard({required this.statistics});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final s = statistics;
    final total = s.totalBooks;

    final statusRows = [
      (
        status: ReadingStatus.completed,
        count: s.booksCompleted,
        color: theme.colorScheme.primary,
      ),
      (
        status: ReadingStatus.reading,
        count: s.booksReading,
        color: theme.colorScheme.secondary,
      ),
      (
        status: ReadingStatus.rereading,
        count: s.booksRereading,
        color: theme.colorScheme.tertiary,
      ),
      (
        status: ReadingStatus.wantToRead,
        count: s.booksWantToRead,
        color: theme.colorScheme.outline,
      ),
      (
        status: ReadingStatus.abandoned,
        count: s.booksAbandoned,
        color: theme.colorScheme.error,
      ),
    ].where((r) => r.count > 0).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Status dos livros',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            ...statusRows.map(
              (r) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(r.status.label, style: theme.textTheme.bodyMedium),
                        Text(
                          '${r.count} (${(r.count / total * 100).toStringAsFixed(0)}%)',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: r.count / total,
                      color: r.color,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Progresso de páginas ──────────────────────────────────────────────────────

class _PagesProgressCard extends StatelessWidget {
  final CollectionStatistics statistics;
  const _PagesProgressCard({required this.statistics});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final s = statistics;
    final percent = (s.pagesProgress * 100).toStringAsFixed(1);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progresso de páginas',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '$percent%',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: s.pagesProgress,
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 6),
            Text(
              '${s.pagesRead} de ${s.totalPages} páginas',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
