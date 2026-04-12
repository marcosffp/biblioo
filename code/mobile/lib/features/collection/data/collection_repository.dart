import 'package:biblioo/features/collection/domain/collection.dart';
import 'collection_local_datasource.dart';
import 'collection_remote_datasource.dart';

class CollectionRepository {
  final CollectionRemoteDatasource _remote;
  final CollectionLocalDatasource _local;

  const CollectionRepository(this._remote, this._local);

  Future<List<Collection>> getCollections() async {
    try {
      final remote = await _remote.getCollections();
      await _local.saveCollections(remote);
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      final local = _local.getCachedCollections();
      return local.map((m) => m.toEntity()).toList();
    }
  }

  Future<Collection> getCollection(int id) async {
    try {
      final remote = await _remote.getCollection(id);
      return remote.toEntity();
    } catch (_) {
      final cached = _local.getCachedCollections();
      final match = cached.where((c) => c.id == id);
      if (match.isNotEmpty) return match.first.toEntity();
      rethrow;
    }
  }

  Future<Collection> createCollection({
    required String name,
    String? description,
    List<int>? initialShelfIds,
  }) async {
    final model = await _remote.createCollection(
      name: name,
      description: description,
      initialShelfIds: initialShelfIds,
    );
    final collections = _local.getCachedCollections()..add(model);
    await _local.saveCollections(collections);
    return model.toEntity();
  }

  Future<Collection> updateCollection({
    required int id,
    required String name,
    String? description,
  }) async {
    final model = await _remote.updateCollection(
      id: id,
      name: name,
      description: description,
    );
    final collections = _local.getCachedCollections();
    final index = collections.indexWhere((c) => c.id == id);
    if (index != -1) {
      collections[index] = model;
      await _local.saveCollections(collections);
    }
    return model.toEntity();
  }

  Future<void> deleteCollection(int id) async {
    await _remote.deleteCollection(id);
    await _local.removeCollectionFromCache(id);
  }

  Future<Collection> addShelfToCollection(int collectionId, int shelfId) async {
    final model = await _remote.addShelfToCollection(collectionId, shelfId);
    return model.toEntity();
  }

  Future<void> removeShelfFromCollection(int collectionId, int shelfId) async {
    await _remote.removeShelfFromCollection(collectionId, shelfId);
  }
}
