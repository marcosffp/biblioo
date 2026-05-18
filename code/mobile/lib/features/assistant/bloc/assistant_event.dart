abstract class AssistantEvent {}

class AssistantInitialized extends AssistantEvent {}

class AssistantMessageSent extends AssistantEvent {
  final String text;
  AssistantMessageSent(this.text);
}

class AssistantHistoryCleared extends AssistantEvent {}
