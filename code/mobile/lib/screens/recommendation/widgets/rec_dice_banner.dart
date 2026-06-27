import 'dart:async';
import 'dart:math';

import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'package:biblioo/shared/widgets/book_cover_placeholder.dart';
import 'package:flutter/material.dart';

// ─── Constantes ───────────────────────────────────────────────────────────────
const double _kCubeSize = 34.0;
const double _kCubeHalf = _kCubeSize / 2;
const double _kCameraZ  = 252.0; // equivalent to CSS perspective: 252px

// Banner gradient — mirrors web tokens.css brand-700 → brand-500
const _kGradStart = Color(0xFF0D6E5C);
const _kGradEnd   = Color(0xFF13937A);

// Posições normalizadas [0,1] dos pontos em cada face
const _kDots = <int, List<Offset>>{
  1: [Offset(0.50, 0.50)],
  2: [Offset(0.30, 0.30), Offset(0.70, 0.70)],
  3: [Offset(0.30, 0.30), Offset(0.50, 0.50), Offset(0.70, 0.70)],
  4: [Offset(0.30, 0.30), Offset(0.70, 0.30), Offset(0.30, 0.70), Offset(0.70, 0.70)],
  5: [Offset(0.30, 0.30), Offset(0.70, 0.30), Offset(0.50, 0.50), Offset(0.30, 0.70), Offset(0.70, 0.70)],
  6: [Offset(0.30, 0.27), Offset(0.70, 0.27), Offset(0.30, 0.50), Offset(0.70, 0.50), Offset(0.30, 0.73), Offset(0.70, 0.73)],
};

// ─── Vetor 3D leve (sem dependência de vector_math) ───────────────────────────
class _V3 {
  const _V3(this.x, this.y, this.z);
  final double x, y, z;

  _V3 operator -(_V3 o) => _V3(x - o.x, y - o.y, z - o.z);

  _V3 cross(_V3 o) =>
      _V3(y * o.z - z * o.y, z * o.x - x * o.z, x * o.y - y * o.x);

  double get len => sqrt(x * x + y * y + z * z);
  _V3 get norm {
    final l = len;
    return l > 0 ? _V3(x / l, y / l, z / l) : this;
  }

  _V3 rotX(double a) {
    final c = cos(a), s = sin(a);
    return _V3(x, y * c - z * s, y * s + z * c);
  }

  _V3 rotY(double a) {
    final c = cos(a), s = sin(a);
    return _V3(x * c + z * s, y, -x * s + z * c);
  }

  _V3 rotZ(double a) {
    final c = cos(a), s = sin(a);
    return _V3(x * c - y * s, x * s + y * c, z);
  }

  _V3 rot(double rx, double ry, double rz) => rotX(rx).rotY(ry).rotZ(rz);
}

// ─── Geometria do cubo ────────────────────────────────────────────────────────
// 8 vértices centrados na origem; z+ aponta para a câmera
const _kVerts = [
  _V3(-_kCubeHalf, -_kCubeHalf,  _kCubeHalf), // 0 FTL
  _V3( _kCubeHalf, -_kCubeHalf,  _kCubeHalf), // 1 FTR
  _V3( _kCubeHalf,  _kCubeHalf,  _kCubeHalf), // 2 FBR
  _V3(-_kCubeHalf,  _kCubeHalf,  _kCubeHalf), // 3 FBL
  _V3(-_kCubeHalf, -_kCubeHalf, -_kCubeHalf), // 4 BTL
  _V3( _kCubeHalf, -_kCubeHalf, -_kCubeHalf), // 5 BTR
  _V3( _kCubeHalf,  _kCubeHalf, -_kCubeHalf), // 6 BBR
  _V3(-_kCubeHalf,  _kCubeHalf, -_kCubeHalf), // 7 BBL
];

// Valor do dado de cada face (frente, trás, direita, esquerda, topo, base)
const _kFaceValues = [1, 6, 2, 5, 3, 4];

// Índices dos vértices de cada face [TL, TR, BR, BL] em sentido anti-horário
// visto de fora — garante normal voltada para fora do cubo
const _kFaceVerts = [
  [0, 1, 2, 3], // frente  (+Z) → 1
  [5, 4, 7, 6], // trás    (-Z) → 6
  [1, 5, 6, 2], // direita (+X) → 2
  [4, 0, 3, 7], // esquerda(-X) → 5
  [4, 5, 1, 0], // topo    (-Y) → 3
  [3, 2, 6, 7], // base    (+Y) → 4
];

// ─── CustomPainter 3D ─────────────────────────────────────────────────────────
class _Dice3DPainter extends CustomPainter {
  const _Dice3DPainter({
    required this.rotX,
    required this.rotY,
    required this.rotZ,
    required this.color,
  });

