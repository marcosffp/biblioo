abstract class PreferencesEvent {}

class PreferencesGenresLoadRequested extends PreferencesEvent {}

class PreferencesSubmitted extends PreferencesEvent {
  final int userId;
  final List<String> selectedGenres;
  PreferencesSubmitted(this.userId, this.selectedGenres);
}

class PreferencesSkipped extends PreferencesEvent {
  final int userId;
  PreferencesSkipped(this.userId);
}
