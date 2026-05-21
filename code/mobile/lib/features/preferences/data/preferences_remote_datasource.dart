import 'package:biblioo/features/preferences/data/models/genre_model.dart';
import 'package:dio/dio.dart';

class PreferencesRemoteDatasource {
  final Dio _dio;
  const PreferencesRemoteDatasource(this._dio);

  /// GET /genres — lista de gêneros com tradução PT-BR.
  Future<List<GenreModel>> getGenres() async {
    final response = await _dio.get<List<dynamic>>('/genres');
    return (response.data ?? [])
        .map((e) => GenreModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// POST /preferences — salva preferências do usuário (onboarding).
  /// Lança DioException com status 422 se preferências já existem.
  Future<void> savePreferences(List<String> genres) async {
    await _dio.post<void>(
      '/preferences',
      data: {'genres': genres},
    );
  }
}
