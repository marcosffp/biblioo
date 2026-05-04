import 'package:biblioo/features/community/domain/community_join_request.dart';

class CommunityJoinRequestModel {
  final int id;
  final int communityId;
  final int userId;
  final String username;
  final String? avatarUrl;
  final String status;
  final DateTime createdAt;

  const CommunityJoinRequestModel({
    required this.id,
    required this.communityId,
    required this.userId,
    required this.username,
    required this.avatarUrl,
    required this.status,
    required this.createdAt,
  });

  factory CommunityJoinRequestModel.fromApiJson(Map<String, dynamic> json) {
    return CommunityJoinRequestModel(
      id: (json['id'] as num).toInt(),
      communityId: (json['communityId'] as num?)?.toInt() ?? 0,
      userId: (json['userId'] as num).toInt(),
      username: (json['username'] as String?)?.trim().isNotEmpty == true
          ? (json['username'] as String)
          : 'Usuário #${(json['userId'] as num).toInt()}',
      avatarUrl: json['avatarUrl'] as String?,
      status: (json['status'] as String?) ?? 'PENDING',
      createdAt:
          DateTime.tryParse((json['createdAt'] as String?) ?? '') ??
          DateTime.now(),
    );
  }

  CommunityJoinRequest toEntity() {
    return CommunityJoinRequest(
      id: id,
      communityId: communityId,
      userId: userId,
      username: username,
      avatarUrl: avatarUrl,
      status: status,
      createdAt: createdAt,
    );
  }
}
