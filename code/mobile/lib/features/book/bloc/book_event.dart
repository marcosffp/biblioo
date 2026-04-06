abstract class BookEvent {}

/// Dispara busca com debounce. O Bloc ignora queries < 2 chars.
class BookSearchRequested extends BookEvent {
  final String query;
  BookSearchRequested(this.query);
}

/// Limpa resultados e volta ao estado inicial.
class BookSearchCleared extends BookEvent {}
