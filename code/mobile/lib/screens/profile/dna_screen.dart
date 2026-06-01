import 'dart:math' as math;

import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/features/dna/domain/dna_snapshot.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class DnaScreen extends StatefulWidget {
  const DnaScreen({super.key});

  @override
  State<DnaScreen> createState() => _DnaScreenState();
}

class _DnaScreenState extends State<DnaScreen> {
  final _dnaRepo = Injector.instance.dnaRepo;

  DnaSnapshot? _snapshot;
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadDna());
  }

  Future<void> _loadDna({bool refresh = false}) async {
    final userId = _currentUserId();
    if (userId == null) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _errorMessage = 'Faca login para ver seu DNA literario.';
      });
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final snapshot = await _dnaRepo.getDna(
        userId: userId,
        refreshRemote: refresh,
      );
      if (!mounted) return;
      setState(() {
        _snapshot = snapshot;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _errorMessage = 'Nao foi possivel carregar o DNA literario.';
      });
    }
  }

  int? _currentUserId() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      return authState.session.user.id;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final isAuthed = authState is AuthAuthenticated;

    return Scaffold(
      appBar: AppBar(title: const Text('DNA Literario')),
      body: !isAuthed
          ? const Center(child: Text('Faca login para ver seu DNA literario.'))
          : _loading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
          ? _ErrorState(message: _errorMessage!, onRetry: _loadDna)
          : RefreshIndicator(
              onRefresh: () => _loadDna(refresh: true),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: _snapshot == null
                    ? const SizedBox.shrink()
                    : _DnaContent(snapshot: _snapshot!),
              ),
            ),
    );
  }
}

