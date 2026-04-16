/// Estatísticas agregadas de uma coleção — soma das métricas de todas as estantes.
class CollectionStatistics {
  final int collectionId;
  final int totalBooks;
  final int booksCompleted;
  final int booksReading;
  final int booksRereading;
  final int booksWantToRead;
  final int booksAbandoned;
  final int totalPages;
  final int pagesRead;

  const CollectionStatistics({
    required this.collectionId,
    required this.totalBooks,
    required this.booksCompleted,
    required this.booksReading,
    required this.booksRereading,
    required this.booksWantToRead,
    required this.booksAbandoned,
    required this.totalPages,
    required this.pagesRead,
  });

  /// Livros em leitura ativa (lendo + relendo).
  int get booksActiveReading => booksReading + booksRereading;

  /// Taxa de conclusão de 0.0 a 1.0.
  double get completionRate =>
      totalBooks > 0 ? booksCompleted / totalBooks : 0.0;

  /// Progresso geral de páginas de 0.0 a 1.0.
  double get pagesProgress =>
      totalPages > 0 ? pagesRead / totalPages : 0.0;
}
