import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/community/bloc/community_voting_bloc.dart';
import 'package:biblioo/features/community/bloc/community_voting_event.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:biblioo/features/community/domain/community_message.dart';
import 'package:biblioo/features/community/data/community_voting_remote_datasource.dart';
import 'package:biblioo/features/community/data/community_voting_repository.dart';
import 'package:biblioo/features/user/data/models/follow_page_model.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'widgets/community_chat_tab.dart';
import 'widgets/community_detail_shared.dart';
import 'widgets/community_detail_tab_bar.dart';
import 'widgets/community_overview_tab.dart';
import 'widgets/community_voting_tab.dart';

class CommunityDetailScreen extends StatefulWidget {
  final int communityId;

  const CommunityDetailScreen({super.key, required this.communityId});

  @override
  State<CommunityDetailScreen> createState() => _CommunityDetailScreenState();
}

class _CommunityDetailScreenState extends State<CommunityDetailScreen>
    with SingleTickerProviderStateMixin {
  final _repo = Injector.instance.communityRepo;
  final _bookRepo = Injector.instance.bookRepo;
  final _votingRepo = CommunityVotingRepository(
    CommunityVotingRemoteDatasource(Injector.instance.dio),
  );
  final _authSecure = Injector.instance.authSecure;
  final _imagePicker = ImagePicker();
  final User? _currentUser = Injector.instance.authLocal.getSessionUser();

  late TabController _tabController;

  Community? _community;
  Book? _book;
  List<CommunityMember> _members = const [];
  bool _headerLoading = true;
  String? _headerError;

  List<CommunityMessage> _messages = const [];
  bool _messagesLoading = false;
  bool _messagesLoaded = false;
  String? _messagesError;

  final TextEditingController _messageController = TextEditingController();
  bool _sendingMessage = false;
  bool _uploadingMedia = false;
  bool _inviteActionBusy = false;
  bool _joinRequestPending = false;
  bool _friendsLoading = false;
  bool _friendsLoaded = false;
  List<UserSummaryModel> _friendCandidates = const [];
  bool _hasSpoilerComposer = false;
  List<XFile> _pendingImages = const [];
  CommunityMessage? _replyingTo;
  CommunityMessage? _editingMessage;

  WebSocketChannel? _chatSocket;
  StreamSubscription<dynamic>? _chatSocketSubscription;
  bool _chatSocketConnecting = false;
  bool _chatSocketConnected = false;
  String? _chatSocketError;
  Timer? _reconnectTimer;
  int _reconnectAttempt = 0;
  bool _hasVotingHistory = false;

  bool get _isCurrentUserOwner {
    final community = _community;
    final currentUserId = _currentUser?.id;
    if (community == null || currentUserId == null) return false;
    return community.ownerId == currentUserId;
  }

  bool get _canAccessChat {
    final community = _community;
    if (community == null) return false;
    return community.isMember;
  }

  String? _currentUserCommunityRole(Community? community) {
    final currentUserId = _currentUser?.id;
    if (community == null || currentUserId == null) return null;

    for (final member in _members) {
      if (member.userId == currentUserId) {
        return member.role;
      }
    }

    return community.currentUserRole;
  }

  bool _canManageVotingFor(Community? community) {
    final currentUserId = _currentUser?.id;
    if (community == null || currentUserId == null) return false;
    if (community.ownerId == currentUserId) return true;

    final role = _currentUserCommunityRole(community)?.toUpperCase();
    return role == 'ADMIN' || role == 'LEADER' || role == 'OWNER';
  }

  bool get _canManageVoting => _canManageVotingFor(_community);

  bool get _shouldShowVotingTab {
    final community = _community;
    if (community == null || !community.isMember) return false;
    return true;
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this)
      ..addListener(_onTabChanged);
    _loadHeader();
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    _messageController.dispose();
    _reconnectTimer?.cancel();
    _chatSocketSubscription?.cancel();
    _chatSocket?.sink.close();
    super.dispose();
  }

  Future<void> _loadHeader({bool forceRefresh = false}) async {
    setState(() {
      _headerLoading = true;
      _headerError = null;
    });

    try {
      final community = await _repo.getCommunityById(
        widget.communityId,
        forceRefresh: forceRefresh,
      );
      final book = community.bookId > 0
          ? await _bookRepo.getById(community.bookId)
          : null;
      List<CommunityMember> members = const [];

      try {
        members = await _repo.getCommunityMembers(
          widget.communityId,
          forceRefresh: forceRefresh,
        );
      } on DioException catch (e) {
        // For private communities, non-members may be forbidden from listing members.
        if (e.response?.statusCode != 403) {
          rethrow;
        }
      }

      if (!mounted) return;
      final hasVotingHistory = community.isMember
          ? await _checkVotingHistory(community.id)
          : false;
      if (!mounted) return;

      setState(() {
        _community = community;
        _book = book;
        _members = members;
        _hasVotingHistory = hasVotingHistory;
        _headerLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _headerError = 'Nao foi possivel carregar a comunidade.';
        _headerLoading = false;
      });
    }
  }

  Future<bool> _checkVotingHistory(int communityId) async {
    try {
      final votings = await _votingRepo.listVotings(communityId);
      return votings.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    if (_tabController.index != 1) return;
    if (!_canAccessChat) return;

    if (!_messagesLoaded) {
      _loadMessages();
    }
    if (!_chatSocketConnected && !_chatSocketConnecting) {
      _connectChatSocket();
    }
  }

  Future<void> _loadMessages() async {
    setState(() {
      _messagesLoading = true;
      _messagesError = null;
    });

    try {
      final messages = await _repo.getCommunityMessages(widget.communityId);
      if (!mounted) return;
      setState(() {
        _messages = _sortMessages(messages);
        _messagesLoaded = true;
        _messagesLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messagesError = 'Nao foi possivel carregar as mensagens.';
        _messagesLoading = false;
      });
    }
  }

  Future<void> _reloadScreenData() async {
    await _loadHeader(forceRefresh: true);
    if (_canAccessChat && _tabController.index == 1) {
      await _loadMessages();
    }
  }

  Future<void> _connectChatSocket() async {
    // Garante que o timer anterior seja limpo
    _reconnectTimer?.cancel();
    _reconnectTimer = null;

    final apiUrl = const String.fromEnvironment(
      'API_URL',
      defaultValue: 'http://localhost:8080',
    );
    // Usa a URL real do ambiente carregada pelo dotenv
    final parsed = Uri.parse(apiUrl);
    final token = await _authSecure.getAccessToken();

    // Endpoint correto para WebSocket puro no Spring Boot é /ws
    final wsUri = parsed.replace(
      scheme: parsed.scheme == 'https' ? 'wss' : 'ws',
      path: '/ws',
      queryParameters: {},
      fragment: '',
    );

    setState(() {
      _chatSocketConnecting = true;
      _chatSocketError = null;
    });

    await _chatSocketSubscription?.cancel();
    _chatSocketSubscription = null;
    await _chatSocket?.sink.close();
    _chatSocket = null;

    try {
      final channel = WebSocketChannel.connect(wsUri);
      _chatSocket = channel;
      _chatSocketSubscription = channel.stream.listen(
        _handleSocketFrame,
        onError: (_) => _handleSocketDisconnected(),
        onDone: _handleSocketDisconnected,
        cancelOnError: false,
      );

      // Envia o CONNECT com headers serializados corretamente
      _sendStompFrame(
        command: 'CONNECT',
        headers: {
          'accept-version': '1.2',
          'heart-beat': '10000,10000',
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token',
        },
      );
    } catch (_) {
      _handleSocketDisconnected();
    }
  }

  void _handleSocketFrame(dynamic rawEvent) {
    final frame = rawEvent.toString();
    if (frame.trim().isEmpty) return;

    if (frame.startsWith('CONNECTED')) {
      setState(() {
        _chatSocketConnected = true;
        _chatSocketConnecting = false;
        _chatSocketError = null;
      });
      _reconnectAttempt = 0;
      _subscribeToChatTopics();
      _syncAfterReconnect();
      return;
    }

    if (!frame.startsWith('MESSAGE')) return;

    final body = _extractStompBody(frame);
    if (body == null || body.trim().isEmpty) return;

    try {
      final parsed = jsonDecode(body);
      if (parsed is! Map<String, dynamic>) return;

      final eventType = parsed['eventType']?.toString();
      final data = parsed['data'];
      if (eventType == null || data is! Map<String, dynamic>) return;

      _handleIncomingChatEvent(eventType, data);
    } catch (_) {
      // Ignore malformed frames; connection should continue alive.
    }
  }

  void _handleIncomingChatEvent(String eventType, Map<String, dynamic> data) {
    final messageId = _asInt(data['id']);

    switch (eventType) {
      case 'MESSAGE_CREATED':
        if (messageId == null) return;
        _upsertMessage(_toCommunityMessage(data));
        break;
      case 'MESSAGE_UPDATED':
        if (messageId == null) return;
        final existing = _findMessageById(messageId);
        _upsertMessage(_toCommunityMessage(data, fallback: existing));
        break;
      case 'MESSAGE_DELETED':
        if (messageId == null) return;
        final existing = _findMessageById(messageId);
        if (existing != null) {
          _upsertMessage(existing.copyWith(deleted: true, content: ''));
        }
        break;
      case 'REACTION_UPDATED':
        if (messageId == null) return;
        final nextCount = _asInt(data['heartCount']) ?? 0;
        final existing = _findMessageById(messageId);
        if (existing != null) {
          _upsertMessage(existing.copyWith(heartCount: nextCount));
        }
        break;
      case 'ERROR':
        final content = data['content']?.toString();
        _showSnack(content ?? 'Ocorreu um erro no chat.');
        break;
    }
  }

  Future<void> _syncAfterReconnect() async {
    final after = _latestMessageId();
    if (after == null) return;

    try {
      final synced = await _repo.syncCommunityMessages(
        widget.communityId,
        after: after,
      );
      if (!mounted || synced.isEmpty) return;

      setState(() {
        final current = [..._messages];
        for (final msg in synced) {
          final idx = current.indexWhere((m) => m.id == msg.id);
          if (idx == -1) {
            current.insert(0, msg);
          } else {
            current[idx] = msg;
          }
        }
        _messages = _sortMessages(current);
      });
    } catch (_) {
      // Mantém a lista atual se o sync falhar
    }
  }

  void _subscribeToChatTopics() {
    final destinations = [
      '/topic/community.${widget.communityId}',
      '/topic/community.${widget.communityId}.edits',
      '/topic/community.${widget.communityId}.reactions',
      '/user/queue/errors',
    ];

    for (var i = 0; i < destinations.length; i++) {
      _sendStompFrame(
        command: 'SUBSCRIBE',
        headers: {
          'id': 'sub-${widget.communityId}-$i',
          'destination': destinations[i],
        },
      );
    }
  }

  void _handleSocketDisconnected() {
    if (!mounted) return;

    setState(() {
      _chatSocketConnected = false;
      _chatSocketConnecting = false;
      _chatSocketError =
          'Conexao em tempo real instavel. Tentando reconectar automaticamente.';
    });

    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (!mounted || _tabController.index != 1) return;
    if (_reconnectTimer != null) return;

    _reconnectAttempt += 1;
    final delaySeconds = math.min(20, 1 << math.min(_reconnectAttempt, 5));
    _reconnectTimer = Timer(Duration(seconds: delaySeconds), () {
      _reconnectTimer = null;
      if (!mounted || _chatSocketConnected || _chatSocketConnecting) return;
      _connectChatSocket();
    });
  }

  void _sendStompFrame({
    required String command,
    Map<String, String> headers = const {},
    String? body,
  }) {
    final channel = _chatSocket;
    if (channel == null) return;

    final buffer = StringBuffer();
    buffer.write(command);
    buffer.write('\n');

    // Agora os headers são escritos um a um: "chave:valor\n"
    for (final entry in headers.entries) {
      buffer.write('${entry.key}:${entry.value}\n');
    }

    // Linha em branco obrigatória separando headers do body
    buffer.write('\n');

    if (body != null && body.isNotEmpty) {
      buffer.write(body);
    }

    // Null-byte (\u0000) obrigatório encerrando o frame
    buffer.write('\u0000');

    channel.sink.add(buffer.toString());
  }

  String? _extractStompBody(String frame) {
    final separator = frame.indexOf('\n\n');
    if (separator < 0) return null;
    final body = frame.substring(separator + 2);
    return body.replaceAll('\u0000', '').trim();
  }

  List<CommunityMessage> _sortMessages(List<CommunityMessage> messages) {
    final sorted = [...messages];
    sorted.sort((a, b) {
      final dateCompare = b.createdAt.compareTo(a.createdAt);
      if (dateCompare != 0) return dateCompare;
      return b.id.compareTo(a.id);
    });
    return sorted;
  }

  CommunityMessage? _findMessageById(int id) {
    for (final message in _messages) {
      if (message.id == id) return message;
    }
    return null;
  }

  String _resolveAuthorName(int authorId) {
    if (_currentUser?.id == authorId) {
      final current = _currentUser?.username ?? '';
      if (current.trim().isNotEmpty) return current;
    }

    for (final member in _members) {
      if (member.userId == authorId) {
        final username = member.username ?? '';
        if (username.trim().isNotEmpty) return username;
      }
    }

    return 'Usuario #$authorId';
  }

  int? _latestMessageId() {
    if (_messages.isEmpty) return null;
    var maxId = _messages.first.id;
    for (final message in _messages) {
      if (message.id > maxId) {
        maxId = message.id;
      }
    }
    return maxId;
  }

  void _upsertMessage(CommunityMessage message) {
    if (!mounted) return;
    setState(() {
      final current = [..._messages];
      final idx = current.indexWhere((m) => m.id == message.id);
      if (idx == -1) {
        current.insert(0, message);
      } else {
        current[idx] = message;
      }
      _messages = _sortMessages(current);
      _messagesLoaded = true;
    });
  }

  CommunityMessage _toCommunityMessage(
    Map<String, dynamic> data, {
    CommunityMessage? fallback,
  }) {
    final id =
        _asInt(data['id']) ??
        fallback?.id ??
        DateTime.now().millisecondsSinceEpoch;

    return CommunityMessage(
      id: id,
      clientMessageId:
          data['clientMessageId'] as String? ?? fallback?.clientMessageId,
      communityId:
          _asInt(data['communityId']) ??
          fallback?.communityId ??
          widget.communityId,
      authorId: _asInt(data['authorId']) ?? fallback?.authorId ?? 0,
      content: data['content']?.toString() ?? fallback?.content ?? '',
      type: resolveCommunityMessageType(
        data['type']?.toString() ??
            (fallback == null
                ? null
                : serializeCommunityMessageType(fallback.type)),
        content: data['content']?.toString() ?? fallback?.content,
        images: _toStringList(data['images'], fallback: fallback?.images),
        gifUrl: data['gifUrl'] as String? ?? fallback?.gifUrl,
        tags: _toStringList(data['tags'], fallback: fallback?.tags),
        parentMessageId:
            _asInt(data['parentMessageId']) ?? fallback?.parentMessageId,
        deleted: (data['deleted'] as bool?) ?? fallback?.deleted,
      ),
      parentMessageId:
          _asInt(data['parentMessageId']) ?? fallback?.parentMessageId,
      tags: _toStringList(data['tags'], fallback: fallback?.tags),
      images: _toStringList(data['images'], fallback: fallback?.images),
      gifUrl: data['gifUrl'] as String? ?? fallback?.gifUrl,
      hasSpoiler:
          (data['hasSpoiler'] as bool?) ?? fallback?.hasSpoiler ?? false,
      heartCount: _asInt(data['heartCount']) ?? fallback?.heartCount ?? 0,
      deleted: (data['deleted'] as bool?) ?? fallback?.deleted ?? false,
      createdAt:
          _parseDate(data['createdAt']) ??
          fallback?.createdAt ??
          DateTime.now(),
      editedAt: _parseDate(data['editedAt']) ?? fallback?.editedAt,
    );
  }

  DateTime? _parseDate(dynamic raw) {
    if (raw is! String || raw.trim().isEmpty) return null;
    return DateTime.tryParse(raw)?.toLocal();
  }

  int? _asInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  List<String> _toStringList(dynamic value, {List<String>? fallback}) {
    if (value is List) {
      return value.map((e) => e.toString()).toList();
    }
    return fallback ?? const [];
  }

  Set<String> _extractTags(String content) {
    final matches = RegExp(r'#([\w-]{1,32})').allMatches(content);
    final tags = <String>{};
    for (final match in matches) {
      final tag = match.group(1);
      if (tag == null || tag.trim().isEmpty) continue;
      tags.add(tag.toLowerCase());
      if (tags.length >= 10) break;
    }
    return tags;
  }

  Future<void> _pickImages() async {
    final picked = await _imagePicker.pickMultiImage(imageQuality: 85);
    if (picked.isEmpty) return;

    final next = [..._pendingImages, ...picked];
    setState(() {
      _pendingImages = next.take(5).toList();
    });
  }

  void _removePendingImage(int index) {
    if (index < 0 || index >= _pendingImages.length) return;
    setState(() {
      final next = [..._pendingImages]..removeAt(index);
      _pendingImages = next;
    });
  }

  Future<void> _startReply(CommunityMessage message) async {
    setState(() {
      _replyingTo = message;
      _editingMessage = null;
    });
  }

  void _cancelReply() {
    setState(() {
      _replyingTo = null;
    });
  }

  Future<void> _startEdit(CommunityMessage message) async {
    if (_currentUser?.id != message.authorId || message.deleted) return;
    setState(() {
      _editingMessage = message;
      _replyingTo = null;
      _hasSpoilerComposer = message.hasSpoiler;
      _pendingImages = const [];
      _messageController.text = message.content;
    });
  }

  void _cancelEdit() {
    setState(() {
      _editingMessage = null;
      _messageController.clear();
      _hasSpoilerComposer = false;
    });
  }

  Future<void> _toggleHeart(CommunityMessage message) async {
    if (!_chatSocketConnected) {
      _showSnack('Conectando ao chat para enviar reação...');
      await _connectChatSocket();
      return;
    }

    _sendStompFrame(
      command: 'SEND',
      headers: {
        'destination':
            '/app/community/${widget.communityId}/messages/${message.id}/react',
        'content-type': 'application/json',
      },
      body: jsonEncode({'reactionType': 'HEART'}),
    );
  }

  Future<void> _deleteMessage(CommunityMessage message) async {
    if (_currentUser?.id != message.authorId) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Excluir mensagem?'),
        content: const Text('Esta ação não pode ser desfeita.'),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    _sendStompFrame(
      command: 'SEND',
      headers: {
        'destination':
            '/app/community/${widget.communityId}/messages/${message.id}/delete',
      },
    );
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();

    if (_editingMessage != null) {
      if (text.isEmpty) {
        _showSnack('A mensagem editada não pode ficar vazia.');
        return;
      }
      final editing = _editingMessage!;
      _sendStompFrame(
        command: 'SEND',
        headers: {
          'destination':
              '/app/community/${widget.communityId}/messages/${editing.id}/edit',
          'content-type': 'application/json',
        },
        body: jsonEncode({'content': text}),
      );
      _cancelEdit();
      return;
    }

    if (text.isEmpty && _pendingImages.isEmpty) {
      return;
    }

    if (_chatSocket == null ||
        (!_chatSocketConnected && !_chatSocketConnecting)) {
      await _connectChatSocket();
    }

    if (!_chatSocketConnected) {
      _showSnack('Conectando ao chat. Tente enviar novamente em instantes.');
      return;
    }

    setState(() {
      _sendingMessage = true;
    });

    try {
      List<String> uploadedImages = const [];
      String? uploadedGif;

      if (_pendingImages.isNotEmpty) {
        setState(() {
          _uploadingMedia = true;
        });
        final media = await _repo.uploadCommunityMessageMedia(
          widget.communityId,
          imagePaths: _pendingImages.map((e) => e.path).toList(),
        );
        uploadedImages = media.$1;
        uploadedGif = media.$2;
      }

      final payload = {
        'content': text,
        if (_replyingTo != null) 'parentMessageId': _replyingTo!.id,
        'tags': _extractTags(text).toList(),
        'images': uploadedImages,
        if (uploadedGif != null) 'gifUrl': uploadedGif,
        'hasSpoiler': _hasSpoilerComposer,
        'clientMessageId': DateTime.now().millisecondsSinceEpoch.toString(),
      };

      _sendStompFrame(
        command: 'SEND',
        headers: {
          'destination': '/app/community/${widget.communityId}/send',
          'content-type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      setState(() {
        _messageController.clear();
        _replyingTo = null;
        _hasSpoilerComposer = false;
        _pendingImages = const [];
      });
    } on DioException catch (e) {
      String message = 'Nao foi possivel enviar a mensagem.';
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        final backendMessage = data['message'];
        if (backendMessage is String && backendMessage.trim().isNotEmpty) {
          message = backendMessage;
        }
      }
      _showSnack(message);
    } catch (_) {
      _showSnack('Nao foi possivel enviar a mensagem.');
    } finally {
      if (!mounted) return;
      setState(() {
        _sendingMessage = false;
        _uploadingMedia = false;
      });
    }
  }

  Future<void> _handleJoinOrLeave() async {
    final community = _community;
    if (community == null) return;

    if (!community.isMember) {
      if (community.isPublic) {
        await _joinCommunity();
      } else {
        await _requestToJoinCommunity();
      }
      return;
    }

    if (_isCurrentUserOwner) {
      _showSnack(
        'O proprietário não pode sair da comunidade. Transfira a propriedade primeiro.',
      );
      return;
    }

    await _confirmAndLeaveCommunity();
  }

  Future<void> _joinCommunity() async {
    await _repo.joinCommunity(widget.communityId);
    _joinRequestPending = false;
    await _reloadScreenData();
  }

  Future<void> _requestToJoinCommunity() async {
    try {
      await _repo.requestToJoin(widget.communityId);
      if (!mounted) return;
      setState(() {
        _joinRequestPending = true;
      });
      _showSnack('Pedido enviado. Aguarde a aprovação dos moderadores.');
    } on DioException catch (e) {
      _showSnack(
        _extractBackendMessage(e) ?? 'Nao foi possivel enviar o pedido.',
      );
    } catch (_) {
      _showSnack('Nao foi possivel enviar o pedido.');
    }
  }

  Future<void> _leaveCommunity() async {
    try {
      await _repo.leaveCommunity(widget.communityId);
      if (!mounted) return;
      Navigator.of(context).maybePop();
    } on DioException catch (e) {
      String message = 'Nao foi possivel sair da comunidade.';
      final responseData = e.response?.data;
      if (responseData is Map<String, dynamic>) {
        final backendMessage = responseData['message'];
        if (backendMessage is String && backendMessage.trim().isNotEmpty) {
          message = backendMessage;
        }
      }
      _showSnack(message);
    } catch (_) {
      _showSnack('Nao foi possivel sair da comunidade.');
    }
  }

  Future<void> _confirmAndLeaveCommunity() async {
    if (_isCurrentUserOwner) {
      _showSnack(
        'O proprietário não pode sair da comunidade. Transfira a propriedade primeiro.',
      );
      return;
    }

    final shouldLeave = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Sair da comunidade?'),
        content: const Text(
          'Você vai deixar de receber as mensagens e atualizações desta comunidade.',
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          const SizedBox(width: 8),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Sair'),
          ),
        ],
      ),
    );

    if (shouldLeave != true) return;
    await _leaveCommunity();
  }

  Future<void> _generateInviteCode() async {
    if (_community?.isMember != true) {
      _showSnack('Somente membros podem gerar código de convite.');
      return;
    }

    setState(() {
      _inviteActionBusy = true;
    });

    try {
      final inviteCode = await _repo.generateInviteCode(widget.communityId);
      if (!mounted) return;

      if (inviteCode.isEmpty) {
        _showSnack('Não foi possível gerar o código de convite.');
        return;
      }

      final copied = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (sheetContext) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Código de convite',
                  style: Theme.of(
                    sheetContext,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  inviteCode,
                  textAlign: TextAlign.center,
                  style: Theme.of(sheetContext).textTheme.headlineSmall
                      ?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  'Envie este código para quem você deseja convidar.',
                  textAlign: TextAlign.center,
                  style: Theme.of(sheetContext).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(sheetContext).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () async {
                    await Clipboard.setData(ClipboardData(text: inviteCode));
                    if (!sheetContext.mounted) return;
                    Navigator.of(sheetContext).pop(true);
                  },
                  icon: const Icon(Icons.copy_rounded),
                  label: const Text('Copiar código'),
                ),
              ],
            ),
          );
        },
      );

      if (copied == true) {
        _showSnack('Código copiado. Agora é só enviar para a pessoa.');
      }
    } on DioException catch (e) {
      _showSnack(
        _extractBackendMessage(e) ?? 'Não foi possível gerar o código.',
      );
    } catch (_) {
      _showSnack('Não foi possível gerar o código de convite.');
    } finally {
      if (!mounted) return;
      setState(() {
        _inviteActionBusy = false;
      });
    }
  }

  Future<List<UserSummaryModel>> _loadMutualFriends() async {
    if (_friendsLoaded) {
      return _friendCandidates;
    }

    final currentUser = _currentUser;
    if (currentUser == null) return [];

    setState(() {
      _friendsLoading = true;
    });

    try {
      final followers = await Injector.instance.userRepo.getAllFollowers(
        currentUser.username,
      );
      final following = await Injector.instance.userRepo.getAllFollowing(
        currentUser.username,
      );

      final followersByUsername = {
        for (final user in followers) user.username.toLowerCase(): user,
      };

      final mutuals =
          following
              .where(
                (user) => followersByUsername.containsKey(
                  user.username.toLowerCase(),
                ),
              )
              .toList()
            ..sort(
              (a, b) =>
                  a.username.toLowerCase().compareTo(b.username.toLowerCase()),
            );

      if (!mounted) return mutuals;
      setState(() {
        _friendCandidates = mutuals;
        _friendsLoaded = true;
      });
      return mutuals;
    } finally {
      if (!mounted) return _friendCandidates;
      setState(() {
        _friendsLoading = false;
      });
    }
  }

  Future<void> _sendInviteToFriend(UserSummaryModel friend) async {
    if (_community?.isMember != true) {
      _showSnack('Somente membros podem enviar convites.');
      return;
    }

    setState(() {
      _inviteActionBusy = true;
    });

    try {
      await _repo.inviteUserToCommunity(widget.communityId, friend.id);
      _showSnack('Convite enviado com sucesso. A pessoa será notificada.');
    } on DioException catch (e) {
      _showSnack(
        _extractBackendMessage(e) ?? 'Não foi possível enviar convite.',
      );
    } catch (_) {
      _showSnack('Não foi possível enviar convite.');
    } finally {
      if (!mounted) return;
      setState(() {
        _inviteActionBusy = false;
      });
    }
  }

  Future<void> _openInviteFriendSheet() async {
    if (_community?.isMember != true) {
      _showSnack('Somente membros podem enviar convites.');
      return;
    }

    final friends = await _loadMutualFriends();
    if (!mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: friends.isEmpty ? 0.45 : 0.78,
          minChildSize: 0.35,
          maxChildSize: 0.92,
          builder: (context, controller) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.outlineVariant,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Escolha um amigo para convidar',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Mostramos apenas quem você segue e quem também segue você.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (_friendsLoading)
                    const Expanded(
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (friends.isEmpty)
                    Expanded(
                      child: Center(
                        child: Text(
                          'Você ainda não tem amigos em comum para convidar.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: ListView.separated(
                        controller: controller,
                        itemCount: friends.length,
                        separatorBuilder: (_, _) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final friend = friends[index];
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(
                              backgroundImage:
                                  friend.avatarUrl != null &&
                                      friend.avatarUrl!.isNotEmpty
                                  ? NetworkImage(friend.avatarUrl!)
                                  : null,
                              child:
                                  friend.avatarUrl == null ||
                                      friend.avatarUrl!.isEmpty
                                  ? Text(friend.username[0].toUpperCase())
                                  : null,
                            ),
                            title: Text(friend.username),
                            subtitle: const Text('Amigo em comum'),
                            trailing: SizedBox(
                              width:
                                  200, // largura fixa suficiente para o texto "Convidar"
                              child: FilledButton(
                                onPressed: _inviteActionBusy
                                    ? null
                                    : () async {
                                        Navigator.of(sheetContext).pop();
                                        await _sendInviteToFriend(friend);
                                      },
                                child: const Text('Convidar'),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _handleShareFromOverview() async {
    if (_community == null) return;
    if (!_community!.isMember) return;

    final action = await showModalBottomSheet<String>(
      context: context,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.qr_code_rounded),
                title: const Text('Gerar código de convite'),
                onTap: () => Navigator.of(sheetContext).pop('generate-code'),
              ),
              ListTile(
                leading: const Icon(Icons.people_alt_rounded),
                title: const Text('Convidar amigo'),
                subtitle: const Text('Escolha entre seus amigos em comum'),
                onTap: () => Navigator.of(sheetContext).pop('send-friend'),
              ),
            ],
          ),
        );
      },
    );

    if (action == null) return;

    if (action == 'generate-code') {
      await _generateInviteCode();
      return;
    }

    if (action == 'send-friend') {
      await _openInviteFriendSheet();
      return;
    }
  }

  String? _extractBackendMessage(DioException error) {
    final responseData = error.response?.data;
    if (responseData is Map<String, dynamic>) {
      final backendMessage = responseData['message'];
      if (backendMessage is String && backendMessage.trim().isNotEmpty) {
        return backendMessage;
      }
    }
    return null;
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final community = _community;
    final showMemberChat = community?.isMember == true;
    final showVotingTab = _shouldShowVotingTab;

    String? accessNoticeTitle;
    String? accessNoticeDescription;
    if (community != null && !community.isMember) {
      if (community.isPublic) {
        accessNoticeTitle = 'Chat liberado apenas para membros';
        accessNoticeDescription =
            'Esta comunidade é pública para visualização. Toque em Entrar para participar das conversas.';
      } else {
        accessNoticeTitle = 'Comunidade privada';
        accessNoticeDescription = _joinRequestPending
            ? 'Seu pedido de entrada está em análise. O chat será liberado quando for aprovado.'
            : 'Peça para entrar para participar das conversas. O acesso ao chat é liberado após aprovação.';
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Comunidade'),
        bottom: showMemberChat
            ? CommunityDetailTabBar(
                controller: _tabController,
                showChatTab: true,
                showVotingTab: showVotingTab,
              )
            : null,
      ),
      body: _headerLoading
          ? const Center(child: CircularProgressIndicator())
          : _headerError != null
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: [
                CommunityDetailErrorState(
                  message: _headerError!,
                  onRetry: _loadHeader,
                ),
              ],
            )
          : community == null
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'Comunidade indisponivel.',
                    style: theme.textTheme.bodyLarge,
                  ),
                ),
              ],
            )
          : !showMemberChat
          ? CommunityOverviewTab(
              community: community,
              book: _book,
              members: _members,
              joinRequestPending: _joinRequestPending,
              onJoinOrLeave: _handleJoinOrLeave,
              onRefresh: _reloadScreenData,
              onShare: _handleShareFromOverview,
              accessNoticeTitle: accessNoticeTitle,
              accessNoticeDescription: accessNoticeDescription,
            )
          : TabBarView(
              controller: _tabController,
              children: [
                CommunityOverviewTab(
                  community: community,
                  book: _book,
                  members: _members,
                  joinRequestPending: _joinRequestPending,
                  onJoinOrLeave: _handleJoinOrLeave,
                  onRefresh: _reloadScreenData,
                  onShare: _handleShareFromOverview,
                ),
                CommunityChatTab(
                  loading: _messagesLoading && !_messagesLoaded,
                  error: _messagesError,
                  messages: _messages,
                  chatSocketConnecting: _chatSocketConnecting,
                  chatSocketConnected: _chatSocketConnected,
                  chatSocketError: _chatSocketError,
                  currentUserId: _currentUser?.id,
                  currentUserInitials: _currentUser == null
                      ? 'U'
                      : _currentUser.username.isEmpty
                      ? 'U'
                      : _currentUser.username
                            .split(RegExp(r'\s+'))
                            .where((part) => part.isNotEmpty)
                            .take(2)
                            .map((part) => part[0])
                            .join()
                            .toUpperCase(),
                  composerController: _messageController,
                  composerBusy: _sendingMessage,
                  uploadingMedia: _uploadingMedia,
                  replyingTo: _replyingTo,
                  editingMessage: _editingMessage,
                  hasSpoilerComposer: _hasSpoilerComposer,
                  pendingImages: _pendingImages,
                  onSendMessage: _sendMessage,
                  onRetry: _loadMessages,
                  onPickImages: _pickImages,
                  onRemovePendingImage: _removePendingImage,
                  onSpoilerChanged: (value) {
                    setState(() {
                      _hasSpoilerComposer = value;
                    });
                  },
                  onCancelReplying: _cancelReply,
                  onCancelEditing: _cancelEdit,
                  onReplyMessage: _startReply,
                  onEditMessage: _startEdit,
                  onDeleteMessage: _deleteMessage,
                  onToggleHeart: _toggleHeart,
                  findMessageById: _findMessageById,
                  resolveAuthorName: _resolveAuthorName,
                ),
                if (showVotingTab)
                  BlocProvider(
                    create: (_) => CommunityVotingBloc(
                      repository: _votingRepo,
                      currentUserId: _currentUser?.id ?? -1,
                      communityOwnerId: community.ownerId,
                      currentUserRole: _currentUserCommunityRole(community),
                    )..add(CommunityVotingLoadRequested(widget.communityId)),
                    child: CommunityVotingTab(
                      communityId: widget.communityId,
                      isOwner: _canManageVoting,
                      onRefresh: _reloadScreenData,
                    ),
                  )
                else
                  const SizedBox.shrink(),
              ],
            ),
    );
  }
}
