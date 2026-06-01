abstract class RecommendationEvent {}

/// Carrega todas as 6 trilhas + sorteia o livro inicial do dado.
class RecommendationLoadRequested extends RecommendationEvent {}

/// Refaz o sorteio do dado (Jogar o Dado).
class RecommendationDiceRolled extends RecommendationEvent {}

/// Recarrega uma trilha específica (pull-to-refresh por seção).
class RecommendationTrailRefreshed extends RecommendationEvent {
  final RecommendationTrail trail;
  RecommendationTrailRefreshed(this.trail);
}

enum RecommendationTrail {
  becauseYouRead,
  favoriteGenreNow,
  trendingInCommunities,
  catalogSurprise,
  similarAuthors,
  rereadWorthIt,
}
