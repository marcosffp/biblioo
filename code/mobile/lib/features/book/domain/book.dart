/// Entity pura — zero dependências externas.
/// Campos mapeados 1:1 com BookResponse do backend.
class Book {
  final int id;
  final String title;
  final List<String> authors;
  final String? coverUrl;
  final int? pageCount;
  final double? averageRating;
  final String? description;
  final int? readerCount;

  const Book({
    required this.id,
    required this.title,
    required this.authors,
    this.coverUrl,
    this.pageCount,
    this.averageRating,
    this.description,
    this.readerCount,
  });

  /// Concatena autores para exibição em UI.
  String get authorsText => authors.join(', ');

  /// Arredonda a média para exibir estrelas inteiras + meia estrela.
  int get fullStars => (averageRating ?? 0).floor();
  bool get hasHalfStar => ((averageRating ?? 0) - fullStars) >= 0.5;
}
