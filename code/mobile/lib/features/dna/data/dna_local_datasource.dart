import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models/dna_snapshot_model.dart';

class DnaLocalDatasource {
  static const _keyPrefix = 'dna_cache_';

  final SharedPreferences _prefs;

  const DnaLocalDatasource(this._prefs);

  DnaSnapshotModel? getCached(int userId) {
    final raw = _prefs.getString('$_keyPrefix$userId');
    if (raw == null || raw.isEmpty) return null;
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    return DnaSnapshotModel.fromJson(decoded);
  }

  Future<void> save(int userId, DnaSnapshotModel model) async {
    await _prefs.setString('$_keyPrefix$userId', jsonEncode(model.toJson()));
  }
}
