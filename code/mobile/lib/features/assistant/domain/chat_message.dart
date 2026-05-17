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

  ChatMessage copyWith({String? content}) {
    return ChatMessage(
      id: id,
      isUser: isUser,
      content: content ?? this.content,
      timestamp: timestamp,
    );
  }
}
