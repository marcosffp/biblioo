import 'dart:typed_data';

import 'package:biblioo/features/share/domain/share_card_type.dart';

import 'share_remote_datasource.dart';

class ShareRepository {
  final ShareRemoteDatasource _remote;

  static const _cacheTtl = Duration(minutes: 10);

  // Cache em memória: evita refazer a request a cada reabertura da sheet
  // sem persistir um PNG que pode ficar defasado entre sessões.
  final Map<ShareCardType, _CacheEntry> _cache = {};

  ShareRepository(this._remote);

  Future<Uint8List> getCard(
    ShareCardType type, {
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh) {
      final cached = _cache[type];
      if (cached != null && !cached.isExpired) return cached.bytes;
    }
    final bytes = await _remote.getCard(type);
    _cache[type] = _CacheEntry(bytes, DateTime.now().add(_cacheTtl));
    return bytes;
  }

  Future<Uint8List> getDnaCard({bool forceRefresh = false}) =>
      getCard(ShareCardType.dna, forceRefresh: forceRefresh);
}

class _CacheEntry {
  final Uint8List bytes;
  final DateTime expiresAt;

  const _CacheEntry(this.bytes, this.expiresAt);

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}
