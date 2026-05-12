enum CommunityVisibility { public, private }

class Community {
  final int id;
  final String name;
  final String? description;
  final int bookId;
  final int ownerId;
  final String? currentUserRole;
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
    this.description,
    required this.bookId,
    required this.ownerId,
    this.currentUserRole,
    required this.bookTitle,
    required this.bookAuthor,
    this.bookCoverUrl,
    required this.memberCount,
    required this.visibility,
    required this.isMember,
    required this.createdAt,
  });

  bool get isPublic => visibility == CommunityVisibility.public;

  Community copyWith({
    int? id,
    String? name,
    String? description,
    int? bookId,
    int? ownerId,
    String? currentUserRole,
    String? bookTitle,
    String? bookAuthor,
    String? bookCoverUrl,
    int? memberCount,
    CommunityVisibility? visibility,
    bool? isMember,
    DateTime? createdAt,
  }) => Community(
    id: id ?? this.id,
    name: name ?? this.name,
    description: description ?? this.description,
    bookId: bookId ?? this.bookId,
    ownerId: ownerId ?? this.ownerId,
    currentUserRole: currentUserRole ?? this.currentUserRole,
    bookTitle: bookTitle ?? this.bookTitle,
    bookAuthor: bookAuthor ?? this.bookAuthor,
    bookCoverUrl: bookCoverUrl ?? this.bookCoverUrl,
    memberCount: memberCount ?? this.memberCount,
    visibility: visibility ?? this.visibility,
    isMember: isMember ?? this.isMember,
    createdAt: createdAt ?? this.createdAt,
  );
}
