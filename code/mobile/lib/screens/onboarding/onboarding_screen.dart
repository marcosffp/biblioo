import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/features/book/bloc/book_bloc.dart';
import 'package:biblioo/features/book/bloc/book_event.dart';
import 'package:biblioo/features/book/bloc/book_state.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/preferences/bloc/preferences_bloc.dart';
import 'package:biblioo/features/preferences/bloc/preferences_event.dart';
import 'package:biblioo/features/preferences/bloc/preferences_state.dart';
import 'package:biblioo/features/preferences/domain/genre.dart';
import 'package:biblioo/screens/onboarding/widgets/book_pick_card.dart';
import 'package:biblioo/screens/onboarding/widgets/genre_chip.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class _CuratedGenre {
  final String id;
  final String label;
  final String emoji;
  final Color bg;
  final List<String> keywords;

  const _CuratedGenre({
    required this.id,
    required this.label,
    required this.emoji,
    required this.bg,
    required this.keywords,
  });
}

const _kCuratedGenres = <_CuratedGenre>[
  _CuratedGenre(id: 'romance', label: 'Romance', emoji: '❤️', bg: Color(0xFFFCE4EC), keywords: ['romance', 'love stories']),
  _CuratedGenre(id: 'sci-fi', label: 'Ficção Científica', emoji: '🚀', bg: Color(0xFFE3F2FD), keywords: ['science fiction', 'sci-fi', 'scifi', 'scientific']),
  _CuratedGenre(id: 'fantasy', label: 'Fantasia', emoji: '🧙', bg: Color(0xFFEDE7F6), keywords: ['fantasy']),
  _CuratedGenre(id: 'mystery', label: 'Mistério', emoji: '🔍', bg: Color(0xFFECEFF1), keywords: ['mystery', 'detective', 'crime fiction']),
  _CuratedGenre(id: 'horror', label: 'Terror', emoji: '👻', bg: Color(0xFFFFEBEE), keywords: ['horror', 'ghost stories', 'supernatural fiction']),
  _CuratedGenre(id: 'thriller', label: 'Thriller', emoji: '⚡', bg: Color(0xFFFFF3E0), keywords: ['thriller', 'suspense']),
  _CuratedGenre(id: 'adventure', label: 'Aventura', emoji: '🧭', bg: Color(0xFFE8F5E9), keywords: ['adventure']),
  _CuratedGenre(id: 'historical', label: 'Histórico', emoji: '🏛️', bg: Color(0xFFFFF8E1), keywords: ['historical', 'history']),
  _CuratedGenre(id: 'self-help', label: 'Autoajuda', emoji: '✨', bg: Color(0xFFFFFDE7), keywords: ['self-help', 'self help', 'personal development', 'motivational']),
  _CuratedGenre(id: 'classics', label: 'Clássicos', emoji: '📚', bg: Color(0xFFF5F5F5), keywords: ['classic', 'literary fiction', 'literature']),
  _CuratedGenre(id: 'poetry', label: 'Poesia', emoji: '🪶', bg: Color(0xFFFFF0F3), keywords: ['poetry', 'poems', 'verse']),
  _CuratedGenre(id: 'philosophy', label: 'Filosofia', emoji: '🧠', bg: Color(0xFFF3E5F5), keywords: ['philosophy', 'philosophical']),
  _CuratedGenre(id: 'biography', label: 'Biografia', emoji: '👤', bg: Color(0xFFE0F7FA), keywords: ['biography', 'autobiography', 'memoir']),
  _CuratedGenre(id: 'young-adult', label: 'Jovem Adulto', emoji: '⭐', bg: Color(0xFFF9FBE7), keywords: ['young adult', 'teen fiction', 'juvenile']),
  _CuratedGenre(id: 'comics', label: 'HQ / Mangá', emoji: '🎨', bg: Color(0xFFE8EAF6), keywords: ['comics', 'graphic novel', 'manga']),
  _CuratedGenre(id: 'humor', label: 'Humor', emoji: '😄', bg: Color(0xFFE0F2F1), keywords: ['humor', 'comedy', 'humorous', 'satire']),
];

/// Onboarding em duas etapas:
///  1. seleção de gêneros (mínimo 3)
///  2. busca + seleção de livros (opcional, melhora as recomendações)
///
/// Ambas as preferências são enviadas juntas no mesmo POST /preferences.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

enum _Step { genres, books }

class _OnboardingScreenState extends State<OnboardingScreen> {
  final Set<String> _selectedGenres = {};
  // Mantém o Book completo (não só o id) para exibir os chips dos selecionados.
  final Map<int, Book> _selectedBooks = {};

  _Step _step = _Step.genres;

  static const _minGenres = 3;
  static const _maxBooks = 50;

