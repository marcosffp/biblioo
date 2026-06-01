import 'package:biblioo/features/community/domain/community_invite.dart';

class CommunityInviteModel {
  final int id;
  final int communityId;
  final String communityName;
  final int inviterId;
  final String inviterUsername;
  final String status;
  final DateTime createdAt;

  const CommunityInviteModel({
    required this.id,
    required this.communityId,
    required this.communityName,
    required this.inviterId,
    required this.inviterUsername,
    required this.status,
    required this.createdAt,
  });

  factory CommunityInviteModel.fromApiJson(Map<String, dynamic> json) {
    return CommunityInviteModel(
      id: (json['id'] as num).toInt(),
      communityId: (json['communityId'] as num).toInt(),
      communityName: (json['communityName'] as String?) ?? 'Comunidade',
      inviterId: (json['inviterId'] as num?)?.toInt() ?? 0,
      inviterUsername:
          (json['inviterUsername'] as String?)?.trim().isNotEmpty == true
          ? (json['inviterUsername'] as String)
          : 'Usuário #${(json['inviterId'] as num?)?.toInt() ?? 0}',
      status: (json['status'] as String?) ?? 'PENDING',
      createdAt:
          DateTime.tryParse((json['createdAt'] as String?) ?? '') ??
          DateTime.now(),
    );
  }

  CommunityInvite toEntity() {
    return CommunityInvite(
      id: id,
      communityId: communityId,
      communityName: communityName,
      inviterId: inviterId,
      inviterUsername: inviterUsername,
      status: status,
      createdAt: createdAt,
    );
  }
}
