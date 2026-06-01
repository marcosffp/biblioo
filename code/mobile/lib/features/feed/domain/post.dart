class Post {
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

  const Post({
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
}
