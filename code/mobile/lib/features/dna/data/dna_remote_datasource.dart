import 'package:dio/dio.dart';

class DnaRemoteDatasource {
  final Dio _dio;

  const DnaRemoteDatasource(this._dio);

  Future<Map<String, dynamic>> getDna(int userId) async {
    final response = await _dio.get('/dna/$userId');
    return response.data as Map<String, dynamic>;
  }
}
