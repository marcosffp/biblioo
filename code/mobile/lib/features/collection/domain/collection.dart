import 'shelf_preview.dart';

class Collection {
  final int id;
  final String name;
  final String? description;
  final int shelfCount;
  final List<ShelfPreview> shelfPreviews;

  const Collection({
    required this.id,
    required this.name,
    this.description,
    required this.shelfCount,
    required this.shelfPreviews,
  });

  bool get isEmpty => shelfCount == 0;
}