  final double rotX, rotY, rotZ;
  final Color color;

  // Projeção perspectiva: câmera em z = +_kCameraZ olhando para origem
  Offset _project(_V3 v, double cx, double cy) {
    final f = _kCameraZ / (_kCameraZ - v.z);
    return Offset(cx + v.x * f, cy + v.y * f);
  }

  // Interpolação bilinear: mapeia coordenada UV local → pixel na tela
  Offset _bilinear(List<Offset> c, double u, double v) => Offset(
        (1 - u) * (1 - v) * c[0].dx +
            u * (1 - v) * c[1].dx +
            u * v * c[2].dx +
            (1 - u) * v * c[3].dx,
        (1 - u) * (1 - v) * c[0].dy +
            u * (1 - v) * c[1].dy +
            u * v * c[2].dy +
            (1 - u) * v * c[3].dy,
      );

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width  / 2;
    final cy = size.height / 2;

    // Aplica rotação a todos os vértices
    final tv = _kVerts.map((v) => v.rot(rotX, rotY, rotZ)).toList();

    // Coleta faces visíveis com dados de profundidade
    final visible = <({List<Offset> screen, int val, double avgZ, double nz})>[];

    for (var fi = 0; fi < _kFaceVerts.length; fi++) {
      final idx  = _kFaceVerts[fi];
      final v0 = tv[idx[0]], v1 = tv[idx[1]];
      final v2 = tv[idx[2]], v3 = tv[idx[3]];

      // Normal via produto vetorial das arestas
      final normal = (v1 - v0).cross(v3 - v0).norm;

      // Backface culling: descarta faces com normal apontando para longe da câmera
      if (normal.z <= 0) continue;

      visible.add((
        screen: [
          _project(v0, cx, cy),
          _project(v1, cx, cy),
          _project(v2, cx, cy),
          _project(v3, cx, cy),
        ],
        val:  _kFaceValues[fi],
        avgZ: (v0.z + v1.z + v2.z + v3.z) / 4,
        nz:   normal.z,
      ));
    }

    // Algoritmo do pintor: ordena de trás para frente
    visible.sort((a, b) => a.avgZ.compareTo(b.avgZ));

    for (final face in visible) {
      _drawFace(canvas, face.screen, face.val, face.nz);
    }
  }

  void _drawFace(Canvas canvas, List<Offset> corners, int value, double nz) {
    final path      = Path()..addPolygon(corners, true);
    final brightness = (nz * 0.5 + 0.5).clamp(0.0, 1.0);

    canvas.drawPath(
      path,
      Paint()..color = color.withValues(alpha: 0.15 * brightness),
    );

    canvas.drawPath(
      path,
      Paint()
        ..color = color.withValues(alpha: (0.4 + 0.5 * brightness).clamp(0.0, 0.9))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0,
    );

    // Pontos: raio proporcional ao tamanho aparente da face
    final edgeLen = (corners[1] - corners[0]).distance;
    final dotR    = edgeLen * 0.10;
    final dotPaint = Paint()
      ..color = color.withValues(alpha: brightness)
      ..style = PaintingStyle.fill;

    for (final p in _kDots[value] ?? []) {
      canvas.drawCircle(_bilinear(corners, p.dx, p.dy), dotR, dotPaint);
    }
  }

  @override
  bool shouldRepaint(_Dice3DPainter o) =>
      o.rotX != rotX || o.rotY != rotY || o.rotZ != rotZ || o.color != color;
}

// ─── Fases da animação ────────────────────────────────────────────────────────
enum _DicePhase { idle, rolling, stopping }

// ─── Widget do dado 3D com controladores de animação ──────────────────────────
//
// Espelha as três fases do CSS:
//   idle     → rotateX(18°) + rotateY(0→360°) em 5 s, linear, infinito
//   rolling  → rotateX(0→360°) + rotateY(0→540°) + rotateZ(0→120°) em 0.35 s, infinito
//   stopping → keyframes decelerados por cubic-bezier(0.16, 1, 0.3, 1) em 1.1 s
class _Dice3DWidget extends StatefulWidget {
  const _Dice3DWidget({required this.phase, required this.color});

  final _DicePhase phase;
  final Color color;

  @override
  State<_Dice3DWidget> createState() => _Dice3DWidgetState();
}

