import 'package:biblioo/features/assistant/data/assistant_local_datasource.dart';
import 'package:biblioo/features/assistant/data/assistant_remote_datasource.dart';
import 'package:biblioo/features/assistant/data/models/chat_message_model.dart';
import 'package:biblioo/features/assistant/domain/chat_message.dart';

class AssistantRepository {
  final AssistantRemoteDatasource _remote;
  final AssistantLocalDatasource _local;

  const AssistantRepository(this._remote, this._local);

  ({List<ChatMessage> messages, String? conversationId}) loadStored() {
    final models = _local.loadMessages();
    return (
      messages: models.map((m) => m.toEntity()).toList(),
      conversationId: _local.loadConversationId(),
    );
  }

  Future<({String reply, String conversationId})> sendMessage(
    String message,
    String? conversationId,
  ) =>
      _remote.sendMessage(message, conversationId);

  Future<void> persist(
    List<ChatMessage> messages,
    String? conversationId,
  ) =>
      _local.save(
        messages.map(ChatMessageModel.fromEntity).toList(),
        conversationId,
      );

  Future<void> clearHistory() => _local.clear();
}
