enum UserFollowStatus { none, following, requested }

class User {
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

  const User({
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

  bool get isFollowing => followStatus == UserFollowStatus.following;
  bool get isFollowRequested => followStatus == UserFollowStatus.requested;

  User copyWith({
    int? id,
    String? username,
    String? email,
    String? bio,
    String? avatarUrl,
    String? bannerUrl,
    bool? isPrivate,
    bool? restricted,
    UserFollowStatus? followStatus,
    String? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      bio: bio ?? this.bio,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      isPrivate: isPrivate ?? this.isPrivate,
      restricted: restricted ?? this.restricted,
      followStatus: followStatus ?? this.followStatus,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
