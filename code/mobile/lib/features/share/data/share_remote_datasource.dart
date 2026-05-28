import 'dart:typed_data';

import 'package:dio/dio.dart';

class ShareRemoteDatasource {
  final Dio _dio;

  const ShareRemoteDatasource(this._dio);

  Future<Uint8List> getDnaCard() async {
    final response = await _dio.get<List<int>>(
      '/share/card',
      queryParameters: {'type': 'dna'},
      options: Options(responseType: ResponseType.bytes),
    );
    return Uint8List.fromList(response.data ?? const []);
  }
}
