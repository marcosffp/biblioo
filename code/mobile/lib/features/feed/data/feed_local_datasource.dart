import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models/feed_item_model.dart';

class FeedLocalDatasource {
  static const _feedItemsKeyPrefix = 'feed_items_cache_';

  final SharedPreferences _prefs;

  const FeedLocalDatasource(this._prefs);

  List<FeedItemModel> getCachedFeed(int userId) {
    final raw = _prefs.getString('$_feedItemsKeyPrefix$userId');
    if (raw == null) return const [];
    final decoded = jsonDecode(raw);
    if (decoded is! List) return const [];
    return decoded
        .map((item) => FeedItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveFeed(int userId, List<FeedItemModel> items) async {
    final encoded = jsonEncode(items.map((item) => item.toJson()).toList());
    await _prefs.setString('$_feedItemsKeyPrefix$userId', encoded);
  }
}
