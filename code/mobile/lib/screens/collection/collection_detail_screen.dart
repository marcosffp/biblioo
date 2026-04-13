import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_event.dart';
import 'package:biblioo/features/collection/bloc/collection_state.dart';
import 'package:biblioo/features/collection/domain/collection.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_state.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/screens/shelf/widgets/shelf_card.dart';
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
  }

  @override
  Widget build(BuildContext context) {
    final collection = widget.collection;
    final theme = Theme.of(context);

    // Note: To show shelves correctly, we will rely on the global ShelfBloc (which holds all user shelves)
    // and filter them by the collection's shelf logic, but wait, Collection API returns ShelfPreviews.
    // If we want full Shelf interaction, we can filter the ShelfBloc items or just display the previews.
    // Since ShelfPreview does not have all details of Shelf, let's look at what ShelfBloc has.
    
    return Scaffold(
      appBar: AppBar(
        title: Text(collection.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              if (collection.description?.isNotEmpty ?? false) {
                 showDialog(
                   context: context,
                   builder: (_) => AlertDialog(
                     title: const Text('Descrição'),
                     content: Text(collection.description!),
                     actions: [
                       TextButton(
                         child: const Text('Fechar'),
                         onPressed: () => Navigator.pop(context),
                       )
                     ]
                   )
                 );
              }
            },
          ),
        ],
      ),
      body: BlocBuilder<ShelfBloc, ShelfState>(
        buildWhen: (previous, current) => current is ShelfLoaded || current is ShelfLoading || current is ShelfError,
        builder: (context, state) {
          if (state is ShelfLoaded) {
            // Find shelves that are part of this collection
            final collectionShelfIds = collection.shelfPreviews.map((p) => p.id).toSet();
            final shelvesInCollection = state.shelves.where((s) => collectionShelfIds.contains(s.id)).toList();

            if (shelvesInCollection.isEmpty) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.collections_bookmark_outlined, size: 64, color: theme.colorScheme.onSurfaceVariant),
                    const SizedBox(height: 16),
                    Text('Coleção vazia.', style: theme.textTheme.bodyLarge?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                    const SizedBox(height: 8),
                    Text('Adicione estantes clicando em +', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                  ]
                )
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: shelvesInCollection.length,
              itemBuilder: (context, index) {
                final shelf = shelvesInCollection[index];
                return Stack(
                  children: [
                    ShelfCard(
                      shelf: shelf,
                      onTap: () {
                        Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => BlocProvider.value(
                            value: context.read<ShelfBloc>(),
                            child: ShelfDetailScreenContent(shelf: shelf),
                          ),
                        ));
                      },
                      onEdit: () {}, 
                      onDelete: () {},
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                        onPressed: () {
                           context.read<CollectionBloc>().add(CollectionRemoveShelfRequested(
                             collectionId: collection.id, 
                             shelfId: shelf.id
                           ));
                           Navigator.pop(context); // Pop current view to reflect changes via reload
                        },
                      )
                    )
                  ],
                );
              },
            );
          } else if (state is ShelfError) {
             return Center(
               child: Text('Erro ao carregar estantes: ${state.message}', 
                 style: TextStyle(color: theme.colorScheme.error))
             );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddShelfDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Adicionar Estante'),
      ),
    );
  }

  void _showAddShelfDialog(BuildContext context) {
    final shelfBlocState = context.read<ShelfBloc>().state;
    if (shelfBlocState is! ShelfLoaded) return;

    // Usa o estado atualizado do CollectionBloc para obter os IDs atuais,
    // evitando exibir como disponíveis estantes já adicionadas após mutações.
    final colState = context.read<CollectionBloc>().state;
    final Set<int> collectionShelfIds;
    if (colState is CollectionLoaded) {
      final fresh = colState.collections.where((c) => c.id == widget.collection.id).firstOrNull;
      collectionShelfIds = fresh?.shelfPreviews.map((p) => p.id).toSet() ?? widget.collection.shelfPreviews.map((p) => p.id).toSet();
    } else {
      collectionShelfIds = widget.collection.shelfPreviews.map((p) => p.id).toSet();
    }
    final availableShelves = shelfBlocState.shelves.where((s) => !collectionShelfIds.contains(s.id)).toList();

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
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
                context.read<CollectionBloc>().add(CollectionAddShelfRequested(
                  collectionId: widget.collection.id,
                  shelfId: shelf.id,
                ));
                Navigator.pop(ctx);
                Navigator.pop(context); // Returns to shelf list so you see changes when reopening
              },
            );
          },
        );
      }
    );
  }
}
