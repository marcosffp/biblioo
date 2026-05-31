import 'dart:typed_data';

import 'package:dio/dio.dart';

import 'models/share_capsule_model.dart';

class ShareRemoteDatasource {
  final Dio _dio;

  const ShareRemoteDatasource(this._dio);

  Future<ShareCapsuleModel> getDnaCard() async {
    final response = await _dio.get<List<int>>(
      '/share/card',
      queryParameters: const {'type': 'dna'},
      options: Options(responseType: ResponseType.bytes),
    );

    final data = response.data;
    final bytes = data is Uint8List
        ? data
        : Uint8List.fromList(List<int>.from(data ?? const <int>[]));

    if (bytes.isEmpty) {
      throw StateError('Resposta vazia da API.');
    }

    return ShareCapsuleModel.fromBytes(bytes);
  }
}
