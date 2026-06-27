/// Modelo público que representa um usuário que está digitando no chat.
/// Exposto para o widget [CommunityChatTab] via import direto.
class TypingUser {
  final int userId;
  final String username;
  final String? avatarUrl;

  const TypingUser({
    required this.userId,
    required this.username,
    required this.avatarUrl,
  });
}
