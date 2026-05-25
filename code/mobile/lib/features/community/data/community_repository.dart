import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/community/domain/community_invite.dart';
import 'package:biblioo/features/community/domain/community_join_request.dart';
import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:biblioo/features/community/domain/community_message.dart';
import 'community_local_datasource.dart';
import 'models/community_model.dart';
import 'community_remote_datasource.dart';

class CommunityFailure implements Exception {
  final String message;
  const CommunityFailure(this.message);

  @override
  String toString() => message;
}

class CommunityListResult {
  final List<Community> mine;
  final List<Community> suggestions;
  final bool fromCache;
  final DateTime? lastSyncedAt;

  const CommunityListResult({
    required this.mine,
    required this.suggestions,
    required this.fromCache,
    required this.lastSyncedAt,
  });
}

class CommunityRepository {
  final CommunityRemoteDatasource _remote;
  final CommunityLocalDatasource _local;

  const CommunityRepository(this._remote, this._local);

  List<Community> getCachedMineCommunities() {
    return _local.getCachedMine().map((m) => m.toEntity()).toList();
  }

  List<Community> getCachedSuggestedCommunities() {
    return _local.getCachedSuggestions().map((m) => m.toEntity()).toList();
  }

  DateTime? getCachedCommunitiesUpdatedAt() => _local.getLastUpdatedAt();

  Future<CommunityListResult> getCommunities({String? query}) async {
    try {
      final remoteMine = await _remote.getMineCommunities();
      final remoteAll = await _remote.getCommunities(query: query);

      final mineIds = remoteMine.map((c) => c.id).toSet();
      final suggestions = remoteAll
          .where((c) => !mineIds.contains(c.id))
          .map((c) => c.copyWith(isMember: false))
          .toList();

      await _local.saveFromEntities(mine: remoteMine, suggestions: suggestions);

      return CommunityListResult(
        mine: remoteMine.map((m) => m.toEntity()).toList(),
        suggestions: suggestions.map((m) => m.toEntity()).toList(),
        fromCache: false,
        lastSyncedAt: DateTime.now(),
      );
    } catch (_) {
      final mine = _local.getCachedMine();
      final suggestions = _local.getCachedSuggestions();
      if (mine.isEmpty && suggestions.isEmpty) {
        throw const CommunityFailure('Erro ao carregar comunidades.');
      }

      return CommunityListResult(
        mine: mine.map((m) => m.toEntity()).toList(),
        suggestions: suggestions.map((m) => m.toEntity()).toList(),
        fromCache: true,
        lastSyncedAt: _local.getLastUpdatedAt(),
      );
    }
  }

  Future<Community> createCommunity({
    required String name,
    required int bookId,
    required CommunityVisibility visibility,
    String? description,
    String? bookTitle,
    String? bookAuthor,
    String? bookCoverUrl,
  }) async {
    final model = await _remote.createCommunity(
      name: name,
      bookId: bookId,
      type: visibility == CommunityVisibility.private ? 'PRIVATE' : 'PUBLIC',
      description: description,
    );
    await _insertIntoMineCache(
      model.copyWith(
        isMember: true,
        bookTitle: bookTitle ?? model.bookTitle,
        bookAuthor: bookAuthor ?? model.bookAuthor,
        bookCoverUrl: bookCoverUrl ?? model.bookCoverUrl,
      ),
    );
    return model.toEntity();
  }

