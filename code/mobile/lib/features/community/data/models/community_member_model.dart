import 'package:biblioo/features/community/domain/community_member.dart';

class CommunityMemberModel {
  final int userId;
  final String? username;
  final String? avatarUrl;
  final String role;
  final DateTime joinedAt;

  const CommunityMemberModel({
    required this.userId,
    required this.username,
    required this.avatarUrl,
    required this.role,
    required this.joinedAt,
  });

  factory CommunityMemberModel.fromApiJson(Map<String, dynamic> json) =>
      CommunityMemberModel(
        userId: (json['userId'] as num).toInt(),
        username: json['username'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        role: (json['role'] as String?) ?? 'MEMBER',
        joinedAt: DateTime.parse(json['joinedAt'] as String),
      );

  factory CommunityMemberModel.fromJson(Map<String, dynamic> json) =>
      CommunityMemberModel(
        userId: (json['userId'] as num).toInt(),
        username: json['username'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        role: (json['role'] as String?) ?? 'MEMBER',
        joinedAt: DateTime.parse(json['joinedAt'] as String),
      );

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'username': username,
    'avatarUrl': avatarUrl,
    'role': role,
    'joinedAt': joinedAt.toIso8601String(),
  };

  CommunityMember toEntity() => CommunityMember(
    userId: userId,
    username: username,
    avatarUrl: avatarUrl,
    role: role,
    joinedAt: joinedAt,
  );
}
