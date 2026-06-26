import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:biblioo/features/shelf/data/models/shelf_item_model.dart';
import 'package:biblioo/features/shelf/data/models/shelf_model.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';
import 'shelf_local_datasource.dart';
import 'shelf_remote_datasource.dart';

/// Orquestrador offline-first para estantes e itens.
/// Remote-first: tenta API e salva no cache. Fallback: cache local.
class ShelfRepository {
  final ShelfRemoteDatasource _remote;
  final ShelfLocalDatasource _local;

  const ShelfRepository(this._remote, this._local);

  // ── Shelf CRUD ─────────────────────────────────────────

  List<Shelf> getCachedShelves() {
    final cached = _local.getCachedShelves();
    return cached.map((s) => s.toEntity()).toList();
  }

  Future<List<Shelf>> getShelves() async {
    try {
      final remote = await _remote.getShelves();
      await _local.saveShelves(remote);
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      final local = _local.getCachedShelves();
      return local.map((m) => m.toEntity()).toList();
    }
  }

  Future<Shelf> getShelf(int shelfId) async {
    try {
      final remote = await _remote.getShelf(shelfId);
      return remote.toEntity();
    } catch (_) {
      final cached = _local.getCachedShelves();
      final match = cached.where((s) => s.id == shelfId);
      if (match.isNotEmpty) return match.first.toEntity();
      rethrow;
    }
  }

  Future<Shelf> createShelf({required String name, String? description}) async {
    final model = await _remote.createShelf(
      name: name,
      description: description,
    );
    // Atualiza cache local
    final shelves = _local.getCachedShelves()..add(model);
    await _local.saveShelves(shelves);
    return model.toEntity();
  }

  Future<Shelf> updateShelf({
    required int shelfId,
    required String name,
    String? description,
  }) async {
    final model = await _remote.updateShelf(
      shelfId: shelfId,
      name: name,
      description: description,
    );
    // Atualiza no cache
    final shelves = _local.getCachedShelves();
    final index = shelves.indexWhere((s) => s.id == shelfId);
    if (index != -1) {
      shelves[index] = model;
      await _local.saveShelves(shelves);
    }
    return model.toEntity();
  }

  Future<void> deleteShelf(int shelfId) async {
    await _remote.deleteShelf(shelfId);
    await _local.removeShelfFromCache(shelfId);
  }

  // ── ShelfItem CRUD ─────────────────────────────────────

  Future<List<ShelfItem>> getItems(int shelfId) async {
    try {
      final remote = await _remote.getItems(shelfId);
      final hydrated = await _hydrateMissingPageDetails(shelfId, remote);
      await _local.saveItems(shelfId, hydrated);
      return hydrated.map((m) => m.toEntity()).toList();
    } catch (_) {
      final local = _local.getCachedItems(shelfId);
      return local.map((m) => m.toEntity()).toList();
    }
  }

  List<ShelfItem> getCachedItems(int shelfId) {
    final cached = _local.getCachedItems(shelfId);
    return cached.map((item) => item.toEntity()).toList();
  }

  Map<int, ShelfItem> getCachedBookItems(int bookId) {
    final result = <int, ShelfItem>{};
    final shelves = _local.getCachedShelves();
    for (final shelf in shelves) {
      final items = _local.getCachedItems(shelf.id);
      for (final item in items) {
        if (item.bookId == bookId) {
          result[shelf.id] = item.toEntity();
        }
      }
    }
    return result;
  }

  Future<ShelfItem> getItem(int shelfId, int itemId) async {
    final model = await _remote.getItem(shelfId, itemId);
    return model.toEntity();
  }

  Future<ShelfItem> addItem({
    required int shelfId,
    required int bookId,
    ReadingStatus? initialStatus,
  }) async {
    final model = await _remote.addItem(
      shelfId: shelfId,
      bookId: bookId,
      initialStatus: initialStatus,
    );
    await _upsertCachedItem(shelfId, model);
    await _bumpShelfCount(shelfId, 1);
    return model.toEntity();
  }

  Future<void> removeItem(int shelfId, int itemId) async {
    await _remote.removeItem(shelfId, itemId);
    await _removeCachedItem(shelfId, itemId);
    await _bumpShelfCount(shelfId, -1);
  }

  Future<ShelfItem> updateProgress({
    required int shelfId,
    required int itemId,
    required int currentPage,
  }) async {
    final model = await _remote.updateProgress(
      shelfId: shelfId,
      itemId: itemId,
      currentPage: currentPage,
    );
    await _upsertCachedItem(shelfId, model);
    return model.toEntity();
  }

  Future<ShelfItem> changeStatus({
    required int shelfId,
    required int itemId,
    required ReadingStatus newStatus,
  }) async {
    final model = await _remote.changeStatus(
      shelfId: shelfId,
      itemId: itemId,
      newStatus: newStatus,
    );
    await _upsertCachedItem(shelfId, model);
    return model.toEntity();
  }

  Future<List<ShelfItemModel>> _hydrateMissingPageDetails(
    int shelfId,
    List<ShelfItemModel> items,
  ) async {
    if (items.every(_hasPageDetails)) return items;

    return Future.wait(
      items.map((item) async {
        if (_hasPageDetails(item)) return item;

        try {
          return await _remote.getItem(shelfId, item.id);
        } catch (_) {
          return item;
        }
      }),
    );
  }

  bool _hasPageDetails(ShelfItemModel item) =>
      item.currentPage != null && item.totalPages != null;

  /// Retorna o número de dias ativos de leitura (streak) do usuário.
  /// Em caso de erro, retorna 0 silenciosamente.
  Future<int> getActiveReadingDays() async {
    try {
      return await _remote.getActiveReadingDays();
    } catch (_) {
      return 0;
    }
  }

  Future<void> _upsertCachedItem(int shelfId, ShelfItemModel model) async {
    final cached = _local.getCachedItems(shelfId);
    final index = cached.indexWhere((item) => item.id == model.id);

    if (index == -1) {
      cached.add(model);
    } else {
      cached[index] = model;
    }

    await _local.saveItems(shelfId, cached);
  }

  Future<void> _removeCachedItem(int shelfId, int itemId) async {
    final cached = _local.getCachedItems(shelfId);
    cached.removeWhere((item) => item.id == itemId);
    await _local.saveItems(shelfId, cached);
  }

  Future<void> _bumpShelfCount(int shelfId, int delta) async {
    final shelves = _local.getCachedShelves();
    final index = shelves.indexWhere((s) => s.id == shelfId);
    if (index == -1) return;
    final current = shelves[index];
    final nextCount = (current.itemCount + delta).clamp(0, 1 << 30);
    shelves[index] = ShelfModel(
      id: current.id,
      name: current.name,
      description: current.description,
      itemCount: nextCount,
      coverPreview: current.coverPreview,
    );
    await _local.saveShelves(shelves);
  }
}