class _Dice3DWidgetState extends State<_Dice3DWidget>
    with TickerProviderStateMixin {
  late final AnimationController _idleCtrl;  // 5 s linear repeat
  late final AnimationController _rollCtrl;  // 0.35 s linear repeat
  late final AnimationController _stopCtrl;  // 1.1 s forward once

  late final Animation<double> _stopRx;
  late final Animation<double> _stopRy;
  late final Animation<double> _stopRz;

  @override
  void initState() {
    super.initState();

    _idleCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat();

    _rollCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );

    _stopCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    );

    // Monta animações dos keyframes de parada com a curva do CSS
    final curve = CurvedAnimation(
      parent: _stopCtrl,
      curve: const Cubic(0.16, 1.0, 0.3, 1.0),
    );

    _stopRx = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: _r(140)), weight: 30),
      TweenSequenceItem(tween: Tween(begin: _r(140), end: _r(255)), weight: 25),
      TweenSequenceItem(tween: Tween(begin: _r(255), end: _r(330)), weight: 20),
      TweenSequenceItem(tween: Tween(begin: _r(330), end: _r(352)), weight: 15),
      TweenSequenceItem(tween: Tween(begin: _r(352), end: _r(360)), weight: 10),
    ]).animate(curve);

    _stopRy = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: _r(230)), weight: 30),
      TweenSequenceItem(tween: Tween(begin: _r(230), end: _r(318)), weight: 25),
      TweenSequenceItem(tween: Tween(begin: _r(318), end: _r(348)), weight: 20),
      TweenSequenceItem(tween: Tween(begin: _r(348), end: _r(358)), weight: 15),
      TweenSequenceItem(tween: Tween(begin: _r(358), end: _r(360)), weight: 10),
    ]).animate(curve);

    _stopRz = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: _r(55)), weight: 30),
      TweenSequenceItem(tween: Tween(begin: _r(55), end: _r(20)), weight: 25),
      TweenSequenceItem(tween: Tween(begin: _r(20), end: _r(7)), weight: 20),
      TweenSequenceItem(tween: Tween(begin: _r(7), end: _r(2)), weight: 15),
      TweenSequenceItem(tween: Tween(begin: _r(2), end: 0.0), weight: 10),
    ]).animate(curve);

    _applyPhase(widget.phase);
  }

  @override
  void didUpdateWidget(_Dice3DWidget old) {
    super.didUpdateWidget(old);
    if (old.phase != widget.phase) _applyPhase(widget.phase);
  }

  void _applyPhase(_DicePhase phase) {
    switch (phase) {
      case _DicePhase.idle:
        _rollCtrl.stop();
        _stopCtrl
          ..stop()
          ..reset();
        _idleCtrl.repeat();
      case _DicePhase.rolling:
        _idleCtrl.stop();
        _stopCtrl
          ..stop()
          ..reset();
        _rollCtrl.repeat();
      case _DicePhase.stopping:
        _rollCtrl.stop();
        _idleCtrl.stop();
        _stopCtrl
          ..reset()
          ..forward();
    }
  }

  @override
  void dispose() {
    _idleCtrl.dispose();
    _rollCtrl.dispose();
    _stopCtrl.dispose();
    super.dispose();
  }

  // Ângulos atuais em radianos segundo a fase
  (double, double, double) get _angles => switch (widget.phase) {
        _DicePhase.idle => (
          _r(18),
          _idleCtrl.value * _r(360),
          0.0,
        ),
        _DicePhase.rolling => (
          _rollCtrl.value * _r(360),
          _rollCtrl.value * _r(540),
          _rollCtrl.value * _r(120),
        ),
        _DicePhase.stopping => (_stopRx.value, _stopRy.value, _stopRz.value),
      };

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_idleCtrl, _rollCtrl, _stopCtrl]),
      builder: (_, _) {
        final (rx, ry, rz) = _angles;
        return SizedBox(
          width:  _kCubeSize,
          height: _kCubeSize,
          child: CustomPaint(
            painter: _Dice3DPainter(
              rotX:  rx,
              rotY:  ry,
              rotZ:  rz,
              color: widget.color,
            ),
          ),
        );
      },
    );
  }
}

// Converte graus em radianos
double _r(double deg) => deg * (pi / 180);

// ─── Banner principal ─────────────────────────────────────────────────────────

/// Banner "Jogar o Dado" — replica o HeroBanner do frontend web.
///
/// Fases internas (espelham a lógica web):
///   idle     → dado gira devagar; exibe livro com opacidade normal
///   rolling  → dado gira rápido; capa e info ficam semi-transparentes
///   stopping → dado desacelera; ao fim, [_visibleBook] é atualizado
class RecDiceBanner extends StatefulWidget {
  const RecDiceBanner({
    super.key,
    required this.book,
    required this.loading,
    required this.rolling,
    required this.onRoll,
    required this.onTap,
  });

  final RecommendedBook? book;
  final bool loading;
  final bool rolling;
  final VoidCallback onRoll;
  final ValueChanged<int> onTap;

  @override
  State<RecDiceBanner> createState() => _RecDiceBannerState();
}

