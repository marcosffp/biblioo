import 'package:flutter/material.dart';

/// Marca "Biblioo": o texto "Bibli" emendado na carinha, cujos olhos
/// formam o "oo" e o sorriso fica logo abaixo.
class BibliooWordmark extends StatelessWidget {
  const BibliooWordmark({super.key, this.fontSize = 46, this.color});

  final double fontSize;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final brand = color ?? Theme.of(context).colorScheme.primary;

    return SizedBox(
      height: fontSize * 1.3,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            'Bibli',
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w800,
              letterSpacing: -1.5,
              height: 1,
              color: brand,
            ),
          ),
          const SizedBox(width: 2),
          // A carinha entra como o "oo": cada olho fica do tamanho das letras
          // e o sorriso desce abaixo da linha de base.
          Transform.translate(
            offset: Offset(0, fontSize * 0.14),
            child: Image.asset(
              'assets/images/biblioo-carinha-branca-logo.png',
              height: fontSize * 1.26,
              color: brand,
              colorBlendMode: BlendMode.srcIn,
              fit: BoxFit.contain,
            ),
          ),
        ],
      ),
    );
  }
}
