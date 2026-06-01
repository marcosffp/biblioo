import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_event.dart';
import 'package:biblioo/features/collection/bloc/collection_state.dart';
import 'package:biblioo/features/collection/domain/collection.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_state.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/screens/collection/widgets/collection_statistics_section.dart';
import 'package:biblioo/screens/shelf/widgets/shelf_card.dart';
import 'package:biblioo/screens/shelf/widgets/create_shelf_sheet.dart';
import 'package:biblioo/shared/widgets/bibi_fab.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:biblioo/screens/shelf/shelf_list_screen.dart';

class CollectionDetailScreen extends StatelessWidget {
  final Collection collection;
  const CollectionDetailScreen({super.key, required this.collection});

  @override
  Widget build(BuildContext context) {
    return _CollectionDetailView(collection: collection);
  }
}

class _CollectionDetailView extends StatefulWidget {
  final Collection collection;
  const _CollectionDetailView({required this.collection});

  @override
  State<_CollectionDetailView> createState() => _CollectionDetailViewState();
}

class _CollectionDetailViewState extends State<_CollectionDetailView> {
  @override
  void initState() {
    super.initState();
    final shelfBloc = context.read<ShelfBloc>();
    if (shelfBloc.state is! ShelfLoaded) {
      shelfBloc.add(ShelfLoadRequested());
    }
    final collectionBloc = context.read<CollectionBloc>();
    if (collectionBloc.state is! CollectionStatisticsLoaded) {
      collectionBloc.add(CollectionStatisticsRequested(widget.collection.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final collection = widget.collection;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(collection.name),
        actions: [
          if (collection.description?.isNotEmpty ?? false)
            IconButton(
              icon: const Icon(Icons.info_outline),
              onPressed: () => showDialog(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Descrição'),
                  content: Text(collection.description!),
                  actions: [
                    TextButton(
                      child: const Text('Fechar'),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
      body: MultiBlocListener(
        listeners: [
          BlocListener<CollectionBloc, CollectionState>(
            listenWhen: (_, current) => current is CollectionMutationSuccess,
            listener: (context, _) {
              context.read<CollectionBloc>().add(
                CollectionStatisticsRequested(widget.collection.id),
              );
            },
          ),
          BlocListener<ShelfBloc, ShelfState>(
            listenWhen: (_, current) => current is ShelfMutationSuccess,
            listener: (context, _) {
              context.read<CollectionBloc>().add(
                CollectionStatisticsRequested(widget.collection.id),
              );
            },
          ),
        ],
        child: CustomScrollView(
          slivers: [
            // ── Seção de estatísticas ────────────────────────────────────────
            SliverToBoxAdapter(
              child: BlocBuilder<CollectionBloc, CollectionState>(
                buildWhen: (previous, current) =>
                    current is CollectionStatisticsLoading ||
                    current is CollectionStatisticsLoaded ||
                    current is CollectionStatisticsError,
                builder: (context, state) {
                  if (state is CollectionStatisticsLoaded) {
                    return CollectionStatisticsSection(
                      statistics: state.statistics,
                    );
                  }
                  if (state is CollectionStatisticsError) {
                    return Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        state.message,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.error,
                        ),
                      ),
                    );
                  }
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator()),
                  );
                },
              ),
            ),

            // ── Cabeçalho da lista de estantes ───────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: Row(
                  children: [
                    Icon(
                      Icons.collections_bookmark_outlined,
                      size: 18,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Estantes',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Lista de estantes ─────────────────────────────────────────────
            BlocBuilder<ShelfBloc, ShelfState>(
              buildWhen: (previous, current) =>
                  current is ShelfLoaded ||
                  current is ShelfLoading ||
                  current is ShelfError,
              builder: (context, state) {
                if (state is ShelfLoaded) {
                  final collectionShelfIds = collection.shelfPreviews
                      .map((p) => p.id)
                      .toSet();
                  final shelvesInCollection = state.shelves
                      .where((s) => collectionShelfIds.contains(s.id))
                      .toList();

                  if (shelvesInCollection.isEmpty) {
                    return SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.collections_bookmark_outlined,
                              size: 64,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Coleção vazia.',
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Adicione estantes clicando em +',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final shelf = shelvesInCollection[index];
                        return _ShelfRow(
                          shelf: shelf,
                          collectionId: collection.id,
                        );
                      }, childCount: shelvesInCollection.length),
                    ),
                  );
                }

                if (state is ShelfError) {
                  return SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text(
                          'Erro ao carregar estantes: ${state.message}',
                          style: TextStyle(color: theme.colorScheme.error),
                        ),
                      ),
                    ),
                  );
                }

                return const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          const BibiFab(mini: true),
          const SizedBox(height: 8),
          FloatingActionButton.extended(
            onPressed: () => _showAddShelfDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Adicionar Estante'),
          ),
        ],
      ),
    );
  }

  void _showAddShelfDialog(BuildContext context) {
    final shelfBlocState = context.read<ShelfBloc>().state;
    if (shelfBlocState is! ShelfLoaded) return;

    final colState = context.read<CollectionBloc>().state;
    final Set<int> collectionShelfIds;
    if (colState is CollectionLoaded) {
      final fresh = colState.collections
          .where((c) => c.id == widget.collection.id)
          .firstOrNull;
      collectionShelfIds =
          fresh?.shelfPreviews.map((p) => p.id).toSet() ??
          widget.collection.shelfPreviews.map((p) => p.id).toSet();
    } else {
      collectionShelfIds = widget.collection.shelfPreviews
          .map((p) => p.id)
          .toSet();
    }
    final availableShelves = shelfBlocState.shelves
        .where((s) => !collectionShelfIds.contains(s.id))
        .toList();

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        if (availableShelves.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(32),
            child: Text('Não há estantes disponíveis para adicionar.'),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 16),
          itemCount: availableShelves.length,
          itemBuilder: (ctx, index) {
            final shelf = availableShelves[index];
            return ListTile(
              title: Text(shelf.name),
              subtitle: Text('${shelf.itemCount} livros'),
              onTap: () {
                context.read<CollectionBloc>().add(
                  CollectionAddShelfRequested(
                    collectionId: widget.collection.id,
                    shelfId: shelf.id,
                  ),
                );
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
            );
          },
        );
      },
    );
  }
}

