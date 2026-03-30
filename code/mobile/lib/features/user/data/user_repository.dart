import 'package:biblioo/features/user/domain/user.dart';
import 'user_remote_datasource.dart';
import 'user_local_datasource.dart';
import 'models/follow_page_model.dart';


class UserRepository {
  final UserRemoteDatasource _remote;
  final UserLocalDatasource  _local;

  const UserRepository(this._remote, this._local);

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
    return model.toEntity();
  }

  Future<User> updateProfile({
    String? bio,
    String? avatarUrl,
    String? bannerUrl,
  }) async {
    final model = await _remote.updateProfile(
      bio: bio,
      avatarUrl: avatarUrl,
      bannerUrl: bannerUrl,
    );
    await _local.saveProfile(model);
    return model.toEntity();
  }

  Future<User> updateVisibility({required bool isPrivate}) async {
    final model = await _remote.updateVisibility(isPrivate: isPrivate);
    await _local.saveProfile(model);
    return model.toEntity();
  }

  Future<User> uploadAvatar(String filePath) async {
    final model = await _remote.uploadAvatar(filePath);
    await _local.saveProfile(model);
    return model.toEntity();
  }

  Future<User> uploadBanner(String filePath) async {
    final model = await _remote.uploadBanner(filePath);
    await _local.saveProfile(model);
    return model.toEntity();
  }

  Future<void> follow(String username) => _remote.follow(username);

  Future<void> unfollow(String username) => _remote.unfollow(username);

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
}