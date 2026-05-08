class FeedComment {
  final int id;
  final int userId;
  final String text;
  final int likeCount;
  final DateTime? createdAt;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final bool deleted;

  const FeedComment({
    required this.id,
    required this.userId,
    required this.text,
    required this.likeCount,
    this.createdAt,
    this.authorUsername,
    this.authorAvatarUrl,
    required this.deleted,
  });

  FeedComment copyWith({String? text, int? likeCount, bool? deleted}) {
    return FeedComment(
      id: id,
      userId: userId,
      text: text ?? this.text,
      likeCount: likeCount ?? this.likeCount,
      createdAt: createdAt,
      authorUsername: authorUsername,
      authorAvatarUrl: authorAvatarUrl,
      deleted: deleted ?? this.deleted,
    );
  }
}

class FeedCommentPage {
  final List<FeedComment> comments;
  final bool last;

  const FeedCommentPage({required this.comments, required this.last});
}
