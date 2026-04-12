import 'reading_status.dart';

/// Entity pura para um livro dentro de uma estante.
/// Campos mapeados com ShelfItemResponse / ShelfItemSummaryResponse / ShelfItemProgressResponse.
class ShelfItem {
  final int id;
  final int? shelfId;
  final int bookId;
  final String bookTitle;
  final String? bookCoverUrl;
  final ReadingStatus status;
  final int? currentPage;
  final int? totalPages;
  final int? progressPercent;

  const ShelfItem({
    required this.id,
    this.shelfId,
    required this.bookId,
    required this.bookTitle,
    this.bookCoverUrl,
    required this.status,
    this.currentPage,
    this.totalPages,
    this.progressPercent,
  });

  /// Regra de negócio: tem progresso para exibir barra?
  bool get hasProgress => progressPercent != null && progressPercent! > 0;

  /// Regra de negócio: leitura está ativa?
  bool get isActiveReading =>
      status == ReadingStatus.reading || status == ReadingStatus.rereading;
}
