import 'dart:async';

import 'package:biblioo/core/shell/main_shell.dart';
import 'package:biblioo/features/auth/bloc/auth_state.dart';
import 'package:biblioo/features/shelf/domain/shelf_item.dart';
import 'package:biblioo/screens/profile/dna_screen.dart';
import 'package:biblioo/screens/assistant/assistant_screen.dart';
import 'package:biblioo/screens/community/community_list_screen.dart';
import 'package:biblioo/screens/community/community_detail_screen.dart';
import 'package:biblioo/screens/shelf/biblioteca_screen.dart';
import 'package:biblioo/screens/auth/login_screen.dart';
import 'package:biblioo/screens/auth/forgot_password_screen.dart';
import 'package:biblioo/screens/auth/register_screen.dart';
import 'package:biblioo/screens/feed/create_post_screen.dart';
import 'package:biblioo/screens/feed/feed_screen.dart';
import 'package:biblioo/screens/notification/notification_screen.dart';
import 'package:biblioo/features/preferences/bloc/preferences_bloc.dart';
import 'package:biblioo/screens/onboarding/onboarding_screen.dart';
import 'package:biblioo/screens/profile/edit_profile_screen.dart';
import 'package:biblioo/screens/profile/profile_screen.dart';
import 'package:biblioo/screens/profile/settings_screen.dart';
import 'package:biblioo/screens/recommendation/dice_screen.dart';
import 'package:biblioo/screens/recommendation/recommendation_screen.dart';
import 'package:biblioo/screens/book/book_screen.dart';
import 'package:biblioo/screens/search/book_search_screen.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Adapta um [Stream] para um [Listenable] consumível pelo GoRouter.
/// Cada evento do stream dispara uma nova avaliação dos `redirect`s.
class _GoRouterRefreshStream extends ChangeNotifier {
  _GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

String? _authRedirect(BuildContext context, GoRouterState state) {
  final authState = Injector.instance.authBloc.state;
  final isAuthed = authState is AuthAuthenticated;
  final loc = state.matchedLocation;

  final isAuthRoute = loc == '/login' || loc == '/register';
  final isOnboardingRoute = loc == '/onboarding';

  // Não autenticado: só pode ficar nas telas de auth.
  if (!isAuthed) {
    return isAuthRoute ? null : '/login';
  }

  // Autenticado, mas onboarding pendente: prende em /onboarding.
  final onboardingDone = Injector.instance.preferencesRepo.isOnboardingDone();
  if (!onboardingDone) {
    return isOnboardingRoute ? null : '/onboarding';
  }

  // Autenticado e onboarding ok: tira de /login, /register, /onboarding.
  if (isAuthRoute || isOnboardingRoute) return '/feed';

  return null;
}

final appRouter = GoRouter(
  initialLocation: '/login',
  redirect: _authRedirect,
  refreshListenable: _GoRouterRefreshStream(Injector.instance.authBloc.stream),
  routes: [
    // ── AUTH (sem bottom nav) ──────────────────────────────
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => ForgotPasswordScreen(
        initialToken: state.uri.queryParameters['token'],
      ),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),

    // ── ONBOARDING (sem bottom nav, primeira vez do usuário) ────
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => BlocProvider(
        create: (_) => PreferencesBloc(Injector.instance.preferencesRepo),
        child: const OnboardingScreen(),
      ),
    ),

    // ── BUSCA (sem bottom nav) ────────────────────────────
    GoRoute(
      path: '/search',
      builder: (context, state) => const BookSearchScreen(),
    ),

    // ── CRIAR POST (sem bottom nav) ──────────────────────
    GoRoute(
      path: '/post/create',
      builder: (context, state) => const CreatePostScreen(),
    ),

    // ── NOTIFICACOES (sem bottom nav) ───────────────────
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationScreen(),
    ),

    // ── ASSISTENTE (sem bottom nav — acessível via FAB) ─
    GoRoute(
      path: '/assistant',
      builder: (context, state) => const AssistantScreen(),
    ),

    // ── LIVRO (fora do shell, exibido em tela própria) ───
    GoRoute(
      path: '/book/:id',
      pageBuilder: (context, state) {
        final extra = state.extra as Map?;
        return CustomTransitionPage<void>(
          key: state.pageKey,
          child: BookScreen(
            bookId: int.parse(state.pathParameters['id']!),
            shelfId: extra?['shelfId'] as int?,
            shelfItem: extra?['item'] as ShelfItem?,
          ),
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 1),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
        );
      },
    ),

    // ── PERFIL PUBLICO (fora do shell, exibido como janela elevada) ─────
    GoRoute(
      path: '/user/:username',
      pageBuilder: (context, state) => CustomTransitionPage<void>(
        key: state.pageKey,
        child: BlocProvider(
          create: (_) => UserBloc(Injector.instance.userRepo),
          child: ProfileScreen.forUser(state.pathParameters['username']!),
        ),
        transitionsBuilder: (context, animation, secondaryAnimation, child) =>
            SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 1),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
      ),
    ),

    // ── CHAT (desativado por enquanto; rota/tela não disponível) ───
    // GoRoute(
    //   path: '/community/:communityId/chat',
    //   builder: (context, state) => ChatScreen(
    //     communityId: state.pathParameters['communityId']!,
    //   ),
    // ),

    // ── SHELL (com bottom nav) ────────────────────────────
    StatefulShellRoute.indexedStack(
      builder: (context, state, shell) => MainShell(shell: shell),
      branches: [
        // Tab 0 — Feed
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/feed',
              builder: (context, state) => const FeedScreen(),
            ),
          ],
        ),

        // Tab 1 — Para Você (recomendações)
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/recommendation',
              builder: (context, state) => const RecommendationScreen(),
              routes: [
                GoRoute(
                  path: 'dice',
                  builder: (context, state) => const DiceScreen(),
                ),
              ],
            ),
          ],
        ),

        // Tab 2 — Estante
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/shelf',
              builder: (context, state) => const BibliotecaScreen(),
              // Rotas detalhadas da estante desativadas por ora.
              // routes: [
              //   GoRoute(
              //     path: ':shelfId',
              //     builder: (context, state) => ShelfDetailScreen(
              //       shelfId: state.pathParameters['shelfId']!,
              //     ),
              //     routes: [
              //       GoRoute(
              //         path: 'progress/:bookId',
              //         builder: (context, state) => ReadingProgressScreen(
              //           shelfId: state.pathParameters['shelfId']!,
              //           bookId: state.pathParameters['bookId']!,
              //         ),
              //       ),
              //     ],
              //   ),
              // ],
            ),
          ],
        ),

        // Tab 3 — Comunidades
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/community',
              builder: (context, state) => CommunityListScreen(
                focusInvites: state.uri.queryParameters['focus'] == 'invites',
              ),
              routes: [
                GoRoute(
                  path: ':communityId',
                  builder: (context, state) => CommunityDetailScreen(
                    communityId: int.parse(
                      state.pathParameters['communityId']!,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),

        // Tab 4 — Perfil
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen.forMe(),
              routes: [
                GoRoute(
                  path: 'edit',
                  builder: (context, state) => const EditProfileScreen(),
                ),
                GoRoute(
                  path: 'settings',
                  builder: (context, state) => const SettingsScreen(),
                ),
                GoRoute(
                  path: 'dna',
                  builder: (context, state) => const DnaScreen(),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ],
);