class _DnaContent extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _DnaContent({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final sections = <Widget>[
      _SummaryCard(snapshot: snapshot),
      const SizedBox(height: 16),
    ];

    if (!snapshot.isComputed) {
      sections.addAll([
        _ProgressCard(snapshot: snapshot),
        const SizedBox(height: 16),
      ]);
    } else {
      sections.addAll([
        _ThemesSection(snapshot: snapshot),
        const SizedBox(height: 16),
        _ReadingSplitSection(snapshot: snapshot),
        const SizedBox(height: 16),
        _BottomCardsSection(snapshot: snapshot),
      ]);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: sections,
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _SummaryCard({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final archetype = snapshot.dominantArchetypeLabel ?? 'Perfil literario';
    final complexity = snapshot.complexityLabel ?? '';
    final updatedAt = snapshot.calculatedAt == null
        ? null
        : _formatDate(snapshot.calculatedAt!);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
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
              archetype,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            if (complexity.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                complexity,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                _MetricPill(
                  label: 'Livros lidos',
                  value: snapshot.booksRead.toString(),
                ),
                const SizedBox(width: 8),
                if (snapshot.totalPagesRead != null)
                  _MetricPill(
                    label: 'Paginas lidas',
                    value: _formatNumber(snapshot.totalPagesRead!),
                  ),
              ],
            ),
            if (updatedAt != null) ...[
              const SizedBox(height: 8),
              Text(
                'Atualizado em $updatedAt',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _ProgressCard({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final required = snapshot.booksRequired <= 0 ? 1 : snapshot.booksRequired;
    final progress = (snapshot.booksRead / required).clamp(0.0, 1.0).toDouble();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'DNA em formacao',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              snapshot.message ??
                  'Leia mais livros para desbloquear seu DNA literario.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: progress,
              borderRadius: BorderRadius.circular(6),
              minHeight: 8,
            ),
            const SizedBox(height: 8),
            Text(
              '${snapshot.booksRead}/$required livros',
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

class _ThemesSection extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _ThemesSection({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themes = snapshot.themes;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tipos de leitura',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            if (themes.isEmpty)
              Text(
                'Sem temas suficientes para mostrar.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            else
              ...themes.map(
                (entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              entry.theme,
                              style: theme.textTheme.bodyMedium,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            _formatPercent(entry.percentage),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: (entry.percentage / 100).clamp(0, 1),
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

class _ReadingSplitSection extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _ReadingSplitSection({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final completed = snapshot.booksRead;
    final abandoned = snapshot.abandonedCount ?? 0;
    final rereads = snapshot.rereadCount ?? 0;
    final total = completed + abandoned + rereads;

    final slices = [
      _DonutSlice(
        value: completed.toDouble(),
        label: 'Concluidos',
        color: theme.colorScheme.primary,
      ),
      _DonutSlice(
        value: rereads.toDouble(),
        label: 'Releituras',
        color: theme.colorScheme.secondary,
      ),
      _DonutSlice(
        value: abandoned.toDouble(),
        label: 'Abandonos',
        color: theme.colorScheme.error,
      ),
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Estatísticas de leitura',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            if (total == 0)
              Text(
                'Sem dados suficientes para exibir grafico.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            else
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  _DonutChart(
                    slices: slices,
                    size: 120,
                    strokeWidth: 16,
                    backgroundColor: theme.colorScheme.surfaceContainerHighest,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: slices
                          .map(
                            (slice) => _LegendItem(
                              label: slice.label,
                              color: slice.color,
                              value: _formatNumber(slice.value.toInt()),
                              percent: total == 0
                                  ? '0%'
                                  : _formatPercent((slice.value / total) * 100),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _BottomCardsSection extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _BottomCardsSection({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 600;
        final statsCard = _StatsSection(snapshot: snapshot);
        final archetypeCard = _ArchetypeSection(snapshot: snapshot);
        final pagesCard = _PagesByYearSection(snapshot: snapshot);
        final abandonCard = snapshot.mostAbandonedGenre == null
            ? null
            : _InfoCard(
                title: 'Genero mais abandonado',
                value: snapshot.mostAbandonedGenre!,
              );

        if (!isWide) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              statsCard,
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Mais detalhes'),
              const SizedBox(height: 12),
              archetypeCard,
              const SizedBox(height: 16),
              pagesCard,
              if (abandonCard != null) ...[
                const SizedBox(height: 16),
                abandonCard,
              ],
            ],
          );
        }

        return Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: statsCard),
                const SizedBox(width: 16),
                Expanded(child: archetypeCard),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: pagesCard),
                if (abandonCard != null) ...[
                  const SizedBox(width: 16),
                  Expanded(child: abandonCard),
                ],
              ],
            ),
          ],
        );
      },
    );
  }
}

class _StatsSection extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _StatsSection({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final stats = [
      _StatItem(
        label: 'Releituras',
        value: _formatNumber(snapshot.rereadCount ?? 0),
      ),
      _StatItem(
        label: 'Taxa de releitura',
        value: _formatRatio(snapshot.rereadRate),
      ),
      _StatItem(
        label: 'Abandonos',
        value: _formatNumber(snapshot.abandonedCount ?? 0),
      ),
      _StatItem(
        label: 'Dias por livro',
        value: _formatDecimal(snapshot.avgDaysPerBook),
      ),
      if (snapshot.avgTimePerBookDays != null)
        _StatItem(
          label: 'Tempo medio',
          value: _formatDecimal(snapshot.avgTimePerBookDays),
        ),
    ];

    return _StatsGrid(title: 'Resumo', items: stats);
  }
}

class _ArchetypeSection extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _ArchetypeSection({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final archetypes = snapshot.secondaryArchetypes
        .map(_formatArchetype)
        .where((value) => value.isNotEmpty)
        .toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Arquetipos secundarios',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            if (archetypes.isEmpty)
              Text(
                'Sem dados suficientes.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: archetypes
                    .map(
                      (item) => Chip(
                        label: Text(item),
                        backgroundColor:
                            theme.colorScheme.surfaceContainerHighest,
                      ),
                    )
                    .toList(),
              ),
          ],
        ),
      ),
    );
  }
}

class _PagesByYearSection extends StatelessWidget {
  final DnaSnapshot snapshot;

  const _PagesByYearSection({required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final entries = snapshot.pagesByYear.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    final maxValue = entries.isEmpty
        ? 0
        : entries.map((e) => e.value).reduce((a, b) => a > b ? a : b);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Paginas lidas por ano',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            if (entries.isEmpty)
              Text(
                'Sem dados suficientes.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              )
            else
              ...entries.map(
                (entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            entry.key.toString(),
                            style: theme.textTheme.bodyMedium,
                          ),
                          Text(
                            _formatNumber(entry.value),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: maxValue == 0
                            ? 0
                            : (entry.value / maxValue).clamp(0, 1),
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

class _StatsGrid extends StatelessWidget {
  final String title;
  final List<_StatItem> items;

  const _StatsGrid({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            LayoutBuilder(
              builder: (context, constraints) {
                final width = constraints.maxWidth;
                final crossAxisCount = width >= 540 ? 3 : 2;
                final childAspectRatio = width < 360
                    ? 1.7
                    : width < 480
                    ? 2.0
                    : width < 640
                    ? 2.2
                    : 2.5;
                return GridView.count(
                  crossAxisCount: crossAxisCount,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: childAspectRatio,
                  children: items
                      .map(
                        (item) =>
                            _StatTile(label: item.label, value: item.value),
                      )
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;

  const _StatTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricPill extends StatelessWidget {
  final String label;
  final String value;

  const _MetricPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            value,
            style: theme.textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final String value;

  const _InfoCard({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Text(
      title,
      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
    );
  }
}

class _DonutSlice {
  final double value;
  final String label;
  final Color color;

  const _DonutSlice({
    required this.value,
    required this.label,
    required this.color,
  });
}

class _DonutChart extends StatelessWidget {
  final List<_DonutSlice> slices;
  final double size;
  final double strokeWidth;
  final Color backgroundColor;

  const _DonutChart({
    required this.slices,
    required this.size,
    required this.strokeWidth,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _DonutPainter(
          slices: slices,
          strokeWidth: strokeWidth,
          backgroundColor: backgroundColor,
        ),
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  final List<_DonutSlice> slices;
  final double strokeWidth;
  final Color backgroundColor;

  const _DonutPainter({
    required this.slices,
    required this.strokeWidth,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final center = rect.center;
    final radius = size.shortestSide / 2;

    final basePaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius - strokeWidth / 2, basePaint);

    final total = slices.fold<double>(0, (sum, s) => sum + s.value);
    if (total <= 0) return;

    var startAngle = -math.pi / 2;
    for (final slice in slices) {
      if (slice.value <= 0) continue;
      final sweep = (slice.value / total) * math.pi * 2;
      final paint = Paint()
        ..color = slice.color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
        startAngle,
        sweep,
        false,
        paint,
      );
      startAngle += sweep;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutPainter oldDelegate) {
    return oldDelegate.slices != slices ||
        oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}

class _LegendItem extends StatelessWidget {
  final String label;
  final Color color;
  final String value;
  final String percent;

  const _LegendItem({
    required this.label,
    required this.color,
    required this.value,
    required this.percent,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            percent,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.wifi_off_rounded,
            size: 56,
            color: theme.colorScheme.error.withValues(alpha: 0.7),
          ),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onRetry,
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }
}

class _StatItem {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});
}

String _formatNumber(int value) {
  if (value >= 1000000) {
    return '${(value / 1000000).toStringAsFixed(1)}M';
  }
  if (value >= 1000) {
    return '${(value / 1000).toStringAsFixed(1)}k';
  }
  return value.toString();
}

String _formatPercent(double value) {
  return '${value.toStringAsFixed(0)}%';
}

String _formatRatio(double? value) {
  if (value == null) return '-';
  final percent = value <= 1 ? value * 100 : value;
  return '${percent.toStringAsFixed(0)}%';
}

String _formatDecimal(double? value) {
  if (value == null) return '-';
  return value.toStringAsFixed(1);
}

String _formatDate(DateTime date) {
  final day = date.day.toString().padLeft(2, '0');
  final month = date.month.toString().padLeft(2, '0');
  return '$day/$month/${date.year}';
}

String _formatArchetype(String raw) {
  const labels = {
    'DISCOVERY_READER': 'Leitor em Descoberta',
    'GENRE_DEVOTEE': 'Devoto do Genero',
    'CLASSICS_SCHOLAR': 'Erudito Classico',
    'COMPULSIVE_READER': 'Leitor Compulsivo',
    'ECLECTIC_READER': 'Leitor Ecletico',
    'RE_READER': 'Releitor',
    'EMOTIONAL_READER': 'Leitor Emocional',
    'EXPLORER': 'Explorador',
  };

  return labels[raw] ?? raw;
}
