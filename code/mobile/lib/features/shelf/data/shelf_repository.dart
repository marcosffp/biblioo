import 'package:biblioo/features/shelf/domain/reading_status.dart';
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

  Future<Shelf> createShelf({
    required String name,
    String? description,
  }) async {
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
      await _local.saveItems(shelfId, remote);
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      final local = _local.getCachedItems(shelfId);
      return local.map((m) => m.toEntity()).toList();
    }
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
    return model.toEntity();
  }

  Future<void> removeItem(int shelfId, int itemId) async {
    await _remote.removeItem(shelfId, itemId);
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
    return model.toEntity();
  }
}
