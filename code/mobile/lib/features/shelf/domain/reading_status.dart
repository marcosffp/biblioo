/// Enum espelhado 1:1 com o backend ReadingStatus.java.
/// Os valores em string (WANT_TO_READ, READING, etc.) são os que trafegam no JSON.
enum ReadingStatus {
  wantToRead,
  reading,
  rereading,
  completed,
  abandoned;

  /// Converte a string vinda do JSON do backend para o enum Dart.
  static ReadingStatus fromJson(String? value) {
    if (value == null) return ReadingStatus.wantToRead;
    switch (value.toUpperCase()) {
      case 'WANT_TO_READ':
        return ReadingStatus.wantToRead;
      case 'READING':
        return ReadingStatus.reading;
      case 'REREADING':
        return ReadingStatus.rereading;
      case 'COMPLETED':
        return ReadingStatus.completed;
      case 'ABANDONED':
        return ReadingStatus.abandoned;
      default:
        return ReadingStatus.wantToRead;
    }
  }

  /// Converte o enum para a string que o backend espera.
  String toJson() {
    switch (this) {
      case ReadingStatus.wantToRead:
        return 'WANT_TO_READ';
      case ReadingStatus.reading:
        return 'READING';
      case ReadingStatus.rereading:
        return 'REREADING';
      case ReadingStatus.completed:
        return 'COMPLETED';
      case ReadingStatus.abandoned:
        return 'ABANDONED';
    }
  }

  /// Label em PT-BR para exibição na UI.
  String get label {
    switch (this) {
      case ReadingStatus.wantToRead:
        return 'Quero ler';
      case ReadingStatus.reading:
        return 'Lendo';
      case ReadingStatus.rereading:
        return 'Relendo';
      case ReadingStatus.completed:
        return 'Concluído';
      case ReadingStatus.abandoned:
        return 'Abandonado';
    }
  }
}
