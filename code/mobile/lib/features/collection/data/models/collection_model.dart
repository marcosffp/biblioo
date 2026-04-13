import 'package:biblioo/features/collection/domain/collection.dart';
import 'shelf_preview_model.dart';

class CollectionModel {
  final int id;
  final String name;
  final String? description;
  final int shelfCount;
  final List<ShelfPreviewModel> shelfPreviews;

  const CollectionModel({
    required this.id,
    required this.name,
    this.description,
    required this.shelfCount,
    required this.shelfPreviews,
  });

  factory CollectionModel.fromJson(Map<String, dynamic> json) =>
      CollectionModel(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        description: json['description'] as String?,
        shelfCount: (json['shelfCount'] as num?)?.toInt() ?? 0,
        shelfPreviews: (json['shelfPreviews'] as List<dynamic>?)
                ?.map((e) =>
                    ShelfPreviewModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'shelfCount': shelfCount,
        'shelfPreviews': shelfPreviews.map((e) => e.toJson()).toList(),
      };

  Collection toEntity() => Collection(
        id: id,
        name: name,
        description: description,
        shelfCount: shelfCount,
        shelfPreviews: shelfPreviews.map((e) => e.toEntity()).toList(),
      );
}
