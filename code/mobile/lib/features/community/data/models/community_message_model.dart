import 'package:biblioo/features/community/domain/community_message.dart';

class CommunityMessageModel {
  final int id;
  final String? clientMessageId;
  final int communityId;
  final int authorId;
  final String content;
  final int? parentMessageId;
  final List<String> tags;
  final List<String> images;
  final String? gifUrl;
  final bool hasSpoiler;
  final int heartCount;
  final bool deleted;
  final DateTime createdAt;
  final DateTime? editedAt;

  const CommunityMessageModel({
    required this.id,
    this.clientMessageId,
    required this.communityId,
    required this.authorId,
    required this.content,
    this.parentMessageId,
    required this.tags,
    required this.images,
    this.gifUrl,
    required this.hasSpoiler,
    required this.heartCount,
    required this.deleted,
    required this.createdAt,
    this.editedAt,
  });

  factory CommunityMessageModel.fromApiJson(Map<String, dynamic> json) =>
      CommunityMessageModel(
        id: (json['id'] as num).toInt(),
        clientMessageId: json['clientMessageId'] as String?,
        communityId: (json['communityId'] as num).toInt(),
        authorId: (json['authorId'] as num).toInt(),
        content: (json['content'] as String?) ?? '',
        parentMessageId: (json['parentMessageId'] as num?)?.toInt(),
        tags: ((json['tags'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        images: ((json['images'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        gifUrl: json['gifUrl'] as String?,
        hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
        heartCount: (json['heartCount'] as num?)?.toInt() ?? 0,
        deleted: (json['deleted'] as bool?) ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
        editedAt: json['editedAt'] != null
            ? DateTime.tryParse(json['editedAt'] as String)
            : null,
      );

  factory CommunityMessageModel.fromJson(Map<String, dynamic> json) =>
      CommunityMessageModel(
        id: (json['id'] as num).toInt(),
        clientMessageId: json['clientMessageId'] as String?,
        communityId: (json['communityId'] as num).toInt(),
        authorId: (json['authorId'] as num).toInt(),
        content: (json['content'] as String?) ?? '',
        parentMessageId: (json['parentMessageId'] as num?)?.toInt(),
        tags: ((json['tags'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        images: ((json['images'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        gifUrl: json['gifUrl'] as String?,
        hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
        heartCount: (json['heartCount'] as num?)?.toInt() ?? 0,
        deleted: (json['deleted'] as bool?) ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
        editedAt: json['editedAt'] != null
            ? DateTime.tryParse(json['editedAt'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
    'id': id,
    'clientMessageId': clientMessageId,
    'communityId': communityId,
    'authorId': authorId,
    'content': content,
    'parentMessageId': parentMessageId,
    'tags': tags,
    'images': images,
    'gifUrl': gifUrl,
    'hasSpoiler': hasSpoiler,
    'heartCount': heartCount,
    'deleted': deleted,
    'createdAt': createdAt.toIso8601String(),
    'editedAt': editedAt?.toIso8601String(),
  };

  CommunityMessage toEntity() => CommunityMessage(
    id: id,
    clientMessageId: clientMessageId,
    communityId: communityId,
    authorId: authorId,
    content: content,
    parentMessageId: parentMessageId,
    tags: tags,
    images: images,
    gifUrl: gifUrl,
    hasSpoiler: hasSpoiler,
    heartCount: heartCount,
    deleted: deleted,
    createdAt: createdAt,
    editedAt: editedAt,
  );
}
