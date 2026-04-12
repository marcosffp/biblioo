import 'dart:convert';
import 'package:biblioo/features/shelf/data/models/shelf_item_model.dart';
import 'package:biblioo/features/shelf/data/models/shelf_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Cache local de estantes e itens via SharedPreferences.
class ShelfLocalDatasource {
  static const _shelvesKey = 'shelf_cache';
  static const _itemsKeyPrefix = 'shelf_items_cache_';

  final SharedPreferences _prefs;
  const ShelfLocalDatasource(this._prefs);

  // ── Shelves ────────────────────────────────────────────

  List<ShelfModel> getCachedShelves() {
    final raw = _prefs.getString(_shelvesKey);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((json) => ShelfModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveShelves(List<ShelfModel> shelves) async {
    final json = jsonEncode(shelves.map((s) => s.toJson()).toList());
    await _prefs.setString(_shelvesKey, json);
  }

  Future<void> removeShelfFromCache(int shelfId) async {
    final shelves = getCachedShelves();
    shelves.removeWhere((s) => s.id == shelfId);
    await saveShelves(shelves);
    // Limpa também os itens cacheados
    await _prefs.remove('$_itemsKeyPrefix$shelfId');
  }

  // ── ShelfItems ─────────────────────────────────────────

  List<ShelfItemModel> getCachedItems(int shelfId) {
    final raw = _prefs.getString('$_itemsKeyPrefix$shelfId');
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((json) => ShelfItemModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveItems(int shelfId, List<ShelfItemModel> items) async {
    final json = jsonEncode(items.map((i) => i.toJson()).toList());
    await _prefs.setString('$_itemsKeyPrefix$shelfId', json);
  }
}
