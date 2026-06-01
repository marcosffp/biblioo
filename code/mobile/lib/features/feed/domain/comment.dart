class FeedComment {
  final int id;
  final int userId;
  final String text;
  final int likeCount;
  final DateTime? createdAt;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final bool deleted;
  final bool likedByCurrentUser;

  const FeedComment({
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

  FeedComment copyWith({
    String? text,
    int? likeCount,
    bool? deleted,
    bool? likedByCurrentUser,
  }) {
    return FeedComment(
      id: id,
      userId: userId,
      text: text ?? this.text,
      likeCount: likeCount ?? this.likeCount,
      createdAt: createdAt,
      authorUsername: authorUsername,
      authorAvatarUrl: authorAvatarUrl,
      deleted: deleted ?? this.deleted,
      likedByCurrentUser: likedByCurrentUser ?? this.likedByCurrentUser,
    );
  }
}

class FeedCommentPage {
  final List<FeedComment> comments;
  final bool last;

  const FeedCommentPage({required this.comments, required this.last});
}
