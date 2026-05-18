import 'package:biblioo/features/recommendation/data/models/recommended_book_model.dart';
import 'package:biblioo/features/recommendation/domain/because_you_read_result.dart';
import 'package:biblioo/features/recommendation/domain/favorite_genre_now_result.dart';
import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'recommendation_local_datasource.dart';
import 'recommendation_remote_datasource.dart';

/// Orquestrador offline-first das trilhas de recomendação.
/// Estratégia: tenta remote (sempre fresco); em caso de falha,
/// devolve o cache local da última sessão bem-sucedida.
class RecommendationRepository {
  final RecommendationRemoteDatasource _remote;
  final RecommendationLocalDatasource _local;

  const RecommendationRepository(this._remote, this._local);

  Future<BecauseYouReadResult> getBecauseYouRead() async {
    try {
      final remote = await _remote.getBecauseYouRead();
      await _local.saveBecauseYouRead(remote);
      return remote.toEntity();
    } catch (_) {
      final cached = _local.getBecauseYouRead();
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }

  Future<FavoriteGenreNowResult> getFavoriteGenreNow() async {
    try {
      final remote = await _remote.getFavoriteGenreNow();
      await _local.saveFavoriteGenreNow(remote);
      return remote.toEntity();
    } catch (_) {
      final cached = _local.getFavoriteGenreNow();
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }

  Future<List<RecommendedBook>> getTrendingInCommunities() => _booksTrail(
        _remote.getTrendingInCommunities,
        _local.getTrending,
        _local.saveTrending,
      );

  Future<List<RecommendedBook>> getCatalogSurprise() => _booksTrail(
        _remote.getCatalogSurprise,
        _local.getCatalogSurprise,
        _local.saveCatalogSurprise,
      );

  Future<List<RecommendedBook>> getSimilarAuthors() => _booksTrail(
        _remote.getSimilarAuthors,
        _local.getSimilarAuthors,
        _local.saveSimilarAuthors,
      );

  Future<List<RecommendedBook>> getRereadWorthIt() => _booksTrail(
        _remote.getRereadWorthIt,
        _local.getRereadWorthIt,
        _local.saveRereadWorthIt,
      );

  /// Dado é sempre live (sem cache). Retorna null quando o catálogo está vazio (204).
  Future<RecommendedBook?> rollDice() async {
    final result = await _remote.rollDice();
    return result?.toEntity();
  }

  Future<List<RecommendedBook>> _booksTrail(
    Future<List<RecommendedBookModel>> Function() remoteFetch,
    List<RecommendedBookModel>? Function() cacheGet,
    Future<void> Function(List<RecommendedBookModel>) cacheSave,
  ) async {
    try {
      final remote = await remoteFetch();
      await cacheSave(remote);
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      final cached = cacheGet();
      if (cached != null) return cached.map((m) => m.toEntity()).toList();
      rethrow;
    }
  }
}