  @override
  void initState() {
    super.initState();
    context.read<PreferencesBloc>().add(PreferencesGenresLoadRequested());
  }

  void _toggleGenre(String original) {
    setState(() {
      if (_selectedGenres.contains(original)) {
        _selectedGenres.remove(original);
      } else {
        _selectedGenres.add(original);
      }
    });
  }

  void _toggleBook(Book book) {
    setState(() {
      if (_selectedBooks.containsKey(book.id)) {
        _selectedBooks.remove(book.id);
      } else if (_selectedBooks.length < _maxBooks) {
        _selectedBooks[book.id] = book;
      } else {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            const SnackBar(
              content: Text('Você já selecionou o máximo de $_maxBooks livros.'),
            ),
          );
      }
    });
  }

  int? _currentUserId() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) return authState.session.user.id;
    return null;
  }

  void _goToBooks() => setState(() => _step = _Step.books);
  void _backToGenres() => setState(() => _step = _Step.genres);

  void _finish() {
    final userId = _currentUserId();
    if (userId == null) return;
    context.read<PreferencesBloc>().add(
          PreferencesSubmitted(
            userId,
            _selectedGenres.toList(),
            _selectedBooks.keys.toList(),
          ),
        );
  }

  void _skip() {
    final userId = _currentUserId();
    if (userId == null) return;
    context.read<PreferencesBloc>().add(PreferencesSkipped(userId));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PreferencesBloc, PreferencesState>(
      listener: (context, state) {
        if (state.status == PreferencesStatus.done) {
          context.go('/feed');
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            transitionBuilder: (child, animation) => FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.06, 0),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            ),
            child: _step == _Step.genres
                ? _GenresStep(
                    key: const ValueKey(_Step.genres),
                    selectedGenres: _selectedGenres,
                    onToggle: _toggleGenre,
                    onContinue: _goToBooks,
                    onSkip: _skip,
                    minGenres: _minGenres,
                  )
                : _BooksStep(
                    key: const ValueKey(_Step.books),
                    selectedBooks: _selectedBooks,
                    onToggle: _toggleBook,
                    onFinish: _finish,
                    onBack: _backToGenres,
                    maxBooks: _maxBooks,
                  ),
          ),
        ),
      ),
    );
  }
}

// ── Etapa 1 · Gêneros ─────────────────────────────────────────────────────────

class _GenresStep extends StatelessWidget {
  final Set<String> selectedGenres;
  final void Function(String) onToggle;
  final VoidCallback onContinue;
  final VoidCallback onSkip;
  final int minGenres;

