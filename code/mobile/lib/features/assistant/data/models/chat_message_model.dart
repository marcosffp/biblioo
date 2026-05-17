import 'package:biblioo/features/assistant/domain/chat_message.dart';

class ChatMessageModel {
  final String id;
  final bool isUser;
  final String content;
  final String timestamp;

  const ChatMessageModel({
    required this.id,
    required this.isUser,
    required this.content,
    required this.timestamp,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] as String,
      isUser: json['isUser'] as bool,
      content: json['content'] as String,
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'isUser': isUser,
        'content': content,
        'timestamp': timestamp,
      };

  factory ChatMessageModel.fromEntity(ChatMessage msg) {
    return ChatMessageModel(
      id: msg.id,
      isUser: msg.isUser,
      content: msg.content,
      timestamp: msg.timestamp.toIso8601String(),
    );
  }

  ChatMessage toEntity() {
    return ChatMessage(
      id: id,
      isUser: isUser,
      content: content,
      timestamp: DateTime.parse(timestamp),
    );
  }
}
