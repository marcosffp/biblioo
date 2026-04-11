import 'package:biblioo/features/auth/bloc/auth_bloc.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:biblioo/features/user/bloc/user_event.dart';
import 'package:biblioo/features/user/bloc/user_state.dart';
import 'package:biblioo/features/user/domain/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'widgets/profile_dna_section.dart';
import 'widgets/profile_details_section.dart';
import 'widgets/profile_header.dart';
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
  bool _loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loaded) return;
    _loaded = true;
    _reload();
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
        authState.session.user.username == user.username;
  }

  void _shareProfile() {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Compartilhamento em breve')));
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

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                title: Text(isOwner ? 'Meu perfil' : 'Perfil'),
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
                            : () => context.read<UserBloc>().add(
                                FollowUser(user.username),
                              ),
                        onShare: _shareProfile,
                      ),
                      const SizedBox(height: 8),
                      ProfileDetailsSection(user: user, isOwner: isOwner),
                      const SizedBox(height: 20),
                      const ProfileStatsCard(),
                      const SizedBox(height: 20),
                      if (isOwner || !user.restricted)
                        ProfileDnaSection(
                          onSeeMore: () => context.push('/profile/dna'),
                        ),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