// ── Widget de linha de estante com botão de remoção ───────────────────────────

class _ShelfRow extends StatelessWidget {
  final Shelf shelf;
  final int collectionId;
  const _ShelfRow({required this.shelf, required this.collectionId});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ShelfCard(
          shelf: shelf,
          onTap: () {
            Navigator.of(context)
                .push(
                  MaterialPageRoute(
                    builder: (_) => BlocProvider.value(
                      value: context.read<ShelfBloc>(),
                      child: ShelfDetailScreenContent(shelf: shelf),
                    ),
                  ),
                )
                .then((_) {
                  if (context.mounted) {
                    context.read<CollectionBloc>().add(
                      CollectionStatisticsRequested(collectionId),
                    );
                  }
                });
          },
          onEdit: () => _showEditSheet(context),
          onDelete: () => _confirmRemove(context),
        ),
        Positioned(
          top: 8,
          right: 8,
          child: IconButton(
            icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
            onPressed: () {
              context.read<CollectionBloc>().add(
                CollectionRemoveShelfRequested(
                  collectionId: collectionId,
                  shelfId: shelf.id,
                ),
              );
              Navigator.pop(context);
            },
          ),
        ),
      ],
    );
  }

  void _showEditSheet(BuildContext context) {
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

  void _confirmRemove(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Remover da coleção?'),
        content: Text(
          'A estante "${shelf.name}" será removida desta coleção. Os livros não serão apagados.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<CollectionBloc>().add(
                CollectionRemoveShelfRequested(
                  collectionId: collectionId,
                  shelfId: shelf.id,
                ),
              );
              Navigator.pop(context);
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Remover'),
          ),
        ],
      ),
    );
  }
}
