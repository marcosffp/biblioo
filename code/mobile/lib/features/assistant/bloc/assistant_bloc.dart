import 'dart:async';

import 'package:biblioo/features/assistant/data/assistant_repository.dart';
import 'package:biblioo/features/assistant/domain/chat_message.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'assistant_event.dart';
import 'assistant_state.dart';

int _idCounter = 0;
String _newId() =>
    '${DateTime.now().microsecondsSinceEpoch}_${_idCounter++}';

final _welcomeMessage = ChatMessage(
  id: 'welcome',
  isUser: false,
  content:
      'Olá! Eu sou a Bibi, sua assistente literária 📖✨ Posso recomendar livros, organizar sua estante ou encontrar leituras parecidas com as suas favoritas. Por onde começamos?',
  timestamp: DateTime.fromMillisecondsSinceEpoch(0),
);

class AssistantBloc extends Bloc<AssistantEvent, AssistantState> {
  final AssistantRepository _repository;

  AssistantBloc(this._repository) : super(const AssistantState()) {
    on<AssistantInitialized>(_onInitialized);
    on<AssistantMessageSent>(_onMessageSent);
    on<AssistantHistoryCleared>(_onHistoryCleared);
  }

  void _onInitialized(
    AssistantInitialized event,
    Emitter<AssistantState> emit,
  ) {
    final stored = _repository.loadStored();
    if (stored.messages.isEmpty) {
      emit(state.copyWith(messages: [_welcomeMessage]));
    } else {
      emit(state.copyWith(
        messages: stored.messages,
        conversationId: stored.conversationId,
      ));
    }
  }

  Future<void> _onMessageSent(
    AssistantMessageSent event,
    Emitter<AssistantState> emit,
  ) async {
    final userMsg = ChatMessage(
      id: _newId(),
      isUser: true,
      content: event.text,
      timestamp: DateTime.now(),
    );

    final withUser = [...state.messages, userMsg];
    emit(state.copyWith(messages: withUser, isLoading: true, clearError: true));

    // Best-effort: persist the user message before awaiting the network so a
    // crash mid-request doesn't drop the question.
    unawaited(
      _repository
          .persist(withUser, state.conversationId)
          .catchError((_) {}),
    );

    try {
      final result = await _repository.sendMessage(
        event.text,
        state.conversationId,
      );

      final assistantMsg = ChatMessage(
        id: _newId(),
        isUser: false,
        content: result.reply,
        timestamp: DateTime.now(),
      );

      final withAssistant = [...withUser, assistantMsg];
      emit(state.copyWith(
        messages: withAssistant,
        conversationId: result.conversationId,
        isLoading: false,
      ));

      await _repository.persist(withAssistant, result.conversationId);
    } on Exception catch (e, st) {
      debugPrint('[AssistantBloc] sendMessage error: $e\n$st');

      final isRateLimit =
          e is DioException && e.response?.statusCode == 429;
      final errorMsg = isRateLimit
          ? 'Limite de mensagens atingido. Aguarde um momento e tente novamente.'
          : 'Não consegui processar sua mensagem. Tente novamente.';

      emit(state.copyWith(
        messages: withUser,
        isLoading: false,
        error: errorMsg,
      ));
    }
  }

  Future<void> _onHistoryCleared(
    AssistantHistoryCleared event,
    Emitter<AssistantState> emit,
  ) async {
    await _repository.clearHistory();
    emit(AssistantState(messages: [_welcomeMessage]));
  }
}
