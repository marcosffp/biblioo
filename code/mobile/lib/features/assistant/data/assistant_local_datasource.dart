import 'dart:convert';

import 'package:biblioo/features/assistant/data/models/chat_message_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kMessages = 'assistant.messages';
const _kConversationId = 'assistant.conversationId';

class AssistantLocalDatasource {
  final SharedPreferences _prefs;

  const AssistantLocalDatasource(this._prefs);

  List<ChatMessageModel> loadMessages() {
    final raw = _prefs.getString(_kMessages);
    if (raw == null) return const [];
    try {
      final list = jsonDecode(raw) as List;
      return list
          .map((e) => ChatMessageModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return const [];
    }
  }

  String? loadConversationId() => _prefs.getString(_kConversationId);

  Future<void> save(
    List<ChatMessageModel> messages,
    String? conversationId,
  ) async {
    await _prefs.setString(
      _kMessages,
      jsonEncode(messages.map((m) => m.toJson()).toList()),
    );
    if (conversationId != null) {
      await _prefs.setString(_kConversationId, conversationId);
    } else {
      await _prefs.remove(_kConversationId);
    }
  }

  Future<void> clear() async {
    await _prefs.remove(_kMessages);
    await _prefs.remove(_kConversationId);
  }
}
