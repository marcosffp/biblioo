class UserSummaryModel {
  final int id;
  final String username;
  final String? avatarUrl;
  final bool isPrivate;

  const UserSummaryModel({
    required this.id,
    required this.username,
    this.avatarUrl,
    required this.isPrivate,
  });

  factory UserSummaryModel.fromJson(Map<String, dynamic> json) =>
      UserSummaryModel(
        id: (json['id'] as num).toInt(),
        username: json['username'] as String,
        avatarUrl: json['avatarUrl'] as String?,
        isPrivate: json['isPrivate'] as bool? ?? false,
      );
}

class FollowPageModel {
  final List<UserSummaryModel> users;
  final int page;
  final int size;
  final bool hasMore;

  const FollowPageModel({
    required this.users,
    required this.page,
    required this.size,
    required this.hasMore,
  });

  factory FollowPageModel.fromJson(Map<String, dynamic> json) => FollowPageModel(
    users: (json['users'] as List)
        .map((e) => UserSummaryModel.fromJson(e as Map<String, dynamic>))
        .toList(),
    page: json['page'] as int,
    size: json['size'] as int,
    hasMore: json['hasMore'] as bool,
  );
}