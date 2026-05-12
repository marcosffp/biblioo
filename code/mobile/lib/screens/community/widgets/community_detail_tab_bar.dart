import 'package:flutter/material.dart';

class CommunityDetailTabBar extends StatelessWidget
    implements PreferredSizeWidget {
  final TabController controller;
  final bool showChatTab;
  final bool showVotingTab;

  const CommunityDetailTabBar({
    super.key,
    required this.controller,
    this.showChatTab = true,
    this.showVotingTab = false,
  });

  @override
  Widget build(BuildContext context) {
    return TabBar(
      controller: controller,
      tabs: [
        const Tab(text: 'Visão geral'),
        if (showChatTab) const Tab(text: 'Chat'),
        if (showVotingTab)
          const Tab(text: 'Votações')
        else
          const Tab(child: SizedBox.shrink()),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kTextTabBarHeight);
}
