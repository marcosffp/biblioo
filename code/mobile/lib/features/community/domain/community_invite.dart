class CommunityInvite {
  final int id;
  final int communityId;
  final String communityName;
  final int inviterId;
  final String inviterUsername;
  final String status;
  final DateTime createdAt;

  const CommunityInvite({
    required this.id,
    required this.communityId,
    required this.communityName,
    required this.inviterId,
    required this.inviterUsername,
    required this.status,
    required this.createdAt,
  });

  bool get isPending => status.toUpperCase() == 'PENDING';
}
