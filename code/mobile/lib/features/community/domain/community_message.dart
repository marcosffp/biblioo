class CommunityMessage {
  final int id;
  final int communityId;
  final int authorId;
  final String content;
  final List<String> images;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final bool deleted;
  final DateTime createdAt;

  const CommunityMessage({
    required this.id,
    required this.communityId,
    required this.authorId,
    required this.content,
    required this.images,
    this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    required this.deleted,
    required this.createdAt,
  });
}
