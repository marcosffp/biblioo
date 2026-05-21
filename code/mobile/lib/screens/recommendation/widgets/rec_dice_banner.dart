import 'dart:async';

import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'package:biblioo/shared/widgets/book_cover_placeholder.dart';
import 'package:flutter/material.dart';

/// Banner do "Jogar o Dado".
///
/// Lógica de animação em 3 fases (espelha o front-end web):
///   idle     → estado parado, exibe livro e botão normal
///   rolling  → dado cicla faces a 80ms enquanto a API carrega
///   stopping → API respondeu; dado desacelera rapidamente,
///              depois [_visibleBook] é atualizado
///
/// [_visibleBook] só muda ao término da animação de parada para evitar
/// que o conteúdo do card pisque junto com a face do dado.
class RecDiceBanner extends StatefulWidget {
  final RecommendedBook? book;
  final bool loading;
  final bool rolling;
  final VoidCallback onRoll;
  final ValueChanged<int> onTap;

  const RecDiceBanner({
    super.key,
    required this.book,
    required this.loading,
    required this.rolling,
    required this.onRoll,
    required this.onTap,
  });

  @override
  State<RecDiceBanner> createState() => _RecDiceBannerState();
}

enum _DicePhase { idle, rolling, stopping }

class _RecDiceBannerState extends State<RecDiceBanner> {
  int _face = 1;
  _DicePhase _phase = _DicePhase.idle;
  Timer? _timer;

  RecommendedBook? _visibleBook;
  RecommendedBook? _pendingBook;

  @override
  void initState() {
    super.initState();
    _visibleBook = widget.book;
    _pendingBook = widget.book;
  }

  @override
  void didUpdateWidget(RecDiceBanner old) {
    super.didUpdateWidget(old);
    _pendingBook = widget.book;

    // Primeiro carregamento: exibe sem animação
    if (widget.book != null && _visibleBook == null && !widget.rolling) {
      setState(() => _visibleBook = widget.book);
    }

    if (widget.rolling && _phase == _DicePhase.idle) {
      _startRolling();
    } else if (!widget.rolling && _phase == _DicePhase.rolling) {
      _startStopping();
    }
  }

  void _startRolling() {
    _timer?.cancel();
    setState(() => _phase = _DicePhase.rolling);
    _timer = Timer.periodic(const Duration(milliseconds: 80), (_) {
      if (mounted) setState(() => _face = (_face % 6) + 1);
    });
  }

