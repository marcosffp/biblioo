class CommunityMember {
  final int userId;
  final String? username;
  final String? avatarUrl;
  final String role;
  final DateTime joinedAt;

  const CommunityMember({
    required this.userId,
    required this.username,
    required this.avatarUrl,
    required this.role,
    required this.joinedAt,
  });
}
