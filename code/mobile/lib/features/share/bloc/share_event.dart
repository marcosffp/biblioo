abstract class ShareEvent {}

class ShareCapsuleRequested extends ShareEvent {
  final int userId;
  final bool refreshRemote;

  ShareCapsuleRequested({required this.userId, this.refreshRemote = false});
}
