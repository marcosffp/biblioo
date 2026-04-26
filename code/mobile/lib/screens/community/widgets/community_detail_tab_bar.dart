import 'package:flutter/material.dart';

class CommunityDetailTabBar extends StatelessWidget
    implements PreferredSizeWidget {
  final TabController controller;

  const CommunityDetailTabBar({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TabBar(
      controller: controller,
      tabs: const [
        Tab(text: 'Visão geral'),
        Tab(text: 'Chat'),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kTextTabBarHeight);
}
