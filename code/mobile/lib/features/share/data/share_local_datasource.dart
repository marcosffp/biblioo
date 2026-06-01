import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models/share_capsule_model.dart';

class ShareLocalDatasource {
  static const _keyPrefix = 'share_capsule_dna_';

  final SharedPreferences _prefs;

  const ShareLocalDatasource(this._prefs);

  ShareCapsuleModel? getCached(int userId) {
    final raw = _prefs.getString('$_keyPrefix$userId');
    if (raw == null || raw.isEmpty) return null;
    ShareCapsuleModel? model;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) {
        model = ShareCapsuleModel.fromJson(decoded);
      }
    } on FormatException {
      model = null;
    } on TypeError {
      model = null;
    }
    if (model != null) return model;
    try {
      final bytes = base64Decode(raw);
      return ShareCapsuleModel(bytes: bytes, cachedAt: DateTime.now());
    } on FormatException {
      return null;
    }
  }

  Future<void> save(int userId, ShareCapsuleModel model) async {
    await _prefs.setString(
      '$_keyPrefix$userId',
      jsonEncode(model.toJson()),
    );
  }
}
