/// Entity pura — livro recomendado pelo backend.
/// Espelha o RecommendationResponse do back (sem autores, com score).
class RecommendedBook {
  final int id;
  final String title;
  final String? description;
  final int? pageCount;
  final int? readerCount;
  final double? averageRating;
  final String? coverUrl;
  final double score;

  const RecommendedBook({
    required this.id,
    required this.title,
    this.description,
    this.pageCount,
    this.readerCount,
    this.averageRating,
    this.coverUrl,
    this.score = 0,
  });
}
