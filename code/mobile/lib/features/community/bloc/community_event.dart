import 'package:biblioo/features/community/domain/community.dart';

abstract class CommunityEvent {}

class CommunityLoadRequested extends CommunityEvent {}

class CommunityCreateRequested extends CommunityEvent {
  final String name;
  final int bookId;
  final String bookTitle;
  final String bookAuthor;
  final String? bookCoverUrl;
  final CommunityVisibility visibility;

  CommunityCreateRequested({
    required this.name,
    required this.bookId,
    required this.bookTitle,
    required this.bookAuthor,
    this.bookCoverUrl,
    required this.visibility,
  });
}

class CommunityJoinRequested extends CommunityEvent {
  final int communityId;
  CommunityJoinRequested(this.communityId);
}

class CommunityJoinByInviteRequested extends CommunityEvent {
  final String inviteCode;
  CommunityJoinByInviteRequested(this.inviteCode);
}
