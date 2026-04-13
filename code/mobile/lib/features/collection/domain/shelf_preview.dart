class ShelfPreview {
  final int id;
  final String name;
  final int itemCount;
  final String? firstBookCoverUrl;

  const ShelfPreview({
    required this.id,
    required this.name,
    required this.itemCount,
    this.firstBookCoverUrl,
  });
}
