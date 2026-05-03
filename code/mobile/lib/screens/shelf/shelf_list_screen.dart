import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/features/shelf/bloc/shelf_state.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_event.dart';
import 'package:biblioo/features/collection/bloc/collection_state.dart';
import 'package:biblioo/features/collection/domain/collection.dart';
import 'package:biblioo/screens/collection/widgets/collection_card.dart';
import 'package:biblioo/screens/collection/widgets/collection_shimmer.dart';
import 'package:biblioo/screens/collection/widgets/create_collection_sheet.dart';
import 'package:biblioo/screens/collection/collection_detail_screen.dart';
import 'package:biblioo/screens/search/book_search_screen.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'widgets/shelf_card.dart';
import 'widgets/shelf_item_card.dart';
import 'widgets/shelf_shimmer.dart';
import 'widgets/create_shelf_sheet.dart';

/// Tela principal de estantes — Tab 2 do bottom nav.
/// Segue wireframe: header com total + FAB, lista de estantes com cover preview.
class ShelfListScreen extends StatefulWidget {
  const ShelfListScreen({super.key});

  @override
  State<ShelfListScreen> createState() => _ShelfListScreenState();
}

class _ShelfListScreenState extends State<ShelfListScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ShelfBloc>().add(ShelfLoadRequested());
    context.read<CollectionBloc>().add(CollectionLoadRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<ShelfBloc, ShelfState>(
        listener: (context, state) {
          if (state is ShelfMutationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                behavior: SnackBarBehavior.floating,
                backgroundColor: Theme.of(context).colorScheme.primary,
              ),
            );
            // Recarrega a lista após uma mutação
            context.read<ShelfBloc>().add(ShelfLoadRequested());
          }
          if (state is ShelfError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                behavior: SnackBarBehavior.floating,
                backgroundColor: Theme.of(context).colorScheme.error,
              ),
            );
          }
        },
        buildWhen: (previous, current) =>
            current is ShelfLoading ||
            current is ShelfLoaded ||
            current is ShelfError,
        builder: (context, state) {
          return CustomScrollView(
            slivers: [
              _buildAppBar(context, state),
              if (state is ShelfLoading) _buildShimmer(),
              if (state is ShelfLoaded) _buildContent(context, state.shelves),
              if (state is ShelfError) _buildError(context, state.message),
              
              // ── Seção "Minhas Coleções" ──
              _buildCollectionsSection(context),

              // Padding inferior para o bottom nav não cobrir conteúdo
              const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
            ],
          );
        },
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          FloatingActionButton.small(
            heroTag: 'collection_create_fab',
            onPressed: () => _showCreateCollectionSheet(context),
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            foregroundColor: Theme.of(context).colorScheme.onPrimaryContainer,
            tooltip: 'Nova coleção',
            child: const Icon(Icons.bookmark_add_outlined),
          ),
          const SizedBox(height: 8),
          FloatingActionButton(
            heroTag: 'shelf_create_fab',
            onPressed: () => _showCreateSheet(context),
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            tooltip: 'Nova estante',
            child: const Icon(Icons.library_add),
          ),
        ],
      ),
    );
  }

  Widget _buildCollectionsSection(BuildContext context) {
    return BlocConsumer<CollectionBloc, CollectionState>(
      listener: (context, state) {
        if (state is CollectionMutationSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              behavior: SnackBarBehavior.floating,
              backgroundColor: Theme.of(context).colorScheme.primary,
            ),
          );
          context.read<CollectionBloc>().add(CollectionLoadRequested());
        }
        if (state is CollectionError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              behavior: SnackBarBehavior.floating,
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
      },
      buildWhen: (previous, current) =>
          current is CollectionLoading || current is CollectionLoaded || current is CollectionError,
      builder: (context, state) {
        return SliverMainAxisGroup(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              sliver: SliverToBoxAdapter(
                child: Text(
                  'Minhas Coleções',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            if (state is CollectionLoading)
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => const CollectionShimmer(),
                    childCount: 2,
                  ),
                ),
              ),
            if (state is CollectionLoaded)
              if (state.collections.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Text(
                      'Nenhuma coleção ainda.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final collection = state.collections[index];
                        return CollectionCard(
                          collection: collection,
                          onTap: () {
                            Navigator.of(context).push(MaterialPageRoute(
                              builder: (_) => MultiBlocProvider(
                                providers: [
                                  BlocProvider.value(value: context.read<ShelfBloc>()),
                                  BlocProvider.value(value: context.read<CollectionBloc>()),
                                ],
                                child: CollectionDetailScreen(collection: collection),
                              ),
                            ));
                          },
                          onEdit: () => _showEditCollectionSheet(context, collection),
                          onDelete: () => _confirmCollectionDelete(context, collection),
                        );
                      },
                      childCount: state.collections.length,
                    ),
                  ),
                ),
          ],
        );
      },
    );
  }

  Widget _buildAppBar(BuildContext context, ShelfState state) {
    final theme = Theme.of(context);
    int totalBooks = 0;
    if (state is ShelfLoaded) {
      for (final shelf in state.shelves) {
        totalBooks += shelf.itemCount;
      }
    }

    return SliverAppBar(
      floating: true,
      snap: true,
      expandedHeight: 100,
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
        title: FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Minha Estante',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              if (state is ShelfLoaded)
                Text(
                  '$totalBooks livros no total',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => const ShelfShimmer(),
          childCount: 4,
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, List<Shelf> shelves) {
    if (shelves.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.library_books_outlined,
                size: 64,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(height: 16),
              Text(
                'Nenhuma estante ainda.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Crie sua primeira estante tocando no +',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => ShelfCard(
            shelf: shelves[index],
            onTap: () => _navigateToDetail(context, shelves[index]),
            onEdit: () => _showEditSheet(context, shelves[index]),
            onDelete: () => _confirmDelete(context, shelves[index]),
          ),
          childCount: shelves.length,
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, String message) {
    return SliverFillRemaining(
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 12),
            Text(message),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: () =>
                  context.read<ShelfBloc>().add(ShelfLoadRequested()),
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToDetail(BuildContext context, Shelf shelf) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => BlocProvider.value(
          value: context.read<ShelfBloc>(),
          child: _ShelfDetailPage(shelf: shelf),
        ),
      ),
    );
  }

  void _showCreateSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<ShelfBloc>(),
        child: const CreateShelfSheet(),
      ),
    );
  }

  void _showEditSheet(BuildContext context, Shelf shelf) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<ShelfBloc>(),
        child: CreateShelfSheet(editingShelf: shelf),
      ),
    );
  }

  void _confirmDelete(BuildContext context, Shelf shelf) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Excluir estante?'),
        content: Text(
          'A estante "${shelf.name}" e todos os itens serão removidos permanentemente.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<ShelfBloc>().add(ShelfDeleteRequested(shelf.id));
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
  }

  void _showCreateCollectionSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<CollectionBloc>(),
        child: const CreateCollectionSheet(),
      ),
    );
  }

  void _showEditCollectionSheet(BuildContext context, Collection collection) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<CollectionBloc>(),
        child: CreateCollectionSheet(editingCollection: collection),
      ),
    );
  }

  void _confirmCollectionDelete(BuildContext context, Collection collection) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Excluir coleção?'),
        content: Text(
          'A coleção "${collection.name}" será removida permanentemente. As estantes e livros dentro dela NÃO serão apagados.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<CollectionBloc>().add(CollectionDeleteRequested(collection.id));
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
  }
} // end _ShelfListScreenState

