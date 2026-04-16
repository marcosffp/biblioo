import 'package:biblioo/features/community/domain/community.dart';
import 'community_remote_datasource.dart';

class CommunityRepository {
  final CommunityRemoteDatasource _remote;

  const CommunityRepository(this._remote);

  Future<({List<Community> mine, List<Community> suggestions})>
      getCommunities() async {
    final result = await _remote.getCommunities();
    return (
      mine: result.mine.map((m) => m.toEntity()).toList(),
      suggestions: result.suggestions.map((m) => m.toEntity()).toList(),
    );
  }

  Future<Community> createCommunity({
    required String name,
    required int bookId,
    required CommunityVisibility visibility,
    String bookTitle = '',
    String bookAuthor = '',
    String? bookCoverUrl,
  }) async {
    final model = await _remote.createCommunity(
      name: name,
      bookId: bookId,
      visibility:
          visibility == CommunityVisibility.private ? 'PRIVATE' : 'PUBLIC',
      bookTitle: bookTitle,
      bookAuthor: bookAuthor,
      bookCoverUrl: bookCoverUrl,
    );
    return model.toEntity();
  }

  Future<void> joinCommunity(int communityId) =>
      _remote.joinCommunity(communityId);
}
