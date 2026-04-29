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

  CommunityMessage copyWith({
    int? id,
    String? clientMessageId,
    int? communityId,
    int? authorId,
    String? content,
    int? parentMessageId,
    List<String>? tags,
    List<String>? images,
    String? gifUrl,
    bool? hasSpoiler,
    int? heartCount,
    bool? deleted,
    DateTime? createdAt,
    DateTime? editedAt,
  }) {
    return CommunityMessage(
      id: id ?? this.id,
      clientMessageId: clientMessageId ?? this.clientMessageId,
      communityId: communityId ?? this.communityId,
      authorId: authorId ?? this.authorId,
      content: content ?? this.content,
      parentMessageId: parentMessageId ?? this.parentMessageId,
      tags: tags ?? this.tags,
      images: images ?? this.images,
      gifUrl: gifUrl ?? this.gifUrl,
      hasSpoiler: hasSpoiler ?? this.hasSpoiler,
      heartCount: heartCount ?? this.heartCount,
      deleted: deleted ?? this.deleted,
      createdAt: createdAt ?? this.createdAt,
      editedAt: editedAt ?? this.editedAt,
    );
  }
}
