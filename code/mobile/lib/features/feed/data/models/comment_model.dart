import 'package:biblioo/features/feed/domain/comment.dart';

class FeedCommentModel {
  final int id;
  final int userId;
  final String text;
  final int likeCount;
  final DateTime? createdAt;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final bool deleted;
  final bool likedByCurrentUser;

  const FeedCommentModel({
    required this.id,
    required this.userId,
    required this.text,
    required this.likeCount,
    this.createdAt,
    this.authorUsername,
    this.authorAvatarUrl,
    required this.deleted,
    required this.likedByCurrentUser,
  });

  factory FeedCommentModel.fromJson(Map<String, dynamic> json) {
    return FeedCommentModel(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      text: (json['text'] as String?) ?? '',
      likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
      createdAt: _date(json['createdAt']),
      authorUsername: json['authorUsername'] as String?,
      authorAvatarUrl: json['authorAvatarUrl'] as String?,
      deleted: (json['deleted'] as bool?) ?? false,
      likedByCurrentUser: (json['likedByCurrentUser'] as bool?) ?? false,
    );
  }

  FeedComment toEntity() {
    return FeedComment(
      id: id,
      userId: userId,
      text: text,
      likeCount: likeCount,
      createdAt: createdAt,
      authorUsername: authorUsername,
      authorAvatarUrl: authorAvatarUrl,
      deleted: deleted,
      likedByCurrentUser: likedByCurrentUser,
    );
  }

  static DateTime? _date(Object? value) {
    if (value is! String || value.isEmpty) return null;
    return DateTime.tryParse(value);
  }
}

class FeedCommentPageModel {
  final List<FeedCommentModel> comments;
  final bool last;

  const FeedCommentPageModel({required this.comments, required this.last});

  factory FeedCommentPageModel.fromJson(Map<String, dynamic> json) {
    final content = json['content'];
    return FeedCommentPageModel(
      comments: content is List
          ? content
                .map(
                  (item) =>
                      FeedCommentModel.fromJson(item as Map<String, dynamic>),
                )
                .toList()
          : const [],
      last: (json['last'] as bool?) ?? true,
    );
  }

  FeedCommentPage toEntity() {
    return FeedCommentPage(
      comments: comments.map((comment) => comment.toEntity()).toList(),
      last: last,
    );
  }
}
