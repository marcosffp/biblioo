class User {
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

  const User({
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

  User copyWith({
    int? id,
    String? username,
    String? email,
    String? bio,
    String? avatarUrl,
    String? bannerUrl,
    bool? isPrivate,
    bool? restricted,
    bool? isFollowing,
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
      isFollowing: isFollowing ?? this.isFollowing,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
