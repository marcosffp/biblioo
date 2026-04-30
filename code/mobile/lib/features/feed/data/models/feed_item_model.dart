import 'package:biblioo/features/feed/domain/feed_item.dart';

class FeedItemModel {
  final int contentId;
  final String contentType;
  final int authorId;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final int score;
  final DateTime? createdAt;
  final FeedContentModel content;

  const FeedItemModel({
    required this.contentId,
    required this.contentType,
    required this.authorId,
    this.authorUsername,
    this.authorAvatarUrl,
    required this.score,
    this.createdAt,
    required this.content,
  });

  factory FeedItemModel.fromJson(Map<String, dynamic> json) {
    return FeedItemModel(
      contentId: (json['contentId'] as num).toInt(),
      contentType: json['contentType'] as String,
      authorId: (json['authorId'] as num).toInt(),
      authorUsername: json['authorUsername'] as String?,
      authorAvatarUrl: json['authorAvatarUrl'] as String?,
      score: (json['score'] as num).toInt(),
      createdAt: _date(json['createdAt']),
      content: FeedContentModel.fromJson(
        json['content'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'contentId': contentId,
      'contentType': contentType,
      'authorId': authorId,
      'authorUsername': authorUsername,
      'authorAvatarUrl': authorAvatarUrl,
      'score': score,
      'createdAt': createdAt?.toIso8601String(),
      'content': content.toJson(),
    };
  }

  FeedItem toEntity() {
    return FeedItem(
      contentId: contentId,
      contentType: contentType,
      authorId: authorId,
      authorUsername: authorUsername,
      authorAvatarUrl: authorAvatarUrl,
      score: score,
      createdAt: createdAt,
      content: content.toEntity(),
    );
  }

  static DateTime? _date(Object? value) {
    if (value is! String || value.isEmpty) return null;
    return DateTime.tryParse(value);
  }
}

class FeedContentModel {
  final int id;
  final int userId;
  final String text;
  final List<String> images;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final int likeCount;
  final int commentCount;
  final DateTime? createdAt;
  final int? bookId;
  final int? rating;
  final String? bookTitle;
  final String? bookCoverUrl;
  final List<String> bookAuthors;

  const FeedContentModel({
    required this.id,
    required this.userId,
    required this.text,
    required this.images,
    this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    required this.likeCount,
    required this.commentCount,
    this.createdAt,
    this.bookId,
    this.rating,
    this.bookTitle,
    this.bookCoverUrl,
    required this.bookAuthors,
  });

  factory FeedContentModel.fromJson(Map<String, dynamic> json) {
    return FeedContentModel(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      text: (json['text'] as String?) ?? '',
      images: _stringList(json['images']),
      gifUrl: json['gifUrl'] as String?,
      tags: _stringList(json['tags']),
      hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
      likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
      commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
      createdAt: FeedItemModel._date(json['createdAt']),
      bookId: (json['bookId'] as num?)?.toInt(),
      rating: (json['rating'] as num?)?.toInt(),
      bookTitle: json['bookTitle'] as String?,
      bookCoverUrl: json['bookCoverUrl'] as String?,
      bookAuthors: _stringList(json['bookAuthors']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'text': text,
      'images': images,
      'gifUrl': gifUrl,
      'tags': tags,
      'hasSpoiler': hasSpoiler,
      'likeCount': likeCount,
      'commentCount': commentCount,
      'createdAt': createdAt?.toIso8601String(),
      'bookId': bookId,
      'rating': rating,
      'bookTitle': bookTitle,
      'bookCoverUrl': bookCoverUrl,
      'bookAuthors': bookAuthors,
    };
  }

  FeedContent toEntity() {
    return FeedContent(
      id: id,
      userId: userId,
      text: text,
      images: images,
      gifUrl: gifUrl,
      tags: tags,
      hasSpoiler: hasSpoiler,
      likeCount: likeCount,
      commentCount: commentCount,
      createdAt: createdAt,
      bookId: bookId,
      rating: rating,
      bookTitle: bookTitle,
      bookCoverUrl: bookCoverUrl,
      bookAuthors: bookAuthors,
    );
  }

  static List<String> _stringList(Object? value) {
    if (value is! List) return const [];
    return value.whereType<String>().toList();
  }
}
