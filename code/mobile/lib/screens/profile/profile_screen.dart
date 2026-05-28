import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/community/domain/community.dart';
import 'package:biblioo/features/dna/domain/dna_snapshot.dart';
import 'package:biblioo/features/feed/domain/feed_item.dart';
import 'package:biblioo/features/shelf/domain/reading_status.dart';
import 'package:biblioo/features/shelf/domain/shelf.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';
import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/bloc/user_event.dart';
import 'package:biblioo/features/user/bloc/user_state.dart';
import 'package:biblioo/features/user/data/models/follow_page_model.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';
import 'package:biblioo/screens/feed/widgets/feed_item_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'widgets/profile_dna_section.dart';
import 'widgets/profile_details_section.dart';
import 'widgets/profile_header.dart';
import 'widgets/profile_privacy_notice.dart';
import 'widgets/profile_stats_card.dart';
import 'widgets/share_capsule_sheet.dart';

enum ProfileTarget { me, user }

enum ProfileTab { biblioteca, atividade, comunidades }

class ProfileScreen extends StatefulWidget {
  final ProfileTarget target;
  final String? username;

  const ProfileScreen.forMe({super.key})
    : target = ProfileTarget.me,
      username = null;

  const ProfileScreen.forUser(String this.username, {super.key})
    : target = ProfileTarget.user;

  bool get isMe => target == ProfileTarget.me;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _userRepo = Injector.instance.userRepo;
  final _shelfRepo = Injector.instance.shelfRepo;
  final _bookRepo = Injector.instance.bookRepo;
  final _feedRepo = Injector.instance.feedRepo;
  final _communityRepo = Injector.instance.communityRepo;
  final _dnaRepo = Injector.instance.dnaRepo;

  static const _goalKey = 'biblioo.profile.goal.target';
  static const _defaultGoalTarget = 24;

  int _followersCount = 0;
  int _followingCount = 0;
  List<UserSummaryModel> _followers = const [];
  List<UserSummaryModel> _following = const [];
  String? _socialDataForUsername;
  bool _socialLoading = false;

  int _booksRead = 0;
  int _pagesRead = 0;
  int _readersReached = 0;
  String _daysPerBook = '-';
  int _goalTarget = _defaultGoalTarget;
  bool _goalLoading = true;
  List<ProfileDnaEntry> _dnaEntries = const [];
  int? _dnaRemaining;
  String? _dnaProfileLabel;
  String? _dnaReadingLevel;
  String? _dnaProgressMessage;

  List<_ProfileShelfEntry> _libraryEntries = const [];
  bool _libraryLoading = false;
  List<FeedItem> _activityItems = const [];
  bool _activityLoading = false;
  List<Community> _communities = const [];
  DateTime? _communitiesCachedAt;
  bool _communitiesLoading = false;

