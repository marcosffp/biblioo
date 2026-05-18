import 'package:biblioo/features/recommendation/bloc/recommendation_bloc.dart';
import 'package:biblioo/features/recommendation/bloc/recommendation_event.dart';
import 'package:biblioo/features/recommendation/bloc/recommendation_state.dart';
import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class DiceScreen extends StatefulWidget {
  const DiceScreen({super.key});

  @override
  State<DiceScreen> createState() => _DiceScreenState();
}

class _DiceScreenState extends State<DiceScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _rotation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _rotation = Tween(begin: 0.0, end: 6.28).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
    _controller.forward();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<RecommendationBloc>().add(RecommendationDiceRolled());
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _roll() {
    _controller.forward(from: 0);
    context.read<RecommendationBloc>().add(RecommendationDiceRolled());
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
        child: BlocBuilder<RecommendationBloc, RecommendationState>(
          buildWhen: (p, c) =>
              p.dice != c.dice || p.diceRolling != c.diceRolling,
          builder: (context, state) {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Deixe o destino escolher',
                  style: theme.textTheme.headlineSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Role o dado e descubra seu próximo livro',
                  style: theme.textTheme.bodyMedium
                      ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                AnimatedBuilder(
                  animation: _rotation,
                  builder: (_, child) =>
                      Transform.rotate(angle: _rotation.value, child: child),
                  child: Icon(
                    Icons.casino,
                    size: 96,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 48),
                Expanded(child: _buildResult(state, theme)),
                FilledButton.icon(
                  onPressed: state.diceRolling ? null : _roll,
                  icon: state.diceRolling
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.casino_outlined),
                  label: Text(
                    state.diceRolling ? 'Sorteando...' : 'Rolar o dado',
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildResult(RecommendationState state, ThemeData theme) {
    if (state.dice.isLoading && !state.dice.hasData) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.dice.error != null && !state.dice.hasData) {
      return Center(
        child: Text(
          state.dice.error!,
          style: theme.textTheme.bodyMedium
              ?.copyWith(color: theme.colorScheme.error),
        ),
      );
    }
    final book = state.dice.data;
    if (book == null) {
      return Center(
        child: Text(
          'Nenhum livro disponível no momento.',
          style: theme.textTheme.bodyMedium
              ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
        ),
      );
    }
    return Center(child: _DiceResultCard(book: book));
  }
}

class _DiceResultCard extends StatelessWidget {
  final RecommendedBook book;
  const _DiceResultCard({required this.book});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: InkWell(
        onTap: () => context.push('/book/${book.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 56,
                  height: 80,
                  child: book.coverUrl != null
                      ? Image.network(
                          book.coverUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => _placeholder(theme),
                        )
                      : _placeholder(theme),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      book.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    if (book.averageRating != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.star,
                              size: 14, color: Colors.amber.shade700),
                          const SizedBox(width: 4),
                          Text(
                            book.averageRating!.toStringAsFixed(1),
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholder(ThemeData theme) => Container(
        color: theme.colorScheme.primaryContainer,
        child: Icon(Icons.menu_book, color: theme.colorScheme.primary),
      );
}