  Future<Community> getCommunityById(
    int communityId, {
    bool forceRefresh = false,
  }) async {
    final cached = _local.getCachedCommunityById(communityId);
    if (!forceRefresh && cached != null) return cached.toEntity();

    try {
      final model = await _remote.getCommunityById(communityId);
      await _local.upsertCommunity(model);
      return model.toEntity();
    } catch (_) {
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }

  Future<void> joinCommunity(int communityId) async {
    await _remote.joinCommunity(communityId);
    final mine = _local.getCachedMine();
    final suggestions = _local.getCachedSuggestions();
    final idx = suggestions.indexWhere((c) => c.id == communityId);
    if (idx != -1) {
      final joined = suggestions.removeAt(idx).copyWith(isMember: true);
      mine.insert(0, joined);
      await _local.saveCommunities(mine: mine, suggestions: suggestions);
    }
  }

  Future<void> requestToJoin(int communityId) async {
    await _remote.requestToJoin(communityId);
  }

  Future<void> leaveCommunity(int communityId) async {
    await _remote.leaveCommunity(communityId);
    final mine = _local.getCachedMine()
      ..removeWhere((c) => c.id == communityId);
    final suggestions = _local.getCachedSuggestions();
    await _local.saveCommunities(mine: mine, suggestions: suggestions);
  }

  Future<void> joinCommunityByInvite(String code) async {
    await _remote.joinCommunityByInvite(code);
  }

  Future<String> generateInviteCode(int communityId) {
    return _remote.generateInviteCode(communityId);
  }

  Future<void> inviteUserToCommunity(int communityId, int inviteeId) {
    return _remote.inviteUser(communityId, inviteeId);
  }

  Future<List<CommunityInvite>> getPendingInvites({
    int page = 0,
    int size = 10,
  }) async {
    final invites = await _remote.getPendingInvites(page: page, size: size);
    return invites.map((item) => item.toEntity()).toList();
  }

  Future<void> acceptInvite(int inviteId) {
    return _remote.acceptInvite(inviteId);
  }

  Future<void> declineInvite(int inviteId) {
    return _remote.declineInvite(inviteId);
  }

  Future<List<CommunityJoinRequest>> getPendingJoinRequests(
    int communityId, {
    int page = 0,
    int size = 10,
  }) async {
    final requests = await _remote.getPendingJoinRequests(
      communityId,
      page: page,
      size: size,
    );
    return requests.map((item) => item.toEntity()).toList();
  }

  Future<void> approveJoinRequest(int requestId) {
    return _remote.approveJoinRequest(requestId);
  }

  Future<void> rejectJoinRequest(int requestId) {
    return _remote.rejectJoinRequest(requestId);
  }

  Future<List<CommunityMessage>> getCommunityMessages(int communityId) async {
    try {
      final remote = await _remote.getCommunityMessages(communityId);
      await _local.saveMessages(communityId, remote);
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      final local = _local.getCachedMessages(communityId);
      return local.map((m) => m.toEntity()).toList();
    }
  }

  Future<List<CommunityMessage>> syncCommunityMessages(
    int communityId, {
    required int after,
  }) async {
    final remote = await _remote.syncCommunityMessages(
      communityId,
      after: after,
    );
    final current = _local.getCachedMessages(communityId);
    final merged = [...current];

    for (final incoming in remote) {
      final idx = merged.indexWhere((m) => m.id == incoming.id);
      if (idx == -1) {
        merged.insert(0, incoming);
      } else {
        merged[idx] = incoming;
      }
    }

    await _local.saveMessages(communityId, merged);
    return merged.map((m) => m.toEntity()).toList();
  }

  Future<(List<String>, String?)> uploadCommunityMessageMedia(
    int communityId, {
    List<String> imagePaths = const [],
    String? gifPath,
  }) {
    return _remote.uploadMessageMedia(
      communityId,
      imagePaths: imagePaths,
      gifPath: gifPath,
    );
  }

  Future<void> sendCommunityMessage(
    int communityId, {
    required String content,
  }) async {
    throw const CommunityFailure(
      'O envio de mensagens usa a conexao WebSocket da tela de comunidade.',
    );
  }

  Future<List<CommunityMember>> getCommunityMembers(
    int communityId, {
    bool forceRefresh = false,
  }) async {
    final cached = _local.getCachedMembers(communityId);
    if (!forceRefresh && cached.isNotEmpty) {
      return cached.map((m) => m.toEntity()).toList();
    }

    try {
      final remote = await _remote.getCommunityMembers(communityId);
      await _local.saveMembers(communityId, remote);
      return remote.map((m) => m.toEntity()).toList();
    } catch (_) {
      if (cached.isNotEmpty) {
        return cached.map((m) => m.toEntity()).toList();
      }
      rethrow;
    }
  }

  Future<void> _insertIntoMineCache(CommunityModel model) async {
    final mine = _local.getCachedMine();
    final suggestions = _local.getCachedSuggestions()
      ..removeWhere((c) => c.id == model.id);

    final idx = mine.indexWhere((c) => c.id == model.id);
    if (idx == -1) {
      mine.insert(0, model);
    } else {
      mine[idx] = model;
    }

    await _local.saveCommunities(mine: mine, suggestions: suggestions);
  }
}