/// Página de detalhe — navegação empilhada sobre a tab Shell.
/// Mostra os itens/livros dentro de uma estante específica.
class _ShelfDetailPage extends StatelessWidget {
  final Shelf shelf;
  const _ShelfDetailPage({required this.shelf});

  @override
  Widget build(BuildContext context) {
    // As telas de detalhe serão implementadas em shelf_detail_screen.dart
    // Por enquanto, redireciona para o widget dedicado
    return ShelfDetailScreenContent(shelf: shelf);
  }
}

/// Exportado separadamente para uso pelo detalhe.
class ShelfDetailScreenContent extends StatefulWidget {
  final Shelf shelf;
  const ShelfDetailScreenContent({super.key, required this.shelf});

  @override
  State<ShelfDetailScreenContent> createState() =>
      _ShelfDetailScreenContentState();
}

class _ShelfDetailScreenContentState extends State<ShelfDetailScreenContent> {
  @override
  void initState() {
    super.initState();
    context.read<ShelfBloc>().add(ShelfItemsLoadRequested(widget.shelf.id));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.shelf.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {}, // TODO: search within shelf
          ),
        ],
      ),
      body: BlocConsumer<ShelfBloc, ShelfState>(
        listener: (context, state) {
          if (state is ShelfMutationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                behavior: SnackBarBehavior.floating,
                backgroundColor: theme.colorScheme.primary,
              ),
            );
            // Recarrega itens após mutação (status, add, remove, etc.)
            context
                .read<ShelfBloc>()
                .add(ShelfItemsLoadRequested(widget.shelf.id));
          }
          if (state is ShelfProgressUpdateSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Progresso atualizado!'),
                behavior: SnackBarBehavior.floating,
                backgroundColor: theme.colorScheme.primary,
              ),
            );
            // Sem reload: o bloc já atualizou a lista em memória com os dados
            // completos (currentPage/totalPages) vindos do servidor.
          }
          if (state is ShelfError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                behavior: SnackBarBehavior.floating,
                backgroundColor: theme.colorScheme.error,
              ),
            );
          }
        },
        buildWhen: (previous, current) =>
            current is ShelfItemsLoading ||
            current is ShelfItemsLoaded ||
            current is ShelfItemsError,
        builder: (context, state) {
          if (state is ShelfItemsLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ShelfItemsLoaded) {
            final items = state.items;
            if (items.isEmpty) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.menu_book_outlined,
                      size: 64,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Nenhum livro nesta estante.',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Busque um livro e adicione aqui!',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return ShelfItemCard(
                  item: item,
                  shelfId: widget.shelf.id,
                );
              },
            );
          }

          if (state is ShelfItemsError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 48,
                    color: theme.colorScheme.error,
                  ),
                  const SizedBox(height: 12),
                  Text(state.message),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () => context
                        .read<ShelfBloc>()
                        .add(ShelfItemsLoadRequested(widget.shelf.id)),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Tentar novamente'),
                  ),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _pickBookAndAddToShelf,
        icon: const Icon(Icons.add),
        label: const Text('Adicionar Livro'),
      ),
    );
  }

  Future<void> _pickBookAndAddToShelf() async {
    final selectedBook = await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const BookSearchScreen(isPicker: true)),
    );

    if (selectedBook != null && selectedBook is Book && mounted) {
      context.read<ShelfBloc>().add(ShelfItemAddRequested(
        shelfId: widget.shelf.id,
        bookId: selectedBook.id,
        initialStatus: ReadingStatus.wantToRead,
      ));
    }
  }
}
