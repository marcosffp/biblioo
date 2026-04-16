import 'package:biblioo/features/community/domain/community.dart';

class CommunityModel {
  final int id;
  final String name;
  final String bookTitle;
  final String bookAuthor;
  final String? bookCoverUrl;
  final int memberCount;
  final String visibility;
  final bool isMember;
  final DateTime createdAt;

  const CommunityModel({
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

  factory CommunityModel.fromJson(Map<String, dynamic> json) => CommunityModel(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        bookTitle: json['bookTitle'] as String,
        bookAuthor: json['bookAuthor'] as String,
        bookCoverUrl: json['bookCoverUrl'] as String?,
        memberCount: (json['memberCount'] as num).toInt(),
        visibility: json['visibility'] as String,
        isMember: json['isMember'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  Community toEntity() => Community(
        id: id,
        name: name,
        bookTitle: bookTitle,
        bookAuthor: bookAuthor,
        bookCoverUrl: bookCoverUrl,
        memberCount: memberCount,
        visibility: visibility == 'PRIVATE'
            ? CommunityVisibility.private
            : CommunityVisibility.public,
        isMember: isMember,
        createdAt: createdAt,
      );
}
