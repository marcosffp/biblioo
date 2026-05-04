import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/bloc/user_event.dart';
import 'package:biblioo/features/user/bloc/user_state.dart';
import 'package:biblioo/features/user/data/models/follow_page_model.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:biblioo/utils/cooldown_refresh.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'widgets/profile_dna_section.dart';
import 'widgets/profile_details_section.dart';
import 'widgets/profile_header.dart';
import 'widgets/profile_privacy_notice.dart';
import 'widgets/profile_stats_card.dart';

enum ProfileTarget { me, user }

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

  int _followersCount = 0;
  int _followingCount = 0;
  List<UserSummaryModel> _followers = const [];
  List<UserSummaryModel> _following = const [];
  String? _socialDataForUsername;
  bool _socialLoading = false;

  @override
  void initState() {
    super.initState();
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

        _ensureSocialData(user);

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
                            onShare: _shareProfile,
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
                            const ProfileStatsCard(),
                            const SizedBox(height: 20),
                            ProfileDnaSection(
                              onSeeMore: () => context.push('/profile/dna'),
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
