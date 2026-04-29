import 'package:biblioo/features/notification/domain/notification_item.dart';

class NotificationModel {
  final String id;
  final String type;
  final int actorId;
  final String actorUsername;
  final String? actorAvatarUrl;
  final int? entityId;
  final bool read;
  final String createdAt;

  const NotificationModel({
    required this.id,
    required this.type,
    required this.actorId,
    required this.actorUsername,
    required this.actorAvatarUrl,
    required this.entityId,
    required this.read,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    final rawEntityId = json['entityId'];
    int? parsedEntityId;
    if (rawEntityId is num) {
      parsedEntityId = rawEntityId.toInt();
    } else if (rawEntityId is String && rawEntityId.isNotEmpty) {
      parsedEntityId = int.tryParse(rawEntityId);
    }

    return NotificationModel(
      id: json['id'] as String,
      type: json['type'] as String,
      actorId: (json['actorId'] as num).toInt(),
      actorUsername: json['actorUsername'] as String,
      actorAvatarUrl: json['actorAvatarUrl'] as String?,
      entityId: parsedEntityId,
      read: (json['read'] as bool?) ?? false,
      createdAt: json['createdAt'] as String,
    );
  }

  NotificationItem toEntity() {
    return NotificationItem(
      id: id,
      type: _mapType(type),
      actorId: actorId,
      actorUsername: actorUsername,
      actorAvatarUrl: actorAvatarUrl,
      entityId: entityId,
      read: read,
      createdAt: DateTime.parse(createdAt),
    );
  }

  static NotificationType _mapType(String rawType) {
    switch (rawType) {
      case 'USER_FOLLOW_REQUESTED':
        return NotificationType.userFollowRequested;
      case 'USER_FOLLOWED':
        return NotificationType.userFollowed;
      case 'COMMENT_REPLIED':
        return NotificationType.commentReplied;
      case 'REVIEW_LIKED':
        return NotificationType.reviewLiked;
      case 'COMMUNITY_INVITE':
        return NotificationType.communityInvite;
      case 'COMMUNITY_JOIN_REQUEST':
        return NotificationType.communityJoinRequest;
      case 'COMMUNITY_JOIN_APPROVED':
        return NotificationType.communityJoinApproved;
      default:
        return NotificationType.userFollowed;
    }
  }
}
