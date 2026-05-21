import 'package:flutter/material.dart';

/// Capa-placeholder gerada proceduralmente a partir do título/autor.
/// Usa hash DJB2 para selecionar paleta e tipo de padrão decorativo,
/// garantindo que o mesmo livro sempre obtenha a mesma capa.
///
/// Uso: substitua containers estáticos com ícone de livro por este widget —
/// o tamanho é controlado pelo widget pai (SizedBox, AspectRatio, etc.).
class BookCoverPlaceholder extends StatelessWidget {
  final String title;
  final String? author;

  const BookCoverPlaceholder({
    super.key,
    required this.title,
    this.author,
  });

  static const _palettes = [
    _Palette(Color(0xFF1a1a3e), Color(0xFF0d0d2b), Color(0xFFffd700)), // navy / gold
    _Palette(Color(0xFF1b4332), Color(0xFF081c15), Color(0xFF74c69d)), // forest / mint
    _Palette(Color(0xFF4a0e8f), Color(0xFF1a0050), Color(0xFFd4a5ff)), // violet / lavender
    _Palette(Color(0xFF7d1a1a), Color(0xFF4a0000), Color(0xFFffc300)), // crimson / amber
    _Palette(Color(0xFF0a2463), Color(0xFF031430), Color(0xFF48cae4)), // royal blue / cyan
    _Palette(Color(0xFF5c3317), Color(0xFF2d1a0a), Color(0xFFf6ae2d)), // leather / gold
    _Palette(Color(0xFF1e3a5f), Color(0xFF0a1628), Color(0xFF63cfe0)), // indigo / sky
    _Palette(Color(0xFF00475a), Color(0xFF001a22), Color(0xFFff9ab5)), // teal / rose
  ];

  @override
  Widget build(BuildContext context) {
    final seed = (title.isNotEmpty ? title : author ?? 'book').toLowerCase();
    final hash = _djb2(seed);
    final palette = _palettes[hash % _palettes.length];
    final patternType = (hash >> 5) % 4;

    return ClipRect(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [palette.from, palette.to],
          ),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            CustomPaint(
              painter: _PatternPainter(
                patternType: patternType,
                accent: palette.accent,
                hash: hash,
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _TitleOverlay(
                title: title,
                author: author,
                accent: palette.accent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Paleta ────────────────────────────────────────────────────────────────────

class _Palette {
  final Color from;
  final Color to;
  final Color accent;
  const _Palette(this.from, this.to, this.accent);
}

// ── Hash DJB2 ─────────────────────────────────────────────────────────────────

int _djb2(String s) {
  int h = 5381;
  for (int i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.codeUnitAt(i)) & 0xFFFFFFFF;
  }
  return h;
}

// ── Padrão decorativo ─────────────────────────────────────────────────────────

class _PatternPainter extends CustomPainter {
  final int patternType;
  final Color accent;
  final int hash;

  const _PatternPainter({
    required this.patternType,
    required this.accent,
    required this.hash,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = accent.withValues(alpha: 0.12)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke
      ..isAntiAlias = true;

    switch (patternType) {
      case 0:
        _drawDiagonalLines(canvas, size, paint);
      case 1:
        _drawDots(canvas, size, paint..style = PaintingStyle.fill);
      case 2:
        _drawArcs(canvas, size, paint);
      case _:
        _drawHorizontalLines(canvas, size, paint, hash);
    }
  }

  void _drawDiagonalLines(Canvas canvas, Size size, Paint paint) {
    const step = 14.0;
    for (double x = -size.height; x < size.width + size.height; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x + size.height, size.height), paint);
    }
  }

  void _drawDots(Canvas canvas, Size size, Paint paint) {
    const step = 16.0;
    final maxY = size.height * 0.65;
    for (double x = 10; x < size.width - 4; x += step) {
      for (double y = 10; y < maxY; y += step) {
        canvas.drawCircle(Offset(x, y), 1.5, paint);
      }
    }
  }

  void _drawArcs(Canvas canvas, Size size, Paint paint) {
    final cx = size.width * 0.85;
    final cy = size.height * 0.18;
    for (double r = 12; r <= size.width * 0.7; r += 18) {
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: r),
        0,
        3.14159,
        false,
        paint,
      );
    }
  }

  void _drawHorizontalLines(Canvas canvas, Size size, Paint paint, int hash) {
    final maxY = size.height * 0.65;
    const baseX = 8.0;
    double y = 12;
    int i = 0;
    while (y < maxY) {
      final lineWidth = size.width * (0.35 + ((hash + i) % 5) * 0.08);
      canvas.drawLine(Offset(baseX, y), Offset(baseX + lineWidth, y), paint);
      y += 10;
      i++;
    }
  }

  @override
  bool shouldRepaint(_PatternPainter old) =>
      old.patternType != patternType || old.accent != accent;
}

// ── Overlay de título ─────────────────────────────────────────────────────────

class _TitleOverlay extends StatelessWidget {
  final String title;
  final String? author;
  final Color accent;

  const _TitleOverlay({
    required this.title,
    required this.author,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    if (title.isEmpty) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withValues(alpha: 0),
            Colors.black.withValues(alpha: 0.72),
          ],
        ),
      ),
      padding: const EdgeInsets.fromLTRB(6, 16, 6, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            title,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.w700,
              height: 1.2,
            ),
          ),
          if (author != null && author!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                author!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: accent.withValues(alpha: 0.9),
                  fontSize: 7.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
