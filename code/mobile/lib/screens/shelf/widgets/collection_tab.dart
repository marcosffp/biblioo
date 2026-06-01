import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_event.dart';
import 'package:biblioo/features/collection/bloc/collection_state.dart';
import 'package:biblioo/features/collection/domain/collection.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/screens/collection/collection_detail_screen.dart';
import 'package:biblioo/screens/collection/widgets/collection_card.dart';
import 'package:biblioo/screens/collection/widgets/collection_shimmer.dart';
import 'package:biblioo/screens/collection/widgets/create_collection_sheet.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CollectionTab extends StatefulWidget {
  const CollectionTab({super.key});

  @override
  State<CollectionTab> createState() => _CollectionTabState();
}

class _CollectionTabState extends State<CollectionTab>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    final state = context.read<CollectionBloc>().state;
    if (state is! CollectionLoaded &&
        state is! CollectionLoading &&
        state is! CollectionError) {
      context.read<CollectionBloc>().add(CollectionLoadRequested());
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
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
          current is CollectionLoading ||
          current is CollectionLoaded ||
          current is CollectionError,
      builder: (context, state) {
        if (state is CollectionLoading) return _buildShimmer();
        if (state is CollectionLoaded) {
          return _buildContent(context, state.collections);
        }
        if (state is CollectionError) return _buildError(context, state.message);
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: 3,
      itemBuilder: (_, __) => const CollectionShimmer(),
    );
  }

  Widget _buildContent(BuildContext context, List<Collection> collections) {
    if (collections.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.bookmark_border_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhuma coleção ainda.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Crie sua primeira coleção tocando no +',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 88),
      itemCount: collections.length,
      itemBuilder: (context, index) {
        final collection = collections[index];
        return CollectionCard(
          collection: collection,
          onTap: () => _navigateToDetail(context, collection),
          onEdit: () => _showEditSheet(context, collection),
          onDelete: () => _confirmDelete(context, collection),
        );
      },
    );
  }

  Widget _buildError(BuildContext context, String message) {
    return Center(
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
                context.read<CollectionBloc>().add(CollectionLoadRequested()),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  void _navigateToDetail(BuildContext context, Collection collection) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => MultiBlocProvider(
          providers: [
            BlocProvider.value(value: context.read<ShelfBloc>()),
            BlocProvider.value(value: context.read<CollectionBloc>()),
          ],
          child: CollectionDetailScreen(collection: collection),
        ),
      ),
    );
  }

  void _showEditSheet(BuildContext context, Collection collection) {
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

  void _confirmDelete(BuildContext context, Collection collection) {
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
              context
                  .read<CollectionBloc>()
                  .add(CollectionDeleteRequested(collection.id));
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
}
