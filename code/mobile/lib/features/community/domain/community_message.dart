class CommunityMessage {
  final int id;
  final String? clientMessageId;
  final int communityId;
  final int authorId;
  final String content;
  final int? parentMessageId;
  final List<String> tags;
  final List<String> images;
  final String? gifUrl;
  final bool hasSpoiler;
  final int heartCount;
  final bool deleted;
  final DateTime createdAt;
  final DateTime? editedAt;

  const CommunityMessage({
    required this.id,
    this.clientMessageId,
    required this.communityId,
    required this.authorId,
    required this.content,
    this.parentMessageId,
    this.tags = const [],
    required this.images,
    this.gifUrl,
    required this.hasSpoiler,
    this.heartCount = 0,
    required this.deleted,
    required this.createdAt,
    this.editedAt,
  });
}
