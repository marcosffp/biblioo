enum NotificationType {
  userFollowRequested,
  userFollowed,
  commentReplied,
  reviewLiked,
  communityInvite,
  communityJoinRequest,
  communityJoinApproved,
}

class NotificationItem {
  final String id;
  final NotificationType type;
  final int? actorId;
  final String? actorUsername;
  final String? actorAvatarUrl;
  final int? entityId;
  final int? communityId;
  final bool read;
  final DateTime createdAt;

  const NotificationItem({
    required this.id,
    required this.type,
    required this.actorId,
    required this.actorUsername,
    required this.actorAvatarUrl,
    required this.entityId,
    required this.communityId,
    required this.read,
    required this.createdAt,
  });

  NotificationItem copyWith({bool? read}) {
    return NotificationItem(
      id: id,
      type: type,
      actorId: actorId,
      actorUsername: actorUsername,
      actorAvatarUrl: actorAvatarUrl,
      entityId: entityId,
      communityId: communityId,
      read: read ?? this.read,
      createdAt: createdAt,
    );
  }
}
