import 'package:biblioo/features/user/domain/user.dart';

class UserModel {
  final int id;
  final String username;
  final String? email;
  final String? bio;
  final String? avatarUrl;
  final String? bannerUrl;
  final bool isPrivate;
  final bool restricted;
  final bool isFollowing;
  final String? createdAt;

  const UserModel({
    required this.id,
    required this.username,
    this.email,
    this.bio,
    this.avatarUrl,
    this.bannerUrl,
    required this.isPrivate,
    required this.restricted,
    this.isFollowing = false,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: (json['id'] as num).toInt(),
    username: json['username'] as String,
    email: json['email'] as String?,
    bio: json['bio'] as String?,
    avatarUrl: json['avatarUrl'] as String?,
    bannerUrl: json['bannerUrl'] as String?,
    isPrivate: json['isPrivate'] as bool? ?? false,
    restricted: json['restricted'] as bool? ?? false,
    isFollowing: json['isFollowing'] as bool? ?? false,
    createdAt: json['createdAt'] as String?,
  );

  User toEntity() => User(
    id: id,
    username: username,
    email: email,
    bio: bio,
    avatarUrl: avatarUrl,
    bannerUrl: bannerUrl,
    isPrivate: isPrivate,
    restricted: restricted,
    isFollowing: isFollowing,
    createdAt: createdAt,
  );
}
