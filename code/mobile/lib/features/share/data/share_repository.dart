import 'dart:typed_data';

import 'share_remote_datasource.dart';

class ShareRepository {
  final ShareRemoteDatasource _remote;

  const ShareRepository(this._remote);

  // Imagem gerada e cacheada no backend — nada a persistir localmente.
  Future<Uint8List> getDnaCard() => _remote.getDnaCard();
}
