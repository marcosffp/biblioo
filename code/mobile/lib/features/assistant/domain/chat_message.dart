class ChatMessage {
  final String id;
  final bool isUser;
  final String content;
  final DateTime timestamp;

  const ChatMessage({
    required this.id,
    required this.isUser,
    required this.content,
    required this.timestamp,
  });
}
