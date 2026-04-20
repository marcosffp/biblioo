import 'dart:convert';

import 'package:biblioo/features/community/data/models/community_member_model.dart';
import 'package:biblioo/features/community/data/models/community_message_model.dart';
import 'package:biblioo/features/community/data/models/community_model.dart';
import 'package:biblioo/features/community/data/models/community_post_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CommunityLocalDatasource {
  static const _mineKey = 'community_cache_mine';
  static const _suggestionsKey = 'community_cache_suggestions';
  static const _updatedAtKey = 'community_cache_updated_at';
  static const _postsPrefix = 'community_posts_cache_';
  static const _messagesPrefix = 'community_messages_cache_';
  static const _membersPrefix = 'community_members_cache_';

  final SharedPreferences _prefs;

  const CommunityLocalDatasource(this._prefs);

  List<CommunityModel> getCachedMine() =>
      _decodeList(_prefs.getString(_mineKey));

  List<CommunityModel> getCachedSuggestions() =>
      _decodeList(_prefs.getString(_suggestionsKey));

  CommunityModel? getCachedCommunityById(int communityId) {
    for (final community in getCachedMine()) {
      if (community.id == communityId) return community;
    }
    for (final community in getCachedSuggestions()) {
      if (community.id == communityId) return community;
    }
    return null;
  }

  DateTime? getLastUpdatedAt() {
    final raw = _prefs.getString(_updatedAtKey);
    if (raw == null || raw.isEmpty) return null;
    return DateTime.tryParse(raw);
  }

  Future<void> saveCommunities({
    required List<CommunityModel> mine,
    required List<CommunityModel> suggestions,
  }) async {
    await _prefs.setString(
      _mineKey,
      jsonEncode(mine.map((c) => c.toJson()).toList()),
    );
    await _prefs.setString(
      _suggestionsKey,
      jsonEncode(suggestions.map((c) => c.toJson()).toList()),
    );
    await _prefs.setString(_updatedAtKey, DateTime.now().toIso8601String());
  }

  Future<void> saveFromEntities({
    required List<CommunityModel> mine,
    required List<CommunityModel> suggestions,
  }) => saveCommunities(mine: mine, suggestions: suggestions);

  Future<void> upsertCommunity(CommunityModel model) async {
    final mine = getCachedMine();
    final suggestions = getCachedSuggestions();

    mine.removeWhere((c) => c.id == model.id);
    suggestions.removeWhere((c) => c.id == model.id);

    if (model.isMember) {
      mine.insert(0, model);
    } else {
      suggestions.insert(0, model);
    }

    await saveCommunities(mine: mine, suggestions: suggestions);
  }

  Future<void> clear() async {
    await _prefs.remove(_mineKey);
    await _prefs.remove(_suggestionsKey);
    await _prefs.remove(_updatedAtKey);
  }

  List<CommunityPostModel> getCachedPosts(int communityId) {
    final raw = _prefs.getString('$_postsPrefix$communityId');
    if (raw == null || raw.isEmpty) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map(
          (item) => CommunityPostModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> savePosts(
    int communityId,
    List<CommunityPostModel> posts,
  ) async {
    await _prefs.setString(
      '$_postsPrefix$communityId',
      jsonEncode(posts.map((p) => p.toJson()).toList()),
    );
  }

  List<CommunityModel> _decodeList(String? raw) {
    if (raw == null || raw.isEmpty) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((item) => CommunityModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  List<CommunityMessageModel> getCachedMessages(int communityId) {
    final raw = _prefs.getString('$_messagesPrefix$communityId');
    if (raw == null || raw.isEmpty) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map(
          (item) =>
              CommunityMessageModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> saveMessages(
    int communityId,
    List<CommunityMessageModel> messages,
  ) async {
    await _prefs.setString(
      '$_messagesPrefix$communityId',
      jsonEncode(messages.map((m) => m.toJson()).toList()),
    );
  }

  List<CommunityMemberModel> getCachedMembers(int communityId) {
    final raw = _prefs.getString('$_membersPrefix$communityId');
    if (raw == null || raw.isEmpty) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map(
          (item) => CommunityMemberModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> saveMembers(
    int communityId,
    List<CommunityMemberModel> members,
  ) async {
    await _prefs.setString(
      '$_membersPrefix$communityId',
      jsonEncode(members.map((m) => m.toJson()).toList()),
    );
  }
}