  const _GenresStep({
    super.key,
    required this.selectedGenres,
    required this.onToggle,
    required this.onContinue,
    required this.onSkip,
    required this.minGenres,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canContinue = selectedGenres.length >= minGenres;
    final remaining = (minGenres - selectedGenres.length).clamp(0, minGenres);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Passo 1 de 2',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Quais gêneros você mais curte?',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Escolha pelo menos $minGenres para personalizarmos suas recomendações.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: BlocBuilder<PreferencesBloc, PreferencesState>(
            buildWhen: (p, c) => p.status != c.status || p.genres != c.genres,
            builder: (context, state) => _buildBody(context, state),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      selectedGenres.isEmpty
                          ? 'Nenhum selecionado'
                          : '${selectedGenres.length} selecionado${selectedGenres.length != 1 ? 's' : ''}${remaining > 0 ? ' · selecione mais $remaining' : ''}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: remaining > 0
                            ? theme.colorScheme.primary
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 44),
                    ),
                    onPressed: canContinue ? onContinue : null,
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: const Text('Continuar'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: onSkip,
                  child: const Text('Pular por agora'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBody(BuildContext context, PreferencesState state) {
    if (state.status == PreferencesStatus.loadingGenres) {
      return const Center(child: CircularProgressIndicator());
    }
    // Always show curated genres; backend genres are only needed for keyword matching.
    // On error, the grid falls back to curated IDs as values.
    return _GenreGrid(
      genres: state.genres,
      selected: selectedGenres,
      onToggle: onToggle,
    );
  }
}

class _GenreGrid extends StatelessWidget {
  final List<Genre> genres;
  final Set<String> selected;
  final void Function(String) onToggle;

  const _GenreGrid({
    required this.genres,
    required this.selected,
    required this.onToggle,
  });

  String _matchBackend(List<String> keywords) {
    for (final genre in genres) {
      final lower = genre.original.toLowerCase();
      for (final kw in keywords) {
        if (lower.contains(kw)) return genre.original;
      }
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.55,
      ),
      itemCount: _kCuratedGenres.length,
      itemBuilder: (context, index) {
        final curated = _kCuratedGenres[index];
        final backendOriginal = _matchBackend(curated.keywords);
        final effectiveValue = backendOriginal.isNotEmpty ? backendOriginal : curated.id;
        return GenreCard(
          emoji: curated.emoji,
          label: curated.label,
          backgroundColor: curated.bg,
          isSelected: selected.contains(effectiveValue),
          onTap: () => onToggle(effectiveValue),
        );
      },
    );
  }
}

// ── Etapa 2 · Livros ──────────────────────────────────────────────────────────

class _BooksStep extends StatefulWidget {
  final Map<int, Book> selectedBooks;
  final void Function(Book) onToggle;
  final VoidCallback onFinish;
  final VoidCallback onBack;
  final int maxBooks;

  const _BooksStep({
    super.key,
    required this.selectedBooks,
    required this.onToggle,
    required this.onFinish,
    required this.onBack,
    required this.maxBooks,
  });

  @override
  State<_BooksStep> createState() => _BooksStepState();
}

class _BooksStepState extends State<_BooksStep> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onQueryChanged(String query) {
    if (query.trim().isEmpty) {
      context.read<BookBloc>().add(BookSearchCleared());
    } else {
      context.read<BookBloc>().add(BookSearchRequested(query));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selectedCount = widget.selectedBooks.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: widget.onBack,
                    icon: const Icon(Icons.arrow_back),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Passo 2 de 2',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Quais livros você já amou?',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Busque e selecione livros que marcaram você. Quanto mais, melhores ficam suas recomendações.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _controller,
                focusNode: _focusNode,
                onChanged: _onQueryChanged,
                decoration: InputDecoration(
                  hintText: 'Título, autor ou ISBN...',
                  prefixIcon: Icon(
                    Icons.search,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  suffixIcon: ValueListenableBuilder<TextEditingValue>(
                    valueListenable: _controller,
                    builder: (context, value, child) {
                      if (value.text.isEmpty) return const SizedBox.shrink();
                      return IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () {
                          _controller.clear();
                          context.read<BookBloc>().add(BookSearchCleared());
                          _focusNode.requestFocus();
                        },
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
        if (widget.selectedBooks.isNotEmpty)
          _SelectedBooksBar(
            books: widget.selectedBooks.values.toList(),
            onRemove: widget.onToggle,
          ),
        const SizedBox(height: 4),
        Expanded(
          child: BlocBuilder<BookBloc, BookState>(
            builder: (context, state) => _buildResults(context, state, theme),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
          child: BlocBuilder<PreferencesBloc, PreferencesState>(
            buildWhen: (p, c) => p.status != c.status,
            builder: (context, state) {
              final isSubmitting =
                  state.status == PreferencesStatus.submitting;
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      selectedCount == 0
                          ? 'Nenhum livro selecionado (opcional)'
                          : '$selectedCount livro${selectedCount != 1 ? 's' : ''} selecionado${selectedCount != 1 ? 's' : ''}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 44),
                    ),
                    onPressed: isSubmitting ? null : widget.onFinish,
                    icon: isSubmitting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check, size: 18),
                    label: const Text('Começar a explorar'),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildResults(
    BuildContext context,
    BookState state,
    ThemeData theme,
  ) {
    if (state is BookLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state is BookError) {
      return _centeredMessage(
        theme,
        icon: Icons.wifi_off_rounded,
        message: state.message,
      );
    }
    if (state is BookEmpty) {
      return _centeredMessage(
        theme,
        icon: Icons.search_off,
        message: 'Nenhum livro encontrado para "${state.query}".',
      );
    }
    if (state is BookLoaded) {
      return ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        itemCount: state.books.length,
        itemBuilder: (context, index) {
          final book = state.books[index];
          return BookPickCard(
            book: book,
            isSelected: widget.selectedBooks.containsKey(book.id),
            onTap: () => widget.onToggle(book),
          );
        },
      );
    }
    // BookInitial
    return _centeredMessage(
      theme,
      icon: Icons.menu_book_outlined,
      message: 'Busque livros que você já gostou\npara turbinar suas recomendações.',
    );
  }

  Widget _centeredMessage(
    ThemeData theme, {
    required IconData icon,
    required String message,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 56,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Faixa horizontal com os livros já selecionados, cada um removível.
class _SelectedBooksBar extends StatelessWidget {
  final List<Book> books;
  final void Function(Book) onRemove;

  const _SelectedBooksBar({required this.books, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Wrap(
        spacing: 8,
        runSpacing: 4,
        children: books
            .map(
              (book) => InputChip(
                label: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 160),
                  child: Text(
                    book.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                onDeleted: () => onRemove(book),
              ),
            )
            .toList(),
      ),
    );
  }
}