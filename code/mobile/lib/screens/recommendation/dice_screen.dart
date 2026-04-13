import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class DiceScreen extends StatefulWidget {
  const DiceScreen({super.key});

  @override
  State<DiceScreen> createState() => _DiceScreenState();
}

class _DiceScreenState extends State<DiceScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _rotation;
  bool _rolled = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _rotation = Tween(begin: 0.0, end: 6.28).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _roll() {
    _controller.forward(from: 0).then((_) => setState(() => _rolled = true));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.pop()),
        title: const Text('Jogar o Dado'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Deixe o destino escolher',
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Role o dado e descubra seu próximo livro',
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 64),
            AnimatedBuilder(
              animation: _rotation,
              builder: (context, child) => Transform.rotate(
                angle: _rotation.value,
                child: child,
              ),
              child: Icon(Icons.casino, size: 96, color: theme.colorScheme.primary),
            ),
            const SizedBox(height: 64),
            if (_rolled) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 48, height: 68,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(Icons.menu_book, color: theme.colorScheme.primary),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('O Senhor dos Anéis', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                            Text('J.R.R. Tolkien', style: theme.textTheme.bodySmall),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(onPressed: () {}, child: const Text('Adicionar à estante')),
              const SizedBox(height: 8),
              TextButton(onPressed: _roll, child: const Text('Rolar de novo')),
            ] else
              FilledButton.icon(
                onPressed: _roll,
                icon: const Icon(Icons.casino_outlined),
                label: const Text('Rolar o dado'),
              ),
          ],
        ),
      ),
    );
  }
}
