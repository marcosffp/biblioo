import 'dart:typed_data';

class ShareCapsule {
  final Uint8List bytes;
  final DateTime cachedAt;

  const ShareCapsule({
    required this.bytes,
    required this.cachedAt,
  });
}
