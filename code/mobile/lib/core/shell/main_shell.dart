import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:biblioo/shared/widgets/bibi_fab.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell shell;
  final Uri currentUri;

  const MainShell({super.key, required this.shell, required this.currentUri});

  @override
  Widget build(BuildContext context) {
    final isCurrentRoute = ModalRoute.of(context)?.isCurrent ?? true;
    final showGlobalBibi =
        isCurrentRoute &&
        !_tabHasPrimaryFab(shell.currentIndex) &&
        !_isCommunityDetail(currentUri);

    return Scaffold(
      body: shell,
      // FAB flutuante do Bibo — acessível de qualquer aba (igual ao web)
      floatingActionButton: showGlobalBibi ? const BibiFab() : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (index) => shell.goBranch(
          index,
          // volta pro topo da tab ao retocá-la (comportamento iOS/Android padrão)
          initialLocation: index == shell.currentIndex,
        ),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Início',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Para Você',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_library_outlined),
            selectedIcon: Icon(Icons.local_library),
            label: 'Bibliooteca',
          ),
          NavigationDestination(
            icon: Icon(Icons.group_outlined),
            selectedIcon: Icon(Icons.group),
            label: 'Comunidades',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  bool _tabHasPrimaryFab(int index) => index == 0 || index == 2;

  bool _isCommunityDetail(Uri uri) {
    final segments = uri.pathSegments;
    if (segments.length < 2) return false;
    if (segments.first != 'community') return false;
    return int.tryParse(segments[1]) != null;
  }
}
