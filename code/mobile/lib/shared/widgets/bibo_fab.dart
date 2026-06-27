import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BiboFab extends StatelessWidget {
  final bool mini;
  final String heroTag;

  const BiboFab({super.key, this.mini = false, this.heroTag = 'bibo_fab'});

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
      child: const Icon(Icons.auto_awesome),
    );
  }
}
