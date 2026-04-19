import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/book/bloc/book_bloc.dart';
import 'package:biblioo/features/book/bloc/book_event.dart';
import 'package:biblioo/features/book/bloc/book_state.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/community/bloc/community_bloc.dart';
import 'package:biblioo/features/community/bloc/community_event.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CreateCommunitySheet extends StatefulWidget {
  const CreateCommunitySheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => MultiBlocProvider(
        providers: [
          BlocProvider.value(value: context.read<CommunityBloc>()),
          BlocProvider(create: (_) => BookBloc(Injector.instance.bookRepo)),
        ],
        child: const CreateCommunitySheet(),
      ),
    );
  }

  @override
  State<CreateCommunitySheet> createState() => _CreateCommunitySheetState();
}

class _CreateCommunitySheetState extends State<CreateCommunitySheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _bookSearchController = TextEditingController();

  Book? _selectedBook;
  CommunityVisibility _visibility = CommunityVisibility.public;

  @override
  void dispose() {
    _nameController.dispose();
    _bookSearchController.dispose();
    super.dispose();
  }

  void _onBookSearchChanged(String query) {
    if (query.isEmpty) {
      context.read<BookBloc>().add(BookSearchCleared());
    } else {
      context.read<BookBloc>().add(BookSearchRequested(query));
    }
  }

  void _selectBook(Book book) {
    setState(() {
      _selectedBook = book;
      _bookSearchController.clear();
    });
    context.read<BookBloc>().add(BookSearchCleared());
  }

  void _clearBook() {
    setState(() => _selectedBook = null);
    context.read<BookBloc>().add(BookSearchCleared());
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    context.read<CommunityBloc>().add(CommunityCreateRequested(
          name: _nameController.text.trim(),
          bookId: _selectedBook!.id,
          bookTitle: _selectedBook!.title,
          bookAuthor: _selectedBook!.authorsText,
          bookCoverUrl: _selectedBook!.coverUrl,
          visibility: _visibility,
        ));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.onSurfaceVariant
                          .withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                Text(
                  'Nova Comunidade',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 20),

                TextFormField(
                  controller: _nameController,
                  autofocus: true,
                  maxLength: 100,
                  decoration: const InputDecoration(
                    labelText: 'Nome da comunidade',
                    hintText: 'Ex.: Clube dos Clássicos',
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'O nome é obrigatório.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 4),

                Text(
                  'Livro *',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),

                if (_selectedBook != null)
                  _SelectedBookTile(
                    book: _selectedBook!,
                    onClear: _clearBook,
                  )
                else
                  _BookSearchSection(
                    controller: _bookSearchController,
                    onChanged: _onBookSearchChanged,
                    onSelect: _selectBook,
                  ),

                const SizedBox(height: 20),

                Text(
                  'Visibilidade',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),

                SegmentedButton<CommunityVisibility>(
                  segments: const [
                    ButtonSegment(
                      value: CommunityVisibility.public,
                      label: Text('Público'),
                      icon: Icon(Icons.language_rounded),
                    ),
                    ButtonSegment(
                      value: CommunityVisibility.private,
                      label: Text('Privado'),
                      icon: Icon(Icons.lock_rounded),
                    ),
                  ],
                  selected: {_visibility},
                  onSelectionChanged: (selection) {
                    setState(() => _visibility = selection.first);
                  },
                  style: ButtonStyle(
                    minimumSize: WidgetStateProperty.all(
                      const Size(0, 44),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _selectedBook != null ? _submit : null,
                    child: const Text('Criar comunidade'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SelectedBookTile extends StatelessWidget {
  final Book book;
  final VoidCallback onClear;

  const _SelectedBookTile({required this.book, required this.onClear});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: theme.inputDecorationTheme.fillColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.primary,
          width: 1.5,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        leading: book.coverUrl != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: Image.network(
                  book.coverUrl!,
                  width: 36,
                  height: 52,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => const _BookIconPlaceholder(),
                ),
              )
            : const _BookIconPlaceholder(),
        title: Text(
          book.title,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          book.authorsText,
          style: theme.textTheme.bodySmall,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: IconButton(
          icon: const Icon(Icons.close),
          onPressed: onClear,
          tooltip: 'Remover livro',
        ),
      ),
    );
  }
}

class _BookSearchSection extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final ValueChanged<Book> onSelect;

  const _BookSearchSection({
    required this.controller,
    required this.onChanged,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          onChanged: onChanged,
          decoration: const InputDecoration(
            hintText: 'Buscar livro no catálogo...',
            prefixIcon: Icon(Icons.search_rounded),
          ),
        ),
        BlocBuilder<BookBloc, BookState>(
          builder: (context, state) {
            if (state is BookLoading) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            if (state is BookLoaded) {
              final results = state.books.take(5).toList();
              return Column(
                children: results
                    .map((book) => _BookResultTile(
                          book: book,
                          onTap: () => onSelect(book),
                        ))
                    .toList(),
              );
            }
            if (state is BookEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(
                  'Nenhum livro encontrado para "${state.query}".',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ],
    );
  }
}

class _BookResultTile extends StatelessWidget {
  final Book book;
  final VoidCallback onTap;

  const _BookResultTile({required this.book, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 4),
      leading: book.coverUrl != null
          ? ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Image.network(
                book.coverUrl!,
                width: 32,
                height: 46,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => const _BookIconPlaceholder(),
              ),
            )
          : const _BookIconPlaceholder(),
      title: Text(
        book.title,
        style: Theme.of(context).textTheme.bodyMedium,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        book.authorsText,
        style: Theme.of(context).textTheme.bodySmall,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      onTap: onTap,
    );
  }
}

class _BookIconPlaceholder extends StatelessWidget {
  const _BookIconPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 52,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Icon(
        Icons.menu_book_rounded,
        size: 20,
        color: Theme.of(context).colorScheme.onSurfaceVariant,
      ),
    );
  }
}
