import 'package:biblioo/features/collection/domain/shelf_preview.dart';

class ShelfPreviewModel {
  final int id;
  final String name;
  final int itemCount;
  final String? firstBookCoverUrl;

  const ShelfPreviewModel({
    required this.id,
    required this.name,
    required this.itemCount,
    this.firstBookCoverUrl,
  });

  factory ShelfPreviewModel.fromJson(Map<String, dynamic> json) =>
      ShelfPreviewModel(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        itemCount: (json['itemCount'] as num?)?.toInt() ?? 0,
        firstBookCoverUrl: json['firstBookCoverUrl'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'itemCount': itemCount,
        'firstBookCoverUrl': firstBookCoverUrl,
      };

  ShelfPreview toEntity() => ShelfPreview(
        id: id,
        name: name,
        itemCount: itemCount,
        firstBookCoverUrl: firstBookCoverUrl,
      );
}
