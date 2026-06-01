enum CommunityMessageType { user, memberJoined, memberLeft }

class CommunityMessage {
  final int id;
  final String? clientMessageId;
  final int communityId;
  final int authorId;
  final String content;
  final CommunityMessageType type;
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
    required this.type,
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
    CommunityMessageType? type,
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
      type: type ?? this.type,
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

CommunityMessageType parseCommunityMessageType(String? raw) {
  final normalized = (raw ?? '').trim().toUpperCase();
  if (normalized.contains('MEMBER_JOINED')) {
    return CommunityMessageType.memberJoined;
  }
  if (normalized.contains('MEMBER_LEFT')) {
    return CommunityMessageType.memberLeft;
  }
  return CommunityMessageType.user;
}

CommunityMessageType resolveCommunityMessageType(
  String? raw, {
  String? content,
  List<String>? images,
  String? gifUrl,
  List<String>? tags,
  int? parentMessageId,
  bool? deleted,
}) {
  final parsed = parseCommunityMessageType(raw);
  if (parsed == CommunityMessageType.user) {
    return parsed;
  }

  final hasMedia =
      (images != null && images.isNotEmpty) ||
      (gifUrl != null && gifUrl.isNotEmpty);
  final hasText = content != null && content.trim().isNotEmpty;
  final hasTags = tags != null && tags.isNotEmpty;
  final hasReply = parentMessageId != null;
  final isDeleted = deleted == true;

  if (hasText || hasMedia || hasTags || hasReply || isDeleted) {
    return CommunityMessageType.user;
  }

  return parsed;
}

String serializeCommunityMessageType(CommunityMessageType type) {
  switch (type) {
    case CommunityMessageType.memberJoined:
      return 'MEMBER_JOINED';
    case CommunityMessageType.memberLeft:
      return 'MEMBER_LEFT';
    case CommunityMessageType.user:
    default:
      return 'USER';
  }
}
