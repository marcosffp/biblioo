import 'package:biblioo/features/community/domain/community.dart';

class CommunityModel {
  final int id;
  final String name;
  final String? description;
  final int bookId;
  final int ownerId;
  final String type;
  final String bookTitle;
  final String bookAuthor;
  final String? bookCoverUrl;
  final int memberCount;
  final bool isMember;
  final DateTime createdAt;

  const CommunityModel({
    required this.id,
    required this.name,
    this.description,
    required this.bookId,
    required this.ownerId,
    required this.type,
    required this.bookTitle,
    required this.bookAuthor,
    this.bookCoverUrl,
    required this.memberCount,
    required this.isMember,
    required this.createdAt,
  });

  factory CommunityModel.fromApiJson(Map<String, dynamic> json) =>
      CommunityModel(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        description: json['description'] as String?,
        bookId: (json['bookId'] as num?)?.toInt() ?? 0,
        ownerId: (json['ownerId'] as num?)?.toInt() ?? 0,
        type: (json['type'] as String?) ?? 'PUBLIC',
        bookTitle: 'Livro #${(json['bookId'] as num?)?.toInt() ?? 0}',
        bookAuthor: '',
        bookCoverUrl: null,
        memberCount: (json['memberCount'] as num).toInt(),
        isMember: json['isMember'] as bool? ?? json['currentUserRole'] != null,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  factory CommunityModel.fromJson(Map<String, dynamic> json) => CommunityModel(
    id: (json['id'] as num).toInt(),
    name: json['name'] as String,
    description: json['description'] as String?,
    bookId: (json['bookId'] as num?)?.toInt() ?? 0,
    ownerId: (json['ownerId'] as num?)?.toInt() ?? 0,
    type: (json['type'] as String?) ?? 'PUBLIC',
    bookTitle:
        (json['bookTitle'] as String?) ??
        'Livro #${(json['bookId'] as num?)?.toInt() ?? 0}',
    bookAuthor: (json['bookAuthor'] as String?) ?? '',
    bookCoverUrl: json['bookCoverUrl'] as String?,
    memberCount: (json['memberCount'] as num?)?.toInt() ?? 0,
    isMember: json['isMember'] as bool? ?? false,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'bookId': bookId,
    'ownerId': ownerId,
    'type': type,
    'bookTitle': bookTitle,
    'bookAuthor': bookAuthor,
    'bookCoverUrl': bookCoverUrl,
    'memberCount': memberCount,
    'isMember': isMember,
    'createdAt': createdAt.toIso8601String(),
  };

  CommunityModel copyWith({
    int? id,
    String? name,
    String? description,
    int? bookId,
    int? ownerId,
    String? type,
    String? bookTitle,
    String? bookAuthor,
    String? bookCoverUrl,
    int? memberCount,
    bool? isMember,
    DateTime? createdAt,
  }) => CommunityModel(
    id: id ?? this.id,
    name: name ?? this.name,
    description: description ?? this.description,
    bookId: bookId ?? this.bookId,
    ownerId: ownerId ?? this.ownerId,
    type: type ?? this.type,
    bookTitle: bookTitle ?? this.bookTitle,
    bookAuthor: bookAuthor ?? this.bookAuthor,
    bookCoverUrl: bookCoverUrl ?? this.bookCoverUrl,
    memberCount: memberCount ?? this.memberCount,
    isMember: isMember ?? this.isMember,
    createdAt: createdAt ?? this.createdAt,
  );

  Community toEntity() => Community(
    id: id,
    name: name,
    description: description,
    bookId: bookId,
    ownerId: ownerId,
    bookTitle: bookTitle,
    bookAuthor: bookAuthor,
    bookCoverUrl: bookCoverUrl,
    memberCount: memberCount,
    visibility: type == 'PRIVATE'
        ? CommunityVisibility.private
        : CommunityVisibility.public,
    isMember: isMember,
    createdAt: createdAt,
  );
}
