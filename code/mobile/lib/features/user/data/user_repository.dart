import 'package:biblioo/features/auth/data/auth_local_datasource.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'user_remote_datasource.dart';
import 'user_local_datasource.dart';
import 'models/user_model.dart';
import 'models/follow_page_model.dart';

class UserRepository {
  final UserRemoteDatasource _remote;
  final UserLocalDatasource _local;
  final AuthLocalDatasource _authLocal;

  const UserRepository(this._remote, this._local, this._authLocal);

  // lê cache primeiro, sincroniza em background
  Future<User> getMe() async {
    final cached = _local.getProfile();

    try {
      final fresh = await _remote.getMe();
      await _local.saveProfile(fresh);
      return fresh.toEntity();
    } catch (_) {
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }

  Future<User> getByUsername(String username) async {
    final model = await _remote.getByUsername(username);
    final user = model.toEntity();
    final relationship = await _resolveFollowRelationship(username);
    return user.copyWith(followStatus: relationship);
  }

  Future<User> updateProfile({
    String? username,
    String? bio,
    String? avatarUrl,
    String? bannerUrl,
  }) async {
    final model = await _remote.updateProfile(
      username: username,
      bio: bio,
      avatarUrl: avatarUrl,
      bannerUrl: bannerUrl,
    );
    await _local.saveProfile(model);
    await _syncSessionUserFromProfile(model);
    return model.toEntity();
  }

  Future<User> updateVisibility({required bool isPrivate}) async {
    final model = await _remote.updateVisibility(isPrivate: isPrivate);
    await _local.saveProfile(model);
    await _syncSessionUserFromProfile(model);
    return model.toEntity();
  }

  Future<User> uploadAvatar(String filePath) async {
    final model = await _remote.uploadAvatar(filePath);
    await _local.saveProfile(model);
    await _syncSessionUserFromProfile(model);
    return model.toEntity();
  }

  Future<User> uploadBanner(String filePath) async {
    final model = await _remote.uploadBanner(filePath);
    await _local.saveProfile(model);
    await _syncSessionUserFromProfile(model);
    return model.toEntity();
  }

  Future<UserFollowStatus> follow(String username) async {
    final status = await _remote.follow(username);
    if (status == UserFollowStatus.requested) {
      await _local.markFollowRequested(username);
    } else {
      await _local.clearFollowRequested(username);
    }
    return status;
  }

  Future<void> unfollow(String username) async {
    await _remote.unfollow(username);
    await _local.clearFollowRequested(username);
  }

  Future<void> acceptFollowRequest(String requesterUsername) {
    return _remote.acceptFollowRequest(requesterUsername);
  }

  Future<void> rejectFollowRequest(String requesterUsername) {
    return _remote.rejectFollowRequest(requesterUsername);
  }

  Future<void> deleteAccount() async {
    await _remote.deleteAccount();
    await _local.clearProfile();
  }

  Future<FollowPageModel> searchUsers({
    required String query,
    int page = 0,
    int size = 20,
  }) => _remote.searchUsers(query: query, page: page, size: size);

  Future<FollowPageModel> getFollowers(String username, {int page = 0}) =>
      _remote.getFollowers(username, page: page);

  Future<FollowPageModel> getFollowing(String username, {int page = 0}) =>
      _remote.getFollowing(username, page: page);

  Future<List<UserSummaryModel>> getAllFollowers(String username) async {
    final users = <UserSummaryModel>[];
    var page = 0;

    while (true) {
      final result = await _remote.getFollowers(username, page: page, size: 50);
      users.addAll(result.users);
      if (!result.hasMore || result.users.isEmpty) break;
      page += 1;
    }

    return users;
  }

  Future<List<UserSummaryModel>> getAllFollowing(String username) async {
    final users = <UserSummaryModel>[];
    var page = 0;

    while (true) {
      final result = await _remote.getFollowing(username, page: page, size: 50);
      users.addAll(result.users);
      if (!result.hasMore || result.users.isEmpty) break;
      page += 1;
    }

    return users;
  }

  Future<UserFollowStatus> getFollowRelationship(String username) async {
    final sessionUser = _authLocal.getSessionUser();
    if (sessionUser == null) return UserFollowStatus.none;
    if (sessionUser.username.toLowerCase() == username.toLowerCase()) {
      return UserFollowStatus.none;
    }

    final following = await getAllFollowing(sessionUser.username);
    final isFollowing = following.any(
      (user) => user.username.toLowerCase() == username.toLowerCase(),
    );
    if (isFollowing) return UserFollowStatus.following;

    if (_local.isFollowRequested(username)) {
      return UserFollowStatus.requested;
    }

    return UserFollowStatus.none;
  }

  Future<UserFollowStatus> _resolveFollowRelationship(String username) async {
    final relationship = await getFollowRelationship(username);
    if (relationship == UserFollowStatus.following) {
      await _local.clearFollowRequested(username);
    }
    return relationship;
  }

  Future<void> _syncSessionUserFromProfile(UserModel model) async {
    final sessionUser = _authLocal.getSessionUser();
    if (sessionUser == null) return;
    if (sessionUser.username.toLowerCase() != model.username.toLowerCase())
      return;

    await _authLocal.saveSessionUser(model.toEntity());
  }
}
