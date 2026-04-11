import 'package:biblioo/core/shell/main_shell.dart';
import 'package:biblioo/screens/_placeholders.dart'
    show ShelfListScreen, CommunityListScreen, DnaScreen;
import 'package:biblioo/screens/auth/login_screen.dart';
import 'package:biblioo/screens/auth/register_screen.dart';
import 'package:biblioo/screens/feed/feed_screen.dart';
import 'package:biblioo/screens/profile/edit_profile_screen.dart';
import 'package:biblioo/screens/profile/profile_screen.dart';
import 'package:biblioo/screens/profile/settings_screen.dart';
import 'package:biblioo/screens/recommendation/dice_screen.dart';
import 'package:biblioo/screens/recommendation/recommendation_screen.dart';
import 'package:biblioo/screens/search/book_search_screen.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:biblioo/core/di/injector.dart';
import 'package:biblioo/features/user/bloc/user_bloc.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    // ── AUTH (sem bottom nav) ──────────────────────────────
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),

    // ── BUSCA (sem bottom nav) ────────────────────────────
    GoRoute(
      path: '/search',
      builder: (context, state) => const BookSearchScreen(),
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

        // Tab 1 — Para Você
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
              builder: (context, state) => const ShelfListScreen(),
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
              builder: (context, state) => const CommunityListScreen(),
              // Rota de detalhe desativada por ora.
              // routes: [
              //   GoRoute(
              //     path: ':communityId',
              //     builder: (context, state) => CommunityDetailScreen(
              //       communityId: state.pathParameters['communityId']!,
              //     ),
              //   ),
              // ],
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
