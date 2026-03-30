class User {
  final int id;
  final String username;
  final String? email;
  final String? bio;
  final String? avatarUrl;
  final String? bannerUrl;
  final bool isPrivate;
  final bool restricted;
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
    this.createdAt,
  });
}