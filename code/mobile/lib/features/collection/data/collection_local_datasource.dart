import 'dart:convert';
import 'package:biblioo/features/collection/data/models/collection_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CollectionLocalDatasource {
  static const _collectionsKey = 'collection_cache';

  final SharedPreferences _prefs;
  const CollectionLocalDatasource(this._prefs);

  List<CollectionModel> getCachedCollections() {
    final raw = _prefs.getString(_collectionsKey);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((json) => CollectionModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveCollections(List<CollectionModel> collections) async {
    final json = jsonEncode(collections.map((c) => c.toJson()).toList());
    await _prefs.setString(_collectionsKey, json);
  }

  Future<void> removeCollectionFromCache(int collectionId) async {
    final collections = getCachedCollections();
    collections.removeWhere((c) => c.id == collectionId);
    await saveCollections(collections);
  }
}
