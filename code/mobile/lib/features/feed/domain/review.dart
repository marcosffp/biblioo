class Review {
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

  const Review({
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
}
