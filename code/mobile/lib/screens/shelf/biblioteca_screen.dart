import 'package:biblioo/features/collection/bloc/collection_bloc.dart';
import 'package:biblioo/features/collection/bloc/collection_event.dart';
import 'package:biblioo/features/shelf/bloc/shelf_bloc.dart';
import 'package:biblioo/features/shelf/bloc/shelf_event.dart';
import 'package:biblioo/screens/collection/widgets/create_collection_sheet.dart';
import 'package:biblioo/screens/shelf/widgets/create_shelf_sheet.dart';
import 'package:biblioo/shared/widgets/bibo_fab.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'widgets/biblioteca_tab_bar.dart';
import 'widgets/collection_tab.dart';
import 'widgets/shelf_tab.dart';

class BibliotecaScreen extends StatefulWidget {
  const BibliotecaScreen({super.key});

  @override
  State<BibliotecaScreen> createState() => _BibliotecaScreenState();
}

class _BibliotecaScreenState extends State<BibliotecaScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this)
      ..addListener(_onTabChanged);
    context.read<ShelfBloc>().add(ShelfLoadRequested());
    context.read<CollectionBloc>().add(CollectionLoadRequested());
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Minha Bibliooteca'),
        bottom: BibliotecaTabBar(controller: _tabController),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [ShelfTab(), CollectionTab()],
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          const BiboFab(mini: true, heroTag: 'biblioteca_bibo_fab'),
          const SizedBox(height: 8),
          _tabController.index == 0
              ? FloatingActionButton(
                  heroTag: 'shelf_create_fab',
                  onPressed: _showCreateShelfSheet,
                  tooltip: 'Nova estante',
                  child: const Icon(Icons.library_add),
                )
              : FloatingActionButton(
                  heroTag: 'collection_create_fab',
                  onPressed: _showCreateCollectionSheet,
                  tooltip: 'Nova coleção',
                  child: const Icon(Icons.bookmark_add_outlined),
                ),
        ],
      ),
    );
  }

  void _showSheet(Widget child) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => child,
    );
  }

  void _showCreateShelfSheet() => _showSheet(
    BlocProvider.value(
      value: context.read<ShelfBloc>(),
      child: const CreateShelfSheet(),
    ),
  );

  void _showCreateCollectionSheet() => _showSheet(
    BlocProvider.value(
      value: context.read<CollectionBloc>(),
      child: const CreateCollectionSheet(),
    ),
  );
}