  void _startStopping() {
    _timer?.cancel();
    setState(() => _phase = _DicePhase.stopping);

    int delayMs = 70;
    int count = 0;

    void tick() {
      if (!mounted) return;
      setState(() => _face = (_face % 6) + 1);
      count++;
      if (count >= 4) {
        setState(() {
          _phase = _DicePhase.idle;
          _visibleBook = _pendingBook;
        });
        return;
      }
      delayMs = (delayMs * 1.5).round();
      _timer = Timer(Duration(milliseconds: delayMs), tick);
    }

    _timer = Timer(Duration(milliseconds: delayMs), tick);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  bool get _animating => _phase != _DicePhase.idle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fg = theme.colorScheme.onPrimaryContainer;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primaryContainer,
            theme.colorScheme.secondaryContainer,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Cabeçalho ────────────────────────────────────
          Row(
            children: [
              Icon(Icons.casino, color: fg, size: 20),
              const SizedBox(width: 8),
              Text(
                'Recomendação do dia',
                style: theme.textTheme.labelLarge?.copyWith(
                  color: fg,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // ── Conteúdo ──────────────────────────────────────
          if (widget.loading)
            SizedBox(
              height: 100,
              child: Center(child: CircularProgressIndicator(color: fg)),
            )
          else if (_visibleBook != null)
            _BookRow(
              book: _visibleBook!,
              animating: _animating,
              onTap: _animating ? null : () => widget.onTap(_visibleBook!.id),
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Nenhum livro disponível no momento.',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: fg.withValues(alpha: 0.85)),
              ),
            ),

          const SizedBox(height: 12),

          // ── Botão dado ────────────────────────────────────
          Align(
            alignment: Alignment.centerRight,
            child: _DiceButton(
              face: _face,
              animating: _animating,
              color: fg,
              onTap: _animating ? null : widget.onRoll,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Linha de livro com fade durante animação ──────────────────────────────────

class _BookRow extends StatelessWidget {
  final RecommendedBook book;
  final bool animating;
  final VoidCallback? onTap;

  const _BookRow({
    required this.book,
    required this.animating,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fg = theme.colorScheme.onPrimaryContainer;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Capa — opacidade reduzida durante o sorteio
          AnimatedOpacity(
            duration: const Duration(milliseconds: 300),
            opacity: animating ? 0.25 : 1.0,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 70,
                height: 100,
                child: book.coverUrl != null
                    ? Image.network(
                        book.coverUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => BookCoverPlaceholder(
                          title: book.title,
                        ),
                      )
                    : BookCoverPlaceholder(title: book.title),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Informações — fade + slide durante o sorteio
          Expanded(
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 300),
              opacity: animating ? 0.0 : 1.0,
              child: AnimatedSlide(
                duration: const Duration(milliseconds: 300),
                offset: animating ? const Offset(0, 0.08) : Offset.zero,
                curve: Curves.easeOut,
                child: _BookInfo(book: book, fg: fg),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BookInfo extends StatelessWidget {
  final RecommendedBook book;
  final Color fg;

  const _BookInfo({required this.book, required this.fg});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          book.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.titleMedium
              ?.copyWith(color: fg, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 12,
          runSpacing: 4,
          children: [
            if (book.averageRating != null)
              _MetaChip(
                icon: Icons.star,
                label: book.averageRating!.toStringAsFixed(1),
                color: fg,
              ),
            if (book.pageCount != null)
              _MetaChip(
                icon: Icons.menu_book,
                label: '${book.pageCount} pág.',
                color: fg,
              ),
            if (book.readerCount != null && book.readerCount! > 0)
              _MetaChip(
                icon: Icons.people,
                label: '${book.readerCount} leitores',
                color: fg,
              ),
          ],
        ),
        if (book.description != null && book.description!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              book.description!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: fg.withValues(alpha: 0.85)),
            ),
          ),
      ],
    );
  }
}

// ── Botão de dado animado ─────────────────────────────────────────────────────

class _DiceButton extends StatelessWidget {
  final int face;
  final bool animating;
  final Color color;
  final VoidCallback? onTap;

  const _DiceButton({
    required this.face,
    required this.animating,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: color.withValues(alpha: animating ? 0.22 : 0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withValues(alpha: animating ? 0.6 : 0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _DiceFace(face: face, color: color, size: 26),
            const SizedBox(width: 8),
            Text(
              animating ? 'Sorteando...' : 'Sortear',
              style: theme.textTheme.labelMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Face do dado (CustomPaint) ────────────────────────────────────────────────

class _DiceFace extends StatelessWidget {
  final int face;
  final Color color;
  final double size;

  const _DiceFace({
    required this.face,
    required this.color,
    required this.size,
  });

  @override
  Widget build(BuildContext context) => CustomPaint(
        size: Size(size, size),
        painter: _DicePainter(face: face.clamp(1, 6), color: color),
      );
}

class _DicePainter extends CustomPainter {
  final int face;
  final Color color;

  // Posições dos pontos normalizadas [0,1]
  static const _dotPositions = {
    1: [Offset(0.50, 0.50)],
    2: [Offset(0.30, 0.30), Offset(0.70, 0.70)],
    3: [Offset(0.30, 0.30), Offset(0.50, 0.50), Offset(0.70, 0.70)],
    4: [Offset(0.30, 0.30), Offset(0.70, 0.30), Offset(0.30, 0.70), Offset(0.70, 0.70)],
    5: [Offset(0.30, 0.30), Offset(0.70, 0.30), Offset(0.50, 0.50), Offset(0.30, 0.70), Offset(0.70, 0.70)],
    6: [Offset(0.30, 0.27), Offset(0.70, 0.27), Offset(0.30, 0.50), Offset(0.70, 0.50), Offset(0.30, 0.73), Offset(0.70, 0.73)],
  };

  const _DicePainter({required this.face, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Fundo
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(w * 0.06, h * 0.06, w * 0.88, h * 0.88),
        Radius.circular(w * 0.22),
      ),
      Paint()
        ..color = color.withValues(alpha: 0.15)
        ..style = PaintingStyle.fill,
    );

    // Borda
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(w * 0.06, h * 0.06, w * 0.88, h * 0.88),
        Radius.circular(w * 0.22),
      ),
      Paint()
        ..color = color.withValues(alpha: 0.9)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.07,
    );

    // Pontos
    final dotPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final dotRadius = w * 0.10;

    for (final pos in _dotPositions[face] ?? []) {
      canvas.drawCircle(Offset(pos.dx * w, pos.dy * h), dotRadius, dotPaint);
    }
  }

  @override
  bool shouldRepaint(_DicePainter old) =>
      old.face != face || old.color != color;
}

// ── Meta chip ─────────────────────────────────────────────────────────────────

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _MetaChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: color),
          ),
        ],
      );
}
