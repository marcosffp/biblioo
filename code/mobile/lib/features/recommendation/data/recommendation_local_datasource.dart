import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'models/because_you_read_model.dart';
import 'models/favorite_genre_now_model.dart';
import 'models/recommended_book_model.dart';

/// Cache local das trilhas de recomendação via SharedPreferences.
/// Cada trilha tem sua própria chave — usado como fallback offline.
class RecommendationLocalDatasource {
  static const _kBecauseYouRead = 'rec_because_you_read';
  static const _kFavoriteGenre = 'rec_favorite_genre_now';
  static const _kTrending = 'rec_trending_in_communities';
  static const _kCatalogSurprise = 'rec_catalog_surprise';
  static const _kSimilarAuthors = 'rec_similar_authors';
  static const _kRereadWorthIt = 'rec_reread_worth_it';

  final SharedPreferences _prefs;
  const RecommendationLocalDatasource(this._prefs);

  // ── because-you-read ─────────────────────────────────────
  BecauseYouReadModel? getBecauseYouRead() {
    final raw = _prefs.getString(_kBecauseYouRead);
    if (raw == null) return null;
    return BecauseYouReadModel.fromJson(
      jsonDecode(raw) as Map<String, dynamic>,
    );
  }

  Future<void> saveBecauseYouRead(BecauseYouReadModel model) async {
    await _prefs.setString(_kBecauseYouRead, jsonEncode(model.toJson()));
  }

  // ── favorite-genre-now ───────────────────────────────────
  FavoriteGenreNowModel? getFavoriteGenreNow() {
    final raw = _prefs.getString(_kFavoriteGenre);
    if (raw == null) return null;
    return FavoriteGenreNowModel.fromJson(
      jsonDecode(raw) as Map<String, dynamic>,
    );
  }

  Future<void> saveFavoriteGenreNow(FavoriteGenreNowModel model) async {
    await _prefs.setString(_kFavoriteGenre, jsonEncode(model.toJson()));
  }

  // ── listas simples (books only) ──────────────────────────
  List<RecommendedBookModel>? getTrending() => _getList(_kTrending);
  Future<void> saveTrending(List<RecommendedBookModel> books) =>
      _saveList(_kTrending, books);

  List<RecommendedBookModel>? getCatalogSurprise() =>
      _getList(_kCatalogSurprise);
  Future<void> saveCatalogSurprise(List<RecommendedBookModel> books) =>
      _saveList(_kCatalogSurprise, books);

  List<RecommendedBookModel>? getSimilarAuthors() =>
      _getList(_kSimilarAuthors);
  Future<void> saveSimilarAuthors(List<RecommendedBookModel> books) =>
      _saveList(_kSimilarAuthors, books);

  List<RecommendedBookModel>? getRereadWorthIt() => _getList(_kRereadWorthIt);
  Future<void> saveRereadWorthIt(List<RecommendedBookModel> books) =>
      _saveList(_kRereadWorthIt, books);

  List<RecommendedBookModel>? _getList(String key) {
    final raw = _prefs.getString(key);
    if (raw == null) return null;
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => RecommendedBookModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> _saveList(String key, List<RecommendedBookModel> books) async {
    await _prefs.setString(
      key,
      jsonEncode(books.map((b) => b.toJson()).toList()),
    );
  }
}
