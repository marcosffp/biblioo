import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/feed/bloc/feed_bloc.dart';
import 'package:biblioo/features/feed/bloc/feed_event.dart';
import 'package:biblioo/features/feed/bloc/review_bloc.dart';
import 'package:biblioo/features/feed/bloc/review_event.dart';
import 'package:biblioo/features/feed/bloc/review_state.dart';
import 'package:biblioo/features/feed/domain/review.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/features/shelf/bloc/shelf_state.dart';
import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';
import 'package:biblioo/screens/shelf/shelf_list_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BookScreen extends StatefulWidget {
  final int bookId;
  final int? shelfId;
  final ShelfItem? shelfItem;

  const BookScreen({
    super.key,
    required this.bookId,
    this.shelfId,
    this.shelfItem,
  });

  @override
  State<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends State<BookScreen> {
  late Future<Book> _future;
  ShelfItem? _shelfItem;
  int? _shelfId;
  List<Shelf> _cachedShelves = [];
  Map<int, ShelfItem> _bookShelfItems = {};

  @override
  void initState() {
    super.initState();
    _future = Injector.instance.bookRepo.getById(widget.bookId);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadReview();
      _resolveShelfContext();
      _refreshShelfPresence();
    });
  }

  void _resolveShelfContext() {
    if (!mounted) return;
    if (widget.shelfItem != null && widget.shelfId != null) {
      setState(() {
        _shelfItem = widget.shelfItem;
        _shelfId = widget.shelfId;
      });
      return;
    }
    // Fallback: look up in current ShelfBloc state (user browsed from shelf)
    final state = context.read<ShelfBloc>().state;
    if (state is ShelfItemsLoaded) {
      try {
        final item = state.items.firstWhere((it) => it.bookId == widget.bookId);
        setState(() {
          _shelfItem = item;
          _shelfId = state.shelfId;
        });
      } catch (_) {}
    }
  }

  Future<void> _reload() async {
    setState(() {
      _future = Injector.instance.bookRepo.getById(widget.bookId);
    });
    _loadReview();
    await _future;
  }

  void _loadReview() {
    if (!mounted) return;
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthAuthenticated) return;
    context.read<ReviewBloc>().add(ReviewCleared());
    context.read<ReviewBloc>().add(
      ReviewLoadForBookRequested(
        userId: authState.session.user.id,
        bookId: widget.bookId,
      ),
    );
  }

  void _refreshShelfPresence() {
    final repo = Injector.instance.shelfRepo;
    final shelves = repo.getCachedShelves();
    final items = repo.getCachedBookItems(widget.bookId);
    if (_shelfId != null && _shelfItem != null) {
      items[_shelfId!] = _shelfItem!;
    }
    if (!mounted) return;
    setState(() {
      _cachedShelves = shelves;
      _bookShelfItems = items;
    });
  }

  bool get _canReview => _bookShelfItems.values.any(
    (item) => item.status == ReadingStatus.completed,
  );

  void _showReviewSheet(Book book, Review? review) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<ReviewBloc>(),
        child: _ReviewSheet(book: book, review: review),
      ),
    );
  }

  void _attemptReview(Book book, Review? review) {
    if (_canReview) {
      _showReviewSheet(book, review);
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Avaliacao liberada apenas quando o livro estiver como Concluido em alguma estante.',
        ),
      ),
    );
  }

  void _showAddToShelfSheet(Book book) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        final theme = Theme.of(sheetContext);
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          minChildSize: 0.6,
          maxChildSize: 0.92,
          builder: (context, scrollController) {
            if (_cachedShelves.isEmpty) {
              return ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(32),
                children: [
                  Icon(
                    Icons.library_books_outlined,
                    size: 48,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Nenhuma estante encontrada.',
                    style: theme.textTheme.titleMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Crie uma estante para adicionar este livro.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              );
            }

            return ListView.separated(
              controller: scrollController,
              padding: const EdgeInsets.symmetric(vertical: 12),
              itemCount: _cachedShelves.length + 1,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (ctx, index) {
                if (index == 0) {
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                    child: Text(
                      'Adicionar a estante',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }
                final shelf = _cachedShelves[index - 1];
                final alreadyInShelf = _bookShelfItems.containsKey(shelf.id);
                final statusLabel = alreadyInShelf
                    ? _bookShelfItems[shelf.id]!.status.label
                    : '';
                return ListTile(
                  title: Text(shelf.name),
                  subtitle: Text(
                    alreadyInShelf
                        ? 'Ja esta nesta estante - $statusLabel'
                        : '${shelf.itemCount} livros',
                  ),
                  trailing: alreadyInShelf
                      ? Icon(
                          Icons.check_circle,
                          color: theme.colorScheme.primary,
                        )
                      : const Icon(Icons.add),
                  enabled: !alreadyInShelf,
                  onTap: alreadyInShelf
                      ? null
                      : () {
                          context.read<ShelfBloc>().add(
                            ShelfItemAddRequested(
                              shelfId: shelf.id,
                              bookId: book.id,
                              initialStatus: ReadingStatus.wantToRead,
                            ),
                          );
                          Navigator.pop(ctx);
                        },
                );
              },
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<ShelfBloc, ShelfState>(
      listener: (context, state) {
        if (state is ShelfProgressUpdateSuccess && _shelfItem != null) {
          if (state.updatedItem.id == _shelfItem!.id) {
            setState(() => _shelfItem = state.updatedItem);
          }
        }
        if (state is ShelfLoaded ||
            state is ShelfItemsLoaded ||
            state is ShelfMutationSuccess ||
            state is ShelfProgressUpdateSuccess) {
          _refreshShelfPresence();
        }
      },
      child: Scaffold(
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
                        const SizedBox(height: 20),
                        _Section(
                          title: 'Estantes',
                          child: _ShelfPickerSection(
                            shelves: _cachedShelves,
                            bookShelfItems: _bookShelfItems,
                            onAdd: () => _showAddToShelfSheet(book),
                          ),
                        ),
                        if (_shelfItem != null &&
                            _shelfId != null &&
                            _shelfItem!.isActiveReading) ...[
                          const SizedBox(height: 20),
                          _Section(
                            title: 'Progresso de leitura',
                            child: _ProgressSection(
                              shelfId: _shelfId!,
                              item: _shelfItem!,
                            ),
                          ),
                        ],
                        const SizedBox(height: 20),
                        BlocBuilder<ReviewBloc, ReviewState>(
                          builder: (context, reviewState) {
                            final review = _reviewFromState(reviewState);
                            return _Section(
                              title: 'Sua avaliacao',
                              child: _ReviewSection(
                                state: reviewState,
                                review: review,
                                canReview: _canReview,
                                onWrite: () => _attemptReview(book, review),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

Review? _reviewFromState(ReviewState state) {
  if (state is ReviewLoaded) return state.review;
  if (state is ReviewSaveSuccess) return state.review;
  if (state is ReviewSaving) return state.review;
  if (state is ReviewError) return state.review;
  return null;
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

class _ShelfPickerSection extends StatelessWidget {
  final List<Shelf> shelves;
  final Map<int, ShelfItem> bookShelfItems;
  final VoidCallback onAdd;

  const _ShelfPickerSection({
    required this.shelves,
    required this.bookShelfItems,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final shelvesWithBook = shelves
        .where((shelf) => bookShelfItems.containsKey(shelf.id))
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (shelvesWithBook.isEmpty)
          Text(
            'Este livro ainda nao esta em nenhuma estante.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          )
        else
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: shelvesWithBook.map((shelf) {
              final item = bookShelfItems[shelf.id]!;
              return _ShelfMiniCard(
                shelf: shelf,
                item: item,
                onTap: () => _openShelf(context, shelf),
              );
            }).toList(),
          ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: onAdd,
          icon: const Icon(Icons.library_add_outlined, size: 18),
          label: const Text('Adicionar a estante'),
        ),
      ],
    );
  }

  void _openShelf(BuildContext context, Shelf shelf) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => BlocProvider.value(
          value: context.read<ShelfBloc>(),
          child: ShelfDetailScreenContent(shelf: shelf),
        ),
      ),
    );
  }
}

class _ShelfMiniCard extends StatelessWidget {
  final Shelf shelf;
  final ShelfItem item;
  final VoidCallback onTap;

  const _ShelfMiniCard({
    required this.shelf,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColors = _statusColors(theme, item.status);

    return SizedBox(
      width: 140,
      child: Card(
        clipBehavior: Clip.antiAlias,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _ShelfCover(
                  coverUrl: shelf.coverPreview.isNotEmpty
                      ? shelf.coverPreview.first
                      : null,
                ),
                const SizedBox(height: 6),
                Text(
                  shelf.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: statusColors.background,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: statusColors.border, width: 1),
                  ),
                  child: Text(
                    item.status.label,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: statusColors.foreground,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  _StatusColors _statusColors(ThemeData theme, ReadingStatus status) {
    switch (status) {
      case ReadingStatus.completed:
        return _StatusColors(
          background: theme.colorScheme.primary,
          foreground: theme.colorScheme.onPrimary,
          border: theme.colorScheme.primary,
        );
      case ReadingStatus.reading:
        return _StatusColors(
          background: theme.colorScheme.tertiary,
          foreground: theme.colorScheme.onTertiary,
          border: theme.colorScheme.tertiary,
        );
      case ReadingStatus.rereading:
        return _StatusColors(
          background: theme.colorScheme.secondary,
          foreground: theme.colorScheme.onSecondary,
          border: theme.colorScheme.secondary,
        );
      case ReadingStatus.abandoned:
        return _StatusColors(
          background: theme.colorScheme.error,
          foreground: theme.colorScheme.onError,
          border: theme.colorScheme.error,
        );
      case ReadingStatus.wantToRead:
        return _StatusColors(
          background: theme.colorScheme.primaryContainer,
          foreground: theme.colorScheme.onPrimaryContainer,
          border: theme.colorScheme.primaryContainer,
        );
    }
  }
}

class _StatusColors {
  final Color background;
  final Color foreground;
  final Color border;

  const _StatusColors({
    required this.background,
    required this.foreground,
    required this.border,
  });
}

class _ShelfCover extends StatelessWidget {
  final String? coverUrl;

  const _ShelfCover({this.coverUrl});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (coverUrl != null && coverUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          coverUrl!,
          height: 64,
          width: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _placeholder(theme),
        ),
      );
    }

    return _placeholder(theme);
  }

  Widget _placeholder(ThemeData theme) {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: theme.colorScheme.surfaceContainerHighest,
      ),
      child: Icon(
        Icons.library_books_outlined,
        color: theme.colorScheme.onSurfaceVariant,
      ),
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

class _ReviewSection extends StatelessWidget {
  final ReviewState state;
  final Review? review;
  final bool canReview;
  final VoidCallback onWrite;

  const _ReviewSection({
    required this.state,
    required this.review,
    required this.canReview,
    required this.onWrite,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (state is ReviewLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (review == null) {
      if (!canReview) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Para avaliar, marque este livro como Concluido em alguma estante sua.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.lock_outline, size: 18),
              label: const Text('Avaliacao bloqueada'),
            ),
          ],
        );
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Registre sua nota para este livro. A descricao e opcional.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: onWrite,
            icon: const Icon(Icons.rate_review_outlined, size: 18),
            label: const Text('Avaliar livro'),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            _EditableRatingStars(rating: review!.rating, onChanged: null),
            const SizedBox(width: 8),
            Text(
              'Publicado no feed',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        if (review!.text.trim().isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(review!.text, style: theme.textTheme.bodyMedium),
        ],
        const SizedBox(height: 12),
        if (canReview)
          OutlinedButton.icon(
            onPressed: onWrite,
            icon: const Icon(Icons.edit_outlined, size: 18),
            label: const Text('Editar avaliacao'),
          )
        else
          Text(
            'Edicao disponivel apos marcar como Concluido em alguma estante.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
      ],
    );
  }
}

class _ReviewSheet extends StatefulWidget {
  final Book book;
  final Review? review;

  const _ReviewSheet({required this.book, required this.review});

  @override
  State<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends State<_ReviewSheet> {
  late int _rating;
  late final TextEditingController _textController;
  String? _validationError;

  @override
  void initState() {
    super.initState();
    _rating = widget.review?.rating ?? 0;
    _textController = TextEditingController(text: widget.review?.text ?? '');
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  void _save() {
    final text = _textController.text.trim();
    if (_rating < 1 || _rating > 5) {
      setState(() => _validationError = 'Selecione uma nota de 1 a 5.');
      return;
    }
    if (text.length > 2000) {
      setState(
        () => _validationError = 'A descricao deve ter ate 2000 caracteres.',
      );
      return;
    }

    setState(() => _validationError = null);
    context.read<ReviewBloc>().add(
      ReviewSaveRequested(
        reviewId: widget.review?.id,
        bookId: widget.book.id,
        rating: _rating,
        text: text.isEmpty ? null : text,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return BlocConsumer<ReviewBloc, ReviewState>(
      listener: (context, state) {
        if (state is ReviewSaveSuccess) {
          final authState = context.read<AuthBloc>().state;
          if (authState is AuthAuthenticated) {
            context.read<FeedBloc>().add(
              FeedLoadRequested(
                userId: authState.session.user.id,
                refresh: true,
              ),
            );
          }
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Avaliacao publicada no feed.')),
          );
        }
      },
      builder: (context, state) {
        final saving = state is ReviewSaving;
        final backendError = state is ReviewError ? state.message : null;

        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 12,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.onSurfaceVariant.withValues(
                        alpha: 0.3,
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  widget.review == null ? 'Avaliar livro' : 'Editar avaliacao',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.book.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                _EditableRatingStars(
                  rating: _rating,
                  onChanged: saving
                      ? null
                      : (value) {
                          setState(() {
                            _rating = value;
                            _validationError = null;
                          });
                        },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _textController,
                  enabled: !saving,
                  maxLines: 5,
                  maxLength: 2000,
                  decoration: const InputDecoration(
                    labelText: 'Descricao (opcional)',
                    hintText: 'O que voce achou do livro?',
                  ),
                  onChanged: (_) {
                    if (_validationError != null) {
                      setState(() => _validationError = null);
                    }
                  },
                ),
                if (_validationError != null || backendError != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _validationError ?? backendError!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: saving ? null : _save,
                    child: saving
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Salvar avaliacao'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ProgressSection extends StatefulWidget {
  final int shelfId;
  final ShelfItem item;

  const _ProgressSection({required this.shelfId, required this.item});

  @override
  State<_ProgressSection> createState() => _ProgressSectionState();
}

class _ProgressSectionState extends State<_ProgressSection> {
  late int _currentPage;
  late final TextEditingController _pageController;
  late final FocusNode _pageFocusNode;
  bool _awaitingProgressSave = false;

  @override
  void initState() {
    super.initState();
    _currentPage = widget.item.currentPage ?? 0;
    _pageController = TextEditingController(text: '$_currentPage');
    _pageFocusNode = FocusNode();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _pageFocusNode.dispose();
    super.dispose();
  }

  int get _totalPages => widget.item.totalPages ?? 0;
  double get _progressFraction =>
      _totalPages > 0 ? (_currentPage / _totalPages).clamp(0.0, 1.0) : 0;
  int get _progressPercent => (_progressFraction * 100).round();

  void _setPage(int page) {
    final clamped = _totalPages > 0
        ? page.clamp(0, _totalPages)
        : (page < 0 ? 0 : page);
    setState(() => _currentPage = clamped);
    final text = '$clamped';
    if (_pageController.text != text) {
      _pageController.value = TextEditingValue(
        text: text,
        selection: TextSelection.collapsed(offset: text.length),
      );
    }
  }

  void _decrement() {
    if (_currentPage > 0) _setPage(_currentPage - 1);
  }

  void _increment() {
    if (_totalPages == 0 || _currentPage < _totalPages) {
      _setPage(_currentPage + 1);
    }
  }

  void _onPageFieldChanged(String value) {
    final parsed = int.tryParse(value.trim());
    if (parsed == null) return;
    final clamped = _totalPages > 0
        ? parsed.clamp(0, _totalPages)
        : (parsed < 0 ? 0 : parsed);
    setState(() => _currentPage = clamped);
  }

  void _save(BuildContext context) {
    _pageFocusNode.unfocus();
    final parsed = int.tryParse(_pageController.text.trim());
    if (parsed == null || parsed < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe uma página válida.')),
      );
      return;
    }
    final clamped = _totalPages > 0 ? parsed.clamp(0, _totalPages) : parsed;
    _setPage(clamped);
    setState(() => _awaitingProgressSave = true);
    context.read<ShelfBloc>().add(
      ShelfItemProgressUpdated(
        shelfId: widget.shelfId,
        itemId: widget.item.id,
        currentPage: clamped,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<ShelfBloc, ShelfState>(
      listener: (context, state) {
        if (!_awaitingProgressSave) return;
        if (state is ShelfProgressUpdateSuccess) {
          setState(() => _awaitingProgressSave = false);
        } else if (state is ShelfError) {
          setState(() => _awaitingProgressSave = false);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.colorScheme.outlineVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'p. $_currentPage${_totalPages > 0 ? ' / $_totalPages' : ''}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                Text(
                  '$_progressPercent%',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _progressFraction,
                minHeight: 8,
                backgroundColor: theme.colorScheme.primaryContainer.withValues(
                  alpha: 0.4,
                ),
                valueColor: AlwaysStoppedAnimation<Color>(
                  theme.colorScheme.primary,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                IconButton.filled(
                  onPressed: _awaitingProgressSave ? null : _decrement,
                  icon: const Icon(Icons.remove, size: 18),
                  style: IconButton.styleFrom(minimumSize: const Size(40, 40)),
                ),
                const SizedBox(width: 16),
                SizedBox(
                  width: 96,
                  child: TextField(
                    controller: _pageController,
                    focusNode: _pageFocusNode,
                    enabled: !_awaitingProgressSave,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 8,
                        horizontal: 8,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      suffixText: _totalPages > 0 ? '/ $_totalPages' : null,
                    ),
                    onChanged: _onPageFieldChanged,
                    onSubmitted: (_) => _save(context),
                  ),
                ),
                const SizedBox(width: 16),
                IconButton.filled(
                  onPressed: _awaitingProgressSave ? null : _increment,
                  icon: const Icon(Icons.add, size: 18),
                  style: IconButton.styleFrom(minimumSize: const Size(40, 40)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _awaitingProgressSave ? null : () => _save(context),
                child: _awaitingProgressSave
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Salvar progresso'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EditableRatingStars extends StatelessWidget {
  final int rating;
  final ValueChanged<int>? onChanged;

  const _EditableRatingStars({required this.rating, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filledColor = theme.colorScheme.primary;
    final emptyColor = theme.colorScheme.outline;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final value = index + 1;
        final filled = value <= rating;
        return IconButton(
          onPressed: onChanged == null ? null : () => onChanged!(value),
          icon: Icon(
            filled ? Icons.star : Icons.star_border,
            color: filled ? filledColor : emptyColor,
          ),
          color: filledColor,
          disabledColor: filledColor,
          tooltip: '$value estrelas',
          visualDensity: VisualDensity.compact,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints.tightFor(width: 36, height: 36),
        );
      }),
    );
  }
}
