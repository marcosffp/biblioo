import 'dart:convert';
import 'dart:typed_data';

import 'package:biblioo/features/share/domain/share_capsule.dart';

class ShareCapsuleModel {
  final Uint8List bytes;
  final DateTime cachedAt;

  const ShareCapsuleModel({
    required this.bytes,
    required this.cachedAt,
  });

  factory ShareCapsuleModel.fromBytes(Uint8List bytes) {
    return ShareCapsuleModel(
      bytes: bytes,
      cachedAt: DateTime.now(),
    );
  }

  factory ShareCapsuleModel.fromJson(Map<String, dynamic> json) {
    final rawBytes = json['bytes'] as String?;
    final cachedAtRaw = json['cachedAt'] as String?;
    if (rawBytes == null || cachedAtRaw == null) {
      throw FormatException('Share capsule cache invalid.');
    }
    return ShareCapsuleModel(
      bytes: base64Decode(rawBytes),
      cachedAt: DateTime.parse(cachedAtRaw),
    );
  }

  Map<String, dynamic> toJson() => {
        'bytes': base64Encode(bytes),
        'cachedAt': cachedAt.toIso8601String(),
      };

  ShareCapsule toEntity() => ShareCapsule(bytes: bytes, cachedAt: cachedAt);
}
