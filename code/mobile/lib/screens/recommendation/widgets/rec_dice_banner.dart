import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'package:flutter/material.dart';

/// Banner do "Jogar o Dado" — exibe o sorteio atual ou estado vazio
/// e dispara um novo sorteio via callback.
/// Gradiente segue o padrão do CommunityOverviewTab (primaryContainer →
/// secondaryContainer) para coerência visual com o restante do app.
class RecDiceBanner extends StatelessWidget {
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
          if (loading)
            SizedBox(
              height: 100,
              child: Center(
                child: CircularProgressIndicator(color: fg),
              ),
            )
          else if (book != null)
            _DiceBookRow(book: book!, onTap: () => onTap(book!.id))
          else
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Nenhum livro disponível no momento.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: fg.withValues(alpha: 0.85),
                ),
              ),
            ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: FilledButton.tonalIcon(
              onPressed: rolling ? null : onRoll,
              icon: rolling
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.shuffle, size: 18),
              label: Text(rolling ? 'Sorteando...' : 'Sortear livro'),
            ),
          ),
        ],
      ),
    );
  }
}

class _DiceBookRow extends StatelessWidget {
  final RecommendedBook book;
  final VoidCallback onTap;
  const _DiceBookRow({required this.book, required this.onTap});

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
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 70,
              height: 100,
              child: book.coverUrl != null
                  ? Image.network(
                      book.coverUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => _placeholder(theme),
                    )
                  : _placeholder(theme),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  book.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: fg,
                    fontWeight: FontWeight.w700,
                  ),
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
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: fg.withValues(alpha: 0.85),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _placeholder(ThemeData theme) => Container(
        color: theme.colorScheme.onPrimaryContainer.withValues(alpha: 0.12),
        child: Icon(
          Icons.menu_book,
          color: theme.colorScheme.onPrimaryContainer,
        ),
      );
}

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
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: color),
        ),
      ],
    );
  }
}
