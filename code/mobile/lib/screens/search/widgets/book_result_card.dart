import 'package:biblioo/features/book/domain/book.dart';
import 'package:flutter/material.dart';

/// Card de resultado de busca — widget burro (recebe dados, emite callback).
class BookResultCard extends StatelessWidget {
  final Book book;
  final VoidCallback? onTap;

  const BookResultCard({super.key, required this.book, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Capa do livro ──────────────────────────────
              _BookCover(coverUrl: book.coverUrl),
              const SizedBox(width: 12),

              // ── Informações ───────────────────────────────
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Título
                    Text(
                      book.title,
                      style: theme.textTheme.labelLarge,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Autores
                    if (book.authors.isNotEmpty)
                      Text(
                        book.authorsText,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 6),

                    // Estrelas de avaliação
                    if (book.averageRating != null)
                      _RatingStars(
                        rating: book.averageRating!,
                        color: theme.colorScheme.primary,
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Capa do livro com fallback para ícone placeholder.
class _BookCover extends StatelessWidget {
  final String? coverUrl;
  const _BookCover({this.coverUrl});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (coverUrl != null && coverUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.network(
          coverUrl!,
          width: 56,
          height: 80,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _placeholder(theme),
        ),
      );
    }
    return _placeholder(theme);
  }

  Widget _placeholder(ThemeData theme) {
    return Container(
      width: 56,
      height: 80,
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        Icons.menu_book,
        color: theme.colorScheme.primary,
        size: 28,
      ),
    );
  }
}

/// Estrelas Material 3 — cheias, meia, vazias.
class _RatingStars extends StatelessWidget {
  final double rating;
  final Color color;
  const _RatingStars({required this.rating, required this.color});

  @override
  Widget build(BuildContext context) {
    final full = rating.floor();
    final hasHalf = (rating - full) >= 0.5;
    final empty = 5 - full - (hasHalf ? 1 : 0);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(full, (index) => Icon(Icons.star, size: 14, color: color)),
        if (hasHalf) Icon(Icons.star_half, size: 14, color: color),
        ...List.generate(
            empty, (index) => Icon(Icons.star_border, size: 14, color: color)),
        const SizedBox(width: 4),
        Text(
          rating.toStringAsFixed(1),
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
      ],
    );
  }
}
