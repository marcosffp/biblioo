import 'package:biblioo/features/community/domain/community_message.dart';

class CommunityMessageModel {
  final int id;
  final int communityId;
  final int authorId;
  final String content;
  final List<String> images;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final bool deleted;
  final DateTime createdAt;

  const CommunityMessageModel({
    required this.id,
    required this.communityId,
    required this.authorId,
    required this.content,
    required this.images,
    this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    required this.deleted,
    required this.createdAt,
  });

  factory CommunityMessageModel.fromApiJson(Map<String, dynamic> json) =>
      CommunityMessageModel(
        id: (json['id'] as num).toInt(),
        communityId: (json['communityId'] as num).toInt(),
        authorId: (json['authorId'] as num).toInt(),
        content: (json['content'] as String?) ?? '',
        images: ((json['images'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        gifUrl: json['gifUrl'] as String?,
        tags: ((json['tags'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
        deleted: (json['deleted'] as bool?) ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  factory CommunityMessageModel.fromJson(Map<String, dynamic> json) =>
      CommunityMessageModel(
        id: (json['id'] as num).toInt(),
        communityId: (json['communityId'] as num).toInt(),
        authorId: (json['authorId'] as num).toInt(),
        content: (json['content'] as String?) ?? '',
        images: ((json['images'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        gifUrl: json['gifUrl'] as String?,
        tags: ((json['tags'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
        deleted: (json['deleted'] as bool?) ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {
    'id': id,
    'communityId': communityId,
    'authorId': authorId,
    'content': content,
    'images': images,
    'gifUrl': gifUrl,
    'tags': tags,
    'hasSpoiler': hasSpoiler,
    'deleted': deleted,
    'createdAt': createdAt.toIso8601String(),
  };

  CommunityMessage toEntity() => CommunityMessage(
    id: id,
    communityId: communityId,
    authorId: authorId,
    content: content,
    images: images,
    gifUrl: gifUrl,
    tags: tags,
    hasSpoiler: hasSpoiler,
    deleted: deleted,
    createdAt: createdAt,
  );
}
