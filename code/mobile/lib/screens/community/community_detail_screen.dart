import 'dart:convert';
import 'dart:async';

import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/book/domain/book.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/community/domain/community_member.dart';
import 'package:biblioo/features/community/domain/community_message.dart';
import 'package:biblioo/features/community/domain/community_post.dart';
import 'package:biblioo/features/community/domain/community_post_draft.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'widgets/community_chat_tab.dart';
import 'widgets/community_detail_shared.dart';
import 'widgets/community_detail_tab_bar.dart';
import 'widgets/community_feed_tab.dart';
import 'widgets/community_overview_tab.dart';

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
  final _authLocal = Injector.instance.authLocal;
  final User? _currentUser = Injector.instance.authLocal.getSessionUser();

  static const Duration _refreshCooldown = Duration(seconds: 20);

  late final TabController _tabController;

  Community? _community;
  Book? _book;
  List<CommunityMember> _members = const [];
  bool _headerLoading = true;
  String? _headerError;

  List<CommunityPost> _posts = const [];
  bool _postsLoading = false;
  bool _postsLoaded = false;
  String? _postsError;

  List<CommunityMessage> _messages = const [];
  bool _messagesLoading = false;
  bool _messagesLoaded = false;
  String? _messagesError;
  final TextEditingController _messageController = TextEditingController();
  bool _sendingMessage = false;

  DateTime? _lastRefreshAt;
  WebSocketChannel? _chatSocket;
  StreamSubscription<dynamic>? _chatSocketSubscription;
  bool _chatSocketConnecting = false;
  bool _chatSocketConnected = false;
  String? _chatSocketError;

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
      final members = await _repo.getCommunityMembers(
        widget.communityId,
        forceRefresh: forceRefresh,
      );

      if (!mounted) return;
      setState(() {
        _community = community;
        _book = book;
        _members = members;
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

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    if (_tabController.index == 1 && !_postsLoaded) {
      _loadPosts();
    }
    if (_tabController.index == 2 && !_messagesLoaded) {
      _loadMessages();
    }
    if (_tabController.index == 2 &&
        !_chatSocketConnected &&
        !_chatSocketConnecting) {
      _connectChatSocket();
    }
  }

  Future<void> _loadPosts() async {
    setState(() {
      _postsLoading = true;
      _postsError = null;
    });

    try {
      final posts = await _repo.getCommunityPosts(widget.communityId);
      if (!mounted) return;
      setState(() {
        _posts = posts;
        _postsLoaded = true;
        _postsLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _postsError = 'Nao foi possivel carregar o feed.';
        _postsLoading = false;
      });
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
        _messages = messages;
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

  Future<void> _refresh({bool bypassCooldown = false}) async {
    final now = DateTime.now();
    final remaining = _remainingCooldown(now);
    if (!bypassCooldown && remaining > Duration.zero) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Aguarde ${remaining.inSeconds}s para atualizar novamente.',
          ),
        ),
      );
      return;
    }

    _lastRefreshAt = now;
    await _loadHeader(forceRefresh: true);
    if (_tabController.index == 1) {
      await _loadPosts();
    }
    if (_tabController.index == 2) {
      await _loadMessages();
    }
  }

  Duration _remainingCooldown([DateTime? now]) {
    if (_lastRefreshAt == null) return Duration.zero;
    final elapsed = (now ?? DateTime.now()).difference(_lastRefreshAt!);
    final remaining = _refreshCooldown - elapsed;
    return remaining.isNegative ? Duration.zero : remaining;
  }

  Future<void> _connectChatSocket() async {
    final apiUrl = const String.fromEnvironment(
      'API_URL',
      defaultValue: 'http://localhost:8080',
    );
    final parsed = Uri.parse(apiUrl);
    final token = _authLocal.getAccessToken();

    final wsUri = parsed.replace(
      scheme: parsed.scheme == 'https' ? 'wss' : 'ws',
      path: '/ws/community/websocket',
      query: '',
      fragment: '',
    );

    setState(() {
      _chatSocketConnecting = true;
      _chatSocketError = null;
    });

    try {
      final channel = WebSocketChannel.connect(wsUri);
      _chatSocket = channel;
      _chatSocketSubscription = channel.stream.listen(
        (event) {
          final frame = event.toString();
          if (frame.startsWith('CONNECTED')) {
            setState(() {
              _chatSocketConnected = true;
              _chatSocketConnecting = false;
              _chatSocketError = null;
            });
            channel.sink.add(
              'SUBSCRIBE\nid:sub-community-${widget.communityId}\ndestination:/topic/community.${widget.communityId}.messages\n\n\u0000',
            );
          }
        },
        onError: (_) {
          if (!mounted) return;
          setState(() {
            _chatSocketConnected = false;
            _chatSocketConnecting = false;
            _chatSocketError =
                'Nao foi possivel conectar em tempo real. Exibindo historico.';
          });
        },
        onDone: () {
          if (!mounted) return;
          setState(() {
            _chatSocketConnected = false;
            _chatSocketConnecting = false;
          });
        },
      );

      final authHeader = token == null || token.isEmpty
          ? ''
          : 'Authorization:Bearer $token\n';
      channel.sink.add(
        'CONNECT\naccept-version:1.2\nheart-beat:10000,10000\n$authHeader\n\u0000',
      );
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _chatSocketConnected = false;
        _chatSocketConnecting = false;
        _chatSocketError =
            'Nao foi possivel conectar em tempo real. Exibindo historico.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Comunidade'),
        actions: [
          IconButton(
            onPressed: _refresh,
            icon: const Icon(Icons.refresh_rounded),
            tooltip: _remainingCooldown() > Duration.zero
                ? 'Atualizar em ${_remainingCooldown().inSeconds}s'
                : 'Atualizar',
          ),
        ],
        bottom: CommunityDetailTabBar(controller: _tabController),
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: _headerLoading
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
            : _community == null
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
            : TabBarView(
                controller: _tabController,
                children: [
                  CommunityOverviewTab(
                    community: _community!,
                    book: _book,
                    members: _members,
                    onJoinOrLeave: _community!.isMember
                        ? _leaveCommunity
                        : _joinCommunity,
                    onRefresh: _refresh,
                  ),
                  CommunityFeedTab(
                    loading: _postsLoading && !_postsLoaded,
                    error: _postsError,
                    posts: _posts,
                    onCreatePost: _createPost,
                    onRetry: _loadPosts,
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
                    onSendMessage: _sendMessage,
                    onRetry: _loadMessages,
                  ),
                ],
              ),
      ),
    );
  }

  Future<void> _joinCommunity() async {
    await _repo.joinCommunity(widget.communityId);
    await _refresh(bypassCooldown: true);
  }

  Future<void> _leaveCommunity() async {
    await _repo.leaveCommunity(widget.communityId);
    await _refresh(bypassCooldown: true);
  }

  Future<void> _createPost(CommunityPostDraft draft) async {
    try {
      await _repo.createCommunityPost(widget.communityId, draft: draft);
      await _loadPosts();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nao foi possivel criar o post.')),
      );
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _sendingMessage = true;
    });

    try {
      if (_chatSocket == null || !_chatSocketConnected) {
        throw StateError('Socket indisponivel');
      }

      _chatSocket!.sink.add(
        'SEND\ndestination:/app/community/${widget.communityId}/send\ncontent-type:application/json\n\n{"content":${jsonEncode(text)},"tags":[],"images":[],"hasSpoiler":false,"clientMessageId":${jsonEncode(DateTime.now().millisecondsSinceEpoch.toString())}}\u0000',
      );

      _messageController.clear();
      await Future<void>.delayed(const Duration(milliseconds: 250));
      await _loadMessages();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nao foi possivel enviar a mensagem.')),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _sendingMessage = false;
      });
    }
  }
}
