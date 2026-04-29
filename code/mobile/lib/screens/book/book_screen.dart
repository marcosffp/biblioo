import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:flutter/material.dart';

class BookScreen extends StatefulWidget {
  final int bookId;

  const BookScreen({super.key, required this.bookId});

  @override
  State<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends State<BookScreen> {
  late Future<Book> _future;

  @override
  void initState() {
    super.initState();
    _future = Injector.instance.bookRepo.getById(widget.bookId);
  }

  Future<void> _reload() async {
    setState(() {
      _future = Injector.instance.bookRepo.getById(widget.bookId);
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: FutureBuilder<Book>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.wifi_off_rounded,
                      size: 64,
                      color: theme.colorScheme.error.withValues(alpha: 0.7),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Não foi possível carregar este livro.',
                      style: theme.textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Verifique sua conexão e tente novamente.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: _reload,
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            );
          }

          final book = snapshot.data;
          if (book == null) {
            return const SizedBox.shrink();
          }

          return CustomScrollView(
            slivers: [
              SliverAppBar(pinned: true, title: const Text('Livro')),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _Header(book: book),
                      const SizedBox(height: 16),
                      _MetadataRow(book: book),
                      const SizedBox(height: 20),
                      if (book.description != null &&
                          book.description!.trim().isNotEmpty)
                        _Section(
                          title: 'Descrição',
                          child: Text(
                            book.description!,
                            style: theme.textTheme.bodyMedium,
                          ),
                        ),
                      if (book.description != null &&
                          book.description!.trim().isNotEmpty)
                        const SizedBox(height: 20),
                      _Section(
                        title: 'Detalhes',
                        child: Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: [
                            _InfoChip(
                              icon: Icons.menu_book_outlined,
                              label: book.pageCount != null
                                  ? '${book.pageCount} páginas'
                                  : 'Páginas não informadas',
                            ),
                            _InfoChip(
                              icon: Icons.people_outline,
                              label: book.readerCount != null
                                  ? '${book.readerCount} leitores'
                                  : 'Leitores não informados',
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final Book book;

  const _Header({required this.book});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Cover(coverUrl: book.coverUrl),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                book.title,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              if (book.authors.isNotEmpty)
                Text(
                  book.authorsText,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              const SizedBox(height: 12),
              if (book.averageRating != null)
                _RatingRow(rating: book.averageRating!),
            ],
          ),
        ),
      ],
    );
  }
}

class _MetadataRow extends StatelessWidget {
  final Book book;

  const _MetadataRow({required this.book});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        if (book.pageCount != null)
          _InfoChip(
            icon: Icons.menu_book_outlined,
            label: '${book.pageCount} páginas',
          ),
        if (book.readerCount != null)
          _InfoChip(
            icon: Icons.people_outline,
            label: '${book.readerCount} leitores',
          ),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final Widget child;

  const _Section({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Chip(
      avatar: Icon(icon, size: 16, color: theme.colorScheme.primary),
      label: Text(label),
      side: BorderSide(color: theme.colorScheme.outlineVariant),
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    );
  }
}

class _Cover extends StatelessWidget {
  final String? coverUrl;

  const _Cover({this.coverUrl});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (coverUrl != null && coverUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Image.network(
          coverUrl!,
          width: 120,
          height: 170,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _placeholder(theme),
        ),
      );
    }

    return _placeholder(theme);
  }

  Widget _placeholder(ThemeData theme) {
    return Container(
      width: 120,
      height: 170,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: theme.colorScheme.primaryContainer,
      ),
      child: Icon(Icons.menu_book, size: 48, color: theme.colorScheme.primary),
    );
  }
}

class _RatingRow extends StatelessWidget {
  final double rating;

  const _RatingRow({required this.rating});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final full = rating.floor();
    final hasHalf = (rating - full) >= 0.5;
    final empty = 5 - full - (hasHalf ? 1 : 0);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(
          full,
          (index) =>
              Icon(Icons.star, size: 18, color: theme.colorScheme.primary),
        ),
        if (hasHalf)
          Icon(Icons.star_half, size: 18, color: theme.colorScheme.primary),
        ...List.generate(
          empty,
          (index) => Icon(
            Icons.star_border,
            size: 18,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          rating.toStringAsFixed(1),
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
