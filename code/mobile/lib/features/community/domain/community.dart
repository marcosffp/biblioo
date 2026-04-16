enum CommunityVisibility { public, private }

class Community {
  final int id;
  final String name;
  final String bookTitle;
  final String bookAuthor;
  final String? bookCoverUrl;
  final int memberCount;
  final CommunityVisibility visibility;
  final bool isMember;
  final DateTime createdAt;

  const Community({
    required this.id,
    required this.name,
    required this.bookTitle,
    required this.bookAuthor,
    this.bookCoverUrl,
    required this.memberCount,
    required this.visibility,
    required this.isMember,
    required this.createdAt,
  });

  bool get isPublic => visibility == CommunityVisibility.public;
}
