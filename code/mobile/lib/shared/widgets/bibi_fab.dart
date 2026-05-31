import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BibiFab extends StatelessWidget {
  final bool mini;
  final String heroTag;

  const BibiFab({super.key, this.mini = false, this.heroTag = 'bibi_fab'});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return FloatingActionButton(
      heroTag: heroTag,
      mini: mini,
      onPressed: () => context.push('/assistant'),
      backgroundColor: cs.primary,
      foregroundColor: cs.onPrimary,
      tooltip: 'Falar com o Bibo',
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Image.asset('assets/images/biblioo-carinha-branca-logo.png'),
      ),
    );
  }
}
