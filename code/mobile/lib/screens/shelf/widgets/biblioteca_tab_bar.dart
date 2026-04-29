import 'package:flutter/material.dart';

class BibliotecaTabBar extends StatelessWidget implements PreferredSizeWidget {
  final TabController controller;

  const BibliotecaTabBar({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TabBar(
      controller: controller,
      tabs: const [
        Tab(text: 'Estante'),
        Tab(text: 'Coleção'),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kTextTabBarHeight);
}
