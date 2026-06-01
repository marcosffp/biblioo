class FeedItem {
  final int contentId;
  final String contentType;
  final int authorId;
  final String? authorUsername;
  final String? authorAvatarUrl;
  final int score;
  final DateTime? createdAt;
  final FeedContent content;

  const FeedItem({
    required this.contentId,
    required this.contentType,
    required this.authorId,
    this.authorUsername,
    this.authorAvatarUrl,
    required this.score,
    this.createdAt,
    required this.content,
  });

  bool get isReview => contentType == 'REVIEW';
}

class FeedContent {
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
  final bool likedByCurrentUser;

  const FeedContent({
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
    required this.likedByCurrentUser,
  });

  FeedContent copyWith({
    int? likeCount,
    int? commentCount,
    bool? likedByCurrentUser,
  }) {
    return FeedContent(
      id: id,
      userId: userId,
      text: text,
      images: images,
      gifUrl: gifUrl,
      tags: tags,
      hasSpoiler: hasSpoiler,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      createdAt: createdAt,
      bookId: bookId,
      rating: rating,
      bookTitle: bookTitle,
      bookCoverUrl: bookCoverUrl,
      bookAuthors: bookAuthors,
      likedByCurrentUser: likedByCurrentUser ?? this.likedByCurrentUser,
    );
  }
}
