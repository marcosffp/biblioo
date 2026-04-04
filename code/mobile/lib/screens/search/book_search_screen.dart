import 'package:biblioo/features/book/bloc/book_bloc.dart';
import 'package:biblioo/features/book/bloc/book_event.dart';
import 'package:biblioo/features/book/bloc/book_state.dart';
import 'package:biblioo/screens/search/widgets/book_result_card.dart';
import 'package:biblioo/screens/search/widgets/book_shimmer_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Tela de busca de livros — monta o contexto do BookBloc.
/// Rota: /search (fora do shell, sem bottom nav).
class BookSearchScreen extends StatelessWidget {
  const BookSearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: context.read<BookBloc>(),
      child: const _BookSearchView(),
    );
  }
}

class _BookSearchView extends StatefulWidget {
  const _BookSearchView();

  @override
  State<_BookSearchView> createState() => _BookSearchViewState();
}

class _BookSearchViewState extends State<_BookSearchView> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    // Autofocus no campo de busca ao entrar na tela
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── SliverAppBar com campo de busca ──────────────
          SliverAppBar(
            floating: true,
            snap: true,
            title: const Text('Buscar Livros'),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(64),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  onChanged: (value) {
                    if (value.trim().isEmpty) {
                      context.read<BookBloc>().add(BookSearchCleared());
                    } else {
                      context
                          .read<BookBloc>()
                          .add(BookSearchRequested(value));
                    }
                  },
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
                            context
                                .read<BookBloc>()
                                .add(BookSearchCleared());
                            _focusNode.requestFocus();
                          },
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Conteúdo dinâmico conforme estado ───────────
          BlocBuilder<BookBloc, BookState>(
            builder: (context, state) {
              if (state is BookLoading) {
                return _buildShimmer();
              }
              if (state is BookLoaded) {
                return _buildResults(state);
              }
              if (state is BookEmpty) {
                return _buildEmpty(theme, state.query);
              }
              if (state is BookError) {
                return _buildError(theme, state.message);
              }
              // BookInitial
              return _buildInitial(theme);
            },
          ),
        ],
      ),
    );
  }

  // ── Estado: inicial ─────────────────────────────────────
  Widget _buildInitial(ThemeData theme) {
    return SliverFillRemaining(
      hasScrollBody: false,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search,
              size: 64,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'Busque por título, autor ou ISBN',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Estado: loading (shimmer) ──────────────────────────
  Widget _buildShimmer() {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => const BookShimmerCard(),
          childCount: 4,
        ),
      ),
    );
  }

  // ── Estado: resultados ────────────────────────────────
  Widget _buildResults(BookLoaded state) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => BookResultCard(
            book: state.books[index],
            onTap: () {
              // TODO: navegar para detalhes do livro (feature futura)
            },
          ),
          childCount: state.books.length,
        ),
      ),
    );
  }

  // ── Estado: vazio ──────────────────────────────────────
  Widget _buildEmpty(ThemeData theme, String query) {
    return SliverFillRemaining(
      hasScrollBody: false,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhum livro encontrado',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Tente buscar por "$query" com outros termos',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // ── Estado: erro ───────────────────────────────────────
  Widget _buildError(ThemeData theme, String message) {
    return SliverFillRemaining(
      hasScrollBody: false,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.wifi_off_rounded,
              size: 64,
              color: theme.colorScheme.error.withValues(alpha: 0.6),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () {
                context
                    .read<BookBloc>()
                    .add(BookSearchRequested(_controller.text));
              },
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Tentar novamente'),
              style: FilledButton.styleFrom(
                minimumSize: const Size(0, 44),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
