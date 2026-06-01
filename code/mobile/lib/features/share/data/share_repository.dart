import 'package:biblioo/features/share/domain/share_capsule.dart';

import 'share_local_datasource.dart';
import 'share_remote_datasource.dart';

class ShareRepository {
  final ShareRemoteDatasource _remote;
  final ShareLocalDatasource _local;

  const ShareRepository(this._remote, this._local);

  Future<ShareCapsule> getDnaCard({
    required int userId,
    bool refreshRemote = false,
  }) async {
    final cached = _local.getCached(userId);
    if (cached != null && !refreshRemote) {
      return cached.toEntity();
    }

    try {
      final model = await _remote.getDnaCard();
      await _local.save(userId, model);
      return model.toEntity();
    } catch (_) {
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }
}
