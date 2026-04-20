import 'dart:io';

import 'package:dio/dio.dart';

import 'models/community_member_model.dart';
import 'models/community_message_model.dart';
import 'models/community_model.dart';
import 'models/community_post_model.dart';
import '../domain/community_post_draft.dart';

class CommunityRemoteDatasource {
  final Dio _dio;

  const CommunityRemoteDatasource(this._dio);

  Future<List<CommunityModel>> getMineCommunities({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/communities/mine',
      queryParameters: {'page': page, 'size': size},
    );
    return _parsePage(
      response.data as Map<String, dynamic>,
    ).map((m) => m.copyWith(isMember: true)).toList();
  }

  Future<List<CommunityModel>> getCommunities({
    String? query,
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/communities',
      queryParameters: {
        'page': page,
        'size': size,
        if (query != null && query.trim().isNotEmpty) 'q': query.trim(),
      },
    );
    return _parsePage(response.data as Map<String, dynamic>);
  }

  Future<CommunityModel> createCommunity({
    required String name,
    required int bookId,
    required String type,
    String? description,
  }) async {
    final response = await _dio.post(
      '/communities',
      data: {
        'name': name,
        'description': description,
        'type': type,
        'bookId': bookId,
      },
    );
    return CommunityModel.fromApiJson(
      response.data as Map<String, dynamic>,
    ).copyWith(isMember: true);
  }

  Future<CommunityPostModel> createCommunityPost(
    int communityId, {
    required CommunityPostDraft draft,
  }) async {
    final images = await Future.wait(
      draft.imagePaths.map(
        (path) => MultipartFile.fromFile(
          path,
          filename: File(path).uri.pathSegments.last,
        ),
      ),
    );

    final response = await _dio.post(
      '/communities/$communityId/posts',
      data: FormData.fromMap({
        'text': draft.text,
        if (images.isNotEmpty) 'images': images,
        if (draft.gifUrl != null && draft.gifUrl!.isNotEmpty)
          'gif': draft.gifUrl,
        if (draft.tags.isNotEmpty) 'tags': draft.tags,
        'hasSpoiler': draft.hasSpoiler,
        if (draft.pageRef != null) 'pageRef': draft.pageRef,
      }),
      options: Options(contentType: 'multipart/form-data'),
    );

    return CommunityPostModel.fromApiJson(
      response.data as Map<String, dynamic>,
    );
  }

  Future<CommunityModel> getCommunityById(int communityId) async {
    final response = await _dio.get('/communities/$communityId');
    return CommunityModel.fromApiJson(response.data as Map<String, dynamic>);
  }

  Future<void> joinCommunity(int communityId) async {
    await _dio.post('/communities/$communityId/join');
  }

  Future<void> leaveCommunity(int communityId) async {
    await _dio.delete('/communities/$communityId/leave');
  }

  Future<void> joinCommunityByInvite(String token) async {
    await _dio.post('/communities/join/$token');
  }

  Future<List<CommunityPostModel>> getCommunityPosts(
    int communityId, {
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/communities/$communityId/posts',
      queryParameters: {'page': page, 'size': size},
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) return [];

    final content = data['content'];
    if (content is! List<dynamic>) return [];

    return content
        .map((e) => CommunityPostModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CommunityMessageModel>> getCommunityMessages(
    int communityId, {
    int limit = 50,
    int? before,
  }) async {
    final response = await _dio.get(
      '/communities/$communityId/messages',
      queryParameters: {'limit': limit, if (before != null) 'before': before},
    );

    final data = response.data;
    if (data is! List<dynamic>) return [];

    return data
        .map(
          (e) => CommunityMessageModel.fromApiJson(e as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> sendCommunityMessage(
    int communityId, {
    required String content,
    int? parentMessageId,
    List<String> tags = const [],
    List<String> images = const [],
    String? gifUrl,
    bool hasSpoiler = false,
    String? clientMessageId,
  }) async {
    final payload = {
      'content': content,
      if (parentMessageId != null) 'parentMessageId': parentMessageId,
      'tags': tags,
      'images': images,
      if (gifUrl != null && gifUrl.isNotEmpty) 'gifUrl': gifUrl,
      'hasSpoiler': hasSpoiler,
      if (clientMessageId != null && clientMessageId.isNotEmpty)
        'clientMessageId': clientMessageId,
    };

    await _dio.post('/ws/community/$communityId/send', data: payload);
  }

  Future<List<CommunityMemberModel>> getCommunityMembers(
    int communityId, {
    int page = 0,
    int size = 20,
  }) async {
    final response = await _dio.get(
      '/communities/$communityId/members',
      queryParameters: {'page': page, 'size': size},
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) return [];

    final content = data['content'];
    if (content is! List<dynamic>) return [];

    return content
        .map((e) => CommunityMemberModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  List<CommunityModel> _parsePage(Map<String, dynamic> json) {
    final content = json['content'];
    if (content is! List<dynamic>) return [];
    return content
        .map((e) => CommunityModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }
}
