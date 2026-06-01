import 'package:dio/dio.dart';
import 'models/because_you_read_model.dart';
import 'models/favorite_genre_now_model.dart';
import 'models/recommended_book_model.dart';

/// Só fala com Dio — endpoints do RecommendationController.
class RecommendationRemoteDatasource {
  final Dio _dio;
  const RecommendationRemoteDatasource(this._dio);

  /// GET /recommendations/because-you-read
  Future<BecauseYouReadModel> getBecauseYouRead() async {
    final response = await _dio.get('/recommendations/because-you-read');
    return BecauseYouReadModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// GET /recommendations/favorite-genre-now
  Future<FavoriteGenreNowModel> getFavoriteGenreNow() async {
    final response = await _dio.get('/recommendations/favorite-genre-now');
    return FavoriteGenreNowModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// GET /recommendations/trending-in-communities
  Future<List<RecommendedBookModel>> getTrendingInCommunities() async {
    final response = await _dio.get('/recommendations/trending-in-communities');
    return _booksList(response.data as Map<String, dynamic>);
  }

  /// GET /recommendations/catalog-surprise
  Future<List<RecommendedBookModel>> getCatalogSurprise() async {
    final response = await _dio.get('/recommendations/catalog-surprise');
    return _booksList(response.data as Map<String, dynamic>);
  }

  /// GET /recommendations/similar-authors
  Future<List<RecommendedBookModel>> getSimilarAuthors() async {
    final response = await _dio.get('/recommendations/similar-authors');
    return _booksList(response.data as Map<String, dynamic>);
  }

  /// GET /recommendations/reread-worth-it
  Future<List<RecommendedBookModel>> getRereadWorthIt() async {
    final response = await _dio.get('/recommendations/reread-worth-it');
    return _booksList(response.data as Map<String, dynamic>);
  }

  /// GET /recommendations/roll-dice → 200 ou 204 (catálogo vazio).
  Future<RecommendedBookModel?> rollDice() async {
    final response = await _dio.get(
      '/recommendations/roll-dice',
      options: Options(validateStatus: (s) => s != null && s < 500),
    );
    if (response.statusCode == 204 || response.data == null) return null;
    return RecommendedBookModel.fromJson(response.data as Map<String, dynamic>);
  }

  List<RecommendedBookModel> _booksList(Map<String, dynamic> data) {
    return (data['books'] as List<dynamic>? ?? [])
        .map((e) => RecommendedBookModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
