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
  final UserFollowStatus followStatus;
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
    this.followStatus = UserFollowStatus.none,
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
    followStatus: _parseFollowStatus(
      json['followStatus'] as String? ?? json['followState'] as String?,
    ),
    createdAt: json['createdAt'] as String?,
  );

  static UserFollowStatus _parseFollowStatus(String? raw) {
    switch ((raw ?? '').toUpperCase()) {
      case 'FOLLOWING':
      case 'ACCEPTED':
        return UserFollowStatus.following;
      case 'REQUESTED':
      case 'PENDING':
        return UserFollowStatus.requested;
      default:
        return UserFollowStatus.none;
    }
  }

  User toEntity() => User(
    id: id,
    username: username,
    email: email,
    bio: bio,
    avatarUrl: avatarUrl,
    bannerUrl: bannerUrl,
    isPrivate: isPrivate,
    restricted: restricted,
    followStatus: followStatus,
    createdAt: createdAt,
  );
}