class _RecDiceBannerState extends State<RecDiceBanner> {
  _DicePhase _phase = _DicePhase.idle;
  Timer? _stopTimer;

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
    _stopTimer?.cancel();
    setState(() => _phase = _DicePhase.rolling);
  }

  void _startStopping() {
    _stopTimer?.cancel();
    setState(() => _phase = _DicePhase.stopping);
    // Aguarda a animação de parada terminar antes de trocar o livro
    _stopTimer = Timer(const Duration(milliseconds: 1150), () {
      if (mounted) {
        setState(() {
          _phase = _DicePhase.idle;
          _visibleBook = _pendingBook;
        });
      }
    });
  }

  @override
  void dispose() {
    _stopTimer?.cancel();
    super.dispose();
  }

  bool get _animating => _phase != _DicePhase.idle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [_kGradStart, _kGradEnd],
        ),
        borderRadius: BorderRadius.all(Radius.circular(16)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Rótulo superior ───────────────────────────────
          Text(
            'RECOMENDAÇÃO DO DIA',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.4,
            ),
          ),
          const SizedBox(height: 14),

          // ── Conteúdo ──────────────────────────────────────
          if (widget.loading)
            SizedBox(
              height: 96,
              child: Center(
                child: CircularProgressIndicator(
                  color: Colors.white.withValues(alpha: 0.7),
                  strokeWidth: 2,
                ),
              ),
            )
          else
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Capa — fica transparente durante o sorteio
                if (_visibleBook != null)
                  GestureDetector(
                    onTap: _animating
                        ? null
                        : () => widget.onTap(_visibleBook!.id),
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 500),
                      opacity: _animating ? 0.25 : 1.0,
                      child: AnimatedScale(
                        duration: const Duration(milliseconds: 500),
                        scale: _animating ? 0.95 : 1.0,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: SizedBox(
                            width: 66,
                            height: 98,
                            child: _visibleBook!.coverUrl != null
                                ? Image.network(
                                    _visibleBook!.coverUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, _, _) =>
                                        BookCoverPlaceholder(
                                          title: _visibleBook!.title,
                                        ),
                                  )
                                : BookCoverPlaceholder(
                                    title: _visibleBook!.title,
                                  ),
                          ),
                        ),
                      ),
                    ),
                  )
                else
                  SizedBox(
                    width: 66,
                    height: 98,
                    child: const BookCoverPlaceholder(title: ''),
                  ),

                const SizedBox(width: 14),

                // Informações — fade + slide durante o sorteio
                Expanded(
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 400),
                    opacity: _animating ? 0.0 : 1.0,
                    child: AnimatedSlide(
                      duration: const Duration(milliseconds: 400),
                      offset:
                          _animating ? const Offset(0, 0.06) : Offset.zero,
                      curve: Curves.easeOut,
                      child: _visibleBook != null
                          ? _BookInfo(book: _visibleBook!)
                          : Text(
                              'Nenhum livro disponível no momento.',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.7),
                                fontSize: 13,
                              ),
                            ),
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                // Botão do dado 3D
                _DiceButton(
                  phase: _phase,
                  onTap: _animating ? null : widget.onRoll,
                ),
              ],
            ),
        ],
      ),
    );
  }
}

// ─── Botão do dado ────────────────────────────────────────────────────────────

class _DiceButton extends StatelessWidget {
  const _DiceButton({required this.phase, required this.onTap});

  final _DicePhase phase;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final animating = phase != _DicePhase.idle;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: animating ? 0.22 : 0.10),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.white.withValues(alpha: animating ? 0.6 : 0.3),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _Dice3DWidget(phase: phase, color: Colors.white),
            const SizedBox(height: 6),
            Text(
              animating ? 'Sorteando...' : 'SORTEAR',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Informações do livro ─────────────────────────────────────────────────────

class _BookInfo extends StatelessWidget {
  const _BookInfo({required this.book});
  final RecommendedBook book;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          book.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 17,
            fontWeight: FontWeight.w700,
            height: 1.25,
          ),
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 10,
          runSpacing: 3,
          children: [
            if (book.averageRating != null)
              _MetaChip(
                icon: Icons.star_rounded,
                label: book.averageRating!.toStringAsFixed(1),
              ),
            if (book.pageCount != null)
              _MetaChip(
                icon: Icons.menu_book_rounded,
                label: '${book.pageCount} pág.',
              ),
            if (book.readerCount != null && book.readerCount! > 0)
              _MetaChip(
                icon: Icons.people_alt_rounded,
                label: '${book.readerCount} leitores',
              ),
          ],
        ),
        if (book.description?.isNotEmpty == true)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              book.description!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.65),
                fontSize: 12.5,
                height: 1.4,
              ),
            ),
          ),
      ],
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.white.withValues(alpha: 0.75)),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.75),
              fontSize: 12,
            ),
          ),
        ],
      );
}
