abstract class UserEvent {}

class LoadMyProfile    extends UserEvent {}
class LoadUserProfile  extends UserEvent {
  final String username;
  LoadUserProfile(this.username);
}
class UpdateProfile extends UserEvent {
  final String? bio;
  final String? avatarUrl;
  final String? bannerUrl;
  UpdateProfile({this.bio, this.avatarUrl, this.bannerUrl});
}
class UpdateVisibility extends UserEvent {
  final bool isPrivate;
  UpdateVisibility(this.isPrivate);
}
class FollowUser   extends UserEvent { final String username; FollowUser(this.username); }
class UnfollowUser extends UserEvent { final String username; UnfollowUser(this.username); }
class DeleteAccount extends UserEvent {}