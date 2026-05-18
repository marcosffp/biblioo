import 'package:biblioo/features/assistant/domain/chat_message.dart';
import 'package:equatable/equatable.dart';

class AssistantState extends Equatable {
  final List<ChatMessage> messages;
  final String? conversationId;
  final bool isLoading;
  final String? error;

  const AssistantState({
    this.messages = const [],
    this.conversationId,
    this.isLoading = false,
    this.error,
  });

  AssistantState copyWith({
    List<ChatMessage>? messages,
    String? conversationId,
    bool? isLoading,
    String? error,
    bool clearError = false,
    bool clearConversationId = false,
  }) {
    return AssistantState(
      messages: messages ?? this.messages,
      conversationId:
          clearConversationId ? null : (conversationId ?? this.conversationId),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }

  @override
  List<Object?> get props => [messages, conversationId, isLoading, error];
}
