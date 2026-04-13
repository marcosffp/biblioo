/// Entity pura — zero dependência de Flutter/Dio.
/// Campos mapeados 1:1 com ShelfResponse e ShelfSummaryResponse do backend.
class Shelf {
  final int id;
  final String name;
  final String? description;
  final int itemCount;
  final List<String> coverPreview;

  const Shelf({
    required this.id,
    required this.name,
    this.description,
    required this.itemCount,
    required this.coverPreview,
  });

  /// Regra de negócio: estante está vazia?
  bool get isEmpty => itemCount == 0;
}
