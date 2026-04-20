import 'package:biblioo/features/community/domain/community_post.dart';

class CommunityPostModel {
  final int id;
  final int communityId;
  final int userId;
  final String text;
  final List<String> images;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final int? pageRef;
  final int likeCount;
  final int commentCount;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const CommunityPostModel({
    required this.id,
    required this.communityId,
    required this.userId,
    required this.text,
    required this.images,
    this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    this.pageRef,
    required this.likeCount,
    required this.commentCount,
    required this.createdAt,
    this.updatedAt,
  });

  factory CommunityPostModel.fromApiJson(Map<String, dynamic> json) =>
      CommunityPostModel(
        id: (json['id'] as num).toInt(),
        communityId: (json['communityId'] as num).toInt(),
        userId: (json['userId'] as num).toInt(),
        text: (json['text'] as String?) ?? '',
        images: ((json['images'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        gifUrl: json['gifUrl'] as String?,
        tags: ((json['tags'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
        pageRef: (json['pageRef'] as num?)?.toInt(),
        likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
        commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: json['updatedAt'] != null
            ? DateTime.tryParse(json['updatedAt'] as String)
            : null,
      );

  factory CommunityPostModel.fromJson(Map<String, dynamic> json) =>
      CommunityPostModel(
        id: (json['id'] as num).toInt(),
        communityId: (json['communityId'] as num).toInt(),
        userId: (json['userId'] as num).toInt(),
        text: (json['text'] as String?) ?? '',
        images: ((json['images'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        gifUrl: json['gifUrl'] as String?,
        tags: ((json['tags'] as List<dynamic>?) ?? const [])
            .map((e) => e.toString())
            .toList(),
        hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
        pageRef: (json['pageRef'] as num?)?.toInt(),
        likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
        commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: json['updatedAt'] != null
            ? DateTime.tryParse(json['updatedAt'] as String)
            : null,
      );

  Map<String, dynamic> toJson() => {
    'id': id,
    'communityId': communityId,
    'userId': userId,
    'text': text,
    'images': images,
    'gifUrl': gifUrl,
    'tags': tags,
    'hasSpoiler': hasSpoiler,
    'pageRef': pageRef,
    'likeCount': likeCount,
    'commentCount': commentCount,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
  };

  CommunityPost toEntity() => CommunityPost(
    id: id,
    communityId: communityId,
    userId: userId,
    text: text,
    images: images,
    gifUrl: gifUrl,
    tags: tags,
    hasSpoiler: hasSpoiler,
    pageRef: pageRef,
    likeCount: likeCount,
    commentCount: commentCount,
    createdAt: createdAt,
    updatedAt: updatedAt,
  );
}
