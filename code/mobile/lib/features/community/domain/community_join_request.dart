class CommunityJoinRequest {
  final int id;
  final int communityId;
  final int userId;
  final String username;
  final String? avatarUrl;
  final String status;
  final DateTime createdAt;

  const CommunityJoinRequest({
    required this.id,
    required this.communityId,
    required this.userId,
    required this.username,
    required this.avatarUrl,
    required this.status,
    required this.createdAt,
  });

  bool get isPending => status.toUpperCase() == 'PENDING';
}
