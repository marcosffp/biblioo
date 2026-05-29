import 'dart:typed_data';

import 'package:biblioo/features/share/domain/share_card_type.dart';
import 'package:dio/dio.dart';

class ShareRemoteDatasource {
  final Dio _dio;

  const ShareRemoteDatasource(this._dio);

  Future<Uint8List> getCard(ShareCardType type) async {
    final response = await _dio.get<List<int>>(
      '/share/card',
      queryParameters: {'type': type.apiValue},
      options: Options(responseType: ResponseType.bytes),
    );
    return Uint8List.fromList(response.data ?? const []);
  }
}
