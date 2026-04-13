import 'package:biblioo/features/book/bloc/book_bloc.dart';
import 'package:biblioo/features/book/bloc/book_event.dart';
import 'package:biblioo/features/book/bloc/book_state.dart';
import 'package:biblioo/features/user/bloc/user_search_bloc.dart';
import 'package:biblioo/features/user/bloc/user_search_event.dart';
import 'package:biblioo/features/user/bloc/user_search_state.dart';
import 'package:biblioo/screens/search/widgets/book_result_card.dart';
import 'package:biblioo/screens/search/widgets/book_shimmer_card.dart';
import 'package:biblioo/screens/search/widgets/user_result_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

/// Busca multi-tipo sem quebrar o fluxo existente de livros.
/// Rota: /search (fora do shell, sem bottom nav).
class BookSearchScreen extends StatelessWidget {
  final bool isPicker;
  const BookSearchScreen({super.key, this.isPicker = false});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: context.read<BookBloc>()),
        BlocProvider.value(value: context.read<UserSearchBloc>()),
      ],
      child: _BookSearchView(isPicker: isPicker),
    );
  }
}

enum _SearchTab { books, users }

class _BookSearchView extends StatefulWidget {
  final bool isPicker;
  const _BookSearchView({required this.isPicker});

  @override
  State<_BookSearchView> createState() => _BookSearchViewState();
}

class _BookSearchViewState extends State<_BookSearchView> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  _SearchTab _activeTab = _SearchTab.books;

  @override
  void initState() {
    super.initState();
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

  void _triggerSearch() {
    final query = _controller.text;
    if (_activeTab == _SearchTab.books) {
      if (query.trim().isEmpty) {
        context.read<BookBloc>().add(BookSearchCleared());
      } else {
        context.read<BookBloc>().add(BookSearchRequested(query));
      }
      return;
    }

    if (query.trim().isEmpty) {
      context.read<UserSearchBloc>().add(UserSearchCleared());
    } else {
      context.read<UserSearchBloc>().add(UserSearchRequested(query));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            snap: true,
            title: const Text('Buscar'),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(116),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(
                  children: [
                    TextField(
                      controller: _controller,
                      focusNode: _focusNode,
                      onChanged: (_) => _triggerSearch(),
                      decoration: InputDecoration(
                        hintText: _activeTab == _SearchTab.books
                            ? 'Titulo, autor ou ISBN...'
                            : 'Nome de usuario...',
                        prefixIcon: Icon(
                          Icons.search,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        suffixIcon: ValueListenableBuilder<TextEditingValue>(
                          valueListenable: _controller,
                          builder: (context, value, child) {
                            if (value.text.isEmpty) {
                              return const SizedBox.shrink();
                            }
                            return IconButton(
                              icon: const Icon(Icons.close, size: 20),
                              onPressed: () {
                                _controller.clear();
                                context.read<BookBloc>().add(
                                  BookSearchCleared(),
                                );
                                context.read<UserSearchBloc>().add(
                                  UserSearchCleared(),
                                );
                                _focusNode.requestFocus();
                              },
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Wrap(
                        spacing: 8,
                        children: [
                          ChoiceChip(
                            label: const Text('Livros'),
                            selected: _activeTab == _SearchTab.books,
                            onSelected: (_) {
                              setState(() => _activeTab = _SearchTab.books);
                              _triggerSearch();
                            },
                          ),
                          ChoiceChip(
                            label: const Text('Usuarios'),
                            selected: _activeTab == _SearchTab.users,
                            onSelected: (_) {
                              setState(() => _activeTab = _SearchTab.users);
                              _triggerSearch();
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_activeTab == _SearchTab.books)
            BlocBuilder<BookBloc, BookState>(
              builder: (context, state) {
                if (state is BookLoading) return _buildShimmer();
                if (state is BookLoaded) return _buildBookResults(state);
                if (state is BookEmpty) {
                  return _buildEmpty(theme, state.query, 'livro');
                }
                if (state is BookError) {
                  return _buildError(theme, state.message);
                }
                return _buildInitial(theme, 'livros');
              },
            )
          else
            BlocBuilder<UserSearchBloc, UserSearchState>(
              builder: (context, state) {
                if (state is UserSearchLoading) return _buildShimmer();
                if (state is UserSearchLoaded) {
                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => UserResultCard(
                          user: state.users[index],
                          onTap: () => context.push(
                            '/user/${state.users[index].username}',
                          ),
                        ),
                        childCount: state.users.length,
                      ),
                    ),
                  );
                }
                if (state is UserSearchEmpty) {
                  return _buildEmpty(theme, state.query, 'usuario');
                }
                if (state is UserSearchError) {
                  return _buildError(theme, state.message);
                }
                return _buildInitial(theme, 'usuarios');
              },
            ),
        ],
      ),
    );
  }

  Widget _buildInitial(ThemeData theme, String label) {
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
              'Busque por $label',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

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

  Widget _buildBookResults(BookLoaded state) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => BookResultCard(
            book: state.books[index],
            onTap: () {
              if (widget.isPicker) {
                Navigator.of(context).pop(state.books[index]);
              } else {
                // TODO: navegar para detalhes do livro (feature futura)
              }
            },
          ),
          childCount: state.books.length,
        ),
      ),
    );
  }

  Widget _buildEmpty(ThemeData theme, String query, String label) {
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
              'Nenhum $label encontrado',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Tente buscar por "$query" com outros termos',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant.withValues(
                  alpha: 0.7,
                ),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

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
              onPressed: _triggerSearch,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Tentar novamente'),
              style: FilledButton.styleFrom(minimumSize: const Size(0, 44)),
            ),
          ],
        ),
      ),
    );
  }
}
