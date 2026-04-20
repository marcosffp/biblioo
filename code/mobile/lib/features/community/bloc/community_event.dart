import 'package:biblioo/features/community/domain/community.dart';

abstract class CommunityEvent {}

class CommunityLoadRequested extends CommunityEvent {
  final String? query;
  CommunityLoadRequested({this.query});
}

class CommunityCreateRequested extends CommunityEvent {
  final String name;
  final String? description;
  final int bookId;
  final String bookTitle;
  final String bookAuthor;
  final String? bookCoverUrl;
  final CommunityVisibility visibility;

  CommunityCreateRequested({
    required this.name,
    this.description,
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

class CommunityLeaveRequested extends CommunityEvent {
  final int communityId;
  CommunityLeaveRequested(this.communityId);
}
