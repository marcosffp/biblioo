import 'package:biblioo/features/feed/domain/post.dart';

class PostModel {
  final int id;
  final int userId;
  final String text;
  final List<String> images;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final int commentCount;
  final int likeCount;
  final DateTime? createdAt;

  const PostModel({
    required this.id,
    required this.userId,
    required this.text,
    required this.images,
    this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    required this.commentCount,
    required this.likeCount,
    this.createdAt,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      text: (json['text'] as String?) ?? '',
      images: _stringList(json['images']),
      gifUrl: json['gifUrl'] as String?,
      tags: _stringList(json['tags']),
      hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
      commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
      likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
      createdAt: _date(json['createdAt']),
    );
  }

  Post toEntity() {
    return Post(
      id: id,
      userId: userId,
      text: text,
      images: images,
      gifUrl: gifUrl,
      tags: tags,
      hasSpoiler: hasSpoiler,
      commentCount: commentCount,
      likeCount: likeCount,
      createdAt: createdAt,
    );
  }

  static List<String> _stringList(Object? value) {
    if (value is! List) return const [];
    return value.whereType<String>().toList();
  }

  static DateTime? _date(Object? value) {
    if (value is! String || value.isEmpty) return null;
    return DateTime.tryParse(value);
  }
}
