import 'package:biblioo/features/feed/domain/review.dart';

class ReviewModel {
  final int id;
  final int userId;
  final int bookId;
  final String text;
  final List<String> images;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final int rating;
  final int commentCount;
  final int likeCount;

  const ReviewModel({
    required this.id,
    required this.userId,
    required this.bookId,
    required this.text,
    required this.images,
    this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    required this.rating,
    required this.commentCount,
    required this.likeCount,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      bookId: (json['bookId'] as num).toInt(),
      text: (json['text'] as String?) ?? '',
      images: _stringList(json['images']),
      gifUrl: json['gifUrl'] as String?,
      tags: _stringList(json['tags']),
      hasSpoiler: (json['hasSpoiler'] as bool?) ?? false,
      rating: (json['rating'] as num).toInt(),
      commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
      likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'bookId': bookId,
      'text': text,
      'images': images,
      'gifUrl': gifUrl,
      'tags': tags,
      'hasSpoiler': hasSpoiler,
      'rating': rating,
      'commentCount': commentCount,
      'likeCount': likeCount,
    };
  }

  Review toEntity() {
    return Review(
      id: id,
      userId: userId,
      bookId: bookId,
      text: text,
      images: images,
      gifUrl: gifUrl,
      tags: tags,
      hasSpoiler: hasSpoiler,
      rating: rating,
      commentCount: commentCount,
      likeCount: likeCount,
    );
  }

  static List<String> _stringList(Object? value) {
    if (value is! List) return const [];
    return value.whereType<String>().toList();
  }
}