  ProfileTab _activeTab = ProfileTab.biblioteca;
  int? _insightsForUserId;
  User? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadGoalTarget();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _reload();
    });
  }

  @override
  void didUpdateWidget(covariant ProfileScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    final targetChanged = oldWidget.target != widget.target;
    final usernameChanged = oldWidget.username != widget.username;
    if (targetChanged || usernameChanged) {
      _reload();
    }
  }

  void _reload() {
    final bloc = context.read<UserBloc>();
    if (widget.isMe) {
      bloc.add(LoadMyProfile());
    } else {
      bloc.add(LoadUserProfile(widget.username!));
    }
  }

  bool _isOwner(User user) {
    if (widget.isMe) return true;

    final authState = context.read<AuthBloc>().state;
    return authState is AuthAuthenticated &&
        authState.session.user.id == user.id;
  }

  bool _canSeePrivateSections(User user, bool isOwner) {
    return isOwner || !user.restricted;
  }

  void _shareProfile() {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Compartilhamento em breve')));
  }

  void _openCapsule(User user) {
    showShareCapsuleSheet(
      context: context,
      userHandle: '@${user.username}',
      booksRead: _booksRead,
    );
  }

  Future<void> _loadGoalTarget() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _goalTarget = prefs.getInt(_goalKey) ?? _defaultGoalTarget;
      _goalLoading = false;
    });
  }

  Future<void> _saveGoalTarget(int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_goalKey, value);
    if (!mounted) return;
    setState(() => _goalTarget = value);
  }

  Future<void> _openGoalEditor() async {
    final controller = TextEditingController(text: _goalTarget.toString());
    final result = await showDialog<int>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Meta de leitura'),
          content: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Livros no ano',
              hintText: 'Ex.: 24',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () {
                final parsed = int.tryParse(controller.text.trim());
                if (parsed == null || parsed <= 0) {
                  Navigator.pop(dialogContext);
                  return;
                }
                Navigator.pop(dialogContext, parsed);
              },
              child: const Text('Salvar'),
            ),
          ],
        );
      },
    );

    if (result != null) {
      await _saveGoalTarget(result);
    }
  }

  void _ensureSocialData(User user) {
    if (_socialLoading && _socialDataForUsername == user.username) return;
    if (_socialDataForUsername == user.username) return;

    _socialDataForUsername = user.username;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadSocialData(user.username);
    });
  }

  Future<void> _loadSocialData(String username) async {
    setState(() {
      _socialLoading = true;
      _socialDataForUsername = username;
    });

    try {
      final followers = await _userRepo.getAllFollowers(username);
      final following = await _userRepo.getAllFollowing(username);

      if (!mounted) return;
      setState(() {
        _followers = followers;
        _following = following;
        _followersCount = followers.length;
        _followingCount = following.length;
        _socialLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _followers = const [];
        _following = const [];
        _followersCount = 0;
        _followingCount = 0;
        _socialLoading = false;
      });
    }
  }

  void _ensureInsights(User user, {required bool canSeePrivateSections}) {
    if (_insightsForUserId == user.id) return;
    _insightsForUserId = user.id;
    _currentUser = user;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadLibrary(user);
      if (canSeePrivateSections) {
        _loadActivity(user);
        _loadCommunities();
        _loadDna(user);
      }
    });
  }

  Future<void> _loadLibrary(User user, {bool refreshRemote = false}) async {
    setState(() => _libraryLoading = true);
    final cachedShelves = _shelfRepo.getCachedShelves();
    final cachedEntries = _buildLibraryEntries(cachedShelves);
    if (cachedEntries.isNotEmpty) {
      _applyLibraryEntries(user, cachedEntries);
      setState(() => _libraryLoading = false);
      if (!refreshRemote) return;
    }

    if (cachedEntries.isEmpty && !refreshRemote) {
      refreshRemote = true;
    }

    if (refreshRemote) {
      try {
        final shelves = await _shelfRepo.getShelves();
        if (shelves.isNotEmpty) {
          await Future.wait(
            shelves.map((shelf) => _shelfRepo.getItems(shelf.id)),
          );
        }
        final freshEntries = _buildLibraryEntries(shelves);
        if (!mounted) return;
        _applyLibraryEntries(user, freshEntries);
      } catch (_) {
        if (!mounted) return;
      }
    }

    if (mounted) {
      setState(() => _libraryLoading = false);
    }
  }

  List<_ProfileShelfEntry> _buildLibraryEntries(List<Shelf> shelves) {
    final entries = <_ProfileShelfEntry>[];
    for (final shelf in shelves) {
      final items = _shelfRepo.getCachedItems(shelf.id);
      for (final item in items) {
        entries.add(_ProfileShelfEntry(shelf: shelf, item: item));
      }
    }
    return entries;
  }

  void _applyLibraryEntries(User user, List<_ProfileShelfEntry> entries) {
    final cachedBooks = _bookRepo.getCachedBooks();
    final bookMap = {for (final book in cachedBooks) book.id: book};
    final uniqueBookIds = <int>{};

    var booksRead = 0;
    var pagesRead = 0;
    var readersReached = 0;

    for (final entry in entries) {
      final item = entry.item;
      if (item.status == ReadingStatus.completed) booksRead += 1;

      final cachedBook = bookMap[item.bookId];
      final totalPages = item.totalPages ?? cachedBook?.pageCount ?? 0;
      final progress = _resolveProgressPercent(item, totalPages);
      pagesRead += ((totalPages * progress) / 100).round();

      if (cachedBook != null && !uniqueBookIds.contains(cachedBook.id)) {
        readersReached += cachedBook.readerCount ?? 0;
        uniqueBookIds.add(cachedBook.id);
      }
    }

    final daysPerBook = _computeDaysPerBook(user, booksRead);

    setState(() {
      _libraryEntries = entries;
      _booksRead = booksRead;
      _pagesRead = pagesRead;
      _readersReached = readersReached;
      _daysPerBook = daysPerBook;
    });
  }

  Future<void> _loadActivity(User user, {bool refreshRemote = false}) async {
    setState(() => _activityLoading = true);
    final cached = _feedRepo
        .getCachedFeed(user.id)
        .where((item) => item.authorId == user.id)
        .toList();
    if (cached.isNotEmpty) {
      setState(() {
        _activityItems = cached;
        _activityLoading = false;
      });
      if (!refreshRemote) return;
    }

    if (cached.isEmpty && !refreshRemote) {
      refreshRemote = true;
    }

    if (refreshRemote) {
      try {
        final page = await _feedRepo.getFeed(userId: user.id, size: 20);
        if (!mounted) return;
        setState(() {
          _activityItems = page.items
              .where((item) => item.authorId == user.id)
              .toList();
        });
      } catch (_) {
        if (!mounted) return;
      }
    }

    if (mounted) {
      setState(() => _activityLoading = false);
    }
  }

  Future<void> _loadCommunities({bool refreshRemote = false}) async {
    setState(() => _communitiesLoading = true);
    final cached = _communityRepo.getCachedMineCommunities();
    final cachedAt = _communityRepo.getCachedCommunitiesUpdatedAt();
    if (cached.isNotEmpty) {
      setState(() {
        _communities = cached;
        _communitiesCachedAt = cachedAt;
        _communitiesLoading = false;
      });
      if (!refreshRemote) return;
    }

    if (cached.isEmpty && !refreshRemote) {
      refreshRemote = true;
    }

    if (refreshRemote) {
      try {
        final result = await _communityRepo.getCommunities();
        if (!mounted) return;
        setState(() {
          _communities = result.mine;
          _communitiesCachedAt = result.lastSyncedAt;
        });
      } catch (_) {
        if (!mounted) return;
      }
    }

    if (mounted) {
      setState(() => _communitiesLoading = false);
    }
  }

  Future<void> _loadDna(User user, {bool refreshRemote = false}) async {
    try {
      final snapshot = await _dnaRepo.getDna(
        userId: user.id,
        refreshRemote: refreshRemote,
      );
      if (!mounted) return;
      _applyDnaSnapshot(snapshot);
    } catch (_) {
      if (!mounted) return;
    }
  }

  void _applyDnaSnapshot(DnaSnapshot snapshot) {
    final entries = snapshot.themes
        .map(
          (theme) =>
              ProfileDnaEntry(label: theme.theme, value: theme.percentage),
        )
        .toList();
    final limitedEntries = entries.length > 3 ? entries.sublist(0, 3) : entries;
    final remaining = snapshot.booksRequired > 0
        ? (snapshot.booksRequired - snapshot.booksRead).clamp(
            0,
            snapshot.booksRequired,
          )
        : null;

    setState(() {
      _dnaEntries = snapshot.isComputed ? limitedEntries : const [];
      _dnaProfileLabel = snapshot.isComputed
          ? snapshot.dominantArchetypeLabel
          : null;
      _dnaReadingLevel = snapshot.isComputed ? snapshot.complexityLabel : null;
      _dnaProgressMessage = snapshot.isComputed ? null : snapshot.message;
      _dnaRemaining = snapshot.isComputed
          ? null
          : (remaining == 0 ? null : remaining);
    });
  }

  double _resolveProgressPercent(ShelfItem item, int totalPages) {
    if (item.progressPercent != null) return item.progressPercent!.toDouble();
    final currentPage = item.currentPage ?? 0;
    if (totalPages <= 0) return 0;
    return (currentPage / totalPages * 100).clamp(0, 100);
  }

  String _computeDaysPerBook(User user, int booksRead) {
    if (booksRead <= 0 || user.createdAt == null) return '-';
    final created = DateTime.tryParse(user.createdAt!);
    if (created == null) return '-';
    final days = DateTime.now().difference(created).inDays;
    if (days <= 0) return '-';
    return (days / booksRead).round().toString();
  }

  String _formatNumber(int value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)}M';
    }
    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}k';
    }
    return value.toString();
  }

  Future<void> _openUserSheet(
    String title,
    List<UserSummaryModel> users,
  ) async {
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
          initialChildSize: 0.7,
          minChildSize: 0.4,
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
                    title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView.separated(
                      controller: controller,
                      itemCount: users.length,
                      separatorBuilder: (_, _) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final user = users[index];
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundImage:
                                user.avatarUrl != null &&
                                    user.avatarUrl!.isNotEmpty
                                ? NetworkImage(user.avatarUrl!)
                                : null,
                            child:
                                user.avatarUrl == null ||
                                    user.avatarUrl!.isEmpty
                                ? Text(
                                    user.username.substring(0, 1).toUpperCase(),
                                  )
                                : null,
                          ),
                          title: Text(user.username),
                          onTap: () {
                            Navigator.of(context).pop();
                            context.push('/user/${user.username}');
                          },
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

  Future<void> _toggleFollow(User user) async {
    final bloc = context.read<UserBloc>();
    if (user.isFollowing || user.isFollowRequested) {
      bloc.add(UnfollowUser(user.username));
    } else {
      bloc.add(FollowUser(user.username));
    }
  }

  Future<void> _refresh() async {
    _reload();
    final user = _currentUser;
    if (user == null) return;
    final canSeePrivate = _canSeePrivateSections(user, _isOwner(user));
    await _loadLibrary(user, refreshRemote: true);
    if (canSeePrivate) {
      await _loadActivity(user, refreshRemote: true);
      await _loadCommunities(refreshRemote: true);
      await _loadDna(user, refreshRemote: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        if (state is UserLoading || state is UserInitial) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (state is UserError) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(state.message),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _reload,
                    child: const Text('Tentar novamente'),
                  ),
                ],
              ),
            ),
          );
        }

        final user = (state as UserLoaded).user;
        final isOwner = _isOwner(user);
        final canSeePrivateSections = _canSeePrivateSections(user, isOwner);
        final authState = context.read<AuthBloc>().state;
        final currentUserId = authState is AuthAuthenticated
            ? authState.session.user.id
            : user.id;

        _ensureSocialData(user);
        _ensureInsights(user, canSeePrivateSections: canSeePrivateSections);

        return Scaffold(
          body: CooldownRefreshIndicator(
            keyId: widget.isMe ? 'profile_me' : 'profile_${widget.username}',
            onRefresh: _refresh,
            child: RefreshIndicator(
              onRefresh: _refresh,
              child: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    pinned: true,
                    title: Text(isOwner ? 'Meu perfil' : 'Perfil'),
                    actions: [
                      if (isOwner)
                        IconButton(
                          onPressed: () => context.push('/profile/settings'),
                          icon: const Icon(Icons.settings_outlined),
                          tooltip: 'Configuracoes',
                        ),
                    ],
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 12),
                          ProfileHeader(
                            user: user,
                            isOwner: isOwner,
                            onPrimaryAction: isOwner
                                ? () => context.push('/profile/edit')
                                : () => _toggleFollow(user),
                            onShare: isOwner
                                ? () => _openCapsule(user)
                                : _shareProfile,
                          ),
                          const SizedBox(height: 8),
                          ProfileDetailsSection(
                            user: user,
                            isOwner: isOwner,
                            followersCount: _followersCount,
                            followingCount: _followingCount,
                            onFollowersTap: () =>
                                _openUserSheet('Seguidores', _followers),
                            onFollowingTap: () =>
                                _openUserSheet('Seguindo', _following),
                          ),
                          if (canSeePrivateSections) ...[
                            const SizedBox(height: 20),
                            ProfileStatsCard(
                              booksRead: _formatNumber(_booksRead),
                              pagesRead: _formatNumber(_pagesRead),
                              daysPerBook: _daysPerBook,
                              readersReached: _formatNumber(_readersReached),
                            ),
                            const SizedBox(height: 16),
                            LayoutBuilder(
                              builder: (context, constraints) {
                                final isWide = constraints.maxWidth >= 640;
                                final goalCard = _GoalCard(
                                  booksRead: _booksRead,
                                  goalTarget: _goalTarget,
                                  isLoading: _goalLoading,
                                  isOwner: isOwner,
                                  onEdit: _openGoalEditor,
                                );
                                final dnaCard = _CardSection(
                                  child: ProfileDnaSection(
                                    entries: _dnaEntries,
                                    remainingToUnlock: _dnaRemaining,
                                    profileLabel: _dnaProfileLabel,
                                    readingLevel: _dnaReadingLevel,
                                    progressMessage: _dnaProgressMessage,
                                    onSeeMore: () =>
                                        context.push('/profile/dna'),
                                  ),
                                );

                                if (isWide) {
                                  return Row(
                                    children: [
                                      Expanded(child: goalCard),
                                      const SizedBox(width: 12),
                                      Expanded(child: dnaCard),
                                    ],
                                  );
                                }

                                return Column(
                                  children: [
                                    goalCard,
                                    const SizedBox(height: 12),
                                    dnaCard,
                                  ],
                                );
                              },
                            ),
                            const SizedBox(height: 16),
                            _ProfileTabs(
                              activeTab: _activeTab,
                              onChanged: (tab) {
                                setState(() => _activeTab = tab);
                              },
                            ),
                            const SizedBox(height: 12),
                            _ProfileTabContent(
                              activeTab: _activeTab,
                              isOwner: isOwner,
                              currentUserId: currentUserId,
                              libraryEntries: _libraryEntries,
                              libraryLoading: _libraryLoading,
                              activityItems: _activityItems,
                              activityLoading: _activityLoading,
                              communities: _communities,
                              communitiesLoading: _communitiesLoading,
                              communitiesCachedAt: _communitiesCachedAt,
                            ),
                          ] else ...[
                            const SizedBox(height: 20),
                            const ProfilePrivacyNotice(),
                          ],
                          const SizedBox(height: 80),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ProfileShelfEntry {
  final Shelf shelf;
  final ShelfItem item;

  const _ProfileShelfEntry({required this.shelf, required this.item});
}

class _CardSection extends StatelessWidget {
  final Widget child;

  const _CardSection({required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _GoalCard extends StatelessWidget {
  final int booksRead;
  final int goalTarget;
  final bool isLoading;
  final bool isOwner;
  final VoidCallback onEdit;

  const _GoalCard({
    required this.booksRead,
    required this.goalTarget,
    required this.isLoading,
    required this.isOwner,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = goalTarget <= 0
        ? 0.0
        : (booksRead / goalTarget).clamp(0.0, 1.0);
    final remaining = (goalTarget - booksRead).clamp(0, goalTarget);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Meta de leitura ${DateTime.now().year}',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (isOwner)
                  IconButton(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    tooltip: 'Editar meta',
                  ),
              ],
            ),
            const SizedBox(height: 8),
            if (isLoading)
              const Center(child: CircularProgressIndicator())
            else ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Meta de leitura',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  Text(
                    '$booksRead/$goalTarget',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: progress,
                borderRadius: BorderRadius.circular(6),
                minHeight: 8,
              ),
              const SizedBox(height: 8),
              Text(
                remaining > 0
                    ? 'Faltam $remaining livro(s) para completar sua meta.'
                    : 'Meta concluida. Parabens!',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProfileTabs extends StatelessWidget {
  final ProfileTab activeTab;
  final ValueChanged<ProfileTab> onChanged;

  const _ProfileTabs({required this.activeTab, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<ProfileTab>(
      segments: const [
        ButtonSegment(value: ProfileTab.biblioteca, label: Text('Bibliooteca')),
        ButtonSegment(value: ProfileTab.atividade, label: Text('Atividade')),
        ButtonSegment(
          value: ProfileTab.comunidades,
          label: Text('Comunidades'),
        ),
      ],
      selected: {activeTab},
      showSelectedIcon: false,
      onSelectionChanged: (selection) {
        if (selection.isEmpty) return;
        onChanged(selection.first);
      },
    );
  }
}

class _ProfileTabContent extends StatelessWidget {
  final ProfileTab activeTab;
  final bool isOwner;
  final int currentUserId;
  final List<_ProfileShelfEntry> libraryEntries;
  final bool libraryLoading;
  final List<FeedItem> activityItems;
  final bool activityLoading;
  final List<Community> communities;
  final bool communitiesLoading;
  final DateTime? communitiesCachedAt;

  const _ProfileTabContent({
    required this.activeTab,
    required this.isOwner,
    required this.currentUserId,
    required this.libraryEntries,
    required this.libraryLoading,
    required this.activityItems,
    required this.activityLoading,
    required this.communities,
    required this.communitiesLoading,
    required this.communitiesCachedAt,
  });

  @override
  Widget build(BuildContext context) {
    switch (activeTab) {
      case ProfileTab.biblioteca:
        return _LibrarySection(
          entries: libraryEntries,
          loading: libraryLoading,
        );
      case ProfileTab.atividade:
        return _ActivitySection(
          items: activityItems,
          loading: activityLoading,
          currentUserId: currentUserId,
        );
      case ProfileTab.comunidades:
        return _CommunitiesSection(
          communities: communities,
          loading: communitiesLoading,
          cachedAt: communitiesCachedAt,
        );
    }
  }
}

class _LibrarySection extends StatelessWidget {
  final List<_ProfileShelfEntry> entries;
  final bool loading;

  const _LibrarySection({required this.entries, required this.loading});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (loading && entries.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (entries.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Sua biblioteca esta vazia',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Adicione livros para acompanhar seu progresso e metas no perfil.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => context.push('/search'),
                child: const Text('Explorar livros'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: entries.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final entry = entries[index];
            return _LibraryCard(entry: entry);
          },
        ),
      ],
    );
  }
}

class _LibraryCard extends StatelessWidget {
  final _ProfileShelfEntry entry;

  const _LibraryCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final item = entry.item;
    final statusColors = _statusColors(theme, item.status);
    final progress =
        item.progressPercent ??
        (item.totalPages != null && item.totalPages! > 0
            ? ((item.currentPage ?? 0) / item.totalPages! * 100).round()
            : null);

    return Card(
      elevation: 0,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.push(
          '/book/${item.bookId}',
          extra: {'shelfId': entry.shelf.id, 'item': item},
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _BookCover(coverUrl: item.bookCoverUrl),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.bookTitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      entry.shelf.name,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: statusColors.background,
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: statusColors.border),
                          ),
                          child: Text(
                            item.status.label,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: statusColors.foreground,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        if (progress != null)
                          Text(
                            '$progress% lido',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActivitySection extends StatelessWidget {
  final List<FeedItem> items;
  final bool loading;
  final int currentUserId;

  const _ActivitySection({
    required this.items,
    required this.loading,
    required this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    if (loading && items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (items.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Text(
            'Sem atividade recente.',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return FeedItemCard(item: items[index], currentUserId: currentUserId);
      },
    );
  }
}

class _CommunitiesSection extends StatelessWidget {
  final List<Community> communities;
  final bool loading;
  final DateTime? cachedAt;

  const _CommunitiesSection({
    required this.communities,
    required this.loading,
    required this.cachedAt,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (loading && communities.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (communities.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Text(
            'Nenhuma comunidade encontrada.',
            style: theme.textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (cachedAt != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              'Atualizado em ${cachedAt!.hour.toString().padLeft(2, '0')}:${cachedAt!.minute.toString().padLeft(2, '0')}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: communities.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            return _CommunityCard(community: communities[index]);
          },
        ),
      ],
    );
  }
}

class _CommunityCard extends StatelessWidget {
  final Community community;

  const _CommunityCard({required this.community});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.push('/community/${community.id}'),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              _BookCover(coverUrl: community.bookCoverUrl, size: 56),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      community.name,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      community.bookTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${community.memberCount} membros',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BookCover extends StatelessWidget {
  final String? coverUrl;
  final double size;

  const _BookCover({this.coverUrl, this.size = 72});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (coverUrl != null && coverUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          coverUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _placeholder(theme),
        ),
      );
    }
    return _placeholder(theme);
  }

  Widget _placeholder(ThemeData theme) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: theme.colorScheme.surfaceContainerHighest,
      ),
      child: Icon(
        Icons.menu_book_outlined,
        color: theme.colorScheme.onSurfaceVariant,
      ),
    );
  }
}

class _StatusColors {
  final Color background;
  final Color foreground;
  final Color border;

  const _StatusColors({
    required this.background,
    required this.foreground,
    required this.border,
  });
}

_StatusColors _statusColors(ThemeData theme, ReadingStatus status) {
  switch (status) {
    case ReadingStatus.completed:
      return _StatusColors(
        background: theme.colorScheme.primary,
        foreground: theme.colorScheme.onPrimary,
        border: theme.colorScheme.primary,
      );
    case ReadingStatus.reading:
      return _StatusColors(
        background: theme.colorScheme.tertiary,
        foreground: theme.colorScheme.onTertiary,
        border: theme.colorScheme.tertiary,
      );
    case ReadingStatus.rereading:
      return _StatusColors(
        background: theme.colorScheme.secondary,
        foreground: theme.colorScheme.onSecondary,
        border: theme.colorScheme.secondary,
      );
    case ReadingStatus.abandoned:
      return _StatusColors(
        background: theme.colorScheme.error,
        foreground: theme.colorScheme.onError,
        border: theme.colorScheme.error,
      );
    case ReadingStatus.wantToRead:
      return _StatusColors(
        background: theme.colorScheme.primaryContainer,
        foreground: theme.colorScheme.onPrimaryContainer,
        border: theme.colorScheme.primaryContainer,
      );
  }
}
