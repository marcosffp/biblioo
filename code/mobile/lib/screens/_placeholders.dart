// ── screens/feed/feed_screen.dart ───────────────────────
import 'package:flutter/material.dart';
class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Feed')),
  );
}

// ── screens/recommendation/recommendation_screen.dart ───
class RecommendationScreen extends StatelessWidget {
  const RecommendationScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Para Você')),
  );
}

// ── screens/recommendation/dice_screen.dart ─────────────
class DiceScreen extends StatelessWidget {
  const DiceScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Jogar o Dado')),
  );
}

// ── screens/shelf/shelf_list_screen.dart ────────────────
class ShelfListScreen extends StatelessWidget {
  const ShelfListScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Estante')),
  );
}

// ── screens/shelf/shelf_detail_screen.dart ──────────────
class ShelfDetailScreen extends StatelessWidget {
  final String shelfId;
  const ShelfDetailScreen({super.key, required this.shelfId});
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: Text('Estante $shelfId')),
  );
}

// ── screens/shelf/reading_progress_screen.dart ──────────
class ReadingProgressScreen extends StatelessWidget {
  final String shelfId;
  final String bookId;
  const ReadingProgressScreen({
    super.key,
    required this.shelfId,
    required this.bookId,
  });
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: Text('Progresso — livro $bookId')),
  );
}

// ── screens/community/community_list_screen.dart ─────────
class CommunityListScreen extends StatelessWidget {
  const CommunityListScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Comunidades')),
  );
}

// ── screens/community/community_detail_screen.dart ───────
class CommunityDetailScreen extends StatelessWidget {
  final String communityId;
  const CommunityDetailScreen({super.key, required this.communityId});
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: Text('Comunidade $communityId')),
  );
}

// ── screens/community/chat_screen.dart ───────────────────
class ChatScreen extends StatelessWidget {
  final String communityId;
  const ChatScreen({super.key, required this.communityId});
  @override
  Widget build(BuildContext context) => Scaffold(
    // full screen — sem bottom nav (rota fora do ShellRoute)
    appBar: AppBar(title: Text('Chat — $communityId')),
    body: const Center(child: Text('Chat')),
  );
}

// ── screens/profile/profile_screen.dart ─────────────────
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Perfil')),
  );
}

// ── screens/profile/edit_profile_screen.dart ────────────
class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('Editar Perfil')),
  );
}

// ── screens/profile/dna_screen.dart ─────────────────────
class DnaScreen extends StatelessWidget {
  const DnaScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    body: Center(child: Text('DNA Literário')),
  );
}
