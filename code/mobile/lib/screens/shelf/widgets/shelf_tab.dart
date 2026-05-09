import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/features/shelf/bloc/shelf_state.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/screens/shelf/shelf_list_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'create_shelf_sheet.dart';
import 'shelf_card.dart';
import 'shelf_shimmer.dart';

class ShelfTab extends StatefulWidget {
  const ShelfTab({super.key});

  @override
  State<ShelfTab> createState() => _ShelfTabState();
}

class _ShelfTabState extends State<ShelfTab>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    final state = context.read<ShelfBloc>().state;
    if (state is! ShelfLoaded && state is! ShelfLoading && state is! ShelfError) {
      context.read<ShelfBloc>().add(ShelfLoadRequested());
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return BlocConsumer<ShelfBloc, ShelfState>(
      listener: (context, state) {
        if (state is ShelfMutationSuccess) {
          if (ModalRoute.of(context)?.isCurrent ?? false) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                behavior: SnackBarBehavior.floating,
                backgroundColor: Theme.of(context).colorScheme.primary,
              ),
            );
          }
          context.read<ShelfBloc>().add(ShelfLoadRequested());
        }
        if (state is ShelfError) {
          if (!(ModalRoute.of(context)?.isCurrent ?? false)) return;
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
        if (state is ShelfLoading) return _buildShimmer();
        if (state is ShelfLoaded) return _buildContent(context, state.shelves);
        if (state is ShelfError) return _buildError(context, state.message);
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: 4,
      itemBuilder: (_, __) => const ShelfShimmer(),
    );
  }

  Widget _buildContent(BuildContext context, List<Shelf> shelves) {
    if (shelves.isEmpty) {
      return Center(
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
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 88),
      itemCount: shelves.length,
      itemBuilder: (context, index) => ShelfCard(
        shelf: shelves[index],
        onTap: () => _navigateToDetail(context, shelves[index]),
        onEdit: () => _showEditSheet(context, shelves[index]),
        onDelete: () => _confirmDelete(context, shelves[index]),
      ),
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
                context.read<ShelfBloc>().add(ShelfLoadRequested()),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  void _navigateToDetail(BuildContext context, Shelf shelf) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => BlocProvider.value(
          value: context.read<ShelfBloc>(),
          child: ShelfDetailScreenContent(shelf: shelf),
        ),
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
}
