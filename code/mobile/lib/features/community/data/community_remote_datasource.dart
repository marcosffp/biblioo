import 'package:dio/dio.dart';

import 'models/community_invite_model.dart';
import 'models/community_join_request_model.dart';
import 'models/community_member_model.dart';
import 'models/community_message_model.dart';
import 'models/community_model.dart';

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

  Future<CommunityModel> getCommunityById(int communityId) async {
    final response = await _dio.get('/communities/$communityId');
    return CommunityModel.fromApiJson(response.data as Map<String, dynamic>);
  }

  Future<void> joinCommunity(int communityId) async {
    await _dio.post('/communities/$communityId/join');
  }

  Future<void> requestToJoin(int communityId) async {
    await _dio.post('/communities/$communityId/join-requests');
  }

  Future<void> leaveCommunity(int communityId) async {
    await _dio.delete('/communities/$communityId/leave');
  }

  Future<void> joinCommunityByInvite(String token) async {
    await _dio.post('/communities/join/$token');
  }

  Future<String> generateInviteCode(int communityId) async {
    final response = await _dio.post('/communities/$communityId/invite-link');
    final data = response.data;
    if (data is! Map<String, dynamic>) return '';
    final code = data['inviteLink']?.toString() ?? '';
    return code.trim();
  }

  Future<void> inviteUser(int communityId, int inviteeId) async {
    await _dio.post(
      '/communities/$communityId/invites',
      data: {'inviteeId': inviteeId},
    );
  }

  Future<List<CommunityInviteModel>> getPendingInvites({
    int page = 0,
    int size = 10,
  }) async {
    final response = await _dio.get(
      '/communities/invites/pending',
      queryParameters: {'page': page, 'size': size},
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) return [];

    final content = data['content'];
    if (content is! List<dynamic>) return [];

    return content
        .map((e) => CommunityInviteModel.fromApiJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> acceptInvite(int inviteId) async {
    await _dio.post('/communities/invites/$inviteId/accept');
  }

  Future<void> declineInvite(int inviteId) async {
    await _dio.post('/communities/invites/$inviteId/decline');
  }

  Future<List<CommunityJoinRequestModel>> getPendingJoinRequests(
    int communityId, {
    int page = 0,
    int size = 10,
  }) async {
    final response = await _dio.get(
      '/communities/$communityId/join-requests',
      queryParameters: {'page': page, 'size': size},
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) return [];

    final content = data['content'];
    if (content is! List<dynamic>) return [];

    return content
        .map(
          (e) =>
              CommunityJoinRequestModel.fromApiJson(e as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> approveJoinRequest(int requestId) async {
    await _dio.post('/communities/join-requests/$requestId/approve');
  }

  Future<void> rejectJoinRequest(int requestId) async {
    await _dio.post('/communities/join-requests/$requestId/reject');
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

  Future<List<CommunityMessageModel>> syncCommunityMessages(
    int communityId, {
    required int after,
  }) async {
    final response = await _dio.get(
      '/communities/$communityId/messages/sync',
      queryParameters: {'after': after},
    );

    final data = response.data;
    if (data is! List<dynamic>) return [];

    return data
        .map(
          (e) => CommunityMessageModel.fromApiJson(e as Map<String, dynamic>),
        )
        .toList();
  }

  Future<(List<String>, String?)> uploadMessageMedia(
    int communityId, {
    List<String> imagePaths = const [],
    String? gifPath,
  }) async {
    final imageFiles = await Future.wait(
      imagePaths.map((path) => MultipartFile.fromFile(path)),
    );

    final formData = FormData.fromMap({
      if (imageFiles.isNotEmpty) 'images': imageFiles,
      if (gifPath != null && gifPath.isNotEmpty)
        'gif': await MultipartFile.fromFile(gifPath),
    });

    final response = await _dio.post(
      '/communities/$communityId/messages/media',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) return (<String>[], null);

    final images = ((data['images'] as List<dynamic>?) ?? const [])
        .map((e) => e.toString())
        .toList();
    final gifUrl = data['gifUrl'] as String?;
    return (images, gifUrl);
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
