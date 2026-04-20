class CommunityPost {
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

  const CommunityPost({
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
}
