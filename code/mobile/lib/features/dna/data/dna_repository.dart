import 'package:biblioo/features/dna/domain/dna_snapshot.dart';

import 'dna_local_datasource.dart';
import 'dna_remote_datasource.dart';
import 'models/dna_snapshot_model.dart';

class DnaRepository {
  final DnaRemoteDatasource _remote;
  final DnaLocalDatasource _local;

  const DnaRepository(this._remote, this._local);

  Future<DnaSnapshot> getDna({
    required int userId,
    bool refreshRemote = false,
  }) async {
    final cached = _local.getCached(userId);
    if (cached != null && !refreshRemote) {
      return cached.toEntity();
    }

    try {
      final data = await _remote.getDna(userId);
      final model = DnaSnapshotModel.fromJson(data);
      await _local.save(userId, model);
      return model.toEntity();
    } catch (_) {
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }
}
