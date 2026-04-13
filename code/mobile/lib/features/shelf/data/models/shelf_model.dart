import 'package:biblioo/features/shelf/domain/shelf.dart';

/// Model de serialização para Shelf — fromJson / toJson / toEntity.
/// Mapeia tanto ShelfResponse quanto ShelfSummaryResponse do backend.
class ShelfModel {
  final int id;
  final String name;
  final String? description;
  final int itemCount;
  final List<String> coverPreview;

  const ShelfModel({
    required this.id,
    required this.name,
    this.description,
    required this.itemCount,
    required this.coverPreview,
  });

  factory ShelfModel.fromJson(Map<String, dynamic> json) => ShelfModel(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        description: json['description'] as String?,
        itemCount: (json['itemCount'] as num?)?.toInt() ?? 0,
        coverPreview: (json['coverPreview'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'itemCount': itemCount,
        'coverPreview': coverPreview,
      };

  Shelf toEntity() => Shelf(
        id: id,
        name: name,
        description: description,
        itemCount: itemCount,
        coverPreview: coverPreview,
      );
}
